import { Suspense } from "react";
import Section from "@/components/layout/Section";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <>
      <p className="font-serif text-brand-foreground text-2xl uppercase tracking-widest">
        {slug}
      </p>
      <p className="font-sans text-brand-muted text-sm mt-4">
        Chi tiết sản phẩm + booking sẽ build ở Phase 5.
      </p>
    </>
  );
}

/**
 * Product page — booking + checkout.
 * Full 10-section implementation ở Phase 5.
 */
export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Section>
      <Suspense fallback={<p className="text-brand-muted text-sm">Đang tải...</p>}>
        <ProductContent params={params} />
      </Suspense>
    </Section>
  );
}
