import { type BookedRange } from "@/types";

/**
 * Fallback booked ranges matching backend/app/seed.py when offline.
 * Demonstrates the mandatory 1-day turnaround gap between rentals of the same garment.
 */
export const FALLBACK_BOOKED_RANGES: Record<string, BookedRange[]> = {
  "mdl-001": [
    {
      bookingRef: "BK-202612-001",
      startDate: "2026-12-17",
      endDate: "2026-12-20",
      gapBeforeDate: "2026-12-16",
      gapAfterDate: "2026-12-21",
      deliveryMethod: "transport_post",
      rentalDays: 4,
      status: "confirmed",
    },
    {
      bookingRef: "BK-202701-002",
      startDate: "2027-01-01",
      endDate: "2027-01-01",
      gapBeforeDate: "2026-12-31",
      gapAfterDate: "2027-01-02",
      deliveryMethod: "pick_in_person",
      rentalDays: 1,
      status: "confirmed",
    },
  ],
  "mdl-002": [
    {
      bookingRef: "BK-202612-003",
      startDate: "2026-12-22",
      endDate: "2026-12-23",
      gapBeforeDate: "2026-12-21",
      gapAfterDate: "2026-12-24",
      deliveryMethod: "pick_in_person",
      rentalDays: 2,
      status: "pending",
    },
  ],
};
