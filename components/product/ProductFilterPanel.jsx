"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

const toggleValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const CheckboxOption = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-3 text-xs text-[#171717]/75 transition-colors hover:text-[#B08D57]">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 shrink-0 cursor-pointer accent-[#B08D57]"
    />
    <span>{children}</span>
  </label>
);

const FilterGroup = ({ title, children }) => (
  <fieldset className="min-w-0">
    <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B08D57]">
      {title}
    </legend>
    {children}
  </fieldset>
);

// Qiymət yalnız fokus itəndə və ya Enter ilə tətbiq olunur ki, hər düymədə URL dəyişməsin
const PriceInput = ({ id, label, value, placeholder, onCommit }) => {
  const [draft, setDraft] = useState(null);
  const shown = draft ?? (value === null ? "" : String(value));

  const commit = () => {
    if (draft === null) return;

    const number = draft.trim() === "" ? null : Number(draft);

    onCommit(number !== null && Number.isFinite(number) && number >= 0 ? number : null);
    setDraft(null);
  };

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-[10px] text-[#171717]/45">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="0"
        value={shown}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        className="w-full border border-[#171717]/15 bg-white px-3 py-2.5 text-xs text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]"
      />
    </div>
  );
};

/** Marka, mexanizm, qiymət aralığı və stok filtrləri. */
export const ProductFilterPanel = ({ filters, options, onChange }) => {
  const t = useTranslations("ProductFilters");
  const tSpecs = useTranslations("ProductSpecs");

  const mechanismLabel = (value) =>
    tSpecs.has(`mechanisms.${value}`) ? tSpecs(`mechanisms.${value}`) : value;

  return (
    <div className="grid grid-cols-1 gap-8 border-t border-[#171717]/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
      <FilterGroup title={t("brand")}>
        <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
          {options.brands.map((brand) => (
            <CheckboxOption
              key={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => onChange({ brands: toggleValue(filters.brands, brand) })}
            >
              {brand}
            </CheckboxOption>
          ))}
        </div>
      </FilterGroup>

      {options.mechanisms.length > 0 && (
        <FilterGroup title={t("mechanism")}>
          <div className="space-y-3">
            {options.mechanisms.map((mechanism) => (
              <CheckboxOption
                key={mechanism}
                checked={filters.mechanisms.includes(mechanism)}
                onChange={() =>
                  onChange({ mechanisms: toggleValue(filters.mechanisms, mechanism) })
                }
              >
                {mechanismLabel(mechanism)}
              </CheckboxOption>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title={t("price")}>
        <div className="flex items-end gap-2">
          <PriceInput
            id="filter-min-price"
            label={t("min")}
            value={filters.minPrice}
            placeholder={String(options.priceBounds.min)}
            onCommit={(minPrice) => onChange({ minPrice })}
          />
          <PriceInput
            id="filter-max-price"
            label={t("max")}
            value={filters.maxPrice}
            placeholder={String(options.priceBounds.max)}
            onCommit={(maxPrice) => onChange({ maxPrice })}
          />
        </div>
        <p className="mt-2 text-[10px] text-[#171717]/40">{t("priceNote")}</p>
      </FilterGroup>

      <FilterGroup title={t("availability")}>
        <CheckboxOption
          checked={filters.inStockOnly}
          onChange={() => onChange({ inStockOnly: !filters.inStockOnly })}
        >
          {t("inStockOnly")}
        </CheckboxOption>
      </FilterGroup>
    </div>
  );
};

/** Aktiv filtrlərin çıxarıla bilən etiketləri. */
export const ActiveFilterChips = ({ filters, onChange, onClear }) => {
  const t = useTranslations("ProductFilters");
  const tSpecs = useTranslations("ProductSpecs");
  const tCategories = useTranslations("ProductsFilter");

  const chips = [
    ...(filters.category !== "all"
      ? [
          {
            key: "category",
            label: tCategories(`categories.${filters.category}`),
            remove: () => onChange({ category: "all" }),
          },
        ]
      : []),
    ...filters.brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      remove: () => onChange({ brands: filters.brands.filter((item) => item !== brand) }),
    })),
    ...filters.mechanisms.map((mechanism) => ({
      key: `mechanism-${mechanism}`,
      label: tSpecs.has(`mechanisms.${mechanism}`) ? tSpecs(`mechanisms.${mechanism}`) : mechanism,
      remove: () =>
        onChange({ mechanisms: filters.mechanisms.filter((item) => item !== mechanism) }),
    })),
    ...(filters.minPrice !== null
      ? [{ key: "min", label: t("minChip", { value: filters.minPrice }), remove: () => onChange({ minPrice: null }) }]
      : []),
    ...(filters.maxPrice !== null
      ? [{ key: "max", label: t("maxChip", { value: filters.maxPrice }), remove: () => onChange({ maxPrice: null }) }]
      : []),
    ...(filters.inStockOnly
      ? [{ key: "stock", label: t("inStockOnly"), remove: () => onChange({ inStockOnly: false }) }]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={t("removeFilter", { name: chip.label })}
          className="inline-flex cursor-pointer items-center gap-2 border border-[#B08D57]/40 bg-[#B08D57]/10 px-3 py-1.5 text-[11px] font-medium text-[#171717] transition-colors hover:border-[#B08D57]"
        >
          {chip.label}
          <X size={12} strokeWidth={1.8} />
        </button>
      ))}

      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/55 underline underline-offset-4 transition-colors hover:text-[#B08D57]"
      >
        {t("clearAll")}
      </button>
    </div>
  );
};
