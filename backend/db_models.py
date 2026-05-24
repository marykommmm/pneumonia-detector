from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="student")  # Додано поле ролі (за замовчуванням "student")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Відносини
    training_results = relationship("TrainingResult", back_populates="user")
    diagnosis_results = relationship("DiagnosisResult", back_populates="user")
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,  # Додано роль у словник для віддачі на фронтенд
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class TrainingResult(Base):
    __tablename__ = "training_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_id = Column(String, index=True)
    student_boxes = Column(JSON)  # Рамки студента
    ground_truth_boxes = Column(JSON)  # Правильні рамки
    score = Column(Float)  # 0-100
    feedback = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    difficulty = Column(String, default="medium")
    session_mode = Column(String, default="practice")
    details = Column(JSON, nullable=True) # Тут будуть зберігатися Rel та MSE
    
    # Відносини
    user = relationship("User", back_populates="training_results")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_id": self.image_id,
            "score": self.score,
            "feedback": self.feedback,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class DiagnosisResult(Base):
    __tablename__ = "diagnosis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    detected_boxes = Column(JSON)  # Виявлені рамки
    image_size = Column(JSON)  # Розмір зображення
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Відносини
    user = relationship("User", back_populates="diagnosis_results")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "detected_boxes": self.detected_boxes,
            "image_size": self.image_size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class TestImage(Base):
    __tablename__ = "test_images"
    
    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String, unique=True, index=True)
    file_path = Column(String)
    boxes = Column(JSON)  # Координати областей запалення
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "image_name": self.image_name,
            "boxes": self.boxes,
        }