import { type ExistingBooking } from "@/types";

/**
 * =====================================================================
 * MOCK BOOKINGS (Lịch áo dài đã có khách đặt trước)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Đây là dữ liệu mẫu mô phỏng kịch bản đặt áo thực tế tại LUA Studio Melbourne:
 *   1. Khách A đã book áo dài Mã 12 (Bạch Liên - lua-001):
 *      - Ngày: 01/01/2027
 *      - Khung giờ lấy (Pickup): 08:00 AM
 *      - Khung giờ trả (Return): 08:00 PM (Gói trong ngày / 24h)
 *   2. Thời gian giặt hấp & khử khuẩn (Turnaround Cleaning Buffer):
 *      - Cần 6 đến 7 tiếng buffer sau khi khách hoàn trả (từ 20:00 đến 03:00 sáng hôm sau).
 *   3. Chặn Khách B:
 *      - Khách B KHÔNG THỂ book áo dài Mã 12 trong khung giờ 08:00 AM - 08:00 PM ngày 01/01/2027,
 *      - Và cũng KHÔNG THỂ book trong khoảng buffer 6-7h tiếp theo.
 *      - Khách B chỉ có thể chọn ngày tiếp theo (02/01/2027) sau khi quá trình giặt hấp hoàn tất.
 * =====================================================================
 */

export const MOCK_EXISTING_BOOKINGS: ExistingBooking[] = [
  {
    id: "bk-001",
    productId: "lua-001",
    productCode: "AD-12",
    customerName: "Bạn A (Đã xác nhận cọc)",
    startDate: "2027-01-01",
    endDate: "2027-01-01",
    pickupTime: "08:00 AM",
    returnTime: "08:00 PM",
    cleaningBufferHours: 7,
    bufferEndTime: "03:00 AM ngày 02/01/2027",
  },
  {
    id: "bk-002",
    productId: "lua-001",
    productCode: "AD-12",
    customerName: "Khách C (Chụp kỷ yếu)",
    startDate: "2026-12-16",
    endDate: "2026-12-19",
    pickupTime: "10:00 AM",
    returnTime: "06:00 PM",
    cleaningBufferHours: 7,
    bufferEndTime: "01:00 AM ngày 20/12/2026",
  },
  {
    id: "bk-003",
    productId: "lua-002",
    productCode: "AD-08",
    customerName: "Khách D (Lễ cưới Melbourne)",
    startDate: "2026-12-22",
    endDate: "2026-12-25",
    pickupTime: "09:00 AM",
    returnTime: "08:00 PM",
    cleaningBufferHours: 7,
    bufferEndTime: "03:00 AM ngày 26/12/2026",
  },
];
