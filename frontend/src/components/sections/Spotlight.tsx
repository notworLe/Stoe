"use client";

import Image from "next/image";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Spotlight() {
  const { settings } = useSiteSettings();

  return (
    <section className="py-8 md:py-16">
      {/* Brand Monogram Seal Divider */}
      <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 mb-14 md:mb-20 flex items-center justify-center">
        <div className="w-full border-t border-brand-border/60" aria-hidden="true" />
        <div className="absolute bg-brand-background px-4">
          <div className="w-12 h-12 border border-brand-border flex items-center justify-center p-1.5 bg-brand-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl}
              alt={`${settings.siteName} monogram`}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        </div>
      </div>

      {/* Centered Spotlight Image & Mission Quote */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 text-center flex flex-col items-center">
        <div className="relative w-[220px] sm:w-[260px] md:w-[300px] aspect-[4/5] overflow-hidden bg-brand-surface">
          <Image
            src={settings.spotlightImageUrl || "/images/next-footer.jpg"}
            alt={`${settings.siteName} silk archive spotlight`}
            fill
            sizes="(max-width: 768px) 260px, 300px"
            className="object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>

        <p className="font-serif italic text-brand-muted text-xs md:text-sm lg:text-[15px] max-w-[640px] mx-auto mt-8 md:mt-10 leading-relaxed tracking-wide">
          {settings.spotlightQuote}
        </p>
      </div>
    </section>
  );
}
