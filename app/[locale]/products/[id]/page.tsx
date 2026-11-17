import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getProduct,
  getProducts,
  getRelatedProducts,
} from "@/backend/services/catalogService";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, localizedUrl, productJsonLd } from "@/lib/seo";
import { ProductDetailsPage } from "@/views/ProductDetailsPage";

type Props = PageProps<"/[locale]/products/[id]">;

// Cache Components ən azı bir param tələb edir; məhsul yoxdursa mövcud olmayan ID ilə 404 shell qurulur
const PLACEHOLDER_ID = "000000000000000000000000";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.length > 0 ? products.map(({ _id }) => ({ id: _id })) : [{ id: PLACEHOLDER_ID }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "404", robots: { index: false } };

  const [meta, details] = await Promise.all([
    getTranslations({ locale, namespace: "Meta" }),
    getTranslations({ locale, namespace: "ProductDetails" }),
  ]);
  const categoryKey = `categories.${product.category}`;

  return buildPageMetadata({
    locale: locale as Locale,
    path: `/products/${product._id}`,
    title: meta("productTitle", { name: product.name, brand: product.brand }),
    description: meta("productDescription", {
      name: product.name,
      brand: product.brand,
      category: details.has(categoryKey) ? details(categoryKey) : product.category,
      price: `$${product.price.toLocaleString("en-US")}`,
    }),
    image: product.image,
  });
}

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const product = await getProduct(id);
  if (!product) notFound();

  const [related, header] = await Promise.all([
    getRelatedProducts(product),
    getTranslations({ locale, namespace: "Header" }),
  ]);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, locale as Locale),
          breadcrumbJsonLd([
            { name: header("home"), url: localizedUrl(locale as Locale, "/") },
            { name: header("collections"), url: localizedUrl(locale as Locale, "/products") },
            { name: product.name, url: localizedUrl(locale as Locale, `/products/${product._id}`) },
          ]),
        ]}
      />
      <ProductDetailsPage initialProduct={product} initialRelated={related} />
    </>
  );
}

