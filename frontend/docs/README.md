---
title: Frontend Docs README
doc_type: readme
project: retail-system
layer: frontend
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-10
last_updated_by: Antigravity
version: 1.0.0
status: approved
reviewers: []
related_docs:
  - roadmap/ROADMAP.md
  - roadmap/0005-phase5.md
  - booking-tutorial.md
  - navigation-tutorial.md
  - ../../docs/BUSINESS_REQUIREMENT.md
tags: [frontend, docs, readme, tutorial, roadmap]
---

# Frontend Docs

Thư mục này chứa toàn bộ tài liệu kỹ thuật và hướng dẫn phát triển của frontend **LUA Studio**.

---

## 1. Mục lục Tài liệu

| File / Thư mục | Phân loại | Mô tả |
| :--- | :--- | :--- |
| [`roadmap/ROADMAP.md`](roadmap/ROADMAP.md) | **Lộ trình tổng** | Kế hoạch 6 giai đoạn phát triển toàn diện hệ thống từ setup đến launch |
| [`roadmap/0005-phase5.md`](roadmap/0005-phase5.md) | **ADR / Báo cáo** | Chi tiết kiến trúc Cart State (`useSyncExternalStore`), Track URL vi điểm, và Booking Engine |
| [`booking-tutorial.md`](booking-tutorial.md) | **Tutorial Newbie** | Cẩm nang nghiệp vụ đặt thuê áo dài: Lịch 4 ngày, buffer giặt hấp 6-7h, cảnh báo sau 21h, bảng số đo |
| [`navigation-tutorial.md`](navigation-tutorial.md) | **Tutorial Newbie** | Hướng dẫn hệ thống Desktop Header & Mobile Hamburger Drawer |
| [`../../docs/BUSINESS_REQUIREMENT.md`](../../docs/BUSINESS_REQUIREMENT.md) | **Nghiệp vụ gốc** | Đặc tả nghiệp vụ studio: Chặn trùng lịch Bạn A/Bạn B, phụ phí ngoài giờ, và quản lý độc bản |

---

## 2. Tiến độ triển khai các Giai đoạn

Xem chi tiết tại [`roadmap/ROADMAP.md`](roadmap/ROADMAP.md).

| # | Giai đoạn | Trọng tâm | Trạng thái |
|---|---|---|---|
| 1 | Setup & Design Tokens | Next.js 16, Tailwind CSS, Bảng màu lụa ngà (`#EDE7DA`), Font Jost & Cormorant | `Completed` |
| 2 | Module Architecture | Cấu trúc atom/blocks, Header, Footer, Section wrapper chuẩn hóa | `Completed` |
| 3 | Landing Page | Hero editorial, Bộ sưu tập tiêu biểu, Quy trình How-to-rent, Mobile Menu drawer | `Completed` |
| 4 | Shop & Archive | Trang `/product`, Phân trang Show More, Hợp nhất `/shop` vào `/product` | `Completed` |
| 5 | Booking Engine & Cart | Đặt lịch thuê 4 ngày, Khung giờ, Buffer vệ sinh 6-7h, Cảnh báo trả sau 21h, Cart Drawer | `Completed` |
| 6 | Documentation | Chuẩn hóa toàn bộ docs, ADR, Roadmaps và Tutorials theo quy ước `DOC.md` | `In Progress` |

---

## 3. Quy ước tài liệu

Mọi file `.md` trong thư mục này tuân theo chuẩn [`DOC.md`](../../.agents/rule/DOC.md):
- YAML front matter đầy đủ ở đầu file.
- Bảng **Lịch sử thay đổi** ở cuối file.
- Link nội bộ dùng đường dẫn tương đối.
- Không có secret, hex hardcode, hay đường dẫn tuyệt đối.

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo README mô tả cấu trúc docs và link đến roadmap |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Cập nhật tiến độ hoàn thành các Giai đoạn 1-5, bổ sung liên kết Booking Tutorial, Navigation Tutorial và Business Requirements |
