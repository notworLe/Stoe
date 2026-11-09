import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard — portrait photo + tên + giá thuê.
 * Không có shadow, không có rounded corner theo MASTER.md.
 * Hover: image scale(1.03) bên trong clipped container.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];
  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(product.rentalPricePerDay);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group flex flex-col gap-3",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-2"
      )}
    >
      {/* Image — clipped container cho hover scale */}
      <div className="overflow-hidden aspect-[2/3] bg-brand-card">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          // Placeholder khi chưa có ảnh
          <div className="w-full h-full bg-brand-card flex items-center justify-center">
            <span className="text-xs font-sans text-brand-muted uppercase tracking-widest">
              {product.name}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="font-serif text-brand-foreground text-sm uppercase tracking-wide">
          {product.name}
        </p>
        <p className="font-sans text-brand-muted text-xs">
          {priceFormatted} / ngày
        </p>
      </div>
    </Link>
  );
}
