import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Header — sticky top bar.
 * Layout: 3 nav links trái | logo centered | 3 nav links phải | cart icon.
 * Mobile: hamburger trái | logo centered | cart icon phải.
 *
 * Nav order từ constants.ts (source of truth).
 */
export default function Header() {
  const leftLinks = NAV_LINKS.slice(0, 3);   // Home, Shop, How to Rent
  const rightLinks = NAV_LINKS.slice(3);      // Size Guide, FAQs, Contact

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-background border-b border-brand-border">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16">

          {/* Mobile: hamburger */}
          <button
            aria-label="Mở menu"
            className="md:hidden text-brand-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Desktop: left nav links */}
          <nav aria-label="Navigation chính — bên trái" className="hidden md:flex items-center gap-8">
            {leftLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Logo — centered */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-brand-foreground text-sm uppercase tracking-[0.2em] hover:opacity-70 transition-opacity duration-200"
          >
            LUA Studio
          </Link>

          {/* Desktop: right nav links + cart */}
          <div className="hidden md:flex items-center gap-8">
            <nav aria-label="Navigation chính — bên phải" className="flex items-center gap-8">
              {rightLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <CartButton />
          </div>

          {/* Mobile: cart icon */}
          <CartButton className="md:hidden" />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-xs font-sans uppercase tracking-widest",
        "text-brand-foreground hover:opacity-60",
        "transition-opacity duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
      )}
    >
      {children}
    </Link>
  );
}

function CartButton({ className }: { className?: string }) {
  return (
    <button
      aria-label="Giỏ hàng"
      className={cn(
        "text-brand-foreground cursor-pointer",
        "hover:opacity-60 transition-opacity duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2",
        className
      )}
    >
      <ShoppingBag size={20} aria-hidden="true" />
    </button>
  );
}
