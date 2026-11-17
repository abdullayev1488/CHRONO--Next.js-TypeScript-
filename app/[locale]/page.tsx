import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFeaturedProducts } from "@/backend/services/catalogService";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { HomePage } from "@/views/HomePage";

type Props = PageProps<"/[locale]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/",
    title: { absolute: t("title") },
    description: t("description"),
  });
}

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const featured = await getFeaturedProducts();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <HomePage featured={featured} />
    </>
  );
}
