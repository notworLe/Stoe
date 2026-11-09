# AI DELEGATION LOOP - CHU TRÌNH GIAO VIỆC CHO AI AGENT (SOFTWARE)

Nhịp điệu làm việc giữa Kỹ sư và AI Agent cho mỗi tác vụ phần mềm:

`Describe → Generate → Review → Run → Test → Refactor → Log -> Commit`

Stack cố định: **PostgreSQL** (database) · **Python FastAPI** (backend) · **Next.js** (frontend) · **mobile** · **desktop** (tùy chọn).

---

## 1. Cấu trúc Project (5 thư mục cốt lõi)

```text
project-name/
├── .agents/        # Bộ não thứ hai: file quy trình này, AI_REFERENCE, TASK_DESCRIPTION...
├── database/      # PostgreSQL: docker-compose, init.sql, seed, ERD, schema docs
├── backend/       # FastAPI: app/, alembic/, tests/, pyproject.toml
├── frontend/      # Next.js (App Router, TypeScript)
├── mobile/        # React Native / Expo (client của backend)
├── desktop/       # (Nếu có) Tauri hoặc Electron (client của backend)
├── docker-compose.yml
└── Makefile       # make lint-be | test-be | lint-fe | test-fe | up | down ...
```

Quy tắc ranh giới:
- Mỗi thư mục là **một đơn vị giao việc độc lập**: có README, lệnh lint/test riêng, không import chéo mã nguồn.
- `backend/` là **nguồn sự thật duy nhất** về nghiệp vụ. `frontend/`, `mobile/`, `desktop/` chỉ là client gọi API.
- Migration (Alembic) đặt trong `backend/alembic/` vì cần SQLAlchemy models. `database/` chỉ giữ hạ tầng DB, seed và tài liệu schema.

---

## 2. Nguyên tắc Giao việc (Delegation Rules)

### 2.1. Contract-First: hợp đồng đi trước code
Thứ tự bắt buộc khi một tính năng chạm nhiều tầng:

```text
Database schema ──► Backend (Pydantic schema + endpoint) ──► OpenAPI spec ──► Client types (FE / Mobile / Desktop)
```

- Backend xuất `openapi.json`; client **sinh type/API client từ OpenAPI**, không viết tay lại kiểu dữ liệu.
- Đổi API = đổi contract trước, rồi mới sửa client. Không để client "đoán" response.

### 2.2. Ba mức tự chủ của Agent

| Mức | Agent được làm | Khi nào dùng |
| :--- | :--- | :--- |
| **L1 - Propose** | Chỉ đề xuất plan/diff, không ghi file | Thay đổi schema DB, auth, thanh toán, xóa dữ liệu |
| **L2 - Implement** | Viết code + test trong phạm vi task, dừng trước commit | Mặc định cho mọi feature |
| **L3 - Autonomous** | Code + test + lint + commit nguyên tử | Task nhỏ, rủi ro thấp (fix typo, thêm test, refactor cục bộ) |

Kỹ sư luôn ghi rõ mức tự chủ trong Delegation Brief. Không ghi = L2.

### 2.3. Việc KHÔNG giao cho Agent quyết định
- Thiết kế schema DB mới / đổi kiểu cột / xóa cột (Agent chỉ đề xuất, Kỹ sư duyệt).
- Bất kỳ thứ gì liên quan secrets, `.env` thật, key production.
- Chạy migration trên database không phải local/dev.
- Thêm dependency mới vào `pyproject.toml` / `package.json` (phải xin phép, nêu lý do).

### 2.4. Điều kiện Dừng (Stop Conditions)
Agent PHẢI dừng và hỏi lại khi:
1. Yêu cầu mơ hồ hoặc mâu thuẫn với contract hiện có.
2. Cần sửa file ngoài phạm vi `Target Files` đã giao.
3. Test fail sau 2 lần sửa mà chưa xác định được nguyên nhân gốc.
4. Phát hiện cần đổi schema DB hoặc đổi API đang được client khác dùng.

---

## 3. Delegation Brief (Mẫu giao việc chuẩn)

```markdown
# Delegation Brief: [Tên task]

## 1. Goal
- Mục tiêu (1-2 câu):
- Out-of-Scope:

## 2. Scope
- Layer: database | backend | frontend | mobile | desktop
- Target Files: `backend/app/...`
- Test Files: `backend/tests/...`
- Autonomy: L1 | L2 | L3

## 3. Contract
- Endpoint: `POST /api/v1/...`
- Request schema:
- Response schema + status codes:
- Lỗi cần xử lý (401, 404, 409, 422...):

## 4. Constraints
- Không thêm dependency / không đổi file ngoài Target Files
- Tham số, URL, secrets đọc từ config/env, không hardcode

## 5. Definition of Done
- [ ] `make lint-<layer>` sạch
- [ ] Test pass (smoke + normal)
- [ ] OpenAPI/types đã đồng bộ (nếu đổi API)
- [ ] Commit theo Conventional Commits
```

