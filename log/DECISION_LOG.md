---
title: Decision Log — retail-system
doc_type: report
project: retail-system
layer: all
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-10
last_updated_by: Antigravity
version: 0.1.0
status: draft
reviewers: []
related_docs:
  - ../.agents/rule/LOG.md
  - ../.agents/rule/AI_DELEGATION_LOOP.md
tags: [log, decision, governance]
---

# Decision Log — retail-system

> File này là bộ nhớ quyết định của dự án. Đọc hết **ACTIVE RULES** trước mỗi phiên.
> Chỉ đọc HISTORY khi: (a) người dùng yêu cầu, hoặc (b) sắp thay đổi thứ gì đã nhắc trong ACTIVE RULES.
> Quy tắc chi tiết: xem [LOG.md](../.agents/rule/LOG.md).

---

## CÁCH DÙNG

1. Chỉ **ACTIVE RULES** là luật. PROPOSED và HISTORY không phải luật.
2. Agent **chỉ được ghi vào PROPOSED**. Không tự sửa ACTIVE RULES hay HISTORY.
3. Chỉ người dùng được duyệt PROPOSED thành ACTIVE (nói rõ "duyệt D-xxx" hoặc "chốt").
4. Quyết định mâu thuẫn ACTIVE RULES → dừng, nêu rõ luật nào, hỏi lại.

---

## ACTIVE RULES

> Tối đa 25 dòng. Mỗi luật cụ thể, kiểm chứng được, kèm mã quyết định.

- R-01: Việc không thể đảo ngược (xóa file, đổi schema, ghi đè dữ liệu) → hỏi trước khi làm. (D-001)
- R-02: Quyết định do agent đưa ra → ghi vào PROPOSED, không áp dụng như luật. (D-002)
- R-03: Chuyển/đổi tên file → cập nhật mọi tham chiếu và báo lại danh sách đã sửa. (D-003)
- R-04: Stack cố định: PostgreSQL · FastAPI · Next.js + Tailwind. Không tự đổi stack. (D-004)
- R-05: Agent mặc định L2 — viết code + test, dừng trước commit. Không tự `git commit` hay `git push`. (D-005)
- R-06: Mọi color token phải khai báo trong `tailwind.config.ts`, không hardcode hex trong component. (D-006)
- R-07: Mọi file `.md` phải có YAML front matter + bảng lịch sử thay đổi theo chuẩn DOC.md. (D-007)
- R-08: Mọi quyết định đáng ghi → ghi vào file này ngay trong phiên đó. (D-008)
- R-09: Hủy toàn bộ tiến trình nền (port, server, daemon) sau khi thực hiện xong task. Nếu cần giữ tiến trình xuyên nhiều task/hội thoại → BẮT BUỘC hỏi và báo trước cho người dùng. (D-023)

---

## PROPOSED

> Chờ người dùng duyệt. Agent ghi vào đây theo đúng mẫu.

### D-024 | 2026-11-10 | by: human-instructed | status: proposed
- Context: Bản chất toàn bộ website LUA Studio đã là một boutique shop cho thuê áo dài, việc tạo thêm tiền tố /shop gây trùng lặp và không cần thiết so với /product.
- Decision: Xóa bỏ hoàn toàn route `/shop`, quy hoạch toàn bộ tính năng sản phẩm về `/product` (danh sách bộ sưu tập) và `/product/[slug]` (chi tiết áo dài & booking); đồng thời cập nhật toàn bộ liên kết điều hướng trên Hero, ProductCard, Header và chi tiết sản phẩm.
- Reason: Tối ưu cấu trúc URL tinh gọn, tránh trùng lặp tài nguyên và đồng bộ điều hướng theo chỉ đạo của người dùng.
- Supersedes: none

