"""
Unit tests for database.py — specifically the two lightweight serving-path
lookups (count_interactions, get_seen_resource_ids) that app.py relies on
instead of loading the full interactions table per request.

Each test gets its own temp SQLite file so tests never touch your real
learning_platform.db.
"""
import importlib
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def db_module(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")

    import database
    importlib.reload(database)  # re-bind engine/session to the temp DB above
    database.init_db()
    yield database


def test_count_and_seen_ids_start_empty(db_module):
    session = db_module.get_session()
    session.add(db_module.Student(id="stu1", name="Test", skill_level="Beginner",
                                   interest="learn python", preferred_type="Video"))
    session.commit()
    session.close()

    assert db_module.count_interactions("stu1") == 0
    assert db_module.get_seen_resource_ids("stu1") == set()


def test_count_and_seen_ids_reflect_logged_interactions(db_module):
    session = db_module.get_session()
    session.add(db_module.Resource(id="R1", title="t", topic="Python", type="Video",
                                    difficulty="Beginner", tags="", description="",
                                    url="https://example.com", source="", rating=4.0))
    session.add(db_module.Student(id="stu1", name="Test", skill_level="Beginner",
                                   interest="learn python", preferred_type="Video"))
    session.add(db_module.Interaction(student_id="stu1", resource_id="R1", interaction_type="Liked"))
    session.commit()
    session.close()

    assert db_module.count_interactions("stu1") == 1
    assert db_module.get_seen_resource_ids("stu1") == {"R1"}


def test_seen_ids_are_deduplicated_across_repeated_interactions(db_module):
    session = db_module.get_session()
    session.add(db_module.Resource(id="R1", title="t", topic="Python", type="Video",
                                    difficulty="Beginner", tags="", description="",
                                    url="https://example.com", source="", rating=4.0))
    session.add(db_module.Student(id="stu1", name="Test", skill_level="Beginner",
                                   interest="learn python", preferred_type="Video"))
    session.add(db_module.Interaction(student_id="stu1", resource_id="R1", interaction_type="Viewed"))
    session.add(db_module.Interaction(student_id="stu1", resource_id="R1", interaction_type="Liked"))
    session.commit()
    session.close()

    assert db_module.count_interactions("stu1") == 2         # two logged events
    assert db_module.get_seen_resource_ids("stu1") == {"R1"}  # but one distinct resource
