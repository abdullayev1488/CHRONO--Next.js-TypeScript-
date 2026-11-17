import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import type { CatalogProduct } from "@/backend/services/catalogService";

/** Saytın kanonik ünvanı (sonda slash olmadan). Production-da NEXT_PUBLIC_SITE_URL təyin edilməlidir. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export const SITE_NAME = "CHRONO";

export type JsonLdObject = Record<string, unknown>;

const PRODUCT_CURRENCY = "USD";

/** Yol ("/products") → locale prefiksli tam ünvan; "/" ana səhifədir. */
export const localizedUrl = (locale: Locale, path = "/"): string =>
  `${SITE_URL}/${locale}${path === "/" ? "" : path}`;

/** Yol və ya ünvan → mütləq ünvan (kiril və boşluqlu fayl adları kodlanır). */
export const absoluteUrl = (pathOrUrl: string): string =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${encodeURI(pathOrUrl)}`;

/** Bütün dillər üçün hreflang xəritəsi (x-default = default dil). */
export const languageAlternates = (path = "/"): Record<string, string> => ({
  ...Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(locale, path)])),
  "x-default": localizedUrl(routing.defaultLocale, path),
});

/** generateMetadata üçün: kanonik ünvan və hreflang alternativləri. */
export const buildAlternates = (locale: Locale, path = "/"): NonNullable<Metadata["alternates"]> => ({
  canonical: localizedUrl(locale, path),
  languages: languageAlternates(path),
});

const specSentences = ({ specs }: CatalogProduct): string[] => {
  const parts: string[] = [];
  if (specs.mechanism) parts.push(`${specs.mechanism} movement`);
  if (specs.caseSize) parts.push(`${specs.caseSize} mm case`);
  if (specs.caseMaterial) parts.push(`${specs.caseMaterial} case material`);
  if (specs.strap) parts.push(`${specs.strap} strap`);
  if (specs.waterResistance) parts.push(`${specs.waterResistance} m water resistance`);
  if (specs.glass) parts.push(`${specs.glass} glass`);
  return parts;
};

/** Texniki xüsusiyyətlərdən qısa təsvir (structured data dilindən asılı olmayaraq ingilis dilindədir). */
const productDescription = (product: CatalogProduct): string => {
  const base = `${product.brand} ${product.name}, ${product.category} watch`;
  const facts = specSentences(product);
  return facts.length > 0 ? `${base}. ${facts.join(", ")}.` : `${base}.`;
};

/** schema.org Product; aggregateRating yalnız rəy varsa əlavə olunur. */
export const productJsonLd = (product: CatalogProduct, locale: Locale): JsonLdObject => {
  const url = localizedUrl(locale, `/products/${product._id}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.name,
    description: productDescription(product),
    image: [product.image, ...product.images].map(absoluteUrl),
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: PRODUCT_CURRENCY,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.rating.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
      },
    }),
  };
};

export interface BreadcrumbItem {
  name: string;
  /** Mütləq ünvan (localizedUrl ilə yaradın) */
  url: string;
}

export const breadcrumbJsonLd = (items: BreadcrumbItem[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const organizationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/favicon.png"),
});

export const websiteJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: [...routing.locales],
});
