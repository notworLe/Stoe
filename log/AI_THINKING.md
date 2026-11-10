---
title: "AI Thinking & Mental Model — retail-system"
doc_type: architecture
project: retail-system
layer: all
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-10
updated: 2026-11-10
last_updated_by: Antigravity
version: 1.0.0
status: active
reviewers: []
related_docs:
  - DECISION_LOG.md
  - ERROR.log
  - ../frontend/docs/roadmap/ROADMAP.md
  - ../frontend/design-system/sunriseblooms/MASTER.md
  - ../frontend/docs/navigation-tutorial.md
tags: [ai-agent, mental-model, memory, architecture, context-handoff, lua-studio]
---

# AI Thinking & Mental Model — retail-system

> **DÀNH CHO AI AGENT KẾ NHIỆM:**  
> Nếu bạn là một AI Agent mới (Antigravity, Claude, GPT, hay bất kỳ model nào) vừa tiếp quản phiên làm việc này, **HÃY ĐỌC FILE NÀY ĐẦU TIÊN**.  
> File này ghi lại toàn bộ **luồng tư duy, bản đồ nhận thức, triết lý thiết kế và những bài học xương máu** của AI Agent tiền nhiệm, giúp bạn ngay lập tức bắt nhịp chính xác mà không làm vỡ dự án hay lặp lại các sai lầm cũ.

---

## 1. Bản sắc dự án & Triết lý Thiết kế (Core Identity)

* **Dự án**: **LUA STUDIO** (`seeling-system` / `retail-system`).
* **Lĩnh vực**: Cho thuê áo dài phong cách editorial đương đại tại Melbourne, Australia.
* **Tôn chỉ thẩm mỹ (Bất biến theo `MASTER.md`)**:
  * **Tone màu**: Tham chiếu từ bảng màu Sunrise Blooms — màu kem ngà ấm áp (`#EDE7DA`), màu bề mặt sage (`#D6CFB0`), màu chữ than ấm (`#4A4535`).
  * **Tuyệt đối KHÔNG**: Không có Dark Mode, không dùng màu đen/trắng tinh khiết (`#000` / `#FFF`), không có bo tròn góc (`border-radius: 0` trên mọi nút, card, input).
  * **Typography**: Bắt buộc chỉ dùng 2 font:
    * `Cormorant Garamond`: Cho tiêu đề lớn, logo, câu quote in nghiêng.
    * `Jost`: Cho văn bản đọc, menu, bảng size, thông tin sản phẩm.
  * **Quy tắc Token màu**: Không bao giờ hardcode mã màu hex trong component. Luôn dùng token Tailwind chuẩn (`bg-brand-background`, `text-brand-foreground`, `bg-brand-surface`...).

---

## 2. Bản đồ Kiến trúc Frontend (Architectural Mental Model)

```text
frontend/src/
├── app/
│   ├── globals.css           # Cấu hình Token @theme (chú ý namespace --space-*)
│   ├── layout.tsx            # Header + Children + Footer
│   ├── page.tsx              # Landing Page (100% Server Component, Static Prerender)
│   ├── product/              # Phase 4: Collection Grid (/product)
│   └── product/[slug]/       # Phase 5: Product Booking (PPR Suspense bắt buộc)
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Sticky nav desktop + Hamburger trigger (Client Component)
│   │   ├── MobileMenu.tsx    # Drawer toàn màn hình chuẩn SSENSE (Client Component)
│   │   └── Footer.tsx        # Thông tin studio, mạng xã hội, surface background
│   └── sections/
│       ├── Hero.tsx          # 2 tầng: Box cha layout (100dvh) + Box con Image card
│       ├── About.tsx         # 2 cột: Storytelling trái + Portrait photo phải
│       ├── Spotlight.tsx     # Monogram seal SB + Ảnh trung tâm + Mission quote
│       └── MetadataBar.tsx   # Pre-footer 3 cột ngang (CAFE ORDER, LISTENING, FLOWER)
└── lib/
    ├── constants.ts          # Nguồn dữ liệu gốc của NAV_LINKS và STUDIO_INFO
    └── utils.ts              # cn() helper (clsx + tailwind-merge)
```

