---
title: Frontend Roadmap — LUA Studio
doc_type: report
project: retail-system
layer: frontend
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-09
last_updated_by: Antigravity
version: 0.2.0
status: draft
reviewers: []
related_docs:
  - ../../README.md
  - ../../design-system/sunriseblooms/MASTER.md
  - ../../../.agents/rule/AI_DELEGATION_LOOP.md
  - ../../../.agents/rule/DOC.md
tags: [frontend, roadmap, nextjs, tailwind, lua-studio]
---

# Frontend Roadmap — LUA Studio

Lộ trình xây dựng frontend cho **LUA Studio** — boutique cho thuê áo dài editorial.
Stack: **Next.js (App Router) + TypeScript + Tailwind CSS**.
Design source of truth: [`design-system/sunriseblooms/MASTER.md`](../../design-system/sunriseblooms/MASTER.md).
Mỗi giai đoạn là một đơn vị giao việc độc lập theo [AI_DELEGATION_LOOP.md](../../../.agents/rule/AI_DELEGATION_LOOP.md).

---

## Tổng quan

| # | Giai đoạn | Layer | Autonomy | Trạng thái |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Setup project + Design Tokens | frontend | L2 | `To Do` |
| 2 | Module architecture + Base components | frontend | L2 | `To Do` |
| 3 | Homepage — Landing page | frontend | L2 | `To Do` |
| 4 | Shop / Collection page | frontend | L2 | `To Do` |
| 5 | Product page (booking + checkout) | frontend | L2 | `To Do` |
| 6 | Docs | frontend | L2 | `To Do` |

---

## Giai đoạn 1 — Setup Project + Design Tokens

**Mục tiêu:** Dựng Next.js + Tailwind, map toàn bộ token từ MASTER.md vào `tailwind.config.ts`. Không có hex nào trong component.

### Tokens cần map (từ MASTER.md)

| CSS Variable | Hex | Tailwind key |
| :--- | :--- | :--- |
| `--color-background` | `#EDE7DA` | `colors.brand.background` |
| `--color-card` | `#F4F1E9` | `colors.brand.card` |
| `--color-surface` | `#D6CFB0` | `colors.brand.surface` |
| `--color-foreground` | `#4A4535` | `colors.brand.foreground` |
| `--color-muted-foreground` | `#655F4D` | `colors.brand.muted` |
| `--color-border` | `#A09A8A` | `colors.brand.border` |
| `--color-input-border` | `#7A7461` | `colors.brand.inputBorder` |
| `--color-on-foreground` | `#EDE7DA` | `colors.brand.onForeground` |
| `--color-on-image` | `#FFFFFF` | `colors.brand.onImage` |
| `--color-accent-lavender` | `#D1C3DC` | `colors.brand.lavender` |
| `--color-accent-peach` | `#F2D1BC` | `colors.brand.peach` |
| `--color-accent-gold` | `#EBB658` | `colors.brand.gold` |
| `--color-accent-sage` | `#B6C09D` | `colors.brand.sage` |
| `--color-ring` | `#4A4535` | `colors.brand.ring` |

### Fonts

- **Heading:** Cormorant Garamond (400, 500, 600, italic) — via `next/font/google`
- **Body / UI:** Jost (300, 400, 500) — số, bảng size, form, checkout
- Heading: uppercase, `letter-spacing: 0.05em–0.1em`
- Nav / buttons: small uppercase, `letter-spacing: 0.1em`

### Quy tắc khác

- **Light mode only** — không cấu hình dark mode
- **Corners: square** — `border-radius: 0` cho tất cả buttons, inputs, cards
- **Chỉ 1 font set** — không trộn thêm font ngoài hai font trên

### Definition of Done

- [ ] `npm run dev` chạy được, không lỗi.
- [ ] Trang trắng hiện đúng màu `brand.background`.
- [ ] Cormorant Garamond + Jost render đúng.
- [ ] Không có hex hardcode trong bất kỳ component nào.
- [ ] `make lint-fe` sạch.

