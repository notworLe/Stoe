"use client";

import { useState, useMemo } from "react";
import { type Product, type ProductFilters } from "@/types";
import CollectionFilters from "./CollectionFilters";
import CollectionGrid from "./CollectionGrid";

/**
 * =====================================================================
 * COMPONENT: CollectionView (Điều phối Lọc, Sắp xếp & Tải thêm Show More)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Quản lý 2 trạng thái quan trọng:
 *   1. `filters`: Các tiêu chí lọc (Dịp mặc, Size, Màu sắc, Sắp xếp giá).
 *   2. `visibleCount`: Số lượng sản phẩm đang được hiển thị trên màn hình.
 * - Tính năng "SHOW MORE" (Xem thêm):
 *   + Ban đầu hiển thị 8 sản phẩm (2 hàng trên desktop, 4 hàng trên mobile).
 *   + Khi bấm "XEM THÊM THIẾT KẾ", danh sách sẽ mở rộng thêm 4 sản phẩm tiếp theo.
 *   + Có thanh tiến độ (Progress bar) tinh tế hiển thị tỷ lệ đã xem.
 *   + Khi người dùng đổi bộ lọc, số lượng hiển thị tự động đặt lại về 8.
 * =====================================================================
 */

interface CollectionViewProps {
  /** Danh sách sản phẩm ban đầu được truyền từ server */
  initialProducts: Product[];
}

// Số lượng sản phẩm hiển thị ban đầu và số lượng nạp thêm mỗi lần bấm
const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_INCREMENT = 4;

export default function CollectionView({ initialProducts }: CollectionViewProps) {
  // 1. Trạng thái bộ lọc
  const [filters, setFilters] = useState<ProductFilters>({
    occasion: "all",
    size: "all",
    color: "all",
    sortBy: "featured",
  });

  // 2. Trạng thái số lượng sản phẩm đang hiển thị (phục vụ Show More)
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  // 3. Tính toán danh sách sản phẩm sau khi lọc và sắp xếp
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Lọc theo Dịp mặc (Occasion)
    if (filters.occasion !== "all") {
      result = result.filter(
        (product) => product.occasion === filters.occasion
      );
    }

    // Lọc theo Kích cỡ (Size)
    if (filters.size !== "all") {
      result = result.filter((product) =>
        product.sizes.some(
          (size) => size.label === filters.size && size.available
        )
      );
    }

    // Lọc theo Tông màu (Color)
    if (filters.color !== "all") {
      result = result.filter((product) => product.color === filters.color);
    }

    // Sắp xếp danh sách (Sort)
    if (filters.sortBy === "price-asc") {
      result.sort((a, b) => a.rentalPricePerDay - b.rentalPricePerDay);
    } else if (filters.sortBy === "price-desc") {
      result.sort((a, b) => b.rentalPricePerDay - a.rentalPricePerDay);
    }

    return result;
  }, [initialProducts, filters]);

  // Cắt danh sách sản phẩm chỉ lấy đúng số lượng đang được phép hiển thị
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Số lượng sản phẩm còn lại chưa hiển thị
  const remainingCount = Math.max(0, filteredProducts.length - displayedProducts.length);
  const nextLoadCount = Math.min(LOAD_MORE_INCREMENT, remainingCount);

  // Tỷ lệ phần trăm sản phẩm đã xem (cho thanh progress)
  const progressPercent =
    filteredProducts.length > 0
      ? Math.min(100, Math.round((displayedProducts.length / filteredProducts.length) * 100))
      : 100;

  // Hàm xử lý khi người dùng đổi bộ lọc: cập nhật filters và reset số lượng về ban đầu
  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  // Hàm đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setFilters({
      occasion: "all",
      size: "all",
      color: "all",
      sortBy: "featured",
    });
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  // Hàm tải thêm sản phẩm khi bấm nút Show More
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT);
  };

  return (
    <div className="w-full">
      {/* Thanh công cụ lọc và sắp xếp */}
      <CollectionFilters
        filters={filters}
        onChange={handleFilterChange}
        totalResults={filteredProducts.length}
        totalCount={initialProducts.length}
      />

      {/* Lưới hiển thị các sản phẩm */}
      <CollectionGrid
        products={displayedProducts}
        onResetFilters={handleResetFilters}
      />

      {/* 
        =================================================================
        KHU VỰC ĐIỀU KHIỂN "SHOW MORE" / TIẾN ĐỘ BỘ SƯU TẬP
        =================================================================
      */}
      {filteredProducts.length > 0 && (
        <div className="mt-14 md:mt-20 flex flex-col items-center justify-center gap-4 text-center">
          {/* Thông tin số lượng & Thanh tiến độ thanh mảnh */}
          <div className="w-full max-w-xs flex flex-col items-center gap-2">
            <span className="text-[11px] font-sans tracking-widest uppercase text-brand-muted">
              Đang xem {displayedProducts.length} / {filteredProducts.length} thiết kế
            </span>

            {/* Thanh tiến độ 1px chuẩn tối giản */}
            <div className="w-full h-[2px] bg-brand-border/40 overflow-hidden">
              <div
                className="h-full bg-brand-foreground transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Nút bấm "Xem thêm" (khi còn sản phẩm chưa hiển thị) */}
          {remainingCount > 0 ? (
            <button
              type="button"
              onClick={handleLoadMore}
              className="mt-2 px-8 py-3 text-xs font-sans tracking-[0.2em] uppercase border border-brand-border bg-transparent text-brand-foreground hover:bg-brand-foreground hover:text-brand-background transition-all duration-300 cursor-pointer"
            >
              XEM THÊM THIẾT KẾ (+{nextLoadCount} MẪU)
            </button>
          ) : (
            /* Thông báo khi đã xem toàn bộ thiết kế */
            <p className="mt-2 text-xs font-sans tracking-[0.2em] uppercase text-brand-muted/80">
              — BẠN ĐÃ XEM TOÀN BỘ BỘ SƯU TẬP —
            </p>
          )}
        </div>
      )}
    </div>
  );
}
