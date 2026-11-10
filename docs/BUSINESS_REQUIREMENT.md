---
title: "Business Requirements — Áo Dài Rental Booking & Inventory Operations"
doc_type: requirement
project: retail-system
layer: business
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
  - ../frontend/docs/roadmap/ROADMAP.md
  - ../frontend/docs/roadmap/0005-phase5.md
  - ../log/DECISION_LOG.md
  - ../log/AI_THINKING.md
tags: [business-logic, rental-booking, time-slots, turnaround-buffer, sizing, editorial-boutique, frontend]
---

# Business Requirements — Áo Dài Rental Booking & Inventory Operations

Tài liệu đặc tả toàn diện yêu cầu nghiệp vụ thực tế cho hệ thống đặt thuê trang phục áo dài độc bản của **LUA STUDIO** (Melbourne, Australia).  
Tài liệu này đóng vai trò là "Kim chỉ nam nghiệp vụ" (Business Ground Truth) để đội ngũ phát triển và AI Agent đối chiếu khi thiết kế giao diện, luồng đặt hàng và xử lý xung đột tồn kho.

---

## 1. Bối cảnh Thực tế & Vấn đề Cần Giải Quyết (Pain Points)

### 1.1 Khó khăn trong vận hành trước đây
* **Quản lý thủ công qua Google Drive**:
  * Trước đây, chủ studio (`pa`) đăng tải ảnh áo dài lên thư mục Google Drive để khách hàng duyệt mẫu.
  * *Hạn chế*: Drive chỉ hiển thị file ảnh, không gắn kèm được thông tin số đo 3 vòng (ngực, eo, mông), chiều dài tà áo, chiều cao người mẫu, cũng như lịch còn trống hay đã có người thuê.
* **Tắc nghẽn tư vấn lặp đi lặp lại (Repetitive Consultation)**:
  * Khách hàng liên tục nhắn tin hỏi các câu hỏi cơ bản:
    * *"Mẫu này mã gì, size mấy?"*
    * *"Số đo eo 68cm, ngực 86cm có vừa không?"*
    * *"Ngày 01/01/2027 mẫu này còn trống không?"*
    * *"Mấy giờ lấy đồ được và mấy giờ phải hoàn trả?"*
  * Chủ shop mất từ 30 đến 45 phút cho mỗi lượt khách chỉ để tư vấn số đo và kiểm tra chéo lịch thủ công trên sổ sách.

### 1.2 Giải pháp chuyển đổi số trên Website (Tầng Frontend)
* Đưa toàn bộ thông số kỹ thuật, số đo, mã áo và lịch trống trực quan lên Website.
* **Nguyên tắc đầu tư thời gian**:
  > *"Chấp nhận mất thời gian ban đầu để nhập liệu dữ liệu chuẩn chỉnh lên web một lần, đổi lại giải phóng 100% thời gian tư vấn thủ công lặp lại sau này."*

---

## 2. Đặc tả Nghiệp vụ Chi tiết (Detailed Business Specifications)

### 2.1 Đối chiếu Mã Áo Dài & Số Đo Trực Tiếp (Visual & Sizing Verification)
1. **Mã thiết kế nhận diện độc bản (Product Code)**:
   * Mỗi chiếc áo dài là tài sản độc bản (unique physical inventory).
   * Trên giao diện bắt buộc hiển thị rõ **Mã áo dài** (ví dụ: `AD-12`, `AD-08`, `AD-15`) kèm ảnh thumbnail chân dung để khách nhìn đối chiếu trực tiếp, tránh nhầm lẫn giữa các mẫu lụa tương đồng.
2. **Thông số người mẫu thực tế (Model Reference)**:
   * Hiển thị chiều cao và size người mẫu mặc chụp hình (ví dụ: `👤 Người mẫu cao 1m68 — Mặc Size S`).
   * Giúp khách hàng hình dung chính xác độ dài tà áo và độ ôm phom dáng.
3. **Bảng số đo 3 vòng minh bạch (Size Guide cm)**:
   * Cung cấp bảng tra cứu số đo đầy đủ cho từng size (XS, S, M, L, XL):
     * Vòng ngực (Bust cm)
     * Vòng eo (Waist cm)
     * Vòng mông (Hip cm)
     * Chiều dài áo (Length cm — từ vai xuống gấu)
   * Size nào tạm hết hàng phải bị làm mờ và gạch ngang (`line-through`), không cho bấm chọn.

