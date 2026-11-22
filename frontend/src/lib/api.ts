import {
  type AdminOverview,
  type AdminUser,
  type BookedRange,
  type BookingRecord,
  type BookingStatus,
  type CheckoutReceipt,
  type DeliveryMethod,
  type GarmentAvailability,
  type PaymentMethod,
  type Product,
  type RentalDays,
  type SiteSettings,
  type Size,
  type TransactionRecord,
  type TransactionStatus,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getServerApiBase(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || API_BASE_URL;
  }
  return API_BASE_URL;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapSiteSettingsFromApi(raw: any): SiteSettings {
  return {
    id: raw.id ?? 1,
    siteName: raw.site_name,
    siteHandle: raw.site_handle,
    tagline: raw.tagline,
    logoUrl: raw.logo_url,
    currency: raw.currency ?? "AUD",
    heroTitle: raw.hero_title,
    heroSubtitle: raw.hero_subtitle,
    heroQuote: raw.hero_quote,
    heroImageUrl: raw.hero_image_url,
    aboutTitle: raw.about_title,
    aboutParagraphs: Array.isArray(raw.about_paragraphs) ? raw.about_paragraphs : [],
    aboutImageUrl: raw.about_image_url,
    spotlightQuote: raw.spotlight_quote,
    spotlightImageUrl: raw.spotlight_image_url,
    metadataItems: Array.isArray(raw.metadata_items) ? raw.metadata_items : [],
    studioAddress: raw.studio_address,
    contactEmail: raw.contact_email,
    contactPhone: raw.contact_phone,
    instagramUrl: raw.instagram_url,
    facebookUrl: raw.facebook_url,
    bankAccountName: raw.bank_account_name,
    bankBsb: raw.bank_bsb,
    bankAccountNumber: raw.bank_account_number,
    payidEmail: raw.payid_email,
    transportPostFeeAud: Number(raw.transport_post_fee_aud ?? 16.95),
    afterHoursFeeAud: Number(raw.after_hours_fee_aud ?? 20),
    turnaroundGapDays: Number(raw.turnaround_gap_days ?? 1),
    businessOpenTime: raw.business_open_time ?? "08:00 AM",
    businessCloseTime: raw.business_close_time ?? "09:00 PM",
  };
}

export function mapSiteSettingsToApi(s: SiteSettings) {
  return {
    site_name: s.siteName,
    site_handle: s.siteHandle,
    tagline: s.tagline,
    logo_url: s.logoUrl,
    currency: s.currency || "AUD",
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    hero_quote: s.heroQuote,
    hero_image_url: s.heroImageUrl,
    about_title: s.aboutTitle,
    about_paragraphs: s.aboutParagraphs,
    about_image_url: s.aboutImageUrl,
    spotlight_quote: s.spotlightQuote,
    spotlight_image_url: s.spotlightImageUrl,
    metadata_items: s.metadataItems,
    studio_address: s.studioAddress,
    contact_email: s.contactEmail,
    contact_phone: s.contactPhone,
    instagram_url: s.instagramUrl,
    facebook_url: s.facebookUrl,
    bank_account_name: s.bankAccountName,
    bank_bsb: s.bankBsb,
    bank_account_number: s.bankAccountNumber,
    payid_email: s.payidEmail,
    transport_post_fee_aud: Number(s.transportPostFeeAud),
    after_hours_fee_aud: Number(s.afterHoursFeeAud),
    turnaround_gap_days: Number(s.turnaroundGapDays),
    business_open_time: s.businessOpenTime,
    business_close_time: s.businessCloseTime,
  };
}

export function mapGarmentFromApi(raw: any): Product {
  return {
    id: raw.id,
    code: raw.code,
    slug: raw.slug,
    name: raw.name,
    description: raw.description ?? "",
    rentalPriceAud: Number(raw.rental_price_aud),
    occasion: raw.occasion ?? "Wedding",
    color: raw.color ?? "Ivory",
    images: Array.isArray(raw.images) ? raw.images : [],
    sizes: Array.isArray(raw.sizes)
      ? raw.sizes.map((s: any) => ({
          label: s.label,
          bust: Number(s.bust),
          waist: Number(s.waist),
          hip: Number(s.hip),
          length: Number(s.length ?? 140),
          available: Boolean(s.available),
        }))
      : [],
    modelInfo:
      raw.model_height || raw.model_wearing_size
        ? {
            height: raw.model_height || "168 cm",
            wearingSize: raw.model_wearing_size || "Size S",
          }
        : undefined,
    isActive: raw.is_active !== false,
  };
}

export function mapBookingFromApi(raw: any): BookingRecord {
  return {
    id: raw.id,
    bookingRef: raw.booking_ref,
    garmentId: raw.garment_id,
    garmentCode: raw.garment_code,
    garmentName: raw.garment_name,
    sizeLabel: raw.size_label,
    deliveryMethod: raw.delivery_method as DeliveryMethod,
    rentalDays: Number(raw.rental_days),
    startDate: raw.start_date,
    endDate: raw.end_date,
    gapUntilDate: raw.gap_until_date,
    pickupTime: raw.pickup_time,
    returnTime: raw.return_time,
    isAfterHours: Boolean(raw.is_after_hours),
    rentalFeeAud: Number(raw.rental_fee_aud),
    deliveryFeeAud: Number(raw.delivery_fee_aud),
    afterHoursFeeAud: Number(raw.after_hours_fee_aud),
    totalAud: Number(raw.total_aud),
    customerName: raw.customer_name,
    customerEmail: raw.customer_email,
    customerPhone: raw.customer_phone,
    shippingAddress: raw.shipping_address ?? null,
    notes: raw.notes ?? null,
    status: raw.status as BookingStatus,
    invoiceNumber: raw.invoice_number ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function mapTransactionFromApi(raw: any): TransactionRecord {
  return {
    id: raw.id,
    transactionRef: raw.transaction_ref,
    invoiceNumber: raw.invoice_number,
    bookingRefs: Array.isArray(raw.booking_refs) ? raw.booking_refs : [],
    customerName: raw.customer_name,
    customerEmail: raw.customer_email,
    customerPhone: raw.customer_phone,
    paymentMethod: raw.payment_method as PaymentMethod,
    cardLast4: raw.card_last4 ?? null,
    subtotalAud: Number(raw.subtotal_aud),
    deliveryFeeAud: Number(raw.delivery_fee_aud),
    afterHoursFeeAud: Number(raw.after_hours_fee_aud),
    totalAud: Number(raw.total_aud),
    currency: raw.currency ?? "AUD",
    status: raw.status as TransactionStatus,
    invoiceEmailStatus: raw.invoice_email_status,
    invoiceEmailError: raw.invoice_email_error ?? null,
    invoiceEmailHtml: raw.invoice_email_html ?? "",
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getServerApiBase();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (typeof errBody?.detail === "string") {
        detail = errBody.detail;
      } else if (Array.isArray(errBody?.detail) && errBody.detail[0]?.msg) {
        detail = errBody.detail[0].msg;
      }
    } catch {
      // ignore parse failure
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ── Public Storefront API ─────────────────────────────────────────────────────

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const raw = await apiRequest<any>("/api/v1/site-settings");
  return mapSiteSettingsFromApi(raw);
}

export async function fetchGarments(): Promise<Product[]> {
  const raw = await apiRequest<any[]>("/api/v1/garments");
  return raw.map(mapGarmentFromApi);
}

export async function fetchGarmentBySlug(slug: string): Promise<Product> {
  const raw = await apiRequest<any>(`/api/v1/garments/${encodeURIComponent(slug)}`);
  return mapGarmentFromApi(raw);
}

export async function fetchGarmentAvailability(garmentId: string): Promise<GarmentAvailability> {
  const raw = await apiRequest<any>(
    `/api/v1/garments/${encodeURIComponent(garmentId)}/availability`
  );
  return {
    garmentId: raw.garment_id,
    garmentCode: raw.garment_code,
    turnaroundGapDays: Number(raw.turnaround_gap_days ?? 1),
    bookings: (raw.bookings || []).map(
      (b: any): BookedRange => ({
        bookingRef: b.booking_ref,
        startDate: b.start_date,
        endDate: b.end_date,
        gapBeforeDate: b.gap_before_date,
        gapAfterDate: b.gap_after_date,
        deliveryMethod: b.delivery_method,
        rentalDays: Number(b.rental_days),
        status: b.status,
      })
    ),
    bookedDates: raw.booked_dates || [],
    gapDates: raw.gap_dates || [],
  };
}

export interface GuestCheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  items: Array<{
    garmentId: string;
    sizeLabel: string;
    deliveryMethod: DeliveryMethod;
    rentalDays: RentalDays;
    startDate: string;
    pickupTime: string;
    returnTime: string;
  }>;
}

export async function submitGuestCheckout(
  payload: GuestCheckoutPayload
): Promise<CheckoutReceipt> {
  const raw = await apiRequest<any>("/api/v1/checkout", {
    method: "POST",
    body: JSON.stringify({
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      shipping_address: payload.shippingAddress || null,
      notes: payload.notes || null,
      payment_method: payload.paymentMethod,
      card_last4: payload.cardLast4 || null,
      items: payload.items.map((item) => ({
        garment_id: item.garmentId,
        size_label: item.sizeLabel,
        delivery_method: item.deliveryMethod,
        rental_days: item.rentalDays,
        start_date: item.startDate,
        pickup_time: item.pickupTime,
        return_time: item.returnTime,
      })),
    }),
  });

  return {
    transaction: mapTransactionFromApi(raw.transaction),
    bookings: (raw.bookings || []).map(mapBookingFromApi),
    message: raw.message,
  };
}

// ── Admin Auth & Management API ───────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; admin: AdminUser }> {
  const raw = await apiRequest<any>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return {
    accessToken: raw.access_token,
    admin: {
      id: raw.admin.id,
      email: raw.admin.email,
      fullName: raw.admin.full_name,
      role: raw.admin.role,
    },
  };
}

export async function fetchAdminMe(token: string): Promise<AdminUser> {
  const raw = await apiRequest<any>("/api/v1/auth/me", {
    headers: authHeader(token),
  });
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name,
    role: raw.role,
  };
}

export async function fetchAdminOverview(token: string): Promise<AdminOverview> {
  const raw = await apiRequest<any>("/api/v1/admin/overview", {
    headers: authHeader(token),
  });
  return {
    paidRevenueAud: Number(raw.paid_revenue_aud),
    pendingRevenueAud: Number(raw.pending_revenue_aud),
    totalBookings: Number(raw.total_bookings),
    activeBookings: Number(raw.active_bookings),
    totalGarments: Number(raw.total_garments),
    activeGarments: Number(raw.active_garments),
    totalTransactions: Number(raw.total_transactions),
    currency: raw.currency ?? "AUD",
  };
}

export async function updateAdminSiteSettings(
  token: string,
  settings: SiteSettings
): Promise<SiteSettings> {
  const raw = await apiRequest<any>("/api/v1/admin/site-settings", {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(mapSiteSettingsToApi(settings)),
  });
  return mapSiteSettingsFromApi(raw);
}

export async function uploadAdminMedia(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const raw = await apiRequest<{ url: string }>("/api/v1/admin/upload", {
    method: "POST",
    headers: authHeader(token),
    body: formData,
  });
  return raw.url;
}

export async function adminListGarments(token: string): Promise<Product[]> {
  const raw = await apiRequest<any[]>("/api/v1/admin/garments", {
    headers: authHeader(token),
  });
  return raw.map(mapGarmentFromApi);
}

export interface GarmentSaveInput {
  code: string;
  slug: string;
  name: string;
  description: string;
  rentalPriceAud: number;
  occasion: string;
  color: string;
  images: string[];
  sizes: Size[];
  modelHeight?: string;
  modelWearingSize?: string;
  isActive: boolean;
}

function serializeGarmentInput(input: GarmentSaveInput) {
  return {
    code: input.code,
    slug: input.slug,
    name: input.name,
    description: input.description,
    rental_price_aud: Number(input.rentalPriceAud),
    occasion: input.occasion,
    color: input.color,
    images: input.images,
    sizes: input.sizes,
    model_height: input.modelHeight || null,
    model_wearing_size: input.modelWearingSize || null,
    is_active: input.isActive,
  };
}

export async function adminCreateGarment(
  token: string,
  input: GarmentSaveInput
): Promise<Product> {
  const raw = await apiRequest<any>("/api/v1/admin/garments", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(serializeGarmentInput(input)),
  });
  return mapGarmentFromApi(raw);
}

