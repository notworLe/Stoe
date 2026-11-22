import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import CollectionView from "@/components/blocks/CollectionView";
import { MOCK_PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "The Archive — Editorial Ao Dai Rental | Maison de Lua Melbourne",
  description:
    "Explore the Maison de Lua editorial Vietnamese Ao Dai rental collection in Melbourne, Australia. Prices in AUD with Pick in Person and Australia Post Express.",
};

export default function ProductCollectionPage() {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section className="pt-8 md:pt-14 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-muted mb-2.5">
            MAISON DE LUA · MELBOURNE · AUD
          </p>
          <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-widest text-brand-foreground mb-4 font-normal">
            THE ARCHIVE
          </h1>
          <p className="font-sans text-brand-muted text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            Curated Vietnamese Ao Dai crafted from raw mulberry silk, washed linen, and
            hand-embroidered organza. Available for Pick in Person (1, 2, 4 or 8 days) or
            Transport Post across Australia (4 or 8 days).
          </p>
        </div>

        <CollectionView initialProducts={MOCK_PRODUCTS} />
      </Section>
    </main>
  );
}
