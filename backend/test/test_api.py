"""End-to-end API tests for Maison de Lua booking rules, AUD checkout, and admin console."""

from __future__ import annotations

from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

from app import database
from app.config import normalize_database_url
from main import create_app


@pytest.fixture()
def client(tmp_path: Path):
    db_file = tmp_path / "test_stoe.db"
    database.configure_database(f"sqlite:///{db_file.as_posix()}")
    app = create_app()
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        database.engine.dispose()


def _admin_headers(client: TestClient) -> dict[str, str]:
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@maisondelua.com.au", "password": "admin123"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_default_site_settings_maisondelua(client: TestClient) -> None:
    resp = client.get("/api/v1/site-settings")
    assert resp.status_code == 200
    data = resp.json()
    assert data["site_name"] == "Maison de Lua"
    assert data["site_handle"] == "maisondelua"
    assert data["logo_url"] == "/images/image.png"
    assert data["currency"] == "AUD"
    assert data["transport_post_fee_aud"] == pytest.approx(16.95)
    assert data["after_hours_fee_aud"] == pytest.approx(20.0)
    assert data["turnaround_gap_days"] == 1


def test_public_garment_catalog_and_filters(client: TestClient) -> None:
    all_garments = client.get("/api/v1/garments").json()
    assert len(all_garments) == 12

    wedding = client.get("/api/v1/garments", params={"occasion": "Wedding"}).json()
    assert len(wedding) >= 1
    assert all(g["occasion"] == "Wedding" for g in wedding)

    ivory_s = client.get("/api/v1/garments", params={"color": "Ivory", "size": "S"}).json()
    assert len(ivory_s) >= 1
    assert all(g["color"] == "Ivory" for g in ivory_s)

    by_slug = client.get("/api/v1/garments/bach-lien-ivory-silk")
    assert by_slug.status_code == 200
    assert by_slug.json()["code"] == "AD-12"

    missing = client.get("/api/v1/garments/non-existent-slug")
    assert missing.status_code == 404


