export const filterByCategory = (product, category) => {
  return category === "all" || product.category === category;
};

export const sortPriceLow = (a, b) => {
  return a.price - b.price;
};

export const sortPriceHigh = (a, b) => {
  return b.price - a.price;
};

export const sortFeatured = (a, b) => {
  return Number(b.featured) - Number(a.featured);
};

export const sortBestseller = (a, b) => {
  return Number(b.badge === "Bestseller") - Number(a.badge === "Bestseller");
};

export const sortNew = (a, b) => {
  return Number(b.badge === "New") - Number(a.badge === "New");
};

export const sortPopular = (a, b) => {
  return Number(b.badge === "Popular") - Number(a.badge === "Popular");
};

// ---------------------------------------------------------------------------
// Siyahı filtrləri və çeşidləmə
// ---------------------------------------------------------------------------

const BADGE_SORTS = ["new", "bestseller", "popular", "sale", "exclusive"];

export const sortTopRated = (a, b) => {
  const ratingDiff = (b.rating?.average ?? 0) - (a.rating?.average ?? 0);

  return ratingDiff !== 0
    ? ratingDiff
    : (b.rating?.count ?? 0) - (a.rating?.count ?? 0);
};

const sortByBadge = (badge) => (a, b) =>
  Number(b.badge?.toLowerCase() === badge) -
  Number(a.badge?.toLowerCase() === badge);

const getComparator = (sortBy) => {
  if (sortBy === "price-low") return sortPriceLow;
  if (sortBy === "price-high") return sortPriceHigh;
  if (sortBy === "rating") return sortTopRated;
  if (BADGE_SORTS.includes(sortBy)) return sortByBadge(sortBy);

  return sortFeatured;
};

/** Yeni massiv qaytarır, ötürülən massivi dəyişmir. */
export const sortProducts = (products, sortBy) =>
  [...products].sort(getComparator(sortBy));

/** filters: { category, brands, mechanisms, minPrice, maxPrice, inStockOnly } */
export const filterProducts = (products, filters) =>
  products.filter(
    (product) =>
      filterByCategory(product, filters.category) &&
      (filters.brands.length === 0 || filters.brands.includes(product.brand)) &&
      (filters.mechanisms.length === 0 ||
        filters.mechanisms.includes(product.specs?.mechanism)) &&
      (filters.minPrice === null || product.price >= filters.minPrice) &&
      (filters.maxPrice === null || product.price <= filters.maxPrice) &&
      (!filters.inStockOnly || product.stock > 0)
  );
