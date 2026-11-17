"use client";

import { useLocale, useTranslations } from "next-intl";

export const ErrorPage = ({ error }) => {
    const t = useTranslations("ErrorPage");
    const locale = useLocale();

    if (process.env.NODE_ENV !== "production") {
        console.error(error);
    }

    return (
        <section className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F4] px-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B08D57]">
                CHRONO
            </span>

            <h1 className="mt-5 font-serif text-4xl text-[#171717] sm:text-5xl">
                {t("title")}
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#171717]/60">
                {t("text")}
            </p>

            <a
                href={`/${locale}`}
                className="mt-8 inline-flex items-center justify-center bg-[#171717] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57]"
            >
                {t("back")}
            </a>
        </section>
    );
};
