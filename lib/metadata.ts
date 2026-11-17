import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, localizedUrl, SITE_NAME, buildAlternates } from "@/lib/seo";

/** next-intl locale → Open Graph locale. */
export const OG_LOCALES: Record<Locale, string> = {
  az: "az_AZ",
  en: "en_US",
  ru: "ru_RU",
};

interface PageMetaInput {
  locale: Locale;
  path: string;
  title?: Metadata["title"];
  description?: string;
  /** Mütləq və ya saytdaxili şəkil ünvanı */
  image?: string;
}

/** Səhifə metadata-sı: canonical + hreflang + Open Graph/Twitter ortaq qaydada qurulur. */
export const buildPageMetadata = ({
  locale,
  path,
  title,
  description,
  image,
}: PageMetaInput): Metadata => {
  const images = image ? [{ url: absoluteUrl(image) }] : undefined;

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: localizedUrl(locale, path),
      locale: OG_LOCALES[locale],
      alternateLocale: Object.values(OG_LOCALES).filter((value) => value !== OG_LOCALES[locale]),
      title: typeof title === "string" ? title : undefined,
      description,
      images,
    },
    twitter: { card: "summary_large_image", images: images?.map((item) => item.url) },
  };
};
