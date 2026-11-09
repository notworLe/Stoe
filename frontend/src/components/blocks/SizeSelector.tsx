"use client";

import { type Size } from "@/types";
import Chip from "@/components/ui/Chip";

interface SizeSelectorProps {
  sizes: Size[];
  selected: string | null;
  onChange: (size: string) => void;
}

/**
 * SizeSelector — chip group + link Size Guide + bảng số đo.
 * Chi tiết build ở Phase 5.
 */
export default function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
          Chọn size
        </p>
        <a
          href="/size-guide"
          className="text-xs font-sans text-brand-muted underline underline-offset-2 hover:text-brand-foreground transition-colors duration-200"
        >
          Size Guide
        </a>
      </div>

      {/* Size chips */}
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Chip
            key={size.label}
            selected={selected === size.label}
            unavailable={!size.available}
            onClick={() => size.available && onChange(size.label)}
          >
            {size.label}
          </Chip>
        ))}
      </div>

      {/* Measurements table — Phase 5 */}
      <p className="text-xs font-sans text-brand-muted">
        Bảng số đo chi tiết sẽ hiển thị ở đây.
      </p>
    </div>
  );
}
