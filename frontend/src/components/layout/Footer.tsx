import Link from "next/link";
import { FaInstagram as Instagram, FaFacebook as Facebook } from "react-icons/fa6";
import { NAV_LINKS, STUDIO_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Footer — nền brand.surface, studio info + social links + nav.
 * Theo MASTER.md: "Minimal footer: studio information and social links, on --color-surface"
 */
export default function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Studio info */}
          <div className="flex flex-col gap-3">
            <p className="font-serif text-brand-foreground text-sm uppercase tracking-[0.2em]">
              {STUDIO_INFO.name}
            </p>
            <p className="text-xs font-sans text-brand-muted leading-relaxed">
              {STUDIO_INFO.tagline}
            </p>
            <p className="text-xs font-sans text-brand-muted">
              {STUDIO_INFO.address}
            </p>
            <a
              href={`mailto:${STUDIO_INFO.email}`}
              className={cn(
                "text-xs font-sans text-brand-muted",
                "hover:text-brand-foreground transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
              )}
            >
              {STUDIO_INFO.email}
            </a>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-xs font-sans uppercase tracking-widest text-brand-muted",
                      "hover:text-brand-foreground transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social links */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
              Follow
            </p>
            <div className="flex gap-4">
              <SocialLink href={STUDIO_INFO.instagram} label="Instagram">
                <Instagram size={18} aria-hidden />
              </SocialLink>
              <SocialLink href={STUDIO_INFO.facebook} label="Facebook">
                <Facebook size={18} aria-hidden />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-brand-border">
          <p className="text-xs font-sans text-brand-muted text-center">
            © 2026 {STUDIO_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "text-brand-muted hover:text-brand-foreground",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
      )}
    >
      {children}
    </a>
  );
}
