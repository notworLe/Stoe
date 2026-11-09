import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
  /** Nếu true: không thêm padding ngang (dùng cho hero full-bleed) */
  fullBleed?: boolean;
}

/**
 * Section layout wrapper — chuẩn hoá max-width và padding cho mọi section.
 *
 * Max-width: 1280px (desktop), padding ngang tự động scale theo viewport.
 * Padding dọc: py-24 (96px) — generous whitespace theo MASTER.md.
 *
 * @example
 * <Section>
 *   <h2>...</h2>
 * </Section>
 *
 * // Full-bleed (hero image)
 * <Section fullBleed className="py-0">
 *   <img ... />
 * </Section>
 */
export default function Section({
  children,
  className,
  as: Tag = "section",
  fullBleed = false,
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "w-full",
        !fullBleed && "py-24",          // --space-2xl = 96px
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          !fullBleed && "max-w-[1280px] px-6 md:px-10 lg:px-16"
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
