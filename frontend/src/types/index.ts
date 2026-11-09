/** Một sản phẩm áo dài */
export interface Product {
  id: string;
  slug: string;
  name: string;
  images: string[];          // URL ảnh, index 0 = ảnh chính
  rentalPricePerDay: number; // VND
  sizes: Size[];
  occasion?: string;         // "Wedding" | "Editorial" | "Event"
  color?: string;
}

/** Size áo dài kèm số đo */
export interface Size {
  label: string;             // "XS" | "S" | "M" | "L" | "XL"
  bust: number;              // cm
  waist: number;             // cm
  hip: number;               // cm
  available: boolean;
}

/** Tuỳ chọn thời gian thuê */
export interface RentalOption {
  days: number;              // 4 | 8
  label: string;             // "4 ngày" | "8 ngày"
  priceMultiplier: number;   // 1 | 1.8 (ví dụ)
}

/** Phương thức giao nhận */
export type DeliveryMethod = "pickup" | "postal";

/** Thông tin đặt thuê */
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
  total: number;
}
