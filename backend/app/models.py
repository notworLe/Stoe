"""SQLAlchemy ORM models for Maison de Lua (PostgreSQL)."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SiteSettings(Base):
    """Singleton table storing editable website branding, copy, and AUD rental rules."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    site_name: Mapped[str] = mapped_column(String(120), nullable=False, default="Maison de Lua")
    site_handle: Mapped[str] = mapped_column(String(80), nullable=False, default="maisondelua")
    tagline: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Editorial Vietnamese Ao Dai Rental Boutique — Melbourne, Australia",
    )
    logo_url: Mapped[str] = mapped_column(String(500), nullable=False, default="/images/image.png")
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="AUD")

    # Hero section
    hero_title: Mapped[str] = mapped_column(
        String(180), nullable=False, default="WELCOME TO MAISON DE LUA"
    )
    hero_subtitle: Mapped[str] = mapped_column(
        String(220), nullable=False, default="WHERE INTENTIONALITY MEETS HERITAGE"
    )
    hero_quote: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=(
            "We bring a refined, intentional approach to editorial Ao Dai: "
            "handcrafted silk silhouettes curated in Melbourne to elevate your most celebrated moments."
        ),
    )
    hero_image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="/images/hero.jpg")

    # About section
    about_title: Mapped[str] = mapped_column(String(140), nullable=False, default="About Us")
    about_paragraphs: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    about_image_url: Mapped[str] = mapped_column(String(500), nullable=False, default="/images/about.jpg")

    # Spotlight & Metadata bar
    spotlight_quote: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default=(
            "Maison de Lua has one mission — to honour Vietnamese silk craftsmanship "
            "and bring effortless grace to our clients' most treasured occasions across Australia."
        ),
    )
    spotlight_image_url: Mapped[str] = mapped_column(
        String(500), nullable=False, default="/images/next-footer.jpg"
    )
    metadata_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)

    # Contact, Social & Payment Info
    studio_address: Mapped[str] = mapped_column(
        String(255), nullable=False, default="Suite 4, Chapel Street, South Yarra VIC 3141, Melbourne"
    )
    contact_email: Mapped[str] = mapped_column(
        String(180), nullable=False, default="hello@maisondelua.com.au"
    )
    contact_phone: Mapped[str] = mapped_column(String(40), nullable=False, default="+61 412 345 678")
    instagram_url: Mapped[str] = mapped_column(
        String(255), nullable=False, default="https://www.instagram.com/maisondelua"
    )
    facebook_url: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="https://www.facebook.com/maisondelua",
    )
    bank_account_name: Mapped[str] = mapped_column(
        String(140), nullable=False, default="Maison de Lua Studio Pty Ltd"
    )
    bank_bsb: Mapped[str] = mapped_column(String(20), nullable=False, default="063-000")
    bank_account_number: Mapped[str] = mapped_column(String(40), nullable=False, default="1234 5678")
    payid_email: Mapped[str] = mapped_column(
        String(180), nullable=False, default="pay@maisondelua.com.au"
    )

    # Rental & Delivery rules (AUD)
    transport_post_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=16.95)
    after_hours_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=20.0)
    turnaround_gap_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    business_open_time: Mapped[str] = mapped_column(String(20), nullable=False, default="08:00 AM")
    business_close_time: Mapped[str] = mapped_column(String(20), nullable=False, default="09:00 PM")

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )


class AdminUser(Base):
    """Studio administrator account."""

    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(180), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False, default="Studio Admin")
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(40), nullable=False, default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class Garment(Base):
    """Unique Ao Dai garment in Maison de Lua archive."""

    __tablename__ = "garments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    rental_price_aud: Mapped[float] = mapped_column(Float, nullable=False)  # Base 4-day rate in AUD
    occasion: Mapped[str] = mapped_column(String(60), nullable=False, default="Wedding")
    color: Mapped[str] = mapped_column(String(60), nullable=False, default="Ivory")
    images: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    sizes: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    model_height: Mapped[str | None] = mapped_column(String(40), nullable=True)
    model_wearing_size: Mapped[str | None] = mapped_column(String(40), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    bookings: Mapped[list[Booking]] = relationship("Booking", back_populates="garment")


class Booking(Base):
    """Customer garment booking with delivery method, rental package, and turnaround gap."""

    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_ref: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    garment_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("garments.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    garment_code: Mapped[str] = mapped_column(String(32), nullable=False)
    garment_name: Mapped[str] = mapped_column(String(200), nullable=False)
    size_label: Mapped[str] = mapped_column(String(20), nullable=False)

    # Delivery method: "pick_in_person" or "transport_post"
    delivery_method: Mapped[str] = mapped_column(String(30), nullable=False)
    # Rental package days: 1, 2, 4, 8 (transport_post restricted to 4, 8)
    rental_days: Mapped[int] = mapped_column(Integer, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    gap_until_date: Mapped[date] = mapped_column(Date, nullable=False)

    pickup_time: Mapped[str] = mapped_column(String(20), nullable=False, default="09:00 AM")
    return_time: Mapped[str] = mapped_column(String(20), nullable=False, default="06:00 PM")
    is_after_hours: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # AUD pricing snapshot
    rental_fee_aud: Mapped[float] = mapped_column(Float, nullable=False)
    delivery_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    after_hours_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_aud: Mapped[float] = mapped_column(Float, nullable=False)

    # Guest customer info
    customer_name: Mapped[str] = mapped_column(String(160), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    customer_phone: Mapped[str] = mapped_column(String(40), nullable=False)
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Lifecycle: pending | confirmed | active | returned | cancelled
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="confirmed", index=True)
    invoice_number: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    garment: Mapped[Garment] = relationship("Garment", back_populates="bookings")


class Transaction(Base):
    """Payment transaction and AUD invoice email record."""

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transaction_ref: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    invoice_number: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    booking_refs: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    customer_name: Mapped[str] = mapped_column(String(160), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    customer_phone: Mapped[str] = mapped_column(String(40), nullable=False)

    # Payment method: card | bank_transfer | studio_pay
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    card_last4: Mapped[str | None] = mapped_column(String(4), nullable=True)

    subtotal_aud: Mapped[float] = mapped_column(Float, nullable=False)
    delivery_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    after_hours_fee_aud: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_aud: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="AUD")

    # Payment status: paid | pending | refunded | failed
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="paid", index=True)

    # Invoice email delivery log
    invoice_email_status: Mapped[str] = mapped_column(
        String(40), nullable=False, default="simulated_sent"
    )
    invoice_email_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    invoice_email_html: Mapped[str] = mapped_column(Text, nullable=False, default="")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )
