"use client";

import type { ChangeEvent } from "react";
import { MECHANISMS } from "@/backend/constants";
import type { ProductSpecsFormState } from "@/admin/types/products";

const inputClass =
  "w-full border border-[#E8E2D8] bg-white px-3 py-2.5 text-[13px] text-[#171717] outline-none transition-colors placeholder:text-[#AAA] focus:border-[#B08D57]";

const labelClass = "mb-1.5 block text-[11px] font-medium text-[#555]";

interface ProductSpecsFieldsProps {
  values: ProductSpecsFormState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ProductSpecsFields = ({ values, onChange }: ProductSpecsFieldsProps) => (
  <fieldset className="sm:col-span-2">
    <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#B08D57]">
      Specifications
    </legend>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="product-mechanism" className={labelClass}>
          Mechanism
        </label>

        <select
          id="product-mechanism"
          name="mechanism"
          value={values.mechanism}
          onChange={onChange}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Not specified</option>
          {MECHANISMS.map((mechanism) => (
            <option key={mechanism} value={mechanism}>
              {mechanism}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="product-case-size" className={labelClass}>
          Case Size (mm)
        </label>

        <input
          id="product-case-size"
          name="caseSize"
          type="number"
          min="20"
          max="60"
          step="0.5"
          value={values.caseSize}
          onChange={onChange}
          placeholder="41"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="product-case-material" className={labelClass}>
          Case Material
        </label>

        <input
          id="product-case-material"
          name="caseMaterial"
          maxLength={60}
          value={values.caseMaterial}
          onChange={onChange}
          placeholder="Stainless steel"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="product-strap" className={labelClass}>
          Strap
        </label>

        <input
          id="product-strap"
          name="strap"
          maxLength={60}
          value={values.strap}
          onChange={onChange}
          placeholder="Leather"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="product-water-resistance" className={labelClass}>
          Water Resistance (m)
        </label>

        <input
          id="product-water-resistance"
          name="waterResistance"
          type="number"
          min="0"
          max="1000"
          step="1"
          value={values.waterResistance}
          onChange={onChange}
          placeholder="100"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="product-glass" className={labelClass}>
          Glass
        </label>

        <input
          id="product-glass"
          name="glass"
          maxLength={60}
          value={values.glass}
          onChange={onChange}
          placeholder="Sapphire crystal"
          className={inputClass}
        />
      </div>
    </div>
  </fieldset>
);
