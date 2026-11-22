---
title: "Change Report — Maison de Lua Fullstack Platform (2026-11-22)"
doc_type: report
project: retail-system
layer: all
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
  - ../BUSINESS_REQUIREMENT.md
  - ../../backend/docs/README.md
  - ../../backend/docs/TEST_REPORT.md
  - ../../frontend/docs/README.md
  - ../../frontend/docs/TEST_REPORT.md
  - ../../runs/README.md
  - ../../.agents/log/DECISION_LOG.md
tags: [change-report, maison-de-lua, fullstack, postgresql, fastapi, nextjs, admin, powershell]
---

# Báo Cáo Thay Đổi — Maison de Lua Fullstack Platform

**Ngày thực hiện:** `2026-11-22`  
**Stack giữ nguyên (theo R-04 / D-004):** PostgreSQL 17 · FastAPI (Python) · Next.js 16 + Tailwind CSS v4  
**Trạng thái Git (theo R-05 / L2):** Đã viết code, tài liệu và kiểm thử đầy đủ — **dừng trước `git commit` / `git push`**.

---

## 1. Tóm tắt các hạng mục đã hoàn thành

### 1.1 Thương hiệu, Ngôn ngữ & Đơn vị tiền tệ
* Đổi thương hiệu mặc định từ `LUA Studio` sang **`Maison de Lua`** (`maisondelua`) — lưu động trong bảng `site_settings` của PostgreSQL để Admin có thể thay đổi trực tiếp.
* Gắn logo [`frontend/public/images/image.png`](../../frontend/public/images/image.png) (`/images/image.png`) trên toàn bộ giao diện (Header desktop/mobile, MobileMenu, Spotlight monogram seal, Footer và Admin Console) với `mix-blend-multiply` trên nền Warm Ivory.
* Chuyển **100% giao diện Storefront, bộ lọc, dữ liệu áo dài, checkout, hóa đơn email và Admin Console sang Tiếng Anh**.
* Loại bỏ hoàn toàn hiển thị `VND`; thống nhất **duy nhất đơn vị Đô la Úc (`AUD`)** xuyên suốt hệ thống.

### 1.2 Luật nghiệp vụ Đặt thuê & Guest Checkout (Khớp sơ đồ luồng)
1. **2 hình thức giao nhận (`Post`)**:
   * **`Pick in Person`** (`pick_in_person`, `$0.00 AUD`): hỗ trợ **tất cả các gói thời gian `1, 2, 4, 8` ngày**; phụ phí trả sau 21:00 (`+$20.00 AUD`, chỉnh được trong Admin).
   * **`Transport Post`** (`transport_post`, mặc định `+$16.95 AUD`): **chỉ cho phép gói `4` và `8` ngày** (`1` và `2` ngày bị vô hiệu hóa trên UI và bị Backend từ chối).
2. **Khóa Thứ 2, Thứ 3, Thứ 4 cho gói 4 ngày (`gói 4 ngày lock thứ 2 3 4`)**:
   * Thực thi đồng bộ ở cả **Backend** (`FOUR_DAY_LOCKED_WEEKDAYS = (0, 1, 2)` trong `backend/app/services/booking_rules.py`) và **Frontend** (`isWeekdayLockedForPackage()` trong `frontend/src/lib/constants.ts` & lịch tháng `ProductBookingInteractive.tsx`).
   * Khi chọn gói `4 Days`, toàn bộ ô **Monday, Tuesday, Wednesday** bị khóa bấm kèm nhãn `Lock` và cảnh báo hướng dẫn chọn **Thursday – Sunday**. Checkout gửi ngày Thứ 2–4 cho gói 4 ngày bị trả về `HTTP 409 Conflict`.
   * Các gói `1`, `2`, `8` ngày vẫn đặt được bình thường vào Thứ 2–4.
3. **Ràng buộc giãn cách 1 ngày cùng loại áo**:
   * Mọi booking chưa hủy của cùng `garment_id` bắt buộc có tối thiểu **1 ngày đệm** (`turnaround_gap_days = 1`) cả trước lẫn sau để vệ sinh/giặt hấp.
   * Áp dụng với booking trong PostgreSQL lẫn nhiều mục cùng áo trong cùng 1 giỏ checkout. Hủy booking trong Admin lập tức giải phóng ngày và ngày giãn cách.
4. **Guest Checkout, Thanh toán & Gửi hóa đơn Email (`/checkout`)**:
   * Khách vãng lai đặt thuê không cần tài khoản; tự động bắt buộc địa chỉ tại Úc nếu có item dùng `Transport Post`.
   * Hỗ trợ 3 phương thức thanh toán AUD (`Card`, `Bank Transfer / PayID`, `Studio Pay` cho Pick in Person).
   * Tự động tạo `Booking` + `Transaction`, sinh hóa đơn HTML (`INV-MDL-...`) và gửi qua SMTP (`SMTP_HOST` trong `.env`) hoặc lưu bản preview HTML (`simulated_sent`) để xem và in trực tiếp.

