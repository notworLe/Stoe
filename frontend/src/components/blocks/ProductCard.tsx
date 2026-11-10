import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/types";
import { cn } from "@/lib/utils";

/**
 * =====================================================================
 * COMPONENT: ProductCard (Thẻ hiển thị sản phẩm Áo Dài)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Component này dùng để hiển thị 1 mẫu áo dài trong lưới bộ sưu tập.
 * - Tuân thủ nghiêm ngặt quy tắc thiết kế từ MASTER.md:
 *   1. KHÔNG bo tròn góc (không dùng rounded-lg, rounded-full -> để góc vuông vức editorial).
 *   2. KHÔNG đổ bóng (không dùng shadow-md, shadow-lg).
 *   3. Ảnh tỷ lệ dọc chân dung (aspect-[3/4]).
 *   4. Hiệu ứng hover: phóng to ảnh nhẹ nhàng scale(1.03) trong khung bị cắt (overflow-hidden).
 *   5. Khung chứa <Image fill /> BẮT BUỘC phải có class "relative" để ảnh không bung ra ngoài trang.
 * =====================================================================
 */

interface ProductCardProps {
  /** Thông tin sản phẩm cần hiển thị */
  product: Product;
  /** Tùy chọn class CSS thêm từ bên ngoài nếu cần */
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  // Lấy ảnh chính (ảnh đầu tiên trong mảng images)
  const mainImage = product.images[0];

  // Định dạng giá tiền Việt Nam Đồng (VND)
  const priceVndFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(product.rentalPricePerDay);

  // Lọc danh sách các size còn hàng
  const availableSizes = product.sizes.filter((s) => s.available);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        // Nhóm thẻ cha: group để kích hoạt hover lên ảnh con bên trong
        "group flex flex-col gap-3.5",
        // Viền focus chuẩn trợ năng khi duyệt bằng bàn phím (Tab)
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-4",
        className
      )}
    >
      {/* 
        Khung ảnh dọc tỷ lệ 3:4 chuẩn Editorial lookbook.
        - "relative": Mốc tọa độ cho <Image fill />.
        - "overflow-hidden": Cắt gọn mép ảnh khi hover zoom.
        - "bg-brand-surface/20": Màu nền tạm màu kem trong khi chờ ảnh tải.
      */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-brand-surface/30">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          // Khung hiển thị dự phòng nếu sản phẩm chưa có ảnh
          <div className="w-full h-full flex items-center justify-center bg-brand-surface/40 p-4 text-center">
            <span className="font-serif text-xs text-brand-muted uppercase tracking-widest">
              {product.name}
            </span>
          </div>
        )}

        {/* Nhãn Tag góc trên: hiển thị dịp mặc (ví dụ: Wedding, Editorial, Ceremony) */}
        {product.occasion && (
          <div className="absolute top-2.5 left-2.5 bg-brand-background/90 px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase text-brand-foreground backdrop-blur-xs">
            {product.occasion}
          </div>
        )}

        {/* Thanh danh sách size còn hàng hiển thị nhẹ ở đáy ảnh khi hover */}
        <div className="absolute bottom-0 inset-x-0 bg-brand-background/85 px-2 py-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-[10px] font-sans tracking-wider text-brand-foreground backdrop-blur-xs">
          <span>SIZES:</span>
          {availableSizes.map((s) => (
            <span key={s.label} className="font-semibold">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Thông tin sản phẩm bên dưới ảnh */}
      <div className="flex flex-col gap-1 text-left">
        {/* Tên áo dài: Cormorant Garamond thanh mảnh, gạch chân nhẹ khi hover */}
        <h3 className="font-serif text-brand-foreground text-sm md:text-base uppercase tracking-wider group-hover:underline underline-offset-4 decoration-brand-foreground/40 line-clamp-1">
          {product.name}
        </h3>

        {/* Thông tin giá thuê */}
        <div className="flex flex-wrap items-baseline gap-x-2 text-xs font-sans">
          {/* Giá thuê Melbourne AUD (nếu có) */}
          {product.rentalPriceAud && (
            <span className="text-brand-foreground font-medium">
              ${product.rentalPriceAud} AUD{" "}
              <span className="text-brand-muted font-normal">/ 4 ngày</span>
            </span>
          )}

          {/* Giá thuê tương đương tính theo ngày (VND) */}
          <span className="text-brand-muted text-[11px]">
            ({priceVndFormatted}/ngày)
          </span>
        </div>
      </div>
    </Link>
  );
}
