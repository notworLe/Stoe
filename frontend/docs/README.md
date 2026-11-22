---
title: "Frontend Docs README — Maison de Lua Storefront & Admin Console"
doc_type: readme
project: retail-system
layer: frontend
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-22
last_updated_by: Antigravity
version: 2.0.0
status: active
reviewers: []
related_docs:
  - FEATURES_AND_FLOWS.md
  - TEST_REPORT.md
  - roadmap/ROADMAP.md
  - roadmap/0005-phase5.md
  - booking-tutorial.md
  - navigation-tutorial.md
  - ../../docs/BUSINESS_REQUIREMENT.md
  - ../../backend/docs/README.md
tags: [frontend, docs, readme, maison-de-lua, nextjs, tailwind, aud, admin]
---

# Frontend Docs — Maison de Lua (`maisondelua`)

Thư mục tài liệu kỹ thuật cho ứng dụng **Next.js 16 + React 19 + Tailwind CSS v4 (PostCSS)** của **Maison de Lua** (Melbourne, Australia) — bao gồm toàn bộ **Storefront tiếng Anh (AUD)** và **Admin Console (`/admin`)**.

---

## 1. Mục lục tài liệu (`frontend/docs/`)

| File / Thư mục | Phân loại | Mô tả |
| :--- | :--- | :--- |
| [`FEATURES_AND_FLOWS.md`](FEATURES_AND_FLOWS.md) | **Kiến trúc & Tính năng (Mới)** | Bản đồ toàn bộ routes (`/`, `/product`, `/product/[slug]`, `/size-guide`, `/checkout`, `/admin`), Contexts, API client, luồng Guest Booking và 5 tab Admin Console |
| [`TEST_REPORT.md`](TEST_REPORT.md) | **Báo cáo kiểm thử (Mới)** | Kết quả thực tế `eslint`, `tsc --noEmit`, `next build --webpack`, xác minh Tailwind CSS v4 bundle và kiểm thử live HTTP/DOM |
| [`roadmap/ROADMAP.md`](roadmap/ROADMAP.md) | **Lộ trình gốc** | Lộ trình 6 giai đoạn xây dựng giao diện editorial |
| [`roadmap/0005-phase5.md`](roadmap/0005-phase5.md) | **Báo cáo Phase 5** | Kiến trúc `CartContext` (`useSyncExternalStore`) và Booking Engine |
| [`booking-tutorial.md`](booking-tutorial.md) | **Tutorial** | Tài liệu lịch sử về nghiệp vụ đặt thuê áo dài |
| [`navigation-tutorial.md`](navigation-tutorial.md) | **Tutorial** | Hướng dẫn Header & MobileMenu Portal |
| [`../../docs/BUSINESS_REQUIREMENT.md`](../../docs/BUSINESS_REQUIREMENT.md) | **Nghiệp vụ gốc** | Đặc tả nghiệp vụ v2.0 (Maison de Lua, English, AUD, 1-day gap, Admin) |

---

## 2. Stack & Cấu hình kỹ thuật Frontend

* **Framework**: Next.js `16.4.5` (App Router, `cacheComponents: true` / PPR), React `19.3.0`, TypeScript `5`.
* **Styling**: Tailwind CSS `v4` qua [`postcss.config.mjs`](../postcss.config.mjs) (`@tailwindcss/postcss`), hoạt động ổn định cả chế độ `--webpack` (Windows local) và Turbopack (Linux/CI).
* **Design System**: Warm Ivory (`#EDE7DA`), Card (`#F4F1E9`), Surface (`#D6CFB0`), Charcoal (`#4A4535`), Sage (`#B6C09D`); góc vuông (`rounded-none`); font `Cormorant Garamond` + `Jost`; không hardcode mã hex trong TSX.
* **Logo mặc định**: [`/images/image.png`](../public/images/image.png) hiển thị với `mix-blend-multiply` và có thể đổi/upload trực tiếp từ `/admin`.
* **Proxy Media Upload**: [`next.config.ts`](../next.config.ts) rewrite `/uploads/:path*` sang Backend API (`INTERNAL_API_URL`) để hiển thị ảnh Admin tải lên.

---

## 3. Khởi chạy & Kiểm thử trên Windows PowerShell

```powershell
# Chạy riêng Frontend (Port 3000)
.\runs\frontend.ps1

# Hoặc chạy đồng thời Backend + Frontend
.\runs\start-app.ps1

# Chạy lint, typecheck & production build
.\runs\test.ps1
```

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 2.0.0 | 2026-11-22 | notworLe | Antigravity | Cập nhật toàn bộ tài liệu Frontend cho Maison de Lua (English, AUD, PostCSS Tailwind v4, Guest Checkout, Admin Console) |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Cập nhật tiến độ hoàn thành các Giai đoạn 1-5, bổ sung liên kết tutorials |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo README mô tả cấu trúc docs và link đến roadmap |
