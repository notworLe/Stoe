import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  // Dark fill — "Add to booking", "Get in touch"
  primary:
    "bg-brand-foreground text-brand-on-foreground hover:opacity-90",
  // Surface fill — secondary actions
  secondary:
    "bg-brand-surface text-brand-foreground hover:opacity-90",
  // No fill — text-only links styled as button
  ghost:
    "bg-transparent text-brand-foreground hover:opacity-70",
};

/**
 * Button atom — dùng token màu, không dùng hex.
 *
 * @example
 * <Button variant="primary">Xem bộ sưu tập</Button>
 * <Button variant="secondary" disabled>Chọn size trước</Button>
 */
export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        // Base — square corners, uppercase, tracking, transition
        "inline-flex items-center justify-center",
        "px-8 py-3.5",
        "text-xs font-sans uppercase tracking-[0.12em]",
        "rounded-none",                         // square corners — MASTER.md rule
        "cursor-pointer transition-opacity duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
