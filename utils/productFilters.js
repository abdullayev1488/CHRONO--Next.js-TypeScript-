// Məhsul filtrlərinin URL query string ilə çevrilməsi (paylaşıla bilən linklər üçün)

export const DEFAULT_FILTERS = {
  category: "all",
  sort: "featured",
  brands: [],
  mechanisms: [],
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
};

const parseList = (value) =>
  value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

const parsePrice = (value) => {
  if (value === null || value === "") return null;

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : null;
};

export const parseFilters = (searchParams) => ({
  category: searchParams.get("category") || DEFAULT_FILTERS.category,
  sort: searchParams.get("sort") || DEFAULT_FILTERS.sort,
  brands: parseList(searchParams.get("brand")),
  mechanisms: parseList(searchParams.get("mechanism")),
  minPrice: parsePrice(searchParams.get("min")),
  maxPrice: parsePrice(searchParams.get("max")),
  inStockOnly: searchParams.get("stock") === "1",
});

/** Yalnız standartdan fərqli dəyərlər query string-ə yazılır. */
export const serializeFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.category !== DEFAULT_FILTERS.category) params.set("category", filters.category);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.brands.length > 0) params.set("brand", filters.brands.join(","));
  if (filters.mechanisms.length > 0) params.set("mechanism", filters.mechanisms.join(","));
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("stock", "1");

  return params.toString();
};

/** Kateqoriya və çeşiddən başqa aktiv filtrlərin sayı. */
export const countActiveFilters = (filters) =>
  filters.brands.length +
  filters.mechanisms.length +
  Number(filters.minPrice !== null) +
  Number(filters.maxPrice !== null) +
  Number(filters.inStockOnly);
