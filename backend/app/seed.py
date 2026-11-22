"""Idempotent seed data for Maison de Lua (English, AUD, /images/image.png)."""

from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import AdminUser, Booking, Garment, SiteSettings, Transaction
from app.security import hash_password
from app.services.email_service import build_invoice_html

DEFAULT_ABOUT_PARAGRAPHS = [
    (
        "Founded in Melbourne, Maison de Lua is an editorial Vietnamese Ao Dai rental atelier "
        "devoted to preserving heirloom silk silhouettes through a calm, contemporary lens."
    ),
    (
        "Every garment in our archive is curated as a singular physical piece — crafted from "
        "raw mulberry silk, washed linen, and hand-embroidered organza — complete with transparent "
        "three-point measurements and model height references so you can book with certainty."
    ),
    (
        "Whether you choose Pick in Person at our South Yarra studio or Transport Post anywhere "
        "across Australia, each Ao Dai undergoes our signature 1-day eco-steaming and UV sanitization "
        "turnaround between wearings."
    ),
]

DEFAULT_METADATA_ITEMS = [
    {"label": "STUDIO ATELIER", "value": "South Yarra, Melbourne", "subtitle": "Pick in Person & Fittings"},
    {"label": "AUSTRALIA POST", "value": "Express Nationwide", "subtitle": "4 & 8 Day Packages"},
    {"label": "GARMENT CARE", "value": "1-Day Eco-Steam Gap", "subtitle": "Between Every Rental"},
]

