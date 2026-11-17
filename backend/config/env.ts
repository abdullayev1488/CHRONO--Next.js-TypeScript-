const REQUIRED = ["MONGO_URI", "SESSION_SECRET"] as const;

export interface Env {
  isProduction: boolean;
  isTest: boolean;
  mongoUri: string;
  sessionSecret: string;
  /** X-Forwarded-For-a etibar edilən proxy sayı (0 = etibar edilmir) */
  trustProxy: number;
  /** Email təsdiqi qurulmayana qədər production-da public qeydiyyat bağlıdır */
  publicRegistration: boolean;
}

let cached: Env | undefined;

/** Mühit dəyişənlərini ilk istifadədə yoxlayıb saxlayır (build zamanı import səhv vermir). */
export const getEnv = (): Env => {
  if (cached) return cached;

  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET as string;

  if (isProduction && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production");
  }

  cached = {
    isProduction,
    isTest: process.env.NODE_ENV === "test",
    mongoUri: process.env.MONGO_URI as string,
    sessionSecret,
    trustProxy: Number(process.env.TRUST_PROXY) || 0,
    publicRegistration: !isProduction || process.env.ALLOW_PUBLIC_REGISTRATION === "true",
  };

  return cached;
};