def test_delivery_and_rental_package_rules(client: TestClient) -> None:
    # 2027-02-11 is a Thursday (valid start date for all packages including 4-day)
    expected_multipliers = {1: 0.45, 2: 0.70, 4: 1.0, 8: 1.75}
    for days, mult in expected_multipliers.items():
        resp = client.post(
            "/api/v1/bookings/check-availability",
            json={
                "garment_id": "mdl-003",
                "size_label": "S",
                "delivery_method": "pick_in_person",
                "rental_days": days,
                "start_date": "2027-02-11",
                "pickup_time": "09:00 AM",
                "return_time": "06:00 PM",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["available"] is True, f"Pick in Person should allow {days} days"
        assert body["delivery_fee_aud"] == 0.0
        assert body["rental_fee_aud"] == pytest.approx(round(140.0 * mult, 2))
        assert body["currency"] == "AUD"

    # 1-day Pick in Person rejects return_time <= pickup_time
    bad_time = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-003",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 1,
            "start_date": "2027-02-11",
            "pickup_time": "05:00 PM",
            "return_time": "02:00 PM",
        },
    ).json()
    assert bad_time["available"] is False
    assert "after pickup time" in (bad_time["reason"] or "")

    # After-hours return (after 09:00 PM) adds $20 AUD surcharge for Pick in Person
    after_hours = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-003",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 1,
            "start_date": "2027-02-11",
            "pickup_time": "09:00 AM",
            "return_time": "10:00 PM",
        },
    ).json()
    assert after_hours["available"] is True
    assert after_hours["is_after_hours"] is True
    assert after_hours["after_hours_fee_aud"] == pytest.approx(20.0)

    # Transport Post rejects 1 and 2 day packages
    for days in (1, 2):
        resp = client.post(
            "/api/v1/bookings/check-availability",
            json={
                "garment_id": "mdl-003",
                "size_label": "S",
                "delivery_method": "transport_post",
                "rental_days": days,
                "start_date": "2027-02-11",
                "pickup_time": "09:00 AM",
                "return_time": "06:00 PM",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["available"] is False
        assert "4-day and 8-day" in (body["reason"] or "")

    # Transport Post allows 4 and 8 day packages and includes AUD post fee
    for days in (4, 8):
        resp = client.post(
            "/api/v1/bookings/check-availability",
            json={
                "garment_id": "mdl-003",
                "size_label": "S",
                "delivery_method": "transport_post",
                "rental_days": days,
                "start_date": "2027-02-11",
                "pickup_time": "09:00 AM",
                "return_time": "06:00 PM",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["available"] is True
        assert body["delivery_fee_aud"] == pytest.approx(16.95)


def test_four_day_package_locks_monday_tuesday_wednesday(client: TestClient) -> None:
    # 2027-02-08 = Monday, 2027-02-09 = Tuesday, 2027-02-10 = Wednesday -> LOCKED for 4-day
    for locked_date in ("2027-02-08", "2027-02-09", "2027-02-10"):
        for method in ("pick_in_person", "transport_post"):
            res = client.post(
                "/api/v1/bookings/check-availability",
                json={
                    "garment_id": "mdl-003",
                    "size_label": "S",
                    "delivery_method": method,
                    "rental_days": 4,
                    "start_date": locked_date,
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                },
            ).json()
            assert res["available"] is False, f"{locked_date} ({method}) must be locked for 4-day"
            assert "Monday, Tuesday, and Wednesday" in (res["reason"] or "")

        # 1-day, 2-day, and 8-day packages remain allowed on Mon/Tue/Wed
        for allowed_days in (1, 2, 8):
            ok = client.post(
                "/api/v1/bookings/check-availability",
                json={
                    "garment_id": "mdl-003",
                    "size_label": "S",
                    "delivery_method": "pick_in_person",
                    "rental_days": allowed_days,
                    "start_date": locked_date,
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                },
            ).json()
            assert ok["available"] is True

    # 2027-02-11 (Thu), 2027-02-12 (Fri), 2027-02-13 (Sat), 2027-02-14 (Sun) -> ALLOWED for 4-day
    for allowed_date in ("2027-02-11", "2027-02-12", "2027-02-13", "2027-02-14"):
        res = client.post(
            "/api/v1/bookings/check-availability",
            json={
                "garment_id": "mdl-003",
                "size_label": "S",
                "delivery_method": "transport_post",
                "rental_days": 4,
                "start_date": allowed_date,
                "pickup_time": "09:00 AM",
                "return_time": "06:00 PM",
            },
        ).json()
        assert res["available"] is True, f"{allowed_date} should be allowed for 4-day"

    # Explicit 4-day inclusive return date check: pickup 23rd -> return 26th (NOT 27th!)
    # 2027-01-23 is a Saturday; 4 inclusive days = 23, 24, 25, 26; care gap = 27
    jan23 = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-003",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 4,
            "start_date": "2027-01-23",
            "pickup_time": "09:00 AM",
            "return_time": "06:00 PM",
        },
    ).json()
    assert jan23["available"] is True
    assert jan23["start_date"] == "2027-01-23"
    assert jan23["end_date"] == "2027-01-26"
    assert jan23["gap_until_date"] == "2027-01-27"

    # Checkout attempting 4-day on Monday must fail with 409 Conflict
    checkout_locked = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Monday Guest",
            "customer_email": "monday@example.com.au",
            "customer_phone": "+61 400 222 333",
            "payment_method": "card",
            "card_last4": "4242",
            "items": [
                {
                    "garment_id": "mdl-003",
                    "size_label": "S",
                    "delivery_method": "pick_in_person",
                    "rental_days": 4,
                    "start_date": "2027-02-08",
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                }
            ],
        },
    )
    assert checkout_locked.status_code == 409


