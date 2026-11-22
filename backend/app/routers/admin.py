"""Protected Admin endpoints: overview, website settings, uploads, garments, bookings, transactions."""

from __future__ import annotations

import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import AdminUser, Booking, Garment, SiteSettings, Transaction
from app.schemas import (
    AdminOverviewResponse,
    BookingAdminUpdate,
    BookingResponse,
    GarmentCreate,
    GarmentResponse,
    GarmentUpdate,
    SiteSettingsResponse,
    SiteSettingsUpdate,
    TransactionAdminUpdate,
    TransactionResponse,
)
from app.security import get_current_admin
from app.services.email_service import dispatch_invoice_email

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB


def _has_valid_image_signature(ext: str, content: bytes) -> bool:
    if ext == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if ext in (".jpg", ".jpeg"):
        return content.startswith(b"\xff\xd8\xff")
    if ext == ".webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False


# ── Overview KPIs ─────────────────────────────────────────────────────────────


@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview(
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AdminOverviewResponse:
    site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    transactions = db.query(Transaction).all()
    bookings = db.query(Booking).all()
    garments = db.query(Garment).all()

    paid_revenue = round(sum(t.total_aud for t in transactions if t.status == "paid"), 2)
    pending_revenue = round(sum(t.total_aud for t in transactions if t.status == "pending"), 2)
    active_bookings = sum(1 for b in bookings if b.status in ("pending", "confirmed", "active"))
    active_garments = sum(1 for g in garments if g.is_active)

    return AdminOverviewResponse(
        paid_revenue_aud=paid_revenue,
        pending_revenue_aud=pending_revenue,
        total_bookings=len(bookings),
        active_bookings=active_bookings,
        total_garments=len(garments),
        active_garments=active_garments,
        total_transactions=len(transactions),
        currency=site_settings.currency if site_settings else "AUD",
    )


# ── Site Settings (Website Info) ──────────────────────────────────────────────


@router.put("/site-settings", response_model=SiteSettingsResponse)
def update_site_settings(
    payload: SiteSettingsUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> SiteSettings:
    site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if site_settings is None:
        site_settings = SiteSettings(id=1)
        db.add(site_settings)

    data = payload.model_dump()
    for field_name, value in data.items():
        setattr(site_settings, field_name, value)

    db.commit()
    db.refresh(site_settings)
    return site_settings


# ── Asset Upload (Logo / Garment Photos) ──────────────────────────────────────


@router.post("/upload")
async def upload_media_file(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    settings = get_settings()
    original_name = Path(file.filename or "upload.png").name
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PNG, JPG, or WEBP.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds 8 MB size limit.",
        )
    if not _has_valid_image_signature(ext, content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match a valid PNG, JPG, or WEBP image.",
        )

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{secrets.token_hex(8)}{ext}"
    dest = settings.upload_dir / unique_name
    dest.write_bytes(content)

    return {"url": f"/uploads/{unique_name}", "filename": unique_name}


# ── Garment Management (CRUD) ─────────────────────────────────────────────────


@router.get("/garments", response_model=list[GarmentResponse])
def admin_list_garments(
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Garment]:
    return db.query(Garment).order_by(Garment.created_at.desc(), Garment.code.asc()).all()


@router.post("/garments", response_model=GarmentResponse, status_code=status.HTTP_201_CREATED)
def admin_create_garment(
    payload: GarmentCreate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Garment:
    if db.query(Garment).filter(Garment.code == payload.code).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Garment code '{payload.code}' already exists.",
        )
    if db.query(Garment).filter(Garment.slug == payload.slug).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Garment slug '{payload.slug}' already exists.",
        )

    garment_id = payload.id or f"mdl-{secrets.token_hex(4)}"
    data = payload.model_dump(exclude={"id"})
    garment = Garment(id=garment_id, **data)
    db.add(garment)
    db.commit()
    db.refresh(garment)
    return garment


@router.put("/garments/{garment_id}", response_model=GarmentResponse)
def admin_update_garment(
    garment_id: str,
    payload: GarmentUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Garment:
    garment = db.query(Garment).filter(Garment.id == garment_id).first()
    if garment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garment not found.")

    conflict_code = (
        db.query(Garment)
        .filter(Garment.code == payload.code, Garment.id != garment_id)
        .first()
    )
    if conflict_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Another garment already uses code '{payload.code}'.",
        )

    conflict_slug = (
        db.query(Garment)
        .filter(Garment.slug == payload.slug, Garment.id != garment_id)
        .first()
    )
    if conflict_slug:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Another garment already uses slug '{payload.slug}'.",
        )

    for field_name, value in payload.model_dump().items():
        setattr(garment, field_name, value)

    db.commit()
    db.refresh(garment)
    return garment


