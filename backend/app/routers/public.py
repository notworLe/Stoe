"""Public storefront API endpoints: settings, catalog, availability, guest checkout, invoices."""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, Garment, SiteSettings, Transaction
from app.schemas import (
    AvailabilityCheckRequest,
    AvailabilityCheckResponse,
    BookedRangeResponse,
    BookingResponse,
    GarmentAvailabilityResponse,
    GarmentResponse,
    GuestCheckoutRequest,
    GuestCheckoutResponse,
    SiteSettingsResponse,
    TransactionResponse,
)
from app.services.booking_rules import (
    collect_blocked_dates,
    validate_booking_request,
)
from app.services.email_service import dispatch_invoice_email

router = APIRouter(prefix="/api/v1", tags=["Storefront"])


def _get_site_settings(db: Session) -> SiteSettings:
    site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if site_settings is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Site settings have not been initialized.",
        )
    return site_settings


@router.get("/site-settings", response_model=SiteSettingsResponse)
def get_public_site_settings(db: Session = Depends(get_db)) -> SiteSettings:
    return _get_site_settings(db)


@router.get("/garments", response_model=list[GarmentResponse])
def list_public_garments(
    occasion: str | None = Query(default=None),
    size: str | None = Query(default=None),
    color: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[Garment]:
    garments = (
        db.query(Garment)
        .filter(Garment.is_active.is_(True))
        .order_by(Garment.created_at.asc(), Garment.code.asc())
        .all()
    )

    if occasion and occasion.lower() != "all":
        garments = [g for g in garments if g.occasion.lower() == occasion.lower()]
    if color and color.lower() != "all":
        garments = [g for g in garments if g.color.lower() == color.lower()]
    if size and size.lower() != "all":
        garments = [
            g
            for g in garments
            if any(
                str(s.get("label", "")).upper() == size.upper() and s.get("available", False)
                for s in g.sizes
            )
        ]
    if search:
        term = search.strip().lower()
        garments = [
            g
            for g in garments
            if term in g.name.lower() or term in g.code.lower() or term in g.description.lower()
        ]
    return garments


@router.get("/garments/{slug_or_id}", response_model=GarmentResponse)
def get_public_garment(slug_or_id: str, db: Session = Depends(get_db)) -> Garment:
    garment = (
        db.query(Garment)
        .filter((Garment.slug == slug_or_id) | (Garment.id == slug_or_id))
        .first()
    )
    if garment is None or not garment.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Garment not found in the archive.",
        )
    return garment


@router.get("/garments/{garment_id}/availability", response_model=GarmentAvailabilityResponse)
def get_garment_availability(garment_id: str, db: Session = Depends(get_db)) -> GarmentAvailabilityResponse:
    garment = (
        db.query(Garment)
        .filter((Garment.id == garment_id) | (Garment.slug == garment_id))
        .first()
    )
    if garment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garment not found.")

    site_settings = _get_site_settings(db)
    gap_days = site_settings.turnaround_gap_days

    bookings = (
        db.query(Booking)
        .filter(Booking.garment_id == garment.id, Booking.status != "cancelled")
        .order_by(Booking.start_date.asc())
        .all()
    )
    booked_dates, gap_dates = collect_blocked_dates(bookings, gap_days=gap_days)

    ranges = [
        BookedRangeResponse(
            booking_ref=b.booking_ref,
            start_date=b.start_date,
            end_date=b.end_date,
            gap_before_date=b.start_date - timedelta(days=gap_days),
            gap_after_date=b.end_date + timedelta(days=gap_days),
            delivery_method=b.delivery_method,
            rental_days=b.rental_days,
            status=b.status,
        )
        for b in bookings
    ]

    return GarmentAvailabilityResponse(
        garment_id=garment.id,
        garment_code=garment.code,
        turnaround_gap_days=gap_days,
        bookings=ranges,
        booked_dates=booked_dates,
        gap_dates=gap_dates,
    )


