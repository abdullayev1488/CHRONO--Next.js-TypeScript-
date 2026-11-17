"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

// 4 sütun x 2 sıra: ekranda 8 kart görünür, hər dəfə 8 yeni kart əlavə olunur
const PAGE_SIZE = 8;

export const ProductsGridSection = ({ products, resetKey }) => {
  const t = useTranslations("ProductsGrid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filtr və ya çeşid dəyişəndə (resetKey) göstərilən say ilkin qiymətə qayıdır
  const [previousResetKey, setPreviousResetKey] = useState(resetKey);

  if (previousResetKey !== resetKey) {
    setPreviousResetKey(resetKey);
    setVisibleCount(PAGE_SIZE);
  }

  const displayedCount = Math.min(visibleCount, products.length);

  return (
    <section className="bg-white px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Products Grid */}
        {/* 4-3-2-1 responsive */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showDetailsLink
              imageAspect="aspect-square"
            />
          ))}
        </div>

        {/* Load More */}
        {visibleCount < products.length && (
          <div className="mt-20 flex flex-col items-center gap-5">

            <p className="text-center text-xs font-medium tracking-[0.12em] text-[#171717]/50">
              {t("showingOf", { shown: displayedCount, total: products.length })}
            </p>

            <div className="h-[2px] w-48 overflow-hidden bg-[#E8E2D8]">
              <div
                className="h-full bg-[#B08D57] transition-all duration-500"
                style={{
                  width: `${(displayedCount / products.length) * 100}%`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.min(prev + PAGE_SIZE, products.length)
                )
              }
              className="group/btn mt-3 inline-flex min-w-[220px] cursor-pointer items-center justify-center gap-4 border border-[#171717] bg-[#171717] px-9 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:border-[#B08D57] hover:bg-[#B08D57] hover:shadow-[0_10px_30px_rgba(176,141,87,0.22)]"
            >
              {t("loadMore")}
              <Plus
                size={17}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover/btn:rotate-90"
              />
            </button>
          </div>
        )}

        {/* All Products Loaded */}
        {products.length > 0 && visibleCount >= products.length && (
          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="h-px w-20 bg-[#B08D57]" />

            <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-[#171717]/50">
              {t("allLoaded")}
            </p>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="font-serif text-2xl text-[#171717]">
              {t("emptyTitle")}
            </h3>

            <p className="mt-3 text-sm text-[#171717]/50">
              {t("emptyText")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};