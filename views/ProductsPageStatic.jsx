"use client";

import { ProductsHeroSection } from "../sections/products/ProductsHeroSection";
import { ProductsGridSection } from "../sections/products/ProductsGridSection";
import { filterProducts, sortProducts } from "../utils/productUtils";
import { DEFAULT_FILTERS } from "../utils/productFilters";

/**
 * useSearchParams gözləyərkən (və axtarış motorları üçün) HTML-də görünən filtrsiz siyahı.
 * Brauzerdə hydrate olduqdan sonra URL-dəki filtrləri tətbiq edən ProductsPage ilə əvəzlənir.
 */
export const ProductsPageStatic = ({ initialProducts }) => {
  const products = sortProducts(
    filterProducts(initialProducts, DEFAULT_FILTERS),
    DEFAULT_FILTERS.sort
  );

  return (
    <>
      <ProductsHeroSection />
      <ProductsGridSection products={products} resetKey="" />
    </>
  );
};
