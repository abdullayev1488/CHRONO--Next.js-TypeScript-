"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearWishlist } from "../redux/slice/wishlistSlice";
import { useProducts } from "../hooks/useProducts.js";
import { useMounted } from "../hooks/useMounted.js";
import { ProductCard } from "../components/ProductCard";

export const WishlistPage = () => {
  const t = useTranslations("Wishlist");
  const dispatch = useDispatch();
  const mounted = useMounted();
  const ids = useSelector((state) => state.wishlist.ids);
  const { data: products = [], isLoading, error } = useProducts();

  // Artıq mövcud olmayan məhsulların ID-ləri nəzərə alınmır
  const savedProducts = useMemo(
    () =>
      ids
        .map((id) => products.find((product) => product._id === id))
        .filter(Boolean),
    [ids, products]
  );

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm uppercase tracking-[0.2em] text-[#B08D57]">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm text-red-600">{t("error")}</p>
      </div>
    );
  }

  return (
    <section className="min-h-[70vh] bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#E8E2D8] pb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
              {t("eyebrow")}
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#171717] sm:text-5xl">
              {t("title")}
            </h1>

            {savedProducts.length > 0 && (
              <p className="mt-3 text-sm text-[#171717]/55">
                {t("count", { count: savedProducts.length })}
              </p>
            )}
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearWishlist())}
              className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/60 transition-colors hover:text-[#B08D57]"
            >
              {t("clearAll")}
            </button>
          )}
        </div>

        {savedProducts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Heart size={44} strokeWidth={1.2} className="text-[#B08D57]" />

            <h2 className="mt-6 font-serif text-2xl text-[#171717]">
              {t("emptyTitle")}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#171717]/55">
              {t("emptyText")}
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center justify-center bg-[#171717] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57]"
            >
              {t("browse")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <ProductCard key={product._id} product={product} showDetailsLink />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
