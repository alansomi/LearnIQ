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
                    preferred_type="Video"
                )
                session.add(placeholder_student)
                session.flush()

        new_interaction = Interaction(
            student_id=interaction.student_id,
            resource_id=interaction.resource_id,
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
def get_recommendations(student_id: str, top_n: int = 5):
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

    return {"recommendations": recs.to_dict(orient="records")}