---

### 2.2 Gói Thời Gian Thuê & Tự Động Tính Ngày Hoàn Trả (Rental Period & Date Logic)
Tham chiếu theo chuẩn giao diện [`frontend/docs/booking-date.png`](../frontend/docs/booking-date.png) từ các nền tảng cho thuê trang phục cao cấp tại Melbourne:

| Gói thuê | Số ngày (`rentalDays`) | Hệ số giá (`multiplier`) | Mục đích sử dụng |
| :--- | :---: | :---: | :--- |
| **Gói 24h sự kiện** | 1 ngày | `0.45x` | Chụp kỷ yếu ngắn, dự tiệc trong ngày (lấy sáng 8am, trả tối 8pm). |
| **Gói Tiêu chuẩn** | 4 ngày | `1.0x` (Base) | Dự đám cưới, lễ gia tiên tại Melbourne (khuyên dùng). |
| **Gói Mở rộng** | 8 ngày | `1.75x` | Khách đi du lịch xa, chụp ảnh cưới dài ngày ngoài tiểu bang. |

* **Quy tắc tính Ngày trả (Return Date)**:
  $$\text{Return Date} = \text{Pickup Date} + \text{Rental Days}$$
  * Ví dụ: Khách chọn lấy đồ ngày **15/12/2026** (Gói 4 ngày) ➔ Hệ thống tự động xác định Ngày hoàn trả là **19/12/2026**.
  * Dải ngày từ ngày nhận đến ngày trả được tô màu highlight trực quan trên lịch tháng.

---

### 2.3 Khung Giờ Lấy Đồ & Hoàn Trả (Time Slots Logic)
1. **Khung giờ làm việc tiêu chuẩn (Standard Business Hours)**:
   * Giờ mở cửa: **08:00 AM**
   * Giờ đóng cửa: **09:00 PM (21:00)**
2. **Ràng buộc thứ tự thời gian**:
   * Khung giờ lấy đồ (Pickup Slot) phải diễn ra **TRƯỚC** khung giờ trả đồ (Return Slot).
   * Đối với gói 1 ngày (24h sự kiện): Nếu lấy lúc `08:00 AM` thì khung giờ trả phải từ `09:00 AM` trở đi (thông thường là `08:00 PM`).

---

### 2.4 Cảnh Báo Trả Đồ Sau Giờ Hành Chính (After-Hours Surcharge & Follow-up Alert)
* **Quy định giờ đóng cửa**: Studio ngưng đón khách sau **21:00 (9:00 PM)**.
* **Nghiệp vụ khi khách chọn trả muộn (sau 21:00)**:
  * Các slot sau 21:00 gồm: `09:30 PM`, `10:00 PM`, `11:00 PM`.
  * Khi khách chọn các slot này, hệ thống giao diện **BẮT BUỘC hiển thị hộp cảnh báo màu vàng ấm (Amber Alert)**:
    > **⚠️ LƯU Ý TRẢ ĐỒ NGOÀI GIỜ LÀM VIỆC (Sau 21:00):**  
    > Studio ngưng tiếp khách sau 21:00. Bạn đang chọn trả đồ lúc **{returnTime}**. Yêu cầu này sẽ được nhân viên liên hệ xác nhận (follow-up) để sắp xếp người nhận, và áp dụng phụ phí trả muộn ngoài giờ **+ $20 AUD (150.000₫)**.
  * **Mục đích**:
    1. Giúp chủ shop (`pa`) biết trước lịch trả muộn để chủ động phân công nhân sự trực hoặc thỏa thuận phương án bàn giao (ví dụ: gửi locker bảo mật).
    2. Minh bạch phụ phí ngoài giờ ngay từ bước đặt đồ, tránh tranh chấp về sau.

---

### 2.5 Chặn Trùng Lịch & Turnaround Buffer Giặt Hấp 6–7 Tiếng (Conflict & Sanitization Buffer)

Đây là **nghiệp vụ quan trọng nhất** nhằm bảo toàn chất lượng trang phục tơ lụa cao cấp:

#### Tình huống thực tế (Case Study):
1. **Khách A** book áo dài **Mã 12** (`AD-12`):
   * Ngày nhận: `01/01/2027` lúc `08:00 AM` (Pickup).
   * Ngày trả: `01/01/2027` lúc `08:00 PM` (Return — thuê 24h).
