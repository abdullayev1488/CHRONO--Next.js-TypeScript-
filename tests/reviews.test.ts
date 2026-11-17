import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Product } from "@/backend/models/product";
import { Review } from "@/backend/models/review";
import {
  client,
  loginAdmin,
  resetRateLimits,
  setup,
  teardown,
  type TestClient,
} from "./helpers";

const UNKNOWN_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const PASSWORD = "Str0ngCustomerPass1";
const COMMENT = "A really wonderful timepiece, worth every cent.";

let admin: TestClient;
let productId: string;
let secondProductId: string;
let customerCounter = 0;

/** Yeni müştəri qeydiyyatdan keçirib giriş etmiş client qaytarır */
const newCustomer = async (firstName = "John", lastName = "Doe"): Promise<TestClient> => {
  customerCounter += 1;
  const customer = client();
  const res = await customer.post("/api/auth/register", {
    json: { firstName, lastName, email: `reviewer${customerCounter}@example.com`, password: PASSWORD },
  });
  expect(res.status).toBe(201);
  return customer;
};

const postReview = (
  customer: TestClient,
  id: string,
  body: Record<string, unknown> = { rating: 5, title: "Great", comment: COMMENT }
) => customer.post(`/api/products/${id}/reviews`, { json: body });

const pause = () => new Promise((resolve) => setTimeout(resolve, 5));

beforeAll(async () => {
  await setup();
  await Review.syncIndexes();
  admin = await loginAdmin();

  const products = await Product.find().sort({ _id: 1 }).limit(2);
  productId = products[0]._id.toString();
  secondProductId = products[1]._id.toString();
});

afterAll(teardown);

beforeEach(async () => {
  resetRateLimits();
  await Review.deleteMany({});
  await Product.updateMany({}, { archived: false });
});

describe("creating reviews", () => {
  it("requires a logged-in customer", async () => {
    const res = await postReview(client(), productId);

    expect(res.status).toBe(401);
  });

  it("rejects invalid IDs, unknown and archived products", async () => {
    const customer = await newCustomer();

    expect((await postReview(customer, "not-an-id")).status).toBe(400);
    expect((await postReview(customer, UNKNOWN_ID)).status).toBe(404);

    await Product.updateOne({ _id: productId }, { archived: true });
    expect((await postReview(customer, productId)).status).toBe(404);
  });

  it("validates rating, title and comment", async () => {
    const customer = await newCustomer();
    const invalid: Record<string, unknown>[] = [
      { rating: 0, comment: COMMENT },
      { rating: 6, comment: COMMENT },
      { rating: 3.5, comment: COMMENT },
      { rating: "5", comment: COMMENT },
      { comment: COMMENT },
      { rating: 5, comment: "too short" },
      { rating: 5, comment: "x".repeat(1001) },
      { rating: 5, comment: "          " },
      { rating: 5, title: "t".repeat(81), comment: COMMENT },
    ];

    for (const body of invalid) {
      const res = await postReview(customer, productId, body);
      expect(res.status, JSON.stringify(body).slice(0, 60)).toBe(400);
    }

    expect(await Review.countDocuments()).toBe(0);
  });

  it("creates a review with a short author name and hides the customer ID", async () => {
    const customer = await newCustomer("John", "Doe");

    const res = await postReview(customer, productId, {
      rating: 4,
      title: "  Nice  ",
      comment: `  ${COMMENT}  `,
    });

    expect(res.status).toBe(201);
    expect(res.body.review).toMatchObject({
      authorName: "John D.",
      rating: 4,
      title: "Nice",
      comment: COMMENT,
    });
    expect(res.body.review.customer).toBeUndefined();
  });

  it("allows an empty title", async () => {
    const customer = await newCustomer();

    const res = await postReview(customer, productId, { rating: 3, comment: COMMENT });

    expect(res.status).toBe(201);
    expect(res.body.review.title).toBe("");
  });

  it("allows only one review per customer per product", async () => {
    const customer = await newCustomer();

    expect((await postReview(customer, productId)).status).toBe(201);

    const duplicate = await postReview(customer, productId);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe("You have already reviewed this product");

    // Başqa məhsula yazmaq olar
    expect((await postReview(customer, secondProductId)).status).toBe(201);
  });

  it("limits how many reviews a client can submit per hour", async () => {
    const customer = await newCustomer();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect((await postReview(customer, productId, {})).status).toBe(400);
    }

    expect((await postReview(customer, productId)).status).toBe(429);
  });
});

