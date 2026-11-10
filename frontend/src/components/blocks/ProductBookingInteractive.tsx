"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  Clock,
  Ruler,
  ShoppingBag,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Store,
} from "lucide-react";
import {
  type Product,
  type Size,
  type DeliveryMethod,
  type BookingDetails,
} from "@/types";
import { useCart } from "@/context/CartContext";
import { MOCK_EXISTING_BOOKINGS } from "@/data/bookings";
import { cn } from "@/lib/utils";

/**
 * =====================================================================
 * COMPONENT: ProductBookingInteractive (Hệ thống Đặt thuê Áo Dài)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer Guide):
 * - Đây là khối nghiệp vụ cốt lõi của trang chi tiết áo dài LUA Studio:
 *   1. ĐỐI CHIẾU MÃ ÁO & SỐ ĐO: Hiển thị mã áo (vd: Mã 12 - AD-12), ảnh đối chiếu,
 *      số đo 3 vòng (ngực, eo, mông, dài áo) để khách tự ướm, không phải hỏi qua lại trên Drive.
 *   2. CHỌN GÓI THỜI GIAN THUÊ: 1 ngày (24h), 4 ngày (tiêu chuẩn), 8 ngày (mở rộng).
 *   3. PHƯƠNG THỨC NHẬN: Lấy tại Studio ($0) hoặc Giao qua Bưu điện Úc ($16.95 AUD).
 *   4. LỊCH CHỌN NGÀY: Khách chọn Ngày nhận (Pickup Date), hệ thống tự động tính Ngày trả (Return Date).
 *   5. KHUNG GIỜ LẤY & TRẢ: Lấy phải TRƯỚC, trả phải SAU.
 *   6. CẢNH BÁO TRẢ SAU GIỜ HÀNH CHÍNH: Studio đóng cửa sau 21:00. Nếu chọn trả sau 21h
 *      (vd: 21:30, 22:00, 23:00) sẽ hiện cảnh báo và tính phụ phí ngoài giờ (+ $20 AUD).
 *   7. CHẶN TRÙNG LỊCH & BUFFER 6-7H GIẶT HẤP: Nếu Bạn A đã book khung giờ nào đó
 *      (vd: 8am-8pm ngày 01/01/2027), Bạn B KHÔNG THỂ book khung giờ đó và bị chặn thêm 6-7h
 *      buffer tiếp theo để studio kiểm tra, giặt hấp sinh học và khử khuẩn tia cực tím.
 * =====================================================================
 */

interface ProductBookingInteractiveProps {
  product: Product;
}

// Danh sách các khung giờ lấy đồ tiêu chuẩn (từ 08:00 AM đến 08:00 PM)
const PICKUP_TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

// Danh sách các khung giờ trả đồ (gồm giờ hành chính và sau 21:00)
const RETURN_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "09:30 PM", // Ngoài giờ
  "10:00 PM", // Ngoài giờ
  "11:00 PM", // Ngoài giờ
];