### Nguyên tắc Rendering (RSC vs Client Component):
* Mặc định **mọi trang nội dung là Server Component** (`page.tsx`, `Hero.tsx`, `About.tsx`, `Spotlight.tsx`, `MetadataBar.tsx`). Điều này giúp Next.js prerender tĩnh ra HTML hoàn chỉnh phục vụ Googlebot SEO và đạt điểm Core Web Vitals tối đa.
* Chỉ gắn `"use client"` khi component thực sự cần lắng nghe sự kiện của người dùng trên trình duyệt (như `Header.tsx` và `MobileMenu.tsx` để đóng mở drawer).

---

## 3. Những "Bẫy Ngầm" Kỹ Thuật Đã Gặp & Giải Pháp (Critical Gotchas)

Khi viết code tiếp theo, bạn **BẮT BUỘC PHẢI NHỚ** 4 cạm bẫy kỹ thuật sau:

### Bẫy 1: Xung đột thang đo Spacing của Tailwind CSS v4
* **Vấn đề**: Trong Tailwind v4, tiền tố `--spacing-*` bên trong `@theme` chi phối toàn bộ tiện ích định cỡ, bao gồm cả `max-w-*`. Nếu khai báo `--spacing-xs: 4px;` thì `max-w-xs` sẽ bị gán thành `max-width: 4px` (khiến chữ rớt dòng thành 1 cột dọc!).
* **Tư duy đúng**: Phải dùng tiền tố `--space-xs` ... `--space-2xl` cho khoảng cách theo đúng [MASTER.md](../frontend/design-system/sunriseblooms/MASTER.md). Khi cần giới hạn chiều rộng văn bản, dùng class pixel cụ thể như `max-w-[480px]`, `max-w-[580px]`.

### Bẫy 2: Next.js 16 Partial Prerendering (PPR) trên Dynamic Routes
* **Vấn đề**: Ở Next.js 16 bật PPR, `params` của dynamic route (`/shop/[slug]`) là Promise mang dữ liệu runtime. Việc gọi `await params` trực tiếp ngoài `<Suspense>` boundary sẽ khiến `next build` crash ngay lập tức.
* **Tư duy đúng**: Luôn bọc phần đọc `params` vào một subcomponent async con và dùng `<Suspense fallback={...}>` bao quanh.

### Bẫy 3: Cấu trúc 2 tầng cho Hero Banner chứa `<Image fill>`
* **Vấn đề**: Thuộc tính `fill` của `next/image` mang style `position: absolute; inset: 0`. Nếu đặt cùng cấp với padding trên thẻ cha, ảnh sẽ bung sát mép và đè mất padding ngoài.
* **Tư duy đúng**:
  * Tầng 1 (Box cha `<section>`): Quản lý padding `px`, `py` và chiều cao viewport `h-[calc(100dvh-4rem)]` để khớp trọn vẹn với Navbar `h-16` (`4rem`).
  * Tầng 2 (Box con `<div>`): Đóng vai trò container `relative w-full h-full` chứa ảnh.

### Bẫy 4: Workflow CI GitHub Actions chạy đa ngôn ngữ
* **Vấn đề**: Thư mục gốc có cả Backend (Python/FastAPI) và Frontend (Node.js/Next.js). Dùng `matrix` chung sẽ làm bước `uv sync` chạy nhầm vào thư mục `frontend` và báo lỗi thiếu `pyproject.toml`.
* **Tư duy đúng**: Tách thành 2 job riêng biệt trong `.github/workflows/ci.yml`: `backend` (Python 3.12 + `uv`) và `frontend` (Node 22 + `npm ci` + `lint` + `tsc` + `build`).

### Bẫy 5: Tiến trình mồ côi (Orphan Process) chiếm giữ Port 3000 khi dừng Next.js
* **Vấn đề**: Khi chạy `npm run start` hoặc `npm run dev` ngầm, lệnh kill của agent chỉ dừng tiến trình cha `npm`, nhưng tiến trình con `node (next-server)` có thể tiếp tục chạy ngầm và giữ port 3000, khiến người dùng mở dev server bị báo "Port 3000 is in use, using 3001".
* **Tư duy đúng**: Luôn giải phóng port triệt để bằng `kill -9 $(lsof -t -i:3000)` hoặc `pkill -9 -f "next"`.

