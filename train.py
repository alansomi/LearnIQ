"""
Offline training job.

Run this whenever the resource catalog or interaction data has changed
enough to be worth re-fitting — manually, on a cron, or as a scheduled task
in whatever job runner you use. The serving app (app.py) NEVER calls the
fitting code directly; it only ever loads whatever this script last wrote
to model_artifacts/.

    python train.py

Each run:
  1. Pulls the full resources + interactions tables from the DB.
  2. Fits a fresh HybridRecommender (TF-IDF vocab + TruncatedSVD factors).
  3. Saves it as model_artifacts/hybrid_model_<timestamp>.joblib.
  4. Updates model_artifacts/latest.json to point at it (with stats the
     serving app can display, so you always know how fresh a model is).
  5. Keeps the last few versions around and deletes older ones.
"""
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import joblib

from database import fetch_resources_df, fetch_interactions_df
from recommender import HybridRecommender

ARTIFACTS_DIR = Path("model_artifacts")
KEEP_LAST_N_VERSIONS = 3


def train_and_save() -> dict:
    ARTIFACTS_DIR.mkdir(exist_ok=True)

    resources_df = fetch_resources_df()
    interactions_df = fetch_interactions_df()

    if resources_df.empty:
        raise RuntimeError("No resources in the database yet — seed it before training.")

    t0 = time.time()
    model = HybridRecommender.train(resources_df, interactions_df)
    train_seconds = round(time.time() - t0, 2)

    # Microsecond precision (not just seconds) so two training runs close
    # together always get distinct filenames — that distinct filename is
    # what the serving app's cache key relies on to detect a new model.
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    model_filename = f"hybrid_model_{timestamp}.joblib"
    joblib.dump(model, ARTIFACTS_DIR / model_filename)

    metadata = {
        "trained_at": timestamp,
        "model_file": model_filename,
        "n_resources": int(len(resources_df)),
        "n_interactions": int(len(interactions_df)),
        "n_students_with_interactions": int(interactions_df["student_id"].nunique()) if not interactions_df.empty else 0,
        "train_seconds": train_seconds,
    }
    (ARTIFACTS_DIR / "latest.json").write_text(json.dumps(metadata, indent=2))

    _cleanup_old_versions()
    return metadata


def _cleanup_old_versions():
    versions = sorted(
        ARTIFACTS_DIR.glob("hybrid_model_*.joblib"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    for stale in versions[KEEP_LAST_N_VERSIONS:]:
        stale.unlink()


if __name__ == "__main__":
    from database import init_db
    from seed_data import seed_if_empty

    init_db()
    seed_if_empty()  # no-op if the DB already has data — never overwrites real students

    meta = train_and_save()
    print(
        f"Trained on {meta['n_resources']} resources and {meta['n_interactions']} "
        f"interactions ({meta['n_students_with_interactions']} students) "
        f"in {meta['train_seconds']}s -> model_artifacts/{meta['model_file']}"
    )