// Hàm chuyển đổi khung giờ dạng "08:00 AM" thành số phút trong ngày để so sánh
function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export default function ProductBookingInteractive({
  product,
}: ProductBookingInteractiveProps) {
  const { addItem } = useCart();

  // 1. Quản lý Size áo
  const defaultSize = product.sizes.find((s) => s.available)?.label || "S";
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // 2. Quản lý gói thời gian thuê (1 ngày / 4 ngày / 8 ngày)
  const [rentalDays, setRentalDays] = useState<number>(4);

  // 3. Quản lý phương thức nhận hàng
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");

  // 4. Quản lý tháng lịch hiển thị
  // Mặc định: Tháng 12/2026 hoặc có thể bấm xem Tháng 1/2027 (Kịch bản Bạn A ngày 01/01/2027)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // 11 = Tháng 12 (0-indexed)

  // 5. Quản lý ngày nhận (Pickup Date: YYYY-MM-DD)
  const [pickupDate, setPickupDate] = useState<string>("2026-12-15");

  // 6. Quản lý khung giờ lấy và trả
  const [pickupTime, setPickupTime] = useState<string>("08:00 AM");
  const [returnTime, setReturnTime] = useState<string>("08:00 PM");

  // Trạng thái nút Thêm vào giỏ thành công
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // LOGIC TỰ ĐỘNG TÍNH NGÀY TRẢ (RETURN DATE)
  // ─────────────────────────────────────────────────────────────────
  const getReturnDate = (): string => {
    if (!pickupDate) return "";
    const [year, month, day] = pickupDate.split("-").map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(start);
    end.setDate(start.getDate() + rentalDays);

    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, "0");
    const endDay = String(end.getDate()).padStart(2, "0");
    return `${endYear}-${endMonth}-${endDay}`;
  };
  const returnDate = getReturnDate();

  // ─────────────────────────────────────────────────────────────────
  // LOGIC KIỂM TRA TRẢ SAU GIỜ HÀNH CHÍNH (Sau 21:00)
  // ─────────────────────────────────────────────────────────────────
  const isAfterHoursReturn = timeToMinutes(returnTime) > 1260;
  const afterHoursFeeAud = isAfterHoursReturn ? 20 : 0;
  const afterHoursFeeVnd = isAfterHoursReturn ? 150000 : 0;

  // ─────────────────────────────────────────────────────────────────
  // PHÍ VẬN CHUYỂN
  // ─────────────────────────────────────────────────────────────────
  const deliveryFeeAud = deliveryMethod === "post" ? 16.95 : 0;
  const deliveryFeeVnd = deliveryMethod === "post" ? 280000 : 0;

  // ─────────────────────────────────────────────────────────────────
  // LOGIC TÍNH TỔNG TIỀN LIVE
  // ─────────────────────────────────────────────────────────────────
  const baseAud =
    product.rentalPriceAud || Math.round((product.rentalPricePerDay * 4) / 16000);
  const multiplier = rentalDays === 8 ? 1.75 : rentalDays === 1 ? 0.45 : 1;
  const rentalPriceAud = Math.round(baseAud * multiplier);
  const rentalPriceVnd = Math.round(product.rentalPricePerDay * rentalDays * multiplier);

  const totalAud = rentalPriceAud + deliveryFeeAud + afterHoursFeeAud;
  const totalVnd = rentalPriceVnd + deliveryFeeVnd + afterHoursFeeVnd;

  const totalVndFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(totalVnd);

  // ─────────────────────────────────────────────────────────────────
  // LOGIC CHẶN TRÙNG LỊCH & BUFFER 6-7H GIẶT HẤP KHỬ KHUẨN
  // ─────────────────────────────────────────────────────────────────
  const code = product.code || "AD-12";
  const productBookings = MOCK_EXISTING_BOOKINGS.filter(
    (b) => b.productId === product.id || b.productCode === code
  );

  let bookingConflict: { existingBooking: typeof MOCK_EXISTING_BOOKINGS[0]; reason: string } | null = null;
  if (pickupDate && returnDate) {
    for (const b of productBookings) {
      const conflictDate =
        (pickupDate >= b.startDate && pickupDate <= b.endDate) ||
        (returnDate >= b.startDate && returnDate <= b.endDate) ||
        (pickupDate <= b.startDate && returnDate >= b.endDate);

      if (conflictDate) {
        bookingConflict = {
          existingBooking: b,
          reason: `Chiếc áo dài ${code} đã có ${b.customerName} đặt từ ${b.pickupTime} đến ${b.returnTime} ngày ${b.startDate}. Studio áp dụng quy chuẩn 6-7 tiếng buffer để kiểm tra, giặt hấp sinh học và khử khuẩn tia cực tím (đến ${b.bufferEndTime}). Bạn không thể đặt trùng khung giờ này!`,
        };
        break;
      }
    }
  }

  const isTimeOrderValid =
    rentalDays === 1 ? timeToMinutes(returnTime) > timeToMinutes(pickupTime) : true;

  // ─────────────────────────────────────────────────────────────────
  // RENDER LƯỚI LỊCH (CALENDAR GRID)
  // ─────────────────────────────────────────────────────────────────
  const daysInMonth: Array<{ dayNumber: number; dateStr: string; isBooked: boolean }> = [];
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let d = 1; d <= totalDays; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    const isBooked = productBookings.some(
      (b) => dateStr >= b.startDate && dateStr <= b.endDate
    );

    daysInMonth.push({ dayNumber: d, dateStr, isBooked });
  }

  // Thứ trong tuần của ngày mùng 1 (0: CN, 1: T2, ..., 6: T7)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Chuyển đổi sang chuẩn T2 = 0, CN = 6
  const emptyLeadingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date(currentYear, currentMonth, 1));

  // Chuyển tháng
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Nút nhảy nhanh tới ngày 01/01/2027 để thử kịch bản Bạn A book áo Mã 12
  const jumpToScenarioA = () => {
    setCurrentYear(2027);
    setCurrentMonth(0); // Tháng 1
    setPickupDate("2027-01-01");
    setRentalDays(1);
    setPickupTime("08:00 AM");
    setReturnTime("08:00 PM");
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (bookingConflict || !isTimeOrderValid) return;

    const bookingDetails: BookingDetails = {
      startDate: pickupDate,
      endDate: returnDate,
      pickupTime,
      returnTime,
      isAfterHoursReturn,
      afterHoursFeeAud,
      afterHoursFeeVnd,
      deliveryMethod,
      deliveryFeeAud,
      deliveryFeeVnd,
    };

    addItem(product, selectedSize, rentalDays, 1, bookingDetails);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-7 pt-4 border-t border-brand-border/60">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER ĐỐI CHIẾU MÃ ÁO & SỐ ĐO TRỰC TIẾP
      ─────────────────────────────────────────────────────────────── */}
      <div className="p-3.5 bg-brand-surface/20 border border-brand-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 aspect-[3/4] bg-brand-surface/40 overflow-hidden border border-brand-border/40">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider bg-brand-foreground text-brand-background px-2 py-0.5">
                MÃ: {product.code || "AD-12"}
              </span>
              <span className="text-xs font-sans text-brand-muted">
                (Thiết kế độc bản)
              </span>
            </div>
            {product.modelInfo && (
              <p className="text-[11px] font-sans text-brand-muted mt-1">
                👤 Người mẫu: cao {product.modelInfo.height} — mặc {product.modelInfo.wearingSize}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSizeGuide(!showSizeGuide)}
          className="text-xs font-sans text-brand-foreground underline underline-offset-4 flex items-center gap-1 hover:opacity-75 cursor-pointer"
        >
          <Ruler size={13} />
          <span>{showSizeGuide ? "Đóng số đo" : "Check số đo 3 vòng"}</span>
        </button>
      </div>

      {/* Bảng số đo hiển thị trực quan */}
      {showSizeGuide && (
        <div className="p-4 bg-brand-background border border-brand-border text-xs font-sans animate-in fade-in duration-200">
          <p className="font-serif text-sm uppercase tracking-wider text-brand-foreground mb-1">
            BẢNG THÔNG SỐ ÁO DÀI CHI TIẾT (CM):
          </p>
          <p className="text-[11px] text-brand-muted mb-3">
            * Khách hàng nên chọn size có số đo vòng ngực và eo chênh lệch 1-2cm so với cơ thể để mặc tôn dáng và cử động thoải mái nhất.
          </p>
          <div className="grid grid-cols-5 gap-2 text-center border-t border-brand-border/40 pt-2 font-mono text-[11px]">
            <span className="font-bold text-brand-foreground">Size</span>
            <span>Vòng ngực</span>
            <span>Vòng eo</span>
            <span>Vòng mông</span>
            <span>Dài áo</span>

            {product.sizes.map((s) => (
              <div key={s.label} className="contents text-brand-muted">
                <span className="font-medium text-brand-foreground">{s.label}</span>
                <span>{s.bust} cm</span>
                <span>{s.waist} cm</span>
                <span>{s.hip} cm</span>
                <span>{s.length || 140} cm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. CHỌN SIZE ÁO DÀI
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-widest text-brand-muted font-medium">
            1. CHỌN KÍCH CỠ (SIZE):
          </span>
          <span className="text-brand-foreground">Đã chọn: Size {selectedSize}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size: Size) => {
            const isSelected = selectedSize === size.label;
            const isAvailable = size.available;

            return (
              <button
                key={size.label}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && setSelectedSize(size.label)}
                className={cn(
                  "min-w-14 py-2.5 px-3 text-xs font-sans uppercase tracking-widest border transition-all text-center",
                  !isAvailable &&
                    "opacity-40 border-brand-border/30 line-through cursor-not-allowed bg-brand-surface/10",
                  isAvailable && !isSelected &&
                    "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground cursor-pointer",
                  isAvailable && isSelected &&
                    "bg-brand-foreground text-brand-background border-brand-foreground font-medium cursor-pointer"
                )}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CHỌN GÓI THỜI GIAN THUÊ (RENTAL PERIOD — theo booking-date.png)
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-widest text-brand-muted font-medium">
            2. THỜI GIAN THUÊ (RENTAL PERIOD):
          </span>
          <span className="text-brand-foreground">
            {rentalDays === 1 ? "Gói 24h sự kiện" : rentalDays === 4 ? "Gói 4 ngày tiêu chuẩn" : "Gói 8 ngày mở rộng"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setRentalDays(1)}
            className={cn(
              "py-3 px-2 text-xs font-sans tracking-wider uppercase border transition-all text-center cursor-pointer",
              rentalDays === 1
                ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            1 Ngày — $60
          </button>

          <button
            type="button"
            onClick={() => setRentalDays(4)}
            className={cn(
              "py-3 px-2 text-xs font-sans tracking-wider uppercase border transition-all text-center cursor-pointer",
              rentalDays === 4
                ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            4 Ngày — ${baseAud}
          </button>

          <button
            type="button"
            onClick={() => setRentalDays(8)}
            className={cn(
              "py-3 px-2 text-xs font-sans tracking-wider uppercase border transition-all text-center cursor-pointer",
              rentalDays === 8
                ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            8 Ngày — ${Math.round(baseAud * 1.75)}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. PHƯƠNG THỨC GIAO NHẬN (DELIVERY METHOD — theo booking-date.png)
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-sans uppercase tracking-widest text-brand-muted font-medium">
          3. HÌNH THỨC NHẬN ĐỒ (DELIVERY METHOD):
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeliveryMethod("pickup")}
            className={cn(
              "py-3 px-3 text-xs font-sans tracking-wider uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer",
              deliveryMethod === "pickup"
                ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            <Store size={14} />
            <span>Pickup (Studio VIC — Free)</span>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryMethod("post")}
            className={cn(
              "py-3 px-3 text-xs font-sans tracking-wider uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer",
              deliveryMethod === "post"
                ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            <Truck size={14} />
            <span>Post (Bưu điện +$16.95)</span>
          </button>
        </div>

        <p className="text-[11px] font-sans text-brand-muted italic mt-0.5">
          * Chọn ngày nhận đồ trước sự kiện 1-2 ngày để trang phục chuyển phát kịp thời trước ngày trọng đại của bạn.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. LỊCH CHỌN NGÀY & TỰ ĐỘNG BÁO NGÀY TRẢ (CALENDAR)
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-widest text-brand-muted font-medium flex items-center gap-1.5">
            <CalendarIcon size={14} />
            <span>4. CHỌN NGÀY LẤY ĐỒ (PICKUP DATE):</span>
          </span>

          {/* Nút nhảy nhanh kịch bản Bạn A để test buffer 6-7h */}
          <button
            type="button"
            onClick={jumpToScenarioA}
            className="text-[11px] text-brand-foreground underline underline-offset-4 hover:opacity-70 cursor-pointer"
          >
            [Thử kịch bản Bạn A 01/01/2027]
          </button>
        </div>

        {/* Khung Lịch Tháng */}
        <div className="p-4 bg-brand-background border border-brand-border">
          {/* Thanh điều hướng tháng */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/40 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-brand-surface/40 transition-colors cursor-pointer"
              aria-label="Tháng trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif text-sm uppercase tracking-wider text-brand-foreground capitalize">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-brand-surface/40 transition-colors cursor-pointer"
              aria-label="Tháng sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Hàng tên thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans text-brand-muted mb-2 tracking-wider">
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
            <span>SU</span>
          </div>

          {/* Lưới các ngày */}
          <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs">
            {/* Các ô trống trước ngày mùng 1 */}
            {Array.from({ length: emptyLeadingDays }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {/* Các ngày trong tháng */}
            {daysInMonth.map(({ dayNumber, dateStr, isBooked }) => {
              const isSelectedStart = pickupDate === dateStr;
              const isSelectedEnd = returnDate === dateStr;
              const isInRange =
                pickupDate &&
                returnDate &&
                dateStr > pickupDate &&
                dateStr < returnDate;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setPickupDate(dateStr)}
                  title={isBooked ? "Đã có khách book trước (Đang giặt hấp khử khuẩn)" : undefined}
                  className={cn(
                    "h-9 flex flex-col items-center justify-center transition-all text-xs relative",
                    // Ngày đã có khách book
                    isBooked &&
                      "opacity-35 bg-brand-surface/25 line-through cursor-not-allowed border border-dashed border-brand-border/40 text-brand-muted",
                    // Ngày trống chưa chọn
                    !isBooked &&
                      !isSelectedStart &&
                      !isSelectedEnd &&
                      !isInRange &&
                      "hover:bg-brand-surface/30 cursor-pointer text-brand-foreground",
                    // Ngày bắt đầu lấy
                    isSelectedStart &&
                      "bg-brand-foreground text-brand-background font-bold z-10",
                    // Ngày trong khoảng thuê
                    isInRange &&
                      "bg-brand-sage/50 text-brand-foreground font-medium",
                    // Ngày hoàn trả
                    isSelectedEnd &&
                      "bg-brand-foreground text-brand-background font-bold z-10"
                  )}
                >
                  <span>{dayNumber}</span>
                  {isBooked && (
                    <span className="text-[8px] tracking-tighter text-brand-muted">Book</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hộp tóm tắt lộ trình ngày thuê */}
        {pickupDate && returnDate && (
          <div className="p-3 bg-brand-surface/20 border border-brand-border/60 text-xs font-sans flex items-center justify-between">
            <div>
              <span className="text-brand-muted uppercase text-[10px] tracking-wider block">
                LỘ TRÌNH THUÊ ({rentalDays} NGÀY):
              </span>
              <span className="text-brand-foreground font-medium">
                Lấy: {pickupDate} ➔ Trả: {returnDate}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 bg-brand-sage border border-brand-border/40 text-brand-foreground">
              +{rentalDays} ngày
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. CHỌN KHUNG GIỜ LẤY & KHUNG GIỜ TRẢ
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-sans uppercase tracking-widest text-brand-muted font-medium flex items-center gap-1.5">
          <Clock size={14} />
          <span>5. KHUNG GIỜ LẤY & TRẢ (PICKUP & RETURN TIME):</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Chọn giờ lấy */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-sans text-brand-muted uppercase tracking-wider">
              Khung giờ lấy (Pickup):
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full py-2.5 px-3 bg-brand-background border border-brand-border text-xs font-sans text-brand-foreground focus:outline-brand-ring cursor-pointer"
            >
              {PICKUP_TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t} {t === "08:00 AM" ? "(Mở cửa studio)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn giờ trả */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-sans text-brand-muted uppercase tracking-wider">
              Khung giờ trả (Return):
            </label>
            <select
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className={cn(
                "w-full py-2.5 px-3 bg-brand-background border text-xs font-sans text-brand-foreground focus:outline-brand-ring cursor-pointer",
                isAfterHoursReturn ? "border-amber-700/80 bg-amber-500/10" : "border-brand-border"
              )}
            >
              {RETURN_TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t} {t === "09:00 PM" ? "(Hết giờ làm việc)" : t > "09:00 PM" ? "(Ngoài giờ)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CẢNH BÁO: Giờ lấy phải TRƯỚC, giờ trả phải SAU */}
        {!isTimeOrderValid && (
          <div className="p-3 bg-amber-500/10 border border-amber-600/50 text-xs font-sans text-amber-900 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-700" />
            <span>
              <strong>Lỗi khung giờ:</strong> Khi thuê gói trong ngày (24h), khung giờ lấy ({pickupTime}) phải diễn ra TRƯỚC khung giờ trả ({returnTime}). Vui lòng điều chỉnh lại giờ lấy hoặc giờ trả!
            </span>
          </div>
        )}

        {/* CẢNH BÁO TRẢ SAU GIỜ HÀNH CHÍNH (Sau 21:00) */}
        {isAfterHoursReturn && (
          <div className="p-3 bg-amber-500/15 border border-amber-600/60 text-xs font-sans text-amber-950 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-amber-900">
              <AlertTriangle size={15} className="text-amber-700" />
              <span>LƯU Ý: TRẢ ĐỒ NGOÀI GIỜ LÀM VIỆC (Sau 21:00)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Studio ngưng làm việc lúc 21:00. Bạn đang chọn trả đồ lúc <strong>{returnTime}</strong>. Yêu cầu này sẽ được nhân viên liên hệ xác nhận (follow-up) để sắp xếp người nhận, và áp dụng phụ phí trả muộn ngoài giờ <strong>+ $20 AUD (150.000₫)</strong>.
            </p>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. CẢNH BÁO XUNG ĐỘT BUFFER 6-7H NẾU TRÙNG LỊCH BẠN A
      ─────────────────────────────────────────────────────────────── */}
      {bookingConflict && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-xs font-sans text-red-950 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-900">
            <AlertTriangle size={16} className="text-red-700 shrink-0" />
            <span>KHÔNG THỂ ĐẶT KHUNG GIỜ NÀY (TRÙNG LỊCH & BUFFER 6-7H)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-900/90">
            {bookingConflict.reason}
          </p>
          <div className="mt-1 pt-1 border-t border-red-500/30 text-[10px] text-red-800 flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>Quy chuẩn LUA Studio: 100% áo dài phải qua 6-7h giặt hấp sinh học và khử khuẩn trước khi giao khách tiếp theo.</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. TỔNG HỢP GIÁ TIỀN MINH BẠCH (PRICE BREAKDOWN)
      ─────────────────────────────────────────────────────────────── */}
      <div className="p-4 bg-brand-surface/20 border border-brand-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans text-brand-muted">
          <span>Tiền thuê áo dài ({rentalDays} ngày):</span>
          <span className="text-brand-foreground font-medium">${rentalPriceAud} AUD</span>
        </div>

        {deliveryFeeAud > 0 && (
          <div className="flex items-center justify-between text-xs font-sans text-brand-muted">
            <span>Phí bưu điện chuyển phát (Australia Post):</span>
            <span className="text-brand-foreground font-medium">+${deliveryFeeAud} AUD</span>
          </div>
        )}

        {afterHoursFeeAud > 0 && (
          <div className="flex items-center justify-between text-xs font-sans text-amber-800">
            <span>Phụ phí trả đồ sau 21:00 (Ngoài giờ):</span>
            <span className="font-medium">+${afterHoursFeeAud} AUD</span>
          </div>
        )}

        <div className="pt-2 border-t border-brand-border/40 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-sans tracking-widest uppercase text-brand-muted block">
              TỔNG CỘNG THANH TOÁN:
            </span>
            <span className="font-serif text-2xl font-normal text-brand-foreground">
              ${totalAud.toFixed(2)} AUD
            </span>
            <span className="text-xs font-sans text-brand-muted ml-2">
              ({totalVndFormatted})
            </span>
          </div>

          <span className="text-[10px] font-mono tracking-wider uppercase bg-brand-sage px-2 py-1 text-brand-foreground border border-brand-border/40">
            {product.code || "AD-12"} • Size {selectedSize}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          9. NÚT HÀNH ĐỘNG: THÊM VÀO GIỎ HÀNG (ADD TO BAG)
      ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={Boolean(bookingConflict) || !isTimeOrderValid}
          onClick={handleAddToCart}
          className={cn(
            "w-full py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 font-medium",
            (Boolean(bookingConflict) || !isTimeOrderValid) &&
              "bg-brand-surface/40 text-brand-muted border border-brand-border cursor-not-allowed opacity-50",
            !bookingConflict &&
              isTimeOrderValid &&
              !isAddedSuccess &&
              "bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 cursor-pointer shadow-none",
            isAddedSuccess &&
              "bg-brand-sage text-brand-foreground border border-brand-border cursor-default"
          )}
        >
          {isAddedSuccess ? (
            <>
              <Check size={16} />
              <span>ĐÃ THÊM LỊCH BOOKING VÀO GIỎ HÀNG!</span>
            </>
          ) : bookingConflict ? (
            <span>KHUNG GIỜ BỊ TRÙNG — VUI LÒNG ĐỔI LỊCH</span>
          ) : !isTimeOrderValid ? (
            <span>GIỜ LẤY PHẢI TRƯỚC GIỜ TRẢ</span>
          ) : (
            <>
              <ShoppingBag size={16} />
              <span>THÊM VÀO GIỎ HÀNG — ${totalAud.toFixed(2)} AUD</span>
            </>
          )}
        </button>

        <p className="text-[11px] font-sans text-brand-muted text-center leading-relaxed">
          * Đặt cọc an toàn & tùy chọn thử trực tiếp tại studio Melbourne
          sẽ được xác nhận ở bước tiếp theo.
        </p>
      </div>
    </div>
  );
}