2. **Quy trình hoàn tất sau khi nhận lại áo (Turnaround Process)**:
   * Ngay sau khi Khách A hoàn trả lúc `08:00 PM`, studio cần **6 đến 7 tiếng buffer** (từ `20:00` ngày `01/01/2027` đến `03:00` sáng hôm sau `02/01/2027`) để thực hiện:
     * Kiểm tra kỹ lưỡng đường kim mũi chỉ, hạt ngọc đính kết và tà áo.
     * Giặt hấp sinh học nhẹ nhàng (Eco Gentle Steaming) bảo vệ sợi tơ tằm.
     * Khử khuẩn tia cực tím UV và là hơi phẳng phiu.
3. **Quy tắc chặn Khách B**:
   * Khách B **TUYỆT ĐỐI KHÔNG THỂ** book chiếc áo dài Mã 12 trong khung giờ `08:00 AM - 08:00 PM` ngày `01/01/2027` của Khách A.
   * Khách B cũng **KHÔNG THỂ** book trong khoảng **6-7 tiếng buffer** tiếp theo.
   * Khách B chỉ có thể book chiếc áo dài này từ khung giờ mở cửa tiếp theo: **08:00 AM ngày 02/01/2027** trở đi.
4. **Phản hồi giao diện (UI Handling)**:
   * Trên lịch: Ngày `01/01/2027` hiển thị hoa văn gạch chéo mờ (`strikethrough / diagonal pattern`), gắn cờ `Đã book`.
   * Nếu Khách B cố tình chọn ngày/giờ bị trùng:
     * Hiển thị hộp cảnh báo màu đỏ/hổ phách nêu rõ lý do và mốc thời gian hoàn tất giặt hấp (`03:00 AM ngày 02/01/2027`).
     * Nút **THÊM VÀO GIỎ HÀNG** tự động bị vô hiệu hóa (`disabled`).

---

### 2.6 Phương Thức Giao Nhận (Delivery Methods)
Khớp theo giao diện thực tế tại Úc ([`booking-date.png`](../frontend/docs/booking-date.png)):

1. **Pickup (Nhận tại Studio Melbourne VIC)**:
   * Khách đến thử trực tiếp và nhận đồ tại studio.
   * Phí vận chuyển: **$0 AUD (Miễn phí)**.
2. **Post (Bưu điện Úc / Australia Post Express)**:
   * Chuyển phát nhanh bưu điện có bảo hiểm hàng may mặc.
   * Phí vận chuyển: **+$16.95 AUD** (quy đổi `280.000₫`).
   * Tự động cộng vào bảng tính tổng tiền (Price Breakdown).

---

## 3. Bản Đồ Dữ Liệu Tích Hợp Frontend (Data Contracts)

```typescript
export interface BookingDetails {
  startDate: string;           // Ngày lấy (YYYY-MM-DD)
  endDate: string;             // Ngày trả tự động tính (YYYY-MM-DD)
  pickupTime: string;          // Khung giờ lấy (vd: "08:00 AM")
  returnTime: string;          // Khung giờ trả (vd: "08:00 PM")
  isAfterHoursReturn: boolean; // Trả sau 21:00
  afterHoursFeeAud: number;    // Phụ phí ngoài giờ AUD ($20)
  afterHoursFeeVnd: number;    // Phụ phí ngoài giờ VND (150.000₫)
  deliveryMethod: "pickup" | "post"; // Hình thức nhận
  deliveryFeeAud: number;      // Phí ship AUD ($0 hoặc $16.95)
  deliveryFeeVnd: number;      // Phí ship VND (0 hoặc 280.000₫)
}
```

---

## 4. Phạm Vi & Ranh Giới Kỹ Thuật (Boundaries)

* **Ranh giới hiện tại**: Toàn bộ nghiệp vụ trên được triển khai hoàn chỉnh ở tầng **FRONTEND** (Next.js Client Components, React 19 State, CartContext, Mock Data).
* **Không làm**: Chưa gọi API backend hay sửa đổi cơ sở dữ liệu PostgreSQL trong giai đoạn này.
* **Tính tương thích**: Sẵn sàng chuyển giao dữ liệu `bookingDetails` sang API đặt hàng ở các giai đoạn tiếp theo.

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Khởi tạo tài liệu đặc tả nghiệp vụ đặt thuê áo dài, khung giờ, buffer 6-7h và phụ phí ngoài giờ |
