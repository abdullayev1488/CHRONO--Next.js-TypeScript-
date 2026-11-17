import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/backend/services/catalogService";
import { languageAlternates, localizedUrl } from "@/lib/seo";

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
];

/** Hər yol üçün bütün dillərdə bir sətir; hər biri digər dillərə hreflang ilə bağlıdır. */
const entriesFor = (
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap =>
  routing.locales.map((locale) => ({
    url: localizedUrl(locale, path),
    changeFrequency,
    priority,
    alternates: { languages: languageAlternates(path) },
  }));

// Məhsulların modelində dəyişiklik tarixi saxlanmadığı üçün lastModified yazılmır
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    ...STATIC_PAGES.flatMap(({ path, changeFrequency, priority }) =>
      entriesFor(path, changeFrequency, priority)
    ),
    ...products.flatMap((product) => entriesFor(`/products/${product._id}`, "weekly", 0.8)),
  ];
}
