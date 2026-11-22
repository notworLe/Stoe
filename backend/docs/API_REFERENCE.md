---
title: "Backend API Reference — Maison de Lua"
doc_type: reference
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
  - DATABASE_AND_RULES.md
  - TEST_REPORT.md
tags: [api, fastapi, openapi, endpoints, admin, checkout, aud]
---

# Backend API Reference

Base URL mặc định local: `http://localhost:8000`  
Định dạng dữ liệu: `application/json` (trừ upload ảnh dùng `multipart/form-data`).  
Đơn vị tiền tệ xuyên suốt toàn bộ API: **`AUD`**.

---

## 1. Health Endpoints

| Method | Path | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/` | Public | Trả về thông tin dịch vụ (`Maison de Lua API`, `currency: AUD`) |
| `GET` | `/health` | Public | Kiểm tra tình trạng server (`{"status": "healthy"}`) |

---

## 2. Public Storefront API (`/api/v1`)

| Method | Path | Query / Body | Mô tả & Quy tắc |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/site-settings` | — | Trả về cấu hình website hiện tại (`site_name`, `site_handle`, `logo_url`, Hero, About, Spotlight, MetadataBar, liên hệ, ngân hàng/PayID, phí `transport_post_fee_aud`, `after_hours_fee_aud`, `turnaround_gap_days`) |
| `GET` | `/api/v1/garments` | `?occasion=&size=&color=&search=` | Liệt kê tất cả áo dài đang hoạt động (`is_active = true`) |
| `GET` | `/api/v1/garments/{slug_or_id}` | Path param | Lấy chi tiết 1 mẫu áo dài theo `slug` hoặc `id` (`404` nếu không tồn tại hoặc đã archive) |
| `GET` | `/api/v1/garments/{garment_id}/availability` | Path param | Trả về danh sách booking chưa hủy, mảng `booked_dates` và mảng `gap_dates` (ngày giãn cách 1 ngày trước & sau mỗi booking) |
| `POST` | `/api/v1/bookings/check-availability` | `AvailabilityCheckRequest` | Kiểm tra hợp lệ hình thức nhận (`pick_in_person` / `transport_post`), gói ngày (`1/2/4/8`), size, giờ nhận/trả, xung đột giãn cách 1 ngày và trả về breakdown giá AUD |
| `POST` | `/api/v1/checkout` | `GuestCheckoutRequest` | **Guest Checkout** (không cần đăng nhập): kiểm tra toàn bộ item (kể cả xung đột giữa các item cùng mã áo trong cùng giỏ hàng), tạo `Booking` + `Transaction` AUD, sinh mã hóa đơn `INV-MDL-...` và gửi email hóa đơn |
| `GET` | `/api/v1/invoices/{invoice_number}` | Path param | Tra cứu hóa đơn & danh sách booking theo số hóa đơn |

### Ví dụ Payload `POST /api/v1/checkout`
```json
{
  "customer_name": "Olivia Smith",
  "customer_email": "olivia@example.com.au",
  "customer_phone": "+61 400 123 456",
  "shipping_address": "18 Collins Street, Melbourne VIC 3000",
  "payment_method": "card",
  "card_last4": "4242",
  "items": [
    {
      "garment_id": "mdl-004",
      "size_label": "S",
      "delivery_method": "transport_post",
      "rental_days": 4,
      "start_date": "2027-03-10",
      "pickup_time": "09:00 AM",
      "return_time": "05:00 PM"
    }
  ]
}
```

### Mã lỗi chính trên Storefront API
* `400 Bad Request`: Thiếu địa chỉ giao hàng khi dùng `transport_post`, hoặc chọn `studio_pay` khi có item `transport_post`.
* `404 Not Found`: Không tìm thấy áo dài hoặc hóa đơn.
* `409 Conflict`: Trùng lịch thuê, vi phạm ràng buộc **giãn cách 1 ngày cùng loại áo**, hoặc chọn gói `1`/`2` ngày với `transport_post`.

---

## 3. Admin Authentication API (`/api/v1/auth`)

| Method | Path | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập bằng `email` & `password` → trả về `access_token` (HMAC-SHA256 JWT, hết hạn sau `TOKEN_TTL_HOURS=24`) và object `admin` |
| `GET` | `/api/v1/auth/me` | Bearer | Xác thực phiên đăng nhập hiện tại của Admin (`401` nếu thiếu/hết hạn token) |

---

## 4. Admin Management API (`/api/v1/admin`)

Tất cả endpoint dưới đây bắt buộc header `Authorization: Bearer <access_token>`.

| Nhóm | Method | Path | Mô tả |
| :--- | :--- | :--- | :--- |
| **Tổng quan** | `GET` | `/api/v1/admin/overview` | Trả về KPI AUD (`paid_revenue_aud`, `pending_revenue_aud`, tổng/active bookings, tổng/active garments, tổng transactions) |
| **Cài đặt Web** | `PUT` | `/api/v1/admin/site-settings` | Cập nhật tên web, handle, logo, nội dung Hero/About/Spotlight/MetadataBar, địa chỉ, email, Bank/PayID, phí AUD & số ngày giãn cách |
| **Upload ảnh** | `POST` | `/api/v1/admin/upload` | Upload ảnh (`png`, `jpg`, `jpeg`, `webp`, `svg`, tối đa 8MB) → lưu vào `backend/uploads/` và trả về `{"url": "/uploads/<file>"}` |
| **Quản lý Áo** | `GET` | `/api/v1/admin/garments` | Liệt kê toàn bộ áo dài (bao gồm cả áo đã archived) |
| **Quản lý Áo** | `POST` | `/api/v1/admin/garments` | Thêm áo dài mới (kiểm tra trùng `code` và `slug` → `409`) |
| **Quản lý Áo** | `PUT` | `/api/v1/admin/garments/{garment_id}` | Sửa thông tin, giá AUD, ảnh, kích cỡ/số đo cm, trạng thái hiển thị |
| **Quản lý Áo** | `DELETE` | `/api/v1/admin/garments/{garment_id}` | Xóa hẳn nếu chưa có booking; nếu đã có booking lịch sử thì tự động chuyển `is_active = false` (`action: "archived"`) để bảo toàn dữ liệu giao dịch |
| **Quản lý Booking** | `GET` | `/api/v1/admin/bookings` | Lọc theo `?status=` và tìm kiếm `?q=` (mã booking, tên/email khách, mã áo) |
| **Quản lý Booking** | `PATCH` | `/api/v1/admin/bookings/{booking_id}` | Cập nhật trạng thái (`pending`, `confirmed`, `active`, `returned`, `cancelled`) và `notes`. Khi đổi sang `cancelled`, lịch & ngày giãn cách lập tức được giải phóng |
| **Giao dịch & Hóa đơn** | `GET` | `/api/v1/admin/transactions` | Lọc theo `?status=` và tìm kiếm `?q=` (số hóa đơn, mã giao dịch, khách hàng) |
| **Giao dịch & Hóa đơn** | `PATCH` | `/api/v1/admin/transactions/{transaction_id}` | Cập nhật trạng thái thanh toán (`paid`, `pending`, `refunded`, `failed`). Khi chuyển sang `paid`, các booking `pending` liên kết sẽ tự động xác nhận (`confirmed`) |
| **Giao dịch & Hóa đơn** | `POST` | `/api/v1/admin/transactions/{transaction_id}/resend-invoice` | Tạo lại HTML hóa đơn theo cấu hình web mới nhất và gửi lại email cho khách |

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-22 | notworLe | Antigravity | Khởi tạo đặc tả chi tiết toàn bộ Backend REST API Maison de Lua |
