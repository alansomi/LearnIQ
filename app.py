import pandas as pd
import streamlit as st

import model_registry
import train as training_job
from database import (
    init_db, get_session, Student, Interaction, RecommendationLog, new_id,
    fetch_resources_df, count_interactions, get_seen_resource_ids,
)
from seed_data import seed_if_empty

st.set_page_config(page_title="AI Learning Resource Recommender", layout="wide")

init_db()
seed_if_empty()

# Bootstrap only: if nobody has ever run `python train.py`, train once so
# the app works out of the box. In a real deployment this line goes away —
# training is a separate scheduled job, never triggered by a web request.
if model_registry.latest_metadata() is None:
    with st.spinner("No trained model found yet — training once to get started..."):
        training_job.train_and_save()


@st.cache_resource(show_spinner=False)
def _load_model_cached(model_file: str):
    # `model_file` is only here to key the cache: it changes every time
    # train.py produces a new artifact, which makes Streamlit reload
    # automatically on the next request — no app restart needed.
    return model_registry.load_latest_model()


def get_current_model():
    meta = model_registry.latest_metadata()
    if meta is None:
        return None, None
    model, _ = _load_model_cached(meta["model_file"])
    return model, meta


@st.cache_resource(show_spinner=False, ttl=30)
def load_resources_for_browsing() -> pd.DataFrame:
    # Only used for the "browse catalog" table at the bottom — kept as a
    # short-TTL live query so newly added resources show up there even
    # before the next retrain, while recommendations themselves still come
    # from the last trained model.
    return fetch_resources_df()


def get_or_create_student(name, skill_level, interest, preferred_type) -> str:
    session = get_session()
    existing = session.query(Student).filter(Student.name == name).first()
    if existing:
        existing.skill_level = skill_level
        existing.interest = interest
        existing.preferred_type = preferred_type
        session.commit()
        sid = existing.id
    else:
        student = Student(id=new_id(), name=name, skill_level=skill_level,
                           interest=interest, preferred_type=preferred_type)
        session.add(student)
        session.commit()
        sid = student.id
    session.close()
    return sid


def log_interaction(student_id, resource_id, interaction_type, rating=None):
    session = get_session()
    session.add(Interaction(student_id=student_id, resource_id=resource_id,
                             interaction_type=interaction_type, rating=rating))
    session.commit()
    session.close()


def log_recommendations(student_id, recs_df):
    session = get_session()
    for _, row in recs_df.iterrows():
        session.add(RecommendationLog(student_id=student_id, resource_id=row["id"],
                                       score=float(row["score"]), reason=row["reason"]))
    session.commit()
    session.close()


st.title("AI learning resource recommender")
st.caption(
    "Hybrid demo: content-based profile matching (TF-IDF over your stated goal) "
    "blended with collaborative filtering (matrix factorization over interaction history)."
)

model, model_meta = get_current_model()

with st.sidebar:
    st.header("Your profile")
    name = st.text_input("Name")
    skill_level = st.selectbox("Skill level", ["Beginner", "Intermediate", "Advanced"])
    interest = st.text_area(
        "What do you want to learn? (goal / interest)",
        placeholder="e.g. I want to learn machine learning and build my first model",
        height=100,
    )
    preferred_type = st.selectbox("Preferred learning type", ["Video", "Article", "Tutorial", "Project"])
    top_n = st.slider("Number of recommendations", 3, 10, 5)
    submitted = st.button("Get recommendations", type="primary")

    st.divider()
    with st.expander("Model status (admin)"):
        if model_meta:
            st.caption(
                f"Trained {model_meta['trained_at']} UTC · "
                f"{model_meta['n_resources']} resources · "
                f"{model_meta['n_interactions']} interactions · "
                f"fit in {model_meta['train_seconds']}s"
            )
        st.caption(
            "In production this button doesn't exist — retraining runs as a "
            "scheduled job. It's here so you can see train/serve are decoupled."
        )
        if st.button("Retrain model now"):
            with st.spinner("Retraining..."):
                training_job.train_and_save()
            st.cache_resource.clear()
            st.rerun()

if submitted:
    if not name.strip() or not interest.strip():
        st.warning("Please enter your name and what you'd like to learn.")
    else:
        student_id = get_or_create_student(name.strip(), skill_level, interest.strip(), preferred_type)
        st.session_state["student_id"] = student_id
        st.session_state["student"] = {
            "id": student_id, "name": name.strip(), "skill_level": skill_level,
            "interest": interest.strip(), "preferred_type": preferred_type,
        }

if "student_id" in st.session_state:
    student = st.session_state["student"]

    # Serving path: two cheap, indexed DB lookups — no dataframe of the
    # whole interactions table, no re-fitting anything.
    n_interactions = count_interactions(student["id"])
    seen_ids = get_seen_resource_ids(student["id"])

    recs = model.recommend(student, top_n=top_n, n_interactions=n_interactions, seen_ids=seen_ids)
    if not recs.empty:
        log_recommendations(student["id"], recs)

    st.subheader(f"Recommended for {student['name']}")
    if not recs.empty:
        st.caption(f"{recs.iloc[0]['reason']}  ·  based on {n_interactions} logged interaction(s)")

    for _, row in recs.iterrows():
        with st.container(border=True):
            col1, col2 = st.columns([4, 1])
            with col1:
                st.markdown(f"**{row['title']}**")
                st.caption(f"{row['type']} · {row['difficulty']} · {row['topic']} · via {row['source']}")
                st.write(row["description"])
                st.markdown(f"[Open resource ↗]({row['url']})")
            with col2:
                st.metric("Match", f"{int(row['score'] * 100)}%")
                st.write(f"Rating: {row['rating']:.1f}/5")

            b1, b2, b3 = st.columns(3)
            if b1.button("Mark viewed", key=f"view_{row['id']}"):
                log_interaction(student["id"], row["id"], "Viewed")
                st.toast("Logged.")
            if b2.button("Like", key=f"like_{row['id']}"):
                log_interaction(student["id"], row["id"], "Liked")
                st.toast("Logged — this shapes future recommendations.")
            if b3.button("Mark completed", key=f"done_{row['id']}"):
                log_interaction(student["id"], row["id"], "Completed")
                st.toast("Nice work — logged as completed.")

    if recs.empty:
        st.info("No unseen resources left to recommend — try increasing the count above.")
else:
    st.info("Fill in your profile in the sidebar and click **Get recommendations** to get started.")

with st.expander("Browse full resource catalog"):
    browse_df = load_resources_for_browsing()
    st.dataframe(
        browse_df[["title", "topic", "type", "difficulty", "rating", "url"]],
        width="stretch", hide_index=True,
    )
