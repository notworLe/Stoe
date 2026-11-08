---
title: Frontend Roadmap — LUA Studio Landing Page
doc_type: report
project: retail-system
layer: frontend
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-08
last_updated_by: Antigravity
version: 0.1.0
status: draft
reviewers: []
related_docs:
  - ../design-system.md
  - ../../.agents/rule/AI_DELEGATION_LOOP.md
  - ../../.agents/rule/DOC.md
tags: [frontend, roadmap, nextjs, tailwind, landing-page, lua-studio]
---

# Frontend Roadmap — LUA Studio Landing Page

Lộ trình xây dựng landing page cho **LUA Studio** — floral design studio (cho thuê áo dài editorial).  
Stack: **Next.js (App Router) + TypeScript + Tailwind CSS**.  
Mỗi giai đoạn là một đơn vị giao việc độc lập theo [AI_DELEGATION_LOOP.md](../../.agents/rule/AI_DELEGATION_LOOP.md).

---

## Tổng quan

| Giai đoạn | Tên | Layer | Autonomy | Trạng thái |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Setup project + Design Tokens | frontend | L2 | `To Do` |
| 2 | Module architecture + Base components | frontend | L2 | `To Do` |
| 3 | Landing page sections | frontend | L2 | `To Do` |
| 4 | Docs | frontend | L2 | `To Do` |

---

## Giai đoạn 1 — Setup Project + Design Tokens

**Mục tiêu:** Dựng Next.js + Tailwind, map toàn bộ color token vào theme — không có hex nào hardcode trong component.

### Việc cần làm

1. Khởi tạo project: `npx create-next-app@latest` với TypeScript + Tailwind + App Router.
2. Map 6 token từ `frontend/main.css` vào `tailwind.config.ts`:

| Token name | Hex | Tailwind key |
| :--- | :--- | :--- |
| `--bg` | `#EAE3D3` | `colors.brand.bg` |
| `--surface` | `#CFC7A2` | `colors.brand.surface` |
| `--border` | `#8F8875` | `colors.brand.border` |
| `--text` | `#4A4535` | `colors.brand.text` |
| `--accent-lavender` | `#C9B8D6` | `colors.brand.lavender` |
| `--accent-peach` | `#F0C9B0` | `colors.brand.peach` |

3. Import font **Cormorant Garamond** từ Google Fonts qua `next/font/google`.
4. Đặt `font-family: serif` mặc định cho `html` body — heading viết hoa, `letter-spacing: 0.05–0.1em`, đoạn italic.
5. Chỉ **light mode** — không cấu hình dark mode (theo `frontend/README.md`).

### Definition of Done

- [ ] `npm run dev` chạy được, không lỗi.
- [ ] Trang trắng hiện đúng màu `brand.bg` (#EAE3D3).
- [ ] Font Cormorant Garamond render đúng trên heading.
- [ ] Không có hex nào hardcode trong component (chỉ `text-brand-text`, `bg-brand-surface`...).

---

## Giai đoạn 2 — Module Architecture + Base Components

**Mục tiêu:** Thiết kế cấu trúc folder scalable, tạo các atom/layout component dùng chung.

### Cấu trúc thư mục

```text
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (font, metadata)
│   └── page.tsx            # Home page — compose các blocks
├── components/
│   ├── ui/                 # Atoms (không có business logic)
│   │   ├── Button.tsx
│   │   ├── Divider.tsx
│   │   └── Badge.tsx
│   ├── layout/             # Structural components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Section.tsx     # Wrapper chuẩn hoá padding/max-width
│   └── blocks/             # Page-level sections (compose ui/ + layout/)
│       ├── HeroSection.tsx
│       ├── IntroSection.tsx
│       ├── CollectionGrid.tsx
│       ├── HowToRentSection.tsx
│       └── ContactSection.tsx
├── lib/
│   ├── constants.ts        # NAV_LINKS, STUDIO_INFO...
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
└── types/
    └── index.ts            # ProductCard, RentalOption...
```

### Nguyên tắc module

- `ui/` — **atom only**: nhận props, không gọi API, không có state phức tạp.
- `blocks/` — **section-level**: có thể nhận data props, không tự fetch.
- `app/page.tsx` — compose blocks, fetch data nếu cần (Server Component).
- Thêm tính năng mới → thêm block mới, không sửa block cũ (Open/Closed principle).

### Definition of Done

- [ ] Cấu trúc folder đúng như trên.
- [ ] `Section.tsx` wrap đúng `max-w` và `px` responsive.
- [ ] `Button.tsx` nhận `variant: 'primary' | 'ghost'`, dùng token màu.
- [ ] `cn()` helper hoạt động.

---

## Giai đoạn 3 — Landing Page Sections

**Mục tiêu:** Build 5 section theo `frontend/README.md`, đủ content, responsive 375px → 1440px.

### Danh sách sections

| Section | Component | Nội dung chính |
| :--- | :--- | :--- |
| Hero | `HeroSection` | Ảnh editorial full-width, tagline, CTA "Xem bộ sưu tập" |
| Welcome | `IntroSection` | Short statement giới thiệu LUA Studio, 2–3 câu |
| Collection | `CollectionGrid` | 3–4 card áo dài nổi bật (ảnh + tên + giá thuê) |
| How to Rent | `HowToRentSection` | 3 bước: Chọn → Đặt lịch → Nhận đồ |
| Footer | `Footer` | Logo, nav, studio info, social links |

### Design rules (theo README + design system)

- Ảnh hero: `object-cover`, overlay `rgba(0,0,0,0.15)` để chữ đọc được.
- Heading: Cormorant Garamond, uppercase, `tracking-widest`.
- Chữ body: italic cho tagline, regular cho mô tả.
- Contrast tối thiểu 4.5:1 cho text thường (`#4A4535` trên `#EAE3D3` ✅).
- Nút trên `surface` (`#CFC7A2`): kiểm tra contrast trước khi dùng chữ nhạt.
- Spacing: generous — section padding `py-24` trở lên.
- Không dùng emoji làm icon — dùng SVG từ Phosphor Icons.

### Definition of Done

- [ ] 5 section render đúng trên 375px, 768px, 1440px.
- [ ] Không có hex hardcode trong JSX/TSX.
- [ ] Ảnh có `alt` text mô tả.
- [ ] `make lint-fe` sạch (eslint + tsc).

---

## Giai đoạn 4 — Documentation

**Mục tiêu:** Viết docs đủ để người mới vào hiểu hệ thống, chuẩn `DOC.md`.

### Files cần tạo

| File | Mô tả |
| :--- | :--- |
| `frontend/docs/design-system.md` | Token màu, typography, spacing scale, anti-patterns |
| `frontend/docs/architecture.md` | Giải thích cấu trúc module, cách thêm section mới |
| `frontend/docs/roadmap/ROADMAP.md` | File này |
| `frontend/README.md` | Cập nhật: 3 lệnh chạy được, link đến docs |

### Definition of Done

- [ ] Mỗi file có YAML front matter đầy đủ theo chuẩn `DOC.md`.
- [ ] Mỗi file có bảng **Lịch sử thay đổi** cuối file.
- [ ] Link nội bộ dùng đường dẫn tương đối, chạy được.
- [ ] Không có secret, hex hardcode, hay đường dẫn tuyệt đối.

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo roadmap 4 giai đoạn cho LUA Studio landing page |
