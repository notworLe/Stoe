"use client";

import Link from "next/link";
import { FaInstagram as Instagram, FaFacebook as Facebook } from "react-icons/fa6";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { cn } from "@/lib/utils";

export default function Footer() {
  const { settings } = useSiteSettings();

  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "The Archive", href: "/product" },
    { label: "About Us", href: "/#about" },
    { label: "Process & Size Guide", href: "/size-guide" },
    { label: "Guest Checkout", href: "/checkout" },
    { label: "Admin Console", href: "/admin" },
  ];

  return (
    <footer className="bg-brand-surface border-t border-brand-border">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Studio Identity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-10 w-10 object-contain mix-blend-multiply"
              />
              <div>
                <p className="font-serif text-brand-foreground text-base uppercase tracking-[0.2em]">
                  {settings.siteName}
                </p>
                <p className="text-[10px] font-sans uppercase tracking-[0.18em] text-brand-muted">
                  @{settings.siteHandle} · {settings.currency}
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-brand-muted leading-relaxed">
              {settings.tagline}
            </p>
            <p className="text-xs font-sans text-brand-muted">
              {settings.studioAddress}
            </p>
            <a
              href={`mailto:${settings.contactEmail}`}
              className={cn(
                "text-xs font-sans text-brand-muted",
                "hover:text-brand-foreground transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
              )}
            >
              {settings.contactEmail}
            </a>
            <p className="text-xs font-sans text-brand-muted">
              {settings.contactPhone} · Hours: {settings.businessOpenTime} – {settings.businessCloseTime}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground mb-4">
              Explore
            </p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-xs font-sans uppercase tracking-widest text-brand-muted",
                      "hover:text-brand-foreground transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social & Policies */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
              Connect
            </p>
            <div className="flex gap-4">
              <SocialLink href={settings.instagramUrl} label="Instagram">
                <Instagram size={18} aria-hidden />
              </SocialLink>
              <SocialLink href={settings.facebookUrl} label="Facebook">
                <Facebook size={18} aria-hidden />
              </SocialLink>
            </div>
            <p className="text-xs font-sans text-brand-muted leading-relaxed pt-2">
              All rental rates are displayed in Australian Dollars ({settings.currency}).
              Pick in Person available for 1, 2, 4 &amp; 8 days. Transport Post available for 4 &amp; 8 days.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-brand-muted">
          <p>© 2026 {settings.siteName}. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">
            Melbourne, Victoria · Australia
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "text-brand-muted hover:text-brand-foreground",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
      )}
    >
      {children}
    </a>
  );
}
