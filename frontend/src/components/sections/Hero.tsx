"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Hero() {
  const { settings } = useSiteSettings();

  return (
    <section
      id="home"
      className="w-full max-w-[1440px] mx-auto h-[calc(100dvh-4rem)] min-h-[480px] md:min-h-[520px] px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 lg:px-14 lg:py-6 flex flex-col"
    >
      <div className="relative w-full h-full overflow-hidden bg-brand-surface">
        <Image
          src={settings.heroImageUrl || "/images/hero.jpg"}
          alt={`${settings.siteName} Melbourne Editorial Ao Dai`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-brand-foreground/25" aria-hidden="true" />

        <div className="absolute inset-0 z-10 p-6 md:p-10 lg:p-12 flex flex-col justify-between pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-brand-on-image text-xs md:text-sm lg:text-base tracking-[0.25em] uppercase font-normal">
              {settings.heroTitle}
            </h1>
            <p className="font-serif text-brand-on-image text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase text-right opacity-90 font-light">
              {settings.heroSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-sans tracking-[0.2em] uppercase bg-brand-background/95 hover:bg-brand-surface text-brand-foreground transition-all duration-300 border border-brand-border/60 hover:border-brand-foreground backdrop-blur-xs cursor-pointer shadow-none"
            >
              <span>EXPLORE THE ARCHIVE</span>
              <span className="text-xs">→</span>
            </Link>

            <p className="font-serif italic text-brand-on-image text-xs md:text-sm lg:text-[15px] leading-relaxed max-w-[360px] md:max-w-[440px] lg:max-w-[500px] text-left sm:text-right opacity-95">
              {settings.heroQuote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
