from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db
from db_models import User, TrainingResult, DiagnosisResult
import json
from pydantic import BaseModel
from passlib.context import CryptContext
from db_models import TestImage
from fastapi import File, Form, UploadFile
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Налаштування для хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Схема для валідації вхідних даних
class AdminUserSchema(BaseModel):
    name: str
    email: str
    role: str


# ==========================================
# 1. ЗАГАЛЬНА СТАТИСТИКА (KPI)
# ==========================================
@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.role != "admin").count()
    total_trainings = db.query(TrainingResult).count()
    total_diagnoses = db.query(DiagnosisResult).count()
    total_analyses = total_trainings + total_diagnoses
    
    avg_score_query = db.query(func.avg(TrainingResult.score)).scalar()
    avg_accuracy = round(avg_score_query, 1) if avg_score_query else 0.0
    
    return {
        "totalUsers": total_users,
        "totalAnalyses": total_analyses,
        "avgAccuracy": avg_accuracy,
        "activeSessions": 1,
        "storageUsed": 2.5 
    }

# ==========================================
# 2. СПИСОК КОРИСТУВАЧІВ
# ==========================================
@router.get("/users")
def get_users_list(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role != "admin").order_by(desc(User.created_at)).all()
    result = []
    
    for user in users:
        user_trainings = db.query(TrainingResult).filter(TrainingResult.user_id == user.id).all()
        scans = len(user_trainings)
        
        avg_score = 0
        if scans > 0:
            avg_score = round(sum(t.score for t in user_trainings) / scans, 1)
            
        result.append({
            "id": user.id,
            "name": user.username,
            "email": user.email,
            "role": "Студент" if user.role == "student" else "Лікар",
            # ВІДДАЄМО ЧИСТИЙ UTC ФОРМАТ ЗАМІСТЬ ТЕКСТУ
            "reg_date": user.created_at.isoformat() + "Z" if user.created_at else "-",
            "scans": scans,
            "score": avg_score,
            "status": "Активний"
        })
        
    return result

# ==========================================
# 3. АНАЛІЗИ (ВСІ ТА ОСТАННІ)
# ==========================================
def format_analysis(t, u):
    iou = "-"
    rel = "-"
    mse = "-"
    
    if t.details:
        try:
            det = json.loads(t.details) if isinstance(t.details, str) else t.details
            if "mean_iou" in det: iou = round(det["mean_iou"], 2)
            if "relative_error" in det: rel = f"{det['relative_error']}%"
            if "mse_error" in det: mse = round(det["mse_error"], 4)
        except:
            pass

    is_sick = True
    if not t.ground_truth_boxes: is_sick = False
    elif isinstance(t.ground_truth_boxes, str) and t.ground_truth_boxes in ["[]", ""]: is_sick = False
    elif isinstance(t.ground_truth_boxes, list) and len(t.ground_truth_boxes) == 0: is_sick = False

    verdict = "Пневмонія" if is_sick else "Норма"
    mode_val = t.session_mode if hasattr(t, "session_mode") and t.session_mode else "practice"
    diff_val = t.difficulty if hasattr(t, "difficulty") and t.difficulty else "medium"

    # Безпечний парсинг рамок
    def parse_boxes(b_data):
        if not b_data: return []
        if isinstance(b_data, list): return b_data
        try: return json.loads(b_data)
        except: return []

    return {
        "id": t.id,
        "date": t.created_at.isoformat() + "Z" if t.created_at else "-",
        "userName": u.username if u else "Без імені",
        "userEmail": u.email if u else "-",
        "verdict": verdict,
        "prob": round(t.score, 1) if t.score else 0,
        "iou": iou,
        "rel": rel,
        "mse": mse,
        "mode": mode_val,
        "difficulty": diff_val,
        "image_id": t.image_id,
        "student_boxes": parse_boxes(t.student_boxes),
        "ground_truth_boxes": parse_boxes(t.ground_truth_boxes)
    }

@router.get("/analyses")
def get_all_analyses(db: Session = Depends(get_db)):
    results = db.query(TrainingResult, User).outerjoin(User, TrainingResult.user_id == User.id).order_by(desc(TrainingResult.created_at)).all()
    return [format_analysis(t, u) for t, u in results]

@router.get("/analyses/recent")
def get_recent_analyses(db: Session = Depends(get_db)):
    # Беремо трохи більше з бази, щоб якщо це іспит, він згрупувався, і ми мали що показати
    results = db.query(TrainingResult, User).outerjoin(User, TrainingResult.user_id == User.id).order_by(desc(TrainingResult.created_at)).limit(30).all()
    return [format_analysis(t, u) for t, u in results]

