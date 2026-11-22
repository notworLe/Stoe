import { Suspense } from "react";
import Section from "@/components/layout/Section";
import ProductDetailClient from "@/components/blocks/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section className="pt-8 md:pt-14 pb-24">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <p className="font-serif text-sm uppercase tracking-widest text-brand-muted animate-pulse">
                Loading silhouette details...
              </p>
            </div>
          }
        >
          <ProductContent params={params} />
        </Suspense>
      </Section>
    </main>
  );
}
