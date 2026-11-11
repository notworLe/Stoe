import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "LỤA STUDIO — Áo dài rental Melbourne",
  description:
    "LỤA STUDIO is an editorial boutique for renting traditional Vietnamese áo dài in Melbourne, Australia. Warm ivory, elegant and feminine.",
};

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-background/95 backdrop-blur-xs border-b border-brand-border">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 flex items-center justify-between h-16">
        {/* Mobile: Hamburger placeholder */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="p-1 text-brand-foreground/80">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
          </div>
        </div>

        {/* Desktop: Instagram placeholder */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-5 h-5" />
        </div>

        {/* Center: Logo */}
        <span className="font-serif text-sm md:text-base uppercase tracking-[0.22em] text-brand-foreground">
          LỤA STUDIO
        </span>

        {/* Right side: Shopping bag button placeholder */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-brand-sage text-brand-foreground font-serif text-[11px] uppercase tracking-[0.14em] border border-brand-border/60">
            <span>BAG (0)</span>
          </div>
          <div className="md:hidden flex items-center gap-1.5 p-1.5 text-xs font-sans tracking-wider text-brand-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            <span className="text-[11px] font-medium">(0)</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-brand-background text-brand-foreground font-sans">
        <CartProvider>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
