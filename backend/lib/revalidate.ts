import { revalidateTag } from "next/cache";

/** Bütün məhsul siyahılarını (siyahı, seçilmişlər, oxşar məhsullar, sitemap) əhatə edən etiket. */
export const PRODUCTS_TAG = "products";

/** Tək məhsulun detalı üçün etiket. */
export const productTag = (id: string): string => `product:${id}`;

/**
 * Katalog keşini köhnəlmiş sayır: stok, qiymət, rəy və ya məhsul dəyişəndə çağırılır.
 * `expire: 0` — köhnə məzmun göstərilmir, növbəti sorğu təzə məlumatı gözləyir (stok dəqiq qalır).
 * Next.js-dən kənarda (testlər) heç nə etmir: NEXT_RUNTIME yalnız Next prosesində təyin olunur.
 */
export const revalidateCatalog = (productIds: ReadonlyArray<string> = []): void => {
  if (!process.env.NEXT_RUNTIME) return;

  revalidateTag(PRODUCTS_TAG, { expire: 0 });
  for (const id of new Set(productIds)) revalidateTag(productTag(id), { expire: 0 });
};
