import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { OG_LOCALES } from "@/lib/metadata";
import { getCurrentYear } from "@/lib/year";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const ogLocale = OG_LOCALES[locale as keyof typeof OG_LOCALES];

  // canonical/hreflang hər səhifənin öz generateMetadata-sında verilir
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${SITE_NAME}` },
    description: t("description"),
    applicationName: SITE_NAME,
    icons: { icon: "/favicon.png" },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale: Object.values(OG_LOCALES).filter((value) => value !== ogLocale),
      title: t("title"),
      description: t("description"),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const year = await getCurrentYear();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <Suspense>
              <ScrollToTop />
            </Suspense>
            <Suspense>
              <Header />
            </Suspense>
            <main>{children}</main>
            <Footer year={year} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
