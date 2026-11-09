"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { cn } from "@/lib/utils";

/**
 * ==============================================================================
 * PROPS (Dữ liệu truyền vào Component)
 * ==============================================================================
 * @param isOpen  - Biến boolean (true/false):
 *                  true  = Menu đang mở và hiển thị trên màn hình.
 *                  false = Menu đang đóng (ẩn đi, không vẽ ra DOM).
 * @param onClose - Hàm callback được gọi khi người dùng muốn đóng menu
 *                  (Ví dụ: khi bấm nút CLOSE, bấm phím Escape, hoặc click vào một link).
 */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ==============================================================================
 * DANH SÁCH 5 ĐƯỜNG DẪN CHÍNH (Đồng bộ chuẩn theo Navbar của LỤA STUDIO)
 * ==============================================================================
 * Sau này nếu bạn muốn THÊM, SỬA, hoặc ĐỔI LINK:
 * Chỉ cần chỉnh sửa trực tiếp danh sách mảng này!
 * - id:         Định danh duy nhất không trùng lặp.
 * - label:      Chữ hiển thị trên màn hình (viết hoa thanh lịch).
 * - href:       Đường dẫn trang web (nội bộ như /about hoặc link ngoài như instagram.com).
 * - isExternal: true nếu là link mở sang trang web khác (ví dụ Instagram).
 */
const MOBILE_NAV_ITEMS = [
  {
    id: "home",
    label: "HOME",
    href: "/",
    isExternal: false,
    description: "Trang chủ LỤA Studio",
  },
  {
    id: "about",
    label: "ABOUT",
    href: "#about",
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
    id: "portfolio",
    label: "PORTFOLIO",
    href: "/portfolio",
    isExternal: false,
    description: "Bộ sưu tập ảnh mẫu editorial",
  },
  {
    id: "instagram",
    label: "INSTAGRAM",
    href: "https://www.instagram.com/luastudio.melb",
    isExternal: true,
    description: "Kênh Instagram chính thức",
  },
] as const;

/**
 * Nút hành động nổi bật (Action Link) tương ứng nút GET IN TOUCH bên phải Navbar
 */
const GET_IN_TOUCH_ACTION = {
  label: "GET IN TOUCH",
  href: "/contact",
  description: "Liên hệ tư vấn & đặt lịch hẹn thuê áo dài",
};

/**
 * ==============================================================================
 * COMPONENT CHÍNH: MobileMenu
 * ==============================================================================
 */
export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  /**
   * TÍNH NĂNG 1: Khóa thanh cuộn trang web khi menu mở
   * - Khi menu mở (isOpen = true): đặt overflow = 'hidden' trên thẻ <body>
   *   giúp người dùng không bị cuộn trang web bên dưới khi đang xem menu.
   * - Khi menu đóng (isOpen = false): trả lại thanh cuộn bình thường.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Dọn dẹp (cleanup) khi component unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /**
   * TÍNH NĂNG 2: Bấm phím Escape trên bàn phím để đóng menu nhanh
   * Giúp tăng trải nghiệm người dùng (UX) và chuẩn Accessibility.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Nếu menu đang đóng thì không vẽ gì ra giao diện (trả về null)
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng di động"
      className={cn(
        // Vị trí cố định (fixed) phủ toàn màn hình thiết bị di động
        "fixed inset-0 z-[100]",
        // Màu nền ivory ấm chuẩn nhận diện thương hiệu LỤA Studio
        "bg-brand-background text-brand-foreground",
        // Bố cục flex cột, cho phép cuộn nếu màn hình quá ngắn
        "flex flex-col justify-between overflow-y-auto px-6 py-6 md:hidden"
      )}
    >
      {/* ───────────────────────────────────────────────────────────────
          PHẦN 1: THANH ĐẦU MENU (Top Bar)
          Bao gồm Logo LỤA Studio bên trái và nút CLOSE bên phải
      ───────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-8">
          {/* Logo nhận diện */}
          <Link
            href="/"
            onClick={onClose}
            className="font-serif text-sm uppercase tracking-[0.2em] text-brand-foreground hover:opacity-70 transition-opacity"
          >
            LỤA STUDIO
          </Link>

          {/* Nút bấm ĐÓNG (CLOSE) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu điều hướng"
            className="text-xs uppercase tracking-[0.18em] font-sans text-brand-foreground hover:opacity-60 transition-opacity p-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ring"
          >
            CLOSE
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            PHẦN 2: 5 ĐƯỜNG DẪN CHÍNH CỦA NAVBAR (HOME, ABOUT, PROCESS, PORTFOLIO, INSTAGRAM)
            Mỗi đường dẫn có icon chevron '>' giống thiết kế mẫu
        ─────────────────────────────────────────────────────────────── */}
        <nav aria-label="Menu liên kết chính" className="flex flex-col divide-y divide-brand-border/30">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isInsta = item.id === "instagram";

            // Nếu là link ngoài (Instagram) thì dùng thẻ <a> thông thường
            if (item.isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between py-4 text-xs font-sans tracking-[0.18em] uppercase text-brand-foreground hover:opacity-60 transition-opacity group"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    {isInsta && <FaInstagram size={15} aria-hidden="true" />}
                    {item.label}
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-brand-muted group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </a>
              );
            }

            // Nếu là link nội bộ (Home, About, Process, Portfolio) thì dùng thẻ <Link> của Next.js
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between py-4 text-xs font-sans tracking-[0.18em] uppercase text-brand-foreground hover:opacity-60 transition-opacity group"
              >
                <span className="font-medium">{item.label}</span>
                <ChevronRight
                  size={15}
                  className="text-brand-muted group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ───────────────────────────────────────────────────────────────
          PHẦN 3: NÚT HÀNH ĐỘNG NỔI BẬT (GET IN TOUCH / GET CONNECT)
          Được thiết kế nổi bật như một nút bấm lớn phía dưới cùng của menu
      ───────────────────────────────────────────────────────────────── */}
      <div className="pt-8 pb-4 flex flex-col gap-4">
        {/* Nút GET IN TOUCH nổi bật màu sage đặc trưng */}
        <Link
          href={GET_IN_TOUCH_ACTION.href}
          onClick={onClose}
          className={cn(
            "w-full text-center py-3.5 px-6",
            "bg-brand-sage text-brand-foreground font-serif text-xs uppercase tracking-[0.16em] font-medium",
            "border border-brand-border/60 hover:opacity-85 transition-opacity duration-200",
            "focus-visible:outline-2 focus-visible:outline-brand-ring"
          )}
        >
          {GET_IN_TOUCH_ACTION.label}
        </Link>

        {/* Thông tin chân trang nhỏ gọn */}
        <p className="text-[11px] font-sans tracking-widest uppercase text-brand-muted text-center pt-2">
          Editorial Áo Dài Rental — Melbourne, VIC
        </p>
      </div>
    </div>
  );
}