### 1.3 Backend FastAPI + PostgreSQL (`backend/`)
* Xây dựng đầy đủ 5 bảng ORM trong PostgreSQL (`site_settings`, `admin_users`, `garments`, `bookings`, `transactions`) cùng script seed dữ liệu idempotent (`backend/app/seed.py`).
* Xây dựng hệ thống xác thực Admin (`PBKDF2-SHA256` + `HMAC-SHA256` Bearer JWT) và endpoint upload ảnh media (`POST /api/v1/admin/upload`, phục vụ qua `/uploads/...`).
* Tự động đọc `.env` gốc bằng `python-dotenv` trong `backend/app/config.py`.

### 1.4 Giao diện Admin Console (`/admin`)
* Màn hình đăng nhập Admin (`admin@maisondelua.com.au` / `admin123`) tách biệt chrome Storefront qua `StorefrontShell`.
* 5 phân hệ quản trị:
  1. **Overview**: KPI doanh thu Paid/Pending AUD, số booking active, áo dài, hóa đơn.
  2. **Website Info**: Sửa tên web, handle, upload/đổi logo, Hero/About/Spotlight/MetadataBar, liên hệ/Bank/PayID và phí AUD/turnaround gap.
  3. **Ao Dai Catalog**: CRUD đầy đủ, upload nhiều ảnh, giá 4 ngày AUD, bảng size/số đo cm, tự chuyển `archived` nếu áo đã có lịch sử booking.
  4. **Bookings**: Tìm kiếm, lọc trạng thái, xem chi tiết lịch + ngày gap + địa chỉ ship, cập nhật trạng thái booking.
  5. **Transactions**: Tổng hợp Paid/Pending/Refunded AUD, cập nhật trạng thái thanh toán (tự xác nhận booking `pending` khi chuyển `paid`), xem trước HTML hóa đơn và gửi lại email.

### 1.5 Khắc phục CSS Tailwind v4 trên Windows & Bộ script chạy local `runs/`
* **Khắc phục mất CSS trên Windows `--webpack`**: Cài `@tailwindcss/postcss`, tạo `frontend/postcss.config.mjs` và gỡ rule `turbopack.rules` cũ khỏi `frontend/next.config.ts` → biên dịch thành công đầy đủ bundle Tailwind CSS v4 (`49,775 bytes`).
* **Bộ runner Windows PowerShell không cần Docker (`runs/*.ps1`)**:
  * Tạo 7 script thuần ASCII tương thích Windows PowerShell 5.1 & 7 (`_common.ps1`, `setup.ps1`, `start-app.ps1`, `backend.ps1`, `frontend.ps1`, `stop-app.ps1`, `test.ps1`).
  * Hỗ trợ tự nạp `.env`, tự kiểm tra & tạo database `stoe` trên PostgreSQL local nếu chưa có, mở gộp 1 cửa sổ (tự dọn tiến trình khi `Ctrl+C`) hoặc 2 cửa sổ riêng (`-NewWindows`), và giải phóng port `8000`/`3000`.

---

## 2. Danh mục file thay đổi

### 2.1 Backend (`backend/`)
| Trạng thái | Đường dẫn | Mô tả |
| :---: | :--- | :--- |
| Modified | `backend/main.py` | FastAPI app factory, CORS, StaticFiles `/uploads`, lifespan init DB + seed |
| Modified | `backend/pyproject.toml`, `backend/Dockerfile`, `backend/.gitignore` | Khai báo dependencies (`sqlalchemy`, `psycopg[binary]`, `python-dotenv`, `python-multipart`, `httpx`, `ruff`, `pytest`) & ignore `uploads/` |
| Added | `backend/app/config.py`, `database.py`, `models.py`, `schemas.py`, `security.py`, `seed.py` | Cấu hình `.env`, engine PostgreSQL, 5 bảng ORM, Pydantic v2 schemas, Admin JWT/PBKDF2, seed Maison de Lua |
| Added | `backend/app/services/booking_rules.py`, `email_service.py` | Luật Pick in Person / Transport Post, khóa Thứ 2–4 gói 4 ngày, giãn cách 1 ngày, tính giá AUD, hóa đơn HTML & SMTP |
| Added | `backend/app/routers/public.py`, `auth.py`, `admin.py` | Toàn bộ REST APIs Public Storefront, Auth và Admin Console |
| Added | `backend/test/test_api.py` | 7 nhóm test E2E (tổng 8/8 test cases cùng `connection_test.py`) |
| Added | `backend/docs/README.md`, `API_REFERENCE.md`, `DATABASE_AND_RULES.md`, `TEST_REPORT.md` | Bộ tài liệu kỹ thuật & báo cáo kiểm thử Backend |

