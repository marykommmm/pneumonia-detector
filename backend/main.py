import json
import os
import tempfile
import traceback
import random  # Додано для перемішування іспиту
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

# Імпорти твого проекту
from db_models import User, TrainingResult, DiagnosisResult
from database import init_db, get_db
from models.yolo_handler import init_yolo, get_yolo
from utils.database import init_database
from routes.auth import router as auth_router
from routes.results import router as results_router
from routes.admin import router as admin_router
import os

app = FastAPI(title="Pneumonia Detector API")

# ==========================================
# 1. КОНФІГУРАЦІЯ
# ==========================================
from dotenv import load_dotenv

# Завантажуємо змінні з .env у систему ДО того, як їх читати
load_dotenv()

# Беремо змінну
AWS_S3_BASE_URL = os.getenv("AWS_S3_BASE_URL")

# "Захисний" код: якщо змінної немає — програма зупиниться і скаже тобі, в чому проблема
if not AWS_S3_BASE_URL:
    raise ValueError("Помилка: AWS_S3_BASE_URL не знайдено у файлі .env!")
ANNOTATIONS_FILE = "annotations_final.json"
pneumo_dataset = {}

origins = [
    "http://localhost:5173", # Для локальної розробки
    "https://pneumonia-detector-rouge.vercel.appcd" # ЗАМІНИ НА РЕАЛЬНЕ ПОСИЛАННЯ З VERCEL!
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Або конкретно ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(results_router)
app.include_router(admin_router)

# ==========================================
# 2. ПОДІЇ СТАРТУ ТА МОДЕЛІ YOLO
# ==========================================

@app.on_event("startup")
async def startup_event():
    # 🚀 КРИТИЧНИЙ ФІКС: Оголошуємо global, щоб завантажити дані для всього бекенду
    global pneumo_dataset
    try:
        init_db()
        
        # Ініціалізуємо структуру реляційної бази даних
        init_database(annotations_file=ANNOTATIONS_FILE, images_dir=".")
        
        # Зчитуємо файл анотацій JSON у пам'ять додатка
        if os.path.exists(ANNOTATIONS_FILE):
            with open(ANNOTATIONS_FILE, "r", encoding="utf-8") as f:
                pneumo_dataset = json.load(f)
            print(f"Успішно завантажено {len(pneumo_dataset)} знімків з анотацій!")
        else:
            print(f"Помилка: Файл {ANNOTATIONS_FILE} не знайдено в папці проекту!")
        
       # Шлях до єдиної моделі
        MODEL_PATH = "multi_task_best.pt"
        
        if os.path.exists(MODEL_PATH):
            init_yolo(MODEL_PATH) 
            print("Модель YOLO успішно ініціалізовано!")
        else:
            print("Увага: Не знайдено файл моделі!")
    except Exception as e:
        print("Помилка під час старту сервера:")
        traceback.print_exc()

# ==========================================
# 3. МАТЕМАТИКА ТА МОДЕЛІ ДЛЯ ПЕРЕВІРКИ СТУДЕНТА
# ==========================================

class Box(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class AnswerRequest(BaseModel):
    image_id: str
    boxes: List[Box]
    said_no_pneumonia: bool
    user_id: Optional[int] = None
    difficulty: Optional[str] = "medium"
    session_mode: Optional[str] = "practice"

def calculate_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0: return 0
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    return interArea / float(boxAArea + boxBArea - interArea)

# ==========================================
# 4. ЕНДПОІНТИ ДАТАСЕТУ ДЛЯ ТРЕНАЖЕРА
# ==========================================

@app.get("/api/dataset/training")
async def get_training_images():
    # Повертає список знімків для практики (де split == 'train')
    train_items = [
        {"id": k, "url": f"{AWS_S3_BASE_URL}{k}", "difficulty": v["difficulty"], "boxes": v["boxes"]} 
        for k, v in pneumo_dataset.items() if v.get("split") == "train"
    ]
    
    # 🚀 РЕЗЕРВ: Якщо раптом міток 'train' немає — віддаємо будь-які знімки, щоб не було порожньо
    if not train_items:
        train_items = [
            {"id": k, "url": f"{AWS_S3_BASE_URL}{k}", "difficulty": v.get("difficulty", "medium"), "boxes": v.get("boxes", [])} 
            for k, v in pneumo_dataset.items()
        ]
    return train_items

@app.get("/api/dataset/exam")
def get_exam_dataset():
    # 1. Пробуємо знайти знімки суто для іспиту
    exam_items = [
        {"id": k, "url": f"{AWS_S3_BASE_URL}{k}", "difficulty": v.get("difficulty", "medium"), "boxes": v.get("boxes", [])} 
        for k, v in pneumo_dataset.items() if v.get("split") == "exam"
    ]
    
    # 2. Якщо спец-знімків для іспиту не знайдено, беремо валідаційні
    if not exam_items:
        print("⚠️ Знімків зі split=='exam' не знайдено. Беремо резервні знімки з split=='val'...")
        exam_items = [
            {"id": k, "url": f"{AWS_S3_BASE_URL}{k}", "difficulty": v.get("difficulty", "medium"), "boxes": v.get("boxes", [])} 
            for k, v in pneumo_dataset.items() if v.get("split") == "val"
        ]
        
    # 3. Страховка на випадок, якщо і 'val' немає — беремо просто перші ліпші знімки
    if not exam_items:
        print("⚠️ Валідаційних знімків теж немає. Беремо будь-які доступні знімки...")
        exam_items = [
            {"id": k, "url": f"{AWS_S3_BASE_URL}{k}", "difficulty": v.get("difficulty", "medium"), "boxes": v.get("boxes", [])} 
            for k, v in pneumo_dataset.items()
        ]

    if not exam_items:
        return []

    # Перемішуємо, щоб кожна спроба іспиту була унікальною
    random.shuffle(exam_items)
    
    # Повертаємо максимум 15 штук, як вимагає фронтенд
    return exam_items[:15]

@app.post("/api/dataset/check-answer")
async def check_answer(request: AnswerRequest, db: Session = Depends(get_db)):
    if request.image_id not in pneumo_dataset:
        raise HTTPException(status_code=404, detail="Знімок не знайдено")
        
    gt_boxes = pneumo_dataset[request.image_id]["boxes"]
    user_boxes = [[b.x1, b.y1, b.x2, b.y2] for b in request.boxes]
    
    score = 0
    feedback_code = "" 
    details = {}

    # Сценарій 1: Сказав "Здоровий"
    if request.said_no_pneumonia:
        if len(gt_boxes) == 0:
            score, feedback_code = 100, "correct_no_pneumonia"
        else:
            score, feedback_code = 0, "critical_miss"
            details = {"total_gt": len(gt_boxes), "missed": len(gt_boxes)}
            
    # Сценарій 2: Намалював рамки на здоровому
    elif len(gt_boxes) == 0 and len(user_boxes) > 0:
        score, feedback_code = 0, "false_positive_healthy"
        details = {"false_positives": len(user_boxes)}
        
    # Сценарій 3: Порівняння рамок
    else:
        matched_gt = set()
        total_iou = 0
        user_total_area = 0
        gt_total_area = sum([(b[2]-b[0])*(b[3]-b[1]) for b in gt_boxes])
        
        for u_box in user_boxes:
            user_total_area += (u_box[2]-u_box[0])*(u_box[3]-u_box[1])
            
            best_iou, best_idx = 0, -1
            for idx, gt_box in enumerate(gt_boxes):
                if idx in matched_gt: continue
                iou = calculate_iou(u_box, gt_box)
                if iou > best_iou: best_iou, best_idx = iou, idx
            
            if best_iou > 0.1:
                matched_gt.add(best_idx)
                total_iou += best_iou
            
        missed = len(gt_boxes) - len(matched_gt)
        false_positives = len(user_boxes) - len(matched_gt)
        mean_iou = total_iou / len(gt_boxes) if gt_boxes else 0
        
        # --- РОЗРАХУНОК ПОХИБОК ---
        rel_error = abs(user_total_area - gt_total_area) / gt_total_area * 100 if gt_total_area > 0 else 0
        mse_error = (1.0 - mean_iou) ** 2

        # --- ОЦІНКА ---
        if mean_iou > 0.5:
            adj_score = 100
        elif mean_iou > 0.2:
            adj_score = 60 + (mean_iou - 0.2) * 133
        else:
            adj_score = mean_iou * 300

        score = adj_score - (missed * 25) - (false_positives * 10)
        
        if missed == 0 and len(gt_boxes) > 0:
            score = max(score, 75 + (mean_iou * 25))
            
        score = max(0, min(100, score))
        feedback_code = "match_result"
        
        details = {
            "mean_iou": round(mean_iou, 4),
            "missed": missed,
            "false_positives": false_positives,
            "relative_error": round(rel_error, 2),
            "mse_error": round(mse_error, 4)
        }

    # Збереження в БД
    if request.user_id:
        try:
            new_res = TrainingResult(
                user_id=request.user_id,
                image_id=request.image_id,
                student_boxes=[b.model_dump() for b in request.boxes],
                ground_truth_boxes=gt_boxes,
                score=float(score),
                feedback=f"Feedback: {feedback_code}",
                difficulty=request.difficulty,       
                session_mode=request.session_mode,   
                details=details                      
            )
            db.add(new_res)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Помилка БД: {e}")

    return {
        "score": score,
        "feedback_code": feedback_code,
        "ground_truth_boxes": gt_boxes,
        "details": details
    }

# ==========================================
# 5. ДІАГНОСТИКА
# ==========================================

@app.post("/api/diagnose")
async def diagnose(file: UploadFile = File(...), user_id: int = None, db: Session = Depends(get_db)):
    try:
        from models.diagnosis import diagnose_pneumonia
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        
        result = diagnose_pneumonia(tmp_path)
        os.unlink(tmp_path)
        
        if user_id:
            db.add(DiagnosisResult(
                user_id=user_id,
                detected_boxes=result['boxes'],
                image_size=f"{result['image_size'][0]}x{result['image_size'][1]}"
            ))
            db.commit()
        
        return JSONResponse({
            "status":             "success",
            "boxes":              result['boxes'],
            "image_size":         result['image_size'],
            "result_image_base64": result['result_image_base64'],
            "has_pneumonia":      result['has_pneumonia'],
            "overall_label":      result['overall_label'],       
            "overall_confidence": result['overall_confidence'],  
            "overall_color":      result['overall_color'],        
            "message": f"Знайдено {result['detections_count']} областей"
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)