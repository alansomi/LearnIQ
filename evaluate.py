"""
Offline evaluation for the hybrid recommender.

Methodology: leave-one-out evaluation — the standard first evaluation to
run on a recommender before you have real production usage logs.

For every student with at least 2 interactions:
  1. Hold out ONE of their interactions at random.
  2. Retrain the hybrid model on every OTHER interaction in the system
     (so the collaborative model still has full data from everyone else —
     only this one student's held-out signal is hidden).
  3. Ask the model for that student's top-K recommendations.
  4. Check whether the held-out resource shows up in that top-K list.

Hit-Rate@K = the fraction of students for whom it did.

This is a coarse proxy, worth stating plainly in a report: it evaluates
against historical interactions, not against live recommendations actually
shown at the time. A live system would pair this with online metrics
(click-through, completion on recommendations actually shown). But it's a
legitimate, standard way to get a number before you have that live data.

Run:
    python evaluate.py
"""
import random

import pandas as pd

from database import init_db, get_session, Student, fetch_resources_df, fetch_interactions_df
from seed_data import seed_if_empty
from recommender import HybridRecommender

TOP_K = 5
RANDOM_SEED = 42
MIN_INTERACTIONS_TO_EVALUATE = 2


def pick_holdouts(interactions_df: pd.DataFrame) -> pd.DataFrame:
    """One random held-out interaction per eligible student."""
    random.seed(RANDOM_SEED)
    holdout_row_ids = []
    for _, group in interactions_df.groupby("student_id"):
        if len(group) < MIN_INTERACTIONS_TO_EVALUATE:
            continue
        holdout_row_ids.append(random.choice(group.index.tolist()))
    return interactions_df.loc[holdout_row_ids]


def load_student_profiles(student_ids) -> dict:
    session = get_session()
    rows = session.query(Student).filter(Student.id.in_(student_ids)).all()
    session.close()
    return {
        r.id: {"id": r.id, "interest": r.interest, "skill_level": r.skill_level,
               "preferred_type": r.preferred_type}
        for r in rows
    }


def evaluate(top_k: int = TOP_K) -> dict:
    resources_df = fetch_resources_df()
    interactions_df = fetch_interactions_df()

    if interactions_df.empty:
        raise RuntimeError("No interactions in the database to evaluate against.")

    holdouts = pick_holdouts(interactions_df)
    if holdouts.empty:
        raise RuntimeError(
            f"No student has {MIN_INTERACTIONS_TO_EVALUATE}+ interactions yet — nothing to evaluate."
        )

    train_df = interactions_df.drop(index=holdouts.index)
    model = HybridRecommender.train(resources_df, train_df)

    profiles = load_student_profiles(holdouts["student_id"].unique())

    hits = 0
    top1_scores = []
    per_student_rows = []

    for _, holdout in holdouts.iterrows():
        student_id = holdout["student_id"]
        held_out_resource = holdout["resource_id"]

        remaining = train_df[train_df["student_id"] == student_id]
        seen_ids = set(remaining["resource_id"])
        n_interactions = len(remaining)

        student = profiles[student_id]
        recs = model.recommend(
            student, top_n=top_k, n_interactions=n_interactions,
            seen_ids=seen_ids, exclude_seen=True,
        )

        hit = held_out_resource in recs["id"].values
        hits += int(hit)
        if not recs.empty:
            top1_scores.append(recs.iloc[0]["score"])

        per_student_rows.append({
            "student_id": student_id, "held_out_resource": held_out_resource,
            "hit": hit, "n_interactions_used": n_interactions,
        })

    n_evaluated = len(holdouts)
    results = {
        "students_evaluated": n_evaluated,
        "k": top_k,
        "hit_rate_at_k": round(hits / n_evaluated, 3),
        "avg_top1_match_score": round(sum(top1_scores) / len(top1_scores), 3) if top1_scores else 0.0,
        "per_student": pd.DataFrame(per_student_rows),
    }
    return results


if __name__ == "__main__":
    init_db()
    seed_if_empty()

    results = evaluate()
    print(f"Evaluated {results['students_evaluated']} students")
    print(f"Hit-Rate@{results['k']}: {results['hit_rate_at_k']}")
    print(f"Average top-1 content-match score: {results['avg_top1_match_score']}")
    print("\nPer-student detail:")
    print(results["per_student"].to_string(index=False))
