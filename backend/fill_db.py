import json
from database import SessionLocal
from db_models import TestImage

def fill_database():
    db = SessionLocal()
    try:
        print("Відкриваємо файл annotations_final.json...")
        with open("annotations_final.json", "r") as f:
            data = json.load(f)
            
        added_count = 0
        
        for img_name, boxes in data.items():
            # Перевіряємо, чи немає вже такого знімка в базі
            exists = db.query(TestImage).filter(TestImage.image_name == img_name).first()
            
            if not exists:
                new_image = TestImage(
                    image_name=img_name,
                    # Шлях до хмари, звідки React буде тягнути картинку
                    file_path=f"https://pneumo-detect-images-2026.s3.eu-central-1.amazonaws.com/pneumo_final_dataset/{img_name}",
                    boxes=boxes  # Зберігаємо правильні координати
                )
                db.add(new_image)
                added_count += 1
                
        db.commit()
        print(f"✅ Готово! Успішно додано {added_count} нових записів про знімки в базу даних.")
        
    except FileNotFoundError:
        print("❌ Помилка: Файл annotations_final.json не знайдено в цій папці!")
    except Exception as e:
        print(f"❌ Сталася помилка: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fill_database()