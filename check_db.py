"""
Quick manual inspection of the database — table counts, most recent
students, and most recent interactions. Handy for sanity-checking that the
app is actually writing what you think it's writing, without opening a
SQLite browser.

Run:
    python check_db.py
"""
from database import get_session, Student, Resource, Interaction, RecommendationLog

session = get_session()
try:
    print("--- Table Counts ---")
    print(f"Students: {session.query(Student).count()}")
    print(f"Resources: {session.query(Resource).count()}")
    print(f"Interactions: {session.query(Interaction).count()}")
    print(f"Recommendation Logs: {session.query(RecommendationLog).count()}")

    print("\n--- Recent Students ---")
    for s in session.query(Student).order_by(Student.created_at.desc()).limit(5):
        print(f"[{s.id}] {s.name} ({s.skill_level}) - Interest: {s.interest[:40]}...")

    print("\n--- Recent Interactions ---")
    # Note: Rating is None for implicit interactions (Viewed/Clicked/Liked/
    # Completed without an explicit star rating) — that's expected, not
    # missing data. recommender.effective_rating() converts it to a 1-5
    # signal internally based on interaction_type when rating is None.
    for i in session.query(Interaction).order_by(Interaction.id.desc()).limit(5):
        print(f"Student ID: {i.student_id} | Resource ID: {i.resource_id} | "
              f"Type: {i.interaction_type} | Rating: {i.rating}")
finally:
    session.close()
