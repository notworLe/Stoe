"use client";

import { useState } from "react";
import { Search, Store, Truck, Eye, X } from "lucide-react";
import { type BookingRecord, type BookingStatus } from "@/types";
import { adminUpdateBooking } from "@/lib/api";
import { DELIVERY_METHOD_LABELS, formatAud } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminBookingsTabProps {
  token: string;
  bookings: BookingRecord[];
  onRefresh: () => Promise<void>;
}

const STATUS_OPTIONS: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "active",
  "returned",
  "cancelled",
];

export default function AdminBookingsTab({
  token,
  bookings,
  onRefresh,
}: AdminBookingsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (bookingId: number, status: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await adminUpdateBooking(token, bookingId, { status });
      await onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.bookingRef.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerEmail.toLowerCase().includes(q) ||
      b.garmentCode.toLowerCase().includes(q) ||
      b.garmentName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-serif text-2xl uppercase tracking-wider text-brand-foreground">
          Booking Schedule &amp; Operations
        </h2>
        <p className="text-xs font-sans text-brand-muted mt-1">
          Track Pick in Person &amp; Transport Post rentals, mandatory 1-day care gaps, and lifecycle status.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {["all", ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider border cursor-pointer transition-colors",
                statusFilter === st
                  ? "bg-brand-foreground text-brand-background border-brand-foreground"
                  : "bg-brand-card text-brand-foreground border-brand-border hover:border-brand-foreground"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, customer, garment..."
            className="w-full pl-9 pr-3 py-2 bg-brand-card border border-brand-border text-xs font-sans focus:outline-none focus:border-brand-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-card border border-brand-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/35 uppercase tracking-widest text-[10px] text-brand-muted">
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-3">Garment</th>
              <th className="py-3 px-3">Guest Customer</th>
              <th className="py-3 px-3">Delivery &amp; Package</th>
              <th className="py-3 px-3">Dates &amp; 1-Day Gap</th>
              <th className="py-3 px-3">Total (AUD)</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-brand-surface/15">
                <td className="py-3 px-4 font-mono text-brand-foreground whitespace-nowrap">
                  <div className="font-semibold">{b.bookingRef}</div>
                  {b.invoiceNumber && (
                    <div className="text-[10px] text-brand-muted">{b.invoiceNumber}</div>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-[10px] bg-brand-foreground text-brand-background px-1.5 py-0.5 mr-1.5">
                    {b.garmentCode}
                  </span>
                  <span className="text-brand-foreground font-medium">{b.garmentName}</span>
                  <div className="text-[11px] text-brand-muted mt-0.5">Size {b.sizeLabel}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-brand-foreground font-medium">{b.customerName}</div>
                  <div className="text-[11px] text-brand-muted">{b.customerEmail}</div>
                  <div className="text-[11px] text-brand-muted">{b.customerPhone}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="inline-flex items-center gap-1.5 text-brand-foreground">
                    {b.deliveryMethod === "transport_post" ? (
                      <Truck size={13} />
                    ) : (
                      <Store size={13} />
                    )}
                    <span>{DELIVERY_METHOD_LABELS[b.deliveryMethod]}</span>
                  </div>
                  <div className="text-[11px] text-brand-muted mt-0.5">
                    {b.rentalDays} {b.rentalDays === 1 ? "Day" : "Days"}
                    {b.isAfterHours && (
                      <span className="ml-1.5 text-brand-accent font-medium">· After-hours</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="font-mono text-brand-foreground">
                    {b.startDate} → {b.endDate}
                  </div>
                  <div className="text-[10px] text-brand-muted">
                    Care gap: {b.gapUntilDate}
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-semibold text-brand-foreground whitespace-nowrap">
                  {formatAud(b.totalAud)}
                </td>
                <td className="py-3 px-3">
                  <select
                    disabled={updatingId === b.id}
                    value={b.status}
                    onChange={(e) =>
                      handleStatusChange(b.id, e.target.value as BookingStatus)
                    }
                    className="bg-brand-background border border-brand-border px-2 py-1 text-[11px] uppercase tracking-wider cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(b)}
                    className="p-1.5 text-brand-foreground hover:bg-brand-surface/40 cursor-pointer"
                    title="Inspect booking details"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-brand-muted">
                  No bookings match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-foreground/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-brand-background border border-brand-foreground p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">
                  BOOKING DETAIL
                </p>
                <h3 className="font-serif text-2xl uppercase tracking-wider">
                  {selectedBooking.bookingRef}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-brand-muted hover:text-brand-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">Garment</span>
                <span className="font-medium">
                  {selectedBooking.garmentCode} — {selectedBooking.garmentName} (Size{" "}
                  {selectedBooking.sizeLabel})
                </span>
              </div>
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">Delivery</span>
                <span>
                  {DELIVERY_METHOD_LABELS[selectedBooking.deliveryMethod]} (
                  {selectedBooking.rentalDays}d)
                </span>
              </div>
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">Rental Window</span>
                <span className="font-mono">
                  {selectedBooking.startDate} → {selectedBooking.endDate}
                </span>
              </div>
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">1-Day Care Gap</span>
                <span className="font-mono">{selectedBooking.gapUntilDate}</span>
              </div>
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">
                  Pickup / Return Time
                </span>
                <span>
                  {selectedBooking.pickupTime} / {selectedBooking.returnTime}
                </span>
              </div>
              <div>
                <span className="text-brand-muted uppercase text-[10px] block">Total (AUD)</span>
                <span className="font-mono font-semibold">
                  {formatAud(selectedBooking.totalAud)}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-brand-border/50">
                <span className="text-brand-muted uppercase text-[10px] block">Guest Customer</span>
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-brand-muted">
                  {selectedBooking.customerEmail} · {selectedBooking.customerPhone}
                </p>
              </div>
              {selectedBooking.shippingAddress && (
                <div className="col-span-2">
                  <span className="text-brand-muted uppercase text-[10px] block">
                    Shipping Address (Transport Post)
                  </span>
                  <p>{selectedBooking.shippingAddress}</p>
                </div>
              )}
              {selectedBooking.notes && (
                <div className="col-span-2">
                  <span className="text-brand-muted uppercase text-[10px] block">Notes</span>
                  <p className="text-brand-muted">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
