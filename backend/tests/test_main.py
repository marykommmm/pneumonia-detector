import pytest
from fastapi.testclient import TestClient
from main import app, calculate_iou

# Створюємо віртуального клієнта, який буде "смикати" твої ендпоінти
client = TestClient(app)

# ==========================================
# 1. ТЕСТИ АЛГОРИТМУ IoU (Unit тестування)
# ==========================================

def test_iou_full_overlap():
    # Повний збіг рамок (очікуємо 1.0)
    box1 = [0, 0, 10, 10]
    box2 = [0, 0, 10, 10]
    assert calculate_iou(box1, box2) == 1.0

def test_iou_no_overlap():
    # Рамки взагалі не перетинаються (очікуємо 0.0)
    box1 = [0, 0, 5, 5]
    box2 = [10, 10, 15, 15]
    assert calculate_iou(box1, box2) == 0.0

def test_iou_partial_overlap():
    # Частковий перетин
    box1 = [0, 0, 10, 10]  # Площа 100
    box2 = [5, 5, 15, 15]  # Площа 100, площа перетину 25. IoU = 25 / (100 + 100 - 25) = 25/175
    iou = calculate_iou(box1, box2)
    assert round(iou, 4) == round(25 / 175, 4)

# ==========================================
# 2. МАКЕТУВАННЯ (Mocking) ДАТАСЕТУ
# ==========================================
# Ця фікстура "підміняє" твій глобальний pneumo_dataset на тестовий, 
# щоб тести працювали швидко і не залежали від файлу annotations.json

@pytest.fixture
def mock_dataset(monkeypatch):
    test_data = {
        "img_train_healthy.jpg": {"split": "train", "difficulty": "easy", "boxes": []},
        "img_exam_sick.jpg": {"split": "exam", "difficulty": "hard", "boxes": [[10, 10, 50, 50]]}
    }
    monkeypatch.setattr("main.pneumo_dataset", test_data)

# ==========================================
# 3. ТЕСТУВАННЯ ЕНДПОІНТІВ (Functional тестування)
# ==========================================

def test_get_training_images(mock_dataset):
    response = client.get("/api/dataset/training")
    assert response.status_code == 200
    data = response.json()
    # Має повернути лише знімок зі split="train"
    assert len(data) == 1
    assert data[0]["id"] == "img_train_healthy.jpg"

def test_get_exam_dataset(mock_dataset):
    response = client.get("/api/dataset/exam")
    assert response.status_code == 200
    data = response.json()
    # Має повернути лише знімок зі split="exam"
    assert len(data) == 1
    assert data[0]["id"] == "img_exam_sick.jpg"

# ==========================================
# 4. ТЕСТУВАННЯ ЛОГІКИ ПЕРЕВІРКИ ВІДПОВІДІ (check-answer)
# ==========================================

def test_check_answer_image_not_found(mock_dataset):
    # Тестуємо помилку 404, якщо зображення немає в датасеті
    payload = {
        "image_id": "fake_image.jpg",
        "boxes": [],
        "said_no_pneumonia": True
    }
    response = client.post("/api/dataset/check-answer", json=payload)
    assert response.status_code == 404

def test_check_answer_correct_healthy(mock_dataset):
    # Сценарій 1: Студент каже здоровий, і знімок справді здоровий
    payload = {
        "image_id": "img_train_healthy.jpg",
        "boxes": [],
        "said_no_pneumonia": True
    }
    response = client.post("/api/dataset/check-answer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 100
    assert data["feedback_code"] == "correct_no_pneumonia"

def test_check_answer_false_positive(mock_dataset):
    # Сценарій 2: Студент знайшов хворобу там, де її немає (намалював рамку на здоровому)
    payload = {
        "image_id": "img_train_healthy.jpg",
        "boxes": [{"x1": 10, "y1": 10, "x2": 20, "y2": 20}], # Студент додав рамку
        "said_no_pneumonia": False
    }
    response = client.post("/api/dataset/check-answer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0
    assert data["feedback_code"] == "false_positive_healthy"