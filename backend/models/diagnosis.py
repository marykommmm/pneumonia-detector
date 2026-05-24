from PIL import Image, ImageDraw
import cv2
import base64
from io import BytesIO
from models.yolo_handler import get_yolo

def diagnose_pneumonia(image_input):
    # 1. Отримуємо розумну логіку (з CLAHE всередині)
    yolo_handler = get_yolo()
    smart_result = yolo_handler.detect(image_input)
    
    if not smart_result['has_pneumonia']:
        smart_result['boxes'] = []
    
    # 2. Відкриваємо ОРИГІНАЛЬНЕ зображення для малювання рамок
    img_bgr = cv2.imread(image_input)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    draw = ImageDraw.Draw(pil_img)
    
    detections = []
    
    # 3. Малюємо рамки, які знайшов детектор
    for box in smart_result['boxes']:
        x1, y1, x2, y2 = box['x1'], box['y1'], box['x2'], box['y2']
        conf_value = box['confidence']
        
        # Масштабування для гарного відображення в інтерфейсі
        RAW_MIN = 0.05  
        RAW_MAX = 0.50  
        DISPLAY_MIN = 70  
        DISPLAY_MAX = 99  
        
        if conf_value >= RAW_MAX:
            display_score = DISPLAY_MAX
        else:
            ratio = (conf_value - RAW_MIN) / (RAW_MAX - RAW_MIN)
            display_score = int(DISPLAY_MIN + (ratio * (DISPLAY_MAX - DISPLAY_MIN)))
        
        draw.rectangle([x1, y1, x2, y2], outline='lime', width=3)
        
        detections.append({
            'x1': int(x1), 'y1': int(y1), 'x2': int(x2), 'y2': int(y2),
            'confidence': round(conf_value, 4),
            'display_score': display_score
        })
        
    # 4. Підготовка зображення для фронтенду
    img_io = BytesIO()
    pil_img.save(img_io, format='JPEG')
    img_io.seek(0)
    image_base64 = "data:image/jpeg;base64," + base64.b64encode(img_io.getvalue()).decode()
    
    # 5. Формуємо фінальні лейбли
    if smart_result['has_pneumonia']:
        overall_label = "ПНЕВМОНІЯ ВИЯВЛЕНА"
        overall_color = "red"
    else:
        overall_label = "НОРМА"
        overall_color = "green"
        
    return {
        'has_pneumonia':        smart_result['has_pneumonia'],
        'detections_count':     len(detections), # Тепер тут буде 0 для "Норми"
        'boxes':                detections,      # Тепер тут буде пустий масив []
        'overall_label':        overall_label,
        'overall_confidence':   smart_result['probability'],
        'overall_color':        overall_color,
        'result_image_base64':  image_base64,
        'image_size':           smart_result['image_size']
    }