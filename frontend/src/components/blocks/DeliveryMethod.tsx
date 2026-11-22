"use client";

import { type DeliveryMethod } from "@/types";
import { formatAud } from "@/lib/constants";
import Chip from "@/components/ui/Chip";

interface DeliveryMethodProps {
  selected: DeliveryMethod | null;
  postalFeeAud: number;
  onChange: (method: DeliveryMethod) => void;
}

export default function DeliveryMethodSelector({
  selected,
  postalFeeAud,
  onChange,
}: DeliveryMethodProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
        Delivery Method
      </p>
      <div className="flex flex-wrap gap-2">
        <Chip
          selected={selected === "pick_in_person"}
          onClick={() => onChange("pick_in_person")}
        >
          Pick in Person (Free)
        </Chip>
        <Chip
          selected={selected === "transport_post"}
          onClick={() => onChange("transport_post")}
        >
          Transport Post (+{formatAud(postalFeeAud)})
        </Chip>
      </div>
    </div>
  );
}
