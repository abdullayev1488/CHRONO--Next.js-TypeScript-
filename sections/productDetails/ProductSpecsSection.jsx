"use client";

import { useTranslations } from "next-intl";
import { ProductSpecs, hasSpecs } from "../../components/product/ProductSpecs";

export const ProductSpecsSection = ({ product }) => {
  const t = useTranslations("ProductSpecs");

  if (!hasSpecs(product.specs)) return null;

  return (
    <section className="bg-white px-3 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
          {t("eyebrow")}
        </p>

        <h2 className="mb-6 mt-2 font-serif text-2xl text-[#171717] sm:text-3xl">
          {t("title")}
        </h2>

        <ProductSpecs specs={product.specs} />
      </div>
    </section>
  );
};
