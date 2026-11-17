"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export const BrandStorySection = () => {
  const t = useTranslations("BrandStory");

  return (
    <section className="overflow-hidden bg-[#F5F1E9]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center lg:grid-cols-2">

        {/* Left - Image */}
        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[680px]">
          <Image
            src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85"
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />

          <div className="absolute bottom-6 left-6 border border-white/30 bg-[#171717]/85 px-6 py-5 backdrop-blur-sm sm:bottom-10 sm:left-10">
            <span className="block font-serif text-3xl text-[#D5B47B]">
              CHRONO
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-white/80">
              {t("slogan")}
            </span>
          </div>
        </div>

        {/* Right - Content */}
        <div className="px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#B08D57]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
              {t("eyebrow")}
            </span>
          </div>

          <h2 className="max-w-xl font-serif text-4xl leading-tight text-[#171717] sm:text-5xl lg:text-6xl">
            {t("title1")}
            <span className="block italic text-[#B08D57]">
              {t("title2")}
            </span>
          </h2>

          <p className="mt-8 max-w-lg text-sm leading-8 text-[#171717]/65 sm:text-base">
            {t("p1")}
          </p>

          <p className="mt-5 max-w-lg text-sm leading-8 text-[#171717]/65 sm:text-base">
            {t("p2")}
          </p>

          <div className="mt-10 h-px max-w-lg bg-[#B08D57]/25" />

          <div className="mt-8 flex flex-wrap gap-10">
            <div>
              <span className="font-serif text-3xl text-[#171717]">
                {t("stat1Title")}
              </span>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#B08D57]">
                {t("stat1Label")}
              </p>
            </div>

            <div>
              <span className="font-serif text-3xl text-[#171717]">
                {t("stat2Title")}
              </span>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#B08D57]">
                {t("stat2Label")}
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="mt-12 inline-flex items-center gap-3 border-b border-[#B08D57] pb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#171717] transition-colors duration-300 hover:text-[#B08D57]"
          >
            {t("cta")}
            <ArrowUpRight size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
};
