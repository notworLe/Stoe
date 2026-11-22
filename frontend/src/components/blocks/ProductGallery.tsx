"use client";

import { useState } from "react";
import Image from "next/image";
import { type Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: Product["images"];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : ["/images/aodai-ivory.jpg"];
  const mainImage = safeImages[activeIndex] || safeImages[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[3/4] bg-brand-surface/30 overflow-hidden border border-brand-border/40">
        <Image
          src={mainImage}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-[3/4] bg-brand-card overflow-hidden border transition-all cursor-pointer",
                i === activeIndex
                  ? "border-brand-foreground opacity-100"
                  : "border-brand-border/50 opacity-65 hover:opacity-100"
              )}
              aria-label={`View image ${i + 1} of ${productName}`}
            >
              <Image
                src={img}
                alt={`${productName} — view ${i + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
