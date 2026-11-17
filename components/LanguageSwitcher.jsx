"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Hər dil öz adı ilə göstərilir ki, istifadəçi başqa dildə olsa da tanısın
const LANGUAGE_NAMES = {
  az: "Azərbaycanca",
  en: "English",
  ru: "Русский",
};

export const LanguageSwitcher = ({ className = "", inline = false }) => {
  const locale = useLocale();
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
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

  const change = (next) => {
    setOpen(false);
    if (next === locale) return;
    // Dinamik seqmentləri (məs. /products/[id]) qoruyub dili dəyişirik
    router.replace({ pathname, params }, { locale: next });
  };

  const options = routing.locales.map((item) => (
    <li key={item} role="option" aria-selected={item === locale}>
      <button
        type="button"
        onClick={() => change(item)}
        className={`flex w-full cursor-pointer items-center justify-between gap-6 px-4 py-2.5 text-left text-xs font-medium transition-colors hover:bg-[#B08D57]/10 hover:text-[#B08D57] ${
          item === locale ? "text-[#B08D57]" : "text-[#171717]"
        }`}
      >
        <span>{LANGUAGE_NAMES[item]}</span>

        {item === locale ? (
          <Check size={14} strokeWidth={2} />
        ) : (
          <span className="text-[10px] uppercase tracking-[0.1em] opacity-50">{item}</span>
        )}
      </button>
    </li>
  ));

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
            <Globe size={16} strokeWidth={1.6} />
            {t("language")}
          </span>

          <span className="flex items-center gap-2 text-[#B08D57]">
            {LANGUAGE_NAMES[locale]}
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {open && (
          <ul role="listbox" aria-label={t("language")} className="pb-2">
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
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-10 cursor-pointer items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#171717] transition-colors hover:text-[#B08D57]"
      >
        <Globe size={15} strokeWidth={1.6} />
        {locale}
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 top-full z-50 mt-1 min-w-[170px] border border-[#B08D57]/20 bg-[#F5F1E9] py-1 shadow-lg"
        >
          {options}
        </ul>
      )}
    </div>
  );
};