SEED_GARMENTS: list[dict] = [
    {
        "id": "mdl-001",
        "code": "AD-12",
        "slug": "bach-lien-ivory-silk",
        "name": "Bach Lien — Raw Silk Ao Dai",
        "images": ["/images/aodai-ivory.jpg", "/images/hero.jpg"],
        "rental_price_aud": 130.0,
        "occasion": "Wedding",
        "color": "Ivory",
        "description": (
            "Handwoven raw mulberry silk in luminous warm ivory, featuring a structured mandarin collar "
            "and delicate hand-sewn pearl edging tailored for modern bridal ceremonies."
        ),
        "model_height": "168 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": False},
        ],
    },
    {
        "id": "mdl-002",
        "code": "AD-08",
        "slug": "thanh-tra-sage-linen",
        "name": "Thanh Tra — Washed Linen Ao Dai",
        "images": ["/images/aodai-sage.jpg", "/images/about.jpg"],
        "rental_price_aud": 95.0,
        "occasion": "Editorial",
        "color": "Sage",
        "description": (
            "Softly washed organic linen in muted sage green with traditional wrapped diagonal buttons "
            "and fluid, unlined panels crafted for effortless movement."
        ),
        "model_height": "165 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 138, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 140, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 142, "available": True},
        ],
    },
    {
        "id": "mdl-003",
        "code": "AD-15",
        "slug": "hoang-cuc-terracotta-organza",
        "name": "Hoang Cuc — Terracotta Organza Ao Dai",
        "images": ["/images/aodai-terracotta.jpg", "/images/next-footer.jpg"],
        "rental_price_aud": 140.0,
        "occasion": "Tea Ceremony",
        "color": "Terracotta",
        "description": (
            "Sheer silk organza in warm earthen terracotta adorned with raised hand-embroidered "
            "chrysanthemum motifs, designed for traditional tea ceremonies."
        ),
        "model_height": "167 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": True},
        ],
    },
    {
        "id": "mdl-004",
        "code": "AD-19",
        "slug": "mau-don-blush-rose",
        "name": "Mau Don — Blush Rose Silk Ao Dai",
        "images": ["/images/aodai-blush.jpg", "/images/aodai-ivory.jpg"],
        "rental_price_aud": 120.0,
        "occasion": "Wedding",
        "color": "Rose",
        "description": (
            "Lustrous silk satin in powdery blush rose accented with sculpted blossom applique "
            "along the collarbone for a romantic, feminine silhouette."
        ),
        "model_height": "166 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "XL", "bust": 96, "waist": 78, "hip": 104, "length": 145, "available": False},
        ],
    },
    {
        "id": "mdl-005",
        "code": "AD-21",
        "slug": "huong-xua-vintage-brocade",
        "name": "Huong Xua — Vintage Brocade Ao Dai",
        "images": ["/images/hero.jpg", "/images/aodai-ivory.jpg"],
        "rental_price_aud": 155.0,
        "occasion": "Event",
        "color": "Ivory",
        "description": (
            "1990s-inspired tonal jacquard brocade with a relaxed heritage drape, woven in cream silk "
            "for formal receptions and gallery evenings."
        ),
        "model_height": "170 cm",
        "model_wearing_size": "Size M",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": True},
        ],
    },
    {
        "id": "mdl-006",
        "code": "AD-06",
        "slug": "lam-van-minimalist-crepe",
        "name": "Lam Van — Minimalist Studio Ao Dai",
        "images": ["/images/about.jpg", "/images/aodai-sage.jpg"],
        "rental_price_aud": 90.0,
        "occasion": "Editorial",
        "color": "Sage",
        "description": (
            "Unadorned matte silk crepe cut with architectural precision to celebrate clean lines "
            "and quiet poise in studio portraiture."
        ),
        "model_height": "168 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 139, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 141, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 143, "available": True},
        ],
    },
    {
        "id": "mdl-007",
        "code": "AD-07",
        "slug": "co-dien-signature-silhouette",
        "name": "Co Dien — Signature Editorial Silhouette",
        "images": ["/images/next-footer.jpg", "/images/aodai-terracotta.jpg"],
        "rental_price_aud": 135.0,
        "occasion": "Event",
        "color": "Terracotta",
        "description": (
            "Maison de Lua's signature Melbourne silhouette in burnt clay tones, cut to elongate "
            "the posture with graceful floor-skimming hems."
        ),
        "model_height": "169 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
        ],
    },
    {
        "id": "mdl-008",
        "code": "AD-14",
        "slug": "ngoc-lan-ceremonial-crepe",
        "name": "Ngoc Lan — Ceremonial Organza Ao Dai",
        "images": ["/images/aodai-ivory.jpg", "/images/aodai-blush.jpg"],
        "rental_price_aud": 125.0,
        "occasion": "Tea Ceremony",
        "color": "Rose",
        "description": (
            "Double-layered magnolia rose organza finished with micro glass beading at the collar "
            "and cuffs for timeless family celebrations."
        ),
        "model_height": "166 cm",
        "model_wearing_size": "Size M",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": True},
            {"label": "XL", "bust": 96, "waist": 78, "hip": 104, "length": 146, "available": True},
        ],
    },
    {
        "id": "mdl-009",
        "code": "AD-09",
        "slug": "thu-vu-olive-silk",
        "name": "Thu Vu — Olive Raw Silk Ao Dai",
        "images": ["/images/aodai-sage.jpg", "/images/hero.jpg"],
        "rental_price_aud": 115.0,
        "occasion": "Editorial",
        "color": "Sage",
        "description": (
            "Muted botanical olive silk with an organic slub texture that catches natural Melbourne "
            "daylight with subtle warmth."
        ),
        "model_height": "167 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
        ],
    },
    {
        "id": "mdl-010",
        "code": "AD-10",
        "slug": "nguyet-da-pearl-brocade",
        "name": "Nguyet Da — Pearl White Brocade Ao Dai",
        "images": ["/images/aodai-ivory.jpg", "/images/about.jpg"],
        "rental_price_aud": 145.0,
        "occasion": "Wedding",
        "color": "Ivory",
        "description": (
            "Cloud-motif jacquard brocade in pearlescent ivory, sculpted for modern brides seeking "
            "quiet opulence and heritage craftsmanship."
        ),
        "model_height": "168 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": True},
        ],
    },
    {
        "id": "mdl-011",
        "code": "AD-11",
        "slug": "thu-cuc-sunset-ochre",
        "name": "Thu Cuc — Sunset Ochre Organza Ao Dai",
        "images": ["/images/aodai-terracotta.jpg", "/images/next-footer.jpg"],
        "rental_price_aud": 135.0,
        "occasion": "Tea Ceremony",
        "color": "Terracotta",
        "description": (
            "Sun-warmed ochre and terracotta silk organza evoking late autumn light, tailored to "
            "photograph effortlessly outdoors."
        ),
        "model_height": "165 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "XS", "bust": 80, "waist": 62, "hip": 88, "length": 138, "available": True},
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "L", "bust": 92, "waist": 74, "hip": 100, "length": 144, "available": True},
        ],
    },
    {
        "id": "mdl-012",
        "code": "AD-16",
        "slug": "to-quyen-rose-chiffon",
        "name": "To Quyen — Rose Chiffon Ao Dai",
        "images": ["/images/aodai-blush.jpg", "/images/aodai-ivory.jpg"],
        "rental_price_aud": 125.0,
        "occasion": "Event",
        "color": "Rose",
        "description": (
            "Weightless dusty rose silk chiffon finished with hand-strung freshwater pearl neckline "
            "trim for evening celebrations."
        ),
        "model_height": "168 cm",
        "model_wearing_size": "Size S",
        "sizes": [
            {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True},
            {"label": "M", "bust": 88, "waist": 70, "hip": 96, "length": 142, "available": True},
            {"label": "XL", "bust": 96, "waist": 78, "hip": 104, "length": 145, "available": True},
        ],
    },
]


