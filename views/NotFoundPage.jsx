"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export const NotFoundPage = () => {
    const t = useTranslations("NotFound");

    return (
        <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FAF8F4] px-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
                {t("code")}
            </span>

            <h1 className="mt-5 font-serif text-6xl text-[#171717] sm:text-8xl">
                4<span className="italic text-[#B08D57]">0</span>4
            </h1>

            <h2 className="mt-4 font-serif text-2xl text-[#171717] sm:text-3xl">
                {t("title")}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#171717]/60">
                {t("text")}
            </p>

            <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center bg-[#171717] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57]"
            >
                {t("back")}
            </Link>
        </section>
    );
};