---

## 4. Chi tiết 7 Bước

```text
[ 1. DESCRIBE ]  ──► Kỹ sư viết Delegation Brief: layer, file, contract, DoD, mức tự chủ
       │
       ▼
[ 2. GENERATE ]  ──► Agent đọc agents/ + file liên quan, xuất plan ngắn rồi sinh code đúng phạm vi
       │
       ▼
[ 3. REVIEW ]    ──► Kỹ sư rà soát theo checklist của layer (mục 5), reject nếu có red flag
       │
       ▼
[ 4. RUN ]       ──► Chạy thật: uvicorn / next dev / curl / psql để sanity check
       │
       ▼
[ 5. TEST ]      ──► Smoke rồi Normal test (pytest, vitest, Playwright...)
       │
       ▼
[ 6. REFACTOR ]  ──► Tinh gọn, ruff + mypy (BE), eslint + tsc (FE), đồng bộ OpenAPI types
       │
       ▼

[7. LOG] [Đọc õ ở LOG.md]
       │
       ▼
[ 8u=. COMMIT ]    ──► git status, commit nguyên tử, cập nhật trạng thái task
```

### Bước 1: DESCRIBE
Kỹ sư gửi Delegation Brief. Ví dụ ngắn:

```text
"Triển khai endpoint POST /api/v1/orders trong backend/app/api/v1/orders.py.
- Input: OrderCreate (customer_id: UUID, items: list[OrderItemIn], tối thiểu 1 item).
- Output: 201 + OrderOut; 404 nếu customer không tồn tại; 422 nếu items rỗng.
- Logic nghiệp vụ nằm trong services/order_service.py, router chỉ gọi service.
- Autonomy: L2. Không thêm dependency."
```

### Bước 2: GENERATE
- Agent đọc `agents/AI_REFERENCE.md`, `Delegation Brief` và **chỉ các file liên quan** (không nạp cả codebase).
- Trước khi code, Agent xuất plan 3-5 dòng: file sẽ tạo/sửa, thứ tự thực hiện.
- Không tự thêm endpoint, bảng, hàm hay thư viện ngoài brief. Chưa rõ thì hỏi.

### Bước 3: REVIEW
Kỹ sư duyệt theo checklist layer tương ứng (mục 5). Có red flag thì trả về Agent sửa, không tự vá âm thầm.

### Bước 4: RUN (Sanity Check)
```bash
# Backend
uvicorn app.main:app --reload
curl -X POST localhost:8000/api/v1/orders -H "Content-Type: application/json" -d '{...}'

# Database
docker compose up -d db && psql "$DATABASE_URL" -c "\dt"

# Frontend
npm run dev     # mở trang, kiểm tra luồng chính + console không lỗi
```

### Bước 5: TEST
- **Smoke (< 5s)**: import app, khởi tạo FastAPI app, `GET /health` trả 200, trang Next.js render không crash.
- **Normal**: logic nghiệp vụ, status code, validation 422, auth, edge cases, transaction rollback.
- Test API dùng database test riêng (container hoặc schema riêng), **không bao giờ chạy test trên DB dev có dữ liệu thật**.
- Không xóa/sửa test để làm cho pass.

### Bước 6: REFACTOR
- Tách logic khỏi router, loại bỏ lặp, đưa hằng số ra config.
- Đồng bộ lại OpenAPI → sinh lại client types nếu contract thay đổi.
- Chạy: `make lint-be`, `make lint-fe` (ruff, mypy, eslint, tsc).

### Bước 7: COMMIT
```bash
git add backend/app/api/v1/orders.py backend/app/services/order_service.py backend/tests/test_orders.py
git commit -m "feat(be): add create order endpoint with item validation"
```

Scope chuẩn: `db`, `be`, `fe`, `mobile`, `desktop`, `infra`, `docs`.
Một commit = một layer = một mục đích. Thay đổi cross-layer tách thành nhiều commit theo thứ tự contract: `db` → `be` → `fe`/`mobile`/`desktop`.

---

## 5. Checklist Review theo Layer

### Database (PostgreSQL)
- [ ] Mọi thay đổi schema đi qua migration Alembic, có cả `upgrade` lẫn `downgrade`.
- [ ] Khóa chính, khóa ngoại, ràng buộc `NOT NULL`/`UNIQUE`/`CHECK` khai báo rõ.
- [ ] Cột hay lọc/join đã có index; không index thừa.
- [ ] Migration không làm mất dữ liệu; thay đổi phá vỡ phải được Kỹ sư duyệt (L1).

