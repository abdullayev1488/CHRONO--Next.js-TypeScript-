"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  getMaxQuantity,
} from "../redux/slice/cartSlice";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "../components/ProductImage";
import { Price } from "../components/Price";
import { CurrencyNote } from "../components/CurrencyNote";
import {
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const CartPage = () => {
  const t = useTranslations("CartPage");
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  // Səbət localStorage-dan yalnız brauzerdə yüklənir; yüklənənə qədər boş vəziyyət göstərmirik
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const subtotal = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const totalQuantity = cartItems.reduce(
    (total, product) => total + product.quantity,
    0
  );

  return (
    <section className="min-h-screen bg-[#FAF8F4] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/products"
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/50 transition-colors hover:text-[#B08D57]"
          >
            <ArrowLeft size={15} />
            {t("continueShopping")}
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#B08D57]/20 pb-7">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B08D57]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B08D57]">
                  {t("eyebrow")}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-medium text-[#171717] sm:text-4xl lg:text-5xl">
                {t.rich("title", {
                  accent: (chunks) => (
                    <span className="italic text-[#B08D57]">{chunks}</span>
                  ),
                })}
              </h1>
            </div>

            <span className="text-xs font-medium text-[#171717]/50">
              {t("itemCount", { count: totalQuantity })}
            </span>
          </div>
        </div>

        {/* yeni - AnimatePresence səbətin boşalma animasiyasını da saxlayır */}
        <AnimatePresence mode="wait" initial={false}>

          {!mounted ? (
            <div key="loading" className="min-h-[400px]" />
          ) : cartItems.length === 0 ? (
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-[400px] flex-col items-center justify-center border border-[#E8E2D8] bg-white px-5 py-16 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F1E9]">
                <ShoppingBag
                  size={34}
                  strokeWidth={1.2}
                  className="text-[#B08D57]"
                />
              </div>

              <h2 className="mt-7 font-serif text-2xl text-[#171717] sm:text-3xl">
                {t("emptyTitle")}
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#171717]/50">
                {t("emptyText")}
              </p>

              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 bg-[#171717] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#B08D57]"
              >
                {t("explore")}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="filled-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]"
            >

              {/* Left: Cart Items */}
              <div className="min-w-0 border border-[#E8E2D8] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[#E8E2D8] px-4 py-5 sm:px-6">
                  <h2 className="font-serif text-xl text-[#171717] sm:text-2xl">
                    {t("yourTimepieces")}
                  </h2>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B08D57]">
                    {t("productCount", { count: cartItems.length })}
                  </span>
                </div>

                {/* Scrollable Product List */}
                <div className="max-h-[480px] overflow-y-auto sm:max-h-[560px] lg:max-h-[600px]">

                  {/* yeni - silinən məhsulun animasiyasını gözləyir */}
                  <AnimatePresence initial={false}>
                    {cartItems.map((product) => (
                      <motion.article
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          height: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          marginTop: 0,
                          marginBottom: 0,
                          overflow: "hidden",
                        }}
                        transition={{
                          duration: 0.35,
                          ease: "easeInOut",
                        }}
                        layout
                        className="flex min-w-0 gap-3 border-b border-[#E8E2D8] p-3 last:border-b-0 sm:gap-5 sm:p-6"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${product._id}`}
                          className="relative h-28 w-20 shrink-0 overflow-hidden bg-[#F5F1E9] min-[400px]:h-32 min-[400px]:w-24 sm:h-40 sm:w-32"
                        >
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="128px"
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B08D57] sm:text-[10px]">
                                {product.category}
                              </p>

                              {/* Remove */}
                              <button
                                onClick={() =>
                                  dispatch(removeFromCart(product._id))
                                }
                                type="button"
                                aria-label={t("remove", { name: product.name })}
                                className="flex cursor-pointer h-8 w-8 shrink-0 items-center justify-center text-[#171717]/40 transition-colors hover:text-red-500"
                              >
                                <Trash2 size={16} strokeWidth={1.5} />
                              </button>
                            </div>

                            <Link href={`/products/${product._id}`}>
                              <h3 className="mt-1 break-words font-serif text-base font-medium leading-snug text-[#171717] transition-colors hover:text-[#B08D57] sm:text-xl">
                                {product.name}
                              </h3>
                            </Link>

                            <p className="mt-2 text-xs text-[#171717]/50 sm:text-sm">
                              {t("unitPrice")}: <Price value={product.price} />
                            </p>
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-3">
                            {/* Quantity Controls */}
                            <div className="inline-flex h-10 items-center border border-[#E8E2D8]">
                              <button
                                onClick={() =>
                                  dispatch(decreaseQuantity(product._id))
                                }
                                type="button"
                                aria-label={t("decrease")}
                                className="flex cursor-pointer h-full w-9 items-center justify-center text-[#171717] transition-colors hover:bg-[#F5F1E9] sm:w-10"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="flex h-full min-w-8 items-center justify-center border-x border-[#E8E2D8] px-2 text-xs font-semibold text-[#171717]">
                                {product.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  dispatch(increaseQuantity(product._id))
                                }
                                type="button"
                                aria-label={t("increase")}
                                disabled={product.quantity >= getMaxQuantity(product)}
                                className="flex cursor-pointer h-full w-9 items-center justify-center text-[#171717] transition-colors hover:bg-[#F5F1E9] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent sm:w-10"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <Price
                              value={product.price * product.quantity}
                              className="text-sm font-semibold text-[#171717] sm:text-lg"
                            />
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-[#E8E2D8] bg-[#FCFAF7] px-4 py-4 sm:px-6">
                  <p className="text-[11px] leading-5 text-[#171717]/45">
                    {t("curated")}
                  </p>
                </div>
              </div>

              {/* Right: Order Summary */}
              <aside className="min-w-0 border border-[#E8E2D8] bg-white p-5 sm:p-7 lg:sticky lg:top-32">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl text-[#171717]">
                    {t("orderSummary")}
                  </h2>

                  <ShoppingBag
                    size={20}
                    strokeWidth={1.3}
                    className="text-[#B08D57]"
                  />
                </div>

                <div className="mt-7 space-y-5 border-b border-[#E8E2D8] pb-7">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#171717]/55">
                      {t("items", { count: totalQuantity })}
                    </span>

                    <Price value={subtotal} className="font-medium text-[#171717]" />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#171717]/55">
                      {t("shipping")}
                    </span>

                    <span className="text-right text-xs text-[#171717]/60">
                      {t("calcAtCheckout")}
                    </span>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#171717]">
                    {t("subtotal")}
                  </span>

                  <Price value={subtotal} className="font-serif text-2xl font-medium text-[#171717]" />
                </div>

                <p className="mt-3 text-[11px] leading-5 text-[#171717]/45">
                  {t("taxNote")}
                </p>

                <CurrencyNote className="mt-2" />

                {/* Checkout - UI only */}
                <Link
                  href="/checkout" //yeni
                  className="mt-8 flex w-full items-center justify-center gap-3 bg-[#171717] px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:bg-[#B08D57]"
                >
                  {t("proceed")}
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/products"
                  className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B08D57] transition-colors hover:text-[#171717]"
                >
                  {t("continueShopping")}
                </Link>

                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#E8E2D8] pt-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.4}
                      className="shrink-0 text-[#B08D57]"
                    />

                    <span className="text-[10px] text-[#171717]/55">
                      {t("secure")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck
                      size={18}
                      strokeWidth={1.4}
                      className="shrink-0 text-[#B08D57]"
                    />

                    <span className="text-[10px] text-[#171717]/55">
                      {t("premiumDelivery")}
                    </span>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};