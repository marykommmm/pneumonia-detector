import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock

from main import app
from database import get_db, Base
import db_models

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_database.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    test_user = db_models.User(
        id=1, 
        username="student1", 
        email="student@test.com", 
        password_hash="hash", 
        role="student"
    )
    db.add(test_user)
    db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test_database.db"):
        try:
            os.remove("test_database.db")
        except:
            pass

# ==========================================
# ТЕСТИ ДЛЯ РЕЗУЛЬТАТІВ
# ==========================================

def test_save_training_result():
    payload = {
        "image_id": "test_lungs.jpg",
        "student_boxes": [],  # <-- Тепер це справжній порожній список, без лапок
        "ground_truth_boxes": [], # <-- І тут теж
        "score": 95,
        "feedback": "correct_no_pneumonia"
    }
    response = client.post("/api/results/training?user_id=1", json=payload)
    assert response.status_code == 200, f"Помилка валідації: {response.json()}"
    assert response.json()["score"] == 95.0

def test_save_training_user_not_found():
    payload = {
        "image_id": "test.jpg",
        "student_boxes": [],
        "ground_truth_boxes": [],
        "score": 0,
        "feedback": ""
    }
    response = client.post("/api/results/training?user_id=999", json=payload)
    assert response.status_code == 404, f"Помилка валідації: {response.json()}"

def test_get_user_stats():
    payload = {
        "image_id": "test_img.jpg",
        "student_boxes": [], # <-- І тут прибрали лапки
        "ground_truth_boxes": [], # <-- І тут прибрали лапки
        "score": 100,
        "feedback": "perfect"
    }
    res = client.post("/api/results/training?user_id=1", json=payload)
    assert res.status_code == 200, f"Не вдалося зберегти перед перевіркою: {res.json()}"
    
    response = client.get("/api/results/stats/1")
    assert response.status_code == 200
    data = response.json()
    assert data["total_trainings"] >= 1
    assert data["best_score"] == 100.0
    assert data["recent_results"][0]["imageUrl"].endswith("test_img.jpg")

@patch("routes.results.cv2")
@patch("routes.results.get_yolo")
def test_diagnose_with_image(mock_get_yolo, mock_cv2):
    mock_yolo_instance = MagicMock()
    mock_yolo_instance.detect.return_value = {
        'has_pneumonia': False,
        'probability': 0.1,
        'boxes': [],
        'image_size': [1024, 1024]
    }
    mock_get_yolo.return_value = mock_yolo_instance

    mock_cv2.imread.return_value = "fake_image_matrix"
    mock_cv2.imencode.return_value = (True, b"fake_encoded_bytes")

    fake_image_bytes = b"fake_image_data"
    response = client.post(
        "/api/results/diagnosis-with-image?user_id=1",
        files={"file": ("xray.png", fake_image_bytes, "image/png")}
    )
    
    assert response.status_code == 200, f"Помилка: {response.json()}"
    data = response.json()
    assert data["success"] == True
    assert data["has_pneumonia"] == False
    assert data["detections_count"] == 0