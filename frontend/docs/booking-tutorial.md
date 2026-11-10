---
title: "Hướng dẫn Hệ thống Đặt thuê Áo Dài & Quản lý Lịch Khử Khuẩn (Booking Tutorial for Newbie)"
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
  - roadmap/0005-phase5.md
  - ../../docs/BUSINESS_REQUIREMENT.md
  - navigation-tutorial.md
tags: [frontend, tutorial, booking-system, rental-calendar, time-slots, turnaround-buffer, sizing-guide, newbie]
---

# Hướng dẫn Hệ thống Đặt thuê Áo Dài & Quản lý Lịch Khử Khuẩn (Booking Tutorial for Newbie)

Tài liệu này được biên soạn theo chuẩn [`DOC.md`](../../.agents/rule/DOC.md) dành cho các thành viên mới (newbie) khi tiếp cận và phát triển hệ thống giao diện cho thuê áo dài độc bản của **LUA Studio**. Hướng dẫn giải thích bản chất nghiệp vụ thực tế, cấu trúc code và cách vận hành các tính năng đặt lịch thông minh.

---

## 1. Định nghĩa & Bối cảnh: Tại sao cần hệ thống này?

> **Tóm tắt 1 câu:** Đây là hệ thống giao diện tương tác giúp khách hàng tự kiểm tra số đo áo, chọn gói ngày thuê, tự động xác định ngày trả, đặt khung giờ lấy/trả hợp lệ và ngăn chặn xung đột trùng lịch giữa các khách hàng kèm thời gian đệm vệ sinh tơ lụa 6–7 tiếng.

### Bài toán thực tế của Studio:
* **Trước đây (Cách làm thủ công)**:
  * Chủ shop (`pa`) đăng ảnh lên Google Drive để khách tự xem mẫu.
  * Hạn chế: Khách không biết số đo 3 vòng, không biết chiếc áo dài đã có ai thuê vào ngày sự kiện của mình hay chưa.
  * Hậu quả: Khách nhắn tin hỏi liên tục: *"Mẫu này mã gì? Eo 68 ngực 86 vừa không? Ngày mùng 1 còn trống không?"*. Mỗi ngày mất 30–45 phút/khách chỉ để tư vấn đi tư vấn lại.
* **Hiện tại (Chuyển đổi số trên Web)**:
  * Khách nhìn trực tiếp ảnh mẫu, mã áo (`AD-12`), chiều cao người mẫu (`1m68 Size S`) và bảng số đo chi tiết (ngực, eo, mông, chiều dài).
  * Khách tự chọn lịch trên website. Nếu có người khác đã đặt, web tự động thông báo và khóa nút.
  * Tiết kiệm 100% thời gian tư vấn thủ công lặp lại.

---

## 2. Bản đồ các file mã nguồn liên quan

Hệ thống đặt thuê áo dài vận hành dựa trên sự kết hợp chặt chẽ giữa 5 file chính:

```text
frontend/src/
├── data/
│   ├── products.ts                     # 1. Dữ liệu sản phẩm: Mã áo (AD-12), ảnh, số đo, người mẫu
│   └── bookings.ts                     # 2. Dữ liệu lịch đã book mẫu & kiểm tra xung đột thời gian
├── types/
│   └── index.ts                        # 3. Kiểu dữ liệu TypeScript: BookingDetails, ExistingBooking
├── components/
│   ├── blocks/
│   │   └── ProductBookingInteractive.tsx   # 4. Giao diện Đặt đồ: Lịch, Size, Giờ, Buffer, Nút Add
│   └── cart/
│       └── CartDrawer.tsx              # 5. Ngăn kéo Giỏ hàng: Hiển thị tóm tắt lịch đã chọn
```

---

## 3. Giải mã 5 Quy tắc Nghiệp vụ Cốt lõi

