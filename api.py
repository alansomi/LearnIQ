import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import model_registry
from database import get_session, Student, Interaction, Resource, new_id, count_interactions, get_seen_resource_ids, RecommendationLog
from dotenv import load_dotenv

# Load env variables before doing anything else
load_dotenv()

app = FastAPI(title="LearnIQ AI Recommendation Platform API")

# Add CORS so the frontend website can reliably communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for JSON Requests/Responses ---
class StudentCreate(BaseModel):
    name: str
    skill_level: str
    interest: str
    preferred_type: str

class InteractionCreate(BaseModel):
    student_id: str
    resource_id: str
    interaction_type: str
    rating: Optional[int] = None

# --- Global Model Cache ---
_loaded_model = None
_loaded_model_meta = None

def get_model():
    global _loaded_model, _loaded_model_meta
    meta = model_registry.latest_metadata()
    if meta is None:
        raise HTTPException(status_code=503, detail="No trained model found.")
    
    # If a new model was trained on disk, hot-reload it
    if _loaded_model_meta is None or _loaded_model_meta["model_file"] != meta["model_file"]:
        _loaded_model, _ = model_registry.load_latest_model()
        _loaded_model_meta = meta
        
    return _loaded_model

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to the LearnIQ AI Learning Platform API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "LearnIQ API"}

@app.get("/resources")
def get_resources(limit: int = 50):
    session = get_session()
    try:
        resources = session.query(Resource).limit(limit).all()
        return resources
    finally:
        session.close()

@app.post("/students")
def create_or_update_student(student_data: StudentCreate):
    session = get_session()
    try:
        existing = session.query(Student).filter(Student.name == student_data.name).first()
        if existing:
            existing.skill_level = student_data.skill_level
            existing.interest = student_data.interest
            existing.preferred_type = student_data.preferred_type
            session.commit()
            sid = existing.id
        else:
            student = Student(
                id=new_id(),
                name=student_data.name,
                skill_level=student_data.skill_level,
                interest=student_data.interest,
                preferred_type=student_data.preferred_type
            )
            session.add(student)
            session.commit()
            sid = student.id
        return {"student_id": sid, "message": "Profile saved."}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.post("/interactions")
def log_interaction(interaction: InteractionCreate):
    session = get_session()
    try:
        # Guarantee student exists to prevent Foreign Key constraint violation
        student = session.query(Student).filter(Student.id == interaction.student_id).first()
        if not student:
            # Check by name in case username was passed
            student_by_name = session.query(Student).filter(Student.name == interaction.student_id).first()
            if student_by_name:
                interaction.student_id = student_by_name.id
            else:
                placeholder_student = Student(
                    id=interaction.student_id,
                    name=f"Learner_{interaction.student_id[:8]}",
                    skill_level="Beginner",
                    interest="General Technology",
                    preferred_type="Course"
                )
                session.add(placeholder_student)
                session.flush()

        # Clean resource ID (strip 'cloud-' prefix if passed from frontend)
        clean_rid = interaction.resource_id.replace("cloud-", "")
        resource = session.query(Resource).filter(Resource.id == clean_rid).first()
        if not resource:
            resource = session.query(Resource).filter(Resource.id == interaction.resource_id).first()
        
        if not resource:
            return {"status": "skipped", "message": "Resource not found in catalog, interaction skipped."}

        new_interaction = Interaction(
            student_id=interaction.student_id,
            resource_id=resource.id,
            interaction_type=interaction.interaction_type,
            rating=interaction.rating
        )
        session.add(new_interaction)
        session.commit()
        return {"status": "success"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.get("/recommendations/{student_id}")
def get_recommendations(student_id: str, top_n: int = 6):
    session = get_session()
    try:
        student = session.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = session.query(Student).filter(Student.name == student_id).first()
            if not student:
                raise HTTPException(status_code=404, detail="Student not found")

        student_dict = {
            "id": student.id,
            "interest": student.interest,
            "skill_level": student.skill_level,
            "preferred_type": student.preferred_type
        }
        resolved_sid = student.id
    finally:
        session.close()

    model = get_model()
    n_interactions = count_interactions(resolved_sid)
    seen_ids = get_seen_resource_ids(resolved_sid)

    recs = model.recommend(student_dict, top_n=top_n, n_interactions=n_interactions, seen_ids=seen_ids)
    
    if recs.empty:
        return {"recommendations": []}

    # Log the recommendations safely
    session = get_session()
    try:
        for _, row in recs.iterrows():
            session.add(RecommendationLog(
                student_id=resolved_sid, resource_id=row["id"],
                score=float(row["score"]), reason=row["reason"]
            ))
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

    # Format recommendations for frontend consumption
    formatted = []
    for _, row in recs.iterrows():
        raw_score = float(row.get("score", 0.85))
        # Consumer friendly match percentage (e.g. 78% - 98%)
        relevance_pct = min(99, max(72, int(raw_score * 100) if raw_score <= 1.0 else int(raw_score)))
        
        # Plain-English non-math reason
        raw_reason = str(row.get("reason", ""))
        if "similar learners" in raw_reason:
            clean_reason = "Recommended by similar learners on your path"
        elif "profile match" in raw_reason or "content match" in raw_reason:
            clean_reason = f"Matches your interest in {row.get('topic', 'this subject')}"
        else:
            clean_reason = f"Calibrated for your {student_dict.get('skill_level', 'learning')} level"

        tags_val = row.get("tags", "")
        tags_list = [t.strip() for t in tags_val.split() if t.strip()] if isinstance(tags_val, str) else tags_val

        formatted.append({
            "id": row["id"],
            "title": row["title"],
            "topic": row.get("topic", "Technology"),
            "type": row.get("type", "Course"),
            "difficulty": row.get("difficulty", "Beginner"),
            "tags": tags_list,
            "description": row.get("description", ""),
            "url": row.get("url", ""),
            "source": row.get("source", "LearnIQ Catalog"),
            "provider": row.get("source", "LearnIQ Catalog"),
            "rating": float(row.get("rating", 4.5)),
            "relevanceScore": relevance_pct,
            "whyRecommended": clean_reason
        })

    return {"recommendations": formatted}

