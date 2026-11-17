import { getEnv } from "../config/env";
import { ApiError } from "./errors";

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Limitin adı (açar üçün ayırıcı) */
  name: string;
  windowMinutes: number;
  limit: number;
  message: string;
}

export interface Attempt {
  /** Sorğu uğurlu oldu: sayğac geri qaytarılır (yalnız uğursuz cəhdlər sayılsın deyə) */
  succeed(): void;
}

const buckets = new Map<string, Window>();

/** Müştərinin IP-si; X-Forwarded-For yalnız TRUST_PROXY təyin olunanda etibar edilir. */
export const getClientIp = (request: Request): string => {
  const { trustProxy } = getEnv();
  if (trustProxy > 0) {
    const chain = request.headers.get("x-forwarded-for")?.split(",").map((ip) => ip.trim()) ?? [];
    const ip = chain[Math.max(0, chain.length - trustProxy)];
    if (ip) return ip;
  }
  return "unknown";
};

/** Yaddaşda işləyən sabit pəncərəli limitləyici (tək proses üçün). */
export const createRateLimiter = (options: RateLimitOptions) => {
  const windowMs = options.windowMinutes * 60 * 1000;

  return {
    /** Cəhdi sayır; limit aşılıbsa 429 atır. */
    begin(request: Request): Attempt {
      const now = Date.now();
      const key = `${options.name}:${getClientIp(request)}`;

      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + windowMs };
        buckets.set(key, bucket);
      }

      bucket.count += 1;
      if (bucket.count > options.limit) throw ApiError.tooManyRequests(options.message);

      const current = bucket;
      return {
        succeed: () => {
          current.count = Math.max(0, current.count - 1);
        },
      };
    },
  };
};

/** Testlərdə limitləri sıfırlamaq üçün. */
export const resetRateLimits = (): void => buckets.clear();

const LOGIN_MESSAGE = "Too many login attempts. Please try again later.";

export const adminLoginLimiter = createRateLimiter({
  name: "admin-login",
  windowMinutes: 15,
  limit: 10,
  message: LOGIN_MESSAGE,
});

export const customerLoginLimiter = createRateLimiter({
  name: "customer-login",
  windowMinutes: 15,
  limit: 10,
  message: LOGIN_MESSAGE,
});

export const registerLimiter = createRateLimiter({
  name: "register",
  windowMinutes: 60,
  limit: 10,
  message: "Too many registration attempts. Please try again later.",
});

export const orderLimiter = createRateLimiter({
  name: "order",
  windowMinutes: 15,
  // Testlər çox sifariş yaratdığı üçün test mühitində limit yüksəldilir
  limit: process.env.NODE_ENV === "test" ? 1000 : 20,
  message: "Too many orders. Please try again later.",
});

export const apiLimiter = createRateLimiter({
  name: "api",
  windowMinutes: 15,
  limit: 2000,
  message: "Too many requests.",
});

export const reviewLimiter = createRateLimiter({
  name: "review",
  windowMinutes: 60,
  limit: 10,
  message: "Too many reviews. Please try again later.",
});