### Quy tắc 1: Đối chiếu Mã áo dài & Bảng số đo 3 vòng
* **File liên quan**: [`products.ts`](../src/data/products.ts) & [`ProductBookingInteractive.tsx`](../src/components/blocks/ProductBookingInteractive.tsx)
* **Ý nghĩa**: Mỗi chiếc áo dài là một tác phẩm độc bản. Khách hàng cần đối chiếu trực tiếp mã nhận diện (ví dụ: `AD-12`) và hình ảnh thu nhỏ ngay tại khối đặt lịch.
* **Thông số người mẫu**: `👤 Người mẫu cao 1m68 — Mặc Size S` giúp khách ước lượng chiều dài tà áo khi mặc lên người.
* **Bảng số đo chi tiết**: Khi bấm nút *"Bảng thông số số đo 3 vòng (cm)"*, một bảng tra cứu sẽ hiển thị:
  * Vòng ngực (Bust cm)
  * Vòng eo (Waist cm)
  * Vòng mông (Hip cm)
  * Chiều dài tà áo (Garment Length cm)

---

### Quy tắc 2: Gói thuê & Tự động tính Ngày trả đồ (Date Logic)
* **Các gói ngày thuê**:
  1. `1 ngày (Sự kiện 24h)`: Hệ số 0.45x — Dành cho khách chụp kỷ yếu, dự tiệc ngắn trong ngày.
  2. `4 ngày (Gói tiêu chuẩn)`: Hệ số 1.0x — Phù hợp đám cưới, lễ gia tiên (khuyên dùng).
  3. `8 ngày (Gói mở rộng)`: Hệ số 1.75x — Dành cho khách đi du lịch hoặc chụp ảnh cưới xa.
* **Công thức tự động tính ngày trả**:
  $$\text{Ngày trả (returnDate)} = \text{Ngày nhận (pickupDate)} + \text{Số ngày thuê (rentalDays)}$$
* **Cách code hoạt động trong React**:
  ```tsx
  // Khi khách bấm chọn ngày nhận (pickupDate)
  const d = new Date(pickupDate);
  d.setDate(d.getDate() + rentalDays); // Tự động cộng 1, 4 hoặc 8 ngày
  const returnDate = d.toISOString().split("T")[0]; // YYYY-MM-DD
  ```
* Trên giao diện, tất cả các ngày từ Ngày nhận đến Ngày trả sẽ được tự động tô nền nổi bật (`bg-brand-surface`).

---

### Quy tắc 3: Khung giờ Lấy phải TRƯỚC, Trả phải SAU
* **Khung giờ hỗ trợ**:
  * Giờ lấy đồ (Pickup): `08:00 AM` đến `08:00 PM`.
  * Giờ trả đồ (Return): `09:00 AM` đến `11:00 PM`.
* **Ràng buộc thời gian**:
  * Khi khách chọn gói thuê trong ngày (1 ngày): Giờ lấy bắt buộc phải diễn ra trước giờ trả.
  * Nếu chọn giờ lấy là `02:00 PM` thì giờ trả không thể là `10:00 AM`. Nếu vi phạm, hệ thống hiển thị cảnh báo: *"Khung giờ lấy đồ phải diễn ra trước khung giờ trả đồ"*.

---

### Quy tắc 4: Cảnh báo trả ngoài giờ làm việc (Sau 21:00)
* **Quy định của Studio**: Studio đóng cửa ngưng đón khách sau **21:00 (9:00 PM)**.
* **Xử lý khi khách chọn trả muộn (`09:30 PM`, `10:00 PM`, `11:00 PM`)**:
  1. Hiển thị ngay hộp cảnh báo màu vàng hổ phách (Amber Warning):
     > *"Studio ngưng tiếp khách sau 21:00. Bạn đang chọn trả lúc {returnTime}. Yêu cầu này cần nhân viên liên hệ xác nhận (follow-up) và áp dụng phụ phí trả muộn ngoài giờ + $20 AUD (150.000₫)."*
  2. Tự động cộng thêm khoản phụ phí ngoài giờ `+$20 AUD` vào bảng tính tổng tiền (Price Breakdown).
  3. Giúp chủ shop (`pa`) nắm bắt trước thông tin để chủ động phân công nhân sự đón khách hoặc hướng dẫn khách bỏ đồ vào locker an toàn.

