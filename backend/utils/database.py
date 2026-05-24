import json
import random
from pathlib import Path
from typing import Dict, List, Optional

class AnnotationDatabase:
    """Робота з JSON базою координат для тренажера"""
    
    def __init__(self, annotations_file: str, images_dir: str):
        """
        Args:
            annotations_file: Шлях до annotations.json
            images_dir: Папка з рентген-снімками
        """
        self.annotations_file = Path(annotations_file)
        self.images_dir = Path(images_dir)
        self.annotations = {}
        self.load_annotations()
    
    def load_annotations(self):
        """Завантажує анотації з JSON"""
        if not self.annotations_file.exists():
            raise FileNotFoundError(f"Файл не знайдений: {self.annotations_file}")
        
        with open(self.annotations_file, 'r', encoding='utf-8') as f:
            self.annotations = json.load(f)
        
        print(f"Завантажено {len(self.annotations)} анотацій")
    
    def get_all_images(self) -> List[str]:
        """Повертає список всіх доступних знімків"""
        return list(self.annotations.keys())
    
    def get_random_image(self) -> Dict:
        """Повертає випадковий знімок з його координатами"""
        image_name = random.choice(list(self.annotations.keys()))
        return self.get_image_by_name(image_name)
    
    def get_image_by_name(self, image_name: str) -> Dict:
        """Повертає знімок з його даними"""
        if image_name not in self.annotations:
            raise ValueError(f"Знімок не знайдений: {image_name}")
        
        # Шукаємо файл зображення
        image_path = None
        for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
            candidate = self.images_dir / f"{image_name}{ext}"
            if candidate.exists():
                image_path = str(candidate)
                break
        
        if not image_path:
            raise FileNotFoundError(f"Зображення не знайдене: {image_name}")
        
        return {
            'image_id': image_name,
            'image_path': image_path,
            'ground_truth_boxes': self.annotations[image_name],
            'has_pneumonia': len(self.annotations[image_name]) > 0
        }
    
    def get_ground_truth(self, image_name: str) -> List[Dict]:
        """Повертає еталонні координати для знімка"""
        if image_name not in self.annotations:
            raise ValueError(f"Знімок не знайдений: {image_name}")
        return self.annotations[image_name]

# Глобальний об'єкт БД
database = None

def init_database(annotations_file: str, images_dir: str):
    """Ініціалізує глобальну БД при старті"""
    global database
    database = AnnotationDatabase(annotations_file, images_dir)

def get_database() -> AnnotationDatabase:
    """Повертає глобальну БД"""
    if database is None:
        raise RuntimeError("База даних анотацій не ініціалізована!")
    return database