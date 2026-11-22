import { type PriceBreakdown } from "@/types";
import { formatAud } from "@/lib/constants";
import Divider from "@/components/ui/Divider";

interface PriceBreakdownProps {
  breakdown: PriceBreakdown | null;
}

export default function PriceBreakdownBlock({ breakdown }: PriceBreakdownProps) {
  if (!breakdown) {
    return (
      <div className="border border-brand-border p-4">
        <p className="text-xs font-sans text-brand-muted text-center">
          Select your size, delivery method, and dates to view pricing in AUD.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-brand-border p-4 flex flex-col gap-3">
      <div className="flex justify-between text-sm font-sans text-brand-foreground">
        <span>Rental Fee</span>
        <span>{formatAud(breakdown.rentalFee)}</span>
      </div>
      <div className="flex justify-between text-sm font-sans text-brand-muted">
        <span>Delivery</span>
        <span>{breakdown.deliveryFee === 0 ? "Free ($0.00 AUD)" : formatAud(breakdown.deliveryFee)}</span>
      </div>
      {breakdown.afterHoursFee > 0 && (
        <div className="flex justify-between text-sm font-sans text-brand-accent">
          <span>After-Hours Surcharge</span>
          <span>{formatAud(breakdown.afterHoursFee)}</span>
        </div>
      )}
      <Divider />
      <div className="flex justify-between text-sm font-sans font-medium text-brand-foreground">
        <span className="uppercase tracking-wider text-xs">Total (AUD)</span>
        <span>{formatAud(breakdown.total)}</span>
      </div>
    </div>
  );
}
