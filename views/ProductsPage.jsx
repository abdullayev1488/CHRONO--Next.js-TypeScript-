"use client";

import { useTranslations } from "next-intl";
import { useProducts } from "../hooks/useProducts.js";
import { useProductFilters } from "../hooks/useProductFilters.js";

import { ProductsHeroSection } from "../sections/products/ProductsHeroSection";
import { ProductsFilterSection } from "../sections/products/ProductsFilterSection";
import { ProductsGridSection } from "../sections/products/ProductsGridSection";

const EMPTY_PRODUCTS = [];

export const ProductsPage = ({ initialProducts }) => {
  const t = useTranslations("ProductsPage");

  // TanStack Query
  const { data, isLoading, error } = useProducts(initialProducts);
  const products = data ?? EMPTY_PRODUCTS;

  // Filtrlər URL-də saxlanılır: /products?brand=ROLEX&sort=price-low
  const {
    filters,
    options,
    products: visibleProducts,
    activeCount,
    update,
    clear,
    resetKey,
  } = useProductFilters(products);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm uppercase tracking-[0.2em] text-[#B08D57]">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm text-red-600">
          {t("error")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ProductsHeroSection />

      <ProductsFilterSection
        filters={filters}
        options={options}
        activeCount={activeCount}
        onFiltersChange={update}
        onClearFilters={clear}
        productCount={visibleProducts.length}
      />

      <ProductsGridSection products={visibleProducts} resetKey={resetKey} />
    </>
  );
};