### D-025 | 2026-11-10 | by: human-instructed | status: proposed
- Context: Khách hàng cần theo dõi vị trí trang trên Header (Track URL) với trải nghiệm người dùng tinh tế, không hiện text debug kỹ thuật; khi cuộn tới #about thì Header phải tracking đúng #about; khắc phục lỗi menu mobile bị co nhỏ nhảy trên đầu trang do backdrop-filter trapping; thay thế "GET IN TOUCH" bằng Giỏ hàng (Shopping Bag).
- Decision: 
  1. Dải text debug `LOC: ...` chỉ hiển thị trong môi trường development (`process.env.NODE_ENV === "development"`), ẩn hoàn toàn với người dùng cuối trong production.
  2. Sử dụng `useSyncExternalStore` của React 19 để theo dõi sự kiện scroll/hashchange: khi cuộn tới `#about` thì dấu chấm vi điểm trên Header tự động chuyển từ `HOME` sang `ABOUT`.
  3. Sử dụng `createPortal(..., document.body)` cho `MobileMenu.tsx` để gắn menu trực tiếp vào `<body>`, thoát khỏi containing block của `backdrop-blur-xs` trên `<header>`, đảm bảo menu phủ kín 100% màn hình thiết bị di động (`w-screen h-[100dvh]`).
  4. Cân chỉnh `HeaderFallback` trong `layout.tsx` khớp hoàn toàn với cấu trúc thật của `Header` (icon hamburger trái, logo giữa, icon giỏ hàng phải) để loại bỏ hiện tượng nhảy layout khi load trang trên mobile.
  5. Xây dựng `CartContext` (`useSyncExternalStore` + `localStorage`), `CartDrawer` slide-over, và khối tương tác đặt áo dài `ProductBookingInteractive` trên trang chi tiết `/product/[slug]`.
- Reason: Tối ưu UI/UX mượt mà, loại bỏ bẫy ngầm CSS containing block với backdrop-filter, và tuân thủ tiêu chuẩn code React 19 / Next.js 16 PPR.
- Supersedes: none


### D-022 | 2026-11-10 | by: agent | status: proposed
- Context: Triển khai Giai đoạn 4 (Shop / Collection Page) duyệt bộ sưu tập với yêu cầu lưới hình ảnh 4 cột desktop / 2 cột mobile, không shadow, không rounded corner, và bộ lọc collapsible trên mobile.
- Decision: (1) Xây dựng Server Component cho trang `/shop` và bọc tương tác lọc trong Client Component `CollectionView.tsx`; (2) Bổ sung mốc tọa độ `relative` và tỉ lệ dọc `aspect-[3/4]` cho `ProductCard.tsx` để thẻ `<Image fill>` không bị bung vỡ layout; (3) Khởi tạo 8 sản phẩm mẫu chân thực kèm 4 ảnh thời trang Áo Dài editorial sinh bằng AI; (4) Tạo route alias `/portfolio` trỏ về `/shop`.
- Reason: Đảm bảo hiệu năng SEO tối đa, tuân thủ nghiêm ngặt bảng màu Warm Ivory và nguyên tắc thiết kế của MASTER.md.
- Supersedes: none

### D-021 | 2026-11-10 | by: agent | status: proposed
- Context: Cần phân định rõ ràng giữa file quy chuẩn nguyên tắc (.agents/rule/LOG.md), sổ quyết định kỹ thuật (log/DECISION_LOG.md) và nhật ký luồng tư duy bàn giao cho AI Agent kế nhiệm (log/AI_THINKING.md).
- Decision: Xác lập mô hình bộ nhớ 3 tầng: (1) .agents/rule/LOG.md định nghĩa khung luật lệ và quyền hạn; (2) log/DECISION_LOG.md lưu trữ các quyết định kiến trúc/kỹ thuật D-xxx; (3) log/AI_THINKING.md lưu trữ toàn bộ luồng tư duy, bản đồ kiến trúc, triết lý thiết kế và 4 bẫy ngầm kỹ thuật để AI Agent mới đọc đầu tiên khi bắt đầu phiên.
- Reason: Giữ file quy tắc luôn cô đọng dưới 25 dòng theo quy định, đồng thời cung cấp đầy đủ bối cảnh sâu cho AI Agent mới tiếp quản mượt mà mà không làm vỡ dự án hay lặp lại lỗi cũ.
- Supersedes: none

