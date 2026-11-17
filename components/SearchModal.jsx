"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useProducts } from "../hooks/useProducts.js";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";

export const SearchModal = ({ isOpen, onClose }) => {
    const { data: products = [] } = useProducts();
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    const modalRef = useRef(null); //yeni
    const router = useRouter();
    const t = useTranslations("SearchModal");
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    const searchTerm = query.trim().toLowerCase();

    const filteredProducts = searchTerm
        ? products.filter((product) =>
            [product.name, product.category, product.brand].some((value) =>
                value?.toLowerCase().includes(searchTerm)
            )
        )
        : [];

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;

        document.body.style.overflow = "hidden";
        inputRef.current?.focus();

        //yeni - Escape və Tab idarəsi
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }

            if (event.key === "Tab") {
                const modal = modalRef.current;

                if (!modal) return;

                const focusable = modal.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                if (!focusable.length) {
                    event.preventDefault();
                    modal.focus();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                //yeni - Fokus modal xaricindədirsə, içəri qaytar
                if (!modal.contains(document.activeElement)) {
                    event.preventDefault();
                    first.focus();
                    return;
                }

                //yeni - Shift + Tab ilə geriyə keçid
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }

                //yeni - Son elementdən yenidən birinciyə keçid
                if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown); //yeni

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown); //yeni
            previousFocus?.focus?.();
        };
    }, [isOpen, onClose]);

    const handleProductClick = (id) => {
        onClose();
        setQuery("");
        router.push(`/products/${id}`);
    };

    const handleClose = () => {
        onClose();
        setQuery("");
    };

    // document.body yalnız brauzerdə mövcuddur (SSR-də portal yoxdur)
    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="search-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[110] flex items-start justify-center bg-black/70 px-4 pt-[8vh] sm:pt-[12vh]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleClose();
                        }
                    }}
                >
                    <motion.div
                        ref={modalRef} //yeni
                        tabIndex={-1} //yeni
                        role="dialog"
                        aria-modal="true"
                        aria-label={t("dialog")}
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full max-w-2xl overflow-hidden bg-[#FAF8F4] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#E8E2D8] px-5 py-5 sm:px-8">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                                    {t("eyebrow")}
                                </p>

                                <h2 className="mt-1 font-serif text-2xl text-[#171717]">
                                    {t("title")}
                                </h2>
                            </div>

                            <button
                                type="button"
                                aria-label={t("close")}
                                onClick={handleClose}
                                className="cursor-pointer text-[#171717]/50 transition-colors hover:text-[#B08D57]"
                            >
                                <X size={22} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center gap-3 border-b border-[#E8E2D8] bg-white px-5 py-4 sm:px-8">
                            <Search
                                size={21}
                                strokeWidth={1.5}
                                className="shrink-0 text-[#B08D57]"
                            />

                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder={t("placeholder")}
                                aria-label={t("inputLabel")}
                                className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#171717]/35"
                            />
                        </div>

                        {/* Results */}
                        <div className="max-h-[55dvh] min-h-32 overflow-y-auto px-5 py-5 sm:px-8">
                            {!searchTerm ? (
                                <div className="py-8 text-center">
                                    <Search
                                        size={26}
                                        strokeWidth={1.2}
                                        className="mx-auto mb-3 text-[#B08D57]/60"
                                    />

                                    <p className="text-sm text-[#171717]/50">
                                        {t("hint")}
                                    </p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="font-serif text-lg text-[#171717]">
                                        {t("noResults")}
                                    </p>

                                    <p className="mt-2 text-xs text-[#171717]/50">
                                        {t("tryAnother")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171717]/45">
                                        {t("resultsFound", { count: filteredProducts.length })}
                                    </p>

                                    {filteredProducts.map((product) => (
                                        <button
                                            key={product._id}
                                            type="button"
                                            onClick={() =>
                                                handleProductClick(product._id)
                                            }
                                            className="group flex w-full cursor-pointer items-center gap-4 border-b border-[#E8E2D8] pb-3 text-left transition-colors hover:bg-[#F5F1E9]"
                                        >
                                            <ProductImage
                                                src={product.image}
                                                alt={product.name}
                                                width={80}
                                                height={80}
                                                className="h-17 w-17 shrink-0 object-cover sm:h-20 sm:w-20"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B08D57]">
                                                    {product.category}
                                                </p>

                                                <h3 className="mt-1 truncate font-serif text-base text-[#171717] sm:text-lg">
                                                    {product.name}
                                                </h3>

                                                <Price
                                                    value={product.price}
                                                    className="mt-1 block text-sm font-semibold text-[#171717]"
                                                />
                                            </div>

                                            <ArrowUpRight
                                                size={18}
                                                strokeWidth={1.5}
                                                className="shrink-0 text-[#171717]/40 transition-colors group-hover:text-[#B08D57]"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};