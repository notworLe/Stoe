---
title: "Kiến thức Kiểm thử Phần mềm & Frontend Testing Strategy"
doc_type: guide
project: retail-system
layer: all
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-10
updated: 2026-11-10
last_updated_by: Antigravity
version: 1.0.0
status: approved
reviewers: []
related_docs:
  - GIT.md
  - DOCKER.md
  - ../../frontend/docs/roadmap/ROADMAP.md
  - ../../frontend/docs/navigation-tutorial.md
tags: [testing, frontend, verification, qa, playwright, vitest, ci-cd]
---

# Kiến thức Kiểm thử Phần mềm & Frontend Testing Strategy

Tài liệu đúc kết kiến thức về quy trình kiểm thử phần mềm thực tế, cách AI Agent tự động xác minh tính hoàn thiện của mã nguồn, và chiến lược kiểm thử đa tầng (Testing Pyramid) được áp dụng tại các công ty công nghệ lớn.

---

## 1. Bản chất: Làm sao biết một tính năng đã "Hoàn thành" (Definition of Done)?

Trong phát triển phần mềm chuyên nghiệp, "hoàn thành" không phải là lập trình viên hay Agent cảm thấy xong, mà phải vượt qua **5 tầng xác thực kỹ thuật tự động**:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Definition of Done (DoD)   : Đối chiếu tiêu chí từ ROADMAP   │
│ 2. Static Analysis            : npm run lint + npx tsc --noEmit │
│ 3. Build & Prerender          : npm run build (Chuẩn hóa Prod)  │
│ 4. Server & DOM Inspection    : Kiểm tra cây HTML thực tế       │
│ 5. Browser Automation (E2E)   : Chạy trình duyệt Headless       │
└─────────────────────────────────────────────────────────────────┘
```

1. **Definition of Done (DoD)**: Bản tiêu chí nghiệm thu được thỏa thuận trước (ví dụ: đủ file, đúng token màu, 0 hex hardcode, responsive 375px/1440px).
2. **Kiểm tra tĩnh (Static Check)**:
   - `npm run lint`: Bắt lỗi cú pháp, biến không sử dụng, sai quy chuẩn code.
   - `npx tsc --noEmit`: Kiểm tra 100% type safety của TypeScript (sai props, thiếu thuộc tính).
3. **Kiểm tra đóng gói & Prerender (`npm run build`)**:
   - Máy tính biên dịch mã nguồn như môi trường production thật.
   - Bắt các lỗi nghiêm trọng nhất: Server Component crash, lỗi Dynamic Data không có Suspense (như lỗi `/shop/[slug]` trên Vercel).
4. **Kiểm tra DOM thực tế**:
   - Gửi request đến server nội bộ (`http://localhost:3000`) để kiểm tra file HTML trả về xem có đủ thẻ `<h1>`, `<h2>`, thẻ ảnh `<img />` và class Tailwind hay chưa.
5. **Trình duyệt tự động (Headless Browser Automation)**:
   - Dùng Playwright/Puppeteer mở trình duyệt ngầm, giả lập màn hình Mobile và Desktop, tự động click nút bấm và chụp ảnh màn hình kiểm chứng.

---

## 2. Kim tự tháp kiểm thử Frontend thực tế (Frontend Testing Pyramid)

Các công ty công nghệ tiêu chuẩn (Google, Meta, Vercel...) tổ chức kiểm thử theo mô hình hình tháp từ nhanh/rẻ ở đáy đến chi tiết/chậm ở đỉnh:

```
          / \
         /   \        5. Manual / Exploratory Testing (Người thật trải nghiệm)
        / E2E \       4. End-to-End Testing (Playwright / Cypress)
       /───────\
      / Visual  \     3. Visual Regression (Storybook / Chromatic / Percy)
     /───────────\
    / Integration \   2. Component / Unit Test (Vitest / React Testing Library)
   /───────────────\
  /  Static Analysis\ 1. TypeScript + ESLint (Chạy tức thì trên từng dòng code)
 /───────────────────\
```

