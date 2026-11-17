import { SHIPPING_METHODS, type ShippingMethod } from "../constants";
import { cleanString, isEmail, isObjectId } from "../lib/validation";
import type { OrderLineInput } from "./orderService";

const MAX_LINE_QUANTITY = 10;
const MAX_LINES = 20;
const ALLOWED_COUNTRIES = ["Azerbaijan", "Turkey", "Georgia"];

export const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,100}$/;

export interface OrderInput {
  items: OrderLineInput[];
  shippingMethod: ShippingMethod;
  contact: { firstName: string; lastName: string; email: string; phone: string };
  shippingAddress: { country: string; city: string; address: string; postalCode: string };
}

export interface ParsedOrderInput {
  errors: string[];
  value: OrderInput;
}

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw =>
  typeof value === "object" && value !== null ? (value as Raw) : {};

const isShippingMethod = (value: unknown): value is ShippingMethod =>
  typeof value === "string" && Object.hasOwn(SHIPPING_METHODS, value);

/** Eyni məhsul təkrar gəlsə miqdarlar birləşdirilir; yanlış sətir varsa errors-a yazılır. */
const parseItems = (body: Raw, errors: string[]): OrderLineInput[] => {
  const rawItems = Array.isArray(body.items) ? (body.items as unknown[]) : [];

  if (rawItems.length === 0 || rawItems.length > MAX_LINES) {
    errors.push("Cart is empty or too large");
  }

  const merged = new Map<string, number>();

  for (const raw of rawItems) {
    const { productId, quantity } = asRecord(raw);

    if (
      !isObjectId(productId) ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_LINE_QUANTITY
    ) {
      errors.push("Invalid cart item");
      break;
    }

    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const items = [...merged].map(([productId, quantity]) => ({ productId, quantity }));

  if (items.some((item) => item.quantity > MAX_LINE_QUANTITY)) errors.push("Invalid cart item");

  return items;
};

const parseContact = (body: Raw, errors: string[]): OrderInput["contact"] => {
  const raw = asRecord(body.contact);
  const contact = {
    firstName: cleanString(raw.firstName, 60),
    lastName: cleanString(raw.lastName, 60),
    email: cleanString(raw.email, 254).toLowerCase(),
    phone: cleanString(raw.phone, 30),
  };

  if (!contact.firstName || !contact.lastName) errors.push("First and last name are required");
  if (!isEmail(contact.email)) errors.push("Valid email is required");
  if (!/^[+\d][\d\s()-]{6,24}$/.test(contact.phone)) errors.push("Valid phone number is required");

  return contact;
};

const parseAddress = (body: Raw, errors: string[]): OrderInput["shippingAddress"] => {
  const raw = asRecord(body.shippingAddress);
  const address = {
    country: cleanString(raw.country, 60),
    city: cleanString(raw.city, 80),
    address: cleanString(raw.address, 200),
    postalCode: cleanString(raw.postalCode, 20),
  };

  if (!ALLOWED_COUNTRIES.includes(address.country)) errors.push("Invalid country");
  if (!address.city) errors.push("City is required");
  if (!address.address) errors.push("Address is required");

  return address;
};

/** Sifariş gövdəsini yoxlayıb təmizləyir; xətaların siyahısını qaytarır. */
export const parseOrderInput = (rawBody: unknown): ParsedOrderInput => {
  const body = asRecord(rawBody);
  const errors: string[] = [];

  const items = parseItems(body, errors);

  if (!isShippingMethod(body.shippingMethod)) errors.push("Invalid shipping method");

  const contact = parseContact(body, errors);
  const shippingAddress = parseAddress(body, errors);

  return {
    errors,
    value: {
      items,
      shippingMethod: body.shippingMethod as ShippingMethod,
      contact,
      shippingAddress,
    },
  };
};