export async function adminUpdateGarment(
  token: string,
  garmentId: string,
  input: GarmentSaveInput
): Promise<Product> {
  const raw = await apiRequest<any>(
    `/api/v1/admin/garments/${encodeURIComponent(garmentId)}`,
    {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(serializeGarmentInput(input)),
    }
  );
  return mapGarmentFromApi(raw);
}

export async function adminDeleteGarment(
  token: string,
  garmentId: string
): Promise<{ action: string; message: string }> {
  return apiRequest<{ action: string; message: string }>(
    `/api/v1/admin/garments/${encodeURIComponent(garmentId)}`,
    {
      method: "DELETE",
      headers: authHeader(token),
    }
  );
}

export async function adminListBookings(
  token: string,
  statusFilter?: string,
  query?: string
): Promise<BookingRecord[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  if (query && query.trim()) params.set("q", query.trim());
  const qs = params.toString() ? `?${params.toString()}` : "";
  const raw = await apiRequest<any[]>(`/api/v1/admin/bookings${qs}`, {
    headers: authHeader(token),
  });
  return raw.map(mapBookingFromApi);
}

export async function adminUpdateBooking(
  token: string,
  bookingId: number,
  updates: { status?: BookingStatus; notes?: string }
): Promise<BookingRecord> {
  const raw = await apiRequest<any>(`/api/v1/admin/bookings/${bookingId}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(updates),
  });
  return mapBookingFromApi(raw);
}

export async function adminListTransactions(
  token: string,
  statusFilter?: string,
  query?: string
): Promise<TransactionRecord[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  if (query && query.trim()) params.set("q", query.trim());
  const qs = params.toString() ? `?${params.toString()}` : "";
  const raw = await apiRequest<any[]>(`/api/v1/admin/transactions${qs}`, {
    headers: authHeader(token),
  });
  return raw.map(mapTransactionFromApi);
}

export async function adminUpdateTransaction(
  token: string,
  transactionId: number,
  status: TransactionStatus
): Promise<TransactionRecord> {
  const raw = await apiRequest<any>(`/api/v1/admin/transactions/${transactionId}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
  return mapTransactionFromApi(raw);
}

export async function adminResendInvoice(
  token: string,
  transactionId: number
): Promise<TransactionRecord> {
  const raw = await apiRequest<any>(
    `/api/v1/admin/transactions/${transactionId}/resend-invoice`,
    {
      method: "POST",
      headers: authHeader(token),
    }
  );
  return mapTransactionFromApi(raw);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
