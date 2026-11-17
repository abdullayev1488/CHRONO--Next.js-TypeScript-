"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "../../components/ProductCard";

// related: serverdən gələn eyni kateqoriyalı məhsullar
export const RelatedProductsSection = ({ related = [] }) => {
    const t = useTranslations("RelatedProducts");
    const relatedProducts = related;

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="bg-white px-3 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                            {t("eyebrow")}
                        </p>

                        <h2 className="mt-3 font-serif text-2xl text-[#171717] sm:text-4xl">
                            {t("title")}
                        </h2>
                    </div>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#171717] hover:text-[#B08D57]"
                    >
                        {t("viewAll")}
                        <ArrowUpRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {relatedProducts.map((item) => (
                        <ProductCard key={item._id} product={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};