def test_one_day_gap_same_garment_constraint(client: TestClient) -> None:
    # Check availability endpoint includes booked_dates & gap_dates
    avail = client.get("/api/v1/garments/mdl-001/availability").json()
    assert "2027-01-01" in avail["booked_dates"]
    assert "2027-01-02" in avail["gap_dates"]
    assert "2026-12-31" in avail["gap_dates"]

    # Seeded booking on mdl-001 (AD-12) is 2027-01-01 to 2027-01-01 (1-day rental).
    # 2027-01-02 MUST be blocked (1-day gap after)
    day_after = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-001",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 1,
            "start_date": "2027-01-02",
            "pickup_time": "09:00 AM",
            "return_time": "06:00 PM",
        },
    ).json()
    assert day_after["available"] is False
    assert "1-day" in (day_after["reason"] or "")

    # Ending on 2026-12-31 MUST also be blocked (1-day gap before 2027-01-01)
    day_before = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-001",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 2,
            "start_date": "2026-12-30",
            "pickup_time": "09:00 AM",
            "return_time": "06:00 PM",
        },
    ).json()
    assert day_before["available"] is False

    # Starting on 2027-01-03 leaves 2027-01-02 as a full 1-day gap -> ALLOWED
    two_days_after = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-001",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 2,
            "start_date": "2027-01-03",
            "pickup_time": "09:00 AM",
            "return_time": "06:00 PM",
        },
    ).json()
    assert two_days_after["available"] is True

    # Different garment on 2027-01-01 is allowed
    other_garment = client.post(
        "/api/v1/bookings/check-availability",
        json={
            "garment_id": "mdl-002",
            "size_label": "S",
            "delivery_method": "pick_in_person",
            "rental_days": 1,
            "start_date": "2027-01-01",
            "pickup_time": "09:00 AM",
            "return_time": "06:00 PM",
        },
    ).json()
    assert other_garment["available"] is True

    # Same-cart cross-item 1-day gap violation is also blocked (409)
    same_cart_conflict = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Double Cart Guest",
            "customer_email": "double@example.com.au",
            "customer_phone": "+61 400 111 222",
            "payment_method": "card",
            "card_last4": "4242",
            "items": [
                {
                    "garment_id": "mdl-005",
                    "size_label": "S",
                    "delivery_method": "pick_in_person",
                    "rental_days": 1,
                    "start_date": "2027-05-10",
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                },
                {
                    "garment_id": "mdl-005",
                    "size_label": "M",
                    "delivery_method": "pick_in_person",
                    "rental_days": 1,
                    "start_date": "2027-05-11",
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                },
            ],
        },
    )
    assert same_cart_conflict.status_code == 409


def test_guest_checkout_creates_booking_transaction_and_invoice(client: TestClient) -> None:
    # Missing address for transport_post must fail
    bad_resp = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Olivia Smith",
            "customer_email": "olivia@example.com.au",
            "customer_phone": "+61 400 123 456",
            "payment_method": "card",
            "card_last4": "4242",
            "items": [
                {
                    "garment_id": "mdl-004",
                    "size_label": "S",
                    "delivery_method": "transport_post",
                    "rental_days": 4,
                    "start_date": "2027-03-10",
                }
            ],
        },
    )
    assert bad_resp.status_code == 400

    # Studio Pay with transport_post must fail
    bad_studio_pay = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Olivia Smith",
            "customer_email": "olivia@example.com.au",
            "customer_phone": "+61 400 123 456",
            "shipping_address": "18 Collins Street, Melbourne VIC 3000",
            "payment_method": "studio_pay",
            "items": [
                {
                    "garment_id": "mdl-004",
                    "size_label": "S",
                    "delivery_method": "transport_post",
                    "rental_days": 4,
                    "start_date": "2027-03-10",
                }
            ],
        },
    )
    assert bad_studio_pay.status_code == 400

    # Valid Transport Post card guest checkout (2027-03-11 is a Thursday)
    ok_resp = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Olivia Smith",
            "customer_email": "olivia@example.com.au",
            "customer_phone": "+61 400 123 456",
            "shipping_address": "18 Collins Street, Melbourne VIC 3000",
            "payment_method": "card",
            "card_last4": "4242",
            "items": [
                {
                    "garment_id": "mdl-004",
                    "size_label": "S",
                    "delivery_method": "transport_post",
                    "rental_days": 4,
                    "start_date": "2027-03-11",
                }
            ],
        },
    )
    assert ok_resp.status_code == 201
    receipt = ok_resp.json()
    invoice_no = receipt["transaction"]["invoice_number"]
    assert receipt["transaction"]["currency"] == "AUD"
    assert receipt["transaction"]["status"] == "paid"
    assert receipt["transaction"]["total_aud"] == pytest.approx(136.95)
    assert receipt["transaction"]["invoice_email_status"] == "simulated_sent"
    assert "Maison de Lua" in receipt["transaction"]["invoice_email_html"]
    assert len(receipt["bookings"]) == 1
    assert receipt["bookings"][0]["end_date"] == "2027-03-14"
    assert receipt["bookings"][0]["gap_until_date"] == "2027-03-15"

    # Public invoice retrieval
    inv_resp = client.get(f"/api/v1/invoices/{invoice_no}")
    assert inv_resp.status_code == 200
    assert inv_resp.json()["transaction"]["invoice_number"] == invoice_no

    # Trying to book same garment on gap day 2027-03-15 must return 409 Conflict
    conflict_resp = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Mia Wilson",
            "customer_email": "mia@example.com.au",
            "customer_phone": "+61 400 987 654",
            "payment_method": "card",
            "card_last4": "1111",
            "items": [
                {
                    "garment_id": "mdl-004",
                    "size_label": "M",
                    "delivery_method": "pick_in_person",
                    "rental_days": 1,
                    "start_date": "2027-03-15",
                    "pickup_time": "09:00 AM",
                    "return_time": "06:00 PM",
                }
            ],
        },
    )
    assert conflict_resp.status_code == 409

    # Bank transfer checkout creates pending transaction with PayID instructions in HTML invoice
    bank_resp = client.post(
        "/api/v1/checkout",
        json={
            "customer_name": "Grace Pham",
            "customer_email": "grace@example.com.au",
            "customer_phone": "+61 422 000 111",
            "payment_method": "bank_transfer",
            "items": [
                {
                    "garment_id": "mdl-006",
                    "size_label": "S",
                    "delivery_method": "pick_in_person",
                    "rental_days": 2,
                    "start_date": "2027-04-01",
                    "pickup_time": "10:00 AM",
                    "return_time": "06:00 PM",
                }
            ],
        },
    )
    assert bank_resp.status_code == 201
    bank_data = bank_resp.json()
    assert bank_data["transaction"]["status"] == "pending"
    assert bank_data["bookings"][0]["status"] == "pending"
    assert "PayID" in bank_data["transaction"]["invoice_email_html"]


