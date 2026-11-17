import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Order } from "@/backend/models/order";
import { Product } from "@/backend/models/product";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SEEDED_IMAGES_DIR,
  buildForm,
  client,
  loginAdmin,
  orderPayload,
  pngBuffer,
  resetRateLimits,
  setup,
  teardown,
  uploadedFile,
  type TestClient,
} from "./helpers";

const UNKNOWN_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

const productFields: Record<string, string> = {
  name: "Test Watch",
  brand: "TESTBRAND",
  category: "Modern",
  price: "250",
  oldPrice: "",
  badge: "New",
  featured: "true",
  stock: "5",
};

const png = (filename = "x.png") => ({ data: pngBuffer(), filename, type: "image/png" });

let admin: TestClient;

const createTestProduct = (overrides: Record<string, string> = {}) =>
  admin.post("/api/admin/products", {
    form: buildForm({ ...productFields, ...overrides }, png()),
  });

/** Uğurlu yaradılmanı yoxlayıb məhsulu qaytarır */
const createProduct = async (overrides: Record<string, string> = {}) => {
  const res = await createTestProduct(overrides);
  expect(res.status).toBe(201);
  return res.body;
};

beforeAll(async () => {
  await setup();
  admin = await loginAdmin();
});

afterAll(teardown);

// Giriş limitləyiciləri bütün testlər üçün eyni IP-ni paylaşır
beforeEach(() => resetRateLimits());

describe("public products", () => {
  it("returns all seeded products", async () => {
    const res = await client().get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(30);
  });

  it("returns 400 for an invalid ID and 404 for an unknown one", async () => {
    expect((await client().get("/api/products/not-an-id")).status).toBe(400);
    expect((await client().get(`/api/products/${UNKNOWN_ID}`)).status).toBe(404);
  });

  it("rejects NoSQL operator objects as ID", async () => {
    expect((await client().get("/api/products/%7B%22%24ne%22%3Anull%7D")).status).toBe(400);
  });

  // "returns 404 for unknown routes" Express-ə məxsus idi: Next.js mövcud olmayan
  // route-u özü 404 ilə cavablandırır, handler yoxdur (helpers-dəki mini router da 404 qaytarır).
  it("returns 404 for unknown routes", async () => {
    expect((await client().get("/api/nope")).status).toBe(404);
  });
});

