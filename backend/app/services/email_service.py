"""Branded English AUD invoice builder and SMTP/simulated email dispatcher."""

from __future__ import annotations

import html
import smtplib
from email.message import EmailMessage

from app.config import get_settings
from app.models import Booking, SiteSettings, Transaction


def format_aud(amount: float) -> str:
    return f"${amount:,.2f} AUD"


def delivery_label(method: str) -> str:
    return "Pick in Person (Melbourne Studio)" if method == "pick_in_person" else "Transport Post (Australia Post Express)"


def payment_method_label(method: str, card_last4: str | None = None) -> str:
    if method == "card":
        suffix = f" ending in {card_last4}" if card_last4 else ""
        return f"Credit / Debit Card{suffix}"
    if method == "bank_transfer":
        return "Australian Bank Transfer / PayID"
    return "Pay at Studio (Pick in Person)"


def build_invoice_html(
    transaction: Transaction,
    bookings: list[Booking],
    site_settings: SiteSettings,
) -> str:
    """Render an editorial HTML invoice email in English & AUD."""
    site_name = html.escape(site_settings.site_name)
    studio_addr = html.escape(site_settings.studio_address)
    contact_email = html.escape(site_settings.contact_email)
    contact_phone = html.escape(site_settings.contact_phone)
    customer_name = html.escape(transaction.customer_name)
    customer_email = html.escape(transaction.customer_email)
    customer_phone = html.escape(transaction.customer_phone)
    invoice_no = html.escape(transaction.invoice_number)
    tx_ref = html.escape(transaction.transaction_ref)
    payment_desc = html.escape(
        payment_method_label(transaction.payment_method, transaction.card_last4)
    )
    status_label = html.escape(transaction.status.upper())

    rows_html = []
    for b in bookings:
        g_name = html.escape(b.garment_name)
        g_code = html.escape(b.garment_code)
        g_size = html.escape(b.size_label)
        b_ref = html.escape(b.booking_ref)
        d_label = html.escape(delivery_label(b.delivery_method))
        dates_str = f"{b.start_date.isoformat()} to {b.end_date.isoformat()} ({b.rental_days} {'day' if b.rental_days == 1 else 'days'})"
        time_str = (
            f"Pickup: {html.escape(b.pickup_time)} | Return: {html.escape(b.return_time)}"
            if b.delivery_method == "pick_in_person"
            else "Express dispatch prior to rental start"
        )
        addr_line = (
            f"<div style='color:#655F4D;font-size:12px;margin-top:4px;'>Ship to: {html.escape(b.shipping_address)}</div>"
            if b.shipping_address
            else ""
        )
        rows_html.append(
            f"""
            <tr>
              <td style="padding:14px 10px;border-bottom:1px solid #D6CFB0;vertical-align:top;">
                <div style="font-weight:600;color:#4A4535;font-size:14px;">{g_name}</div>
                <div style="color:#655F4D;font-size:12px;margin-top:3px;">
                  Code: {g_code} &middot; Size: {g_size} &middot; Ref: {b_ref}
                </div>
                <div style="color:#655F4D;font-size:12px;margin-top:3px;">{d_label}</div>
                <div style="color:#4A4535;font-size:12px;margin-top:3px;">{dates_str}</div>
                <div style="color:#655F4D;font-size:12px;margin-top:2px;">{time_str}</div>
                {addr_line}
              </td>
              <td style="padding:14px 10px;border-bottom:1px solid #D6CFB0;text-align:right;vertical-align:top;white-space:nowrap;color:#4A4535;font-size:14px;">
                {format_aud(b.total_aud)}
              </td>
            </tr>
            """
        )

    bank_block = ""
    if transaction.payment_method == "bank_transfer" and transaction.status != "paid":
        bank_block = f"""
        <div style="margin-top:20px;padding:16px;background:#F4F1E9;border:1px solid #A09A8A;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#655F4D;margin-bottom:6px;">
            Bank Transfer / PayID Instructions (AUD)
          </div>
          <div style="font-size:13px;color:#4A4535;line-height:1.6;">
            Account Name: <strong>{html.escape(site_settings.bank_account_name)}</strong><br/>
            BSB: <strong>{html.escape(site_settings.bank_bsb)}</strong> &middot; Account: <strong>{html.escape(site_settings.bank_account_number)}</strong><br/>
            PayID: <strong>{html.escape(site_settings.payid_email)}</strong><br/>
            Reference: <strong>{invoice_no}</strong>
          </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice {invoice_no} — {site_name}</title>
</head>
<body style="margin:0;padding:24px;background:#EDE7DA;font-family:Georgia, 'Times New Roman', serif;color:#4A4535;">
  <div style="max-width:680px;margin:0 auto;background:#F4F1E9;border:1px solid #A09A8A;padding:36px;">
    <div style="border-bottom:1px solid #A09A8A;padding-bottom:20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:22px;letter-spacing:4px;text-transform:uppercase;color:#4A4535;">{site_name}</div>
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#655F4D;margin-top:4px;">
          Tax Invoice &amp; Rental Confirmation (AUD)
        </div>
      </div>
      <div style="text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#655F4D;">
        <div><strong style="color:#4A4535;">Invoice:</strong> {invoice_no}</div>
        <div><strong style="color:#4A4535;">Transaction:</strong> {tx_ref}</div>
        <div><strong style="color:#4A4535;">Status:</strong> {status_label}</div>
      </div>
    </div>

    <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#655F4D;margin-bottom:6px;">Billed To</div>
      <div style="color:#4A4535;font-weight:600;">{customer_name}</div>
      <div style="color:#655F4D;">{customer_email} &middot; {customer_phone}</div>
      <div style="color:#655F4D;margin-top:4px;">Payment Method: {payment_desc}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px;border-bottom:1px solid #4A4535;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#655F4D;">Garment &amp; Schedule</th>
          <th style="text-align:right;padding:10px;border-bottom:1px solid #4A4535;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#655F4D;">Amount (AUD)</th>
        </tr>
      </thead>
      <tbody>
        {"".join(rows_html)}
      </tbody>
    </table>

    <div style="margin-top:20px;font-family:Arial,sans-serif;font-size:13px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#655F4D;">
        <span>Rental Subtotal</span>
        <span>{format_aud(transaction.subtotal_aud)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#655F4D;">
        <span>Transport Post Fee</span>
        <span>{format_aud(transaction.delivery_fee_aud)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#655F4D;">
        <span>After-Hours Surcharge</span>
        <span>{format_aud(transaction.after_hours_fee_aud)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0 4px;margin-top:8px;border-top:1px solid #4A4535;font-size:16px;font-weight:700;color:#4A4535;">
        <span>Total Paid / Due (AUD)</span>
        <span>{format_aud(transaction.total_aud)}</span>
      </div>
    </div>

    {bank_block}

    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #D6CFB0;font-family:Arial,sans-serif;font-size:11px;color:#655F4D;line-height:1.6;">
      <strong>{site_name}</strong> &middot; {studio_addr}<br/>
      Email: {contact_email} &middot; Phone: {contact_phone}<br/>
      Every garment undergoes a mandatory {site_settings.turnaround_gap_days}-day eco-steaming &amp; sanitization turnaround between rentals.
    </div>
  </div>
</body>
</html>"""


def dispatch_invoice_email(
    transaction: Transaction,
    bookings: list[Booking],
    site_settings: SiteSettings,
) -> tuple[str, str | None, str]:
    """Build and send invoice email via SMTP if configured; otherwise log simulated delivery."""
    settings = get_settings()
    invoice_html = build_invoice_html(transaction, bookings, site_settings)

    if not settings.smtp_host:
        return "simulated_sent", None, invoice_html

    msg = EmailMessage()
    msg["Subject"] = f"Invoice {transaction.invoice_number} — {site_settings.site_name}"
    msg["From"] = settings.smtp_from or site_settings.contact_email
    msg["To"] = transaction.customer_email
    msg.set_content(
        f"Thank you for booking with {site_settings.site_name}.\n"
        f"Invoice Number: {transaction.invoice_number}\n"
        f"Total Amount: {format_aud(transaction.total_aud)}\n"
        f"Status: {transaction.status.upper()}\n"
    )
    msg.add_alternative(invoice_html, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return "sent", None, invoice_html
    except Exception as exc:
        return "failed", str(exc), invoice_html
