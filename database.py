"""
Database layer for the AI Learning Resource Recommender.

Uses SQLAlchemy so the exact same models work with SQLite (default,
zero-setup, good for a prototype/demo) or Postgres (set the DATABASE_URL
env var, e.g. postgresql://user:pass@host/dbname) without touching any
other file in the project.
"""
import os
import uuid
from datetime import datetime, timezone

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, String, Float, Integer, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///learning_platform.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def new_id() -> str:
    return uuid.uuid4().hex[:12]


class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=new_id)
    name = Column(String, nullable=False)
    skill_level = Column(String, nullable=False)       # Beginner / Intermediate / Advanced
    interest = Column(Text, nullable=False)             # free-text goal / interest statement
    preferred_type = Column(String, nullable=False)     # Video / Article / Tutorial / Project
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    interactions = relationship("Interaction", back_populates="student")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    type = Column(String, nullable=False)               # Video / Article / Tutorial / Project
    difficulty = Column(String, nullable=False)          # Beginner / Intermediate / Advanced
    tags = Column(Text, default="")
    description = Column(Text, default="")
    url = Column(String, nullable=False)                 # real, clickable course/resource link
    source = Column(String, default="")
    rating = Column(Float, default=0.0)

    interactions = relationship("Interaction", back_populates="resource")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    rating = Column(Integer, nullable=True)               # explicit 1-5, optional
    interaction_type = Column(String, default="Viewed")   # Viewed / Clicked / Liked / Completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="interactions")
    resource = relationship("Resource", back_populates="interactions")


class RecommendationLog(Base):
    """Every recommendation ever shown, for later evaluation/retraining."""
    __tablename__ = "recommendation_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    score = Column(Float)
    reason = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(engine)


def get_session():
    return SessionLocal()


# ---------------------------------------------------------------------------
# Bulk loaders — used by train.py (the offline batch job). These pull the
# *entire* tables into pandas because training needs the full picture.
# ---------------------------------------------------------------------------

def fetch_resources_df() -> pd.DataFrame:
    session = get_session()
    rows = session.query(Resource).all()
    df = pd.DataFrame([{
        "id": r.id, "title": r.title, "topic": r.topic, "type": r.type,
        "difficulty": r.difficulty, "tags": r.tags, "description": r.description,
        "url": r.url, "source": r.source, "rating": r.rating,
    } for r in rows])
    session.close()
    return df


def fetch_interactions_df() -> pd.DataFrame:
    session = get_session()
    rows = session.query(Interaction).all()
    df = pd.DataFrame([{
        "student_id": i.student_id, "resource_id": i.resource_id,
        "rating": i.rating, "interaction_type": i.interaction_type,
    } for i in rows])
    session.close()
    return df


# ---------------------------------------------------------------------------
# Narrow, indexed lookups — used by app.py (the serving path) so that
# answering one recommendation request never requires loading the whole
# interactions table, only the couple of numbers/sets it actually needs.
# ---------------------------------------------------------------------------

def count_interactions(student_id: str) -> int:
    session = get_session()
    count = session.query(Interaction).filter(Interaction.student_id == student_id).count()
    session.close()
    return count


def get_seen_resource_ids(student_id: str) -> set:
    session = get_session()
    rows = session.query(Interaction.resource_id).filter(
        Interaction.student_id == student_id
    ).distinct().all()
    session.close()
    return {r[0] for r in rows}