describe("admin authentication", () => {
  it("blocks unauthenticated admin routes", async () => {
    const anon = client();

    expect((await anon.get("/api/admin/me")).status).toBe(401);
    expect((await anon.post("/api/admin/products")).status).toBe(401);
    expect((await anon.delete(`/api/admin/products/${UNKNOWN_ID}`)).status).toBe(401);
    expect((await anon.get("/api/admin/orders")).status).toBe(401);
    expect((await anon.get("/api/admin/customers")).status).toBe(401);
    expect((await anon.get("/api/admin/stats")).status).toBe(401);
  });

  it("rejects write requests from a foreign or missing origin", async () => {
    const credentials = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };

    const foreign = await client().post("/api/admin/login", {
      json: credentials,
      origin: "http://evil.example",
    });
    const missing = await client().post("/api/admin/login", { json: credentials, origin: null });

    expect(foreign.status).toBe(403);
    expect(missing.status).toBe(403);
  });

  it("validates the login payload", async () => {
    const anon = client();

    expect((await anon.post("/api/admin/login", { json: {} })).status).toBe(400);
    expect(
      (
        await anon.post("/api/admin/login", {
          json: { email: { $ne: null }, password: { $ne: null } },
        })
      ).status
    ).toBe(400);
  });

  it("rejects a wrong password and a missing admin with the same message", async () => {
    const anon = client();

    const wrong = await anon.post("/api/admin/login", {
      json: { email: ADMIN_EMAIL, password: "WrongPassw0rd!" },
    });
    const missing = await anon.post("/api/admin/login", {
      json: { email: "nobody@chrono.test", password: "WrongPassw0rd!" },
    });

    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(wrong.body.message).toBe(missing.body.message);
  });

  it("logs in with an HttpOnly cookie, keeps the session and logs out", async () => {
    const anon = client();

    const res = await anon.post("/api/admin/login", {
      json: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.status).toBe(200);

    const cookie = res.setCookies.join(";");
    expect(cookie).toMatch(/chrono\.admin\.sid=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(res.body.admin.passwordHash).toBeUndefined();

    expect((await anon.get("/api/admin/me")).status).toBe(200);
    expect((await anon.post("/api/admin/logout")).status).toBe(200);
    expect((await anon.get("/api/admin/me")).status).toBe(401);
  });
});

describe("product CRUD", () => {
  it("creates a product with an uploaded image", async () => {
    const res = await createTestProduct();

    expect(res.status).toBe(201);
    expect(res.body.image).toMatch(/^\/images\/uploads\/[0-9a-f-]+\.png$/);
    expect(res.body.badge).toBe("New");
    expect(res.body.featured).toBe(true);
    expect(fs.existsSync(uploadedFile(res.body))).toBe(true);

    const image = await client().get(res.body.image);
    expect(image.status).toBe(200);
    expect(image.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("rejects a fake image (wrong signature) even with an image MIME type", async () => {
    const res = await admin.post("/api/admin/products", {
      form: buildForm(productFields, {
        data: Buffer.from("this is not an image at all"),
        filename: "x.png",
        type: "image/png",
      }),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/PNG, JPEG or WEBP/);
  });

  it("rejects a missing image and oversized images", async () => {
    const missing = await admin.post("/api/admin/products", { form: buildForm(productFields) });
    expect(missing.status).toBe(400);

    const big = Buffer.concat([pngBuffer(), Buffer.alloc(9 * 1024 * 1024)]);
    const oversized = await admin.post("/api/admin/products", {
      form: buildForm(productFields, { data: big, filename: "big.png", type: "image/png" }),
    });
    expect(oversized.status).toBe(400);
  });

  it("validates fields on the server", async () => {
    const invalid: Record<string, string>[] = [
      { name: "" },
      { category: "Weird" },
      { price: "-1" },
      { price: "abc" },
      { stock: "1.5" },
      { stock: "-2" },
      { badge: "Hot" },
    ];

    for (const overrides of invalid) {
      expect((await createTestProduct(overrides)).status, JSON.stringify(overrides)).toBe(400);
    }
  });

  it("ignores client-supplied _id, image and unknown fields", async () => {
    const res = await createTestProduct({
      _id: UNKNOWN_ID,
      image: "/images/watches/evil.png",
      archived: "true",
      isAdmin: "true",
    });

    expect(res.status).toBe(201);
    expect(res.body._id).not.toBe(UNKNOWN_ID);
    expect(res.body.image).toMatch(/^\/images\/uploads\//);

    const stored = await Product.findById(res.body._id).lean();
    expect(stored?.archived).toBe(false);
    expect(stored).not.toHaveProperty("isAdmin");
  });

  it("updates fields and keeps the old image when none is sent", async () => {
    const created = await createProduct();

    const res = await admin.put(`/api/admin/products/${created._id}`, {
      form: buildForm({ ...productFields, name: "Renamed Watch", badge: "None", stock: "7" }),
    });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed Watch");
    expect(res.body.badge).toBeNull();
    expect(res.body.stock).toBe(7);
    expect(res.body.image).toBe(created.image);
    expect(fs.existsSync(uploadedFile(created))).toBe(true);
  });

  it("replaces the image and removes the old uploaded file", async () => {
    const created = await createProduct();

    const res = await admin.put(`/api/admin/products/${created._id}`, {
      form: buildForm(productFields, png("new.png")),
    });

    expect(res.status).toBe(200);
    expect(res.body.image).not.toBe(created.image);
    expect(fs.existsSync(uploadedFile(created))).toBe(false);
    expect(fs.existsSync(uploadedFile(res.body))).toBe(true);
  });

  it("never deletes seeded images when a seeded product image is replaced", async () => {
    const seeded = await Product.findOne({ image: /watches/ });
    if (!seeded) throw new Error("No seeded product found");
    const seededFile = path.join(SEEDED_IMAGES_DIR, path.basename(seeded.image));

    const res = await admin.put(`/api/admin/products/${seeded._id}`, {
      form: buildForm(productFields, png("n.png")),
    });

    expect(res.status).toBe(200);
    expect(fs.existsSync(seededFile)).toBe(true);
  });

  it("returns 404 / 400 for unknown or invalid IDs", async () => {
    const update = await admin.put(`/api/admin/products/${UNKNOWN_ID}`, {
      form: buildForm(productFields),
    });

    expect(update.status).toBe(404);
    expect((await admin.delete(`/api/admin/products/${UNKNOWN_ID}`)).status).toBe(404);
    expect((await admin.delete("/api/admin/products/bad-id")).status).toBe(400);
  });

  it("deletes a product without orders and removes its image", async () => {
    const created = await createProduct();

    expect((await admin.delete(`/api/admin/products/${created._id}`)).status).toBe(200);

    expect(await Product.findById(created._id)).toBeNull();
    expect(fs.existsSync(uploadedFile(created))).toBe(false);
    expect((await client().get(`/api/products/${created._id}`)).status).toBe(404);
  });
});

describe("orders and stock", () => {
  let product: { _id: string };

  beforeAll(async () => {
    product = await createProduct({ price: "100", stock: "5" });
  });

  const place = (payload: unknown, key: string) =>
    client().post("/api/orders", { json: payload, headers: { "Idempotency-Key": key } });

  it("requires an Idempotency-Key header", async () => {
    const res = await client().post("/api/orders", { json: orderPayload(product._id) });

    expect(res.status).toBe(400);
  });

  it("validates the order payload", async () => {
    const cases: [unknown, string][] = [
      [{ ...orderPayload(product._id), items: [] }, "key-empty-0001"],
      [orderPayload(product._id, 0), "key-qty-zero-1"],
      [orderPayload(product._id, 1.5), "key-qty-frac-1"],
      [orderPayload("bad-id", 1), "key-bad-id-0001"],
      [orderPayload(product._id, 1, { shippingMethod: "teleport" }), "key-ship-0001x"],
      [orderPayload(product._id, 1, { contact: { firstName: "A" } }), "key-contact-001"],
    ];

    for (const [payload, key] of cases) {
      expect((await place(payload, key)).status, key).toBe(400);
    }
  });

  it("calculates prices on the server and ignores client totals", async () => {
    const res = await place(
      {
        ...orderPayload(product._id, 1),
        total: 1,
        subtotal: 1,
        items: [{ productId: product._id, quantity: 1, price: 1 }],
      },
      "key-server-price-1"
    );

    expect(res.status).toBe(201);
    expect(res.body.subtotal).toBe(100);
    expect(res.body.shipping).toBe(10);
    expect(res.body.total).toBe(110);
    expect(res.body.items[0].unitPrice).toBe(100);
    expect(res.body.status).toBe("Pending");
    expect(res.body.paymentStatus).toBe("Unpaid");
    expect((await Product.findById(product._id))?.stock).toBe(4);
  });

  it("applies shipping rules (standard free over $150, express $20)", async () => {
    const premium = await createProduct({ price: "200", stock: "5" });
    const free = await place(orderPayload(premium._id, 1), "key-ship-free-001");
    expect(free.status).toBe(201);
    expect(free.body.shipping).toBe(0);
    expect(free.body.total).toBe(200);

    const cheap = await createProduct({ price: "50", stock: "5" });

    const standard = await place(orderPayload(cheap._id, 1), "key-ship-std-0001");
    expect(standard.status).toBe(201);
    expect(standard.body.shipping).toBe(10);
    expect(standard.body.total).toBe(60);

    const express = await place(
      orderPayload(product._id, 1, { shippingMethod: "express" }),
      "key-ship-exp-0001"
    );
    expect(express.status).toBe(201);
    expect(express.body.shipping).toBe(20);
    expect(express.body.total).toBe(120);
  });

  it("is idempotent: the same key creates one order and reduces stock once", async () => {
    const stockBefore = (await Product.findById(product._id))?.stock;

    const first = await place(orderPayload(product._id, 1), "key-idempotent-1");
    const second = await place(orderPayload(product._id, 1), "key-idempotent-1");

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(first.body._id).toBe(second.body._id);
    expect((await Product.findById(product._id))?.stock).toBe((stockBefore ?? 0) - 1);
    expect(await Order.countDocuments({ idempotencyKey: "key-idempotent-1" })).toBe(1);
  });

  it("rejects orders above available stock without changing stock", async () => {
    const current = (await Product.findById(product._id))?.stock;

    const res = await place(orderPayload(product._id, 10), "key-too-many-001");

    expect(res.status).toBe(409);
    expect(res.body.available).toBe(current);
    expect((await Product.findById(product._id))?.stock).toBe(current);
  });

  it("rolls back every item when one line cannot be fulfilled", async () => {
    const other = await createProduct({ price: "10", stock: "3" });
    const payload = orderPayload(other._id, 1, {
      items: [
        { productId: other._id, quantity: 1 },
        { productId: product._id, quantity: 10 },
      ],
    });

    expect((await place(payload, "key-rollback-0001")).status).toBe(409);

    expect((await Product.findById(other._id))?.stock).toBe(3);
  });

  it("never oversells under concurrent requests", async () => {
    const scarce = await createProduct({ price: "10", stock: "2" });

    const results = await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        place(orderPayload(scarce._id, 1), `key-race-000${index}`)
      )
    );

    expect(results.filter((res) => res.status === 201)).toHaveLength(2);
    expect((await Product.findById(scarce._id))?.stock).toBe(0);
  });

  it("archives instead of deleting a product that has orders", async () => {
    expect((await admin.delete(`/api/admin/products/${product._id}`)).status).toBe(200);

    const stored = await Product.findById(product._id);
    expect(stored?.archived).toBe(true);
    expect((await client().get(`/api/products/${product._id}`)).status).toBe(404);

    const list = await client().get("/api/products");
    expect(list.status).toBe(200);
    expect(list.body.some((item: { _id: string }) => item._id === product._id)).toBe(false);

    const order = await Order.findOne({ "items.product": product._id });
    expect(order?.items[0].name).toBe("Test Watch");

    expect((await place(orderPayload(product._id, 1), "key-archived-0001")).status).toBe(409);
  });
});

describe("admin orders and stats", () => {
  let product: { _id: string };
  let order: { _id: string; orderNumber: string };

  beforeAll(async () => {
    product = await createProduct({ price: "200", stock: "4", name: "Stats Watch" });

    const res = await client().post("/api/orders", {
      json: orderPayload(product._id, 2),
      headers: { "Idempotency-Key": "key-admin-order-1" },
    });
    expect(res.status).toBe(201);
    order = res.body;
  });

  it("lists, searches and filters orders with pagination", async () => {
    const all = await admin.get("/api/admin/orders?limit=2&page=1");
    expect(all.status).toBe(200);
    expect(all.body.total).toBeGreaterThanOrEqual(1);
    expect(all.body.orders.length).toBeLessThanOrEqual(2);

    const search = await admin.get(`/api/admin/orders?search=${order.orderNumber}`);
    expect(search.status).toBe(200);
    expect(search.body.orders).toHaveLength(1);

    const none = await admin.get("/api/admin/orders?search=.*");
    expect(none.status).toBe(200);
    expect(none.body.orders).toHaveLength(0);

    const filtered = await admin.get("/api/admin/orders?status=Delivered");
    expect(filtered.status).toBe(200);
    expect(filtered.body.orders).toHaveLength(0);
  });

  it("returns order details and rejects invalid IDs", async () => {
    const res = await admin.get(`/api/admin/orders/${order._id}`);
    expect(res.status).toBe(200);
    expect(res.body.items[0].name).toBe("Stats Watch");

    expect((await admin.get("/api/admin/orders/bad")).status).toBe(400);
    expect((await admin.get(`/api/admin/orders/${UNKNOWN_ID}`)).status).toBe(404);
  });

  it("reports real aggregates", async () => {
    const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const res = await admin.get(`/api/admin/stats?from=${from}&tz=UTC`);

    expect(res.status).toBe(200);
    expect(res.body.kpis.orders.value).toBeGreaterThanOrEqual(1);
    expect(res.body.kpis.revenue.value).toBeGreaterThanOrEqual(400);
    expect(
      res.body.topProducts.some(
        (entry: { name: string; sold: number }) => entry.name === "Stats Watch" && entry.sold === 2
      )
    ).toBe(true);
    expect(res.body.recentOrders.length).toBeGreaterThanOrEqual(1);

    expect((await admin.get("/api/admin/stats?from=garbage")).status).toBe(400);
  });

  it("validates status values and transitions", async () => {
    const url = `/api/admin/orders/${order._id}`;

    expect((await admin.patch(url, { json: { status: "Bogus" } })).status).toBe(400);
    expect((await admin.patch(url, { json: {} })).status).toBe(400);
    expect((await admin.patch(url, { json: { status: "Delivered" } })).status).toBe(409);

    const shipped = await admin.patch(url, { json: { status: "Shipped" } });
    expect(shipped.status).toBe(200);
    expect(shipped.body.status).toBe("Shipped");
  });

  it("restocks when an order is cancelled", async () => {
    const placed = await client().post("/api/orders", {
      json: orderPayload(product._id, 1),
      headers: { "Idempotency-Key": "key-cancel-order-1" },
    });
    expect(placed.status).toBe(201);
    const fresh = placed.body;
    const stockBefore = (await Product.findById(product._id))?.stock ?? 0;

    const url = `/api/admin/orders/${fresh._id}`;
    expect((await admin.patch(url, { json: { status: "Cancelled" } })).status).toBe(200);

    expect((await Product.findById(product._id))?.stock).toBe(stockBefore + 1);

    expect((await admin.patch(url, { json: { status: "Pending" } })).status).toBe(409);
    expect((await admin.patch(url, { json: { paymentStatus: "Paid" } })).status).toBe(409);
  });
});

describe("customer authentication", () => {
  const customer = {
    firstName: "Jane",
    lastName: "Roe",
    email: "jane@example.com",
    password: "Str0ngCustomerPass",
  };

  const login = (anon: TestClient) =>
    anon.post("/api/auth/login", { json: { email: customer.email, password: customer.password } });

  it("rejects weak passwords and invalid input", async () => {
    const anon = client();
    const register = (overrides: Record<string, string>) =>
      anon.post("/api/auth/register", { json: { ...customer, ...overrides } });

    expect((await register({ password: "short" })).status).toBe(400);
    expect((await register({ password: "alllowercase12345" })).status).toBe(400);
    expect((await register({ email: "nope" })).status).toBe(400);
    expect((await register({ firstName: "" })).status).toBe(400);
  });

  it("registers an unverified customer and never marks the email as verified", async () => {
    const anon = client();

    const res = await anon.post("/api/auth/register", { json: customer });

    expect(res.status).toBe(201);
    expect(res.body.customer.emailVerified).toBe(false);
    expect(res.body.customer.passwordHash).toBeUndefined();
    expect(res.setCookies.join(";")).toMatch(/chrono\.customer\.sid=.*HttpOnly/i);

    expect((await anon.post("/api/auth/register", { json: customer })).status).toBe(409);
  });

  it("logs in, reads the current customer, and logs out", async () => {
    const anon = client();

    const wrong = await anon.post("/api/auth/login", {
      json: { email: customer.email, password: "WrongPassw0rd!" },
    });
    expect(wrong.status).toBe(401);
    expect((await login(anon)).status).toBe(200);

    const me = await anon.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.customer.email).toBe(customer.email);

    expect((await anon.post("/api/auth/logout")).status).toBe(200);
    const after = await anon.get("/api/auth/me");
    expect(after.status).toBe(200);
    expect(after.body.customer).toBeNull();
  });

  it("keeps customer and admin sessions separate", async () => {
    const anon = client();

    expect((await login(anon)).status).toBe(200);
    expect((await anon.get("/api/admin/me")).status).toBe(401);
    expect((await anon.get("/api/admin/customers")).status).toBe(401);
  });

  it("links orders to a logged-in customer and exposes them to the admin only", async () => {
    const buyer = client();
    expect((await login(buyer)).status).toBe(200);

    const product = await createProduct({ price: "300", stock: "3" });
    const placed = await buyer.post("/api/orders", {
      json: orderPayload(product._id, 1),
      headers: { "Idempotency-Key": "key-customer-order" },
    });
    expect(placed.status).toBe(201);

    const mine = await buyer.get("/api/orders/mine");
    expect(mine.status).toBe(200);
    expect(mine.body).toHaveLength(1);
    expect((await client().get("/api/orders/mine")).status).toBe(401);

    const list = await admin.get("/api/admin/customers?search=jane");
    expect(list.status).toBe(200);
    expect(list.body.customers).toHaveLength(1);
    expect(list.body.customers[0].ordersCount).toBe(1);
    expect(list.body.customers[0].totalSpent).toBe(300);
    expect(list.body.customers[0].passwordHash).toBeUndefined();

    const detail = await admin.get(`/api/admin/customers/${list.body.customers[0]._id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.orders).toHaveLength(1);
  });
});

// Helmet və CORS Express-ə məxsus idi. API indi eyni origin-dədir (dashboard və sayt eyni
// Next.js tətbiqində), ona görə CORS başlıqları verilmir və xarici origin-dən yazma
// sorğuları "rejects write requests from a foreign or missing origin" testində bloklanır.
describe("cross-origin policy", () => {
  it("does not grant CORS access to foreign origins", async () => {
    const res = await client().get("/api/products", { origin: "http://evil.example" });

    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("blocks cross-origin write requests on every mutating public endpoint", async () => {
    const foreign = { origin: "http://evil.example" };

    expect((await client().post("/api/auth/login", { json: {}, ...foreign })).status).toBe(403);
    expect((await client().post("/api/orders", { json: {}, ...foreign })).status).toBe(403);
  });
});

describe("rate limiting", () => {
  it("blocks repeated failed admin logins", async () => {
    const anon = client();
    const statuses: number[] = [];

    for (let i = 0; i < 12; i += 1) {
      const res = await anon.post("/api/admin/login", {
        json: { email: ADMIN_EMAIL, password: "WrongPassw0rd!" },
      });
      statuses.push(res.status);
    }

    expect(statuses).toContain(429);
  });
});
