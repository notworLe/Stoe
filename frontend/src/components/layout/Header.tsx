"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import MobileMenu from "./MobileMenu";

const CSS_BASE_LINK =
  "relative text-xs tracking-widest transition-all duration-200 focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2";

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("hashchange", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function getScrollSection(): string {
  if (typeof window === "undefined") return "home";
  const aboutEl = document.getElementById("about");
  if (!aboutEl) return "home";
  const rect = aboutEl.getBoundingClientRect();
  return rect.top <= 250 && rect.bottom >= 120 ? "about" : "home";
}

function getServerSection(): string {
  return "home";
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { settings } = useSiteSettings();

  const scrollSection = useSyncExternalStore(
    subscribeScroll,
    getScrollSection,
    getServerSection
  );

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product");
  const isProcess = pathname.startsWith("/size-guide");
  const activeSection = isHome ? scrollSection : "";

  const leftMidLinks = [
    { id: "home", label: "HOME", href: "/", active: isHome && activeSection === "home" },
    { id: "about", label: "ABOUT", href: "/#about", active: isHome && activeSection === "about" },
  ];

  const rightMidLinks = [
    { id: "process", label: "PROCESS", href: "/size-guide", active: isProcess },
    { id: "product", label: "ARCHIVE", href: "/product", active: isProduct },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-background/95 backdrop-blur-xs border-b border-brand-border">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 flex items-center justify-between h-16">
        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-brand-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ring p-1"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Left: Instagram + Currency badge */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${settings.siteName} Instagram`}
            className="text-brand-foreground/80 transition-opacity hover:opacity-100 p-1"
          >
            <FaInstagram size={17} aria-hidden="true" />
          </a>
          <span className="hidden lg:inline-block pl-3 border-l border-brand-border/60 text-[10px] font-sans tracking-[0.22em] uppercase text-brand-muted">
            MELBOURNE · {settings.currency}
          </span>
        </div>

        {/* Mobile Center Logo */}
        <Link
          href="/"
          className="md:hidden inline-flex items-center gap-2 font-serif text-sm uppercase tracking-[0.2em] text-brand-foreground"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.logoUrl}
            alt={settings.siteName}
            className="h-7 w-7 object-contain mix-blend-multiply"
          />
          <span>{settings.siteName}</span>
        </Link>

        {/* Desktop Center Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden absolute left-1/2 -translate-x-1/2 md:flex items-center gap-8"
        >
          {leftMidLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                CSS_BASE_LINK,
                "font-sans uppercase text-[11px] tracking-[0.16em]",
                link.active
                  ? "text-brand-foreground font-medium opacity-100"
                  : "text-brand-foreground/65 hover:text-brand-foreground hover:opacity-100",
                link.active &&
                  "after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Brand Monogram + Wordmark */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-serif text-base uppercase tracking-[0.22em] text-brand-foreground hover:opacity-75 whitespace-nowrap px-2 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-8 w-8 object-contain mix-blend-multiply"
            />
            <span>{settings.siteName}</span>
          </Link>

          {rightMidLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                CSS_BASE_LINK,
                "font-sans uppercase text-[11px] tracking-[0.16em]",
                link.active
                  ? "text-brand-foreground font-medium opacity-100"
                  : "text-brand-foreground/65 hover:text-brand-foreground hover:opacity-100",
                link.active &&
                  "after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Shopping Bag */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping bag (${totalItems} items)`}
            className={cn(
              "hidden md:flex items-center gap-2.5 px-5 py-2.5",
              "bg-brand-sage text-brand-foreground font-serif text-[11px] uppercase tracking-[0.14em]",
              "border border-brand-border/60 hover:bg-brand-sage/80 transition-all duration-200 cursor-pointer shadow-none"
            )}
          >
            <ShoppingBag size={14} className="text-brand-foreground" />
            <span>BAG ({totalItems})</span>
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open shopping bag (${totalItems} items)`}
            className="md:hidden flex items-center gap-1.5 text-xs font-sans tracking-wider text-brand-foreground p-1.5 cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span className="text-[11px] font-medium">({totalItems})</span>
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
      />
    </header>
  );
}
