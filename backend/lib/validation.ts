import mongoose from "mongoose";
import { ApiError } from "../http/errors";

export const isObjectId = (value: unknown): value is string =>
  typeof value === "string" && mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);

export const cleanString = (value: unknown, max = 200): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export const isEmail = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Güclü şifrə: min 10 simvol, kiçik/böyük hərf, rəqəm. Xəta mətnini və ya null qaytarır. */
export const passwordError = (password: unknown): string | null => {
  if (typeof password !== "string" || password.length < 10) {
    return "Password must be at least 10 characters";
  }
  if (password.length > 128) return "Password is too long";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain uppercase, lowercase and a number";
  }
  return null;
};

export const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (params: URLSearchParams, defaultLimit = 10): Pagination => {
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(params.get("limit") ?? "", 10) || defaultLimit)
  );

  return { page, limit, skip: (page - 1) * limit };
};

/** ID düzgün ObjectId deyilsə 400 atır (mesaj: məs. "Invalid order ID"). */
export const assertObjectId = (id: string, message: string): void => {
  if (!isObjectId(id)) throw ApiError.badRequest(message);
};
