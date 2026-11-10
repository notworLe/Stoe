"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * ==============================================================================
 * COMPONENT: MobileMenu (Menu điều hướng trên điện thoại di động)
 * ==============================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Toàn màn hình (Fullscreen drawer) chuẩn SSENSE.
 * - Sử dụng `createPortal(..., document.body)` để gắn menu trực tiếp vào thẻ body,
 *   tránh bị ảnh hưởng bởi backdrop-filter blur của Header khiến menu bị co nhỏ trên đầu trang.
 * - Phủ kín 100% màn hình thiết bị di động (w-screen h-[100dvh]).
 * - Hỗ trợ nhận diện section (#about, home, product) để highlight đúng mục.
 * ==============================================================================
 */

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
}

const MOBILE_NAV_ITEMS = [
  {
    id: "home",
    label: "HOME",
    href: "/",
    isExternal: false,
    description: "Trang chủ LỤA Studio",
  },
  {
    id: "product",
    label: "COLLECTION / PRODUCT",
    href: "/product",
    isExternal: false,
    description: "Toàn bộ bộ sưu tập áo dài",
  },
  {
    id: "about",
    label: "ABOUT",
    href: "/#about",
    isExternal: false,
    description: "Giới thiệu câu chuyện studio",
  },
  {
    id: "process",
    label: "PROCESS",
    href: "/size-guide",
    isExternal: false,
    description: "Quy trình thuê & bảng size",
  },
  {
    id: "instagram",
    label: "INSTAGRAM",
    href: "https://www.instagram.com/luastudio.melb",
    isExternal: true,
    description: "Kênh Instagram chính thức",
  },
] as const;

export default function MobileMenu({
  isOpen,
  onClose,
  activeSection,
}: MobileMenuProps) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const isMounted = useIsMounted();

  // Khóa cuộn trang khi menu mở
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

  // Bấm Escape để đóng menu
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

  // Xử lý khi bấm nút giỏ hàng trong mobile menu: đóng menu và mở giỏ hàng
  const handleOpenCartFromMenu = () => {
    onClose();
    openCart();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
      className={cn(
        "fixed inset-0 z-[100] w-screen h-[100dvh]",
        "bg-brand-background text-brand-foreground",
        "flex flex-col justify-between overflow-y-auto px-6 py-6 animate-in fade-in duration-200"
      )}
    >
      {/* ───────────────────────────────────────────────────────────────
          PHẦN 1: THANH ĐẦU MENU (Top Bar)
      ───────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-6">
          <Link
            href="/"
            onClick={onClose}
            className="font-serif text-sm uppercase tracking-[0.2em] text-brand-foreground hover:opacity-70 transition-opacity"
          >
            LỤA STUDIO
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu điều hướng"
            className="text-xs uppercase tracking-[0.18em] font-sans text-brand-foreground hover:opacity-60 transition-opacity p-2 cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            PHẦN 2: CÁC ĐƯỜNG DẪN CHÍNH
        ─────────────────────────────────────────────────────────────── */}
        <nav aria-label="Menu liên kết chính" className="flex flex-col divide-y divide-brand-border/30">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isInsta = item.id === "instagram";
            const isActive =
              (item.id === "home" && pathname === "/" && activeSection === "home") ||
              (item.id === "about" && pathname === "/" && activeSection === "about") ||
              (item.id === "product" && pathname.startsWith("/product"));

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

      {/* ───────────────────────────────────────────────────────────────
          PHẦN 3: NÚT GIỎ HÀNG NỔI BẬT (SHOPPING BAG)
      ───────────────────────────────────────────────────────────────── */}
      <div className="pt-8 pb-4 flex flex-col gap-3">
        {/* Nút bấm mở Giỏ hàng trực tiếp từ mobile menu */}
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
          Editorial Áo Dài Rental — Melbourne, VIC
        </p>
      </div>
    </div>,
    document.body
  );
}
