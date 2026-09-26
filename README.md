# AI learning resource recommender

Consolidated, tested, train/serve-separated version of the project — one
schema, one database, one hybrid recommender, a real UI with clickable real
course links, an offline evaluation script, and a test suite.

`learning_platform.db` in this folder is your **real** database, carried
over as-is — it still has your actual students (Akshay, Alan) and their
logged interactions alongside the 12 demo students. Nothing here overwrites
it; `seed_if_empty()` only seeds when a table is empty.

## Run it

```bash
pip install -r requirements.txt
python train.py        # fits the model once and saves it to model_artifacts/
streamlit run app.py
```

(`app.py` will also auto-train on first launch if you skip the `train.py`
step, but running it explicitly first is what a real deployment does.)

## Files

| File | What it does |
|---|---|
| `database.py` | SQLAlchemy models (Student, Resource, Interaction, RecommendationLog) + two lightweight serving-path lookups (`count_interactions`, `get_seen_resource_ids`). Defaults to SQLite; set `DATABASE_URL` for Postgres. |
| `seed_data.py` | The real 27-resource catalog + demo students/interactions. Never overwrites existing data. |
| `recommender.py` | `ContentBasedRecommender` (TF-IDF), `CollaborativeRecommender` (TruncatedSVD), `HybridRecommender` (blends both). `.train()` fits; `.recommend()` only scores. |
| `train.py` | **Offline batch job.** Fits the model and saves it to `model_artifacts/`. Run manually or on a schedule — never called by the web app itself in a real deployment. |
| `model_registry.py` | **Serving-side loader.** Reads whatever `train.py` last produced. No fitting code lives here. |
| `app.py` | Streamlit UI. Loads the cached, pre-trained model (`st.cache_resource`, keyed on the model filename so a new training run is picked up automatically) and only does cheap scoring per request. |
| `evaluate.py` | Offline leave-one-out evaluation — reports Hit-Rate@K. Run `python evaluate.py`. |
| `check_db.py` | Quick manual inspection: table counts, recent students, recent interactions. Run `python check_db.py`. |
| `tests/` | `pytest` unit tests for the recommender logic and the database layer (13 tests, all isolated from your real DB). Run `pytest tests/`. |

## How the hybrid works

- **Content-based** — TF-IDF over resource text (title + topic + tags +
  description + difficulty + type), matched against the **student's own
  profile text**, with soft score boosts when a resource's difficulty/type
  matches the student's stated preference. Works from a student's very
  first visit — solves cold start.
- **Collaborative** — builds a student × resource matrix from logged
  interactions (explicit ratings if given, otherwise an implicit rating
  inferred from Viewed/Clicked/Liked/Completed), factorized with
  `TruncatedSVD`. Returns `None` for a student with no history in the
  currently trained model, so the hybrid layer falls back to content-only.
- **Hybrid** — collaborative weight grows with the student's logged
  interaction count (`min(0.7, n/10)`), so a brand-new student gets 100%
  content-based and a student with 10+ interactions gets a 30/70 blend.
  Every recommendation shown is logged to `recommendation_log`.

## Training vs. serving

Training (fitting) and serving (scoring) are two separate code paths that
only talk to each other through `model_artifacts/` on disk — see `train.py`
and `model_registry.py` above. The tradeoff: a resource added, or an
interaction logged, won't affect recommendations until the next `train.py`
run. That staleness window is the real cost of separating train/serve —
worth it once refitting per-request gets too slow, not worth it at tiny
scale.

## Current real evaluation result

Running `python evaluate.py` against the live database at time of writing:

- **14 students, 27 resources, 85 interactions**
- **Hit-Rate@5: 0.333** across the 12 students with enough history to
  evaluate (your 2 newest real students, Akshay and Alan, have only 1
  interaction each so far and are correctly excluded — leave-one-out needs
  at least 2 to hold one out)
- Average top-1 content-match score: 0.454

Re-run `python evaluate.py` any time to get a fresh number as more real
interactions accumulate.

## Extending the catalog

The 27 seeded resources are enough to demo the system end to end but thin
for a real product. To grow it, pull from the APIs discussed earlier
(YouTube Data API for video, dev.to API for articles, GitHub search API for
project ideas, Kaggle's course dataset for bulk Coursera/Udemy rows) and
insert them as `Resource` rows with the same schema — nothing else in the
pipeline needs to change.

## Known limitation

The 12 demo students' interactions are randomly generated (see
`seed_data.DEMO_STUDENTS`), so collaborative-filtering results for those
specific accounts can look noisy/off-topic — that's an artifact of random
synthetic data, not a bug in the scoring logic. Your real students
(Akshay, Alan, and whoever signs up next) aren't affected by this.
