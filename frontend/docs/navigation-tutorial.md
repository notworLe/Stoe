---
title: "Hướng dẫn Hệ thống Navigation & Mobile Menu (Tutorial for Newbie)"
doc_type: tutorial
project: retail-system
layer: frontend
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
  - README.md
  - roadmap/ROADMAP.md
  - roadmap/0003-phase3.md
  - ../design-system/sunriseblooms/MASTER.md
tags: [frontend, tutorial, navigation, mobile-menu, react, nextjs, tailwind]
---

# Hướng dẫn Hệ thống Navigation & Mobile Menu (Tutorial for Newbie)

Tài liệu này được biên soạn dành cho lập trình viên mới bắt đầu (newbie) khi tham gia phát triển dự án **LUA Studio** (`retail-system`). Hướng dẫn giải thích bản chất hệ thống điều hướng, cách tổ chức code và các bước thực hành để tự tin chỉnh sửa giao diện.

---

## 1. Định nghĩa: Hướng dẫn này là gì?

> **Tóm tắt 1 câu:** Đây là cuốn cẩm nang thực hành giải thích cách xây dựng, vận hành và tùy biến thanh điều hướng (Desktop Header) cùng menu di động (Mobile Hamburger Drawer) trong Next.js 16 (App Router) và Tailwind CSS.

### Mục tiêu của tài liệu:
1. **Giải mã luồng dữ liệu**: Hiểu cách component cha (`Header.tsx`) truyền dữ liệu và điều khiển component con (`MobileMenu.tsx`).
2. **Hiểu bản chất React Hooks**: Giải thích dễ hiểu các khái niệm kỹ thuật như `"use client"`, `useState`, `useEffect`.
3. **Cẩm nang thực hành "cầm tay chỉ việc"**: Biết chính xác cần mở file nào, sửa dòng nào khi muốn thêm/sửa/xóa một liên kết trên trang web.

---

## 2. Kiến trúc tổng quan hệ thống Navigation

Hệ thống điều hướng gồm 3 file chính làm việc cùng nhau:

```text
frontend/src/
├── lib/
│   └── constants.ts          # 1. Nguồn dữ liệu gốc (Single Source of Truth)
└── components/
    └── layout/
        ├── Header.tsx        # 2. Thanh điều hướng Desktop & Nút bấm Hamburger
        └── MobileMenu.tsx    # 3. Giao diện Menu toàn màn hình trên điện thoại
```

### Sơ đồ hoạt động:
```
[ constants.ts ] ──> Cung cấp danh sách đường dẫn (HOME, ABOUT, PROCESS, PORTFOLIO, INSTAGRAM, GET IN TOUCH)
       │
       ▼
 [ Header.tsx ] ────> Hiển thị thanh ngang trên Desktop (≥ 768px).
       │              Trên Mobile (< 768px): Hiện icon Hamburger.
       ▼ (bấm nút)
[ MobileMenu.tsx ] ─> Mở toàn màn hình khi bấm Hamburger, đóng lại khi bấm CLOSE hoặc click vào link.
```

---

## 3. Giải phẫu chi tiết Component [`MobileMenu.tsx`](../src/components/layout/MobileMenu.tsx)

### 3.1 `"use client"` ở đầu file nghĩa là gì?
Trong Next.js (App Router), mặc định mọi file đều chạy trên máy chủ (Server Component).  
Dòng `"use client"` báo cho Next.js biết file này có **tương tác của người dùng trên trình duyệt** (bấm nút, lắng nghe bàn phím, đóng mở giao diện).

### 3.2 Props là gì? (`isOpen` và `onClose`)
Props giống như các tham số truyền vào một hàm:
* `isOpen` *(kiểu boolean - true/false)*:
  * Nếu là `true`  👉 Menu đang mở, hiển thị toàn bộ giao diện.
  * Nếu là `false` 👉 Menu đang đóng, component trả về `null` (ẩn hoàn toàn).
* `onClose` *(kiểu function)*: Hàm hành động được gọi khi muốn đóng menu (khi bấm nút CLOSE, bấm phím Escape, hoặc bấm chọn 1 trang để xem).

### 3.3 Hai Hook quan trọng: `useEffect`

#### Hook 1: Khóa thanh cuộn trang web khi mở menu
```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden"; // Khóa cuộn trang nền
  } else {
    document.body.style.overflow = "";       // Mở lại bình thường
  }
  return () => {
    document.body.style.overflow = "";       // Dọn dẹp an toàn khi tắt component
  };
}, [isOpen]);
```
👉 **Tại sao cần?** Tránh việc người dùng vừa lướt menu điện thoại vừa vô tình làm cuộn trang web mờ mờ ở phía sau.

