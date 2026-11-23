import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Extra classes applied directly to the inner max-width container wrapping children */
  containerClassName?: string;
  as?: "section" | "div" | "article" | "aside";
  /** Omit horizontal padding and max-width constraint (e.g., full-bleed hero) */
  fullBleed?: boolean;
}

/**
 * Standardised editorial section wrapper.
 * Put layout spacing for children (e.g. flex, gap-*, space-y-*, max-w-*)
 * on `containerClassName` so it applies directly to the container holding `{children}`.
 */
export default function Section({
  children,
  className,
  containerClassName,
  as: Tag = "section",
  fullBleed = false,
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "w-full",
        !fullBleed && "py-24",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          !fullBleed && "max-w-[1280px] px-6 md:px-10 lg:px-16",
          containerClassName
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
