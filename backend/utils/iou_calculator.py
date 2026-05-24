from typing import List, Dict, Tuple, Union

def extract_coords(box: Union[Dict, List]) -> List[float]:
    """Універсальний парсер координат. Працює і зі словниками, і зі списками."""
    if isinstance(box, dict):
        return [float(box.get('x1', 0)), float(box.get('y1', 0)), float(box.get('x2', 0)), float(box.get('y2', 0))]
    return [float(c) for c in box[:4]]

def calculate_advanced_metrics(box1: Union[Dict, List], box2: Union[Dict, List]) -> Tuple[float, float, float]:
    """Обчислює IoU, Квадратичну похибку центрів (MSE) та Відносну похибку площі"""
    b1 = extract_coords(box1) # Студентська рамка
    b2 = extract_coords(box2) # Еталонна рамка
    
    # 1. Розрахунок площ
    boxAArea = max(0.0, (b1[2] - b1[0]) * (b1[3] - b1[1]))
    boxBArea = max(0.0, (b2[2] - b2[0]) * (b2[3] - b2[1]))

    # 2. Розрахунок IoU
    xA = max(b1[0], b2[0])
    yA = max(b1[1], b2[1])
    xB = min(b1[2], b2[2])
    yB = min(b1[3], b2[3])
    interArea = max(0.0, xB - xA) * max(0.0, yB - yA)

    iou = 0.0
    if boxAArea + boxBArea - interArea > 0:
        iou = interArea / float(boxAArea + boxBArea - interArea)

    # 3. Квадратична похибка центрів (Center MSE)
    cX1, cY1 = (b1[0] + b1[2]) / 2.0, (b1[1] + b1[3]) / 2.0
    cX2, cY2 = (b2[0] + b2[2]) / 2.0, (b2[1] + b2[3]) / 2.0
    center_mse = (cX1 - cX2)**2 + (cY1 - cY2)**2

    # 4. Відносна похибка площі (у відсотках)
    area_error = 0.0
    if boxBArea > 0:
        area_error = (abs(boxAArea - boxBArea) / boxBArea) * 100.0

    return iou, center_mse, area_error

def match_boxes(student_boxes: List[Dict], ground_truth_boxes: List[Dict], 
                iou_threshold: float = 0.25) -> Tuple[float, Dict]:
    """
    Порівнює студентські рамки з еталоном.
    Використовує зважену формулу оцінювання (40% за знаходження, 60% за точність).
    """
    matched_gt = set()
    correct_count = 0
    
    ious = []
    mses = []
    area_errors = []
    
    for s_box in student_boxes:
        best_iou = 0.0
        best_gt_idx = -1
        best_mse = 0.0
        best_area_err = 0.0
        
        for j, gt_box in enumerate(ground_truth_boxes):
            if j in matched_gt:
                continue
            
            iou, center_mse, area_err = calculate_advanced_metrics(s_box, gt_box)
            if iou > best_iou:
                best_iou = iou
                best_gt_idx = j
                best_mse = center_mse
                best_area_err = area_err
                
        if best_iou >= iou_threshold:
            correct_count += 1
            matched_gt.add(best_gt_idx)
            ious.append(best_iou)
            mses.append(best_mse)
            area_errors.append(best_area_err)

    total_gt = len(ground_truth_boxes)
    false_positives = len(student_boxes) - correct_count
    missed = total_gt - correct_count
    
    mean_iou_val = sum(ious) / len(ious) if ious else 0.0
    
    # --- НОВА СИСТЕМА ОЦІНЮВАННЯ ---
    if total_gt > 0:
        # 1. Базовий бал: просто за факт виявлення (макс 40 балів)
        base_score = (correct_count / total_gt) * 40.0
        
        # 2. Бал якості: залежить від точності рамки (макс 60 балів)
        quality_score = mean_iou_val * 60.0
        
        score = base_score + quality_score
        
        # 3. Штрафи за помилкові дії
        if false_positives > 0:
            score -= (false_positives * 15.0) # Штраф за зайві (хибні) рамки
            
        score = max(0.0, min(100.0, score)) # Оцінка завжди в межах 0-100
    else:
        score = 100.0 if len(student_boxes) == 0 else 0.0

    return score, {
        "correct": correct_count,
        "missed": missed,
        "false_positives": false_positives,
        "mean_iou": mean_iou_val,
        "mean_center_mse": sum(mses) / len(mses) if mses else 0.0,
        "mean_area_error": sum(area_errors) / len(area_errors) if area_errors else 0.0,
        "ious": ious
    }

def evaluate_student_answer(student_boxes: List[Dict], ground_truth_boxes: List[Dict],
                            student_said_no_pneumonia: bool = False) -> Dict:
    """Повна оцінка відповіді студента для API"""
    has_pneumonia = len(ground_truth_boxes) > 0
    total_gt = len(ground_truth_boxes)
    
    # Випадок 1: Пневмонії дійсно немає
    if not has_pneumonia:
        if len(student_boxes) == 0 or student_said_no_pneumonia:
            return {
                "score": 100.0,
                "feedback_code": "correct_no_pneumonia",
                "details": {"diagnosis": "correct", "correct": 0, "missed": 0, "false_positives": 0, "mean_iou": 0.0, "mean_center_mse": 0.0, "mean_area_error": 0.0, "total_gt": 0}
            }
        else:
            return {
                "score": 0.0,
                "feedback_code": "false_positive_healthy",
                "details": {"diagnosis": "wrong", "correct": 0, "missed": 0, "false_positives": len(student_boxes), "mean_iou": 0.0, "mean_center_mse": 0.0, "mean_area_error": 0.0, "total_gt": 0}
            }

    # Випадок 2: Пневмонія є, але студент каже, що здоровий
    if has_pneumonia and (student_said_no_pneumonia or len(student_boxes) == 0):
        return {
            "score": 0.0,
            "feedback_code": "critical_miss",
            "details": {"diagnosis": "missed_all", "correct": 0, "missed": total_gt, "false_positives": 0, "mean_iou": 0.0, "mean_center_mse": 0.0, "mean_area_error": 0.0, "total_gt": total_gt}
        }
    
    # Випадок 3: Нормальне оцінювання намальованих рамок
    score, details = match_boxes(student_boxes, ground_truth_boxes)
    details["total_gt"] = total_gt
    
    return {
        "score": score,
        "feedback_code": "match_result",
        "details": details
    }