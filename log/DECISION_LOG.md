---
title: Decision Log — retail-system
doc_type: report
project: retail-system
layer: all
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

---

## PROPOSED

> Chờ người dùng duyệt. Agent ghi vào đây theo đúng mẫu.

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
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Khởi tạo — log lại 8 quyết định từ phiên đầu |
