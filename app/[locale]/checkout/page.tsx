import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CheckoutPage } from "@/views/CheckoutPage";

// Şəxsi səhifələr axtarış nəticələrinə düşməsin
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckoutPage />;
}
