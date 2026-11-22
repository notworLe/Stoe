import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Maison de Lua — Editorial Ao Dai Rental Melbourne",
  description:
    "Maison de Lua (maisondelua) is an editorial Vietnamese Ao Dai rental boutique in Melbourne, Australia. Pick in Person or Australia Post Express in AUD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-brand-background text-brand-foreground font-sans">
        <SiteSettingsProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <StorefrontShell>{children}</StorefrontShell>
            </Suspense>
          </CartProvider>
        </SiteSettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