def seed_database(db: Session) -> None:
    """Populate initial Maison de Lua settings, admin, garments, and sample bookings if absent."""
    settings = get_settings()

    # 1. Site settings singleton (id = 1)
    site_settings = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if site_settings is None:
        site_settings = SiteSettings(
            id=1,
            site_name="Maison de Lua",
            site_handle="maisondelua",
            tagline="Editorial Vietnamese Ao Dai Rental Boutique — Melbourne, Australia",
            logo_url="/images/image.png",
            currency="AUD",
            about_paragraphs=DEFAULT_ABOUT_PARAGRAPHS,
            metadata_items=DEFAULT_METADATA_ITEMS,
        )
        db.add(site_settings)
        db.flush()

    # 2. Default Admin user
    admin = db.query(AdminUser).filter(AdminUser.email == settings.admin_email).first()
    if admin is None:
        admin = AdminUser(
            email=settings.admin_email,
            full_name="Maison de Lua Director",
            password_hash=hash_password(settings.admin_password),
            role="admin",
        )
        db.add(admin)

    # 3. Garments catalog
    existing_garments_count = db.query(Garment).count()
    if existing_garments_count == 0:
        for item in SEED_GARMENTS:
            db.add(Garment(**item))
        db.flush()

    # 4. Sample bookings + transactions for demo / 1-day gap demonstration
    if db.query(Booking).count() == 0:
        sample_bookings = [
            Booking(
                booking_ref="BK-202612-001",
                garment_id="mdl-001",
                garment_code="AD-12",
                garment_name="Bach Lien — Raw Silk Ao Dai",
                size_label="S",
                delivery_method="transport_post",
                rental_days=4,
                start_date=date(2026, 12, 17),
                end_date=date(2026, 12, 20),
                gap_until_date=date(2026, 12, 21),
                pickup_time="09:00 AM",
                return_time="05:00 PM",
                is_after_hours=False,
                rental_fee_aud=130.0,
                delivery_fee_aud=16.95,
                after_hours_fee_aud=0.0,
                total_aud=146.95,
                customer_name="Chloe Nguyen",
                customer_email="chloe.nguyen@example.com.au",
                customer_phone="+61 423 118 902",
                shipping_address="42 Flinders Lane, Melbourne VIC 3000",
                notes="Engagement tea ceremony in Carlton.",
                status="confirmed",
                invoice_number="INV-MDL-202612-001",
            ),
            Booking(
                booking_ref="BK-202701-002",
                garment_id="mdl-001",
                garment_code="AD-12",
                garment_name="Bach Lien — Raw Silk Ao Dai",
                size_label="S",
                delivery_method="pick_in_person",
                rental_days=1,
                start_date=date(2027, 1, 1),
                end_date=date(2027, 1, 1),
                gap_until_date=date(2027, 1, 2),
                pickup_time="08:00 AM",
                return_time="08:00 PM",
                is_after_hours=False,
                rental_fee_aud=58.5,
                delivery_fee_aud=0.0,
                after_hours_fee_aud=0.0,
                total_aud=58.5,
                customer_name="Hannah Tran",
                customer_email="hannah.tran@example.com.au",
                customer_phone="+61 411 904 221",
                shipping_address=None,
                notes="New Year editorial portrait session — 1-day studio pickup.",
                status="confirmed",
                invoice_number="INV-MDL-202701-002",
            ),
            Booking(
                booking_ref="BK-202612-003",
                garment_id="mdl-002",
                garment_code="AD-08",
                garment_name="Thanh Tra — Washed Linen Ao Dai",
                size_label="M",
                delivery_method="pick_in_person",
                rental_days=2,
                start_date=date(2026, 12, 22),
                end_date=date(2026, 12, 23),
                gap_until_date=date(2026, 12, 24),
                pickup_time="10:00 AM",
                return_time="09:30 PM",
                is_after_hours=True,
                rental_fee_aud=66.5,
                delivery_fee_aud=0.0,
                after_hours_fee_aud=20.0,
                total_aud=86.5,
                customer_name="Emily Le",
                customer_email="emily.le@example.com.au",
                customer_phone="+61 450 321 877",
                shipping_address=None,
                notes="After-hours return confirmed with studio team.",
                status="pending",
                invoice_number="INV-MDL-202612-003",
            ),
        ]
        for b in sample_bookings:
            db.add(b)
        db.flush()

        for idx, b in enumerate(sample_bookings, start=1):
            tx = Transaction(
                transaction_ref=f"TX-MDL-2026-{idx:04d}",
                invoice_number=b.invoice_number or f"INV-MDL-{idx:04d}",
                booking_refs=[b.booking_ref],
                customer_name=b.customer_name,
                customer_email=b.customer_email,
                customer_phone=b.customer_phone,
                payment_method="card" if b.status == "confirmed" else "bank_transfer",
                card_last4="4242" if b.status == "confirmed" else None,
                subtotal_aud=b.rental_fee_aud,
                delivery_fee_aud=b.delivery_fee_aud,
                after_hours_fee_aud=b.after_hours_fee_aud,
                total_aud=b.total_aud,
                currency="AUD",
                status="paid" if b.status == "confirmed" else "pending",
                invoice_email_status="simulated_sent",
                invoice_email_error=None,
            )
            tx.invoice_email_html = build_invoice_html(tx, [b], site_settings)
            db.add(tx)

    db.commit()
