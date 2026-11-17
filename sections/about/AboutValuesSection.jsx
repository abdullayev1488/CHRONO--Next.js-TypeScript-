"use client";

import { useTranslations } from "next-intl";
import { Gem, ShieldCheck, Headphones } from "lucide-react";

const values = [
  { key: "design", icon: Gem },
  { key: "authenticity", icon: ShieldCheck },
  { key: "service", icon: Headphones },
];

export const AboutValuesSection = () => {
  const t = useTranslations("About");

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#B08D57]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">
              {t("valuesLabel")}
            </span>
            <span className="h-px w-10 bg-[#B08D57]" />
          </div>

          <h2 className="font-serif text-4xl leading-tight text-[#171717] sm:text-5xl">
            {t("valuesTitle")}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[#B08D57]/20 md:grid-cols-3">
          {values.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="flex flex-col items-center bg-white px-8 py-12 text-center"
            >
              <Icon
                size={32}
                strokeWidth={1.3}
                className="mb-6 text-[#B08D57]"
              />

              <h3 className="font-serif text-xl font-medium text-[#171717]">
                {t(`values.${key}.title`)}
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-7 text-[#171717]/60">
                {t(`values.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
