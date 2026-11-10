"use client";

import { useState } from "react";
import { type ProductFilters } from "@/types";
import { cn } from "@/lib/utils";

/**
 * =====================================================================
 * COMPONENT: CollectionFilters (Bộ lọc sản phẩm cho trang Bộ sưu tập)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Component này sử dụng "use client" vì cần xử lý tương tác bấm nút của người dùng
 *   (chọn size, chọn dịp mặc, chọn màu sắc, sắp xếp giá).
 * - Trên Mobile: Có nút bấm để "Thu gọn / Mở rộng" bộ lọc (Collapsible)
 *   giúp màn hình điện thoại không bị rối mắt.
 * - Trên Desktop: Hiển thị thanh lọc tối giản, sang trọng theo phong cách SSENSE.
 * - Khi người dùng bấm vào bất kỳ lựa chọn nào, hàm onChange() sẽ được gọi
 *   để trang cập nhật danh sách sản phẩm ngay lập tức mà không cần load lại trang.
 * =====================================================================
 */

interface CollectionFiltersProps {
  /** Bộ lọc hiện tại đang được áp dụng */
  filters: ProductFilters;
  /** Hàm callback được gọi khi người dùng thay đổi lựa chọn */
  onChange: (newFilters: ProductFilters) => void;
  /** Tổng số sản phẩm đang hiển thị khớp với bộ lọc */
  totalResults: number;
  /** Tổng số sản phẩm gốc của cửa hàng */
  totalCount: number;
}

// Các danh mục tùy chọn lọc
const OCCASIONS = [
  { value: "all", label: "Tất cả dịp" },
  { value: "Wedding", label: "Cưới hỏi (Wedding)" },
  { value: "Tea Ceremony", label: "Lễ gia tiên (Ceremony)" },
  { value: "Editorial", label: "Chụp ảnh (Editorial)" },
  { value: "Event", label: "Sự kiện (Event)" },
];

const SIZES = ["all", "XS", "S", "M", "L", "XL"];

const COLORS = [
  { value: "all", label: "Tất cả màu" },
  { value: "Ivory", label: "Kem ngà (Ivory)" },
  { value: "Sage", label: "Xanh xô thơm (Sage)" },
  { value: "Terracotta", label: "Đất nung (Terracotta)" },
  { value: "Rose", label: "Hồng phấn (Rose)" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Nổi bật nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
] as const;

export default function CollectionFilters({
  filters,
  onChange,
  totalResults,
  totalCount,
}: CollectionFiltersProps) {
  // Trạng thái đóng/mở bộ lọc trên thiết bị di động (Mobile)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Kiểm tra xem có bộ lọc nào đang được kích hoạt hay không
  const hasActiveFilters =
    filters.occasion !== "all" ||
    filters.size !== "all" ||
    filters.color !== "all" ||
    filters.sortBy !== "featured";

  // Hàm xóa tất cả bộ lọc về mặc định
  const handleReset = () => {
    onChange({
      occasion: "all",
      size: "all",
      color: "all",
      sortBy: "featured",
    });
  };

  return (
    <div className="w-full mb-10 md:mb-14 border-y border-brand-border/60 py-4">
      {/* 
        =================================================================
        THANH ĐIỀU KHIỂN CHÍNH (Hiển thị trên cả Mobile và Desktop)
        =================================================================
      */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Nút bấm Đóng/Mở bộ lọc trên Mobile */}
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className={cn(
            "md:hidden flex items-center gap-2 px-3 py-2 text-xs font-sans uppercase tracking-widest border transition-colors",
            isMobileOpen
              ? "bg-brand-foreground text-brand-background border-brand-foreground"
              : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
          )}
        >
          <span>BỘ LỌC & SẮP XẾP</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-brand-surface rounded-full" />
          )}
          <span className="text-xs">[{isMobileOpen ? "−" : "+"}]</span>
        </button>

        {/* Thông tin số lượng sản phẩm */}
        <div className="text-xs font-sans text-brand-muted tracking-wider">
          Hiển thị{" "}
          <span className="font-semibold text-brand-foreground">
            {totalResults}
          </span>{" "}
          / {totalCount} mẫu áo dài
        </div>

        {/* Bộ sắp xếp nhanh (Dropdown) */}
        <div className="flex items-center gap-2 text-xs font-sans">
          <label htmlFor="sort-select" className="text-brand-muted hidden sm:inline">
            Sắp xếp theo:
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as ProductFilters["sortBy"],
              })
            }
            className="bg-transparent text-brand-foreground text-xs uppercase tracking-wider border border-brand-border px-2.5 py-1.5 focus:outline-none focus:border-brand-foreground cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-brand-background text-brand-foreground"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Nút Xóa bộ lọc (chỉ hiện khi có lựa chọn lọc) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-sans text-brand-muted hover:text-brand-foreground underline underline-offset-4 ml-2 cursor-pointer transition-colors"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* 
        =================================================================
        KHUNG CHI TIẾT CÁC BỘ LỌC (Size, Dịp mặc, Màu sắc)
        - Trên Mobile: Chỉ mở ra khi bấm nút mở (isMobileOpen === true).
        - Trên Desktop (md:): Luôn hiển thị thanh thoát, tinh tế.
        =================================================================
      */}
      <div
        className={cn(
          "pt-4 mt-4 border-t border-brand-border/40 flex-col gap-5",
          isMobileOpen ? "flex" : "hidden md:flex"
        )}
      >
        {/* Nhóm 1: Lọc theo Dịp mặc (Occasion) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Dịp mặc:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {OCCASIONS.map((occ) => {
              const isSelected = filters.occasion === occ.value;
              return (
                <button
                  key={occ.value}
                  type="button"
                  onClick={() => onChange({ ...filters, occasion: occ.value })}
                  className={cn(
                    "px-3 py-1 text-xs font-sans tracking-wide uppercase transition-all duration-200 cursor-pointer border",
                    isSelected
                      ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                      : "bg-transparent text-brand-foreground/80 border-brand-border/80 hover:border-brand-foreground"
                  )}
                >
                  {occ.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nhóm 2: Lọc theo Kích cỡ (Size) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Kích cỡ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((size) => {
              const isSelected = filters.size === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...filters, size })}
                  className={cn(
                    "min-w-9 px-2.5 py-1 text-xs font-sans tracking-wide uppercase transition-all duration-200 cursor-pointer border text-center",
                    isSelected
                      ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                      : "bg-transparent text-brand-foreground/80 border-brand-border/80 hover:border-brand-foreground"
                  )}
                >
                  {size === "all" ? "Tất cả" : size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nhóm 3: Lọc theo Tông màu (Color) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Tông màu:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((col) => {
              const isSelected = filters.color === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => onChange({ ...filters, color: col.value })}
                  className={cn(
                    "px-3 py-1 text-xs font-sans tracking-wide uppercase transition-all duration-200 cursor-pointer border",
                    isSelected
                      ? "bg-brand-foreground text-brand-background border-brand-foreground font-medium"
                      : "bg-transparent text-brand-foreground/80 border-brand-border/80 hover:border-brand-foreground"
                  )}
                >
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
