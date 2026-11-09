import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CSS_BASE_LINK = "text-xs tracking-widest text-brand-foreground transition-opacity duration-200 hover:opacity-60 " +
  "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2";


/**
 * Header — sticky top bar.
 * Layout: 3 nav links trái | logo centered | 3 nav links phải | cart icon.
 * Mobile: hamburger trái | logo centered | cart icon phải.
 *
 * Nav order từ constants.ts (source of truth).
 */
export default function Header() {
  const leftLinks = NAV_LINKS.slice(0, 1) // Insta
  const midLinks = NAV_LINKS.slice(1, 6); // HOME ABOUT LỤA STUDIO PROCESS PORTFOLIO
  const rightLinks = NAV_LINKS.slice(6);

  return (
    <header className="sticky z-50 w-full bg-brand-background border-b border-brand-border">
      <div className="mx-auto max-w-[1280px] px-2   flex items-center justify-between h-16">
        {/* Left link */}
        {
          leftLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-label="Instagram"
              className="hidden text-brand-foreground transition-opacity hover:opacity-60 md:block"
            >
              <FaInstagram size={18} aria-hidden="true" />
            </a>
          ))
        }


        {/* Mid links */}
        <nav className="hidden absolute left-1/2 -translate-x-1/2 md:flex items-center gap-8">
          {
            midLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  CSS_BASE_LINK,
                  link.id === "logo"
                    ? "font-serif text-base uppercase tracking-[0.2em] hover:opacity-70 whitespace-nowrap"
                    : "font-sans"
                )}
              >
                {link.label}
              </Link>
            ))
          }
        </nav>


        {/* Right links */}
        {
          rightLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="hidden bg-brand-sage px-6 py-3 font-serif text-[11px] uppercase tracking-[0.12em] text-brand-foreground transition-opacity hover:opacity-80 md:block"
            >
              {link.label}
            </Link>
          ))
        }


        {/* Logo — centered */}
        {/* <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-brand-foreground text-sm uppercase tracking-[0.2em] hover:opacity-70 transition-opacity duration-200"
          >
            LUA Studio
          </Link> */}


        {/* Desktop: right nav links + cart */}
        {/* <div className="hidden md:flex items-center gap-8">
            <nav aria-label="Navigation chính — bên phải" className="flex items-center gap-8">
              {rightLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <CartButton />
          </div> */}

        {/* Mobile: cart icon */}
        <CartButton className="md:hidden" />
      </div>
    </header >
  );
}

// function NavLink({ href, children, className }: { href: string; children: React.ReactNode, className?: string }) {
//   return (
//     <Link
//       href={href}
//       className={cn(
//         "font-sans text-xs tracking-widest text-brand-foreground",
//         "transition-opacity duration-200 hover:opacity-60",
//         "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2",
//         className
//       )}
//     >
//       {children}
//     </Link>
//   );
// }

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
