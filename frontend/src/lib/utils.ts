import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — resolves conflicts (e.g. bg-brand-background + bg-brand-surface → last wins).
 * Use this everywhere instead of template literals.
 *
 * @example
 * cn("bg-brand-surface", isActive && "bg-brand-foreground text-brand-on-foreground")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
