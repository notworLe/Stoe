import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  unavailable?: boolean;
}

/**
 * Chip atom — dùng cho size selector, rental duration, delivery method.
 *
 * States:
 * - Default: border only
 * - Selected (aria-pressed="true"): dark fill
 * - Unavailable/disabled: strikethrough + muted — KHÔNG dùng màu đơn thuần (accessibility)
 *
 * @example
 * <Chip selected={size === "M"} onClick={() => setSize("M")}>M</Chip>
 * <Chip unavailable>L</Chip>
 */
export default function Chip({
  selected = false,
  unavailable = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      {...props}
      aria-pressed={selected}
      disabled={unavailable || props.disabled}
      className={cn(
        "inline-flex items-center justify-center",
        "px-5 py-2.5 min-w-[48px]",
        "text-sm font-sans",
        "border border-brand-input-border",
        "rounded-none",
        "transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2",
        // Selected state
        selected && "bg-brand-foreground text-brand-on-foreground border-brand-foreground",
        // Unavailable — strikethrough + muted text, NOT color-only
        (unavailable || props.disabled) &&
          "text-brand-muted line-through cursor-not-allowed opacity-60",
        // Default
        !selected && !unavailable && !props.disabled &&
          "bg-transparent text-brand-foreground cursor-pointer hover:border-brand-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}
