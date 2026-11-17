"use client";


import { useTranslations } from "next-intl";
import { features } from "../../data/features";

export const FeaturesSection = () => {
    const t = useTranslations("Features");

    return (
        <section className="border-b border-[#B08D57]/15 bg-[#F5F1E9]">
            <div className="mx-auto grid max-w-7xl grid-cols-1 px-5 py-8 sm:px-8 md:grid-cols-3 lg:px-12">
                {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.id}
                            className={`flex flex-col items-center px-5 py-8 text-center ${index !== features.length - 1
                                    ? "border-b border-[#B08D57]/20 md:border-r md:border-b-0"
                                    : ""
                                }`}
                        >
                            <Icon
                                size={30}
                                strokeWidth={1.3}
                                className="mb-5 text-[#B08D57]"
                            />

                            <h3 className="font-serif text-xl font-medium text-[#171717]">
                                {t(`${feature.key}.title`)}
                            </h3>

                            <p className="mt-3 max-w-xs text-sm leading-6 text-[#171717]/55">
                                {t(`${feature.key}.description`)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
