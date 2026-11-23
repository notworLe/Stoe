"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  Store,
  Truck,
  Mail,
  Printer,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Section from "@/components/layout/Section";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { submitGuestCheckout } from "@/lib/api";
import { DELIVERY_METHOD_LABELS, formatAud } from "@/lib/constants";
import { type CheckoutReceipt, type PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

const AU_STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT", "NT"] as const;

export default function CheckoutPage() {
  const {
    items,
    subtotalAud,
    deliveryTotalAud,
    afterHoursTotalAud,
    grandTotalAud,
    clearCart,
  } = useCart();
  const { settings } = useSiteSettings();

  const hasTransportPost = items.some(
    (item) => item.bookingDetails.deliveryMethod === "transport_post"
  );

  // Guest customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [auState, setAuState] = useState<string>("VIC");
  const [postcode, setPostcode] = useState("");
  const [notes, setNotes] = useState("");

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Submission & Receipt state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const effectivePaymentMethod: PaymentMethod =
    hasTransportPost && paymentMethod === "studio_pay" ? "card" : paymentMethod;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Your shopping bag is empty.");
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMsg("Please fill in your full name, email address, and phone number.");
      return;
    }

    let formattedAddress: string | undefined;
    if (hasTransportPost) {
      if (!street.trim() || !suburb.trim() || !postcode.trim()) {
        setErrorMsg("Please complete your Australian shipping address for Transport Post.");
        return;
      }
      formattedAddress = `${street.trim()}, ${suburb.trim()} ${auState} ${postcode.trim()}`;
    }

    let cardLast4: string | undefined;
    if (effectivePaymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 12 || !cardHolder.trim() || !cardExpiry.trim() || cardCvc.trim().length < 3) {
        setErrorMsg("Please enter valid cardholder name, card number, expiry, and CVC.");
        return;
      }
      cardLast4 = digits.slice(-4);
    }

    setIsSubmitting(true);
    try {
      const result = await submitGuestCheckout({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: formattedAddress,
        notes: notes.trim() || undefined,
        paymentMethod: effectivePaymentMethod,
        cardLast4,
        items: items.map((item) => ({
          garmentId: item.product.id,
          sizeLabel: item.size,
          deliveryMethod: item.bookingDetails.deliveryMethod,
          rentalDays: item.rentalDays,
          startDate: item.bookingDetails.startDate,
          pickupTime: item.bookingDetails.pickupTime,
          returnTime: item.bookingDetails.returnTime,
        })),
      });
      setReceipt(result);
      clearCart();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not complete checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── POST-PAYMENT INVOICE & EMAIL CONFIRMATION SCREEN ───────────────────────
  if (receipt) {
    const { transaction, bookings } = receipt;
    return (
      <main className="min-h-screen bg-brand-background text-brand-foreground">
        <Section className="pt-10 pb-24" containerClassName="max-w-4xl">
          <div className="border border-brand-border bg-brand-card p-6 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-brand-border">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={28} className="text-brand-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-sans uppercase tracking-[0.22em] text-brand-muted">
                    BOOKING CONFIRMED · TAX INVOICE (AUD)
                  </p>
                  <h1 className="font-serif text-2xl md:text-3xl uppercase tracking-wider text-brand-foreground mt-1">
                    Thank You, {transaction.customerName}
                  </h1>
                  <p className="text-xs font-sans text-brand-muted mt-1.5 flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>
                      Invoice <strong>{transaction.invoiceNumber}</strong> has been dispatched to{" "}
                      <strong>{transaction.customerEmail}</strong> (
                      {transaction.invoiceEmailStatus === "sent"
                        ? "Delivered via SMTP"
                        : "Issued & logged"}
                      ).
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-sans uppercase tracking-widest border border-brand-foreground text-brand-foreground hover:bg-brand-foreground hover:text-brand-background transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoice Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-brand-border/60 text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted block">
                  Invoice Number
                </span>
                <span className="font-mono font-medium text-brand-foreground">
                  {transaction.invoiceNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted block">
                  Transaction Ref
                </span>
                <span className="font-mono font-medium text-brand-foreground">
                  {transaction.transactionRef}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted block">
                  Payment Status
                </span>
                <span className="uppercase font-medium text-brand-foreground">
                  {transaction.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted block">
                  Total (AUD)
                </span>
                <span className="font-semibold text-brand-foreground">
                  {formatAud(transaction.totalAud)}
                </span>
              </div>
            </div>

            {/* Booked Items */}
            <div className="py-6 border-b border-brand-border/60 space-y-4">
              <h2 className="font-serif text-sm uppercase tracking-widest text-brand-foreground">
                Reserved Garments &amp; Schedule
              </h2>
              {bookings.map((b) => (
                <div
                  key={b.bookingRef}
                  className="p-4 bg-brand-background border border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono bg-brand-foreground text-brand-background px-1.5 py-0.5 text-[10px]">
                        {b.garmentCode}
                      </span>
                      <span className="font-serif text-base text-brand-foreground">
                        {b.garmentName}
                      </span>
                      <span className="text-brand-muted">· Size {b.sizeLabel}</span>
                    </div>
                    <p className="text-brand-muted">
                      Ref: <span className="font-mono">{b.bookingRef}</span> ·{" "}
                      {DELIVERY_METHOD_LABELS[b.deliveryMethod]} · {b.rentalDays}{" "}
                      {b.rentalDays === 1 ? "Day" : "Days"}
                    </p>
                    <p className="text-brand-foreground">
                      Dates: {b.startDate} → {b.endDate} (Care gap reserved through {b.gapUntilDate})
                    </p>
                    {b.shippingAddress && (
                      <p className="text-brand-muted">Ship to: {b.shippingAddress}</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-serif text-lg text-brand-foreground">
                      {formatAud(b.totalAud)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bank Transfer instructions if selected */}
            {transaction.paymentMethod === "bank_transfer" && (
              <div className="my-6 p-4 bg-brand-surface/30 border border-brand-border text-xs font-sans space-y-1">
                <p className="uppercase tracking-widest font-semibold text-brand-foreground">
                  Australian Bank Transfer / PayID Details (AUD)
                </p>
                <p className="text-brand-muted">
                  Account Name: <strong className="text-brand-foreground">{settings.bankAccountName}</strong>
                </p>
                <p className="text-brand-muted">
                  BSB: <strong className="text-brand-foreground">{settings.bankBsb}</strong> · Account:{" "}
                  <strong className="text-brand-foreground">{settings.bankAccountNumber}</strong> · PayID:{" "}
                  <strong className="text-brand-foreground">{settings.payidEmail}</strong>
                </p>
                <p className="text-brand-muted">
                  Please use reference <strong className="font-mono text-brand-foreground">{transaction.invoiceNumber}</strong>.
                </p>
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="pt-6 space-y-2 text-xs font-sans max-w-sm ml-auto">
              <div className="flex justify-between text-brand-muted">
                <span>Rental Subtotal</span>
                <span>{formatAud(transaction.subtotalAud)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Transport Post Fee</span>
                <span>{formatAud(transaction.deliveryFeeAud)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>After-Hours Surcharge</span>
                <span>{formatAud(transaction.afterHoursFeeAud)}</span>
              </div>
              <div className="pt-2 border-t border-brand-foreground flex justify-between font-serif text-lg text-brand-foreground">
                <span>Total ({transaction.currency})</span>
                <span>{formatAud(transaction.totalAud)}</span>
              </div>
            </div>

            {/* Email Preview Toggle */}
            <div className="mt-8 pt-6 border-t border-brand-border/60 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview((prev) => !prev)}
                  className="text-xs font-sans uppercase tracking-widest text-brand-foreground underline underline-offset-4 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {showEmailPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>
                    {showEmailPreview ? "Hide Emailed Invoice Preview" : "Inspect Emailed Invoice HTML"}
                  </span>
                </button>

                <Link
                  href="/product"
                  className="px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors"
                >
                  RETURN TO ARCHIVE
                </Link>
              </div>

              {showEmailPreview && transaction.invoiceEmailHtml && (
                <div className="mt-4 border border-brand-border bg-brand-background">
                  <iframe
                    title="Invoice Email Preview"
                    sandbox=""
                    srcDoc={transaction.invoiceEmailHtml}
                    className="w-full h-[540px] border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </Section>
      </main>
    );
  }

  // ── EMPTY BAG STATE ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-brand-background text-brand-foreground">
        <Section className="py-24" containerClassName="max-w-xl text-center">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-muted mb-3">
            {settings.siteName} · GUEST CHECKOUT
          </p>
          <h1 className="font-serif text-3xl uppercase tracking-widest mb-4">
            Your Bag Is Empty
          </h1>
          <p className="font-sans text-sm text-brand-muted mb-8 leading-relaxed">
            Select an Ao Dai from our archive, choose Pick in Person or Transport Post, and pick
            your rental dates to proceed with guest checkout.
          </p>
          <Link
            href="/product"
            className="inline-block px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors"
          >
            EXPLORE THE ARCHIVE →
          </Link>
        </Section>
      </main>
    );
  }

  // ── GUEST CHECKOUT FORM ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section className="pt-8 md:pt-12 pb-24">
        <div className="mb-8">
          <Link
            href="/product"
            className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-brand-muted hover:text-brand-foreground mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back to Archive</span>
          </Link>
          <p className="text-[11px] font-sans uppercase tracking-[0.24em] text-brand-muted">
            {settings.siteName} · GUEST CHECKOUT · {settings.currency}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-brand-foreground mt-1 font-normal">
            Complete Your Booking
          </h1>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Guest Info + Shipping + Payment */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {errorMsg && (
              <div className="p-4 bg-brand-accent/10 border border-brand-accent text-xs font-sans text-brand-foreground flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-brand-accent shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Customer Information */}
            <div className="p-6 bg-brand-card border border-brand-border space-y-5">
              <div className="border-b border-brand-border/50 pb-3">
                <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-brand-muted">
                  STEP 1 OF 2
                </span>
                <h2 className="font-serif text-xl uppercase tracking-wider text-brand-foreground">
                  Guest Contact Information
                </h2>
                <p className="text-xs font-sans text-brand-muted mt-1">
                  No account needed. Your AUD Tax Invoice will be emailed directly to this address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Chloe Nguyen"
                    className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
                    Email Address (For Invoice) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="chloe@example.com.au"
                    className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
                    Mobile Phone (AU) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+61 412 345 678"
                    className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                  />
                </div>
              </div>

              {hasTransportPost && (
                <div className="pt-4 border-t border-brand-border/50 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-brand-foreground font-medium">
                    <Truck size={14} />
                    <span>Australia Post Shipping Address (Required for Transport Post)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required={hasTransportPost}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="42 Flinders Lane"
                        className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                        Suburb *
                      </label>
                      <input
                        type="text"
                        required={hasTransportPost}
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        placeholder="Melbourne"
                        className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                        State *
                      </label>
                      <select
                        value={auState}
                        onChange={(e) => setAuState(e.target.value)}
                        className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                      >
                        {AU_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        required={hasTransportPost}
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="3000"
                        maxLength={4}
                        className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                  Occasion / Styling Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred fitting notes, event date, or delivery instructions..."
                  className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                />
              </div>
            </div>

            {/* Section 2: Payment */}
            <div className="p-6 bg-brand-card border border-brand-border space-y-5">
              <div className="border-b border-brand-border/50 pb-3">
                <span className="text-[10px] font-sans uppercase tracking-[0.22em] text-brand-muted">
                  STEP 2 OF 2
                </span>
                <h2 className="font-serif text-xl uppercase tracking-wider text-brand-foreground">
                  Payment (AUD)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={cn(
                    "p-3.5 border text-left transition-all cursor-pointer flex flex-col gap-1",
                    effectivePaymentMethod === "card"
                      ? "bg-brand-foreground text-brand-background border-brand-foreground"
                      : "bg-brand-background text-brand-foreground border-brand-border hover:border-brand-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                    <CreditCard size={14} /> Card
                  </span>
                  <span className="text-[10px] opacity-80">Instant confirmation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={cn(
                    "p-3.5 border text-left transition-all cursor-pointer flex flex-col gap-1",
                    effectivePaymentMethod === "bank_transfer"
                      ? "bg-brand-foreground text-brand-background border-brand-foreground"
                      : "bg-brand-background text-brand-foreground border-brand-border hover:border-brand-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                    <Landmark size={14} /> Bank / PayID
                  </span>
                  <span className="text-[10px] opacity-80">AUD Transfer</span>
                </button>

                <button
                  type="button"
                  disabled={hasTransportPost}
                  onClick={() => !hasTransportPost && setPaymentMethod("studio_pay")}
                  className={cn(
                    "p-3.5 border text-left transition-all flex flex-col gap-1",
                    hasTransportPost && "opacity-40 cursor-not-allowed bg-brand-surface/20 border-brand-border/50",
                    !hasTransportPost &&
                      effectivePaymentMethod === "studio_pay" &&
                      "bg-brand-foreground text-brand-background border-brand-foreground cursor-pointer",
                    !hasTransportPost &&
                      effectivePaymentMethod !== "studio_pay" &&
                      "bg-brand-background text-brand-foreground border-brand-border hover:border-brand-foreground cursor-pointer"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                    <Store size={14} /> Studio Pay
                  </span>
                  <span className="text-[10px] opacity-80">
                    {hasTransportPost ? "Pick in Person only" : "Pay on collection"}
                  </span>
                </button>
              </div>

              {effectivePaymentMethod === "card" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="CHLOE NGUYEN"
                      className="w-full bg-brand-background px-4 py-3 text-sm font-sans border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className="w-full bg-brand-background px-4 py-3 text-sm font-mono border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                      Expiry (MM/YY) *
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="09/28"
                      maxLength={5}
                      className="w-full bg-brand-background px-4 py-3 text-sm font-mono border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                      CVC *
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-brand-background px-4 py-3 text-sm font-mono border border-brand-input-border focus:outline-none focus:border-brand-foreground"
                    />
                  </div>
                </div>
              )}

              {effectivePaymentMethod === "bank_transfer" && (
                <div className="p-4 bg-brand-background border border-brand-border text-xs font-sans space-y-1.5">
                  <p className="font-medium uppercase tracking-wider text-brand-foreground">
                    Transfer in Australian Dollars (AUD)
                  </p>
                  <p className="text-brand-muted">
                    Account Name: <strong className="text-brand-foreground">{settings.bankAccountName}</strong>
                  </p>
                  <p className="text-brand-muted">
                    BSB: <strong className="text-brand-foreground">{settings.bankBsb}</strong> · Account:{" "}
                    <strong className="text-brand-foreground">{settings.bankAccountNumber}</strong>
                  </p>
                  <p className="text-brand-muted">
                    PayID: <strong className="text-brand-foreground">{settings.payidEmail}</strong>
                  </p>
                  <p className="text-[11px] text-brand-muted pt-1">
                    Your booking dates will be reserved immediately and your Tax Invoice with transfer
                    reference will be emailed to you.
                  </p>
                </div>
              )}

              {effectivePaymentMethod === "studio_pay" && (
                <div className="p-4 bg-brand-background border border-brand-border text-xs font-sans text-brand-muted leading-relaxed">
                  Reserve your garment now and settle payment in AUD when collecting at{" "}
                  <strong className="text-brand-foreground">{settings.studioAddress}</strong>.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-xs font-sans tracking-[0.2em] uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 disabled:opacity-50 transition-all cursor-pointer font-medium"
              >
                {isSubmitting
                  ? "PROCESSING BOOKING & SENDING INVOICE..."
                  : `CONFIRM & PAY — ${formatAud(grandTotalAud)}`}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 p-6 bg-brand-card border border-brand-border flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <h2 className="font-serif text-lg uppercase tracking-widest text-brand-foreground">
                  Order Summary
                </h2>
                <span className="text-xs font-mono text-brand-muted">{settings.currency}</span>
              </div>

              <div className="divide-y divide-brand-border/40">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 flex gap-3.5 items-start">
                    <div className="relative w-16 aspect-[3/4] bg-brand-surface/30 shrink-0 overflow-hidden border border-brand-border/40">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-xs font-sans space-y-1">
                      <p className="font-serif text-sm uppercase tracking-wide text-brand-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-brand-muted">
                        <span className="font-mono">{item.product.code}</span> · Size {item.size} ·{" "}
                        {item.rentalDays} {item.rentalDays === 1 ? "Day" : "Days"}
                      </p>
                      <p className="text-brand-muted flex items-center gap-1">
                        <Calendar size={11} />
                        <span>
                          {item.bookingDetails.startDate} → {item.bookingDetails.endDate}
                        </span>
                      </p>
                      <p className="text-brand-muted">
                        {DELIVERY_METHOD_LABELS[item.bookingDetails.deliveryMethod]}
                      </p>
                      <p className="font-medium text-brand-foreground pt-1">
                        {formatAud(item.pricePerItemAud)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-brand-border/60 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-brand-muted">
                  <span>Rental Subtotal</span>
                  <span className="text-brand-foreground">{formatAud(subtotalAud)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Transport Post</span>
                  <span className="text-brand-foreground">
                    {deliveryTotalAud === 0 ? "Free ($0.00 AUD)" : formatAud(deliveryTotalAud)}
                  </span>
                </div>
                {afterHoursTotalAud > 0 && (
                  <div className="flex justify-between text-brand-accent">
                    <span>After-Hours Return</span>
                    <span>{formatAud(afterHoursTotalAud)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-brand-foreground flex items-baseline justify-between">
                  <span className="uppercase tracking-widest text-brand-muted">Total Due</span>
                  <span className="font-serif text-2xl text-brand-foreground">
                    {formatAud(grandTotalAud)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </Section>
    </main>
  );
}
