from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict
import base64
from sqlalchemy.orm import Session

from utils.database import get_database
from utils.iou_calculator import evaluate_student_answer
from database import get_db
from db_models import TrainingResult

router = APIRouter(prefix="/api/training", tags=["training"])

class StudentAnswer(BaseModel):
    image_id: str
    boxes: List[Dict]
    said_no_pneumonia: bool = False
    user_id: int = None

@router.post("/get-image")
async def get_training_image():
    """Режим Б, крок 1: Видача випадкового знімка студенту"""
    try:
        db = get_database()
        image_data = db.get_random_image()
        
        with open(image_data['image_path'], 'rb') as f:
            image_bytes = f.read()
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        from pathlib import Path
        ext = Path(image_data['image_path']).suffix.lower()
        mime_type = "image/jpeg" if ext in ['.jpg', '.jpeg'] else "image/png"
        
        return {
            "status": "success",
            "image_id": image_data['image_id'],
            "image_base64": f"data:{mime_type};base64,{image_base64}",
            "message": "Розглянь знімок. Де ти бачиш пневмонію? Малюй рамки або натисни 'Немає пневмонії'",
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-answer")
async def check_answer(
    answer: StudentAnswer, 
    db: Session = Depends(get_db)
):
    """Режим Б, крок 2: Перевірка відповіді студента"""
    try:
        annotation_db = get_database()
        ground_truth_boxes = annotation_db.get_ground_truth(answer.image_id)
        
        # Отримуємо результат від калькулятора
        result = evaluate_student_answer(
            student_boxes=answer.boxes,
            ground_truth_boxes=ground_truth_boxes,
            student_said_no_pneumonia=answer.said_no_pneumonia
        )
        
        # БЕЗПЕЧНЕ ОТРИМАННЯ ДАНИХ
        score = result.get('score', 0.0)
        feedback = result.get('feedback', '')
        feedback_code = result.get('feedback_code', '') # <--- ОСЬ ДЕ МИ ЙОГО ДІСТАЄМО
        details = result.get('details', {})
        
        # Зберігаємо результат якщо користувач залогінений
        if answer.user_id:
            training_result = TrainingResult(
                user_id=answer.user_id,
                image_id=answer.image_id,
                student_boxes=answer.boxes,
                ground_truth_boxes=ground_truth_boxes,
                score=score,
                feedback=feedback
            )
            db.add(training_result)
            db.commit()
        
        # ВІДПРАВЛЯЄМО НА ФРОНТЕНД
        return {
            "status": "success",
            "score": score,
            "feedback": feedback,
            "feedback_code": feedback_code, # <--- ТЕПЕР REACT ЙОГО ПОБАЧИТЬ!
            "details": details,
            "ground_truth_boxes": ground_truth_boxes
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Помилка в перевірці: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info")
async def training_info():
    """Інформація про тренажер"""
    try:
        db = get_database()
        images = db.get_all_images()
        
        return {
            "status": "success",
            "total_images": len(images),
            "images": images,
            "message": "Добро пожалувати до тренажера! Натисни 'Почати тест' щоб почати."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))