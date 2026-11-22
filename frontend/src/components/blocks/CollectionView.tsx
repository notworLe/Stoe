"use client";

import { useEffect, useMemo, useState } from "react";
import { type Product, type ProductFilters } from "@/types";
import { fetchGarments } from "@/lib/api";
import CollectionFilters from "./CollectionFilters";
import CollectionGrid from "./CollectionGrid";

interface CollectionViewProps {
  initialProducts: Product[];
}

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_INCREMENT = 4;

export default function CollectionView({ initialProducts }: CollectionViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilters] = useState<ProductFilters>({
    occasion: "all",
    size: "all",
    color: "all",
    sortBy: "featured",
  });
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  // Sync live garment catalog from backend API so admin edits reflect immediately
  useEffect(() => {
    let active = true;
    fetchGarments()
      .then((live) => {
        if (active && live.length > 0) {
          setProducts(live);
        }
      })
      .catch(() => {
        // Keep initialProducts fallback if backend is offline
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.occasion !== "all") {
      result = result.filter((product) => product.occasion === filters.occasion);
    }

    if (filters.size !== "all") {
      result = result.filter((product) =>
        product.sizes.some(
          (size) => size.label === filters.size && size.available
        )
      );
    }

    if (filters.color !== "all") {
      result = result.filter((product) => product.color === filters.color);
    }

    if (filters.sortBy === "price-asc") {
      result.sort((a, b) => a.rentalPriceAud - b.rentalPriceAud);
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => b.rentalPriceAud - a.rentalPriceAud);
    }

    return result;
  }, [products, filters]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const remainingCount = Math.max(0, filteredProducts.length - displayedProducts.length);
  const nextLoadCount = Math.min(LOAD_MORE_INCREMENT, remainingCount);
  const progressPercent =
    filteredProducts.length > 0
      ? Math.min(100, Math.round((displayedProducts.length / filteredProducts.length) * 100))
      : 100;

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleResetFilters = () => {
    setFilters({
      occasion: "all",
      size: "all",
      color: "all",
      sortBy: "featured",
    });
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <div className="w-full">
      <CollectionFilters
        filters={filters}
        onChange={handleFilterChange}
        totalResults={filteredProducts.length}
        totalCount={products.length}
      />

      <CollectionGrid
        products={displayedProducts}
        onResetFilters={handleResetFilters}
      />

      {filteredProducts.length > 0 && (
        <div className="mt-14 md:mt-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-full max-w-xs flex flex-col items-center gap-2">
            <span className="text-[11px] font-sans tracking-widest uppercase text-brand-muted">
              Viewing {displayedProducts.length} of {filteredProducts.length} silhouettes
            </span>

            <div className="w-full h-[2px] bg-brand-border/40 overflow-hidden">
              <div
                className="h-full bg-brand-foreground transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {remainingCount > 0 ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT)}
              className="mt-2 px-8 py-3 text-xs font-sans tracking-[0.2em] uppercase border border-brand-border bg-transparent text-brand-foreground hover:bg-brand-foreground hover:text-brand-background transition-all duration-300 cursor-pointer"
            >
              LOAD MORE DESIGNS (+{nextLoadCount})
            </button>
          ) : (
            <p className="mt-2 text-xs font-sans tracking-[0.2em] uppercase text-brand-muted/80">
              — END OF ARCHIVE —
            </p>
          )}
        </div>
      )}
    </div>
  );
}
