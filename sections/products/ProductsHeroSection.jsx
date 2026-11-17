"use client";


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

export const ProductsHeroSection = () => {
  const t = useTranslations("ProductsHero");

  return (
    <section className="relative isolate flex min-h-[300px] items-center overflow-hidden bg-[#171717] text-white sm:min-h-[360px] lg:min-h-[420px]">

      {/* Background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1800&q=85')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#171717]/95 via-[#171717]/85 to-[#171717]/55" />

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-2xl">

          {/* Breadcrumb */}
          <nav
            aria-label={t("breadcrumb")}
            className="mb-7 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em]"
          >
            <Link
              href="/"
              className="text-white/60 transition-colors hover:text-[#D5B47B]"
            >
              {t("home")}
            </Link>

            <ChevronRight
              size={14}
              className="text-[#B08D57]"
            />

            <span className="text-[#D5B47B]">
              {t("collections")}
            </span>
          </nav>

          {/* Label */}
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#D5B47B]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D5B47B] sm:text-xs">
              {t("label")}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t.rich("title", {
              em: (chunks) => (
                <span className="italic text-[#D5B47B]">{chunks}</span>
              ),
            })}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
            {t("description")}
          </p>

        </div>
      </div>
    </section>
  );
};
