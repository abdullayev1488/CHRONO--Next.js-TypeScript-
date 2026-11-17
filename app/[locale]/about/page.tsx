import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { AboutPage } from "@/views/AboutPage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/about",
    title: { absolute: t("metaTitle") },
    description: t("heroDescription"),
  });
}

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutPage />;
}