### D-020 | 2026-11-10 | by: agent | status: proposed
- Context: Dự án quy mô vừa và nhỏ cần một chiến lược kiểm thử tối thiểu, hiệu quả và dễ hiểu cho người mới mà không gây lãng phí tài nguyên (overengineering).
- Decision: Thiết lập chiến lược kiểm thử 3 cấp độ: Cấp 1 (Tự động 100%: `tsc --noEmit` + `lint` + `build`), Cấp 2 (Chỉ viết test cho logic tính tiền/ngày thuê ở Phase 5 bằng Vitest), Cấp 3 (Checklist 5 phút kiểm tra thủ công responsive và trải nghiệm trên điện thoại thật). Tài liệu hóa chi tiết tại `docs/knowledge/TESTING.md`.
- Reason: Đạt 90% độ tin cậy và bắt sạch lỗi crash/type mà không tốn công viết các kịch bản test giao diện phức tạp khó bảo trì.
- Supersedes: none

### D-019 | 2026-11-10 | by: agent | status: proposed
- Context: MobileMenu ban đầu dùng các danh mục mẫu của SSENSE, chưa khớp với các mục thực tế của LUA Studio trên desktop Navbar (HOME, ABOUT, PROCESS, PORTFOLIO, INSTAGRAM + GET IN TOUCH).
- Decision: Tái cấu trúc `MobileMenu.tsx` chỉ hiển thị đúng 5 mục Navbar chính và 1 nút hành động nổi bật `GET IN TOUCH` màu sage; kèm theo hệ thống chú thích tiếng Việt cực kỳ chi tiết cho người mới học (newbie) dễ dàng tùy biến.
- Reason: Đảm bảo tính nhất quán tuyệt đối giữa Mobile và Desktop navigation; giúp developer sau này dễ dàng bảo trì và thêm/sửa link mà không sợ làm hỏng code.
- Supersedes: D-018

### D-018 | 2026-11-09 | by: agent | status: proposed
- Context: Cần hoàn thiện Mobile Drawer Navigation theo mẫu `docs/mobile/hambuger.png` cho Header.
- Decision: Tạo component `MobileMenu.tsx` (toàn màn hình, nút CLOSE góc trên phải, 4 nhóm mục kèm chevron, lock scroll body, hỗ trợ phím Escape) và chuyển `Header.tsx` sang `"use client"` để quản lý trạng thái mở menu.
- Reason: Đảm bảo trải nghiệm mobile editorial tối giản chuẩn SSENSE, đồng bộ với desktop và giữ nguyên bảng màu Warm Ivory.
- Supersedes: none

### D-017 | 2026-11-09 | by: agent | status: proposed
- Context: `<Image fill>` trong Hero section đè lên viền padding cha và Hero không khớp 100vh màn hình đầu tiên khi kết hợp Navbar.
- Decision: Tách biệt box cha `<section>` quản lý layout/padding với chiều cao `h-[calc(100dvh-4rem)]` (Navbar 4rem = 64px) và box con `<div>` chứa ảnh `fill`.
- Reason: Tránh ảnh đè lên padding viền cha; đảm bảo Navbar + Hero chiếm đúng 100% viewport (`100dvh`), cho phép chỉnh `py` dễ dàng mà không tràn màn hình.
- Supersedes: none

### D-016 | 2026-11-09 | by: agent | status: proposed
- Context: Khai báo `--spacing-xs: 4px; ... --spacing-xl: 48px;` trong `@theme` tại `globals.css` khiến Tailwind CSS v4 tự động ghi đè thang đo `max-w-*`, làm `max-w-xs` thành 4px, `max-w-xl` thành 48px và chữ bị ép thành 1 cột dọc.
- Decision: Đổi tên các biến spacing thành `--space-xs` ... `--space-2xl` chuẩn theo MASTER.md, trả lại các giá trị `max-w-*` container width mặc định của Tailwind.
- Reason: Tránh xung đột namespace nội bộ của Tailwind v4, giúp các khối văn bản ở Hero, About, Spotlight và MetadataBar dàn hàng ngang chuẩn thiết kế.
- Supersedes: none

