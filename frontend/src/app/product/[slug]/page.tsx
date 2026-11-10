import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/layout/Section";
import ProductBookingInteractive from "@/components/blocks/ProductBookingInteractive";
import { MOCK_PRODUCTS } from "@/data/products";

/**
 * =====================================================================
 * TRANG CHI TIẾT SẢN PHẨM (Product Detail Page — /product/[slug])
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Đây là một dynamic route trong Next.js App Router (dấu [slug] là biến).
 * - Ở Next.js 16 (bật Partial Prerendering - PPR):
 *   `params` là một Promise. Để không bị lỗi build crash khi prerender,
 *   phần đọc `await params` PHẢI được đặt trong component con bọc bởi <Suspense>.
 * - Ở Phase 4: Hiển thị thông tin cơ bản của mẫu áo dài được chọn.
 * - Ở Phase 5: Sẽ mở rộng đầy đủ 10 section theo MASTER.md (Lịch chọn ngày,
 *   tính tiền thuê theo ngày/tuần, chọn size, bảng số đo, hình thức nhận đồ).
 * =====================================================================
 */

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;

  // Tìm sản phẩm khớp với slug trong danh sách
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-2xl text-brand-foreground uppercase tracking-wider mb-4">
          Không tìm thấy thiết kế này
        </h1>
        <p className="font-sans text-brand-muted text-sm mb-6">
          Mẫu áo dài bạn tìm kiếm không tồn tại hoặc đã được chuyển vào kho lưu trữ.
        </p>
        <Link
          href="/product"
          className="inline-block px-6 py-2.5 text-xs font-sans tracking-widest uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors"
        >
          Quay lại Bộ sưu tập
        </Link>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(product.rentalPricePerDay);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-start">
      {/* Cột trái: Ảnh sản phẩm lớn */}
      <div className="md:col-span-6 lg:col-span-7">
        <div className="relative w-full aspect-[3/4] bg-brand-surface/30 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Cột phải: Thông tin sản phẩm & Thông báo Phase 5 */}
      <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-6 text-left">
        <div>
          <Link
            href="/product"
            className="text-xs font-sans text-brand-muted hover:text-brand-foreground uppercase tracking-widest inline-flex items-center gap-1.5 mb-4 transition-colors"
          >
            ← BỘ SƯU TẬP
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl text-brand-foreground uppercase tracking-wider mb-2 font-normal">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3">
            {product.rentalPriceAud && (
              <span className="font-sans text-lg font-medium text-brand-foreground">
                ${product.rentalPriceAud} AUD{" "}
                <span className="text-xs text-brand-muted font-normal">
                  / gói 4 ngày
                </span>
              </span>
            )}
            <span className="font-sans text-xs text-brand-muted">
              ({priceFormatted}/ngày)
            </span>
          </div>
        </div>

        {product.description && (
          <p className="font-sans text-sm text-brand-muted leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Khối tương tác: Chọn size, chọn thời gian thuê & Nút Thêm vào giỏ */}
        <ProductBookingInteractive product={product} />

        {/* Thông tin hỗ trợ dịch vụ & Lưu ý */}
        <div className="p-4 bg-brand-surface/25 border border-brand-border/50 text-xs font-sans text-brand-foreground flex flex-col gap-1.5">
          <p className="font-medium tracking-wide uppercase text-[11px] text-brand-muted">
            DỊCH VỤ THỬ ĐỒ TẠI MELBOURNE:
          </p>
          <p className="text-brand-muted leading-relaxed">
            Studio hỗ trợ thử trực tiếp trước ngày sự kiện. Mọi áo dài đều được khử khuẩn và giặt hấp sinh học cẩn thận trước khi trao tới tay bạn.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section className="pt-8 md:pt-14 pb-24">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <p className="font-serif text-sm uppercase tracking-widest text-brand-muted animate-pulse">
                Đang tải dữ liệu thiết kế...
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