### Bẫy 6: Backdrop-filter tạo Containing Block giam cầm Modal/Drawer `fixed`
* **Vấn đề**: Khi thẻ cha (như `<header>`) có class `backdrop-blur-xs` (CSS `backdrop-filter: blur(...)`), đặc tả CSS quy định thẻ cha trở thành containing block của mọi phần tử con mang `position: fixed`. Khi đó, component con như `<MobileMenu>` dù có `fixed inset-0` cũng bị co nhỏ giam bên trong chiều cao 64px của Header ở đầu trang, gây lỗi hiển thị co rúm ("nhảy trên đầu trang có w cố định nhỏ không thể thấy").
* **Tư duy đúng**: Luôn dùng React Portal `createPortal(content, document.body)` để gắn Modal / Fullscreen Drawer trực tiếp vào `document.body`, thoát hoàn toàn khỏi mọi containing block và phủ trọn 100% viewport (`w-screen h-[100dvh]`).

---

## 4. Triết lý Đồng Hành cùng Người Dùng (Human-AI Collaboration)

* **Chân dung người dùng (`notworLe`)**:
  * Là người có tầm nhìn thẩm mỹ rất sắc bén, nắm rõ định hướng sản phẩm và quy chuẩn dự án.
  * Đang tiếp cận code với góc nhìn người mới (newbie) muốn học hỏi bản chất để sau này tự bảo trì.
* **Nguyên tắc ứng xử của Agent**:
  1. **Comment code cực kỳ chu đáo**: Mỗi component mới đều phải có chú thích tiếng Việt giải thích: biến này làm gì, sửa ở đâu, dành cho người mới đọc hiểu được.
  2. **Tuân thủ phân quyền Autonomy L2**:
     * Bạn được quyền viết code, sửa lỗi, chạy test và tạo tài liệu.
     * Mọi quyết định mới **chỉ được ghi vào mục `PROPOSED`** trong [`log/DECISION_LOG.md`](DECISION_LOG.md), không tự ý sửa `ACTIVE RULES` hay `HISTORY`.
     * Dừng lại trước khi commit: Không tự tiện gõ `git commit` hay `git push` nếu người dùng chưa yêu cầu.
  3. **Không bao giờ làm phức tạp hóa (Keep It Simple)**: Ưu tiên giải pháp tối giản, dễ hiểu, tránh cài thư viện bừa bãi hay dựng kịch bản test quá tải.
  4. **Giải phóng tiến trình triệt để (Luật R-09 / D-023)**:
     * Luôn hủy toàn bộ tiến trình nền (port, server, daemon, process con) ngay sau khi chạy test/kiểm thử xong.
     * Tuyệt đối không để sót tiến trình ngầm chiếm dụng port (đặc biệt port 3000 và 8000).
     * Nếu có nhu cầu duy trì tiến trình chạy xuyên nhiều task/hội thoại, **BẮT BUỘC PHẢI BÁO TRƯỚC VÀ XIN PHÉP NGƯỜI DÙNG**.

---

## 5. Trạng thái Hiện tại & Kim Chỉ Nam cho Giai đoạn tiếp theo

