"use client";


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

// featured: serverdən gələn seçilmiş məhsullar (HTML-də hazır olur, SEO üçün)
export const FeaturedCollection = ({ featured = [] }) => {
  const t = useTranslations("FeaturedCollection");

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-[#B08D57]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
                {t("eyebrow")}
              </span>
            </div>

            <h2 className="font-serif text-4xl font-medium tracking-tight text-[#171717] sm:text-5xl">
              {t("title1")} <span className="italic text-[#B08D57]">{t("title2")}</span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#171717]/55">
              {t("text")}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex w-fit items-center gap-2 border-b border-[#B08D57] pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#171717] transition-colors hover:text-[#B08D57]"
          >
            {t("viewAll")}
            <ArrowUpRight size={17} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 flex justify-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 border border-[#B08D57] px-7 py-4 text-xs font-semibold uppercase tracking-widest text-[#171717] transition-colors hover:bg-[#B08D57] hover:text-white"
          >
            {t("exploreAll")}
            <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
};