@router.delete("/garments/{garment_id}", status_code=status.HTTP_200_OK)
def admin_delete_garment(
    garment_id: str,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    garment = db.query(Garment).filter(Garment.id == garment_id).first()
    if garment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Garment not found.")

    linked_bookings = db.query(Booking).filter(Booking.garment_id == garment_id).count()
    if linked_bookings > 0:
        garment.is_active = False
        db.commit()
        return {
            "action": "archived",
            "message": (
                f"Garment {garment.code} has {linked_bookings} historical booking(s) and was "
                "archived instead of permanently deleted to preserve booking records."
            ),
        }

    db.delete(garment)
    db.commit()
    return {"action": "deleted", "message": f"Garment {garment.code} deleted permanently."}


# ── Booking Management ────────────────────────────────────────────────────────


@router.get("/bookings", response_model=list[BookingResponse])
def admin_list_bookings(
    booking_status: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Booking]:
    query = db.query(Booking).order_by(Booking.created_at.desc(), Booking.id.desc())
    if booking_status and booking_status.lower() != "all":
        query = query.filter(Booking.status == booking_status.lower())
    results = query.all()
    if q:
        term = q.strip().lower()
        results = [
            b
            for b in results
            if term in b.booking_ref.lower()
            or term in b.customer_name.lower()
            or term in b.customer_email.lower()
            or term in b.garment_code.lower()
            or term in b.garment_name.lower()
        ]
    return results


@router.patch("/bookings/{booking_id}", response_model=BookingResponse)
def admin_update_booking(
    booking_id: int,
    payload: BookingAdminUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if payload.status is not None:
        booking.status = payload.status
    if payload.notes is not None:
        booking.notes = payload.notes

    db.commit()
    db.refresh(booking)
    return booking


# ── Transactions & Invoices ───────────────────────────────────────────────────


@router.get("/transactions", response_model=list[TransactionResponse])
def admin_list_transactions(
    tx_status: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Transaction]:
    query = db.query(Transaction).order_by(Transaction.created_at.desc(), Transaction.id.desc())
    if tx_status and tx_status.lower() != "all":
        query = query.filter(Transaction.status == tx_status.lower())
    results = query.all()
    if q:
        term = q.strip().lower()
        results = [
            t
            for t in results
            if term in t.invoice_number.lower()
            or term in t.transaction_ref.lower()
            or term in t.customer_name.lower()
            or term in t.customer_email.lower()
        ]
    return results


@router.patch("/transactions/{transaction_id}", response_model=TransactionResponse)
def admin_update_transaction(
    transaction_id: int,
    payload: TransactionAdminUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Transaction:
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    tx.status = payload.status
    if payload.status == "paid":
        linked = db.query(Booking).filter(Booking.invoice_number == tx.invoice_number).all()
        for b in linked:
            if b.status == "pending":
                b.status = "confirmed"

    db.commit()
    db.refresh(tx)
    return tx


@router.post("/transactions/{transaction_id}/resend-invoice", response_model=TransactionResponse)
def admin_resend_invoice(
    transaction_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Transaction:
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if site_settings is None:
        raise HTTPException(status_code=500, detail="Site settings not initialized.")

    bookings = db.query(Booking).filter(Booking.invoice_number == tx.invoice_number).all()
    email_status, email_error, invoice_html = dispatch_invoice_email(tx, bookings, site_settings)
    tx.invoice_email_status = email_status
    tx.invoice_email_error = email_error
    tx.invoice_email_html = invoice_html

    db.commit()
    db.refresh(tx)
    return tx
