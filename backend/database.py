from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path

# Шлях до БД - будемо створювати у backend папці
DB_FILE = Path(__file__).parent / "pneumonia.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

print(f"Шлях до БД: {DB_FILE}")

# Створюємо engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Сесія для запитів
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base для моделей
Base = declarative_base()

def get_db():
    """Dependency для FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Ініціалізує БД - створює всі таблиці"""
    print("Створюю таблиці в БД...")
    Base.metadata.create_all(bind=engine)
    print(f"БД ініціалізована в: {DB_FILE}")