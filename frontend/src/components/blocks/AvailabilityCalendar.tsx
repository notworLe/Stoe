"use client";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  onSelectDelivery: (date: Date) => void;
  onSelectReturn: (date: Date) => void;
}

/**
 * AvailabilityCalendar — chọn ngày giao + trả.
 * Ngày đã book: disabled + strikethrough/pattern — KHÔNG dùng màu đơn thuần (accessibility).
 * Chi tiết build ở Phase 5 (cần date picker library hoặc custom implementation).
 */
export default function AvailabilityCalendar({
  bookedDates = [],
  onSelectDelivery,
  onSelectReturn,
}: AvailabilityCalendarProps) {
  void bookedDates;
  void onSelectDelivery;
  void onSelectReturn;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
        Chọn ngày
      </p>
      {/* Calendar UI — build Phase 5 */}
      <div className="border border-brand-border p-6 text-center">
        <p className="text-sm font-sans text-brand-muted">
          Calendar — sẽ build ở Phase 5.
        </p>
        <p className="text-xs font-sans text-brand-muted mt-2">
          Ngày đã đặt: strikethrough + pattern, không chỉ đổi màu.
        </p>
      </div>
    </div>
  );
}