# ==========================================
# 4. ДИНАМІКА ТОЧНОСТІ (ГРАФІК)
# ==========================================
@router.get("/metrics/chart")
def get_metrics_chart(db: Session = Depends(get_db)):
    results = db.query(TrainingResult).order_by(TrainingResult.created_at).all()
    daily_data = {}
    
    for r in results:
        if not r.created_at: continue
        date_str = r.created_at.strftime("%d.%m") 
        
        iou = 0
        if r.details:
            try:
                det = json.loads(r.details) if isinstance(r.details, str) else r.details
                if "mean_iou" in det: iou = det["mean_iou"] * 100
            except:
                pass
                
        if date_str not in daily_data:
            daily_data[date_str] = {"sum_iou": 0, "count": 0}
            
        daily_data[date_str]["sum_iou"] += iou
        daily_data[date_str]["count"] += 1
        
    chart = []
    for date_str, data in daily_data.items():
        chart.append({
            "name": date_str,
            "iou": round(data["sum_iou"] / data["count"], 1) if data["count"] > 0 else 0
        })
        
    return chart[-10:] if chart else []

# ==========================================
# 5. РОЗПОДІЛ ДІАГНОЗІВ (КРУГОВА ДІАГРАМА)
# ==========================================
@router.get("/metrics/pie")
def get_metrics_pie(db: Session = Depends(get_db)):
    results = db.query(TrainingResult).all()
    
    pneumo_count = 0
    normal_count = 0
    
    for t in results:
        is_sick = True
        if not t.ground_truth_boxes: is_sick = False
        elif isinstance(t.ground_truth_boxes, str) and t.ground_truth_boxes in ["[]", ""]: is_sick = False
        elif isinstance(t.ground_truth_boxes, list) and len(t.ground_truth_boxes) == 0: is_sick = False
        
        if is_sick:
            pneumo_count += 1
        else:
            normal_count += 1
            
    if pneumo_count == 0 and normal_count == 0:
        return []
        
    return [
        {"name": "Пневмонія", "value": pneumo_count},
        {"name": "Норма", "value": normal_count}
    ]

# ==========================================
# 6. ВИДАЛЕННЯ КОРИСТУВАЧА
# ==========================================
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
        
    db.query(TrainingResult).filter(TrainingResult.user_id == user_id).delete()
    db.query(DiagnosisResult).filter(DiagnosisResult.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    
    return {"status": "success", "message": "Користувача видалено"}

# ==========================================
# ДОДАВАННЯ КОРИСТУВАЧА (АДМІНОМ)
# ==========================================
@router.post("/users")
def create_user(user_data: AdminUserSchema, db: Session = Depends(get_db)):
    try:
        # Перевіряємо, чи немає вже такого email
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")
            
        # Створюємо користувача
        new_user = User(
            username=user_data.name,
            email=user_data.email,
            role=user_data.role,
            password_hash=pwd_context.hash("123456")  # <--- ОСЬ ПРАВИЛЬНА НАЗВА КОЛОНКИ
        )
        db.add(new_user)
        db.commit()
        return {"status": "success", "message": "Користувача створено"}
    
    except Exception as e:
        db.rollback() # Відкочуємо транзакцію при помилці
        print(f"КРИТИЧНА ПОМИЛКА СТВОРЕННЯ КОРИСТУВАЧА: {str(e)}")
        # Повертаємо реальну помилку на фронтенд!
        raise HTTPException(status_code=500, detail=f"Помилка БД: {str(e)}")

# ==========================================
# РЕДАГУВАННЯ КОРИСТУВАЧА
# ==========================================
@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: AdminUserSchema, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")
            
        # Оновлюємо дані
        user.username = user_data.name
        user.email = user_data.email
        user.role = user_data.role
        db.commit()
        
        return {"status": "success", "message": "Дані оновлено"}
        
    except Exception as e:
        db.rollback()
        print(f"КРИТИЧНА ПОМИЛКА РЕДАГУВАННЯ: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Помилка БД: {str(e)}")
    
# ==========================================
# 7. ДАТАСЕТ (ЕТАЛОННІ ЗНІМКИ)
# ==========================================
@router.get("/dataset")
def get_dataset(db: Session = Depends(get_db)):
    # Дістаємо всі знімки з бази, найновіші зверху
    images = db.query(TestImage).order_by(TestImage.id.desc()).all()
    return [img.to_dict() for img in images]

# ==========================================
# 8. ЗАВАНТАЖЕННЯ НОВОГО ЗНІМКА В ДАТАСЕТ
# ==========================================
@router.post("/dataset/upload")
async def upload_dataset_image(
    file: UploadFile = File(...),
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        # 1. Автоматична генерація координат залежно від статусу
        # Якщо норма - порожній список. Якщо пневмонія - тестова рамка по центру
        boxes_data = "[]" if status == "normal" else "[[100, 100, 250, 250]]"
        
        # 2. Тут у майбутньому буде код відправки файлу на AWS S3
        # Наразі ми просто зберігаємо запис у базу даних для MVP
        s3_base_url = os.getenv("AWS_S3_BASE_URL")
        new_image = TestImage(
            image_name=file.filename,
            file_path=f"{s3_base_url}/{file.filename}",
            boxes=boxes_data
        )
        
        db.add(new_image)
        db.commit()
        
        return {"status": "success", "message": "Зображення успішно додано до датасету"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Помилка завантаження: {str(e)}")