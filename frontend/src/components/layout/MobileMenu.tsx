"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
      className="fixed inset-0 z-[100] bg-brand-background flex flex-col overflow-y-auto px-6 py-6 transition-all duration-300 md:hidden"
    >
      {/* Top Bar: CLOSE button */}
      <div className="flex justify-end items-center h-10 mb-8">
        <button
          onClick={onClose}
          aria-label="Đóng menu"
          className="text-xs uppercase tracking-[0.18em] font-sans text-brand-foreground hover:opacity-60 transition-opacity duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2 p-1"
        >
          CLOSE
        </button>
      </div>

      {/* Group 1: Collections & Primary Categories (with chevron) */}
      <div className="flex flex-col space-y-1">
        <MenuLinkItem href="/shop?category=menswear" label="MENSWEAR" hasChevron onClick={onClose} isPrimary />
        <MenuLinkItem href="/shop?category=womenswear" label="WOMENSWEAR" hasChevron onClick={onClose} isPrimary />
        <MenuLinkItem href="/shop" label="EVERYTHING ELSE" hasChevron onClick={onClose} isPrimary />
      </div>

      {/* Subtle Group Spacing */}
      <div className="my-5" />

      {/* Group 2: User Account & Bag */}
      <div className="flex flex-col space-y-3.5">
        <MenuLinkItem href="/shop" label="Bag (0)" onClick={onClose} />
        <MenuLinkItem href="/shop" label="Wishlist" onClick={onClose} />
        <MenuLinkItem href="/contact" label="Account - Login" onClick={onClose} />
      </div>

      {/* Subtle Group Spacing */}
      <div className="my-5" />

      {/* Group 3: Preferences / Locale (with chevron) */}
      <div className="flex flex-col space-y-3.5">
        <MenuLinkItem href="/about" label="Language" hasChevron onClick={onClose} />
        <MenuLinkItem href="/contact" label="Australia / AUD" hasChevron onClick={onClose} />
      </div>

      {/* Subtle Group Spacing */}
      <div className="my-5" />

      {/* Group 4: Customer Care & Info */}
      <div className="flex flex-col space-y-3.5">
        <MenuLinkItem href="/size-guide" label="Customer Care" hasChevron onClick={onClose} />
        <MenuLinkItem href="https://www.instagram.com/luastudio.melb" label="Live Assistant" isExternal onClick={onClose} />
        <MenuLinkItem href="/contact" label="Locations" hasChevron onClick={onClose} />
      </div>

      {/* Bottom spacer for comfortable scrolling */}
      <div className="mt-auto pt-8 pb-4">
        <p className="text-[11px] font-sans tracking-widest uppercase text-brand-muted/70">
          LUA STUDIO — Melbourne, Australia
        </p>
      </div>
    </div>
  );
}

function MenuLinkItem({
  href,
  label,
  hasChevron,
  isPrimary,
  isExternal,
  onClick,
}: {
  href: string;
  label: string;
  hasChevron?: boolean;
  isPrimary?: boolean;
  isExternal?: boolean;
  onClick: () => void;
}) {
  const commonClasses = cn(
    "flex items-center justify-between py-2 text-brand-foreground hover:opacity-60 transition-opacity duration-200 cursor-pointer font-sans",
    isPrimary
      ? "text-xs uppercase tracking-[0.18em] font-medium"
      : "text-xs tracking-wider font-light"
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={commonClasses}
      >
        <span>{label}</span>
        {hasChevron && <ChevronRight size={14} className="text-brand-foreground shrink-0" aria-hidden="true" />}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={commonClasses}>
      <span>{label}</span>
      {hasChevron && <ChevronRight size={14} className="text-brand-foreground shrink-0" aria-hidden="true" />}
    </Link>
  );
}
