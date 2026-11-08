import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUA Studio — Cho thuê áo dài editorial",
  description:
    "LUA Studio — boutique cho thuê áo dài editorial. Warm ivory, elegant and feminine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
