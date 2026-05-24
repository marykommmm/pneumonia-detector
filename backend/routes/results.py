from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from db_models import TrainingResult, DiagnosisResult, User
from schemas import TrainingResultCreate, TrainingResultResponse, DiagnosisResultCreate, DiagnosisResultResponse, UserStatsResponse
from models.yolo_handler import get_yolo

import os
import tempfile
import shutil
import base64
import io
import cv2  # ← ДОДАНО ІМПОРТ OPENCV ДЛЯ МАЛЮВАННЯ РАМОК
from dotenv import load_dotenv

# Завантажуємо змінні з .env у систему ДО того, як їх читати
load_dotenv()

router = APIRouter(prefix="/api/results", tags=["results"])

# Беремо змінну
AWS_S3_BASE_URL = os.getenv("AWS_S3_BASE_URL")

# "Захисний" код: якщо змінної немає — програма зупиниться і скаже тобі, в чому проблема
if not AWS_S3_BASE_URL:
    raise ValueError("Помилка: AWS_S3_BASE_URL не знайдено у файлі .env!")

@router.post("/training", response_model=TrainingResultResponse)
def save_training_result(
    user_id: int,
    result_data: TrainingResultCreate,
    db: Session = Depends(get_db)
):
    """Зберегти результат тренування"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувач не знайдений")
    
    new_result = TrainingResult(
        user_id=user_id,
        image_id=result_data.image_id,
        student_boxes=result_data.student_boxes,
        ground_truth_boxes=result_data.ground_truth_boxes,
        score=result_data.score,
        feedback=result_data.feedback
    )
    
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    return new_result

@router.post("/diagnosis", response_model=DiagnosisResultResponse)
def save_diagnosis_result(
    user_id: int,
    result_data: DiagnosisResultCreate,
    db: Session = Depends(get_db)
):
    """Зберегти результат діагностики"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувач не знайдений")
    
    new_result = DiagnosisResult(
        user_id=user_id,
        detected_boxes=result_data.detected_boxes,
        image_size=result_data.image_size
    )
    
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    return new_result

# 🛠 ЗМІНЕНО: Прибрано жорсткий response_model, щоб динамічно додати поле imageUrl
@router.get("/training/{user_id}")
def get_training_results(user_id: int, db: Session = Depends(get_db)):
    """Отримати всі результати тренування користувача з генерацією посилань на знімки"""
    results = db.query(TrainingResult).filter(
        TrainingResult.user_id == user_id
    ).order_by(TrainingResult.created_at.desc()).all()
    
    formatted_results = []
    for res in results:
        # Перетворюємо об'єкт SQLAlchemy в звичайний словник Python
        res_dict = {c.name: getattr(res, c.name) for c in res.__table__.columns}
        
        # 🚀 ГОЛОВНИЙ ФІКС: Конструюємо повне посилання на S3 для React
        if res_dict.get("image_id"):
            # Відрізаємо зайві слеші з обох сторін і ставимо один рівно по центру
            base = AWS_S3_BASE_URL.rstrip('/')
            img_path = res_dict['image_id'].lstrip('/')
            
            res_dict["imageUrl"] = f"{base}/{img_path}"
            res_dict["image_url"] = f"{base}/{img_path}"  # на випадок різного регістру у фронті
            
        formatted_results.append(res_dict)
        
    return formatted_results

