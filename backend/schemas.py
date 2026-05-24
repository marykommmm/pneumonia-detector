from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BoxCoordinates(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: Optional[float] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TrainingResultCreate(BaseModel):
    image_id: str
    student_boxes: List[BoxCoordinates]
    ground_truth_boxes: List[BoxCoordinates]
    score: float
    feedback: str

class TrainingResultResponse(BaseModel):
    id: int
    user_id: int
    image_id: str
    score: float
    feedback: str
    created_at: datetime

    class Config:
        from_attributes = True

class DiagnosisResultCreate(BaseModel):
    detected_boxes: List[BoxCoordinates]
    image_size: tuple

class DiagnosisResultResponse(BaseModel):
    id: int
    user_id: int
    detected_boxes: List[BoxCoordinates]
    image_size: tuple
    created_at: datetime

    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    total_trainings: int
    average_score: float
    best_score: float
    recent_results: List[TrainingResultResponse]