"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function MetadataBar() {
  const { settings } = useSiteSettings();
  const items = settings.metadataItems;

  return (
    <section className="bg-brand-surface border-t border-brand-border/60">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-brand-border/60 text-center">
          {items.map((item) => (
            <div
              key={item.label}
              className="py-4 sm:py-0 px-2 sm:px-4 md:px-8 flex flex-col items-center justify-center"
            >
              <h3 className="font-serif text-[10px] sm:text-[11px] md:text-xs tracking-[0.16em] sm:tracking-[0.22em] uppercase text-brand-foreground font-medium">
                {item.label}
              </h3>
              <p className="font-serif italic text-xs md:text-sm text-brand-muted mt-2">
                {item.value}
              </p>
              {item.subtitle && (
                <p className="font-serif italic text-[11px] md:text-xs text-brand-muted/80 mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
