"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Store, Truck, Calendar, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { DELIVERY_METHOD_LABELS, formatAud } from "@/lib/constants";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    totalItems,
    subtotalAud,
    deliveryTotalAud,
    afterHoursTotalAud,
    grandTotalAud,
  } = useCart();
  const { settings } = useSiteSettings();

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
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-brand-foreground/30 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[460px] h-full bg-brand-background border-l border-brand-border flex flex-col justify-between">
        {/* Header */}
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
            aria-label="Close shopping bag"
            className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-brand-muted hover:text-brand-foreground p-1 transition-colors cursor-pointer"
          >
            <span>CLOSE</span>
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-brand-border/40">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
              <div className="w-16 h-16 bg-brand-surface/40 border border-brand-border/50 flex items-center justify-center text-brand-muted">
                <ShoppingBag size={26} />
              </div>
              <p className="font-serif text-lg text-brand-foreground uppercase tracking-wide">
                Your Bag Is Empty
              </p>
              <p className="font-sans text-xs text-brand-muted max-w-xs leading-relaxed">
                Explore the {settings.siteName} archive to select your Ao Dai silhouette,
                delivery method, and rental window.
              </p>
              <Link
                href="/product"
                onClick={closeCart}
                className="mt-2 px-6 py-3 text-xs font-sans tracking-[0.2em] uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors cursor-pointer"
              >
                EXPLORE THE ARCHIVE →
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const isPost = item.bookingDetails.deliveryMethod === "transport_post";
              return (
                <div key={item.id} className="py-5 flex gap-4 items-start">
                  <div className="relative w-20 aspect-[3/4] shrink-0 bg-brand-surface/30 overflow-hidden border border-brand-border/40">
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

                  <div className="flex-1 flex flex-col gap-1.5 text-left">
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="font-serif text-sm uppercase tracking-wide text-brand-foreground hover:underline line-clamp-1"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex flex-wrap gap-1.5 text-[11px] font-sans text-brand-muted">
                      <span className="bg-brand-surface/40 border border-brand-border/60 px-1.5 py-0.5 text-brand-foreground font-mono font-medium">
                        {item.product.code}
                      </span>
                      <span className="border border-brand-border/60 px-1.5 py-0.5">
                        Size {item.size}
                      </span>
                      <span className="border border-brand-border/60 px-1.5 py-0.5">
                        {item.rentalDays} {item.rentalDays === 1 ? "Day" : "Days"}
                      </span>
                    </div>

                    <div className="mt-1 p-2.5 bg-brand-surface/20 border border-brand-border/40 text-[11px] font-sans flex flex-col gap-1 text-brand-muted">
                      <div className="flex items-center gap-1.5 text-brand-foreground">
                        {isPost ? <Truck size={12} /> : <Store size={12} />}
                        <span>{DELIVERY_METHOD_LABELS[item.bookingDetails.deliveryMethod]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>
                          {item.bookingDetails.startDate} → {item.bookingDetails.endDate}
                        </span>
                      </div>
                      {!isPost && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          <span>
                            Pickup {item.bookingDetails.pickupTime} · Return{" "}
                            {item.bookingDetails.returnTime}
                          </span>
                        </div>
                      )}
                      {item.bookingDetails.isAfterHoursReturn && (
                        <span className="text-brand-accent font-medium text-[10px] uppercase tracking-wider">
                          After-hours return (+{formatAud(item.afterHoursFeeAud)})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-sans text-sm font-medium text-brand-foreground">
                        {formatAud(item.pricePerItemAud * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-sans text-brand-muted hover:text-brand-foreground underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && (
          <div className="p-6 border-t border-brand-border/60 bg-brand-surface/20 flex flex-col gap-3">
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-brand-muted">
                <span>Rental Subtotal</span>
                <span className="text-brand-foreground">{formatAud(subtotalAud)}</span>
              </div>
              {deliveryTotalAud > 0 && (
                <div className="flex justify-between text-brand-muted">
                  <span>Transport Post</span>
                  <span className="text-brand-foreground">{formatAud(deliveryTotalAud)}</span>
                </div>
              )}
              {afterHoursTotalAud > 0 && (
                <div className="flex justify-between text-brand-muted">
                  <span>After-Hours Return</span>
                  <span className="text-brand-foreground">{formatAud(afterHoursTotalAud)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-brand-border/50 flex items-baseline justify-between">
                <span className="uppercase tracking-widest text-brand-muted">Total</span>
                <span className="font-serif text-xl text-brand-foreground">
                  {formatAud(grandTotalAud)}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-brand-muted leading-relaxed">
              Includes complimentary eco-steaming &amp; sanitization. Guest checkout — no account
              required. Your AUD invoice will be emailed automatically.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 text-center text-xs font-sans tracking-[0.2em] uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors font-medium cursor-pointer"
              >
                PROCEED TO CHECKOUT →
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="w-full py-2 text-center text-xs font-sans tracking-widest uppercase text-brand-muted hover:text-brand-foreground transition-colors cursor-pointer"
              >
                CONTINUE BROWSING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
