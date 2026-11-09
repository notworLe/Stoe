import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input atom — text input theo spec MASTER.md.
 * Transparent background, 1px border brand.inputBorder, square corners.
 *
 * @example
 * <Input label="Email" type="email" placeholder="hello@example.com" />
 * <Input label="Size" error="Vui lòng chọn size" />
 */
export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-sans uppercase tracking-widest text-brand-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          "w-full bg-transparent",
          "px-4 py-3",
          "text-base font-sans text-brand-foreground",
          "border border-brand-input-border rounded-none",
          "placeholder:text-brand-muted",
          "transition-colors duration-200",
          "focus:outline-none focus:border-brand-foreground",
          "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2",
          error && "border-red-600",
          className
        )}
      />
      {error && (
        <p role="alert" className="text-xs text-red-700 font-sans">
          {error}
        </p>
      )}
    </div>
  );
}
