import { type Product } from "@/types";
import ProductCard from "./ProductCard";

/**
 * =====================================================================
 * COMPONENT: CollectionGrid (Lưới hiển thị bộ sưu tập áo dài)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Component này quản lý việc dàn trang lưới các sản phẩm áo dài.
 * - Tuân thủ đặc tả giao diện của MASTER.md & ROADMAP.md Phase 4:
 *   + Desktop: 4 cột sản phẩm (md:grid-cols-4)
 *   + Mobile: 2 cột sản phẩm (grid-cols-2)
 *   + Khoảng cách (gap) thoáng đãng, rộng rãi đúng chất Editorial
 *   + Xử lý trường hợp "Không có kết quả" (Empty State) lịch sự và tinh tế
 * =====================================================================
 */

interface CollectionGridProps {
  /** Danh sách sản phẩm cần dàn vào lưới */
  products: Product[];
  /** Tiêu đề section (nếu dùng làm khối con ở trang khác) */
  title?: string;
  /** Callback tùy chọn để xóa bộ lọc khi không có kết quả */
  onResetFilters?: () => void;
}

export default function CollectionGrid({
  products,
  title,
  onResetFilters,
}: CollectionGridProps) {
  return (
    <div className="w-full">
      {/* Tiêu đề phụ (nếu được truyền vào) */}
      {title && (
        <h2 className="font-serif text-brand-foreground text-2xl uppercase tracking-widest text-center mb-10 md:mb-14">
          {title}
        </h2>
      )}

      {/* 
        Trường hợp 1: Có sản phẩm để hiển thị
        -> Dàn vào lưới 2 cột trên điện thoại (grid-cols-2) và 4 cột trên máy tính (md:grid-cols-4)
      */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:gap-x-8 md:gap-y-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* 
          Trường hợp 2: Không có sản phẩm nào khớp với bộ lọc
          -> Hiển thị thông báo thân thiện và nút xóa bộ lọc
        */
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-brand-surface/20 border border-brand-border/40 p-8">
          <p className="font-serif text-brand-foreground text-lg uppercase tracking-wider">
            Không tìm thấy mẫu áo dài phù hợp
          </p>
          <p className="font-sans text-brand-muted text-xs max-w-md">
            Hiện tại chưa có mẫu áo dài nào khớp với toàn bộ các tiêu chí lọc
            bạn đã chọn. Hãy thử bỏ bớt bộ lọc để khám phá thêm các thiết kế
            khác.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-2 px-6 py-2.5 text-xs font-sans tracking-widest uppercase bg-brand-foreground text-brand-background hover:bg-brand-foreground/90 transition-colors cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
