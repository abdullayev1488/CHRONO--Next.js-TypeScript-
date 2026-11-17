"use client";

import { useTranslations } from "next-intl";
import { DEFAULT_CURRENCY } from "../lib/currency";
import { useCurrency } from "./CurrencyProvider";

/** USD-dən fərqli valyuta seçiləndə məbləğlərin məlumat xarakteri daşıdığını bildirir. */
export const CurrencyNote = ({ className = "" }) => {
  const t = useTranslations("Currency");
  const { currency } = useCurrency();

  if (currency === DEFAULT_CURRENCY) return null;

  return (
    <p className={`text-[11px] leading-5 text-[#B08D57] ${className}`}>
      {t("note")}
    </p>
  );
};
