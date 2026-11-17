"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Rəylər səhifənin aşağısındadır: ayrıca chunk kimi yüklənir
const ProductReviews = dynamic(
  () => import("../../components/product/ProductReviews").then((module) => module.ProductReviews),
  { ssr: false }
);

export const ProductReviewsSection = ({ product }) => {
  const t = useTranslations("ProductReviews");

  return (
    <section
      id="reviews"
      className="scroll-mt-32 border-t border-[#B08D57]/15 bg-[#FAF8F4] px-3 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
          {t("eyebrow")}
        </p>

        <h2 className="mb-8 mt-2 font-serif text-2xl text-[#171717] sm:text-3xl">
          {t("title")}
        </h2>

        {/* ssr:false chunk yalnız brauzerdə qurulur; öz Suspense sərhədi lazımdır */}
        <Suspense fallback={null}>
          <ProductReviews productId={product._id} />
        </Suspense>
      </div>
    </section>
  );
};
