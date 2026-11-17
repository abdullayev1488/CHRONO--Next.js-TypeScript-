"use client";


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export const HeroSection = () => {
  const t = useTranslations("Hero");

  return (
    <section className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-[#171717] text-white sm:min-h-[680px] lg:min-h-[760px]">

      {/* Background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=2000&q=85')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#111111]/95 via-[#111111]/75 to-[#111111]/35" />

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
        <div className="max-w-2xl">

          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-[#D5B47B]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D5B47B] sm:text-xs">
              {t("eyebrow")}
            </span>
          </div>

          <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            {t("title1")}
            <span className="block italic text-[#D5B47B]">
              {t("title2")}
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
            {t("text")}
          </p>

          <Link
            href="/products"
            className="mt-10 inline-flex items-center justify-center gap-3 border border-[#B08D57] bg-[#B08D57] px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#171717] transition-all duration-300 hover:border-[#D5B47B] hover:bg-[#D5B47B] sm:px-9"
          >
            {t("cta")}
            <ArrowUpRight size={17} strokeWidth={1.7} />
          </Link>

          <div className="mt-16 flex items-center gap-4 sm:mt-20">
            <span className="font-serif text-3xl text-[#D5B47B]">
              01
            </span>

            <span className="h-px w-12 bg-white/40" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
              {t("tag")}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
