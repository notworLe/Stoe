import Section from "@/components/layout/Section";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Product page — booking + checkout.
 * Full 10-section implementation ở Phase 5.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <Section>
      <p className="font-serif text-brand-foreground text-2xl uppercase tracking-widest">
        {slug}
      </p>
      <p className="font-sans text-brand-muted text-sm mt-4">
        Chi tiết sản phẩm + booking sẽ build ở Phase 5.
      </p>
    </Section>
  );
}
