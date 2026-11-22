"use client";

import Image from "next/image";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function About() {
  const { settings } = useSiteSettings();

  return (
    <section
      id="about"
      className="px-6 md:px-12 lg:px-20 py-16 md:py-24 max-w-[1280px] mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 lg:gap-20 items-center">
        <div className="md:col-span-7 flex flex-col justify-center">
          <p className="text-[11px] font-sans uppercase tracking-[0.24em] text-brand-muted mb-3">
            {settings.siteName} · MELBOURNE
          </p>
          <h2 className="font-serif text-brand-foreground text-3xl md:text-4xl lg:text-5xl font-normal mb-8 md:mb-10 tracking-[0.03em]">
            {settings.aboutTitle}
          </h2>

          <div className="space-y-6 text-brand-muted font-sans font-light text-[13px] md:text-sm lg:text-[15px] leading-relaxed max-w-[580px]">
            {settings.aboutParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[340px] md:max-w-[400px] aspect-[3/4] overflow-hidden bg-brand-surface">
            <Image
              src={settings.aboutImageUrl || "/images/about.jpg"}
              alt={`${settings.siteName} studio editorial portrait`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
