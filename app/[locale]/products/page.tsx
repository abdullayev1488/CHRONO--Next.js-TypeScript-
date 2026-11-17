import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/backend/services/catalogService";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, localizedUrl } from "@/lib/seo";
import { ProductsPage } from "@/views/ProductsPage";
import { ProductsPageStatic } from "@/views/ProductsPageStatic";

type Props = PageProps<"/[locale]/products">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/products",
    title: t("productsTitle"),
    description: t("productsDescription"),
  });
}

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, header] = await Promise.all([
    getProducts(),
    getTranslations({ locale, namespace: "Header" }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: header("home"), url: localizedUrl(locale as Locale, "/") },
          { name: header("collections"), url: localizedUrl(locale as Locale, "/products") },
        ])}
      />
      {/* useSearchParams (filtrlər) Suspense tələb edir; fallback HTML-də görünən tam siyahıdır */}
      <Suspense fallback={<ProductsPageStatic initialProducts={products} />}>
        <ProductsPage initialProducts={products} />
      </Suspense>
    </>
  );
}

