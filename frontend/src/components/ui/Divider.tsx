import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  /** Nếu true: dùng màu border đậm hơn (input-border) */
  strong?: boolean;
}

/**
 * Divider — đường kẻ ngang 1px theo MASTER.md "almost flat, thin 1px borders".
 *
 * @example
 * <Divider />
 * <Divider strong className="my-8" />
 */
export default function Divider({ className, strong = false }: DividerProps) {
  return (
    <hr
      aria-hidden="true"
      className={cn(
        "border-0 border-t",
        strong ? "border-brand-input-border" : "border-brand-border",
        className
      )}
    />
  );
}
