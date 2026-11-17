"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Price } from "../components/Price";
import { CurrencyNote } from "../components/CurrencyNote";

export const OrderConfirmationPage = () => {
    const t = useTranslations("OrderConfirmation");
    const router = useRouter();
    // undefined = hələ oxunmayıb (SSR/hydration-a uyğun), null = sifariş yoxdur
    const [order, setOrder] = useState(undefined);

    useEffect(() => {
        let saved = null;

        try {
            saved = JSON.parse(sessionStorage.getItem("lastOrder"));
        } catch {
            saved = null;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrder(saved);

        // Səhifə birbaşa açılıbsa göstəriləcək sifariş yoxdur
        if (!saved) router.replace("/products");
    }, [router]);

    if (!order) return null;

    return (
        <section className="min-h-[70vh] bg-[#FAF8F4] px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl border border-[#E8E2D8] bg-white p-6 text-center sm:p-12">
                <CheckCircle2
                    size={44}
                    strokeWidth={1.2}
                    className="mx-auto text-[#B08D57]"
                />

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                    {t("eyebrow")}
                </p>

                <h1 className="mt-3 font-serif text-3xl text-[#171717] sm:text-4xl">
                    {t.rich("title", {
                        accent: (chunks) => (
                            <span className="italic text-[#B08D57]">{chunks}</span>
                        ),
                    })}
                </h1>

                <p className="mt-4 text-sm leading-6 text-[#171717]/60">
                    {t.rich("text", {
                        number: order.orderNumber,
                        email: order.contact.email,
                        strong: (chunks) => (
                            <span className="font-semibold text-[#171717]">{chunks}</span>
                        ),
                    })}
                </p>

                <dl className="mx-auto mt-8 max-w-sm space-y-3 border-y border-[#E8E2D8] py-6 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-[#171717]/55">{t("items")}</dt>
                        <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-[#171717]/55">{t("shipping")}</dt>
                        <dd>{order.shipping === 0 ? t("free") : <Price value={order.shipping} />}</dd>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <dt>{t("total")}</dt>
                        <dd>
                            <Price value={order.total} className="font-serif text-xl text-[#B08D57]" />
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-[#171717]/55">{t("payment")}</dt>
                        <dd>{order.paymentStatus}</dd>
                    </div>
                </dl>

                <CurrencyNote className="mt-4" />

                <Link
                    href="/products"
                    className="mt-8 inline-flex items-center gap-3 bg-[#171717] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#B08D57]"
                >
                    {t("continueShopping")}
                    <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    );
};
