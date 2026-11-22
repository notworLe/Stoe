"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  activeSection,
}: MobileMenuProps) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { settings } = useSiteSettings();
  const isMounted = useIsMounted();

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  const navItems = [
    { id: "home", label: "HOME", href: "/", isExternal: false },
    { id: "product", label: "THE ARCHIVE", href: "/product", isExternal: false },
    { id: "about", label: "ABOUT", href: "/#about", isExternal: false },
    { id: "process", label: "PROCESS & SIZE GUIDE", href: "/size-guide", isExternal: false },
    { id: "checkout", label: "CHECKOUT", href: "/checkout", isExternal: false },
    { id: "instagram", label: "INSTAGRAM", href: settings.instagramUrl, isExternal: true },
  ];

  const handleOpenCartFromMenu = () => {
    onClose();
    openCart();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className={cn(
        "fixed inset-0 z-[100] w-screen h-[100dvh]",
        "bg-brand-background text-brand-foreground",
        "flex flex-col justify-between overflow-y-auto px-6 py-6"
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-6">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex items-center gap-2 font-serif text-sm uppercase tracking-[0.2em] text-brand-foreground hover:opacity-70 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-7 w-7 object-contain mix-blend-multiply"
            />
            <span>{settings.siteName}</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="text-xs uppercase tracking-[0.18em] font-sans text-brand-foreground hover:opacity-60 transition-opacity p-2 cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        <nav aria-label="Primary mobile links" className="flex flex-col divide-y divide-brand-border/30">
          {navItems.map((item) => {
            const isInsta = item.id === "instagram";
            const isActive =
              (item.id === "home" && pathname === "/" && activeSection === "home") ||
              (item.id === "about" && pathname === "/" && activeSection === "about") ||
              (item.id === "product" && pathname.startsWith("/product")) ||
              (item.id === "process" && pathname.startsWith("/size-guide"));

            if (item.isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 text-xs font-sans tracking-[0.18em] uppercase text-brand-foreground hover:opacity-60 transition-opacity"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    {isInsta && <FaInstagram size={15} aria-hidden="true" />}
                    {item.label}
                  </span>
                  <ChevronRight size={15} className="text-brand-muted" />
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between py-4 text-xs font-sans tracking-[0.18em] uppercase transition-opacity",
                  isActive
                    ? "text-brand-foreground font-semibold pl-2 border-l-2 border-brand-foreground"
                    : "text-brand-foreground/80 hover:text-brand-foreground"
                )}
              >
                <span>{item.label}</span>
                <ChevronRight size={15} className="text-brand-muted" />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-8 pb-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleOpenCartFromMenu}
          className={cn(
            "w-full py-3.5 px-6 flex items-center justify-center gap-2.5",
            "bg-brand-sage text-brand-foreground font-serif text-xs uppercase tracking-[0.16em] font-medium",
            "border border-brand-border/60 hover:opacity-85 transition-opacity cursor-pointer shadow-none"
          )}
        >
          <ShoppingBag size={15} />
          <span>SHOPPING BAG ({totalItems})</span>
        </button>

        <p className="text-[10px] font-sans tracking-widest uppercase text-brand-muted text-center pt-2">
          {settings.siteName} · Melbourne, Australia ({settings.currency})
        </p>
      </div>
    </div>,
    document.body
  );
}
