import fs from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Product } from "@/backend/models/product";
import {
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
  type TestImage,
} from "./helpers";

const productFields: Record<string, string> = {
  name: "Spec Watch",
  brand: "SPECBRAND",
  category: "Classic",
  price: "500",
  oldPrice: "",
  badge: "",
  featured: "false",
  stock: "5",
};

const specFields: Record<string, string> = {
  mechanism: "Automatic",
  caseSize: "41",
  caseMaterial: "Stainless steel",
  strap: "Leather",
  waterResistance: "100",
  glass: "Sapphire crystal",
};

const png = (filename = "x.png"): TestImage => ({ data: pngBuffer(), filename, type: "image/png" });

const pngs = (count: number): TestImage[] =>
  Array.from({ length: count }, (_, index) => png(`g${index}.png`));

let admin: TestClient;

beforeAll(async () => {
  await setup();
  admin = await loginAdmin();
});

afterAll(teardown);

beforeEach(() => resetRateLimits());

const create = (fields: Record<string, string>, gallery: TestImage[] = []) =>
  admin.post("/api/admin/products", { form: buildForm(fields, png(), { gallery }) });

/** Uğurlu yaradılmanı yoxlayıb məhsulu qaytarır */
const createProduct = async (fields: Record<string, string> = {}, gallery: TestImage[] = []) => {
  const res = await create({ ...productFields, ...specFields, ...fields }, gallery);
  expect(res.status).toBe(201);
  return res.body;
};

const update = (id: string, fields: Record<string, string>, gallery: TestImage[] = [], removeGallery: string[] = []) =>
  admin.put(`/api/admin/products/${id}`, {
    form: buildForm({ ...productFields, ...specFields, ...fields }, undefined, { gallery, removeGallery }),
  });

