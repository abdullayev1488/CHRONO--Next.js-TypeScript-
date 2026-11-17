"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { filterProducts, sortProducts } from "../utils/productUtils";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  parseFilters,
  serializeFilters,
} from "../utils/productFilters";

const unique = (values) => [...new Set(values.filter(Boolean))];

// Filtr seçimləri data-dan çıxarılır: yalnız mövcud marka və mexanizmlər göstərilir
const getOptions = (products) => {
  const prices = products.map((product) => product.price);

  return {
    brands: unique(products.map((product) => product.brand)).sort(),
    mechanisms: unique(products.map((product) => product.specs?.mechanism)).sort(),
    priceBounds: {
      min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 0,
    },
  };
};

/** Filtr vəziyyəti URL query string-də saxlanılır (paylaşıla bilən və geri düyməsi ilə uyğun). */
export const useProductFilters = (products) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryString = searchParams.toString();
  const filters = useMemo(() => parseFilters(new URLSearchParams(queryString)), [queryString]);

  const options = useMemo(() => getOptions(products), [products]);

  const visibleProducts = useMemo(
    () => sortProducts(filterProducts(products, filters), filters.sort),
    [products, filters]
  );

  const replaceFilters = useCallback(
    (next) => {
      const query = serializeFilters(next);

      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const update = useCallback(
    (patch) => replaceFilters({ ...filters, ...patch }),
    [filters, replaceFilters]
  );

  // Çeşid saxlanılır, kateqoriya və digər filtrlər sıfırlanır
  const clear = useCallback(
    () => replaceFilters({ ...DEFAULT_FILTERS, sort: filters.sort }),
    [filters.sort, replaceFilters]
  );

  return {
    filters,
    options,
    products: visibleProducts,
    activeCount: countActiveFilters(filters),
    update,
    clear,
    resetKey: queryString,
  };
};
