"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
    ArrowLeft,
    ShoppingBag,
    Truck,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";

import { toast } from "sonner";
import { addToCart } from "../../redux/slice/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { ProductGallery } from "../../components/product/ProductGallery";
import { RatingSummary } from "../../components/product/RatingSummary";
import { Price } from "../../components/Price";
import { WishlistButton } from "../../components/WishlistButton";

const translateOr = (t, group, value) =>
    t.has(`${group}.${value}`) ? t(`${group}.${value}`) : value;

export const ProductDetailsSection = ({ product }) => {
    const t = useTranslations("ProductDetails");

    const dispatch = useDispatch();

    const isInCart = useSelector((state) =>
        state.cart.items.some((item) => item._id === product._id)
    );

    const isSoldOut = product.stock === 0;

    const handleAddToCart = () => {
        dispatch(addToCart(product));
        toast.success(t("addedToCart", { name: product.name }));
    };

    return (
        <section className="w-full overflow-x-hidden bg-[#FAF8F4] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-6xl">

                {/* Back Link */}
                <Link
                    href="/products"
                    className="mb-4 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#171717]/60 hover:text-[#B08D57] sm:mb-6 sm:text-xs"
                >
                    <ArrowLeft size={14} />
                    {t("back")}
                </Link>

                <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-12">

                    {/* Product Image - yeni */}
                    <ProductGallery
                        key={product._id}
                        images={[product.image, ...(product.images ?? [])]}
                        alt={product.name}
                    >
                        {product.badge && (
                            <span className="absolute left-3 top-3 bg-[#171717] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                                {translateOr(t, "badges", product.badge)}
                            </span>
                        )}
                    </ProductGallery>

                    {/* Product Information */}
                    <div className="flex min-w-0 flex-col">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57] sm:text-xs">
                            {product.brand} / {translateOr(t, "categories", product.category)}
                        </p>

                        <h1 className="mt-2 break-words font-serif text-2xl font-medium leading-tight text-[#171717] sm:mt-4 sm:text-4xl lg:text-5xl">
                            {product.name}
                        </h1>

                        <RatingSummary rating={product.rating} />

                        {/* Price */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-5">
                            <Price value={product.price} className="text-xl font-semibold text-[#171717] sm:text-2xl" />

                            {product.oldPrice && (
                                <Price value={product.oldPrice} className="text-sm text-[#171717]/40 line-through sm:text-lg" />
                            )}
                        </div>

                        <div className="my-4 h-px w-full bg-[#171717]/10 sm:my-6" />

                        {/* Description */}
                        <p className="text-xs leading-5 text-[#171717]/60 sm:text-sm sm:leading-7">
                            {t("description")}
                        </p>

                        {/* Product Specifications */}
                        <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                            <div className="flex items-center justify-between gap-3 border-b border-[#171717]/10 pb-2 text-xs sm:pb-3 sm:text-sm">
                                <span className="text-[#171717]/50">
                                    {t("brand")}
                                </span>
                                <span className="text-right font-medium text-[#171717]">
                                    {product.brand}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-b border-[#171717]/10 pb-2 text-xs sm:pb-3 sm:text-sm">
                                <span className="text-[#171717]/50">
                                    {t("collection")}
                                </span>
                                <span className="text-right font-medium text-[#171717]">
                                    {translateOr(t, "categories", product.category)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-b border-[#171717]/10 pb-2 text-xs sm:pb-3 sm:text-sm">
                                <span className="text-[#171717]/50">
                                    {t("reference")}
                                </span>
                                <span className="text-right font-medium text-[#171717]">
                                    CH-{product._id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        {isInCart ? (
                            <Link
                                href="/cart"
                                className="mt-5 flex w-full items-center justify-center gap-2 bg-[#B08D57] px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#171717] sm:mt-7 sm:py-4 sm:text-xs"
                            >
                                <ShoppingBag size={16} strokeWidth={1.5} />
                                {t("inCart")}
                            </Link>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                type="button"
                                disabled={isSoldOut}
                                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 bg-[#171717] px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#171717] sm:mt-7 sm:py-4 sm:text-xs"
                            >
                                <ShoppingBag size={16} strokeWidth={1.5} />
                                {isSoldOut ? t("soldOut") : t("addToCart")}
                            </button>
                        )}

                        {/* Wishlist */}
                        <div className="mt-3">
                            <WishlistButton productId={product._id} name={product.name} variant="detail" />
                        </div>

                        {!isSoldOut && product.stock <= 3 && (
                            <p className="mt-3 text-center text-[11px] text-[#B45342]">
                                {t("onlyLeft", { count: product.stock })}
                            </p>
                        )}

                        {/* Benefits */}
                        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#171717]/10 pt-4 sm:mt-7 sm:gap-3 sm:pt-6">
                            <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                                <Truck size={19} strokeWidth={1.3} />
                                <span className="text-[9px] uppercase leading-4 tracking-normal text-[#171717]/60 sm:text-[10px]">
                                    {t("delivery")}
                                </span>
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                                <ShieldCheck size={19} strokeWidth={1.3} />
                                <span className="text-[9px] uppercase leading-4 tracking-normal text-[#171717]/60 sm:text-[10px]">
                                    {t("secure")}
                                </span>
                            </div>

                            <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                                <RotateCcw size={19} strokeWidth={1.3} />
                                <span className="text-[9px] uppercase leading-4 tracking-normal text-[#171717]/60 sm:text-[10px]">
                                    {t("returns")}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};