describe("product specs and gallery", () => {
  it("creates a product with specs and gallery and exposes them publicly", async () => {
    const created = await createProduct({}, pngs(2));

    expect(created.specs).toEqual({
      mechanism: "Automatic",
      caseSize: 41,
      caseMaterial: "Stainless steel",
      strap: "Leather",
      waterResistance: 100,
      glass: "Sapphire crystal",
    });
    expect(created.images).toHaveLength(2);
    created.images.forEach((url: string) => expect(fs.existsSync(uploadedFile(url))).toBe(true));
    expect(created.images).not.toContain(created.image);

    const single = await client().get(`/api/products/${created._id}`);
    expect(single.status).toBe(200);
    expect(single.body.specs.mechanism).toBe("Automatic");
    expect(single.body.images).toEqual(created.images);

    const list = await client().get("/api/products");
    const listed = list.body.find((product: { _id: string }) => product._id === created._id);
    expect(listed.specs.caseSize).toBe(41);
    expect(listed.images).toHaveLength(2);

    const galleryImage = await client().get(created.images[0]);
    expect(galleryImage.status).toBe(200);
  });

  it("defaults blank specs to null and gallery to an empty list", async () => {
    const res = await create(productFields);

    expect(res.status).toBe(201);
    expect(res.body.specs).toEqual({
      mechanism: null,
      caseSize: null,
      caseMaterial: null,
      strap: null,
      waterResistance: null,
      glass: null,
    });
    expect(res.body.images).toEqual([]);
  });

  it("returns defaults for legacy products stored without specs or images", async () => {
    const legacy = await Product.collection.insertOne({
      name: "Legacy Watch",
      brand: "OLD",
      category: "Classic",
      price: 100,
      oldPrice: null,
      image: "/images/watches/legacy.png",
      badge: null,
      featured: false,
      stock: 3,
      archived: false,
    });

    const res = await client().get(`/api/products/${legacy.insertedId}`);

    expect(res.status).toBe(200);
    expect(res.body.images).toEqual([]);
    expect(res.body.specs.mechanism).toBeNull();
    expect(res.body.specs.caseSize).toBeNull();
  });

  it("validates specs on the server", async () => {
    const invalid: Array<[Record<string, string>, RegExp]> = [
      [{ mechanism: "Steam" }, /mechanism/i],
      [{ caseSize: "10" }, /Case size/],
      [{ caseSize: "61" }, /Case size/],
      [{ caseSize: "abc" }, /Case size/],
      [{ waterResistance: "-1" }, /Water resistance/],
      [{ waterResistance: "1001" }, /Water resistance/],
      [{ waterResistance: "10.5" }, /Water resistance/],
      [{ caseMaterial: "x".repeat(61) }, /Case material/],
      [{ strap: "x".repeat(61) }, /Strap/],
      [{ glass: "x".repeat(61) }, /Glass/],
    ];

    for (const [override, message] of invalid) {
      const res = await create({ ...productFields, ...specFields, ...override });

      expect(res.status, JSON.stringify(override)).toBe(400);
      expect(res.body.message).toMatch(message);
    }
  });

  it("rejects more than four gallery images and fake gallery files", async () => {
    const tooMany = await create({ ...productFields, ...specFields }, pngs(5));
    expect(tooMany.status).toBe(400);
    expect(tooMany.body.message).toMatch(/at most 4/);

    const before = fs.readdirSync(process.env.UPLOADS_DIR as string).length;
    const fake = await create({ ...productFields, ...specFields }, [
      png(),
      { data: Buffer.from("not an image at all"), filename: "bad.png", type: "image/png" },
    ]);
    expect(fake.status).toBe(400);
    expect(fake.body.message).toMatch(/PNG, JPEG or WEBP/);
    // Etibarsız fayl olanda heç bir şəkil diskə yazılmır
    expect(fs.readdirSync(process.env.UPLOADS_DIR as string)).toHaveLength(before);
  });

  it("rejects oversized gallery images", async () => {
    const big = Buffer.concat([pngBuffer(), Buffer.alloc(9 * 1024 * 1024)]);
    const res = await create({ ...productFields, ...specFields }, [
      { data: big, filename: "big.png", type: "image/png" },
    ]);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too large/);
  });

  it("adds gallery images on update and enforces the four-image limit", async () => {
    const created = await createProduct({}, pngs(3));

    const added = await update(created._id, {}, pngs(1));
    expect(added.status).toBe(200);
    expect(added.body.images).toHaveLength(4);
    expect(added.body.images.slice(0, 3)).toEqual(created.images);

    const overflow = await update(created._id, {}, pngs(1));
    expect(overflow.status).toBe(400);
    expect(overflow.body.message).toMatch(/at most 4/);

    const stored = await client().get(`/api/products/${created._id}`);
    expect(stored.body.images).toHaveLength(4);
  });

  it("removes only the requested gallery images and deletes their files", async () => {
    const created = await createProduct({}, pngs(3));
    const [first, second, third] = created.images as string[];

    const res = await update(created._id, {}, [], [second]);

    expect(res.status).toBe(200);
    expect(res.body.images).toEqual([first, third]);
    expect(fs.existsSync(uploadedFile(second))).toBe(false);
    expect(fs.existsSync(uploadedFile(first))).toBe(true);
    expect(fs.existsSync(uploadedFile(third))).toBe(true);
    // Əsas şəkil toxunulmaz qalır
    expect(fs.existsSync(uploadedFile(created))).toBe(true);
  });

  it("frees room when removing and adding in the same update", async () => {
    const created = await createProduct({}, pngs(4));

    const res = await update(created._id, {}, pngs(2), [created.images[0], created.images[1]]);

    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(4);
    expect(res.body.images.slice(0, 2)).toEqual([created.images[2], created.images[3]]);
  });

  it("ignores removal of URLs that are not part of the product gallery", async () => {
    const other = await createProduct({ name: "Other Watch" }, pngs(1));
    const created = await createProduct({}, pngs(1));
    const seeded = "/images/watches/some-seeded-image.png";

    const res = await update(created._id, {}, [], [other.images[0], other.image, seeded]);

    expect(res.status).toBe(200);
    expect(res.body.images).toEqual(created.images);
    // Başqa məhsulun fayllarına toxunulmur
    expect(fs.existsSync(uploadedFile(other.images[0]))).toBe(true);
    expect(fs.existsSync(uploadedFile(other))).toBe(true);
  });

  it("updates specs and keeps the gallery when no gallery fields are sent", async () => {
    const created = await createProduct({}, pngs(2));

    const res = await update(created._id, { mechanism: "Quartz", caseSize: "38.5", glass: "" });

    expect(res.status).toBe(200);
    expect(res.body.specs.mechanism).toBe("Quartz");
    expect(res.body.specs.caseSize).toBe(38.5);
    expect(res.body.specs.glass).toBeNull();
    expect(res.body.images).toEqual(created.images);
  });

  it("removes every uploaded file when a product without orders is deleted", async () => {
    const created = await createProduct({}, pngs(2));
    const files = [created.image, ...created.images] as string[];

    const res = await admin.delete(`/api/admin/products/${created._id}`);

    expect(res.status).toBe(200);
    expect(res.body.archived).toBe(false);
    files.forEach((url) => expect(fs.existsSync(uploadedFile(url))).toBe(false));
  });

  it("keeps uploaded files when a product with orders is archived", async () => {
    const created = await createProduct({}, pngs(1));

    const order = await client().post("/api/orders", {
      json: orderPayload(created._id, 1),
      headers: { "Idempotency-Key": "specs-test-order-key-1" },
    });
    expect(order.status).toBe(201);

    const res = await admin.delete(`/api/admin/products/${created._id}`);

    expect(res.status).toBe(200);
    expect(res.body.archived).toBe(true);
    expect(fs.existsSync(uploadedFile(created))).toBe(true);
    expect(fs.existsSync(uploadedFile(created.images[0]))).toBe(true);
  });
});
