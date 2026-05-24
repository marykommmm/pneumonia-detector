from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional
# Додаємо бібліотеки Google
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from database import get_db
from db_models import User
from schemas import UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ТВІЙ CLIENT ID з Google Console (краще винести в .env)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Перевірка (можна видалити після того, як переконаєшся, що працює)
if GOOGLE_CLIENT_ID:
    print(f"Успішно завантажено ID: {GOOGLE_CLIENT_ID}")
else:
    print("Попередження: GOOGLE_CLIENT_ID не знайдено у файлі .env")

# --- СХЕМИ ДЛЯ НОВИХ ФУНКЦІЙ ---
class GoogleAuthRequest(BaseModel):
    token: str

class ProfileUpdate(BaseModel):
    user_id: int
    username: str
    email: EmailStr

class PasswordChange(BaseModel):
    user_id: int
    current_password: str
    new_password: str

# --- ДОПОМІЖНІ ФУНКЦІЇ ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- ЕНДПОІНТИ ---

# НОВИЙ ЕНДПОІНТ: АВТОРИЗАЦІЯ ЧЕРЕЗ GOOGLE
@router.post("/google", response_model=UserResponse)
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Вхід або реєстрація через Google"""
    try:
        # 1. Перевіряємо токен через сервери Google
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        # 2. Шукаємо користувача в базі
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Якщо користувача немає — реєструємо автоматично
            user_count = db.query(User).count()
            assigned_role = "admin" if user_count == 0 else "student"
            
            # Для Google-юзерів пароль не потрібен, ставимо заглушку або випадковий рядок
            user = User(
                username=name,
                email=email,
                password_hash=get_password_hash("google_oauth_secret_123"), 
                role=assigned_role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user

    except ValueError:
        # Якщо токен підроблений або прострочений
        raise HTTPException(status_code=400, detail="Недійсний токен Google")

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Реєстрація нового користувача"""
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Цей email або ім'я вже зареєстровано")
    
    hashed_pwd = get_password_hash(user_data.password)
    
    user_count = db.query(User).count()
    assigned_role = "admin" if user_count == 0 else "student"
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_pwd,
        role=assigned_role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=UserResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Вхід користувача"""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Невірний email або пароль"
        )
    return user

# ОНОВЛЕННЯ ПРОФІЛЮ
@router.put("/update-profile", response_model=UserResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    email_check = db.query(User).filter(User.email == data.email, User.id != data.user_id).first()
    if email_check:
        raise HTTPException(status_code=400, detail="Цей Email вже використовується")

    user.username = data.username
    user.email = data.email
    
    db.commit()
    db.refresh(user)
    return user

# 2. ЗМІНА ПАРОЛЯ
@router.post("/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Перевірка старого пароля
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Невірний поточний пароль")
    
    # Хешування та збереження нового
    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Пароль успішно змінено"}

# 3. ВИДАЛЕННЯ АКАУНТА
@router.delete("/delete-account/{user_id}")
def delete_account(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    db.delete(user)
    db.commit()
    return {"message": "Акаунт видалено назавжди"}

@router.get("/me/{user_id}", response_model=UserResponse)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувач не знайдений")
    return user

@router.get("/all-users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()