* **Đã hoàn thành**:
  * **Phase 1**: Setup project, Design tokens Tailwind v4, Fonts Google.
  * **Phase 2**: Skeleton module, 26 base atoms/layout/blocks, route stubs.
  * **Phase 3**: Landing Page hoàn chỉnh (Hero, About, Spotlight, MetadataBar) khớp với `landing-page.png`, gắn đủ 3 ảnh thực tế, Mobile Drawer navigation chuẩn SSENSE.
  * **Phase 4**: Collection Grid & Filter hoàn chỉnh (`/product` — D-024 hợp nhất xóa `/shop`):
    * Lưới hình ảnh chuẩn editorial: 4 cột trên Desktop (`md:grid-cols-4`), 2 cột trên Mobile (`grid-cols-2`), khoảng cách thoáng đãng.
    * Card sản phẩm (`ProductCard.tsx`): Tỉ lệ dọc `aspect-[3/4]`, khắc phục thẻ cha `relative` cho `<Image fill>`, zoom nhẹ `scale-[1.03]`, không đổ bóng, không bo góc.
    * Bộ lọc tương tác (`CollectionFilters.tsx`): Lọc theo Dịp mặc (Wedding, Ceremony, Editorial, Event), Kích cỡ (XS, S, M, L, XL), Tông màu (Ivory, Sage, Terracotta, Rose), sắp xếp giá.
    * Cơ chế thu gọn (Collapsible) trên điện thoại: Nút bấm `[BỘ LỌC & SẮP XẾP]` tiện lợi.
    * Dữ liệu mẫu phong phú: 8 mẫu thiết kế áo dài độc bản với ảnh thời trang chất lượng cao.
    * Tính năng SHOW MORE (Xem thêm) & Thanh tiến độ 1px tinh tế.
  * **Phase 5 (Một phần đã hoàn thiện)**:
    * **Track URL nhẹ nhàng**: Breadcrumb định vị tọa độ editorial góc trái Header (`LOC: INDEX / HOME`, `LOC: THE ARCHIVE`, `LOC: ARCHIVE / PIECE`) và vi điểm chỉ báo dưới nav link.
    * **Khu vực Giỏ hàng**: Thay thế nút "GET IN TOUCH" bằng `BAG (${totalItems})` trên Header và Mobile Menu.
    * **Cart State & Persistence**: `CartContext.tsx` dùng `useSyncExternalStore` của React 19 để đồng bộ an toàn với `localStorage`, loại bỏ triệt để lỗi Hydration Mismatch và cascading renders (`react-hooks/set-state-in-effect`).
    * **CartDrawer slide-over**: Xem ảnh thumbnail, tên áo, size, gói ngày, nút tăng giảm số lượng (+ / -), xóa item, hiển thị tổng tiền live kép AUD và VND.
    * **Khối chọn size & ngày thuê**: `ProductBookingInteractive.tsx` trên `/product/[slug]` hỗ trợ chọn size (gạch ngang size hết hàng), chọn gói 4 ngày/8 ngày (hệ số 1.75x), xem bảng số đo (Size Guide cm), nút "THÊM VÀO GIỎ HÀNG" (ADD TO BAG).
    * **Cạm bẫy Next.js 16 PPR giải quyết**: Bọc `<Header />` trong `<Suspense fallback={<HeaderFallback />}>` tại `layout.tsx` để `usePathname()` không gây lỗi `CLIENT_HOOK_DYNAMIC` khi prerender tĩnh.
* **Nhiệm vụ tiếp theo cần làm**:
  * **Phase 5 — Hoàn thiện phần còn lại**:
    * Availability calendar (lịch chọn ngày nhận & ngày trả; ngày đã book hiển thị gạch chéo strikethrough).
    * Delivery method (pickup studio miễn phí tại Melbourne / bưu điện có tính phí vận chuyển).
    * Price breakdown chi tiết (tiền thuê + cọc bảo đảm + phí giao hàng).
    * Accordions (Chính sách giao nhận, bảo quản, câu hỏi thường gặp FAQs).
    * Form chốt đơn & xác nhận thanh toán/chuyển khoản cọc.

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.3.0 | 2026-11-10 | notworLe | Antigravity | Triển khai Giỏ hàng (CartContext + CartDrawer), Track URL Header, khắc phục PPR usePathname, update docs Phase 5 |
| 1.2.0 | 2026-11-10 | notworLe | Antigravity | Bổ sung luật R-09 / D-023: Bắt buộc giải phóng tiến trình nền sau task, báo trước nếu muốn duy trì |
| 1.1.0 | 2026-11-10 | notworLe | Antigravity | Hoàn tất Phase 4 (Collection Grid & Filters), cập nhật mental model và cạm bẫy relative parent |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Khởi tạo tài liệu AI Thinking & Mental Model truyền giao ngữ cảnh toàn diện cho các AI Agent kế nhiệm |