### Tầng 1: Static Analysis (Phân tích tĩnh — Nhanh nhất & Rẻ nhất)
* **Công cụ**: TypeScript (`tsc`), ESLint, Prettier.
* **Nhiệm vụ**: Bắt 60% lỗi ngớ ngẩn (gõ sai chính tả biến, truyền chuỗi vào chỗ cần số, quên import thư viện) ngay khi đang viết code.

### Tầng 2: Unit & Component Testing (Kiểm tra từng khối gạch)
* **Công cụ**: Vitest, Jest, React Testing Library.
* **Nhiệm vụ**: Viết code giả lập hành vi component mà không cần mở trình duyệt:
  * *Ví dụ*: Kiểm tra xem khi bấm vào nút Hamburger thì menu có xuất hiện class `isOpen` không.

### Tầng 3: Visual Regression Testing (So sánh từng điểm ảnh)
* **Công cụ**: Storybook, Chromatic, Percy, Playwright Screenshots.
* **Nhiệm vụ**: Chụp ảnh màn hình tự động mỗi khi có code mới và **so sánh từng pixel với bức ảnh cũ**:
  * Nếu nút bấm vô tình lệch 2px hoặc chữ bị rớt dòng thành cột dọc hẹp (như lỗi Tailwind v4 spacing vừa qua), hệ thống sẽ tô đỏ điểm khác biệt để cảnh báo.

### Tầng 4: End-to-End (E2E) Testing (Robot đóng giả người dùng thật)
* **Công cụ**: Playwright, Cypress.
* **Nhiệm vụ**: Khởi chạy một trình duyệt thật (Chrome/Safari) và thực hiện kịch bản người dùng:
  * Mở trang web ➔ Bấm nút Hamburger ➔ Bấm link ABOUT ➔ Kiểm tra trang có cuộn đến đúng phần giới thiệu hay không.

### Tầng 5: Manual Testing / User Acceptance Testing (Nghiệm thu con người)
* **Nhiệm vụ**: Cầm điện thoại thật mở website lên trải nghiệm.
* Đánh giá những thứ máy móc không đo được: Cảm giác tay khi vuốt chạm (feel & look), độ nhạy, tính thẩm mỹ của màu sắc dưới ánh sáng thực tế.

---

## 3. Phân chia vai trò: Máy làm gì & Con người làm gì?

| Nhiệm vụ | Hệ thống CI / Agent (90%) | Con người / Product Owner (10%) |
|---|:---:|:---:|
| Kiểm tra lỗi cú pháp, biến thừa | ✅ Làm tự động | ❌ Không cần bận tâm |
| Kiểm tra type TypeScript an toàn | ✅ Bắt lỗi 100% | ❌ Không cần bận tâm |
| Bắt lỗi crash build Next.js / Vercel | ✅ Chặn đứng trên CI | ❌ Không cần bận tâm |
| Kiểm tra HTML chuẩn SEO cho Google | ✅ Quét cây DOM tự động | ❌ Không cần bận tâm |
| **Đánh giá thẩm mỹ & cảm xúc thương hiệu** | ⚠️ Hỗ trợ chụp ảnh | 🌟 **Quyết định tối thượng** |
| **Trải nghiệm vuốt chạm trên thiết bị thật** | ⚠️ Giả lập viewport | 🌟 **Quyết định tối thượng** |

> **Quy tắc vàng:** Máy móc và Agent dọn sạch 90% "rác kỹ thuật" và lỗi logic. Con người chỉ cần dành 10% năng lượng tinh hoa nhất để nghiệm thu **tính thẩm mỹ, thông điệp thương hiệu và trải nghiệm người dùng**.

---

## 4. Cheat Sheet các lệnh kiểm thử trong dự án LUA Studio

```bash
# 1. Kiểm tra cú pháp và quy chuẩn code
cd frontend && npm run lint

# 2. Kiểm tra an toàn kiểu dữ liệu TypeScript (không sinh file tạm)
cd frontend && npx tsc --noEmit

# 3. Kiểm tra toàn diện quá trình build production & prerender (giống Vercel)
cd frontend && npm run build

# 4. Chạy kiểm tra kết hợp nhanh trước khi commit
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Khởi tạo tài liệu kiến thức kiểm thử phần mềm và chiến lược Frontend Testing Pyramid |
