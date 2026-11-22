"""Pydantic v2 request and response schemas for Maison de Lua API."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

DeliveryMethodType = Literal["pick_in_person", "transport_post"]
RentalDaysType = Literal[1, 2, 4, 8]
BookingStatusType = Literal["pending", "confirmed", "active", "returned", "cancelled"]
PaymentMethodType = Literal["card", "bank_transfer", "studio_pay"]
TransactionStatusType = Literal["paid", "pending", "refunded", "failed"]


# ── Site Settings ─────────────────────────────────────────────────────────────


class MetadataBarItem(BaseModel):
    label: str
    value: str
    subtitle: str | None = None


class SiteSettingsBase(BaseModel):
    site_name: str = Field(..., min_length=1, max_length=120)
    site_handle: str = Field(..., min_length=1, max_length=80)
    tagline: str = Field(..., min_length=1, max_length=255)
    logo_url: str = Field(..., min_length=1, max_length=500)
    currency: str = Field(default="AUD", max_length=10)

    hero_title: str = Field(..., max_length=180)
    hero_subtitle: str = Field(..., max_length=220)
    hero_quote: str
    hero_image_url: str = Field(..., max_length=500)

    about_title: str = Field(..., max_length=140)
    about_paragraphs: list[str]
    about_image_url: str = Field(..., max_length=500)

    spotlight_quote: str
    spotlight_image_url: str = Field(..., max_length=500)
    metadata_items: list[MetadataBarItem]

    studio_address: str = Field(..., max_length=255)
    contact_email: str = Field(..., max_length=180)
    contact_phone: str = Field(..., max_length=40)
    instagram_url: str = Field(..., max_length=255)
    facebook_url: str = Field(..., max_length=255)
    bank_account_name: str = Field(..., max_length=140)
    bank_bsb: str = Field(..., max_length=20)
    bank_account_number: str = Field(..., max_length=40)
    payid_email: str = Field(..., max_length=180)

    transport_post_fee_aud: float = Field(..., ge=0)
    after_hours_fee_aud: float = Field(..., ge=0)
    turnaround_gap_days: int = Field(default=1, ge=0, le=7)
    business_open_time: str = Field(default="08:00 AM", max_length=20)
    business_close_time: str = Field(default="09:00 PM", max_length=20)


class SiteSettingsUpdate(SiteSettingsBase):
    pass


class SiteSettingsResponse(SiteSettingsBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Garments (Ao Dai) ─────────────────────────────────────────────────────────


class SizeSpec(BaseModel):
    label: str = Field(..., min_length=1, max_length=16)
    bust: int = Field(..., ge=50, le=160)
    waist: int = Field(..., ge=40, le=150)
    hip: int = Field(..., ge=50, le=170)
    length: int = Field(default=140, ge=90, le=180)
    available: bool = True


class ModelInfo(BaseModel):
    height: str
    wearing_size: str


class GarmentBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=32)
    slug: str = Field(..., min_length=2, max_length=160)
    name: str = Field(..., min_length=2, max_length=200)
    description: str = ""
    rental_price_aud: float = Field(..., gt=0)
    occasion: str = Field(default="Wedding", max_length=60)
    color: str = Field(default="Ivory", max_length=60)
    images: list[str] = Field(default_factory=list)
    sizes: list[SizeSpec] = Field(default_factory=list)
    model_height: str | None = None
    model_wearing_size: str | None = None
    is_active: bool = True


class GarmentCreate(GarmentBase):
    id: str | None = None


class GarmentUpdate(GarmentBase):
    pass


class GarmentResponse(GarmentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Availability & Pricing ────────────────────────────────────────────────────


class BookedRangeResponse(BaseModel):
    booking_ref: str
    start_date: date
    end_date: date
    gap_before_date: date
    gap_after_date: date
    delivery_method: str
    rental_days: int
    status: str


class GarmentAvailabilityResponse(BaseModel):
    garment_id: str
    garment_code: str
    turnaround_gap_days: int
    bookings: list[BookedRangeResponse]
    booked_dates: list[str]
    gap_dates: list[str]


class AvailabilityCheckRequest(BaseModel):
    garment_id: str
    size_label: str
    delivery_method: DeliveryMethodType
    rental_days: RentalDaysType
    start_date: date
    pickup_time: str = "09:00 AM"
    return_time: str = "06:00 PM"


class AvailabilityCheckResponse(BaseModel):
    available: bool
    reason: str | None = None
    start_date: date
    end_date: date
    gap_until_date: date
    is_after_hours: bool
    rental_fee_aud: float
    delivery_fee_aud: float
    after_hours_fee_aud: float
    total_aud: float
    currency: str = "AUD"


# ── Guest Checkout, Bookings & Transactions ───────────────────────────────────


class CheckoutItemRequest(BaseModel):
    garment_id: str
    size_label: str
    delivery_method: DeliveryMethodType
    rental_days: RentalDaysType
    start_date: date
    pickup_time: str = "09:00 AM"
    return_time: str = "06:00 PM"


class GuestCheckoutRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=160)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=6, max_length=40)
    shipping_address: str | None = None
    notes: str | None = None
    payment_method: PaymentMethodType = "card"
    card_last4: str | None = Field(default=None, max_length=4)
    items: list[CheckoutItemRequest] = Field(..., min_length=1)


class BookingResponse(BaseModel):
    id: int
    booking_ref: str
    garment_id: str
    garment_code: str
    garment_name: str
    size_label: str
    delivery_method: str
    rental_days: int
    start_date: date
    end_date: date
    gap_until_date: date
    pickup_time: str
    return_time: str
    is_after_hours: bool
    rental_fee_aud: float
    delivery_fee_aud: float
    after_hours_fee_aud: float
    total_aud: float
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str | None
    notes: str | None
    status: str
    invoice_number: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(BaseModel):
    id: int
    transaction_ref: str
    invoice_number: str
    booking_refs: list[str]
    customer_name: str
    customer_email: str
    customer_phone: str
    payment_method: str
    card_last4: str | None
    subtotal_aud: float
    delivery_fee_aud: float
    after_hours_fee_aud: float
    total_aud: float
    currency: str
    status: str
    invoice_email_status: str
    invoice_email_error: str | None
    invoice_email_html: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GuestCheckoutResponse(BaseModel):
    transaction: TransactionResponse
    bookings: list[BookingResponse]
    message: str


# ── Admin Auth & Admin Updates ────────────────────────────────────────────────


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminUserResponse


class BookingAdminUpdate(BaseModel):
    status: BookingStatusType | None = None
    notes: str | None = None


class TransactionAdminUpdate(BaseModel):
    status: TransactionStatusType


class AdminOverviewResponse(BaseModel):
    paid_revenue_aud: float
    pending_revenue_aud: float
    total_bookings: int
    active_bookings: int
    total_garments: int
    active_garments: int
    total_transactions: int
    currency: str = "AUD"
