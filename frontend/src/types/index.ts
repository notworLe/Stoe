/** Một sản phẩm áo dài */
export interface Product {
  id: string;
  code?: string;             // Mã áo dài đối chiếu (vd: "AD-12", "AD-08")
  slug: string;
  name: string;
  images: string[];          // URL ảnh, index 0 = ảnh chính
  rentalPricePerDay: number; // VND
  rentalPriceAud?: number;   // Giá thuê niêm yết tại Melbourne (AUD) cho gói tiêu chuẩn 4 ngày
  sizes: Size[];
  occasion?: string;         // "Wedding" | "Editorial" | "Tea Ceremony" | "Event"
  color?: string;            // "Ivory" | "Sage" | "Terracotta" | "Rose"
  description?: string;      // Mô tả phom dáng, chất liệu lụa
  modelInfo?: {
    height: string;          // vd: "1m68"
    wearingSize: string;     // vd: "Size S"
  };
}

/** Trạng thái bộ lọc sản phẩm cho trang Shop / Collection */
export interface ProductFilters {
  occasion: string;          // Dịp mặc: "all" | "Wedding" | "Editorial" | "Tea Ceremony" | "Event"
  size: string;              // Size: "all" | "XS" | "S" | "M" | "L" | "XL"
  color: string;             // Màu sắc: "all" | "Ivory" | "Sage" | "Terracotta" | "Rose"
  sortBy: "featured" | "price-asc" | "price-desc"; // Tiêu chí sắp xếp
}

/** Size áo dài kèm số đo chuẩn cm */
export interface Size {
  label: string;             // "XS" | "S" | "M" | "L" | "XL"
  bust: number;              // cm (vòng ngực)
  waist: number;             // cm (vòng eo)
  hip: number;               // cm (vòng mông)
  length?: number;           // cm (chiều dài áo dài từ cổ xuống gấu)
  available: boolean;
}

/** Tuỳ chọn thời gian thuê */
export interface RentalOption {
  days: number;              // 4 | 8
  label: string;             // "4 ngày" | "8 ngày"
  priceMultiplier: number;   // 1 | 1.75
}

/** Phương thức giao nhận */
export type DeliveryMethod = "pickup" | "post" | "postal";

/** Chi tiết lịch đặt thuê áo dài của khách */
export interface BookingDetails {
  startDate: string;         // Ngày lấy (YYYY-MM-DD)
  endDate: string;           // Ngày trả tự động tính (YYYY-MM-DD)
  pickupTime: string;        // Khung giờ lấy (vd: "08:00 AM")
  returnTime: string;        // Khung giờ trả (vd: "08:00 PM")
  isAfterHoursReturn: boolean; // Trả sau 21:00 (giờ làm việc ngưng)
  afterHoursFeeAud: number;  // Phụ phí ngoài giờ AUD (nếu có, vd: 20)
  afterHoursFeeVnd: number;  // Phụ phí ngoài giờ VND (nếu có, vd: 150000)
  deliveryMethod: DeliveryMethod; // "pickup" (Studio) | "post" (Bưu điện Úc)
  deliveryFeeAud: number;    // Phí bưu điện AUD (vd: 16.95 hoặc 0)
  deliveryFeeVnd: number;    // Phí bưu điện VND (vd: 280000 hoặc 0)
}

/** Lịch đặt trước đã có của khách khác (để test chặn trùng lịch và buffer 6-7h) */
export interface ExistingBooking {
  id: string;
  productId: string;
  productCode: string;
  customerName: string;      // "Bạn A"
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  pickupTime: string;        // "08:00 AM"
  returnTime: string;        // "08:00 PM"
  cleaningBufferHours: number; // 6-7 tiếng giặt hấp & khử khuẩn
  bufferEndTime: string;     // Khung giờ hoàn tất khử khuẩn
}

/** Thông tin đặt thuê cơ bản */
export interface BookingState {
  productId: string;
  selectedSize: string | null;
  rentalDays: number | null;
  deliveryMethod: DeliveryMethod | null;
  deliveryDate: Date | null;
  returnDate: Date | null;
}

/** Breakdown giá trước checkout */
export interface PriceBreakdown {
  rentalFee: number;
  deliveryFee: number;
  afterHoursFee: number;
  total: number;
}

/** Một món đồ trong giỏ hàng đặt thuê áo dài */
export interface CartItem {
  id: string;               // Mã định danh giỏ hàng
  product: Product;         // Thông tin sản phẩm
  size: string;             // Size khách chọn: "XS" | "S" | "M" | "L" | "XL"
  rentalDays: number;       // Thời gian thuê: 4 hoặc 8 ngày
  quantity: number;         // Số lượng
  pricePerItemAud: number;  // Giá thuê AUD cho gói ngày đã chọn
  pricePerItemVnd: number;  // Giá thuê VND cho gói ngày đã chọn
  bookingDetails?: BookingDetails; // Chi tiết ngày giờ nhận/trả & phương thức nhận
}
