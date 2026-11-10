import type { Metadata } from "next";
import Section from "@/components/layout/Section";
import CollectionView from "@/components/blocks/CollectionView";
import { MOCK_PRODUCTS } from "@/data/products";

/**
 * =====================================================================
 * TRANG DANH SÁCH SẢN PHẨM / BỘ SƯU TẬP (/product — Phase 4)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Đây là một Server Component (không có "use client").
 * - Server Component giúp tạo sẵn mã HTML hoàn chỉnh gửi về trình duyệt:
 *   + Tối ưu SEO cho Google tìm kiếm (Title, Meta Description).
 *   + Tải trang nhanh hơn, không tốn thời gian chạy Javascript nặng nề.
 * - Toàn bộ website là boutique studio nên tất cả sản phẩm áo dài được quy về
 *   đường dẫn chuẩn /product và chi tiết tại /product/[slug].
 * - Phần tương tác lọc (Filter) & Show More được giao cho Client Component `CollectionView`.
 * =====================================================================
 */

export const metadata: Metadata = {
  title: "The Archive — Bộ sưu tập Áo Dài | LUA STUDIO Melbourne",
  description:
    "Khám phá bộ sưu tập áo dài cho thuê cao cấp tại Melbourne, Australia. Lụa tơ tằm thô, đũi lanh tự nhiên và organza thêu tay tinh xảo cho lễ cưới, lễ gia tiên và chụp hình nghệ thuật.",
};

export default function ProductCollectionPage() {
  return (
    <main className="min-h-screen bg-brand-background text-brand-foreground">
      <Section className="pt-8 md:pt-14 pb-24">
        {/* Khối tiêu đề đầu trang — Chuẩn Editorial Typography */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-brand-muted mb-2.5">
            LUA STUDIO · MELBOURNE
          </p>
          <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-widest text-brand-foreground mb-4 font-normal">
            THE ARCHIVE
          </h1>
          <p className="font-sans text-brand-muted text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            Bộ sưu tập áo dài đương đại cho thuê tại Melbourne. Từng thiết kế
            được tuyển chọn kỹ lưỡng từ chất liệu lụa tơ tằm thô, đũi mộc mạc và
            organza dệt tay cho những khoảnh khắc trọng đại.
          </p>
        </div>

        {/* Khối điều phối bộ lọc, lưới 4 cột desktop / 2 cột mobile và Show More */}
        <CollectionView initialProducts={MOCK_PRODUCTS} />
      </Section>
    </main>
  );
}
