import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WishlistPage } from "@/views/WishlistPage";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/wishlist">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Wishlist" });
  return { title: { absolute: t("metaTitle") }, robots: { index: false, follow: false } };
}

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: PageProps<"/[locale]/wishlist">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WishlistPage />;
}
