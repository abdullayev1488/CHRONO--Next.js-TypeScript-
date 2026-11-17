"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProduct } from "../hooks/useProduct.js";
import { ProductDetailsSection } from "../sections/productDetails/ProductDetailsSection";
import { ProductSpecsSection } from "../sections/productDetails/ProductSpecsSection";
import { ProductReviewsSection } from "../sections/productDetails/ProductReviewsSection";
import { RelatedProductsSection } from "../sections/productDetails/RelatedProductsSection";

const MessageScreen = ({ title, text }) => {
  const t = useTranslations("ProductDetailsPage");

  return (
  <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FAF8F4] px-6 text-center">
    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
      {t("eyebrow")}
    </span>

    <h1 className="mt-5 font-serif text-4xl text-[#171717] sm:text-5xl">
      {title}
    </h1>

    <p className="mt-5 max-w-md text-sm leading-7 text-[#171717]/60">
      {text}
    </p>

    <Link
      href="/products"
      className="mt-8 inline-flex items-center justify-center bg-[#171717] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57]"
    >
      {t("back")}
    </Link>
  </section>
  );
};

export const ProductDetailsPage = ({ initialProduct, initialRelated }) => {
  const t = useTranslations("ProductDetailsPage");
  const { data: product, isLoading, error } = useProduct(initialProduct._id, initialProduct);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF8F4]">
        <p className="text-sm uppercase tracking-[0.2em] text-[#B08D57]">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error) {
    const status = error.response?.status;
    const isNotFound = status === 404 || status === 400;

    return (
      <MessageScreen
        title={isNotFound ? t("notFoundTitle") : t("errorTitle")}
        text={
          isNotFound
            ? t("notFoundText")
            : t("errorText")
        }
      />
    );
  }

  return (
    <>
      <ProductDetailsSection product={product} />
      <ProductSpecsSection product={product} />
      <ProductReviewsSection product={product} />
      <RelatedProductsSection related={initialRelated} />
    </>
  );
};