def test_admin_auth_upload_settings_garments_bookings_and_transactions(client: TestClient) -> None:
    # Unauthenticated request rejected
    assert client.get("/api/v1/admin/overview").status_code == 401
    # Invalid password rejected
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@maisondelua.com.au", "password": "wrong-password"},
    )
    assert bad_login.status_code == 401

    headers = _admin_headers(client)
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "admin@maisondelua.com.au"

    # 1. Update website settings
    current_settings = client.get("/api/v1/site-settings").json()
    current_settings["site_name"] = "Maison de Lua Melbourne"
    current_settings["transport_post_fee_aud"] = 19.5
    update_resp = client.put("/api/v1/admin/site-settings", json=current_settings, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["site_name"] == "Maison de Lua Melbourne"
    assert update_resp.json()["transport_post_fee_aud"] == pytest.approx(19.5)

    # 2. Upload valid PNG & reject unsafe extensions / spoofed content
    ok_upload = client.post(
        "/api/v1/admin/upload",
        headers=headers,
        files={"file": ("logo.png", b"\x89PNG\r\n\x1a\nfake", "image/png")},
    )
    assert ok_upload.status_code == 200
    assert ok_upload.json()["url"].startswith("/uploads/")

    bad_upload = client.post(
        "/api/v1/admin/upload",
        headers=headers,
        files={"file": ("bad.exe", b"MZ", "application/octet-stream")},
    )
    assert bad_upload.status_code == 400

    svg_xss = client.post(
        "/api/v1/admin/upload",
        headers=headers,
        files={"file": ("xss.svg", b"<svg onload=alert(1)></svg>", "image/svg+xml")},
    )
    assert svg_xss.status_code == 400

    spoofed_png = client.post(
        "/api/v1/admin/upload",
        headers=headers,
        files={"file": ("fake.png", b"not-a-real-png", "image/png")},
    )
    assert spoofed_png.status_code == 400

    # 3. Create, duplicate check, delete unbooked garment, archive booked garment
    create_resp = client.post(
        "/api/v1/admin/garments",
        headers=headers,
        json={
            "code": "AD-99",
            "slug": "test-silk-ao-dai",
            "name": "Test Silk Ao Dai",
            "description": "Limited edition test silk garment.",
            "rental_price_aud": 160.0,
            "occasion": "Wedding",
            "color": "Ivory",
            "images": ["/images/aodai-ivory.jpg"],
            "sizes": [
                {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True}
            ],
            "model_height": "168 cm",
            "model_wearing_size": "Size S",
            "is_active": True,
        },
    )
    assert create_resp.status_code == 201
    garment_id = create_resp.json()["id"]

    # Duplicate code rejected
    dup_resp = client.post(
        "/api/v1/admin/garments",
        headers=headers,
        json={
            "code": "AD-99",
            "slug": "another-slug",
            "name": "Duplicate Code",
            "description": "",
            "rental_price_aud": 120.0,
            "occasion": "Event",
            "color": "Rose",
            "images": ["/images/aodai-blush.jpg"],
            "sizes": [
                {"label": "S", "bust": 84, "waist": 66, "hip": 92, "length": 140, "available": True}
            ],
            "is_active": True,
        },
    )
    assert dup_resp.status_code == 409

    # Delete unbooked garment permanently
    del_resp = client.delete(f"/api/v1/admin/garments/{garment_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["action"] == "deleted"

    # Delete garment with historical bookings -> safely archived
    archive_resp = client.delete("/api/v1/admin/garments/mdl-001", headers=headers)
    assert archive_resp.status_code == 200
    assert archive_resp.json()["action"] == "archived"

    # 4. Cancelling a booking frees its dates & 1-day gap
    bookings = client.get("/api/v1/admin/bookings", headers=headers).json()
    jan1_booking = next(b for b in bookings if b["booking_ref"] == "BK-202701-002")
    cancel_resp = client.patch(
        f"/api/v1/admin/bookings/{jan1_booking['id']}",
        headers=headers,
        json={"status": "cancelled"},
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"

    avail_after_cancel = client.get("/api/v1/garments/mdl-001/availability").json()
    assert "2027-01-01" not in avail_after_cancel["booked_dates"]
    assert "2027-01-02" not in avail_after_cancel["gap_dates"]

    # 5. Marking pending transaction paid confirms its pending booking + resend invoice works
    txs = client.get("/api/v1/admin/transactions", headers=headers).json()
    pending_tx = next(t for t in txs if t["status"] == "pending")
    mark_paid = client.patch(
        f"/api/v1/admin/transactions/{pending_tx['id']}",
        headers=headers,
        json={"status": "paid"},
    )
    assert mark_paid.status_code == 200
    assert mark_paid.json()["status"] == "paid"

    resend = client.post(
        f"/api/v1/admin/transactions/{pending_tx['id']}/resend-invoice",
        headers=headers,
    )
    assert resend.status_code == 200
    assert resend.json()["invoice_email_status"] == "simulated_sent"

    # Overview reflects AUD KPIs
    overview = client.get("/api/v1/admin/overview", headers=headers).json()
    assert overview["currency"] == "AUD"
    assert overview["paid_revenue_aud"] > 0


def test_database_url_normalization_and_supabase_storage_upload(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    assert (
        normalize_database_url("postgres://u:p@host:5432/db?sslmode=require")
        == "postgresql+psycopg://u:p@host:5432/db?sslmode=require"
    )
    assert (
        normalize_database_url("postgresql://u:p@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres")
        == "postgresql+psycopg://u:p@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
    )
    assert normalize_database_url("sqlite:///./local.db") == "sqlite:///./local.db"

    captured: dict[str, object] = {}

    async def fake_post(self, url: str, content: bytes, headers: dict[str, str]):  # noqa: ANN001
        captured["url"] = url
        captured["headers"] = headers
        captured["size"] = len(content)
        return httpx.Response(200, json={"Key": "maison-de-lua-media/test.png"})

    monkeypatch.setenv("SUPABASE_URL", "https://demo-project.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
    monkeypatch.setenv("SUPABASE_STORAGE_BUCKET", "maison-de-lua-media")
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    headers = _admin_headers(client)
    resp = client.post(
        "/api/v1/admin/upload",
        headers=headers,
        files={"file": ("brand-logo.png", b"\x89PNG\r\n\x1a\nvalid", "image/png")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["storage"] == "supabase"
    assert body["url"].startswith(
        "https://demo-project.supabase.co/storage/v1/object/public/maison-de-lua-media/"
    )
    assert str(captured["url"]).startswith(
        "https://demo-project.supabase.co/storage/v1/object/maison-de-lua-media/"
    )
