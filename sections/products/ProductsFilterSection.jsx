"use client";


import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { categories } from "../../data/categories";
import {
  ActiveFilterChips,
  ProductFilterPanel,
} from "../../components/product/ProductFilterPanel";

const sortValues = [
  "featured",
  "bestseller",
  "new",
  "popular",
  "sale",
  "exclusive",
  "rating",
  "price-low",
  "price-high",
];

export const ProductsFilterSection = ({
  filters,
  options,
  activeCount,
  onFiltersChange,
  onClearFilters,
  productCount,
}) => {
  const t = useTranslations("ProductsFilter");
  const tFilters = useTranslations("ProductFilters");
  const { category: selectedCategory, sort: sortBy } = filters;
  const onCategoryChange = (category) => onFiltersChange({ category });
  const onSortChange = (sort) => onFiltersChange({ sort });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const hasActiveFilters = activeCount > 0 || selectedCategory !== "all";
  const sortOptions = sortValues.map((value) => ({
    value,
    label: t(`sort.${value}`),
  }));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedOption =
    sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      const selectedIndex = sortOptions.findIndex(
        (option) => option.value === sortBy
      );

      const index = selectedIndex < 0 ? 0 : selectedIndex;

      setIsOpen(true);

      requestAnimationFrame(() => {
        optionRefs.current[index]?.focus();
      });
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === "Escape" || event.key === "Tab") {
      setIsOpen(false);

      if (event.key === "Escape") {
        event.preventDefault();
        triggerRef.current?.focus();
      }
    }

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      const direction = event.key === "ArrowDown" ? 1 : -1;

      const nextIndex =
        (index + direction + sortOptions.length) % sortOptions.length;

      optionRefs.current[nextIndex]?.focus();
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();

      const nextIndex =
        event.key === "Home" ? 0 : sortOptions.length - 1;

      optionRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section className="border-b border-[#B08D57]/15 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">

        {/* Heading */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("eyebrow")}
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#171717] sm:text-3xl">
              {t("title")}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[#171717]/60">
            <SlidersHorizontal size={16} strokeWidth={1.5} />

            <span className="text-xs uppercase tracking-wider">
              {t("filterSort")}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.value)}
                aria-pressed={selectedCategory === category.value}
                className={`inline-flex min-h-10 cursor-pointer items-center justify-center border px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors sm:px-5 ${selectedCategory === category.value
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#171717]/15 text-[#171717]/70 hover:border-[#B08D57] hover:text-[#B08D57]"
                  }`}
              >
                {t(`categories.${category.value}`)}
              </button>
            ))}
          </div>

          {/* Count and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-start">
            <p className="text-xs text-[#171717]/50">
              {t("showing", { count: productCount })}
            </p>

            {/* Premium Custom Dropdown */}
            <div
              ref={dropdownRef}
              className="relative z-20 w-[230px] max-w-full"
            >
              <button
                ref={triggerRef}
                type="button"
                aria-label={t("sortLabel")}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={isOpen ? "product-sort-menu" : undefined}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleTriggerKeyDown}
                className={`group flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border bg-white px-4 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57] ${isOpen
                    ? "border-[#B08D57] shadow-[0_4px_20px_rgba(176,141,87,0.12)]"
                    : "border-[#171717]/15 hover:border-[#B08D57]"
                  }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-[11px] text-[#171717]/45">
                    {t("sortBy")}
                  </span>

                  <span className="truncate text-xs font-medium text-[#171717]">
                    {selectedOption.label}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={`shrink-0 text-[#B08D57] transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isOpen && (
                <div
                  id="product-sort-menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[230px] overflow-hidden border border-[#B08D57]/25 bg-white py-2 shadow-[0_15px_45px_rgba(0,0,0,0.14)]"
                >
                  <p className="border-b border-[#171717]/10 px-4 pb-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B08D57]">
                    {t("sortCollection")}
                  </p>

                  <div className="py-1">
                    {sortOptions.map((option, index) => (
                      <button
                        key={option.value}
                        ref={(element) => {
                          optionRefs.current[index] = element;
                        }}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        onKeyDown={(event) =>
                          handleOptionKeyDown(event, index)
                        }
                        aria-current={
                          sortBy === option.value ? "true" : undefined
                        }
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-xs transition-all duration-200 focus-visible:bg-[#B08D57]/10 focus-visible:outline-none ${sortBy === option.value
                            ? "bg-[#B08D57]/10 font-semibold text-[#B08D57]"
                            : "text-[#171717]/75 hover:bg-[#F8F5EF] hover:text-[#B08D57]"
                          }`}
                      >
                        <span>{option.label}</span>

                        {sortBy === option.value && (
                          <Check
                            size={15}
                            strokeWidth={1.8}
                            className="shrink-0 text-[#B08D57]"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mx-4 mt-1 h-px bg-[#B08D57]/20" />

                  <p className="px-4 pb-1 pt-3 text-[9px] uppercase tracking-[0.15em] text-[#171717]/35">
                    {t("curated")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional filters */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsPanelOpen((previous) => !previous)}
            aria-expanded={isPanelOpen}
            aria-controls="product-filter-panel"
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-[#171717]/15 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#171717]/70 transition-colors hover:border-[#B08D57] hover:text-[#B08D57]"
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} />
            {tFilters("toggle")}
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center bg-[#B08D57] px-1 text-[10px] text-white">
                {activeCount}
              </span>
            )}
          </button>

          {isPanelOpen && (
            <div id="product-filter-panel" className="mt-5">
              <ProductFilterPanel
                filters={filters}
                options={options}
                onChange={onFiltersChange}
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-5">
              <ActiveFilterChips
                filters={filters}
                onChange={onFiltersChange}
                onClear={onClearFilters}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
