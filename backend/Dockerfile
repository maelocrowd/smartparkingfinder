FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV FLASK_APP=wsgi:app

EXPOSE 8000

CMD ["gunicorn", "-b", "0.0.0.0:8000", "wsgi:app"]