### D-015 | 2026-11-09 | by: agent | status: proposed
- Context: Workflow CI `.github/workflows/ci.yml` dùng matrix chung chạy các step Python (`uv sync`) cho cả frontend, gây fail do frontend không có `pyproject.toml`.
- Decision: Tách CI thành 2 jobs riêng biệt: `backend` (Python 3.12, `uv`) và `frontend` (Node 22, `npm ci`, `eslint`, `tsc`, `next build`).
- Reason: Đảm bảo CI chạy đúng tooling từng layer, phát hiện sớm lỗi prerender và type check của Next.js trước khi deploy lên Vercel.
- Supersedes: none

### D-014 | 2026-11-09 | by: agent | status: proposed
- Context: Deploy Vercel bị crash ở bước prerender route `/shop/[slug]` do Next.js 16 Partial Prerendering (PPR) chặn việc truy cập trực tiếp `await params` mà không có boundary Suspense.
- Decision: Tách phần đọc `params` vào subcomponent async `ProductContent` và bọc trong `<Suspense fallback={...}>` tại `ProductPage`.
- Reason: Tuân thủ quy chuẩn PPR của Next.js 16, cho phép shell tĩnh prerender trước và dynamic data stream sau, đưa build thành công exit code 0.
- Supersedes: none

### D-013 | 2026-11-09 | by: agent | status: proposed
- Context: Phase 2 — cần icon brand (Instagram, Facebook); lucide-react không có brand icons
- Decision: Dùng `react-icons/fa6` cho social brand icons; `lucide-react` cho UI icons (menu, chevron, bag...)
- Reason: Tách biệt rõ: lucide = UI chrome, react-icons/fa = brand logos; tree-shake tốt
- Supersedes: none

### D-012 | 2026-11-09 | by: agent | status: proposed
- Context: Phase 2 — blocks/ cần 11 components cho Phase 3-5 nhưng chưa có data thật
- Decision: Tạo stub components với interface đúng + placeholder UI; không build logic thật cho đến phase tương ứng
- Reason: Đảm bảo cấu trúc folder đúng, TypeScript compile ngay từ đầu, tránh refactor lớn sau
- Supersedes: none

### D-011 | 2026-11-09 | by: agent | status: proposed
- Context: Root .gitignore có `lib/` (Python rule) vô tình ignore `frontend/src/lib/`
- Decision: Thêm `!frontend/src/lib/` exception vào root .gitignore
- Reason: `lib/` Python rule chỉ nên áp dụng cho backend Python, không ảnh hưởng frontend source
- Supersedes: none

### D-010 | 2026-11-09 | by: agent | status: proposed
- Context: Next.js 16 Server Component không cho phép `new Date()` khi prerender
- Decision: Hardcode năm trong Footer copyright thay vì `new Date().getFullYear()`
- Reason: Copyright year là giá trị tĩnh theo năm — không cần dynamic per request
- Supersedes: none

### D-009 | 2026-11-09 | by: agent | status: proposed
- Context: Phase 2 — chọn thư viện dependency cho base components
- Decision: Cài thêm `clsx`, `tailwind-merge`, `lucide-react`, `react-icons` vào frontend
- Reason: clsx+twMerge = cn() helper chuẩn; lucide = UI icons nhất quán; react-icons/fa6 = brand social icons
- Supersedes: none

---

## HISTORY

> Mới nhất ở trên. Không xóa dòng nào — đổi ý thì chuyển `status: superseded`.

