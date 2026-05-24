import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db, Base
import db_models 

# 🚀 СУПЕР-ФІКС: Унікальна назва бази тільки для тестів авторизації
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth_db.db"

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
    # Прив'язуємо базу конкретно перед запуском ЦИХ тестів
    app.dependency_overrides[get_db] = override_get_db
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    
    # Очищаємо після себе
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()
    
    if os.path.exists("test_auth_db.db"):
        try:
            os.remove("test_auth_db.db")
        except:
            pass

# ==========================================
# ТЕСТИ АВТОРИЗАЦІЇ
# ==========================================

def test_register_user():
    # Використовуємо унікальний email, щоб ніколи не було конфліктів
    response = client.post(
        "/api/auth/register",
        json={"username": "unique_user1", "email": "unique1@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "unique1@example.com"

def test_register_existing_user():
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser2", "email": "test@example.com", "password": "newpassword"}
    )
    assert response.status_code == 400

def test_login_success():
    client.post(
        "/api/auth/register",
        json={"username": "loginuser", "email": "login@example.com", "password": "mypassword"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200

def test_login_wrong_password():
    client.post(
        "/api/auth/register",
        json={"username": "wrong_login", "email": "wrong@example.com", "password": "mypassword"}
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "badpassword"}
    )
    assert response.status_code == 401

def test_get_current_user():
    reg_response = client.post(
        "/api/auth/register",
        json={"username": "me_user", "email": "me@example.com", "password": "mypassword"}
    )
    user_id = reg_response.json()["id"]

    response = client.get(f"/api/auth/me/{user_id}")
    assert response.status_code == 200