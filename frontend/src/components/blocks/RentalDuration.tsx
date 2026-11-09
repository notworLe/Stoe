"use client";

import { type RentalOption } from "@/types";
import Chip from "@/components/ui/Chip";

interface RentalDurationProps {
  options: RentalOption[];
  selected: number | null;
  onChange: (days: number) => void;
}

/**
 * RentalDuration — chip group cho thời gian thuê.
 * Giá cập nhật theo lựa chọn (logic tính giá do parent xử lý).
 */
export default function RentalDuration({ options, selected, onChange }: RentalDurationProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
        Thời gian thuê
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.days}
            selected={selected === option.days}
            onClick={() => onChange(option.days)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
