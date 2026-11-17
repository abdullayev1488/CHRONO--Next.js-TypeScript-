import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";
import { connectDB } from "../config/db";
import type { Badge, Category } from "../constants";
import { PRODUCTS_TAG, productTag } from "../lib/revalidate";
import { isObjectId } from "../lib/validation";
import { Product, type IProductSpecs } from "../models/product";
import { getRatingsForProducts, type RatingSummary } from "./reviewService";

/** Serverdən birbaşa oxunan məhsul: sadə (serializable) obyekt, `_id` sətirdir. */
export interface CatalogProduct {
  _id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  specs: IProductSpecs;
  badge: Badge | null;
  featured: boolean;
  stock: number;
  rating: RatingSummary;
}

const NO_RATING: RatingSummary = { average: 0, count: 0 };

const EMPTY_SPECS: IProductSpecs = {
  mechanism: null,
  caseSize: null,
  caseMaterial: null,
  strap: null,
  waterResistance: null,
  glass: null,
};

const RELATED_LIMIT = 4;

/** Stok tez dəyişir, ona görə qısa keş; dəyişiklikdə etiketlə dərhal təzələnir (revalidateCatalog). */
const CATALOG_LIFE = { stale: 60, revalidate: 300, expire: 3600 } as const;

interface ProductRow {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice?: number | null;
  image: string;
  images?: string[];
  specs?: Partial<IProductSpecs>;
  badge?: Badge | null;
  featured?: boolean;
  stock: number;
}

const toCatalogProduct = (row: ProductRow, rating: RatingSummary | undefined): CatalogProduct => ({
  _id: row._id.toString(),
  name: row.name,
  brand: row.brand,
  category: row.category,
  price: row.price,
  oldPrice: row.oldPrice ?? null,
  image: row.image,
  images: row.images ?? [],
  specs: { ...EMPTY_SPECS, ...row.specs },
  badge: row.badge ?? null,
  featured: row.featured ?? false,
  stock: row.stock,
  rating: rating ?? NO_RATING,
});

/** Sətirləri reytinqlərlə birləşdirir (bir aggregate ilə). */
const attachRatings = async (rows: ProductRow[]): Promise<CatalogProduct[]> => {
  const ratings = await getRatingsForProducts(rows.map((row) => row._id));
  return rows.map((row) => toCatalogProduct(row, ratings.get(row._id.toString())));
};

// Arxivlənmiş məhsullar ictimai kataloqda göstərilmir
const findActive = (filter: Record<string, unknown> = {}) =>
  Product.find({ archived: { $ne: true }, ...filter })
    .select("-archived -__v")
    .lean<ProductRow[]>();

/** Bütün aktiv məhsullar (GET /api/products ilə eyni sıra). */
export const getProducts = async (): Promise<CatalogProduct[]> => {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(PRODUCTS_TAG);

  await connectDB();
  return attachRatings(await findActive());
};

/** Ana səhifədəki seçilmiş məhsullar. */
export const getFeaturedProducts = async (): Promise<CatalogProduct[]> => {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(PRODUCTS_TAG);

  await connectDB();
  return attachRatings(await findActive({ featured: true }));
};

/** Tək məhsul; ID yanlışdırsa, məhsul yoxdursa və ya arxivlənibsə null. */
export const getProduct = async (id: string): Promise<CatalogProduct | null> => {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(productTag(id));

  if (!isObjectId(id)) return null;

  await connectDB();
  const [row] = await findActive({ _id: id });
  if (!row) return null;

  const [product] = await attachRatings([row]);
  return product;
};

/** Eyni kateqoriyadan digər məhsullar (ən çox 4). */
export const getRelatedProducts = async (product: {
  _id: string;
  category: Category;
}): Promise<CatalogProduct[]> => {
  "use cache";
  cacheLife(CATALOG_LIFE);
  cacheTag(PRODUCTS_TAG);

  await connectDB();
  const rows = await findActive({ category: product.category, _id: { $ne: product._id } });
  return attachRatings(rows.slice(0, RELATED_LIMIT));
};