@router.post("/bookings/check-availability", response_model=AvailabilityCheckResponse)
def check_booking_availability(
    payload: AvailabilityCheckRequest,
    db: Session = Depends(get_db),
) -> AvailabilityCheckResponse:
    garment = (
        db.query(Garment)
        .filter((Garment.id == payload.garment_id) | (Garment.slug == payload.garment_id))
        .first()
    )
    if garment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garment not found.")

    site_settings = _get_site_settings(db)
    existing_bookings = (
        db.query(Booking)
        .filter(Booking.garment_id == garment.id, Booking.status != "cancelled")
        .all()
    )

    outcome = validate_booking_request(
        garment=garment,
        size_label=payload.size_label,
        delivery_method=payload.delivery_method,
        rental_days=payload.rental_days,
        start_date=payload.start_date,
        pickup_time=payload.pickup_time,
        return_time=payload.return_time,
        existing_bookings=existing_bookings,
        site_settings=site_settings,
    )

    return AvailabilityCheckResponse(
        available=outcome.valid,
        reason=outcome.reason,
        start_date=payload.start_date,
        end_date=outcome.end_date,
        gap_until_date=outcome.gap_until_date,
        is_after_hours=outcome.is_after_hours,
        rental_fee_aud=outcome.rental_fee_aud,
        delivery_fee_aud=outcome.delivery_fee_aud,
        after_hours_fee_aud=outcome.after_hours_fee_aud,
        total_aud=outcome.total_aud,
        currency=site_settings.currency,
    )


