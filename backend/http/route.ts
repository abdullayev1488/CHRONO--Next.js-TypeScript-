import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { ApiError } from "./errors";
import { apiLimiter } from "./rateLimit";

const MAX_JSON_BYTES = 100 * 1024;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export interface RouteContext<P extends Record<string, string> = Record<string, string>> {
  request: Request;
  params: P;
  /** Cavaba əlavə olunacaq Set-Cookie başlıqları */
  cookies: string[];
}

type Handler<P extends Record<string, string>> = (ctx: RouteContext<P>) => Promise<Response>;

export const json = (body: unknown, status = 200): Response => Response.json(body, { status });

/** CSRF qorunması: dəyişdirici sorğular yalnız eyni origin-dən qəbul edilir. */
const assertSameOrigin = (request: Request): void => {
  if (SAFE_METHODS.has(request.method)) return;

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!origin || !host || new URL(origin).host !== host) {
    throw ApiError.forbidden("Forbidden origin");
  }
};

/** JSON gövdəni ölçü limiti ilə oxuyur; yanlış JSON üçün 400, böyük gövdə üçün 413 atır. */
export const readJson = async <T = Record<string, unknown>>(request: Request): Promise<T> => {
  const text = await request.text();

  if (Buffer.byteLength(text) > MAX_JSON_BYTES) {
    throw new ApiError(413, "Request body too large");
  }

  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw ApiError.badRequest("Invalid JSON body");
  }
};

const toErrorResponse = (error: unknown): Response => {
  if (error instanceof ApiError) {
    return json({ message: error.message, ...error.details }, error.status);
  }

  if (error instanceof mongoose.Error.CastError) {
    return json({ message: "Invalid ID" }, 400);
  }

  // Daxili xətanın təfərrüatı client-ə sızmır
  console.error(error);
  return json({ message: "Internal server error" }, 500);
};

/**
 * Bütün API handler-ləri üçün ortaq sarğı: DB bağlantısı, rate-limit, CSRF yoxlaması,
 * xətaların JSON-a çevrilməsi və Set-Cookie başlıqlarının əlavə olunması.
 */
export const route =
  <P extends Record<string, string> = Record<string, string>>(handler: Handler<P>) =>
  async (request: Request, context?: { params: Promise<P> }): Promise<Response> => {
    const cookies: string[] = [];

    try {
      apiLimiter.begin(request);
      assertSameOrigin(request);
      await connectDB();

      const params = (await context?.params) ?? ({} as P);
      const response = await handler({ request, params, cookies });

      for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
      return response;
    } catch (error) {
      const response = toErrorResponse(error);
      for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
      return response;
    }
  };
