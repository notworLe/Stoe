import { type PriceBreakdown } from "@/types";
import Divider from "@/components/ui/Divider";

interface PriceBreakdownProps {
  breakdown: PriceBreakdown | null;
}

/**
 * PriceBreakdown — hiển thị chi tiết giá trước checkout.
 * Cập nhật live khi options thay đổi (parent truyền breakdown mới).
 * Null khi chưa đủ options để tính giá.
 */
export default function PriceBreakdownBlock({ breakdown }: PriceBreakdownProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);

  if (!breakdown) {
    return (
      <div className="border border-brand-border p-4">
        <p className="text-xs font-sans text-brand-muted text-center">
          Chọn size, ngày và phương thức nhận để xem giá.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-brand-border p-4 flex flex-col gap-3">
      <div className="flex justify-between text-sm font-sans text-brand-foreground">
        <span>Phí thuê</span>
        <span>{fmt(breakdown.rentalFee)}</span>
      </div>
      <div className="flex justify-between text-sm font-sans text-brand-muted">
        <span>Phí giao hàng</span>
        <span>{breakdown.deliveryFee === 0 ? "Miễn phí" : fmt(breakdown.deliveryFee)}</span>
      </div>
      <Divider />
      <div className="flex justify-between text-sm font-sans font-medium text-brand-foreground">
        <span className="uppercase tracking-wider text-xs">Tổng cộng</span>
        <span>{fmt(breakdown.total)}</span>
      </div>
    </div>
  );
}
