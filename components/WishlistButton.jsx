"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../redux/slice/wishlistSlice";

const VARIANT_STYLES = {
    // Məhsul kartının üzərində kiçik ikon düyməsi
    card: "h-9 w-9 rounded-[5px] shadow-md",
    // Məhsul səhifəsində mətnli düymə
    detail: "w-full gap-2 border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] sm:py-3.5 sm:text-xs",
};

const STATE_STYLES = {
    card: {
        saved: "bg-[#B08D57] text-white",
        idle: "bg-white text-[#171717] hover:text-[#B08D57]",
    },
    detail: {
        saved: "border-[#B08D57] bg-[#B08D57]/10 text-[#B08D57]",
        idle: "border-[#171717]/20 bg-white text-[#171717] hover:border-[#B08D57] hover:text-[#B08D57]",
    },
};

export const WishlistButton = ({ productId, name, variant = "card" }) => {
    const t = useTranslations("Wishlist");
    const dispatch = useDispatch();

    const isSaved = useSelector((state) => state.wishlist.ids.includes(productId));

    const handleToggle = () => {
        dispatch(toggleWishlist(productId));

        if (isSaved) toast.info(t("removedToast", { name }));
        else toast.success(t("addedToast", { name }));
    };

    return (
        <button
            type="button"
            aria-label={isSaved ? t("removeLabel", { name }) : t("addLabel", { name })}
            aria-pressed={isSaved}
            onClick={handleToggle}
            className={`flex cursor-pointer items-center justify-center transition-colors duration-300 ${VARIANT_STYLES[variant]} ${STATE_STYLES[variant][isSaved ? "saved" : "idle"]}`}
        >
            <Heart
                size={variant === "card" ? 17 : 16}
                strokeWidth={1.5}
                fill={isSaved ? "currentColor" : "none"}
            />

            {variant === "detail" && (isSaved ? t("saved") : t("save"))}
        </button>
    );
};
