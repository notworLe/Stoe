"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/products";
import { fetchGarmentBySlug } from "@/lib/api";
import { formatAudShort } from "@/lib/constants";
import ProductGallery from "@/components/blocks/ProductGallery";
import ProductBookingInteractive from "@/components/blocks/ProductBookingInteractive";
import Accordion from "@/components/ui/Accordion";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const fallback = MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  const [product, setProduct] = useState<Product | null>(fallback);
  const [isLoading, setIsLoading] = useState<boolean>(!fallback);

  useEffect(() => {
    let active = true;
    fetchGarmentBySlug(slug)
      .then((live) => {
        if (active) {
          setProduct(live);
        }
      })
      .catch(() => {
        // Keep fallback if offline
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-sm uppercase tracking-widest text-brand-muted animate-pulse">
          Loading silhouette details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-2xl text-brand-foreground uppercase tracking-wider mb-4">
          Silhouette Not Found
        </h1>
        <p className="font-sans text-brand-muted text-sm mb-6">
          This Ao Dai design is unavailable or has been archived.
        </p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 text-xs font-sans tracking-widest uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors"
        >
          Back to Archive
        </Link>
      </div>
    );
  }

  const accordionItems = [
    {
      id: "delivery",
      title: "Delivery & Return Policy",
      content: (
        <div className="space-y-2 text-xs">
          <p>
            <strong>Pick in Person (Free):</strong> Collect and return directly at our South Yarra,
            Melbourne studio. Eligible for 1, 2, 4, and 8 day rental packages.
          </p>
          <p>
            <strong>Transport Post (Australia Post Express):</strong> Express nationwide delivery
            with a prepaid return satchel. Eligible for 4-day and 8-day rental packages only.
          </p>
        </div>
      ),
    },
    {
      id: "care",
      title: "Garment Care & 1-Day Turnaround Gap",
      content: (
        <div className="space-y-2 text-xs">
          <p>
            Please do not wash, iron, or dry-clean the silk garment yourself. Complimentary
            eco-steaming and UV sanitization are included with every rental.
          </p>
          <p>
            To guarantee pristine silk quality, Maison de Lua enforces a mandatory 1-day care gap
            between consecutive bookings of the same garment.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-start">
      <div className="md:col-span-6 lg:col-span-7">
        <ProductGallery images={product.images} productName={product.name} />
      </div>

      <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-6 text-left">
        <div>
          <Link
            href="/product"
            className="text-xs font-sans text-brand-muted hover:text-brand-foreground uppercase tracking-widest inline-flex items-center gap-1.5 mb-4 transition-colors"
          >
            ← THE ARCHIVE
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl text-brand-foreground uppercase tracking-wider mb-2 font-normal">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-sans text-lg font-medium text-brand-foreground">
              {formatAudShort(product.rentalPriceAud)}{" "}
              <span className="text-xs text-brand-muted font-normal">
                / 4-day standard
              </span>
            </span>
            <span className="font-sans text-xs text-brand-muted">
              · From {formatAudShort(Math.round(product.rentalPriceAud * 0.45))} (1 day Pick in Person)
            </span>
          </div>
        </div>

        {product.description && (
          <p className="font-sans text-sm text-brand-muted leading-relaxed">
            {product.description}
          </p>
        )}

        <ProductBookingInteractive product={product} />

        <Accordion items={accordionItems} className="mt-2" />
      </div>
    </div>
  );
}
