"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export const AboutStorySection = () => {
  const t = useTranslations("About");

  return (
    <section className="overflow-hidden bg-[#F5F1E9]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center lg:grid-cols-2">
        {/* Image */}
        <div className="relative min-h-[380px] overflow-hidden sm:min-h-[480px] lg:min-h-[600px]">
          <Image
            src="https://images.unsplash.com/photo-1495856458515-0637185db551?auto=format&fit=crop&w=1200&q=85"
            alt={t("storyImageAlt")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#B08D57]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
              {t("storyLabel")}
            </span>
          </div>

          <h2 className="max-w-xl font-serif text-4xl leading-tight text-[#171717] sm:text-5xl">
            {t("storyTitle1")}
            <span className="block italic text-[#B08D57]">
              {t("storyTitle2")}
            </span>
          </h2>

          <p className="mt-8 max-w-lg text-sm leading-8 text-[#171717]/65 sm:text-base">
            {t("storyP1")}
          </p>

          <p className="mt-5 max-w-lg text-sm leading-8 text-[#171717]/65 sm:text-base">
            {t("storyP2")}
          </p>

          <p className="mt-5 max-w-lg text-sm leading-8 text-[#171717]/65 sm:text-base">
            {t("storyP3")}
          </p>
        </div>
      </div>
    </section>
  );
};
