"""
Serving-side model loading.

This module knows nothing about TF-IDF, SVD, or the database — it just
reads model_artifacts/latest.json and loads the pickled model it points to.
app.py depends on THIS, never on recommender.py's fitting classes directly.
"""
import json
from pathlib import Path
from typing import Optional

import joblib

ARTIFACTS_DIR = Path("model_artifacts")


def latest_metadata() -> Optional[dict]:
    meta_path = ARTIFACTS_DIR / "latest.json"
    if not meta_path.exists():
        return None
    return json.loads(meta_path.read_text())


def load_latest_model():
    """Returns (model, metadata). Raises a clear error if train.py hasn't run yet."""
    metadata = latest_metadata()
    if metadata is None:
        raise RuntimeError(
            "No trained model found in model_artifacts/. Run `python train.py` first."
        )
    model_path = ARTIFACTS_DIR / metadata["model_file"]
    model = joblib.load(model_path)
    return model, metadata
