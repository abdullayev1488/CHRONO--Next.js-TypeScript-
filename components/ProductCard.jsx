"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/slice/cartSlice";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";
import { StarRating } from "./product/StarRating";

export const ProductCard = ({ product, showDetailsLink = false, priority = false, imageAspect = "aspect-4/5" }) => {
    const t = useTranslations("ProductCard");
    const dispatch = useDispatch();

    const { _id: id, name, category, price, oldPrice, image, badge, stock, rating } = product;

    const isSoldOut = stock === 0;

    // Məhsulun səbətdə olub-olmadığını yoxlayırıq
    const isInCart = useSelector((state) =>
        state.cart.items.some((item) => item._id === id)
    );

    //Düyməyə basanda əlavə edir və ya silir
    const handleCartToggle = () => {
        if (isInCart) {
            dispatch(removeFromCart(id));
            toast.info(t("removedToast", { name }));
        } else {
            dispatch(addToCart(product));
            toast.success(t("addedToast", { name }));
        }
    };

    return (
        <article className="group min-w-0">
            {/* Image */}
            <div className={`relative ${imageAspect} overflow-hidden bg-[#F5F1E9]`}>
                <Link href={`/products/${id}`} className="relative block h-full w-full">
                    <ProductImage
                        src={image}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        priority={priority}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {isSoldOut && (
                    <span className="absolute inset-x-0 bottom-0 bg-white/90 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171717]/70">
                        {t("soldOut")}
                    </span>
                )}

                {badge && (
                    <span className="absolute left-3 top-3 bg-[#171717] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                        {badge}
                    </span>
                )}

                {/* Sevimlilər */}
                <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <WishlistButton productId={id} name={name} />
                </div>

                <button
                    type="button"
                    aria-label={isSoldOut && !isInCart ? t("soldOutLabel", { name }) : isInCart ? t("removeLabel", { name }) : t("addLabel", { name })}
                    aria-pressed={isInCart}
                    disabled={isSoldOut && !isInCart}
                    onClick={handleCartToggle}
                    className={`absolute bottom-3 rounded-[5px] right-3 flex h-10 w-10 cursor-pointer items-center justify-center shadow-md transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${isInCart
                        ? "bg-[#B08D57] text-white"
                        : "bg-white text-[#171717]"
                        }`}
                >
                    <ShoppingBag size={18} strokeWidth={1.5} />
                </button>
            </div>

            {/* Info */}
            <div className="pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B08D57]">
                    {category}
                </p>

                <Link href={`/products/${id}`}>
                    <h3 className="mt-2 font-serif text-lg font-medium leading-snug text-[#171717] transition-colors duration-300 hover:text-[#B08D57]">
                        {name}
                    </h3>
                </Link>

                {rating?.count > 0 && (
                    <StarRating value={rating.average} count={rating.count} size={12} className="mt-2" />
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Price value={price} className="text-sm font-semibold text-[#171717]" />

                    {oldPrice && (
                        <Price value={oldPrice} className="text-xs text-[#171717]/40 line-through" />
                    )}
                </div>

                {showDetailsLink && (
                    <Link
                        href={`/products/${id}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#171717]/60 transition-colors hover:text-[#B08D57]"
                    >
                        {t("viewDetails")}
                        <ArrowUpRight size={14} strokeWidth={1.5} />
                    </Link>
                )}
            </div>
        </article>
    );
};