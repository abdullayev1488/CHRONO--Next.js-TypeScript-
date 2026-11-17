"use client";

import { useRef, useState, useSyncExternalStore } from "react"; //yeni
import { useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { Link, useRouter } from "@/i18n/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/axios";
import { clearCart } from "../redux/slice/cartSlice";
import { useCustomer } from "../hooks/useCustomer";
import { getErrorMessage } from "../utils/errors";
import { ProductImage } from "../components/ProductImage";
import {
    EXPRESS_SHIPPING,
    FREE_SHIPPING_THRESHOLD,
    STANDARD_SHIPPING,
} from "../lib/shipping";
import { Price } from "../components/Price";
import { CurrencyNote } from "../components/CurrencyNote";


export const CheckoutPage = () => {
    const dispatch = useDispatch();
    const t = useTranslations("CheckoutPage");
    const te = useTranslations("Errors");
    const router = useRouter();
    // Səbət localStorage-dan yalnız brauzerdə yüklənir; yüklənənə qədər boş vəziyyət göstərmirik
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
    const queryClient = useQueryClient();
    const cartItems = useSelector((state) => state.cart.items);
    const { data: customer } = useCustomer();

    // Eyni sifarişin təkrar göndərilməsinin qarşısını almaq üçün hər checkout cəhdinə sabit açar.
    // Açar render zamanı yox, ilk göndərişdə yaradılır (prerender zamanı crypto.randomUUID() olmaz).
    const idempotencyKeyRef = useRef(null);

    const [deliveryMethod, setDeliveryMethod] = useState("standard"); //yeni

    const subtotal = cartItems.reduce(
        (total, product) => total + product.price * product.quantity,
        0
    );

    const totalQuantity = cartItems.reduce(
        (total, product) => total + product.quantity,
        0
    );

    // $150-dən yuxarı sifarişlərdə standart çatdırılma pulsuzdur
    const isFreeStandard = subtotal > FREE_SHIPPING_THRESHOLD;

    const shipping =
        deliveryMethod === "standard"
            ? isFreeStandard
                ? 0
                : STANDARD_SHIPPING
            : EXPRESS_SHIPPING;
    const total = subtotal + shipping; //yeni

    const placeOrder = useMutation({
        mutationFn: async (payload) => {
            const response = await api.post("/api/orders", payload, {
                headers: { "Idempotency-Key": (idempotencyKeyRef.current ??= crypto.randomUUID()) },
            });
            return response.data;
        },
        onSuccess: (order) => {
            dispatch(clearCart());
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product"] });
            // Next-də router state yoxdur: sifarişi təsdiq səhifəsi üçün sessionStorage-da saxlayırıq
            try {
                sessionStorage.setItem("lastOrder", JSON.stringify(order));
            } catch {
                // sessionStorage əlçatmazdırsa təsdiq səhifəsi məhsullara yönləndirəcək
            }
            router.replace("/order-confirmation");
        },
        onError: (error) => {
            // Stok dəyişibsə məhsulları yenidən yükləyirik ki, səbət aktual məlumatla işləsin
            if (error.response?.status === 409) {
                queryClient.invalidateQueries({ queryKey: ["products"] });
            }

            toast.error(getErrorMessage(error, te));
        },
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        if (placeOrder.isPending) return;

        const form = new FormData(event.currentTarget);
        const value = (name) => String(form.get(name) ?? "").trim();
        const apartment = value("apartment");

        placeOrder.mutate({
            items: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
            shippingMethod: deliveryMethod,
            contact: {
                firstName: value("firstName"),
                lastName: value("lastName"),
                email: value("email"),
                phone: value("phone"),
            },
            shippingAddress: {
                country: value("country"),
                city: value("city"),
                address: apartment ? `${value("address")}, ${apartment}` : value("address"),
            },
        });
    };

    return (
        <section className="min-h-screen bg-[#FAF8F4] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-7xl">

                {/* yeni - Checkout Header */}
                <div className="mb-10">
                    <Link
                        href="/cart"
                        className="mb-6 inline-flex items-center gap-2 text-xs text-[#171717]/50 transition-colors hover:text-[#B08D57]"
                    >
                        <ArrowLeft size={16} />
                        {t("backToCart")}
                    </Link>

                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                        {t("eyebrow")}
                    </p>

                    <h1 className="font-serif text-4xl text-[#171717] sm:text-5xl">
                        {t.rich("title", {
                            accent: (chunks) => (
                                <span className="italic text-[#B08D57]">{chunks}</span>
                            ),
                        })}
                    </h1>
                </div>

                {!mounted ? (
                    <div className="min-h-[400px]" />
                ) : cartItems.length === 0 ? (
                    <div className="border border-[#E8E2D8] bg-white p-10 text-center">
                        <ShoppingBag className="mx-auto text-[#B08D57]" size={36} />
                        <h2 className="mt-5 font-serif text-2xl">{t("emptyTitle")}</h2>
                        <Link href="/products" className="mt-6 inline-block bg-[#171717] px-7 py-4 text-xs text-white">
                            {t("explore")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

                        {/* yeni - Sol teref: Checkout Form */}
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* yeni - Customer Information */}
                            <div className="border border-[#E8E2D8] bg-white p-5 sm:p-8">
                                <h2 className="mb-7 font-serif text-2xl text-[#171717]">
                                    {t("customerInfo")}
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" className="mb-2 block text-xs">{t("firstName")} *</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            required
                                            type="text"
                                            placeholder={t("firstNamePh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="mb-2 block text-xs">{t("lastName")} *</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            required
                                            type="text"
                                            placeholder={t("lastNamePh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-xs">{t("email")} *</label>
                                        <input
                                            id="email"
                                            name="email"
                                            required
                                            type="email"
                                            placeholder={t("emailPh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="mb-2 block text-xs">{t("phone")} *</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            required
                                            type="tel"
                                            placeholder="+994 50 123 45 67"
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* yeni - Shipping Address */}
                            <div className="border border-[#E8E2D8] bg-white p-5 sm:p-8">
                                <h2 className="mb-7 font-serif text-2xl text-[#171717]">
                                    {t("shippingAddress")}
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="country" className="mb-2 block text-xs">{t("country")} *</label>
                                        <select
                                            id="country"
                                            name="country"
                                            defaultValue="Azerbaijan"
                                            className="w-full border border-[#E8E2D8] bg-white p-3 text-sm outline-none focus:border-[#B08D57]"
                                        >
                                            <option value="Azerbaijan">{t("countries.Azerbaijan")}</option>
                                            <option value="Turkey">{t("countries.Turkey")}</option>
                                            <option value="Georgia">{t("countries.Georgia")}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="mb-2 block text-xs">{t("city")} *</label>
                                        <input
                                            id="city"
                                            name="city"
                                            required
                                            type="text"
                                            placeholder={t("cityPh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="address" className="mb-2 block text-xs">{t("street")} *</label>
                                        <input
                                            id="address"
                                            name="address"
                                            required
                                            type="text"
                                            placeholder={t("streetPh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="apartment" className="mb-2 block text-xs">{t("apartment")}</label>
                                        <input
                                            id="apartment"
                                            name="apartment"
                                            type="text"
                                            placeholder={t("apartmentPh")}
                                            className="w-full border border-[#E8E2D8] p-3 text-sm outline-none focus:border-[#B08D57]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* yeni - Delivery Method */}
                            <div className="border border-[#E8E2D8] bg-white p-5 sm:p-8">
                                <h2 className="mb-7 font-serif text-2xl text-[#171717]">
                                    {t("deliveryMethod")}
                                </h2>

                                <div className="space-y-3">
                                    <label
                                        className={`flex cursor-pointer items-center justify-between gap-3 border p-4 transition-colors ${deliveryMethod === "standard"
                                                ? "border-[#B08D57] bg-[#FAF8F4]"
                                                : "border-[#E8E2D8]"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="standard"
                                                checked={deliveryMethod === "standard"} //yeni
                                                onChange={() => setDeliveryMethod("standard")} //yeni
                                                className="accent-[#B08D57]"
                                            />
                                            <span className="text-sm">{t("standard")}</span>
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {isFreeStandard ? t("free") : <Price value={STANDARD_SHIPPING} />}
                                        </span>
                                    </label>

                                    <label
                                        className={`flex cursor-pointer items-center justify-between gap-3 border p-4 transition-colors ${deliveryMethod === "express"
                                                ? "border-[#B08D57] bg-[#FAF8F4]"
                                                : "border-[#E8E2D8]"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="delivery"
                                                value="express"
                                                checked={deliveryMethod === "express"} //yeni
                                                onChange={() => setDeliveryMethod("express")} //yeni
                                                className="accent-[#B08D57]"
                                            />
                                            <span className="text-sm">{t("express")}</span>
                                        </span>
                                        <Price value={EXPRESS_SHIPPING} className="text-sm font-semibold" />
                                    </label>
                                </div>
                            </div>

                            {/* yeni - Payment Method */}
                            <div className="border border-[#E8E2D8] bg-white p-5 sm:p-8">
                                <h2 className="mb-7 font-serif text-2xl text-[#171717]">
                                    {t("payment")}
                                </h2>

                                <div className="border border-[#B08D57] bg-[#FAF8F4] p-4">
                                    <p className="text-sm font-medium text-[#171717]">
                                        {t("payAfter")}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[#171717]/55">
                                        {t("payNote")}
                                    </p>
                                </div>
                            </div>
                        </form>

                        {/* yeni - Sag teref: Order Summary */}
                        <aside className="border border-[#E8E2D8] bg-[#171717] p-5 text-white sm:p-7 lg:sticky lg:top-32">
                            <div className="mb-7 flex items-center justify-between">
                                <h2 className="font-serif text-2xl">{t("orderSummary")}</h2>
                                <ShoppingBag size={20} className="text-[#B08D57]" />
                            </div>

                            <div className="space-y-5 border-b border-white/15 pb-7">
                                {cartItems.map((product) => (
                                    <div key={product._id} className="flex gap-4">
                                        <ProductImage
                                            src={product.image}
                                            alt={product.name}
                                            width={64}
                                            height={80}
                                            className="h-20 w-16 shrink-0 object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-serif text-sm">{product.name}</h3>

                                            <p className="mt-2 text-xs text-white/50">
                                                {t("qty")}: {product.quantity}
                                            </p>

                                            <Price
                                                value={product.price * product.quantity}
                                                className="mt-2 block text-sm text-[#B08D57]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 border-b border-white/15 py-7 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/55">{t("items", { count: totalQuantity })}</span>
                                    <Price value={subtotal} />
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-white/55">{t("shipping")}</span>
                                    <span>
                                        {shipping === 0 ? t("free") : <Price value={shipping} />}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-7">
                                <span>{t("total")}</span>
                                <Price value={total} className="font-serif text-2xl text-[#B08D57]" />
                            </div>

                            <CurrencyNote className="-mt-3 mb-5" />

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={placeOrder.isPending}
                                className="w-full cursor-pointer bg-[#B08D57] px-5 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#B08D57] disabled:hover:text-white"
                            >
                                {placeOrder.isPending ? t("placing") : t("placeOrder")}
                            </button>

                            <p className="mt-4 text-center text-[11px] text-white/45">
                                {customer
                                    ? t("orderingAs", { email: customer.email })
                                    : t("noAccount")}
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/15 pt-6">
                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <ShieldCheck size={18} className="text-[#B08D57]" />
                                    {t("secureCheckout")}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-white/60">
                                    <Truck size={18} className="text-[#B08D57]" />
                                    {t("premiumDelivery")}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </section>
    );
};