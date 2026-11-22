/** Delivery methods supported by Maison de Lua */
export type DeliveryMethod = "pick_in_person" | "transport_post";

/** Rental time packages in days */
export type RentalDays = 1 | 2 | 4 | 8;

/** Payment methods for guest checkout (AUD) */
export type PaymentMethod = "card" | "bank_transfer" | "studio_pay";

/** Booking status lifecycle */
export type BookingStatus = "pending" | "confirmed" | "active" | "returned" | "cancelled";

/** Transaction payment status */
export type TransactionStatus = "paid" | "pending" | "refunded" | "failed";

/** Standard size specification with garment measurements in cm */
export interface Size {
  label: string; // "XS" | "S" | "M" | "L" | "XL"
  bust: number; // cm
  waist: number; // cm
  hip: number; // cm
  length: number; // cm
  available: boolean;
}

/** Unique Ao Dai garment in the archive */
export interface Product {
  id: string;
  code: string; // e.g., "AD-12"
  slug: string;
  name: string;
  images: string[];
  rentalPriceAud: number; // Base 4-day rate in AUD
  sizes: Size[];
  occasion: string; // "Wedding" | "Tea Ceremony" | "Editorial" | "Event"
  color: string; // "Ivory" | "Sage" | "Terracotta" | "Rose"
  description: string;
  modelInfo?: {
    height: string; // e.g., "168 cm"
    wearingSize: string; // e.g., "Size S"
  };
  isActive?: boolean;
}

/** Filter state for /product archive */
export interface ProductFilters {
  occasion: string;
  size: string;
  color: string;
  sortBy: "featured" | "price-asc" | "price-desc";
}

/** MetadataBar item editable from Admin */
export interface MetadataBarItem {
  label: string;
  value: string;
  subtitle?: string | null;
}

/** Editable website configuration persisted in Backend PostgreSQL */
export interface SiteSettings {
  id: number;
  siteName: string;
  siteHandle: string;
  tagline: string;
  logoUrl: string;
  currency: string;
  heroTitle: string;
  heroSubtitle: string;
  heroQuote: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  aboutImageUrl: string;
  spotlightQuote: string;
  spotlightImageUrl: string;
  metadataItems: MetadataBarItem[];
  studioAddress: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  bankAccountName: string;
  bankBsb: string;
  bankAccountNumber: string;
  payidEmail: string;
  transportPostFeeAud: number;
  afterHoursFeeAud: number;
  turnaroundGapDays: number;
  businessOpenTime: string;
  businessCloseTime: string;
}

/** Existing booking range returned by garment availability endpoint */
export interface BookedRange {
  bookingRef: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  gapBeforeDate: string;
  gapAfterDate: string;
  deliveryMethod: DeliveryMethod;
  rentalDays: number;
  status: string;
}

export interface GarmentAvailability {
  garmentId: string;
  garmentCode: string;
  turnaroundGapDays: number;
  bookings: BookedRange[];
  bookedDates: string[];
  gapDates: string[];
}

/** Selected booking schedule details stored inside CartItem */
export interface BookingDetails {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  pickupTime: string; // e.g., "09:00 AM"
  returnTime: string; // e.g., "06:00 PM"
  isAfterHoursReturn: boolean;
  afterHoursFeeAud: number;
  deliveryMethod: DeliveryMethod;
  deliveryFeeAud: number;
  rentalFeeAud: number;
}

/** Shopping bag item (AUD only) */
export interface CartItem {
  id: string;
  product: Product;
  size: string;
  rentalDays: RentalDays;
  quantity: number;
  rentalFeeAud: number;
  deliveryFeeAud: number;
  afterHoursFeeAud: number;
  pricePerItemAud: number;
  bookingDetails: BookingDetails;
}

/** Backend Booking record */
export interface BookingRecord {
  id: number;
  bookingRef: string;
  garmentId: string;
  garmentCode: string;
  garmentName: string;
  sizeLabel: string;
  deliveryMethod: DeliveryMethod;
  rentalDays: number;
  startDate: string;
  endDate: string;
  gapUntilDate: string;
  pickupTime: string;
  returnTime: string;
  isAfterHours: boolean;
  rentalFeeAud: number;
  deliveryFeeAud: number;
  afterHoursFeeAud: number;
  totalAud: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string | null;
  notes: string | null;
  status: BookingStatus;
  invoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Backend Transaction & Invoice record */
export interface TransactionRecord {
  id: number;
  transactionRef: string;
  invoiceNumber: string;
  bookingRefs: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  cardLast4: string | null;
  subtotalAud: number;
  deliveryFeeAud: number;
  afterHoursFeeAud: number;
  totalAud: number;
  currency: string;
  status: TransactionStatus;
  invoiceEmailStatus: string;
  invoiceEmailError: string | null;
  invoiceEmailHtml: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutReceipt {
  transaction: TransactionRecord;
  bookings: BookingRecord[];
  message: string;
}

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AdminOverview {
  paidRevenueAud: number;
  pendingRevenueAud: number;
  totalBookings: number;
  activeBookings: number;
  totalGarments: number;
  activeGarments: number;
  totalTransactions: number;
  currency: string;
}

export interface RentalOption {
  days: RentalDays;
  label: string;
  priceMultiplier: number;
}

export interface PriceBreakdown {
  rentalFee: number;
  deliveryFee: number;
  afterHoursFee: number;
  total: number;
}