@router.get("/stats/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Отримати статистику користувача та історію з посиланнями на фото"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувач не знайдений")
    
    total_trainings = db.query(func.count(TrainingResult.id)).filter(
        TrainingResult.user_id == user_id
    ).scalar() or 0
    
    avg_score = db.query(func.avg(TrainingResult.score)).filter(
        TrainingResult.user_id == user_id
    ).scalar() or 0
    
    best_score = db.query(func.max(TrainingResult.score)).filter(
        TrainingResult.user_id == user_id
    ).scalar() or 0
    
    recent = db.query(TrainingResult).filter(
        TrainingResult.user_id == user_id
    ).order_by(TrainingResult.created_at.desc()).limit(50).all()
    
    formatted_recent = []
    for res in recent:
        res_dict = {c.name: getattr(res, c.name) for c in res.__table__.columns}
        
        # 🚀 ФІКС ДЛЯ ТАБЛИЦІ СТАТИСТИКИ: Додаємо посилання на фотографії у масив recent_results
        if res_dict.get("image_id"):
            base = AWS_S3_BASE_URL.rstrip('/')
            img_path = res_dict['image_id'].lstrip('/')
            
            res_dict["imageUrl"] = f"{base}/{img_path}"
            res_dict["image_url"] = f"{base}/{img_path}"
            
        formatted_recent.append(res_dict)
    
    return {
        "total_trainings": total_trainings,
        "average_score": round(float(avg_score), 1) if avg_score else 0,
        "best_score": round(float(best_score), 1) if best_score else 0,
        "recent_results": formatted_recent
    }
    
@router.post("/diagnosis-with-image")
async def diagnose_with_image(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Діагностика пневмонії з завантаженням образу (Двостадійна YOLO)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувач не знайдений")
    
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
            
        yolo_handler = get_yolo()
        result = yolo_handler.detect(temp_file_path)
        
        if result['has_pneumonia'] and result['boxes']:
            cv_boxes = []
            cv_scores = []
            for b in result['boxes']:
                x1, y1 = int(b['x1']), int(b['y1'])
                w, h = int(b['x2'] - b['x1']), int(b['y2'] - b['y1'])
                cv_boxes.append([x1, y1, w, h])
                cv_scores.append(float(b['confidence']))
                
            indices = cv2.dnn.NMSBoxes(cv_boxes, cv_scores, score_threshold=0.1, nms_threshold=0.2)
            
            temp_boxes = []
            if len(indices) > 0:
                for i in indices.flatten():
                    temp_boxes.append(result['boxes'][i])
                    
            # 🚀 СУПЕР-ФІКС: Видаляємо менші рамки, які "залізли" у більші
            final_boxes = []
            for i, boxA in enumerate(temp_boxes):
                is_inside = False
                areaA = (boxA['x2'] - boxA['x1']) * (boxA['y2'] - boxA['y1'])
                
                for j, boxB in enumerate(temp_boxes):
                    if i == j: continue
                    areaB = (boxB['x2'] - boxB['x1']) * (boxB['y2'] - boxB['y1'])
                    
                    # Рахуємо площу перетину двох рамок
                    ix1 = max(boxA['x1'], boxB['x1'])
                    iy1 = max(boxA['y1'], boxB['y1'])
                    ix2 = min(boxA['x2'], boxB['x2'])
                    iy2 = min(boxA['y2'], boxB['y2'])
                    
                    if ix1 < ix2 and iy1 < iy2:
                        inter_area = (ix2 - ix1) * (iy2 - iy1)
                        # Якщо рамка A перекрита рамкою B більше ніж на 50%, І при цьому B більша за A
                        if inter_area / areaA > 0.5 and areaB > areaA:
                            is_inside = True
                            break
                            
                if not is_inside:
                    final_boxes.append(boxA)
                    
            result['boxes'] = final_boxes

        img = cv2.imread(temp_file_path)
        
        # МАЛЮЄМО РАМКИ ТІЛЬКИ ЯКЩО Є ПНЕВМОНІЯ
        if result['has_pneumonia'] and result['boxes']:
            for box in result['boxes']:
                x1, y1 = int(box['x1']), int(box['y1'])
                x2, y2 = int(box['x2']), int(box['y2'])
                # Колір (0, 0, 255) - це класичний червоний
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)
                
                
        _, buffer = cv2.imencode('.png', img)
        b64_string = base64.b64encode(buffer).decode("utf-8")
        base64_img = f"data:image/png;base64,{b64_string}"
        
        os.remove(temp_file_path)
        temp_file_path = None
        
        new_result = DiagnosisResult(
            user_id=user_id,
            detected_boxes=str(result['boxes']),  
            image_size=f"{result['image_size'][0]}x{result['image_size'][1]}"
        )
        
        db.add(new_result)
        db.commit()
        db.refresh(new_result)
        
        return {
            'success': True,
            'has_pneumonia': result['has_pneumonia'],
            'probability': result['probability'],
            'detections_count': len(result['boxes']),
            'boxes': result['boxes'], 
            'result_image_base64': base64_img,
            'diagnosis_id': new_result.id
        }
    
    except Exception as e:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        print("ПОМИЛКА БЕКЕНДУ:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diagnosis/{diagnosis_id}")
def get_diagnosis_result(diagnosis_id: int, db: Session = Depends(get_db)):
    """Отримати результат діагностики"""
    result = db.query(DiagnosisResult).filter(
        DiagnosisResult.id == diagnosis_id
    ).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Результат не знайдений")
    
    return {
        'id': result.id,
        'user_id': result.user_id,
        'detected_boxes': result.detected_boxes,
        'image_size': result.image_size,
        'created_at': result.created_at
    }