"use client";

interface AvailabilityCalendarProps {
  bookedDates?: Date[];
  onSelectDelivery: (date: Date) => void;
  onSelectReturn: (date: Date) => void;
}

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
        Select Dates
      </p>
      <div className="border border-brand-border p-6 text-center">
        <p className="text-sm font-sans text-brand-muted">
          Interactive calendar is integrated inside ProductBookingInteractive.
        </p>
      </div>
    </div>
  );
}
