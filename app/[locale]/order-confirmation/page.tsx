import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { OrderConfirmationPage } from "@/views/OrderConfirmationPage";

// Şəxsi səhifələr axtarış nəticələrinə düşməsin
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Tam prerender olunur; dev-də 'instant navigation' yoxlaması bu səhifəyə tətbiq olunmur
export const instant = false;

export default async function Page({ params }: PageProps<"/[locale]/order-confirmation">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrderConfirmationPage />;
}
