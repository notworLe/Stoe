import Image from "next/image";
import { type Product } from "@/types";

interface ProductGalleryProps {
  images: Product["images"];
  productName: string;
}

/**
 * ProductGallery — ảnh lớn trái + thumbnails.
 * Desktop: image left / details right (layout do parent page.tsx xử lý).
 * Chi tiết build ở Phase 5.
 */
export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImage, ...thumbnails] = images;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[2/3] bg-brand-card overflow-hidden">
        {mainImage && (
          <Image
            src={mainImage}
            alt={productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>

      {/* Thumbnails */}
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {thumbnails.map((img, i) => (
            <div key={i} className="relative aspect-square bg-brand-card overflow-hidden">
              <Image
                src={img}
                alt={`${productName} — ảnh ${i + 2}`}
                fill
                className="object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                sizes="25vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