---

## Giai đoạn 2 — Module Architecture + Base Components

**Mục tiêu:** Cấu trúc folder scalable, tạo atom/layout/block components dùng token.

### Cấu trúc thư mục

```text
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout: font, metadata, nav, footer
│   ├── page.tsx                # Homepage
│   ├── shop/
│   │   └── page.tsx            # Collection grid
│   └── shop/[slug]/
│       └── page.tsx            # Product page
├── components/
│   ├── ui/                     # Atoms — không có business logic
│   │   ├── Button.tsx          # variant: primary | secondary | ghost
│   │   ├── Chip.tsx            # size selector, duration, delivery chips
│   │   ├── Input.tsx           # text input + select
│   │   ├── Accordion.tsx       # Delivery & Return, FAQs
│   │   └── Divider.tsx
│   ├── layout/
│   │   ├── Header.tsx          # Sticky nav, logo centered, cart icon
│   │   ├── Footer.tsx          # Studio info, social links, surface bg
│   │   └── Section.tsx         # max-w + px wrapper chuẩn hóa
│   └── blocks/                 # Page-level sections
│       ├── HeroSection.tsx
│       ├── IntroSection.tsx
│       ├── CollectionGrid.tsx
│       ├── ProductCard.tsx
│       ├── HowToRentSection.tsx
│       ├── ProductGallery.tsx
│       ├── SizeSelector.tsx
│       ├── RentalDuration.tsx
│       ├── AvailabilityCalendar.tsx
│       ├── DeliveryMethod.tsx
│       └── PriceBreakdown.tsx
├── lib/
│   ├── constants.ts            # NAV_LINKS, STUDIO_INFO
│   └── utils.ts                # cn() — clsx + tailwind-merge
└── types/
    └── index.ts                # Product, RentalOption, DeliveryMethod
```

### Nguyên tắc

- `ui/` — atom: nhận props, không gọi API, không có state phức tạp.
- `blocks/` — section-level: nhận data props, không tự fetch.
- `app/*/page.tsx` — Server Component, fetch data, compose blocks.
- Thêm tính năng → thêm block mới, không sửa block cũ.

### Definition of Done

- [ ] Cấu trúc folder đúng như trên.
- [ ] `Button.tsx`, `Chip.tsx`, `Input.tsx`, `Accordion.tsx` hoạt động với token màu.
- [ ] `Section.tsx` wrap đúng responsive padding.
- [ ] `cn()` helper hoạt động.
- [ ] `Header.tsx`: logo centered, 3 link trái, 3 link phải, cart icon phải, hamburger mobile.

---

## Giai đoạn 3 — Homepage

**Mục tiêu:** Build 4 section homepage theo MASTER.md Page Specs.

### Sections

| Section | Component | Chi tiết |
| :--- | :--- | :--- |
| Hero | `HeroSection` | Full-width editorial image, overlay `rgba(0,0,0,0.18)`, title + welcome statement, CTA "Xem bộ sưu tập" |
| Featured collection | `CollectionGrid` | 3–4 product cards: portrait photo + tên + giá thuê |
| How to Rent | `HowToRentSection` | 3–4 bước đánh số, thin-line SVG icons (Lucide) |
| Footer | `Footer` | Studio info, social links, nền `brand.surface` |

### Design rules từ MASTER.md

