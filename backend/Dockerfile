FROM python:3.12-slim

WORKDIR /backend

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .
RUN mkdir -p /backend/uploads

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
