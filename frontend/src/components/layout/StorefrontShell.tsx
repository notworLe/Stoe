"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "@/components/cart/CartDrawer";

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 w-full bg-brand-background/95 backdrop-blur-xs border-b border-brand-border">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 flex items-center justify-between h-16">
        <div className="w-8 md:hidden" />
        <div className="hidden md:block w-8" />
        <span className="font-serif text-sm md:text-base uppercase tracking-[0.22em] text-brand-foreground">
          MAISON DE LUA
        </span>
        <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-brand-sage text-brand-foreground font-serif text-[11px] uppercase tracking-[0.14em] border border-brand-border/60">
          <span>BAG (0)</span>
        </div>
        <div className="md:hidden text-xs font-sans text-brand-foreground">(0)</div>
      </div>
    </header>
  );
}

export default function StorefrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
      <CartDrawer />
    </>
  );
}
