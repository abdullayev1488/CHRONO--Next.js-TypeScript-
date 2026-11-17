"use client";

import { useTranslations } from "next-intl";

const isFilled = (value) => value !== null && value !== undefined && value !== "";

/** Spesifikasiya olub-olmadığını yoxlayır (bölməni gizlətmək üçün). */
export const hasSpecs = (specs) =>
  Boolean(specs) && Object.values(specs).some(isFilled);

/** Texniki xüsusiyyətlər cədvəli; heç bir dəyər yoxdursa heç nə göstərmir. */
export const ProductSpecs = ({ specs }) => {
  const t = useTranslations("ProductSpecs");

  if (!hasSpecs(specs)) return null;

  const mechanism =
    specs.mechanism && t.has(`mechanisms.${specs.mechanism}`)
      ? t(`mechanisms.${specs.mechanism}`)
      : specs.mechanism;

  const rows = [
    { key: "mechanism", value: mechanism },
    { key: "caseSize", value: isFilled(specs.caseSize) && t("mm", { value: specs.caseSize }) },
    { key: "caseMaterial", value: specs.caseMaterial },
    { key: "strap", value: specs.strap },
    {
      key: "waterResistance",
      value: isFilled(specs.waterResistance) && t("meters", { value: specs.waterResistance }),
    },
    { key: "glass", value: specs.glass },
  ].filter((row) => row.value);

  return (
    <dl className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-4 border-b border-[#171717]/10 py-4 text-sm"
        >
          <dt className="text-[#171717]/50">{t(row.key)}</dt>
          <dd className="text-right font-medium text-[#171717]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};
