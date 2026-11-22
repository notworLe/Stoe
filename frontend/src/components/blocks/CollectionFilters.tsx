"use client";

import { useState } from "react";
import { type ProductFilters } from "@/types";
import { cn } from "@/lib/utils";

interface CollectionFiltersProps {
  filters: ProductFilters;
  onChange: (newFilters: ProductFilters) => void;
  totalResults: number;
  totalCount: number;
}

const OCCASIONS = [
  { value: "all", label: "All Occasions" },
  { value: "Wedding", label: "Wedding" },
  { value: "Tea Ceremony", label: "Tea Ceremony" },
  { value: "Editorial", label: "Editorial" },
  { value: "Event", label: "Event" },
];

const SIZES = ["all", "XS", "S", "M", "L", "XL"];

const COLORS = [
  { value: "all", label: "All Colours" },
  { value: "Ivory", label: "Ivory" },
  { value: "Sage", label: "Sage" },
  { value: "Terracotta", label: "Terracotta" },
  { value: "Rose", label: "Rose" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price (AUD): Low to High" },
  { value: "price-desc", label: "Price (AUD): High to Low" },
] as const;

export default function CollectionFilters({
  filters,
  onChange,
  totalResults,
  totalCount,
}: CollectionFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters =
    filters.occasion !== "all" ||
    filters.size !== "all" ||
    filters.color !== "all" ||
    filters.sortBy !== "featured";

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className={cn(
            "md:hidden flex items-center gap-2 px-3 py-2 text-xs font-sans uppercase tracking-widest border transition-colors cursor-pointer",
            isMobileOpen
              ? "bg-brand-foreground text-brand-background border-brand-foreground"
              : "bg-transparent text-brand-foreground border-brand-border hover:border-brand-foreground"
          )}
        >
          <span>FILTER &amp; SORT</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-brand-surface rounded-full" />
          )}
          <span className="text-xs">[{isMobileOpen ? "−" : "+"}]</span>
        </button>

        <div className="text-xs font-sans text-brand-muted tracking-wider">
          Showing{" "}
          <span className="font-semibold text-brand-foreground">
            {totalResults}
          </span>{" "}
          of {totalCount} garments
        </div>

        <div className="flex items-center gap-2 text-xs font-sans">
          <label htmlFor="sort-select" className="text-brand-muted hidden sm:inline">
            Sort by:
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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-sans text-brand-muted hover:text-brand-foreground underline underline-offset-4 ml-2 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "pt-4 mt-4 border-t border-brand-border/40 flex-col gap-5",
          isMobileOpen ? "flex" : "hidden md:flex"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Occasion:
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Size:
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
                  {size === "all" ? "All" : size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-brand-muted uppercase tracking-wider w-24 shrink-0">
            Colour:
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
