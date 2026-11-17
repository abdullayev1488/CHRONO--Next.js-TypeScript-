"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Coins } from "lucide-react";
import { CURRENCIES, CURRENCY_CODES } from "../lib/currency";
import { useCurrency } from "./CurrencyProvider";

// Valyutanın adı cari sayt dilində göstərilir (məs. "Azərbaycan manatı"); yalnız menyu açılanda render olunur
const getCurrencyName = (locale, code) => {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code);
  } catch {
    return code;
  }
};

export const CurrencySwitcher = ({ className = "", inline = false }) => {
  const t = useTranslations("Currency");
  const locale = useLocale();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Kənara klik və Escape ilə bağlanır
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (code) => {
    setOpen(false);
    setCurrency(code);
  };

  const options = open
    ? CURRENCY_CODES.map((code) => (
        <li key={code} role="option" aria-selected={code === currency}>
          <button
            type="button"
            onClick={() => choose(code)}
            className={`flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-2.5 text-left text-xs font-medium transition-colors hover:bg-[#B08D57]/10 hover:text-[#B08D57] ${
              code === currency ? "text-[#B08D57]" : "text-[#171717]"
            }`}
          >
            <span>
              <span className="font-semibold">{CURRENCIES[code].symbol}</span>
              <span className="ml-2 opacity-60">{getCurrencyName(locale, code)}</span>
            </span>

            {code === currency && <Check size={14} strokeWidth={2} />}
          </button>
        </li>
      ))
    : null;

  // Mobil menyuda: açılan sətir (accordion). Menyu overflow-hidden olduğu üçün absolute dropdown kəsilərdi
  if (inline) {
    return (
      <div ref={rootRef} className={`border-b border-[#B08D57]/15 ${className}`}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
          className="flex w-full cursor-pointer items-center justify-between py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#171717]"
        >
          <span className="flex items-center gap-3">
            <Coins size={16} strokeWidth={1.6} />
            {t("label")}
          </span>

          <span className="flex items-center gap-2 text-[#B08D57]">
            {CURRENCIES[currency].symbol}
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {open && (
          <ul role="listbox" aria-label={t("label")} className="pb-2">
            {options}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-10 cursor-pointer items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#171717] transition-colors hover:text-[#B08D57]"
      >
        <Coins size={15} strokeWidth={1.6} />
        {CURRENCIES[currency].symbol}
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 top-full z-50 mt-1 min-w-[210px] border border-[#B08D57]/20 bg-[#F5F1E9] py-1 shadow-lg"
        >
          {options}
        </ul>
      )}
    </div>
  );
};