---

### Quy tắc 5: Chặn trùng lịch Bạn B & Buffer khử khuẩn 6–7 tiếng
Đây là **thuật toán quan trọng nhất** trong file [`bookings.ts`](../src/data/bookings.ts).

#### Bài toán thực tế:
1. **Bạn A** đã đặt áo dài **Mã 12** (`AD-12`):
   * Lấy lúc: `08:00 AM ngày 01/01/2027`.
   * Trả lúc: `08:00 PM ngày 01/01/2027` (thuê 24h).
2. **Tại sao không thể cho Bạn B thuê ngay lúc 08:30 PM?**
   * Áo dài tơ lụa tự nhiên là sản phẩm mỏng manh, cao cấp.
   * Ngay sau khi Bạn A hoàn trả lúc 8:00 PM, studio cần một **khoảng thời gian đệm (Buffer 6–7 tiếng)** đến `03:00 AM ngày 02/01/2027` để:
     * Soi kính kiểm tra đường chỉ may, hạt cườm đính thủ công.
     * Giặt hấp sinh học chuyên sâu (Eco Gentle Steaming) bảo vệ sợi lụa.
     * Khử khuẩn bằng buồng tia cực tím UV và là ủi phom dáng.
3. **Quy tắc chặn Bạn B**:
   * Bạn B **KHÔNG THỂ** đặt trong khoảng thời gian `08:00 AM – 08:00 PM ngày 01/01/2027` của Bạn A.
   * Bạn B **KHÔNG THỂ** đặt trong khoảng 7 tiếng giặt hấp tiếp theo (`20:00 ngày 01/01/2027` đến `03:00 AM ngày 02/01/2027`).
   * Bạn B chỉ có thể đặt chiếc áo này từ khung giờ mở cửa tiếp theo: **08:00 AM ngày 02/01/2027** trở đi.

#### Cách thuật toán kiểm tra xung đột trong Code:
```typescript
// Chuyển đổi ngày và giờ thành mốc thời gian dạng số (Timestamp ms)
const requestedStart = new Date(`${startDate} ${pickupTime}`).getTime();
const requestedEnd = new Date(`${endDate} ${returnTime}`).getTime();

// Duyệt qua danh sách các đơn đã đặt trước trong cơ sở dữ liệu
for (const booking of existingBookings) {
  const bookedStart = new Date(`${booking.startDate} ${booking.pickupTime}`).getTime();
  // Mốc sẵn sàng tiếp theo = Thời điểm khách cũ trả đồ + 7 tiếng buffer vệ sinh
  const readyAfterBuffer = new Date(`${booking.endDate} ${booking.returnTime}`).getTime() 
                           + booking.bufferHours * 60 * 60 * 1000;

  // Nếu thời gian khách mới chọn rơi vào khoảng giữa lúc khách cũ lấy và lúc hoàn tất khử khuẩn:
  const isOverlap = (requestedStart < readyAfterBuffer) && (requestedEnd > bookedStart);
  
  if (isOverlap) {
    return {
      hasConflict: true,
      message: `Chiếc áo này đang có khách thuê từ ${booking.pickupTime} ngày ${booking.startDate} đến ${booking.returnTime} ngày ${booking.endDate}. Cần thêm ${booking.bufferHours} tiếng giặt hấp & khử khuẩn UV trước khi cho khách tiếp theo thuê.`
    };
  }
}
```

---

## 4. Hướng dẫn Thực hành Kiểm thử (Hands-on Testing Guide)

Dành cho bạn khi muốn kiểm tra tính đúng đắn trên máy tính cá nhân:

### Bước 1: Khởi động môi trường phát triển
```bash
cd frontend
npm run dev
```
Mở trình duyệt truy cập: **`http://localhost:3000/product/bach-lien-ivory-silk`**