### Backend (FastAPI)
- [ ] Phân tầng: `api/` (router) → `services/` (nghiệp vụ) → `repositories/` hoặc `crud/` (truy vấn) → `models/`.
- [ ] Router không chứa logic nghiệp vụ hay SQL trực tiếp.
- [ ] Pydantic schema tách riêng `In` / `Out`; không trả model ORM thô.
- [ ] Type hints đầy đủ; endpoint khai báo `response_model` và status code.
- [ ] Dependency injection cho DB session, auth; không dùng biến global.
- [ ] Cấu hình qua `pydantic-settings` + `.env`; không hardcode secret/URL.
- [ ] Không dùng `print()` (dùng logging); không `try-except pass`.
- [ ] Không có N+1 query ở endpoint list; có phân trang.

### Frontend (Next.js)
- [ ] TypeScript strict, không `any` bừa bãi.
- [ ] Types API sinh từ OpenAPI, không viết tay.
- [ ] Phân biệt rõ Server Component và Client Component (`"use client"` chỉ khi cần).
- [ ] Mọi lời gọi API qua một lớp client tập trung; URL lấy từ biến môi trường.
- [ ] Có trạng thái loading / error / empty cho mỗi màn hình dữ liệu.

### Mobile / Desktop
- [ ] Dùng chung contract OpenAPI với frontend, không tự định nghĩa lại API.
- [ ] Không chứa logic nghiệp vụ cốt lõi (thuộc về backend).
- [ ] Xử lý offline/mất mạng và lỗi API rõ ràng.
- [ ] Token lưu ở nơi an toàn của nền tảng (Keychain/Keystore/secure storage), không lưu plain text.

### Cross-cutting (mọi layer)
- [ ] Secrets không nằm trong repo; `.env.example` được cập nhật khi thêm biến mới.
- [ ] CORS, auth, validation đầu vào đã xử lý ở backend (không tin client).
- [ ] Không thêm dependency ngoài danh mục đã duyệt.

---

## 6. Red Flags - Reject Ngay
1. Agent sửa file ngoài `Target Files` hoặc tự đổi cấu trúc 5 thư mục.
2. Thêm dependency mới không xin phép.
3. Đổi schema DB / chạy migration mà chưa có duyệt (L1).
4. Hardcode secret, connection string, URL, port.
5. SQL nối chuỗi từ input người dùng (SQL injection) thay vì query tham số hóa.
6. Router dài hàng trăm dòng chứa cả validation, SQL và nghiệp vụ.
7. Client tự định nghĩa lại kiểu API thay vì dùng type sinh từ OpenAPI.
8. `try-except pass`, hoặc sửa test/xóa test để qua mặt lỗi.
9. Đánh dấu Done khi chưa chạy test thật.

---

## 7. Báo cáo Bàn giao của Agent (Handoff Report)

Sau mỗi lượt, Agent trả về đúng 4 mục, ngắn gọn:

```text
1. Đã làm: các file đã tạo/sửa (đường dẫn cụ thể).
2. Đã kiểm chứng: lệnh đã chạy + kết quả thật (lint/test/curl). Chưa chạy gì thì nói rõ.
3. Giả định & rủi ro: những chỗ Agent tự quyết hoặc chưa chắc.
4. Tiếp theo: task kế tiếp / cần Kỹ sư duyệt gì.
```

---

## 8. Quy trình Giao việc Xuyên nhiều Layer (Vertical Slice)

Ví dụ tính năng "Tạo đơn hàng" chạy qua cả stack. Mỗi dòng là **một vòng lặp 7 bước riêng**:

| Thứ tự | Layer | Task | Autonomy |
| :---: | :--- | :--- | :---: |
| 1 | database | Đề xuất bảng `orders`, `order_items` + ràng buộc | L1 |
| 2 | backend | Migration Alembic + models | L2 |
| 3 | backend | Schemas + service + endpoint + test | L2 |
| 4 | backend | Xuất `openapi.json` | L3 |
| 5 | frontend | Sinh types + form tạo đơn + gọi API | L2 |
| 6 | mobile | Màn hình tạo đơn dùng cùng contract | L2 |
| 7 | desktop | (Nếu có) tương tự mobile | L2 |

Nguyên tắc: **chỉ một task `In Progress` tại một thời điểm**, hoàn tất và commit layer dưới rồi mới sang layer trên.

---

## 9. Trạng thái Task (Kanban gọn)

`To Do → In Progress → Done` (nhánh phụ: `On Hold`, `Cancelled`)

- Agent không tự đánh dấu `Done` khi chưa có kết quả test thật.
- `Done` = đã pass review + smoke + normal test + commit.
- Task `Done` không bị sửa lại trừ khi có yêu cầu refactor rõ ràng.
