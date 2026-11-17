import crypto from "node:crypto";
import { getEnv } from "../config/env";
import { Session, type SessionKind } from "../models/session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

interface CookieSpec {
  name: string;
  path: string;
}

// Admin və müştəri sessiyaları ayrıdır: cookie-lər ayrı ad və path ilə saxlanılır
const COOKIES: Record<SessionKind, CookieSpec> = {
  admin: { name: "chrono.admin.sid", path: "/api/admin" },
  customer: { name: "chrono.customer.sid", path: "/api" },
};

const sign = (sid: string): string =>
  crypto.createHmac("sha256", getEnv().sessionSecret).update(sid).digest("base64url");

const timingSafeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

/** Cookie dəyəri: `<sid>.<imza>` */
const encodeCookie = (sid: string): string => `${sid}.${sign(sid)}`;

const decodeCookie = (value: string | undefined): string | null => {
  if (!value) return null;
  const [sid, signature, ...rest] = value.split(".");
  if (!sid || !signature || rest.length > 0) return null;
  return timingSafeEqual(signature, sign(sid)) ? sid : null;
};

const readCookie = (request: Request, name: string): string | undefined => {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return undefined;
};

const serializeCookie = (spec: CookieSpec, value: string, maxAgeSeconds: number): string => {
  const parts = [
    `${spec.name}=${encodeURIComponent(value)}`,
    `Path=${spec.path}`,
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (getEnv().isProduction) parts.push("Secure");
  return parts.join("; ");
};

/** Sorğudakı sessiyanın istifadəçi ID-sini qaytarır (yoxdursa və ya vaxtı bitibsə null). */
export const getSessionUserId = async (
  request: Request,
  kind: SessionKind
): Promise<string | null> => {
  const sid = decodeCookie(readCookie(request, COOKIES[kind].name));
  if (!sid) return null;

  const session = await Session.findOne({ _id: sid, kind, expiresAt: { $gt: new Date() } }).lean();
  return session?.userId ?? null;
};

/** Yeni sessiya yaradır (session fixation qorunması: həmişə yeni ID) və Set-Cookie başlığını qaytarır. */
export const startSession = async (kind: SessionKind, userId: string): Promise<string> => {
  const sid = crypto.randomBytes(32).toString("base64url");

  await Session.create({ _id: sid, kind, userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) });

  return serializeCookie(COOKIES[kind], encodeCookie(sid), SESSION_TTL_MS / 1000);
};

/** Sessiyanı bazadan silir və cookie-ni təmizləyən Set-Cookie başlığını qaytarır. */
export const endSession = async (request: Request, kind: SessionKind): Promise<string> => {
  const sid = decodeCookie(readCookie(request, COOKIES[kind].name));
  if (sid) await Session.deleteOne({ _id: sid });

  return serializeCookie(COOKIES[kind], "", 0);
};