@router.post("/checkout", response_model=GuestCheckoutResponse, status_code=status.HTTP_201_CREATED)
def guest_checkout(
    payload: GuestCheckoutRequest,
    db: Session = Depends(get_db),
) -> GuestCheckoutResponse:
    site_settings = _get_site_settings(db)

    # Require shipping address if any item uses Transport Post
    has_transport_post = any(item.delivery_method == "transport_post" for item in payload.items)
    if has_transport_post and not (payload.shipping_address and payload.shipping_address.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid Australian shipping address is required for Transport Post bookings.",
        )

    if payload.payment_method == "studio_pay" and has_transport_post:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pay at Studio is only available when all items use Pick in Person.",
        )

    now_stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_code = secrets.token_hex(4).upper()
    invoice_number = f"INV-MDL-{now_stamp}-{random_code}"
    transaction_ref = f"TX-MDL-{now_stamp}-{random_code}"

    tx_status = "paid" if payload.payment_method == "card" else "pending"
    booking_status = "confirmed" if tx_status == "paid" else "pending"

    created_bookings: list[Booking] = []
    # Keep track of bookings created inside this request to prevent same-cart gap conflicts
    staged_bookings_by_garment: dict[str, list[Booking]] = {}

    subtotal_aud = 0.0
    delivery_total_aud = 0.0
    after_hours_total_aud = 0.0

    for idx, item in enumerate(payload.items, start=1):
        garment = (
            db.query(Garment)
            .filter((Garment.id == item.garment_id) | (Garment.slug == item.garment_id))
            .first()
        )
        if garment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Garment '{item.garment_id}' was not found.",
            )

        existing = (
            db.query(Booking)
            .filter(Booking.garment_id == garment.id, Booking.status != "cancelled")
            .all()
        )
        existing_plus_staged = existing + staged_bookings_by_garment.get(garment.id, [])

        outcome = validate_booking_request(
            garment=garment,
            size_label=item.size_label,
            delivery_method=item.delivery_method,
            rental_days=item.rental_days,
            start_date=item.start_date,
            pickup_time=item.pickup_time,
            return_time=item.return_time,
            existing_bookings=existing_plus_staged,
            site_settings=site_settings,
        )
        if not outcome.valid:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=outcome.reason or "Selected rental schedule is unavailable.",
            )

        booking_ref = f"BK-{now_stamp}-{random_code}-{idx:02d}"
        booking = Booking(
            booking_ref=booking_ref,
            garment_id=garment.id,
            garment_code=garment.code,
            garment_name=garment.name,
            size_label=item.size_label.upper(),
            delivery_method=item.delivery_method,
            rental_days=item.rental_days,
            start_date=item.start_date,
            end_date=outcome.end_date,
            gap_until_date=outcome.gap_until_date,
            pickup_time=item.pickup_time,
            return_time=item.return_time,
            is_after_hours=outcome.is_after_hours,
            rental_fee_aud=outcome.rental_fee_aud,
            delivery_fee_aud=outcome.delivery_fee_aud,
            after_hours_fee_aud=outcome.after_hours_fee_aud,
            total_aud=outcome.total_aud,
            customer_name=payload.customer_name.strip(),
            customer_email=str(payload.customer_email).strip().lower(),
            customer_phone=payload.customer_phone.strip(),
            shipping_address=payload.shipping_address.strip() if payload.shipping_address else None,
            notes=payload.notes.strip() if payload.notes else None,
            status=booking_status,
            invoice_number=invoice_number,
        )
        db.add(booking)
        created_bookings.append(booking)
        staged_bookings_by_garment.setdefault(garment.id, []).append(booking)

        subtotal_aud = round(subtotal_aud + outcome.rental_fee_aud, 2)
        delivery_total_aud = round(delivery_total_aud + outcome.delivery_fee_aud, 2)
        after_hours_total_aud = round(after_hours_total_aud + outcome.after_hours_fee_aud, 2)

    grand_total_aud = round(subtotal_aud + delivery_total_aud + after_hours_total_aud, 2)

    transaction = Transaction(
        transaction_ref=transaction_ref,
        invoice_number=invoice_number,
        booking_refs=[b.booking_ref for b in created_bookings],
        customer_name=payload.customer_name.strip(),
        customer_email=str(payload.customer_email).strip().lower(),
        customer_phone=payload.customer_phone.strip(),
        payment_method=payload.payment_method,
        card_last4=payload.card_last4 if payload.payment_method == "card" else None,
        subtotal_aud=subtotal_aud,
        delivery_fee_aud=delivery_total_aud,
        after_hours_fee_aud=after_hours_total_aud,
        total_aud=grand_total_aud,
        currency=site_settings.currency,
        status=tx_status,
        invoice_email_status="pending",
    )

    email_status, email_error, invoice_html = dispatch_invoice_email(
        transaction=transaction,
        bookings=created_bookings,
        site_settings=site_settings,
    )
    transaction.invoice_email_status = email_status
    transaction.invoice_email_error = email_error
    transaction.invoice_email_html = invoice_html

    db.add(transaction)
    db.commit()

    db.refresh(transaction)
    for b in created_bookings:
        db.refresh(b)

    return GuestCheckoutResponse(
        transaction=TransactionResponse.model_validate(transaction),
        bookings=[BookingResponse.model_validate(b) for b in created_bookings],
        message=(
            f"Booking confirmed! Invoice {invoice_number} has been issued and dispatched to "
            f"{transaction.customer_email}."
        ),
    )


@router.get("/invoices/{invoice_number}", response_model=GuestCheckoutResponse)
def get_public_invoice(invoice_number: str, db: Session = Depends(get_db)) -> GuestCheckoutResponse:
    transaction = (
        db.query(Transaction)
        .filter(Transaction.invoice_number == invoice_number)
        .first()
    )
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")

    bookings = (
        db.query(Booking)
        .filter(Booking.invoice_number == invoice_number)
        .order_by(Booking.id.asc())
        .all()
    )
    return GuestCheckoutResponse(
        transaction=TransactionResponse.model_validate(transaction),
        bookings=[BookingResponse.model_validate(b) for b in bookings],
        message=f"Invoice {invoice_number} retrieved.",
    )