- Hero overlay: `rgba(0,0,0,0.18)`, chữ dùng `brand.onImage` (#FFF).
- Card: không shadow, không rounded corner, portrait photo.
- Icons: Lucide (thin-line SVG) — không dùng emoji.
- Hover image: `scale(1.03)` bên trong container clipped, 300–400ms.
- Fade-in on scroll: 300–400ms, `prefers-reduced-motion` respected.
- Section padding: `--space-2xl` (96px).

### Definition of Done

- [ ] 4 section render đúng trên 375px, 768px, 1024px, 1440px.
- [ ] Overlay hero đúng, text readable.
- [ ] Nav order: Home · Shop/Collection · How to Rent · Size Guide · FAQs · Contact.
- [ ] Không có hex hardcode.
- [ ] Ảnh có `alt` text mô tả.

---

## Giai đoạn 4 — Shop / Collection Page

**Mục tiêu:** Trang duyệt sản phẩm, image-led grid.

### Layout

- **Desktop:** 4 cột, gap generous.
- **Mobile:** 2 cột.
- Card: portrait photo + tên + giá thuê (nhỏ, dưới ảnh) — không shadow, không rounded.
- Filters: size, occasion, color — collapsible trên mobile.

### Definition of Done

- [ ] Grid responsive đúng 4 col / 2 col.
- [ ] Filter hoạt động (UI state, chưa cần API thật).
- [ ] Card không có shadow hay border-radius.
- [ ] `make lint-fe` sạch.

---

## Giai đoạn 5 — Product Page (Booking + Checkout)

**Mục tiêu:** Trang booking đầy đủ theo thứ tự MASTER.md.

### Thứ tự hiển thị

1. **Gallery** — ảnh lớn trái + thumbnails, desktop: image left / details right.
2. **Title block** — tên + giá thuê.
3. **Size selector** — chips, link Size Guide, bảng số đo (bust/waist/hip cm).
4. **Model info** — chiều cao + size mặc (nếu có).
5. **Rental duration** — chips (4 ngày / 8 ngày), giá cập nhật theo lựa chọn.
6. **Availability calendar** — chọn ngày giao + trả, ngày đã book: disabled + strikethrough/pattern (không dùng màu đơn thuần).
7. **Delivery method** — pickup tại studio / bưu điện (hiện phí khi chọn giao hàng).
8. **Price breakdown** — rental fee + delivery fee + total, cập nhật live.
9. **Primary button** — "Add to booking", disabled + thông báo rõ cho đến khi chọn đủ size + ngày + phương thức.
10. **Accordions** — Delivery & Return / FAQs.

### Quy tắc UX quan trọng

- Ngày giao chọn trước sự kiện 1–2 ngày.
- Ngày không khả dụng: strikethrough hoặc pattern — **không dùng màu đơn thuần** (accessibility).
- Button disabled phải có message rõ ràng, không chỉ nhạt màu.
- Chip selected: `background: brand.foreground`, `color: brand.onForeground`.
- Focus state: `outline: 2px solid brand.ring`, `outline-offset: 2px`.

### Definition of Done

- [ ] 10 phần hiển thị đúng thứ tự.
- [ ] Price breakdown cập nhật live khi đổi lựa chọn.
- [ ] Calendar: ngày disabled có strikethrough/pattern + aria label.
- [ ] Button disabled state rõ ràng + thông báo.
- [ ] Keyboard navigable: chips, calendar, accordion.
- [ ] `make lint-fe` sạch.

---

## Giai đoạn 6 — Documentation

**Mục tiêu:** Docs đủ để người mới vào hiểu hệ thống, chuẩn DOC.md.

### Files cần tạo / cập nhật

| File | Mô tả |
| :--- | :--- |
| `frontend/docs/design-system.md` | Giải thích token, typography, spacing, anti-patterns |
| `frontend/docs/architecture.md` | Cấu trúc module, cách thêm page / block mới |
| `frontend/docs/roadmap/ROADMAP.md` | File này |
| `frontend/README.md` | 3 lệnh chạy được + link đến docs |

### Definition of Done

- [ ] Mỗi file có YAML front matter + lịch sử thay đổi đúng chuẩn DOC.md.
- [ ] Link nội bộ dùng đường dẫn tương đối, trỏ đúng.
- [ ] Không có secret, hex hardcode, đường dẫn tuyệt đối.

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo roadmap 4 giai đoạn |
| 0.2.0 | 2026-11-09 | notworLe | Antigravity | Cập nhật theo MASTER.md mới: token đầy đủ, thêm Giai đoạn 4+5 (Shop + Product page), font Jost, chi tiết UX booking |