### D-023 | 2026-11-10 | by: human | status: active
- Context: Tiến trình nền (Next.js server) chạy ngầm chiếm dụng port 3000 sau khi agent xong task, khiến người dùng không thể khởi chạy dev server bình thường (Next.js cảnh báo port 3000 in use, nhảy sang 3001).
- Decision: Bắt buộc agent phải hủy toàn bộ tiến trình nền (port, server, daemon, process con) ngay sau khi hoàn thành task. Nếu cần duy trì tiến trình chạy xuyên nhiều task/hội thoại, BẮT BUỘC phải thông báo rõ ràng cho người dùng biết trước khi giữ.
- Reason: Tránh xung đột port, chiếm dụng tài nguyên hệ thống và không làm gián đoạn luồng làm việc cục bộ của người dùng.
- Supersedes: none

### D-008 | 2026-11-08 | by: human | status: active
- Context: Cần hệ thống log quyết định để không lặp lại sai lầm
- Decision: Mọi quyết định đáng ghi → log vào `log/DECISION_LOG.md` ngay trong phiên
- Reason: Dự án dài, nhiều phiên chat — không log thì mất context
- Supersedes: none

### D-007 | 2026-11-08 | by: human | status: active
- Context: Agent viết docs thiếu metadata, bị nhắc nhiều lần
- Decision: Mọi file `.md` phải có YAML front matter đầy đủ + bảng lịch sử thay đổi theo chuẩn `DOC.md`
- Reason: Truy vết được ai viết, ai sửa, khi nào, trạng thái gì
- Supersedes: none

### D-006 | 2026-11-08 | by: human | status: active
- Context: Yêu cầu build landing page với color tokens
- Decision: Toàn bộ màu sắc khai báo trong `tailwind.config.ts` dưới `colors.brand.*`; không dùng hex trực tiếp trong JSX/TSX
- Reason: Scalable, dễ đổi theme, nhất quán toàn project
- Supersedes: none

### D-005 | 2026-11-08 | by: human | status: active
- Context: Agent tự `git commit` và `git push` nhiều lần dù không được giao L3
- Decision: Agent mặc định L2 — không tự commit, không tự push; dừng và báo cáo để người dùng commit
- Reason: Đúng quy trình AI_DELEGATION_LOOP — L2 dừng trước commit
- Supersedes: none

### D-004 | 2026-11-08 | by: human | status: active
- Context: Chốt tech stack đầu dự án
- Decision: Stack cố định — PostgreSQL (DB) · Python FastAPI (backend) · Next.js + Tailwind (frontend)
- Reason: Nhất quán, không phát sinh thêm dependency ngoài stack đã duyệt
- Supersedes: none

### D-003 | 2026-11-08 | by: human | status: active
- Context: Agent chuyển file xong nhưng import cũ bị hỏng
- Decision: Đổi tên/chuyển file phải cập nhật mọi tham chiếu và báo lại danh sách đã sửa
- Reason: Tránh lỗi âm thầm sau khi di chuyển
- Supersedes: none

### D-002 | 2026-11-08 | by: human | status: active
- Context: Agent tự quyết rồi làm như đã được duyệt
- Decision: Quyết định do agent đưa ra chỉ là đề xuất cho đến khi người dùng duyệt
- Reason: Phân biệt "người dùng đã chốt" với "agent tự đoán"
- Supersedes: none

### D-001 | 2026-11-08 | by: human | status: active
- Context: Cần chặn hành động phá hủy ngoài ý muốn
- Decision: Xóa file, đổi schema, ghi đè dữ liệu phải hỏi trước
- Reason: Không thể hoàn tác nếu sai
- Supersedes: none

---

## MẪU GHI MỚI

```
### D-xxx | YYYY-MM-DD | by: human | agent | status: proposed | active | superseded | rejected
- Context: (vấn đề gì xảy ra)
- Decision: (quyết định, một câu cụ thể)
- Reason: (vì sao — để biết khi nào được phá luật)
- Supersedes: D-yyy hoặc none
```

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 0.2.0 | 2026-11-10 | notworLe | Antigravity | Bổ sung luật R-09 (D-023: Bắt buộc hủy tiến trình sau khi xong task, báo trước nếu muốn giữ) |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo — log lại 8 quyết định từ phiên đầu |
