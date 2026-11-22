import { type Product } from "@/types";
import ProductCard from "./ProductCard";

interface CollectionGridProps {
  products: Product[];
  title?: string;
  onResetFilters?: () => void;
}

export default function CollectionGrid({
  products,
  title,
  onResetFilters,
}: CollectionGridProps) {
  return (
    <div className="w-full">
      {title && (
        <h2 className="font-serif text-brand-foreground text-2xl uppercase tracking-widest text-center mb-10 md:mb-14">
          {title}
        </h2>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-brand-surface/20 border border-brand-border/40 p-8">
          <p className="font-serif text-brand-foreground text-lg uppercase tracking-wider">
            No Matching Garments Found
          </p>
          <p className="font-sans text-brand-muted text-xs max-w-md leading-relaxed">
            No Ao Dai silhouettes currently match all of your active filter selections.
            Clear one or more filters to explore the full archive.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-2 px-6 py-2.5 text-xs font-sans tracking-widest uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
