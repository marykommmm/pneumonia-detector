# Використовуємо офіційний Python
FROM python:3.10

# Створюємо робочу папку
WORKDIR /code

# Встановлюємо системні бібліотеки для OpenCV (це потрібно для cv2!)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0

# Копіюємо файл із залежностями та встановлюємо їх
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Копіюємо весь інший код бекенду
COPY . .

# Hugging Face вимагає, щоб сервер працював на порту 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]