# python:3.12-slim best python base image
FROM python:3.12-slim

# create backend folder in image and make working at /app
WORKDIR /backend

# . means at current working folder
COPY pyproject.toml .
RUN pip install -e .

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