### Bước 2: Kiểm tra đối chiếu mã áo & số đo
1. Nhìn lên phần đầu của hộp đặt đồ: Kiểm tra xem có thấy huy hiệu `MÃ: AD-12` và ảnh nhỏ của áo dài Bạch Liên hay không.
2. Bấm vào chữ **"BẢNG THÔNG SỐ SỐ ĐO 3 VÒNG (CM)"**: Xem bảng số đo ngực, eo, mông của từng size XS, S, M, L, XL.

### Bước 3: Thử nghiệm kịch bản Bạn A & Bạn B (Xung đột lịch)
1. Trên giao diện lịch, bấm vào nút tiện ích: **`[Thử kịch bản Bạn A: 01/01/2027]`**.
2. Hệ thống sẽ lập tức nhảy sang Tháng 1/2027 và chọn ngày `01/01/2027`:
   * Quan sát: Ngày `01/01/2027` trên lịch có họa tiết sọc chéo mờ và chữ `ĐÃ BOOK`.
   * Quan sát: Banner đỏ cảnh báo xuất hiện thông báo áo đang có khách thuê và cần 7 tiếng giặt hấp đến 03:00 AM ngày 02/01/2027.
   * Quan sát: Nút **"THÊM VÀO GIỎ HÀNG"** bị vô hiệu hóa (disabled), không thể bấm được.

### Bước 4: Thử nghiệm cảnh báo trả sau 21:00
1. Chọn một ngày còn trống (ví dụ: ngày 15 tháng 12 năm 2026).
2. Tại mục **Giờ trả đồ**, chọn `10:00 PM`.
3. Quan sát: Hộp cảnh báo màu vàng hổ phách xuất hiện thông báo về việc trả ngoài giờ làm việc.
4. Nhìn xuống mục **TỔNG CỘNG TẠM TÍNH**: Thấy xuất hiện thêm dòng `Phụ phí trả ngoài giờ: +$20 AUD (150.000₫)`.

### Bước 5: Thêm vào giỏ hàng
1. Chọn phương thức nhận: `Bưu điện Úc (Post Express +$16.95 AUD)`.
2. Bấm nút **"THÊM VÀO GIỎ HÀNG"**.
3. Ngăn kéo giỏ hàng (Cart Drawer) mở ra từ cạnh phải, kiểm tra xem có hiển thị đầy đủ:
   * Mã áo: `AD-12`
   * Size áo
   * Dải ngày thuê: `15/12/2026 ➔ 19/12/2026`
   * Giờ nhận: `08:00 AM` — Giờ trả: `10:00 PM`
   * Phí ship bưu điện và Phụ phí ngoài giờ.

---

## 5. Làm thế nào để thêm/sửa một đơn lịch mẫu?

Nếu muốn thêm một lịch đã book mẫu khác để thử nghiệm:
1. Mở file [`frontend/src/data/bookings.ts`](../src/data/bookings.ts).
2. Tìm mảng `MOCK_EXISTING_BOOKINGS` và thêm một đối tượng mới:
```typescript
{
  id: "booking-demo-02",
  productId: "lua-001",
  productCode: "AD-12",
  customerName: "Chị Lan",
  startDate: "2026-12-25",
  endDate: "2026-12-25",
  pickupTime: "09:00 AM",
  returnTime: "06:00 PM",
  bufferHours: 7, // 7 tiếng khử khuẩn sau 18:00
  notes: "Tiệc giáng sinh"
}
```
3. Lưu file và reload lại trang web, ngày 25/12/2026 sẽ tự động bị khóa và kiểm tra xung đột theo đúng quy tắc!

---

## Lịch sử thay đổi

| Version | Ngày | Người sửa | Agent | Mô tả thay đổi |
| :--- | :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Khởi tạo tài liệu Hướng dẫn Hệ thống Đặt thuê Áo Dài (Booking Tutorial) chuẩn DOC.md cho newbie |