### 2.2 Frontend (`frontend/`)
| Trạng thái | Đường dẫn | Mô tả |
| :---: | :--- | :--- |
| Added | `frontend/postcss.config.mjs` | Cấu hình chuẩn Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Modified | `frontend/next.config.ts`, `frontend/package.json`, `frontend/package-lock.json` | Thêm `@tailwindcss/postcss`, `images.unoptimized`, rewrite `/uploads/:path*` |
| Added | `frontend/src/lib/api.ts`, `frontend/src/context/SiteSettingsContext.tsx` | API client đầy đủ (Public + Admin) và Context đồng bộ cấu hình website |
| Added | `frontend/src/components/layout/StorefrontShell.tsx`, `frontend/src/components/blocks/ProductDetailClient.tsx` | Tách chrome Storefront khỏi `/admin` & tải dữ liệu sản phẩm động |
| Added | `frontend/src/app/checkout/page.tsx`, `frontend/src/app/size-guide/page.tsx`, `frontend/src/app/admin/page.tsx` | Trang Guest Checkout AUD, Process & Size Guide, và Admin Studio Console |
| Added | `frontend/src/components/admin/AdminSettingsTab.tsx`, `AdminGarmentsTab.tsx`, `AdminBookingsTab.tsx`, `AdminTransactionsTab.tsx` | 4 module giao diện quản trị (Cài đặt web, Áo dài, Booking, Giao dịch & Hóa đơn) |
| Modified | `frontend/src/types/index.ts`, `lib/constants.ts`, `context/CartContext.tsx`, `data/products.ts`, `data/bookings.ts` | Chuyển toàn bộ types/hằng số/giỏ hàng sang 100% English + AUD + luật khóa Thứ 2–4 gói 4 ngày + giãn cách 1 ngày |
| Modified | `frontend/src/app/layout.tsx`, `product/page.tsx`, `product/[slug]/page.tsx`, toàn bộ `components/layout/*`, `components/sections/*`, `components/blocks/*`, `components/cart/CartDrawer.tsx` | Brand Maison de Lua, logo `/images/image.png`, 100% English, AUD-only, lịch booking mới |
| Added/Modified | `frontend/docs/README.md`, `FEATURES_AND_FLOWS.md`, `TEST_REPORT.md` | Tài liệu kiến trúc tính năng & báo cáo kiểm thử Frontend |

### 2.3 Ops, Cấu hình & Tài liệu gốc
| Trạng thái | Đường dẫn | Mô tả |
| :---: | :--- | :--- |
| Added | `runs/_common.ps1`, `setup.ps1`, `start-app.ps1`, `backend.ps1`, `frontend.ps1`, `stop-app.ps1`, `test.ps1`, `runs/README.md` | Bộ script chạy local Windows PowerShell không cần Docker + tài liệu mô tả module |
| Modified | `.env.example`, `compose.yml`, `README.md`, `docs/BUSINESS_REQUIREMENT.md`, `.agents/log/DECISION_LOG.md` | Cập nhật biến môi trường, hướng dẫn chạy, đặc tả nghiệp vụ v2.0 và ghi nhận đề xuất `D-026` |
| Added | `docs/plans/README.md`, `docs/plans/2026-11-22-maisondelua-fullstack-change-report.md` | Báo cáo tổng hợp thay đổi (tài liệu này) |

---

## 3. Kết quả kiểm thử sau lần cập nhật cuối

| Hạng mục | Lệnh kiểm tra | Kết quả |
| :--- | :--- | :---: |
| **Backend Lint** | `backend\.venv\Scripts\ruff.exe check backend` | **PASS (0 errors)** |
| **Backend Test Suite** | `backend\.venv\Scripts\pytest.exe backend/test -v` | **PASS (8/8 passed, 3.71s)** — bao gồm test khóa Thứ 2–4 gói 4 ngày & giãn cách 1 ngày |
| **Frontend Lint** | `npm --prefix frontend run lint` | **PASS (0 errors, 0 warnings)** |
| **Frontend Typecheck** | `npx tsc --noEmit` | **PASS (0 errors)** |
| **Frontend Production Build** | `npx next build --webpack` | **PASS (11/11 routes, CSS bundle Tailwind v4 49.7 KB)** |
| **Live Fullstack E2E (PostgreSQL)** | FastAPI `:8000` + PostgreSQL `stoe` + Next.js `:3000` | **PASS (toàn bộ API & 6 routes + CSS + logo HTTP 200)** |
| **PowerShell 5.1 Scripts** | AST parser + ASCII audit trên `runs/*.ps1` | **PASS (7/7 scripts)** |

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-22 | notworLe | Antigravity | Lập báo cáo tổng hợp toàn bộ thay đổi fullstack Maison de Lua, luật khóa Thứ 2–4 gói 4 ngày, bộ runner `runs/` và kết quả kiểm thử |
