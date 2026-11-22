import { type DeliveryMethod, type RentalDays, type SiteSettings } from "@/types";

export const NAV_LINKS = [
  { id: "instagram", label: "INSTAGRAM", href: "https://www.instagram.com/maisondelua" },
  { id: "home", label: "HOME", href: "/" },
  { id: "about", label: "ABOUT", href: "/#about" },
  { id: "logo", label: "MAISON DE LUA", href: "/" },
  { id: "process", label: "PROCESS", href: "/size-guide" },
  { id: "product", label: "ARCHIVE", href: "/product" },
  { id: "admin", label: "ADMIN", href: "/admin" },
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  siteName: "Maison de Lua",
  siteHandle: "maisondelua",
  tagline: "Editorial Vietnamese Ao Dai Rental Boutique — Melbourne, Australia",
  logoUrl: "/images/image.png",
  currency: "AUD",
  heroTitle: "WELCOME TO MAISON DE LUA",
  heroSubtitle: "WHERE INTENTIONALITY MEETS HERITAGE",
  heroQuote:
    "We bring a refined, intentional approach to editorial Ao Dai: handcrafted silk silhouettes curated in Melbourne to elevate your most celebrated moments.",
  heroImageUrl: "/images/hero.jpg",
  aboutTitle: "About Us",
  aboutParagraphs: [
    "Founded in Melbourne, Maison de Lua is an editorial Vietnamese Ao Dai rental atelier devoted to preserving heirloom silk silhouettes through a calm, contemporary lens.",
    "Every garment in our archive is curated as a singular physical piece — crafted from raw mulberry silk, washed linen, and hand-embroidered organza — complete with transparent three-point measurements and model height references so you can book with certainty.",
    "Whether you choose Pick in Person at our South Yarra studio or Transport Post anywhere across Australia, each Ao Dai undergoes our signature 1-day eco-steaming and UV sanitization turnaround between wearings.",
  ],
  aboutImageUrl: "/images/about.jpg",
  spotlightQuote:
    "Maison de Lua has one mission — to honour Vietnamese silk craftsmanship and bring effortless grace to our clients' most treasured occasions across Australia.",
  spotlightImageUrl: "/images/next-footer.jpg",
  metadataItems: [
    {
      label: "STUDIO ATELIER",
      value: "South Yarra, Melbourne",
      subtitle: "Pick in Person & Fittings",
    },
    {
      label: "AUSTRALIA POST",
      value: "Express Nationwide",
      subtitle: "4 & 8 Day Packages",
    },
    {
      label: "GARMENT CARE",
      value: "1-Day Eco-Steam Gap",
      subtitle: "Between Every Rental",
    },
  ],
  studioAddress: "Suite 4, Chapel Street, South Yarra VIC 3141, Melbourne",
  contactEmail: "hello@maisondelua.com.au",
  contactPhone: "+61 412 345 678",
  instagramUrl: "https://www.instagram.com/maisondelua",
  facebookUrl: "https://www.facebook.com/maisondelua",
  bankAccountName: "Maison de Lua Studio Pty Ltd",
  bankBsb: "063-000",
  bankAccountNumber: "1234 5678",
  payidEmail: "pay@maisondelua.com.au",
  transportPostFeeAud: 16.95,
  afterHoursFeeAud: 20.0,
  turnaroundGapDays: 1,
  businessOpenTime: "08:00 AM",
  businessCloseTime: "09:00 PM",
};

export const RENTAL_PACKAGES: readonly RentalDays[] = [1, 2, 4, 8];

export const ALLOWED_PACKAGES_BY_DELIVERY: Record<DeliveryMethod, readonly RentalDays[]> = {
  pick_in_person: [1, 2, 4, 8],
  transport_post: [4, 8],
};

export const PACKAGE_MULTIPLIERS: Record<RentalDays, number> = {
  1: 0.45,
  2: 0.7,
  4: 1.0,
  8: 1.75,
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pick_in_person: "Pick in Person",
  transport_post: "Transport Post",
};

export function formatAud(amount: number): string {
  return `$${amount.toFixed(2)} AUD`;
}

export function formatAudShort(amount: number): string {
  return Number.isInteger(amount) ? `$${amount} AUD` : `$${amount.toFixed(2)} AUD`;
}

export function calculatePackagePriceAud(baseFourDayPriceAud: number, days: RentalDays): number {
  const multiplier = PACKAGE_MULTIPLIERS[days] ?? 1.0;
  return Math.round(baseFourDayPriceAud * multiplier * 100) / 100;
}

/** Add N calendar days to YYYY-MM-DD in local-safe UTC arithmetic */
export function addDaysIso(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Inclusive return date: 1 day = same day, 4 days = start + 3 days */
export function computeReturnDateIso(startDateIso: string, rentalDays: number): string {
  if (!startDateIso) return "";
  return addDaysIso(startDateIso, Math.max(rentalDays - 1, 0));
}

/** Check if two inclusive date ranges conflict given mandatory turnaround gap days */
export function rangesConflictWithGap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
  gapDays: number = 1
): boolean {
  const bStartWithGap = addDaysIso(startB, -Math.max(gapDays, 0));
  const bEndWithGap = addDaysIso(endB, Math.max(gapDays, 0));
  return startA <= bEndWithGap && endA >= bStartWithGap;
}

/** JS Date.getUTCDay(): 1 = Monday, 2 = Tuesday, 3 = Wednesday */
export const FOUR_DAY_LOCKED_WEEKDAYS: readonly number[] = [1, 2, 3];

export function getWeekdayName(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", timeZone: "UTC" }).format(d);
}

/** 4-day rental packages lock Monday, Tuesday, and Wednesday start dates */
export function isWeekdayLockedForPackage(isoDate: string, rentalDays: number): boolean {
  if (rentalDays !== 4 || !isoDate) return false;
  const [year, month, day] = isoDate.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return FOUR_DAY_LOCKED_WEEKDAYS.includes(dayOfWeek);
}

export function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.trim().toUpperCase().split(" ");
  if (!time || !period) return 540;
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
