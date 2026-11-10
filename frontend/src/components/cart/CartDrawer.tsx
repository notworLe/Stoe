"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

/**
 * =====================================================================
 * COMPONENT: CartDrawer (Ngăn kéo Giỏ hàng Đặt thuê Áo Dài)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Đây là bảng trượt từ cạnh phải màn hình (Slide-over drawer) chuẩn SSENSE:
 *   + Khi khách bấm vào nút CART trên Header hoặc bấm "Thêm vào giỏ",
 *     drawer này sẽ trượt ra mượt mà.
 *   + Cho phép xem danh sách áo dài đã chọn, thay đổi số lượng, xóa món đồ.
 *   + Hiển thị tổng tiền live cập nhật ngay lập tức.
 *   + Có phím bấm ESC hoặc click ra ngoài để đóng lại.
 * =====================================================================
 */

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotalAud,
    subtotalVnd,
  } = useCart();

  // 1. Khóa cuộn trang khi giỏ hàng đang mở
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

  // 2. Lắng nghe phím ESC để đóng giỏ hàng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const subtotalVndFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(subtotalVnd);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
      {/* Lớp nền mờ (Backdrop) khi click vào sẽ đóng drawer */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 
        Khung chính của Drawer:
        - Nền màu kem ngà `bg-brand-background`
        - Viền trái `border-l border-brand-border`
        - Chiều rộng 100% trên điện thoại và tối đa 440px trên máy tính
      */}
      <div className="relative z-10 w-full max-w-[440px] h-full bg-brand-background border-l border-brand-border flex flex-col justify-between shadow-2xl">
        {/* ================= HEADER CỦA GIỎ HÀNG ================= */}
        <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-brand-foreground" />
            <h2 className="font-serif text-base uppercase tracking-widest text-brand-foreground">
              SHOPPING BAG ({totalItems})
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-brand-muted hover:text-brand-foreground p-1 transition-colors cursor-pointer"
          >
            <span>ĐÓNG</span>
            <X size={16} />
          </button>
        </div>

        {/* ================= DANH SÁCH MÓN ĐỒ ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-brand-border/40">
          {items.length === 0 ? (
            /* TRƯỜNG HỢP GIỎ HÀNG TRỐNG */
            <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-surface/40 flex items-center justify-center text-brand-muted">
                <ShoppingBag size={28} />
              </div>
              <p className="font-serif text-lg text-brand-foreground uppercase tracking-wide">
                Giỏ hàng của bạn đang trống
              </p>
              <p className="font-sans text-xs text-brand-muted max-w-xs leading-relaxed">
                Chưa có thiết kế áo dài nào được thêm. Hãy khám phá bộ sưu tập
                đương đại của LUA Studio để chọn mẫu ưng ý nhất.
              </p>
              <Link
                href="/product"
                onClick={closeCart}
                className="mt-2 px-6 py-3 text-xs font-sans tracking-[0.2em] uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors cursor-pointer"
              >
                KHÁM PHÁ BỘ SƯU TẬP →
              </Link>
            </div>
          ) : (
            /* DANH SÁCH CÁC MÓN ĐỒ ĐÃ CHỌN */
            items.map((item) => {
              const itemVndFormatted = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(item.pricePerItemVnd * item.quantity);

              return (
                <div key={item.id} className="py-4.5 flex gap-4 items-start">
                  {/* Ảnh thu nhỏ tỷ lệ 3:4 */}
                  <div className="relative w-20 aspect-[3/4] shrink-0 bg-brand-surface/30 overflow-hidden">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Thông tin áo dài trong giỏ */}
                  <div className="flex-1 flex flex-col gap-1 text-left">
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="font-serif text-sm uppercase tracking-wide text-brand-foreground hover:underline line-clamp-1"
                    >
                      {item.product.name}
                    </Link>

                    {/* Thuộc tính đã chọn: Mã áo, Size, Thời gian & Lịch hẹn */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-sans text-brand-muted">
                      {item.product.code && (
                        <span className="bg-brand-surface/40 border border-brand-border/60 px-1.5 py-0.5 text-brand-foreground font-mono font-medium">
                          {item.product.code}
                        </span>
                      )}
                      <span className="border border-brand-border/60 px-1.5 py-0.5">
                        Size: {item.size}
                      </span>
                      <span className="border border-brand-border/60 px-1.5 py-0.5">
                        Gói: {item.rentalDays} ngày
                      </span>
                    </div>

                    {/* Chi tiết lịch nhận/trả & phương thức nếu có */}
                    {item.bookingDetails && (
                      <div className="mt-1 p-2 bg-brand-surface/20 border border-brand-border/40 text-[10px] font-sans flex flex-col gap-0.5 text-brand-muted">
                        <div className="flex items-center gap-1 text-brand-foreground">
                          <span>📅</span>
                          <span>{item.bookingDetails.startDate} ➔ {item.bookingDetails.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏰</span>
                          <span>Lấy: {item.bookingDetails.pickupTime} — Trả: {item.bookingDetails.returnTime}</span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span>📦 {item.bookingDetails.deliveryMethod === "pickup" ? "Tại Studio" : "Bưu điện Úc"}</span>
                          {item.bookingDetails.isAfterHoursReturn && (
                            <span className="text-amber-800 font-medium">⚠️ Trả sau 21h</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Giá tiền theo số lượng */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-sans text-sm font-medium text-brand-foreground">
                        ${item.pricePerItemAud * item.quantity} AUD
                      </span>
                      <span className="font-sans text-[11px] text-brand-muted">
                        ({itemVndFormatted})
                      </span>
                    </div>

                    {/* Bộ điều khiển số lượng & Nút Xóa */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center border border-brand-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Giảm số lượng"
                          className="p-1 text-brand-muted hover:text-brand-foreground hover:bg-brand-surface/30 cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 text-xs font-sans text-brand-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Tăng số lượng"
                          className="p-1 text-brand-muted hover:text-brand-foreground hover:bg-brand-surface/30 cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-sans text-brand-muted hover:text-brand-foreground underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= FOOTER / TÍNH TIỀN ================= */}
        {items.length > 0 && (
          <div className="p-6 border-t border-brand-border/60 bg-brand-surface/15 flex flex-col gap-4">
            {/* Tạm tính */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-sans uppercase tracking-widest text-brand-muted">
                TẠM TÍNH:
              </span>
              <div className="text-right">
                <span className="font-sans text-lg font-medium text-brand-foreground">
                  ${subtotalAud} AUD
                </span>
                <span className="block text-[11px] font-sans text-brand-muted">
                  ({subtotalVndFormatted})
                </span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-brand-muted leading-relaxed">
              * Đã bao gồm phí giặt hấp cao cấp. Phí chuyển phát Melbourne và đặt cọc
              sẽ được tính tự động ở bước hoàn tất đặt lịch.
            </p>

            {/* Nút hành động chính */}
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/product"
                onClick={closeCart}
                className="w-full py-3.5 text-center text-xs font-sans tracking-[0.2em] uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors font-medium cursor-pointer"
              >
                TIẾN HÀNH ĐẶT THUÊ →
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="w-full py-2.5 text-center text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-foreground transition-colors cursor-pointer"
              >
                TIẾP TỤC CHỌN MẪU
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