describe("listing reviews", () => {
  it("returns an empty summary for a product without reviews", async () => {
    const res = await client().get(`/api/products/${productId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      reviews: [],
      total: 0,
      page: 1,
      pages: 1,
      summary: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    });
  });

  it("rejects an invalid product ID", async () => {
    expect((await client().get("/api/products/nope/reviews")).status).toBe(400);
  });

  it("calculates the average and distribution", async () => {
    for (const rating of [5, 4, 4]) {
      await postReview(await newCustomer(), productId, { rating, comment: COMMENT });
    }

    const res = await client().get(`/api/products/${productId}/reviews`);

    expect(res.body.summary).toEqual({
      average: 4.3,
      count: 3,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 },
    });
    expect(res.body.total).toBe(3);
  });

  it("paginates newest first and never exposes customer IDs", async () => {
    for (const rating of [1, 2, 3]) {
      await postReview(await newCustomer(), productId, {
        rating,
        title: `Review ${rating}`,
        comment: COMMENT,
      });
      await pause();
    }

    const first = await client().get(`/api/products/${productId}/reviews?limit=2&page=1`);
    expect(first.body.pages).toBe(2);
    expect(first.body.reviews.map((review: { title: string }) => review.title)).toEqual([
      "Review 3",
      "Review 2",
    ]);
    expect(first.body.reviews[0].customer).toBeUndefined();

    const second = await client().get(`/api/products/${productId}/reviews?limit=2&page=2`);
    expect(second.body.reviews.map((review: { title: string }) => review.title)).toEqual([
      "Review 1",
    ]);
  });

  it("only counts reviews of the requested product", async () => {
    await postReview(await newCustomer(), productId, { rating: 5, comment: COMMENT });
    await postReview(await newCustomer(), secondProductId, { rating: 1, comment: COMMENT });

    const res = await client().get(`/api/products/${productId}/reviews`);

    expect(res.body.summary.count).toBe(1);
    expect(res.body.summary.average).toBe(5);
  });
});

describe("product ratings", () => {
  it("includes rating in the product list and detail", async () => {
    await postReview(await newCustomer(), productId, { rating: 5, comment: COMMENT });
    await postReview(await newCustomer(), productId, { rating: 4, comment: COMMENT });

    const list = await client().get("/api/products");
    const rated = list.body.find((product: { _id: string }) => product._id === productId);
    const unrated = list.body.find((product: { _id: string }) => product._id === secondProductId);

    expect(rated.rating).toEqual({ average: 4.5, count: 2 });
    expect(unrated.rating).toEqual({ average: 0, count: 0 });

    const detail = await client().get(`/api/products/${productId}`);
    expect(detail.body.rating).toEqual({ average: 4.5, count: 2 });

    const detailUnrated = await client().get(`/api/products/${secondProductId}`);
    expect(detailUnrated.body.rating).toEqual({ average: 0, count: 0 });
  });
});

describe("admin reviews", () => {
  it("requires an admin session", async () => {
    const anon = client();

    expect((await anon.get("/api/admin/reviews")).status).toBe(401);
    expect((await anon.delete(`/api/admin/reviews/${UNKNOWN_ID}`)).status).toBe(401);

    const customer = await newCustomer();
    expect((await customer.get("/api/admin/reviews")).status).toBe(401);
  });

  it("lists reviews newest first with product name and image", async () => {
    await postReview(await newCustomer(), productId, { rating: 5, title: "Older", comment: COMMENT });
    await pause();
    await postReview(await newCustomer(), secondProductId, { rating: 2, title: "Newer", comment: COMMENT });

    const res = await admin.get("/api/admin/reviews?limit=1&page=1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, page: 1, pages: 2 });
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0].title).toBe("Newer");
    expect(res.body.reviews[0].product).toMatchObject({ _id: secondProductId });
    expect(res.body.reviews[0].product.name).toEqual(expect.any(String));
    expect(res.body.reviews[0].product.image).toEqual(expect.any(String));
    expect(res.body.reviews[0].customer).toBeUndefined();
  });

  it("deletes a review and updates the product rating", async () => {
    const created = await postReview(await newCustomer(), productId, { rating: 5, comment: COMMENT });
    const reviewId = created.body.review._id;

    expect((await admin.delete(`/api/admin/reviews/${reviewId}`)).status).toBe(200);
    expect(await Review.countDocuments()).toBe(0);

    const detail = await client().get(`/api/products/${productId}`);
    expect(detail.body.rating).toEqual({ average: 0, count: 0 });
  });

  it("returns 400 / 404 for invalid or unknown review IDs", async () => {
    expect((await admin.delete("/api/admin/reviews/nope")).status).toBe(400);
    expect((await admin.delete(`/api/admin/reviews/${UNKNOWN_ID}`)).status).toBe(404);
  });

  it("lets the customer review the product again after deletion", async () => {
    const customer = await newCustomer();
    const created = await postReview(customer, productId);

    await admin.delete(`/api/admin/reviews/${created.body.review._id}`);

    expect((await postReview(customer, productId)).status).toBe(201);
  });
});
