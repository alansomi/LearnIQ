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

app = FastAPI(title="AI Learning Platform API")

# Add CORS so the frontend website can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
    return {"status": "online", "message": "Welcome to the AI Learning Platform API"}

@app.get("/resources")
def get_resources(limit: int = 50):
    session = get_session()
    resources = session.query(Resource).limit(limit).all()
    session.close()
    return resources

@app.post("/students")
def create_or_update_student(student_data: StudentCreate):
    session = get_session()
    existing = session.query(Student).filter(Student.name == student_data.name).first()
    if existing:
        existing.skill_level = student_data.skill_level
        existing.interest = student_data.interest
        existing.preferred_type = student_data.preferred_type
        session.commit()
        sid = existing.id
    else:
        # Create dict explicitly instead of .dict() for newer pydantic
        student = Student(id=new_id(), name=student_data.name, 
                          skill_level=student_data.skill_level,
                          interest=student_data.interest, 
                          preferred_type=student_data.preferred_type)
        session.add(student)
        session.commit()
        sid = student.id
    session.close()
    return {"student_id": sid, "message": "Profile saved."}

@app.post("/interactions")
def log_interaction(interaction: InteractionCreate):
    session = get_session()
    new_interaction = Interaction(
        student_id=interaction.student_id,
        resource_id=interaction.resource_id,
        interaction_type=interaction.interaction_type,
        rating=interaction.rating
    )
    session.add(new_interaction)
    session.commit()
    session.close()
    return {"status": "success"}

@app.get("/recommendations/{student_id}")
def get_recommendations(student_id: str, top_n: int = 5):
    session = get_session()
    student = session.query(Student).filter(Student.id == student_id).first()
    if not student:
        session.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_dict = {
        "id": student.id,
        "interest": student.interest,
        "skill_level": student.skill_level,
        "preferred_type": student.preferred_type
    }
    session.close()

    model = get_model()
    n_interactions = count_interactions(student_id)
    seen_ids = get_seen_resource_ids(student_id)

    recs = model.recommend(student_dict, top_n=top_n, n_interactions=n_interactions, seen_ids=seen_ids)
    
    if recs.empty:
        return {"recommendations": []}

    # Log the recommendations
    session = get_session()
    for _, row in recs.iterrows():
        session.add(RecommendationLog(
            student_id=student_id, resource_id=row["id"],
            score=float(row["score"]), reason=row["reason"]
        ))
    session.commit()
    session.close()

    return {"recommendations": recs.to_dict(orient="records")}
