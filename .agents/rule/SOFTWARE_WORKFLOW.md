# SOFTWARE WORKFLOW

> **Chốt:** Kanban nhẹ · Trunk-based Git · CI (GitHub Actions) · Docker

---

## 1. Bảng việc (GitHub Projects)

3 cột: **To Do → Doing → Done**

Luật duy nhất: **tối đa 2 việc ở cột Doing.**

---

## 2. Git

- `main` luôn chạy được.
- Mỗi tính năng một branch ngắn: `feat/ten-tinh-nang`
- Làm xong → mở Pull Request → merge vào `main`.
- Branch không sống quá **2 ngày**.
- Commit theo dạng:
  ```
  feat: mô tả ngắn
  fix: mô tả ngắn
  ```

---

## 3. CI (GitHub Actions)

Một file `.github/workflows/ci.yml`, chạy **ruff** và **pytest** mỗi lần push.

```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install uv && uv sync --dev
      - run: uv run ruff check .
      - run: uv run pytest
```

---

## 4. Docker

- Mỗi dự án có `Dockerfile`.
- Cấu hình qua biến môi trường: file `.env` (không commit).
- Chỉ commit `.env.example` với tên biến, không có giá trị thật.

---

## 5. Tài liệu

- **`README.md`**: hướng dẫn chạy dự án trong **3 lệnh**.
- **`docs/adr/`**: mỗi quyết định kỹ thuật ghi **5–10 dòng**.
