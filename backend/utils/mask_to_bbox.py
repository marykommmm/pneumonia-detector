import cv2
import json
import numpy as np
from pathlib import Path
from typing import Dict, List

def mask_to_bboxes(mask_path: str) -> List[Dict]:
    """
    Перетворює маску на список bounding box координат
    
    Args:
        mask_path: Шлях до маски (чорна маска з білими областями)
    
    Returns:
        [
            {'x1': float, 'y1': float, 'x2': float, 'y2': float},
            ...
        ]
    """
    # Читаємо маску
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    
    if mask is None:
        raise FileNotFoundError(f"Не можу прочитати маску: {mask_path}")
    
    # Знаходимо контури (білі області)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = []
    for contour in contours:
        # Отримуємо bounding box
        x, y, w, h = cv2.boundingRect(contour)
        
        # Фільтруємо дуже малі контури (шум)
        if w > 10 and h > 10:
            boxes.append({
                'x1': float(x),
                'y1': float(y),
                'x2': float(x + w),
                'y2': float(y + h)
            })
    
    return boxes

def process_all_masks(images_dir: str, masks_dir: str, output_file: str = "annotations.json"):
    """
    Обробляє всі маски в папці і створює JSON файл з координатами
    
    Args:
        images_dir: Папка з рентген-снімками
        masks_dir: Папка з масками
        output_file: Вихідний JSON файл
    
    Returns:
        dict: {"image_name": [boxes]}
    """
    images_path = Path(images_dir)
    masks_path = Path(masks_dir)
    
    annotations = {}
    
    print(f"Шукаю маски в: {masks_path}")
    
    # Обробляємо всі маски
    for mask_file in sorted(masks_path.glob("*")):
        if mask_file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.bmp']:
            image_name = mask_file.stem  # ім'я без розширення
            
            print(f"  Обробляю: {mask_file.name}")
            
            try:
                boxes = mask_to_bboxes(str(mask_file))
                annotations[image_name] = boxes
                print(f"     Знайдено {len(boxes)} областей")
            except Exception as e:
                print(f"     Помилка: {e}")
    
    # Зберігаємо результат
    output_path = Path(output_file)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(annotations, f, indent=2, ensure_ascii=False)
    
    print(f"\nКоординати збережені в: {output_path}")
    print(f"Оброблено знімків: {len(annotations)}")
    
    return annotations

if __name__ == "__main__":
    # 🔧 НАЛАШТУВАННЯ:
    IMAGES_DIR = "../test_images/images"
    MASKS_DIR = "../test_images/masks"
    OUTPUT_FILE = "../test_images/annotations.json"
    
    # Запускаємо обробку
    annotations = process_all_masks(IMAGES_DIR, MASKS_DIR, OUTPUT_FILE)
    
    # Показуємо результат
    print("\nПриклад результату:")
    for img_name, boxes in list(annotations.items())[:2]:
        print(f"  {img_name}: {boxes}")