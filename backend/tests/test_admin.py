import pytest
import os
import json
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db, Base
import db_models

# Окрема тестова база для адмінки
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_admin_db.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    # 🚀 СУПЕР-ФІКС: Прив'язуємо базу конкретно перед запуском ЦИХ тестів
    app.dependency_overrides[get_db] = override_get_db
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    # 1. Створюємо двох користувачів
    admin = db_models.User(id=1, username="admin", email="admin@test.com", password_hash="hash", role="admin")
    student = db_models.User(id=2, username="student_bob", email="bob@test.com", password_hash="hash", role="student", created_at=datetime.utcnow())
    db.add_all([admin, student])
    db.commit()
    
    # 2. Створюємо результат тренування
    tr = db_models.TrainingResult(
        id=1, user_id=2, image_id="lung1.jpg", 
        student_boxes="[[10, 10, 20, 20]]", 
        ground_truth_boxes="[[10, 10, 20, 20]]",
        score=85.0, feedback="good", created_at=datetime.utcnow(),
        details=json.dumps({"mean_iou": 0.8, "relative_error": 5, "mse_error": 0.01})
    )
    db.add(tr)
    
    # 3. Створюємо запис у датасеті
    ti = db_models.TestImage(id=1, image_name="lung1.jpg", file_path="http://s3/lung1.jpg", boxes="[[10,10,20,20]]")
    db.add(ti)
    
    db.commit()
    db.close()
    
    yield
    
    # Очищаємо після себе, щоб не заважати іншим тестовим файлам
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear() 
    
    if os.path.exists("test_admin_db.db"):
        try:
            os.remove("test_admin_db.db")
        except:
            pass

# ==========================================
# ТЕСТИ ДЛЯ АДМІН-ПАНЕЛІ
# ==========================================

def test_get_dashboard_stats():
    res = client.get("/api/admin/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["totalUsers"] == 1 
    assert data["totalAnalyses"] == 1
    assert data["avgAccuracy"] == 85.0

def test_get_users_list():
    res = client.get("/api/admin/users")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["email"] == "bob@test.com"
    assert data[0]["scans"] == 1
    assert data[0]["score"] == 85.0

def test_get_analyses():
    res = client.get("/api/admin/analyses")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["userName"] == "student_bob"
    assert data[0]["verdict"] == "Пневмонія"

def test_get_recent_analyses():
    res = client.get("/api/admin/analyses/recent")
    assert res.status_code == 200
    assert len(res.json()) == 1

def test_get_metrics_chart():
    res = client.get("/api/admin/metrics/chart")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["iou"] == 80.0  

def test_get_metrics_pie():
    res = client.get("/api/admin/metrics/pie")
    assert res.status_code == 200
    data = res.json()
    assert any(d["name"] == "Пневмонія" and d["value"] == 1 for d in data)

def test_create_user():
    res = client.post("/api/admin/users", json={"name": "new", "email": "new@test.com", "role": "student"})
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_create_user_duplicate():
    client.post("/api/admin/users", json={"name": "new", "email": "new@test.com", "role": "student"})
    res = client.post("/api/admin/users", json={"name": "new2", "email": "new@test.com", "role": "student"})
    assert res.status_code == 500 

def test_update_user():
    res = client.put("/api/admin/users/2", json={"name": "bob_updated", "email": "bob@test.com", "role": "student"})
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_delete_user():
    res = client.delete("/api/admin/users/2")
    assert res.status_code == 200
    res_users = client.get("/api/admin/users")
    assert len(res_users.json()) == 0

def test_get_dataset():
    res = client.get("/api/admin/dataset")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1

def test_upload_dataset_image():
    file_data = b"fake_png_bytes"
    res = client.post(
        "/api/admin/dataset/upload",
        data={"status": "normal"},
        files={"file": ("test_lung.png", file_data, "image/png")}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "success"