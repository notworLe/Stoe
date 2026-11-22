"""Core rental booking rules, AUD pricing, and 1-day turnaround gap enforcement."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from app.models import Booking, Garment, SiteSettings

ALLOWED_PACKAGES_BY_DELIVERY: dict[str, tuple[int, ...]] = {
    "pick_in_person": (1, 2, 4, 8),
    "transport_post": (4, 8),
}

PACKAGE_MULTIPLIERS: dict[int, float] = {
    1: 0.45,
    2: 0.70,
    4: 1.00,
    8: 1.75,
}

# Python date.weekday(): 0 = Monday, 1 = Tuesday, 2 = Wednesday
FOUR_DAY_LOCKED_WEEKDAYS: tuple[int, ...] = (0, 1, 2)

ACTIVE_BOOKING_STATUSES = ("pending", "confirmed", "active", "returned")


def parse_time_to_minutes(time_str: str) -> int:
    """Convert '08:00 AM' / '09:30 PM' into minutes since midnight."""
    cleaned = time_str.strip().upper()
    parts = cleaned.split()
    if len(parts) != 2:
        return 9 * 60
    hm, period = parts
    hour_str, minute_str = hm.split(":")
    hour = int(hour_str)
    minute = int(minute_str)
    if period == "PM" and hour != 12:
        hour += 12
    elif period == "AM" and hour == 12:
        hour = 0
    return hour * 60 + minute


def compute_end_date(start_date: date, rental_days: int) -> date:
    """Inclusive return date: 1-day is same day, 4-day is start + 3 days."""
    return start_date + timedelta(days=max(rental_days - 1, 0))


def ranges_conflict_with_gap(
    start_a: date,
    end_a: date,
    start_b: date,
    end_b: date,
    gap_days: int = 1,
) -> bool:
    """Return True if two booking intervals overlap or violate the mandatory turnaround gap."""
    gap = timedelta(days=max(gap_days, 0))
    return start_a <= (end_b + gap) and end_a >= (start_b - gap)


def calculate_pricing_aud(
    garment: Garment,
    rental_days: int,
    delivery_method: str,
    return_time: str,
    site_settings: SiteSettings,
) -> tuple[float, float, float, float, bool]:
    """Return (rental_fee, delivery_fee, after_hours_fee, total, is_after_hours) in AUD."""
    multiplier = PACKAGE_MULTIPLIERS.get(rental_days, 1.0)
    rental_fee = round(garment.rental_price_aud * multiplier, 2)

    delivery_fee = (
        round(site_settings.transport_post_fee_aud, 2)
        if delivery_method == "transport_post"
        else 0.0
    )

    close_minutes = parse_time_to_minutes(site_settings.business_close_time)
    is_after_hours = (
        delivery_method == "pick_in_person"
        and parse_time_to_minutes(return_time) > close_minutes
    )
    after_hours_fee = round(site_settings.after_hours_fee_aud, 2) if is_after_hours else 0.0

    total = round(rental_fee + delivery_fee + after_hours_fee, 2)
    return rental_fee, delivery_fee, after_hours_fee, total, is_after_hours


@dataclass
class ValidationOutcome:
    valid: bool
    reason: str | None
    end_date: date
    gap_until_date: date
    rental_fee_aud: float
    delivery_fee_aud: float
    after_hours_fee_aud: float
    total_aud: float
    is_after_hours: bool


def validate_booking_request(
    garment: Garment,
    size_label: str,
    delivery_method: str,
    rental_days: int,
    start_date: date,
    pickup_time: str,
    return_time: str,
    existing_bookings: list[Booking],
    site_settings: SiteSettings,
) -> ValidationOutcome:
    """Validate delivery/package rules, size availability, time order, and 1-day garment gap."""
    gap_days = site_settings.turnaround_gap_days
    end_date = compute_end_date(start_date, rental_days)
    gap_until_date = end_date + timedelta(days=gap_days)

    rental_fee, delivery_fee, after_hours_fee, total, is_after_hours = calculate_pricing_aud(
        garment=garment,
        rental_days=rental_days,
        delivery_method=delivery_method,
        return_time=return_time,
        site_settings=site_settings,
    )

    def fail(reason: str) -> ValidationOutcome:
        return ValidationOutcome(
            valid=False,
            reason=reason,
            end_date=end_date,
            gap_until_date=gap_until_date,
            rental_fee_aud=rental_fee,
            delivery_fee_aud=delivery_fee,
            after_hours_fee_aud=after_hours_fee,
            total_aud=total,
            is_after_hours=is_after_hours,
        )

    if not garment.is_active:
        return fail(f"Garment {garment.code} is currently archived and unavailable for booking.")

    # 1. Delivery method + rental package constraint
    allowed_packages = ALLOWED_PACKAGES_BY_DELIVERY.get(delivery_method)
    if not allowed_packages:
        return fail("Delivery method must be 'pick_in_person' or 'transport_post'.")
    if rental_days not in allowed_packages:
        if delivery_method == "transport_post":
            return fail(
                "Transport Post is only available for 4-day and 8-day rental packages. "
                "Please choose 4 or 8 days, or switch to Pick in Person for 1-day or 2-day rentals."
            )
        return fail(f"Rental package of {rental_days} days is not supported.")

    # 1b. 4-day rental package locks Monday, Tuesday, and Wednesday start dates
    if rental_days == 4 and start_date.weekday() in FOUR_DAY_LOCKED_WEEKDAYS:
        day_name = start_date.strftime("%A")
        return fail(
            f"4-day rental packages cannot start on {day_name} (Monday, Tuesday, and Wednesday "
            "are locked for 4-day rentals). Please select a Thursday, Friday, Saturday, or Sunday start date."
        )

    # 2. Size availability check
    matching_size = next(
        (s for s in garment.sizes if str(s.get("label", "")).upper() == size_label.upper()),
        None,
    )
    if not matching_size:
        return fail(f"Size {size_label} does not exist for garment {garment.code}.")
    if not matching_size.get("available", False):
        return fail(f"Size {size_label} is currently unavailable for garment {garment.code}.")

    # 3. Same-day time slot order check (1-day Pick in Person)
    if delivery_method == "pick_in_person" and rental_days == 1:
        if parse_time_to_minutes(return_time) <= parse_time_to_minutes(pickup_time):
            return fail(
                f"For a 1-day rental, return time ({return_time}) must be after pickup time ({pickup_time})."
            )

    # 4. Same-garment 1-day turnaround gap conflict check
    for booking in existing_bookings:
        if booking.status == "cancelled":
            continue
        if booking.garment_id != garment.id:
            continue
        if ranges_conflict_with_gap(
            start_a=start_date,
            end_a=end_date,
            start_b=booking.start_date,
            end_b=booking.end_date,
            gap_days=gap_days,
        ):
            next_free = booking.end_date + timedelta(days=gap_days + 1)
            prev_free_end = booking.start_date - timedelta(days=gap_days + 1)
            return fail(
                f"Garment {garment.code} is booked from {booking.start_date.isoformat()} to "
                f"{booking.end_date.isoformat()}. A mandatory {gap_days}-day cleaning & care gap "
                f"is required between bookings of the same garment. Please finish on or before "
                f"{prev_free_end.isoformat()}, or start from {next_free.isoformat()} onwards."
            )

    return ValidationOutcome(
        valid=True,
        reason=None,
        end_date=end_date,
        gap_until_date=gap_until_date,
        rental_fee_aud=rental_fee,
        delivery_fee_aud=delivery_fee,
        after_hours_fee_aud=after_hours_fee,
        total_aud=total,
        is_after_hours=is_after_hours,
    )


def collect_blocked_dates(
    bookings: list[Booking],
    gap_days: int = 1,
) -> tuple[list[str], list[str]]:
    """Compute sorted lists of booked ISO dates and 1-day turnaround gap ISO dates."""
    booked: set[str] = set()
    gap_only: set[str] = set()

    for b in bookings:
        if b.status == "cancelled":
            continue
        cursor = b.start_date
        while cursor <= b.end_date:
            booked.add(cursor.isoformat())
            cursor += timedelta(days=1)

        for offset in range(1, gap_days + 1):
            before_day = (b.start_date - timedelta(days=offset)).isoformat()
            after_day = (b.end_date + timedelta(days=offset)).isoformat()
            gap_only.add(before_day)
            gap_only.add(after_day)

    gap_only -= booked
    return sorted(booked), sorted(gap_only)