#### Hook 2: Bấm phím `Escape` trên bàn phím để đóng menu
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      onClose(); // Đóng menu
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose]);
```
👉 **Tại sao cần?** Tạo cảm giác chuyên nghiệp và thân thiện cho người dùng dùng máy tính bảng hoặc bàn phím rời.

---

## 4. Danh sách 5 mục chính + 1 mục hành động (Get In Touch)

Trong [`MobileMenu.tsx`](../src/components/layout/MobileMenu.tsx), danh sách điều hướng được quản lý bởi 2 biến rõ ràng:

### A. Mảng 5 mục chính (`MOBILE_NAV_ITEMS`):
```tsx
const MOBILE_NAV_ITEMS = [
  { id: "home",      label: "HOME",      href: "/",                                       isExternal: false },
  { id: "about",     label: "ABOUT",     href: "#about",                                  isExternal: false },
  { id: "process",   label: "PROCESS",   href: "/size-guide",                             isExternal: false },
  { id: "portfolio", label: "PORTFOLIO", href: "/portfolio",                              isExternal: false },
  { id: "instagram", label: "INSTAGRAM", href: "https://www.instagram.com/luastudio.melb", isExternal: true },
] as const;
```

### B. Nút hành động nổi bật (`GET_IN_TOUCH_ACTION`):
```tsx
const GET_IN_TOUCH_ACTION = {
  label: "GET IN TOUCH",
  href: "/contact",
};
```

---

## 5. Cẩm nang thực hành (How-to dành cho Newbie)

### Hướng dẫn 1: Muốn đổi tên chữ hiển thị hoặc đường dẫn URL
* **Bước 1**: Mở file [`frontend/src/components/layout/MobileMenu.tsx`](../src/components/layout/MobileMenu.tsx).
* **Bước 2**: Tìm mảng `MOBILE_NAV_ITEMS`.
* **Bước 3**: Sửa trực tiếp giá trị `label` (chữ hiển thị) hoặc `href` (link đích).
  * *Ví dụ*: Đổi `label: "PROCESS"` thành `label: "HƯỚNG DẪN THUÊ"`.

### Hướng dẫn 2: Muốn thêm một mục mới thứ 6 vào menu
* **Bước 1**: Thêm một dòng object mới vào bên trong mảng `MOBILE_NAV_ITEMS`:
  ```tsx
  {
    id: "faqs",
    label: "FAQS",
    href: "/faqs",
    isExternal: false,
    description: "Câu hỏi thường gặp",
  },
  ```
* **Bước 2**: Lưu file. Hệ thống sẽ tự động vẽ thêm dòng này kèm icon chevron `>` mà bạn không cần phải viết thêm bất kỳ thẻ HTML nào!

### Hướng dẫn 3: Muốn đổi chữ của nút hành động dưới cùng
* Tìm biến `GET_IN_TOUCH_ACTION`:
  ```tsx
  const GET_IN_TOUCH_ACTION = {
    label: "GET CONNECT", // Đổi tên nút ở đây
    href: "/contact",     // Đổi trang chuyển đến ở đây
  };
  ```

### Hướng dẫn 4: Khi nào dùng thẻ `<Link>` và khi nào dùng thẻ `<a>`?
* **Thẻ `<Link href="...">` của Next.js**: Dùng cho các trang **nội bộ** bên trong website (ví dụ `/about`, `/portfolio`). Giúp chuyển trang tức thì chỉ trong 0.1 giây mà không cần load lại toàn bộ website.
* **Thẻ `<a href="..." target="_blank">`**: Dùng cho các trang **bên ngoài** (ví dụ link sang Instagram, Facebook, Google Maps).

---

## 6. Các lỗi thường gặp & Cách khắc phục (Troubleshooting)

| Vấn đề | Nguyên nhân | Cách xử lý |
|---|---|---|
| **Click vào link nhưng menu không chịu đóng** | Quên gắn sự kiện `onClick={onClose}` vào thẻ `<Link>` hoặc `<a>`. | Đảm bảo mỗi thẻ điều hướng đều có `onClick={onClose}`. |
| **Menu hiển thị đè lên màn hình Desktop** | Thiếu class `md:hidden` ở thẻ container ngoài cùng. | Kiểm tra xem container menu đã có class `md:hidden` chưa. |
| **Chữ bị nhảy dòng lộn xộn** | Dùng nhầm class khoảng cách `--spacing-*` thay vì `--space-*`. | Tuân thủ token chuẩn tại [`MASTER.md`](../design-system/sunriseblooms/MASTER.md). |

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Khởi tạo tài liệu hướng dẫn và định nghĩa hệ thống Navigation & Mobile Menu cho newbie |
