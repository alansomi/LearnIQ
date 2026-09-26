"""
Unit tests for recommender.py.

These deliberately do NOT touch the database — they build tiny synthetic
resources/interactions DataFrames by hand, so a failure here points at the
recommendation logic itself, not at seed data or SQLite.

Run:
    pytest tests/
"""
import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from recommender import ContentBasedRecommender, CollaborativeRecommender, HybridRecommender


@pytest.fixture
def resources_df():
    return pd.DataFrame([
        dict(id="A", title="Python Basics", topic="Python", type="Video", difficulty="Beginner",
             tags="python basics variables loops", description="Intro to python programming.",
             url="https://example.com/a", source="Test", rating=4.5),
        dict(id="B", title="Deep Learning", topic="Deep Learning", type="Tutorial", difficulty="Advanced",
             tags="deep learning neural networks pytorch", description="Neural network fundamentals.",
             url="https://example.com/b", source="Test", rating=4.7),
        dict(id="C", title="SQL Basics", topic="SQL", type="Article", difficulty="Beginner",
             tags="sql database queries joins", description="Learn SQL from scratch.",
             url="https://example.com/c", source="Test", rating=4.2),
    ])


@pytest.fixture
def interactions_df():
    return pd.DataFrame([
        dict(student_id="s1", resource_id="A", rating=5, interaction_type="Completed"),
        dict(student_id="s1", resource_id="B", rating=2, interaction_type="Viewed"),
        dict(student_id="s2", resource_id="B", rating=5, interaction_type="Completed"),
        dict(student_id="s2", resource_id="C", rating=4, interaction_type="Liked"),
    ])


def test_content_based_matches_topic(resources_df):
    model = ContentBasedRecommender(resources_df)
    scores = model.score_profile("I want to learn python basics", skill_level="Beginner", preferred_type="Video")
    assert scores.idxmax() == "A"


def test_content_based_preferred_type_boosts_score(resources_df):
    model = ContentBasedRecommender(resources_df)
    boosted = model.score_profile("python", preferred_type="Video")
    unboosted = model.score_profile("python")
    assert boosted["A"] >= unboosted["A"]


def test_collaborative_cold_start_returns_none(resources_df, interactions_df):
    model = CollaborativeRecommender(interactions_df, resources_df["id"])
    assert model.score_student("student_never_seen_before") is None


def test_collaborative_known_student_returns_full_score_vector(resources_df, interactions_df):
    model = CollaborativeRecommender(interactions_df, resources_df["id"])
    scores = model.score_student("s1")
    assert scores is not None
    assert set(scores.index) == set(resources_df["id"])


def test_collaborative_empty_interactions_never_crashes(resources_df):
    empty = pd.DataFrame(columns=["student_id", "resource_id", "rating", "interaction_type"])
    model = CollaborativeRecommender(empty, resources_df["id"])
    assert model.score_student("anyone") is None


def test_hybrid_cold_start_falls_back_to_content_only(resources_df, interactions_df):
    model = HybridRecommender.train(resources_df, interactions_df)
    student = {"id": "brand_new", "interest": "I want to learn sql",
               "skill_level": "Beginner", "preferred_type": "Article"}
    recs = model.recommend(student, top_n=3, n_interactions=0, seen_ids=set())
    assert not recs.empty
    assert recs.iloc[0]["reason"].startswith("content match")
    assert recs.iloc[0]["id"] == "C"


def test_hybrid_existing_student_blends_in_collaborative_signal(resources_df, interactions_df):
    model = HybridRecommender.train(resources_df, interactions_df)
    student = {"id": "s1", "interest": "I want to learn python basics",
               "skill_level": "Beginner", "preferred_type": "Video"}
    recs = model.recommend(student, top_n=3, n_interactions=2, seen_ids=set())
    assert not recs.empty
    assert "hybrid" in recs.iloc[0]["reason"]


def test_hybrid_excludes_already_seen_resources(resources_df, interactions_df):
    model = HybridRecommender.train(resources_df, interactions_df)
    student = {"id": "s1", "interest": "I want to learn python basics",
               "skill_level": "Beginner", "preferred_type": "Video"}
    recs = model.recommend(student, top_n=3, n_interactions=2, seen_ids={"A", "B"}, exclude_seen=True)
    assert set(recs["id"]) == {"C"}


def test_hybrid_can_be_pickled_and_reloaded(resources_df, interactions_df, tmp_path):
    """This is the exact operation train.py performs — if a model can't survive
    a pickle round-trip, the train/serve split doesn't actually work."""
    import joblib
    model = HybridRecommender.train(resources_df, interactions_df)
    path = tmp_path / "model.joblib"
    joblib.dump(model, path)
    reloaded = joblib.load(path)

    student = {"id": "brand_new", "interest": "I want to learn python",
               "skill_level": "Beginner", "preferred_type": "Video"}
    recs = reloaded.recommend(student, top_n=1, n_interactions=0, seen_ids=set())
    assert not recs.empty


def test_all_resource_urls_are_well_formed(resources_df):
    assert (resources_df["url"].str.startswith("http")).all()
