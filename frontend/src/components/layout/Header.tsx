"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import MobileMenu from "./MobileMenu";

/**
 * =====================================================================
 * COMPONENT: Header (Thanh điều hướng chính của LUA STUDIO)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * 1. Track Section (#about & #home):
 *    - Sử dụng `useSyncExternalStore` nhẹ nhàng để nhận diện khi khách cuộn tới khu vực `#about`.
 *    - Đổi dấu chấm vi điểm dưới chữ từ HOME sang ABOUT mượt mà, không dùng useEffect cascading renders.
 * 2. Developer Badge:
 *    - Dải text tọa độ kỹ thuật chỉ xuất hiện trong môi trường Development (`process.env.NODE_ENV === "development"`).
 *    - Người dùng cuối (Production UI/UX) hoàn toàn không thấy thông tin này, giữ trọn thẩm mỹ cao cấp.
 * 3. Khu vực Giỏ hàng (Cart Area):
 *    - Nút "BAG (X)" kết nối trực tiếp với CartContext để mở CartDrawer.
 * =====================================================================
 */

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

  // Theo dõi vị trí cuộn trang trên Landing Page qua useSyncExternalStore (React 19)
  const scrollSection = useSyncExternalStore(
    subscribeScroll,
    getScrollSection,
    getServerSection
  );

  // Kiểm tra đường dẫn hiện tại
  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product");
  const activeSection = isHome ? scrollSection : "";

  const leftLinks = NAV_LINKS.slice(0, 1); // Instagram
  const midLinks = NAV_LINKS.slice(1, 6);  // HOME, ABOUT, LỤA STUDIO, PROCESS, PRODUCT

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-background/95 backdrop-blur-xs border-b border-brand-border">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 flex items-center justify-between h-16">
        {/* Nút bấm Hamburger mở menu trên Mobile (Bên trái) */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            aria-label="Mở menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-brand-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ring p-1"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>

        {/* 
          ===============================================================
          CỘT TRÁI: Instagram link + Track URL nhẹ nhàng trên Desktop
          ===============================================================
        */}
        <div className="hidden md:flex items-center gap-4">
          {leftLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kênh Instagram LUA Studio"
              className="text-brand-foreground/80 transition-opacity hover:opacity-100 p-1"
            >
              <FaInstagram size={17} aria-hidden="true" />
            </a>
          ))}

          {/* Dải định vị Track URL chỉ xuất hiện trong môi trường DEVELOPMENT — Ẩn với người dùng cuối */}
          {process.env.NODE_ENV === "development" && (
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-brand-border/60 text-[10px] font-sans tracking-[0.25em] uppercase text-brand-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-surface animate-pulse" />
              <span>
                {isHome && (activeSection === "about" ? "DEV: /#ABOUT" : "DEV: / (HOME)")}
                {isProduct && (pathname === "/product" ? "DEV: /PRODUCT" : "DEV: /PRODUCT/[SLUG]")}
                {!isHome && !isProduct && `DEV: ${pathname.toUpperCase()}`}
              </span>
            </div>
          )}
        </div>

        {/* Logo trên thiết bị di động (Căn giữa) */}
        <Link
          href="/"
          className="md:hidden font-serif text-sm uppercase tracking-[0.22em] text-brand-foreground"
        >
          LỤA STUDIO
        </Link>

        {/* 
          ===============================================================
          CỘT GIỮA: Navigation Links kèm định vị trang đang đứng
          ===============================================================
        */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 md:flex items-center gap-8">
          {midLinks.map((link) => {
            const isLogo = link.id === "logo";
            const isLinkActive =
              (link.id === "home" && isHome && activeSection === "home") ||
              (link.id === "about" && isHome && activeSection === "about") ||
              (link.id === "product" && isProduct);

            if (isLogo) {
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className="font-serif text-base uppercase tracking-[0.22em] text-brand-foreground hover:opacity-70 whitespace-nowrap px-2"
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  CSS_BASE_LINK,
                  "font-sans uppercase text-[11px] tracking-[0.16em]",
                  isLinkActive
                    ? "text-brand-foreground font-medium opacity-100"
                    : "text-brand-foreground/65 hover:text-brand-foreground hover:opacity-100",
                  // Dấu chấm nhỏ vi điểm nhẹ nhàng định vị trang hiện tại
                  isLinkActive &&
                    "after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 
          ===============================================================
          CỘT PHẢI: KHU VỰC GIỎ HÀNG (Thay thế GET IN TOUCH cũ)
          ===============================================================
        */}
        <div className="flex items-center gap-3">
          {/* Nút Giỏ Hàng trên Desktop */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Mở giỏ hàng (${totalItems} món)`}
            className={cn(
              "hidden md:flex items-center gap-2.5 px-5 py-2.5",
              "bg-brand-sage text-brand-foreground font-serif text-[11px] uppercase tracking-[0.14em]",
              "border border-brand-border/60 hover:bg-brand-sage/80 transition-all duration-200 cursor-pointer shadow-none"
            )}
          >
            <ShoppingBag size={14} className="text-brand-foreground" />
            <span>BAG ({totalItems})</span>
          </button>

          {/* Nút Giỏ Hàng trên Mobile (Góc phải trên cùng) */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Mở giỏ hàng (${totalItems} món)`}
            className="md:hidden flex items-center gap-1.5 text-xs font-sans tracking-wider text-brand-foreground p-1.5 cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span className="text-[11px] font-medium">({totalItems})</span>
          </button>
        </div>
      </div>

      {/* Drawer menu cho thiết bị di động */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
      />
    </header>
  );
}
