import { type Product } from "@/types";
import ProductCard from "./ProductCard";
import Section from "@/components/layout/Section";

interface CollectionGridProps {
  products: Product[];
  title?: string;
}

/**
 * CollectionGrid — image-led grid 4 col desktop / 2 col mobile.
 * Dùng ở Homepage (3-4 featured) và Shop page (full grid).
 */
export default function CollectionGrid({
  products,
  title = "Bộ sưu tập nổi bật",
}: CollectionGridProps) {
  return (
    <Section>
      {title && (
        <h2 className="font-serif text-brand-foreground text-2xl uppercase tracking-widest text-center mb-16">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
