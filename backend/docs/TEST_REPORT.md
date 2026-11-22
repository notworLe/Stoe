---
title: "Backend Test Report — Maison de Lua API & PostgreSQL Verification"
doc_type: report
project: retail-system
layer: backend
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-22
updated: 2026-11-22
last_updated_by: Antigravity
version: 1.0.0
status: active
reviewers: []
related_docs:
  - README.md
  - API_REFERENCE.md
  - DATABASE_AND_RULES.md
  - ../../frontend/docs/TEST_REPORT.md
tags: [testing, pytest, ruff, postgresql, qa, report, backend]
---

# Backend Test Report

Báo cáo kết quả kiểm thử thực tế cho toàn bộ tính năng Backend API và kết nối PostgreSQL local (`stoe`).

---

## 1. Tổng hợp kết quả kiểm thử tự động

| Công cụ / Kịch bản | Lệnh chạy | Kết quả | Thời gian |
| :--- | :--- | :---: | :---: |
| **Lint (Ruff)** | `backend\.venv\Scripts\ruff.exe check backend` | **PASS (0 errors)** | < 1s |
| **Unit & API Suite (Pytest)** | `backend\.venv\Scripts\pytest.exe backend/test -v` | **PASS (8/8 passed)** | 3.71s |
| **Live PostgreSQL + FastAPI E2E** | `uvicorn main:app` kết nối PostgreSQL `127.0.0.1:5432/stoe` | **PASS (7/7 checks)** | ~5s |

---

## 2. Chi tiết các ca kiểm thử Pytest (`backend/test/test_api.py`)

| # | Test Case | Tính năng được xác minh | Kết quả |
| :---: | :--- | :--- | :---: |
| 1 | `test_connection` | Kiểm tra hạ tầng test runner | **PASSED** |
| 2 | `test_default_site_settings_maisondelua` | Cấu hình mặc định: `site_name="Maison de Lua"`, `site_handle="maisondelua"`, `logo_url="/images/image.png"`, `currency="AUD"`, `transport_post_fee_aud=16.95`, `after_hours_fee_aud=20.0`, `turnaround_gap_days=1` | **PASSED** |
| 3 | `test_public_garment_catalog_and_filters` | Seed đủ 12 mẫu áo dài tiếng Anh giá AUD; lọc `occasion`, `color`, `size`; truy vấn theo `slug` (`AD-12`); trả `404` cho slug không tồn tại | **PASSED** |
| 4 | `test_delivery_and_rental_package_rules` | `pick_in_person` cho phép đủ 1/2/4/8 ngày với hệ số `0.45 / 0.70 / 1.00 / 1.75` và phí ship `$0`; chặn giờ trả ≤ giờ nhận cho gói 1 ngày; cộng `+$20 AUD` trả sau 21:00; `transport_post` **từ chối** gói 1 & 2 ngày, **cho phép** gói 4 & 8 ngày kèm `+$16.95 AUD` | **PASSED** |
| 5 | `test_four_day_package_locks_monday_tuesday_wednesday` | Gói **4 ngày** khóa toàn bộ ngày bắt đầu vào Thứ 2, Thứ 3, Thứ 4 (cả `pick_in_person` và `transport_post`, checkout trả `409 Conflict`), mở Thứ 5 – Chủ Nhật; các gói `1`, `2`, `8` ngày vẫn đặt được vào Thứ 2–4 | **PASSED** |
| 6 | `test_one_day_gap_same_garment_constraint` | Endpoint `/availability` trả đúng `booked_dates` và `gap_dates`; chặn ngày sau `end_date` (`2027-01-02`) và ngày trước `start_date` (`2026-12-31`); cho phép từ `2027-01-03`; cho phép đặt áo khác cùng ngày; chặn 2 item cùng áo vi phạm giãn cách 1 ngày trong cùng 1 giỏ checkout (`409`) | **PASSED** |
| 7 | `test_guest_checkout_creates_booking_transaction_and_invoice` | Bắt buộc địa chỉ Úc cho `transport_post` (`400`); chặn `studio_pay` khi có `transport_post` (`400`); tạo `Booking` + `Transaction` AUD + HTML Invoice Email (`simulated_sent`); tra cứu hóa đơn công khai; chặn đặt trùng ngày gap (`409`); kiểm tra luồng `bank_transfer` trạng thái `pending` có thông tin PayID | **PASSED** |
| 8 | `test_admin_auth_upload_settings_garments_bookings_and_transactions` | Chặn truy cập không token (`401`) và sai mật khẩu (`401`); đăng nhập nhận Bearer JWT; cập nhật `site_settings`; upload ảnh PNG thành công & chặn `.exe` (`400`); tạo áo dài, chặn trùng code (`409`), xóa áo chưa có booking (`deleted`) và archive áo đã có booking (`archived`); hủy booking giải phóng ngày & 1-day gap; đổi transaction `pending -> paid` & gửi lại hóa đơn; đọc KPI AUD overview | **PASSED** |

---

## 3. Kết quả kiểm thử thực tế với PostgreSQL Local (`127.0.0.1:5432/stoe`)

Chạy trực tiếp server FastAPI kết nối vào PostgreSQL service local (không Docker):
* `GET /health` → `200 OK` (`healthy`)
* `GET /api/v1/site-settings` → `200 OK` (`Maison de Lua | /images/image.png | AUD | gap=1d`)
* `GET /api/v1/garments` → `200 OK` (`12` garments từ PostgreSQL)
* `GET /api/v1/garments/mdl-001/availability` → `200 OK` (`booked=5`, `gap=4`)
* `POST /api/v1/bookings/check-availability` (Transport Post 2 ngày) → `available: false` (đúng luật từ chối 1 & 2 ngày)
* `POST /api/v1/bookings/check-availability` (`mdl-001` ngày `2027-01-02`) → `available: false` (đúng luật giãn cách 1 ngày)
* `POST /api/v1/auth/login` + `GET /api/v1/admin/overview` → `200 OK` (`paid=205.45 AUD | bookings=3 | garments=12`)

---

## 4. Cách chạy lại toàn bộ kiểm thử Backend

```powershell
# Chạy riêng lint + pytest cho Backend:
.\backend\.venv\Scripts\ruff.exe check backend
.\backend\.venv\Scripts\pytest.exe backend/test -v

# Hoặc chạy toàn bộ Backend + Frontend qua script PowerShell:
.\runs\test.ps1
```

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-22 | notworLe | Antigravity | Ghi nhận kết quả kiểm thử Backend (ruff, 7/7 pytest, live PostgreSQL E2E) |
