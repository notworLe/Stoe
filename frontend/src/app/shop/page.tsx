import Section from "@/components/layout/Section";
import CollectionGrid from "@/components/blocks/CollectionGrid";

/**
 * Shop / Collection page — full product grid.
 * Data thật sẽ fetch ở Phase 4.
 */
export default function ShopPage() {
  return (
    <Section>
      <h1 className="font-serif text-brand-foreground text-3xl uppercase tracking-widest text-center mb-16">
        Bộ sưu tập
      </h1>
      <CollectionGrid products={[]} title="" />
      <p className="text-center font-sans text-brand-muted text-sm mt-8">
        Sản phẩm sẽ hiển thị ở Phase 4.
      </p>
    </Section>
  );
}
