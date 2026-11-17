"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export const AboutCtaSection = () => {
  const t = useTranslations("About");

  return (
    <section className="bg-[#171717] px-5 py-16 text-center text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
          {t.rich("ctaTitle", {
            em: (chunks) => (
              <span className="italic text-[#D5B47B]">{chunks}</span>
            ),
          })}
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
          {t("ctaDescription")}
        </p>

        <Link
          href="/products"
          className="mt-10 inline-flex items-center gap-3 bg-[#B08D57] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#D5B47B]"
        >
          {t("ctaButton")}
          <ArrowUpRight size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
};
