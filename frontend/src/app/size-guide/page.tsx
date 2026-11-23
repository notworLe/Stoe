import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Rental Process & Size Guide — Maison de Lua Melbourne",
  description:
    "How to rent Vietnamese Ao Dai with Maison de Lua in Melbourne: Pick in Person vs Transport Post, 1/2/4/8-day packages, 1-day turnaround care gap, and cm size chart.",
};

const STEPS = [
  {
    number: "01",
    title: "Choose Garment & Size",
    description:
      "Browse our archive of one-of-one silk Ao Dai. Every design lists its garment code, model height reference, and exact bust, waist, hip, and length measurements in centimetres.",
  },
  {
    number: "02",
    title: "Select Delivery Method",
    description:
      "Choose Pick in Person at our South Yarra, Melbourne studio (Free — eligible for 1, 2, 4, and 8 day packages) or Transport Post via Australia Post Express (eligible for 4 and 8 day packages).",
  },
  {
    number: "03",
    title: "Pick Your Rental Window",
    description:
      "Select your start date and package duration (4-day packages start Thursday–Sunday; Monday–Wednesday are locked). Every garment enforces a mandatory 1-day eco-steaming gap between consecutive bookings.",
  },
  {
    number: "04",
    title: "Guest Checkout & Emailed Invoice",
    description:
      "Complete your booking as a guest in Australian Dollars (AUD) — no account required. Your itemised Tax Invoice and confirmation are sent straight to your email.",
  },
];

const STANDARD_SIZES = [
  { label: "XS", bust: "78 – 81 cm", waist: "60 – 63 cm", hip: "86 – 89 cm", length: "138 cm" },
  { label: "S", bust: "82 – 85 cm", waist: "64 – 67 cm", hip: "90 – 93 cm", length: "140 cm" },
  { label: "M", bust: "86 – 89 cm", waist: "68 – 71 cm", hip: "94 – 97 cm", length: "142 cm" },
  { label: "L", bust: "90 – 93 cm", waist: "72 – 75 cm", hip: "98 – 101 cm", length: "144 cm" },
  { label: "XL", bust: "94 – 97 cm", waist: "76 – 79 cm", hip: "102 – 105 cm", length: "146 cm" },
];

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section
        className="pt-12 md:pt-20 pb-24"
        containerClassName="max-w-[1160px] flex flex-col gap-16 md:gap-20"
      >
        {/* Intro Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-muted mb-3">
            MAISON DE LUA · MELBOURNE
          </p>
          <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-widest font-normal mb-5">
            PROCESS &amp; SIZE GUIDE
          </h1>
          <p className="font-sans text-xs md:text-sm text-brand-muted leading-relaxed">
            Transparent sizing, clear Australian Dollar (AUD) rental packages, and meticulous silk
            care between every wearing.
          </p>
        </div>

        {/* Section 1: 4 Rental Steps */}
        <div className="flex flex-col gap-6">
          <p className="text-[11px] font-sans uppercase tracking-[0.24em] text-brand-muted">
            HOW IT WORKS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="p-6 md:p-7 bg-brand-card border border-brand-border flex flex-col gap-3.5"
              >
                <span className="font-serif text-3xl text-brand-muted tracking-widest">
                  {step.number}
                </span>
                <h2 className="font-serif text-lg uppercase tracking-wide text-brand-foreground">
                  {step.title}
                </h2>
                <p className="font-sans text-xs text-brand-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Delivery Method Comparison */}
        <div className="flex flex-col gap-6 pt-4 border-t border-brand-border/50">
          <p className="text-[11px] font-sans uppercase tracking-[0.24em] text-brand-muted">
            DELIVERY OPTIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="p-7 md:p-8 bg-brand-card border border-brand-border flex flex-col gap-3">
              <p className="text-[10px] font-sans uppercase tracking-[0.22em] text-brand-muted">
                DELIVERY OPTION 01
              </p>
              <h3 className="font-serif text-2xl uppercase tracking-wider">Pick in Person</h3>
              <p className="text-xs md:text-sm font-sans text-brand-muted leading-relaxed">
                Collect and return directly at our Melbourne studio for <strong>$0.00 AUD</strong>.
                Eligible for <strong>all rental packages: 1, 2, 4, and 8 days</strong>. Studio hours
                are 08:00 AM – 09:00 PM (after-hours returns incur a $20.00 AUD coordination fee).
              </p>
            </div>
            <div className="p-7 md:p-8 bg-brand-card border border-brand-border flex flex-col gap-3">
              <p className="text-[10px] font-sans uppercase tracking-[0.22em] text-brand-muted">
                DELIVERY OPTION 02
              </p>
              <h3 className="font-serif text-2xl uppercase tracking-wider">Transport Post</h3>
              <p className="text-xs md:text-sm font-sans text-brand-muted leading-relaxed">
                Dispatched Australia-wide via Australia Post Express with a prepaid return satchel
                (standard fee <strong>$16.95 AUD</strong>). Eligible exclusively for{" "}
                <strong>4-day and 8-day rental packages</strong> to accommodate transit times.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Standard Size Chart */}
        <div className="pt-4 border-t border-brand-border/50">
          <div className="bg-brand-card border border-brand-border p-7 md:p-10">
            <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-widest mb-2.5">
              Standard Ao Dai Size Chart (cm)
            </h2>
            <p className="text-xs md:text-sm font-sans text-brand-muted mb-7">
              Each individual product page also displays exact garment measurements and model height.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm font-sans">
                <thead>
                  <tr className="border-b border-brand-foreground uppercase tracking-widest text-brand-muted text-[11px]">
                    <th className="py-3.5 pr-6">Size</th>
                    <th className="py-3.5 pr-6">Bust</th>
                    <th className="py-3.5 pr-6">Waist</th>
                    <th className="py-3.5 pr-6">Hip</th>
                    <th className="py-3.5">Garment Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {STANDARD_SIZES.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3.5 pr-6 font-mono font-semibold text-brand-foreground">
                        {row.label}
                      </td>
                      <td className="py-3.5 pr-6 text-brand-muted">{row.bust}</td>
                      <td className="py-3.5 pr-6 text-brand-muted">{row.waist}</td>
                      <td className="py-3.5 pr-6 text-brand-muted">{row.hip}</td>
                      <td className="py-3.5 text-brand-muted">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link
            href="/product"
            className="inline-block px-8 py-4 text-xs font-sans uppercase tracking-[0.2em] bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors"
          >
            BROWSE THE ARCHIVE →
          </Link>
        </div>
      </Section>
    </main>
  );
}
