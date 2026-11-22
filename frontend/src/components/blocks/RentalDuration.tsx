"use client";

import { type RentalOption } from "@/types";
import Chip from "@/components/ui/Chip";

interface RentalDurationProps {
  options: RentalOption[];
  selected: number | null;
  onChange: (days: number) => void;
}

export default function RentalDuration({
  options,
  selected,
  onChange,
}: RentalDurationProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
        Rental Package
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
