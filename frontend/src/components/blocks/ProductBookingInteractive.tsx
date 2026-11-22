"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ArrowRight,
  Info,
} from "lucide-react";
import {
  type BookedRange,
  type BookingDetails,
  type DeliveryMethod,
  type Product,
  type RentalDays,
  type Size,
} from "@/types";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { FALLBACK_BOOKED_RANGES } from "@/data/bookings";
import { fetchGarmentAvailability } from "@/lib/api";
import {
  ALLOWED_PACKAGES_BY_DELIVERY,
  RENTAL_PACKAGES,
  addDaysIso,
  calculatePackagePriceAud,
  computeReturnDateIso,
  formatAud,
  formatAudShort,
  getWeekdayName,
  isWeekdayLockedForPackage,
  rangesConflictWithGap,
  timeToMinutes,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductBookingInteractiveProps {
  product: Product;
}

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
  "09:30 PM",
  "10:00 PM",
  "11:00 PM",
];

export default function ProductBookingInteractive({
  product,
}: ProductBookingInteractiveProps) {
  const router = useRouter();
  const { addItem, items: cartItems } = useCart();
  const { settings } = useSiteSettings();

  const defaultSize = product.sizes.find((s) => s.available)?.label || "S";
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Delivery method: "pick_in_person" (all 1,2,4,8) or "transport_post" (only 4,8)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pick_in_person");
  const [rentalDays, setRentalDays] = useState<RentalDays>(4);
  const [packageAutoAdjustedNote, setPackageAutoAdjustedNote] = useState<string | null>(null);

  // Calendar view state (defaults to December 2026 to showcase seeded bookings + 1-day gap)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // December (0-indexed)
  const [pickupDate, setPickupDate] = useState<string>("2026-12-10");

  // Pickup & Return time slots (Pick in Person)
  const [pickupTime, setPickupTime] = useState<string>("09:00 AM");
  const [returnTime, setReturnTime] = useState<string>("06:00 PM");

  // Live availability fetched from FastAPI backend
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>(
    FALLBACK_BOOKED_RANGES[product.id] || []
  );
  const [gapDays, setGapDays] = useState<number>(settings.turnaroundGapDays || 1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    fetchGarmentAvailability(product.id)
      .then((avail) => {
        if (!active) return;
        setBookedRanges(avail.bookings);
        setGapDays(avail.turnaroundGapDays);
      })
      .catch(() => {
        if (!active) return;
        setBookedRanges(FALLBACK_BOOKED_RANGES[product.id] || []);
        setGapDays(settings.turnaroundGapDays || 1);
      });
    return () => {
      active = false;
    };
  }, [product.id, settings.turnaroundGapDays]);

  // Combine backend bookings + any items for this same garment already in guest's bag
  const allOccupiedRanges = useMemo(() => {
    const fromCart: BookedRange[] = cartItems
      .filter((ci) => ci.product.id === product.id)
      .map((ci) => ({
        bookingRef: "IN-YOUR-BAG",
        startDate: ci.bookingDetails.startDate,
        endDate: ci.bookingDetails.endDate,
        gapBeforeDate: addDaysIso(ci.bookingDetails.startDate, -gapDays),
        gapAfterDate: addDaysIso(ci.bookingDetails.endDate, gapDays),
        deliveryMethod: ci.bookingDetails.deliveryMethod,
        rentalDays: ci.rentalDays,
        status: "in_bag",
      }));
    return [...bookedRanges, ...fromCart];
  }, [bookedRanges, cartItems, product.id, gapDays]);

  const handleDeliveryChange = (nextMethod: DeliveryMethod) => {
    setDeliveryMethod(nextMethod);
    const allowed = ALLOWED_PACKAGES_BY_DELIVERY[nextMethod];
    if (!allowed.includes(rentalDays)) {
      setRentalDays(4);
      setPackageAutoAdjustedNote(
        "Transport Post is available for 4-day and 8-day packages only. Your duration was updated to 4 Days."
      );
    } else {
      setPackageAutoAdjustedNote(null);
    }
  };

  const returnDate = computeReturnDateIso(pickupDate, rentalDays);
  const gapAfterSelectedDate = returnDate ? addDaysIso(returnDate, gapDays) : "";

  const closeMinutes = timeToMinutes(settings.businessCloseTime || "09:00 PM");
  const isAfterHoursReturn =
    deliveryMethod === "pick_in_person" && timeToMinutes(returnTime) > closeMinutes;
  const afterHoursFeeAud = isAfterHoursReturn ? settings.afterHoursFeeAud : 0;
  const deliveryFeeAud =
    deliveryMethod === "transport_post" ? settings.transportPostFeeAud : 0;

  const rentalFeeAud = calculatePackagePriceAud(product.rentalPriceAud, rentalDays);
  const totalAud = Math.round((rentalFeeAud + deliveryFeeAud + afterHoursFeeAud) * 100) / 100;

  // Validate 1-day same-garment turnaround gap against all occupied ranges
  let bookingConflict: { existing: BookedRange; reason: string } | null = null;
  if (pickupDate && returnDate) {
    for (const existing of allOccupiedRanges) {
      if (
        rangesConflictWithGap(
          pickupDate,
          returnDate,
          existing.startDate,
          existing.endDate,
          gapDays
        )
      ) {
        const nextAvailable = addDaysIso(existing.endDate, gapDays + 1);
        const prevAvailableEnd = addDaysIso(existing.startDate, -(gapDays + 1));
        const sourceLabel =
          existing.status === "in_bag"
            ? "an item already in your bag"
            : `booking ${existing.bookingRef}`;
        bookingConflict = {
          existing,
          reason: `Garment ${product.code} is occupied from ${existing.startDate} to ${existing.endDate} (${sourceLabel}). A mandatory ${gapDays}-day cleaning & turnaround gap applies between bookings of the same garment. Please return by ${prevAvailableEnd} or start from ${nextAvailable} onwards.`,
        };
        break;
      }
    }
  }

  const isTimeOrderValid =
    deliveryMethod === "pick_in_person" && rentalDays === 1
      ? timeToMinutes(returnTime) > timeToMinutes(pickupTime)
      : true;

  const isStartWeekdayLocked = isWeekdayLockedForPackage(pickupDate, rentalDays);

  // Build calendar cells for active month
  const { bookedDateSet, gapDateSet } = useMemo(() => {
    const booked = new Set<string>();
    const gap = new Set<string>();

    for (const b of allOccupiedRanges) {
      let cursor = b.startDate;
      while (cursor <= b.endDate) {
        booked.add(cursor);
        cursor = addDaysIso(cursor, 1);
      }
      for (let offset = 1; offset <= gapDays; offset++) {
        gap.add(addDaysIso(b.startDate, -offset));
        gap.add(addDaysIso(b.endDate, offset));
      }
    }
    booked.forEach((d) => gap.delete(d));
    return { bookedDateSet: booked, gapDateSet: gap };
  }, [allOccupiedRanges, gapDays]);

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDaysInMonth }, (_, idx) => {
    const dayNumber = idx + 1;
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(dayNumber).padStart(2, "0");
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    return {
      dayNumber,
      dateStr,
      isBooked: bookedDateSet.has(dateStr),
      isGapDay: gapDateSet.has(dateStr),
      isWeekdayLocked: isWeekdayLockedForPackage(dateStr, rentalDays),
    };
  });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const emptyLeadingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(new Date(currentYear, currentMonth, 1));

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

  const buildBookingDetails = (): BookingDetails => ({
    startDate: pickupDate,
    endDate: returnDate,
    pickupTime: deliveryMethod === "pick_in_person" ? pickupTime : "09:00 AM",
    returnTime: deliveryMethod === "pick_in_person" ? returnTime : "05:00 PM",
    isAfterHoursReturn,
    afterHoursFeeAud,
    deliveryMethod,
    deliveryFeeAud,
    rentalFeeAud,
  });

  const canBook =
    !bookingConflict &&
    !isStartWeekdayLocked &&
    isTimeOrderValid &&
    Boolean(pickupDate);

  const handleAddToBag = () => {
    if (!canBook) return;
    addItem(product, selectedSize, rentalDays, buildBookingDetails(), true);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  };

  const handleBookNow = () => {
    if (!canBook) return;
    addItem(product, selectedSize, rentalDays, buildBookingDetails(), false);
    router.push("/checkout");
  };

  const allowedPackages = ALLOWED_PACKAGES_BY_DELIVERY[deliveryMethod];

  return (
    <div className="flex flex-col gap-7 pt-4 border-t border-brand-border/60">
      {/* Garment Verification & Size Guide Bar */}
      <div className="p-3.5 bg-brand-surface/20 border border-brand-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 aspect-[3/4] bg-brand-surface/40 overflow-hidden border border-brand-border/40 shrink-0">
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider bg-brand-foreground text-brand-background px-2 py-0.5">
                CODE: {product.code}
              </span>
              <span className="text-xs font-sans text-brand-muted">
                One-of-one Archive Piece
              </span>
            </div>
            {product.modelInfo && (
              <p className="text-[11px] font-sans text-brand-muted mt-1">
                Model Reference: {product.modelInfo.height} — Wearing {product.modelInfo.wearingSize}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSizeGuide(!showSizeGuide)}
          className="text-xs font-sans text-brand-foreground underline underline-offset-4 flex items-center gap-1 hover:opacity-75 cursor-pointer shrink-0"
        >
          <Ruler size={13} />
          <span>{showSizeGuide ? "Hide Size Guide" : "Size Guide (cm)"}</span>
        </button>
      </div>

      {/* Expandable Size Guide Table */}
      {showSizeGuide && (
        <div className="p-4 bg-brand-card border border-brand-border text-xs font-sans">
          <p className="font-serif text-sm uppercase tracking-wider text-brand-foreground mb-1">
            GARMENT MEASUREMENTS (CM)
          </p>
          <p className="text-[11px] text-brand-muted mb-3">
            Allow 1–2 cm ease at the bust and waist for an authentic, comfortable Ao Dai drape.
          </p>
          <div className="grid grid-cols-5 gap-2 text-center border-t border-brand-border/40 pt-2 font-mono text-[11px]">
            <span className="font-bold text-brand-foreground">Size</span>
            <span>Bust</span>
            <span>Waist</span>
            <span>Hip</span>
            <span>Length</span>

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

      {/* STEP 1: CHOOSE SIZE */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-widest text-brand-muted font-medium">
            1. CHOOSE SIZE
          </span>
          <span className="text-brand-foreground">Selected: Size {selectedSize}</span>
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
                  isAvailable &&
                    !isSelected &&
                    "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground cursor-pointer",
                  isAvailable &&
                    isSelected &&
                    "bg-brand-foreground text-brand-background border-brand-foreground font-medium cursor-pointer"
                )}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: CHOOSE POST / DELIVERY METHOD */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-sans uppercase tracking-widest text-brand-muted font-medium">
          2. CHOOSE DELIVERY METHOD (POST)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDeliveryChange("pick_in_person")}
            className={cn(
              "p-3.5 text-left border transition-all cursor-pointer flex flex-col gap-1",
              deliveryMethod === "pick_in_person"
                ? "bg-brand-foreground text-brand-background border-brand-foreground"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-medium">
                <Store size={14} />
                Pick in Person
              </span>
              <span className="text-[11px] font-mono">FREE</span>
            </div>
            <span
              className={cn(
                "text-[11px] font-sans",
                deliveryMethod === "pick_in_person"
                  ? "text-brand-background/80"
                  : "text-brand-muted"
              )}
            >
              Melbourne Studio · All packages (1, 2, 4, 8 days)
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDeliveryChange("transport_post")}
            className={cn(
              "p-3.5 text-left border transition-all cursor-pointer flex flex-col gap-1",
              deliveryMethod === "transport_post"
                ? "bg-brand-foreground text-brand-background border-brand-foreground"
                : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-wider font-medium">
                <Truck size={14} />
                Transport Post
              </span>
              <span className="text-[11px] font-mono">
                +{formatAudShort(settings.transportPostFeeAud)}
              </span>
            </div>
            <span
              className={cn(
                "text-[11px] font-sans",
                deliveryMethod === "transport_post"
                  ? "text-brand-background/80"
                  : "text-brand-muted"
              )}
            >
              Australia Post Express · 4 &amp; 8 day packages only
            </span>
          </button>
        </div>

        {packageAutoAdjustedNote && (
          <div className="p-2.5 bg-brand-surface/40 border border-brand-border text-[11px] font-sans text-brand-foreground flex items-center gap-2">
            <Info size={14} className="shrink-0" />
            <span>{packageAutoAdjustedNote}</span>
          </div>
        )}
      </div>

      {/* STEP 3: CHOOSE TIME PACKAGE (1, 2, 4, 8 DAYS) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="uppercase tracking-widest text-brand-muted font-medium">
            3. CHOOSE RENTAL TIME PACKAGE
          </span>
          <span className="text-brand-foreground">
            {rentalDays} {rentalDays === 1 ? "Day" : "Days"} ({formatAud(rentalFeeAud)})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RENTAL_PACKAGES.map((days) => {
            const isAllowed = allowedPackages.includes(days);
            const isSelected = rentalDays === days;
            const pkgPrice = calculatePackagePriceAud(product.rentalPriceAud, days);

            return (
              <button
                key={days}
                type="button"
                disabled={!isAllowed}
                onClick={() => {
                  if (isAllowed) {
                    setRentalDays(days);
                    setPackageAutoAdjustedNote(null);
                  }
                }}
                className={cn(
                  "py-3 px-2 border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  !isAllowed &&
                    "opacity-35 border-brand-border/40 bg-brand-surface/15 cursor-not-allowed line-through",
                  isAllowed &&
                    !isSelected &&
                    "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground cursor-pointer",
                  isAllowed &&
                    isSelected &&
                    "bg-brand-foreground text-brand-background border-brand-foreground font-medium cursor-pointer"
                )}
              >
                <span className="text-xs font-sans uppercase tracking-wider">
                  {days} {days === 1 ? "Day" : "Days"}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    isSelected ? "text-brand-background/90" : "text-brand-muted"
                  )}
                >
                  {formatAudShort(pkgPrice)}
                </span>
                {!isAllowed && (
                  <span className="text-[9px] font-sans uppercase tracking-wider no-underline">
                    Pick in Person only
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 4: CHOOSE DATES (CALENDAR WITH 1-DAY GAP CONSTRAINT) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-sans flex-wrap gap-2">
          <span className="uppercase tracking-widest text-brand-muted font-medium flex items-center gap-1.5">
            <CalendarIcon size={14} />
            <span>4. CHOOSE START DATE</span>
          </span>
          <span className="text-[11px] text-brand-muted">
            {rentalDays === 4
              ? `Mon–Wed locked for 4-day package · ${gapDays}-day care gap`
              : `Mandatory ${gapDays}-day care gap between rentals`}
          </span>
        </div>

        <div className="p-4 bg-brand-card border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/40 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-brand-surface/40 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif text-sm uppercase tracking-wider text-brand-foreground">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-brand-surface/40 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans text-brand-muted mb-2 tracking-wider">
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
            <span>SU</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans text-xs">
            {Array.from({ length: emptyLeadingDays }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}

            {daysInMonth.map(({ dayNumber, dateStr, isBooked, isGapDay, isWeekdayLocked }) => {
              const isSelectedStart = pickupDate === dateStr;
              const isSelectedEnd = returnDate === dateStr;
              const isInRange =
                pickupDate &&
                returnDate &&
                dateStr > pickupDate &&
                dateStr < returnDate;
              const isSelectedGap =
                !bookingConflict && !isStartWeekdayLocked && gapAfterSelectedDate === dateStr;
              const isCellDisabled = isBooked || isWeekdayLocked;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isCellDisabled}
                  onClick={() => setPickupDate(dateStr)}
                  title={
                    isBooked
                      ? "Already booked"
                      : isWeekdayLocked
                      ? "Locked for 4-day package (Monday–Wednesday unavailable; choose Thursday–Sunday)"
                      : isGapDay
                      ? `${gapDays}-day cleaning & sanitization turnaround gap`
                      : `Select ${dateStr}`
                  }
                  className={cn(
                    "h-10 flex flex-col items-center justify-center transition-all text-xs relative border border-transparent",
                    isBooked &&
                      "opacity-40 bg-brand-surface/40 line-through cursor-not-allowed border-dashed border-brand-border text-brand-muted",
                    !isBooked &&
                      isWeekdayLocked &&
                      !isInRange &&
                      !isSelectedEnd &&
                      "opacity-35 bg-brand-surface/25 line-through cursor-not-allowed border border-brand-border/30 text-brand-muted",
                    !isCellDisabled &&
                      isGapDay &&
                      !isSelectedStart &&
                      !isSelectedEnd &&
                      !isInRange &&
                      "bg-brand-peach/35 border-dashed border-brand-border/60 text-brand-muted cursor-pointer",
                    !isCellDisabled &&
                      !isGapDay &&
                      !isSelectedStart &&
                      !isSelectedEnd &&
                      !isInRange &&
                      "hover:bg-brand-surface/40 cursor-pointer text-brand-foreground",
                    isInRange && "bg-brand-sage/60 text-brand-foreground font-medium",
                    (isSelectedStart || isSelectedEnd) &&
                      !isStartWeekdayLocked &&
                      "bg-brand-foreground text-brand-background font-bold z-10",
                    isSelectedStart &&
                      isStartWeekdayLocked &&
                      "bg-brand-accent/20 text-brand-accent border-brand-accent font-bold z-10",
                    isSelectedGap &&
                      !isBooked &&
                      "border-dashed border-brand-border bg-brand-peach/35 text-brand-muted"
                  )}
                >
                  <span>{dayNumber}</span>
                  {isBooked && (
                    <span className="text-[8px] uppercase tracking-tighter">Booked</span>
                  )}
                  {!isBooked && isSelectedStart && isSelectedEnd && !isStartWeekdayLocked && (
                    <span className="text-[8px] uppercase tracking-tighter">1-Day</span>
                  )}
                  {!isBooked && isSelectedStart && !isSelectedEnd && !isStartWeekdayLocked && (
                    <span className="text-[8px] uppercase tracking-tighter">Pick</span>
                  )}
                  {!isBooked && isSelectedEnd && !isSelectedStart && !isStartWeekdayLocked && (
                    <span className="text-[8px] uppercase tracking-tighter">Return</span>
                  )}
                  {!isBooked && isSelectedGap && !isSelectedStart && !isSelectedEnd && (
                    <span className="text-[8px] uppercase tracking-tighter">Care</span>
                  )}
                  {!isBooked &&
                    isWeekdayLocked &&
                    !isInRange &&
                    !isSelectedStart &&
                    !isSelectedEnd &&
                    !isSelectedGap && (
                      <span className="text-[8px] uppercase tracking-tighter">Lock</span>
                    )}
                  {!isCellDisabled &&
                    isGapDay &&
                    !isSelectedStart &&
                    !isSelectedEnd &&
                    !isInRange &&
                    !isSelectedGap && (
                      <span className="text-[8px] uppercase tracking-tighter">Gap</span>
                    )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-brand-border/40 flex flex-wrap gap-4 text-[10px] font-sans uppercase tracking-wider text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 bg-brand-foreground inline-block" /> Selected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 bg-brand-surface/50 border border-dashed border-brand-border inline-block" /> Booked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 bg-brand-peach/45 border border-dashed border-brand-border inline-block" /> {gapDays}-Day Care Gap
            </span>
            {rentalDays === 4 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 bg-brand-surface/30 border border-brand-border/60 inline-block" /> Mon–Wed Locked (4d)
              </span>
            )}
          </div>
        </div>

        {/* Selected Schedule Summary */}
        {pickupDate && returnDate && (
          <div className="p-3 bg-brand-surface/20 border border-brand-border/60 text-xs font-sans flex items-center justify-between gap-3">
            <div>
              <span className="text-brand-muted uppercase text-[10px] tracking-wider block">
                RENTAL SCHEDULE ({rentalDays} {rentalDays === 1 ? "DAY" : "DAYS"} INCLUSIVE):
              </span>
              <span className="text-brand-foreground font-medium">
                Pickup: {pickupDate} → Return: {returnDate}
              </span>
              <span className="block text-[11px] text-brand-muted mt-0.5">
                Studio cleaning gap after return: {gapAfterSelectedDate} ({gapDays}-day gap)
              </span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 bg-brand-sage border border-brand-border/40 text-brand-foreground shrink-0">
              {rentalDays}d
            </span>
          </div>
        )}
      </div>

      {/* STEP 5: PICKUP & RETURN TIME (Pick in Person) OR POST DISPATCH NOTE */}
      {deliveryMethod === "pick_in_person" ? (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-sans uppercase tracking-widest text-brand-muted font-medium flex items-center gap-1.5">
            <Clock size={14} />
            <span>5. PICKUP &amp; RETURN TIME (STUDIO HOURS {settings.businessOpenTime} – {settings.businessCloseTime})</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans text-brand-muted uppercase tracking-wider">
                Pickup Time
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full py-2.5 px-3 bg-brand-background border border-brand-border text-xs font-sans text-brand-foreground focus:outline-brand-ring cursor-pointer"
              >
                {PICKUP_TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-sans text-brand-muted uppercase tracking-wider">
                Return Time
              </label>
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className={cn(
                  "w-full py-2.5 px-3 bg-brand-background border text-xs font-sans text-brand-foreground focus:outline-brand-ring cursor-pointer",
                  isAfterHoursReturn ? "border-brand-gold bg-brand-gold/15" : "border-brand-border"
                )}
              >
                {RETURN_TIME_SLOTS.map((t) => {
                  const late = timeToMinutes(t) > closeMinutes;
                  return (
                    <option key={t} value={t}>
                      {t} {late ? `(After-hours +${formatAudShort(settings.afterHoursFeeAud)})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {!isTimeOrderValid && (
            <div className="p-3 bg-brand-gold/15 border border-brand-gold text-xs font-sans text-brand-foreground flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-brand-accent" />
              <span>
                <strong>Invalid time slot:</strong> For a 1-day rental, return time ({returnTime}) must be after pickup time ({pickupTime}).
              </span>
            </div>
          )}

          {isAfterHoursReturn && (
            <div className="p-3 bg-brand-gold/20 border border-brand-gold text-xs font-sans text-brand-foreground flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                <AlertTriangle size={15} />
                <span>AFTER-HOURS RETURN NOTICE (AFTER {settings.businessCloseTime})</span>
              </div>
              <p className="text-[11px] leading-relaxed text-brand-muted">
                Our studio closes at {settings.businessCloseTime}. Returning at{" "}
                <strong>{returnTime}</strong> includes an after-hours coordination surcharge of{" "}
                <strong>+{formatAud(settings.afterHoursFeeAud)}</strong>.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 bg-brand-surface/20 border border-brand-border/60 text-xs font-sans text-brand-muted flex items-start gap-2.5">
          <Truck size={16} className="shrink-0 mt-0.5 text-brand-foreground" />
          <div>
            <p className="font-medium uppercase tracking-wider text-brand-foreground text-[11px]">
              AUSTRALIA POST EXPRESS DISPATCH &amp; PREPAID RETURN
            </p>
            <p className="mt-1 leading-relaxed">
              Dispatched ahead of your start date ({pickupDate}) with a prepaid return satchel
              included. Lodge at any Australia Post outlet by {returnDate} before 5:00 PM.
            </p>
          </div>
        </div>
      )}

      {/* 4-DAY PACKAGE MON-WED LOCK ALERT */}
      {isStartWeekdayLocked && (
        <div className="p-4 bg-brand-accent/10 border border-brand-accent text-xs font-sans text-brand-foreground flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-brand-accent">
            <AlertTriangle size={16} className="shrink-0" />
            <span>MONDAY – WEDNESDAY LOCKED FOR 4-DAY PACKAGES</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Your selected start date ({pickupDate}) falls on a{" "}
            <strong>{getWeekdayName(pickupDate)}</strong>. 4-day rental packages can only start on{" "}
            <strong>Thursday, Friday, Saturday, or Sunday</strong>. Please choose an available
            Thu–Sun date on the calendar.
          </p>
        </div>
      )}

      {/* CONFLICT ALERT (1-DAY TURNAROUND GAP) */}
      {bookingConflict && (
        <div className="p-4 bg-brand-accent/10 border border-brand-accent text-xs font-sans text-brand-foreground flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-brand-accent">
            <AlertTriangle size={16} className="shrink-0" />
            <span>DATES UNAVAILABLE — {gapDays}-DAY GARMENT TURNAROUND GAP</span>
          </div>
          <p className="text-[11px] leading-relaxed">{bookingConflict.reason}</p>
          <div className="mt-1 pt-1.5 border-t border-brand-accent/25 text-[10px] text-brand-muted flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>
              {settings.siteName} standard: Every garment receives a mandatory {gapDays}-day eco-steaming &amp; inspection interval between bookings.
            </span>
          </div>
        </div>
      )}

      {/* AUD PRICE BREAKDOWN */}
      <div className="p-4 bg-brand-surface/20 border border-brand-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-sans text-brand-muted">
          <span>
            Garment Rental ({rentalDays} {rentalDays === 1 ? "day" : "days"}):
          </span>
          <span className="text-brand-foreground font-medium">{formatAud(rentalFeeAud)}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans text-brand-muted">
          <span>
            Delivery ({deliveryMethod === "pick_in_person" ? "Pick in Person" : "Transport Post"}):
          </span>
          <span className="text-brand-foreground font-medium">
            {deliveryFeeAud === 0 ? "Free ($0.00 AUD)" : `+${formatAud(deliveryFeeAud)}`}
          </span>
        </div>

        {afterHoursFeeAud > 0 && (
          <div className="flex items-center justify-between text-xs font-sans text-brand-accent">
            <span>After-Hours Return Surcharge:</span>
            <span className="font-medium">+{formatAud(afterHoursFeeAud)}</span>
          </div>
        )}

        <div className="pt-2.5 border-t border-brand-border/50 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-sans tracking-widest uppercase text-brand-muted block">
              TOTAL AMOUNT (AUD)
            </span>
            <span className="font-serif text-2xl font-normal text-brand-foreground">
              {formatAud(totalAud)}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-brand-sage px-2 py-1 text-brand-foreground border border-brand-border/40">
            {product.code} · Size {selectedSize}
          </span>
        </div>
      </div>

      {/* CTA BUTTONS */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!canBook}
          onClick={handleAddToBag}
          className={cn(
            "w-full py-4 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 font-medium",
            !canBook &&
              "bg-brand-surface/40 text-brand-muted border border-brand-border cursor-not-allowed opacity-50",
            canBook &&
              !isAddedSuccess &&
              "bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 cursor-pointer",
            isAddedSuccess &&
              "bg-brand-sage text-brand-foreground border border-brand-border cursor-default"
          )}
        >
          {isAddedSuccess ? (
            <>
              <Check size={16} />
              <span>ADDED TO SHOPPING BAG</span>
            </>
          ) : isStartWeekdayLocked ? (
            <span>MON–WED LOCKED FOR 4-DAY PACKAGE — PICK THU–SUN</span>
          ) : bookingConflict ? (
            <span>DATES CONFLICT — PLEASE SELECT OTHER DATES</span>
          ) : !isTimeOrderValid ? (
            <span>RETURN TIME MUST BE AFTER PICKUP TIME</span>
          ) : (
            <>
              <ShoppingBag size={16} />
              <span>ADD TO BAG — {formatAud(totalAud)}</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={!canBook}
          onClick={handleBookNow}
          className={cn(
            "w-full py-3.5 text-xs font-sans tracking-[0.2em] uppercase border transition-all flex items-center justify-center gap-2 font-medium",
            !canBook
              ? "border-brand-border/40 text-brand-muted opacity-40 cursor-not-allowed"
              : "border-brand-foreground text-brand-foreground bg-transparent hover:bg-brand-surface/40 cursor-pointer"
          )}
        >
          <span>BOOK &amp; CHECKOUT AS GUEST</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
