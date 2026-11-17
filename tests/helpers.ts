import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { connectDB } from "@/backend/config/db";
import { products as seedProducts } from "@/backend/data/products";
import { resetRateLimits } from "@/backend/http/rateLimit";
import { Admin } from "@/backend/models/admin";
import { Customer } from "@/backend/models/customer";
import { Order } from "@/backend/models/order";
import { Product } from "@/backend/models/product";
import { Session } from "@/backend/models/session";
import { createAdminAccount } from "@/backend/services/adminService";

export const TEST_DB = "chrono_test";
export const ADMIN_EMAIL = "admin.test@chrono.test";
export const ADMIN_PASSWORD = "Str0ngTestPassw0rd";

const SAME_ORIGIN = "http://localhost";

let replSet: MongoMemoryReplSet | undefined;

/** Müvəqqəti MongoDB replica set (transaction üçün) qaldırır, seed edir və admin yaradır. */
export const setup = async (): Promise<void> => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGO_URI = replSet.getUri(TEST_DB);

  await connectDB();

  const models = [Product, Order, Admin, Customer, Session];
  await Promise.all(models.map((model) => model.createCollection()));
  await Promise.all(models.map((model) => model.syncIndexes()));

  await Product.insertMany(seedProducts.map((product) => ({ ...product, stock: 10 })));
  await createAdminAccount(ADMIN_EMAIL, ADMIN_PASSWORD);

  await fs.mkdir(process.env.UPLOADS_DIR as string, { recursive: true });
};

export const teardown = async (): Promise<void> => {
  await mongoose.disconnect();
  await replSet?.stop();
  await fs.rm(process.env.UPLOADS_DIR as string, { recursive: true, force: true });
};

export { resetRateLimits };

// ---------------------------------------------------------------------------
// Route handler-ləri URL-ə görə tapan mini router (Next.js-in öz routerini əvəz edir)
// ---------------------------------------------------------------------------

type Handler = (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<Response>;
type RouteModule = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", Handler>>;

const routeFiles = import.meta.glob<RouteModule>("/app/**/route.ts");

interface RoutePattern {
  segments: string[];
  load: () => Promise<RouteModule>;
}

const patterns: RoutePattern[] = Object.entries(routeFiles).map(([file, load]) => ({
  segments: file.replace(/^\/app\//, "").replace(/\/?route\.ts$/, "").split("/").filter(Boolean),
  load,
}));

const matchRoute = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);

  for (const { segments, load } of patterns) {
    if (segments.length !== parts.length) continue;

    const params: Record<string, string> = {};
    const matches = segments.every((segment, index) => {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        params[segment.slice(1, -1)] = decodeURIComponent(parts[index]);
        return true;
      }
      return segment === parts[index];
    });

    if (matches) return { load, params };
  }

  return null;
};

// ---------------------------------------------------------------------------
// Cookie saxlayan test müştərisi
// ---------------------------------------------------------------------------

export interface TestResponse {
  status: number;
  headers: Headers;
  /** Set-Cookie başlıqları (hər biri ayrıca) */
  setCookies: string[];
  /** Tipsiz JSON cavab: testlər sahələri birbaşa yoxlayır */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}

export interface RequestOptions {
  json?: unknown;
  form?: FormData;
  headers?: Record<string, string>;
  /** `null` — Origin başlığı göndərilmir; verilməyibsə eyni origin göndərilir */
  origin?: string | null;
}

export const client = () => {
  const jar = new Map<string, string>();

  const send = async (method: string, url: string, options: RequestOptions = {}): Promise<TestResponse> => {
    const { pathname, search } = new URL(url, SAME_ORIGIN);
    const route = matchRoute(pathname);

    if (!route) return { status: 404, headers: new Headers(), setCookies: [], body: null };

    const headers = new Headers({ host: "localhost", ...options.headers });
    const origin = options.origin === undefined ? SAME_ORIGIN : options.origin;
    if (origin) headers.set("origin", origin);
    if (jar.size > 0) {
      headers.set("cookie", [...jar].map(([name, value]) => `${name}=${value}`).join("; "));
    }

    let body: BodyInit | undefined;
    if (options.form) {
      body = options.form;
    } else if (options.json !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(options.json);
    }

    const handler = (await route.load())[method as keyof RouteModule];
    if (!handler) return { status: 405, headers: new Headers(), setCookies: [], body: null };

    const request = new Request(`${SAME_ORIGIN}${pathname}${search}`, { method, headers, body });
    const response = await handler(request, { params: Promise.resolve(route.params) });

    const setCookies = response.headers.getSetCookie();
    for (const cookie of setCookies) {
      const [pair] = cookie.split(";");
      const [name, ...value] = pair.split("=");
      const joined = value.join("=");
      if (/Max-Age=0/i.test(cookie) || joined === "") jar.delete(name);
      else jar.set(name, joined);
    }

    const text = await response.text();
    const isJson = response.headers.get("content-type")?.includes("application/json");

    return {
      status: response.status,
      headers: response.headers,
      setCookies,
      body: isJson && text ? JSON.parse(text) : text,
    };
  };

  return {
    get: (url: string, options?: RequestOptions) => send("GET", url, options),
    post: (url: string, options?: RequestOptions) => send("POST", url, options),
    put: (url: string, options?: RequestOptions) => send("PUT", url, options),
    patch: (url: string, options?: RequestOptions) => send("PATCH", url, options),
    delete: (url: string, options?: RequestOptions) => send("DELETE", url, options),
  };
};

export type TestClient = ReturnType<typeof client>;

export const loginAdmin = async (): Promise<TestClient> => {
  const admin = client();
  const res = await admin.post("/api/admin/login", { json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  if (res.status !== 200) throw new Error(`Admin login failed: ${res.status}`);
  return admin;
};

// ---------------------------------------------------------------------------
// Test məlumatı köməkçiləri
// ---------------------------------------------------------------------------

/** Minimal etibarlı PNG signature + doldurucu */
export const pngBuffer = (): Buffer =>
  Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);

export interface TestImage {
  data: Buffer;
  filename: string;
  type: string;
}

export interface FormExtras {
  /** Təkrarlanan `gallery` fayl sahələri */
  gallery?: TestImage[];
  /** Təkrarlanan `removeGallery` mətn sahələri */
  removeGallery?: string[];
}

const toBlob = (image: TestImage): Blob => new Blob([new Uint8Array(image.data)], { type: image.type });

export const buildForm = (
  fields: Record<string, string>,
  image?: TestImage,
  extras: FormExtras = {}
): FormData => {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  if (image) form.append("image", toBlob(image), image.filename);
  for (const file of extras.gallery ?? []) form.append("gallery", toBlob(file), file.filename);
  for (const url of extras.removeGallery ?? []) form.append("removeGallery", url);
  return form;
};

export const orderPayload = (productId: string, quantity = 1, overrides: Record<string, unknown> = {}) => ({
  items: [{ productId, quantity }],
  shippingMethod: "standard",
  contact: { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+994 50 123 45 67" },
  shippingAddress: { country: "Azerbaijan", city: "Baku", address: "1 Test street", postalCode: "AZ1000" },
  ...overrides,
});

/** Yüklənmiş şəklin diskdəki yolu */
/** Yüklənmiş şəklin (əsas və ya qalereya URL-i) test qovluğundakı yolu */
export const uploadedFile = (product: { image: string } | string): string =>
  path.join(
    process.env.UPLOADS_DIR as string,
    path.basename(typeof product === "string" ? product : product.image)
  );

export const SEEDED_IMAGES_DIR = path.join(process.cwd(), "public", "images", "watches");
