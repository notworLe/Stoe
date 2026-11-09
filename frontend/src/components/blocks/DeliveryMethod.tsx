"use client";

import { type DeliveryMethod } from "@/types";
import Chip from "@/components/ui/Chip";

interface DeliveryMethodProps {
  selected: DeliveryMethod | null;
  postalFee: number;
  onChange: (method: DeliveryMethod) => void;
}

/**
 * DeliveryMethod — pickup tại studio / bưu điện.
 * Phí giao hàng hiển thị khi chọn postal.
 */
export default function DeliveryMethodSelector({
  selected,
  postalFee,
  onChange,
}: DeliveryMethodProps) {
  const feeFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(postalFee);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-sans uppercase tracking-widest text-brand-foreground">
        Phương thức nhận
      </p>
      <div className="flex flex-wrap gap-2">
        <Chip selected={selected === "pickup"} onClick={() => onChange("pickup")}>
          Nhận tại studio
        </Chip>
        <Chip selected={selected === "postal"} onClick={() => onChange("postal")}>
          Giao tận nơi
        </Chip>
      </div>
      {selected === "postal" && (
        <p className="text-xs font-sans text-brand-muted">
          Phí giao hàng: {feeFormatted}
        </p>
      )}
    </div>
  );
}
