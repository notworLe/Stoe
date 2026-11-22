import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/types";
import { cn } from "@/lib/utils";
import { formatAudShort } from "@/lib/constants";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const mainImage = product.images[0];
  const availableSizes = product.sizes.filter((s) => s.available);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group flex flex-col gap-3.5",
        "focus-visible:outline-2 focus-visible:outline-brand-ring focus-visible:outline-offset-4",
        className
      )}
    >
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
          <div className="w-full h-full flex items-center justify-center bg-brand-surface/40 p-4 text-center">
            <span className="font-serif text-xs text-brand-muted uppercase tracking-widest">
              {product.name}
            </span>
          </div>
        )}

        {/* Occasion + Code badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          {product.occasion && (
            <span className="bg-brand-background/90 px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase text-brand-foreground backdrop-blur-xs">
              {product.occasion}
            </span>
          )}
          {product.code && (
            <span className="bg-brand-foreground/90 px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase text-brand-background">
              {product.code}
            </span>
          )}
        </div>

        {/* Available sizes hover bar */}
        <div className="absolute bottom-0 inset-x-0 bg-brand-background/90 px-2 py-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-[10px] font-sans tracking-wider text-brand-foreground backdrop-blur-xs">
          <span>SIZES:</span>
          {availableSizes.map((s) => (
            <span key={s.label} className="font-semibold">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <h3 className="font-serif text-brand-foreground text-sm md:text-base uppercase tracking-wider group-hover:underline underline-offset-4 decoration-brand-foreground/40 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-2 text-xs font-sans">
          <span className="text-brand-foreground font-medium">
            {formatAudShort(product.rentalPriceAud)}{" "}
            <span className="text-brand-muted font-normal">/ 4 days</span>
          </span>
          <span className="text-brand-muted text-[11px]">
            · From {formatAudShort(Math.round(product.rentalPriceAud * 0.45))} / 1 day
          </span>
        </div>
      </div>
    </Link>
  );
}
