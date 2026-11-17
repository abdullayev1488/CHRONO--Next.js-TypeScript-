import {
  BADGES,
  CATEGORIES,
  MECHANISMS,
  type Badge,
  type Category,
  type Mechanism,
} from "../constants";
import type { IProductSpecs } from "../models/product";

export interface ProductInput {
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice: number | null;
  stock: number;
  badge: Badge | null;
  featured: boolean;
  specs: IProductSpecs;
}

export interface ParsedProductInput {
  data: ProductInput;
  errors: string[];
}

type RawBody = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
};

const isBlank = (value: unknown): boolean => value === undefined || value === null || value === "";

const trimmed = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const isCategory = (value: unknown): value is Category =>
  (CATEGORIES as readonly unknown[]).includes(value);

const isBadge = (value: unknown): value is Badge => (BADGES as readonly unknown[]).includes(value);

const SPEC_TEXT_MAX = 60;
const CASE_SIZE_RANGE = { min: 20, max: 60 };
const WATER_RESISTANCE_RANGE = { min: 0, max: 1000 };

const isMechanism = (value: unknown): value is Mechanism =>
  (MECHANISMS as readonly unknown[]).includes(value);

/** Boş dəyər null-dur; doldurulubsa mətn limitdən uzun ola bilməz. */
const parseSpecText = (value: unknown, label: string, errors: string[]): string | null => {
  const text = trimmed(value);
  if (text.length > SPEC_TEXT_MAX) errors.push(`${label} is too long (max ${SPEC_TEXT_MAX} characters)`);
  return text || null;
};

/** Boş dəyər null-dur; doldurulubsa aralıqda olmalıdır (tam ədəd tələbi istəyə bağlı). */
const parseSpecNumber = (
  value: unknown,
  label: string,
  range: { min: number; max: number },
  errors: string[],
  integerOnly = false
): number | null => {
  if (isBlank(value)) return null;

  const number = toNumber(value);
  const valid =
    Number.isFinite(number) &&
    number >= range.min &&
    number <= range.max &&
    (!integerOnly || Number.isInteger(number));

  if (!valid) errors.push(`${label} must be ${integerOnly ? "a whole number " : ""}between ${range.min} and ${range.max}`);
  return valid ? number : null;
};

const parseSpecs = (body: RawBody, errors: string[]): IProductSpecs => {
  let mechanism: Mechanism | null = null;
  if (!isBlank(body.mechanism)) {
    if (isMechanism(body.mechanism)) mechanism = body.mechanism;
    else errors.push("Invalid mechanism");
  }

  return {
    mechanism,
    caseSize: parseSpecNumber(body.caseSize, "Case size", CASE_SIZE_RANGE, errors),
    caseMaterial: parseSpecText(body.caseMaterial, "Case material", errors),
    strap: parseSpecText(body.strap, "Strap", errors),
    waterResistance: parseSpecNumber(
      body.waterResistance,
      "Water resistance",
      WATER_RESISTANCE_RANGE,
      errors,
      true
    ),
    glass: parseSpecText(body.glass, "Glass", errors),
  };
};

/** Yalnız icazə verilən sahələr qəbul edilir; _id, __v, image və s. client-dən götürülmür. */
export const parseProductInput = (body: RawBody = {}): ParsedProductInput => {
  const errors: string[] = [];

  const name = trimmed(body.name);
  if (!name || name.length > 120) errors.push("Valid product name is required");

  const brand = trimmed(body.brand);
  if (!brand || brand.length > 60) errors.push("Valid product brand is required");

  if (!isCategory(body.category)) errors.push("Invalid product category");

  const price = toNumber(body.price);
  if (!Number.isFinite(price) || price < 0) errors.push("Valid product price is required");

  let oldPrice: number | null = null;
  if (!isBlank(body.oldPrice)) {
    oldPrice = toNumber(body.oldPrice);
    if (!Number.isFinite(oldPrice) || oldPrice < 0) errors.push("Invalid old price");
  }

  const stock = toNumber(body.stock);
  if (!Number.isInteger(stock) || stock < 0) errors.push("Stock must be a non-negative integer");

  let badge: Badge | null = null;
  if (!isBlank(body.badge) && body.badge !== "None") {
    if (isBadge(body.badge)) badge = body.badge;
    else errors.push("Invalid badge");
  }

  const data: ProductInput = {
    name,
    brand,
    category: body.category as Category,
    price,
    oldPrice,
    stock,
    badge,
    featured: body.featured === true || body.featured === "true",
    specs: parseSpecs(body, errors),
  };

  return { data, errors };
};
