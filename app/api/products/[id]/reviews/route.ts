import { requireCustomer } from "@/backend/http/auth";
import { reviewLimiter } from "@/backend/http/rateLimit";
import { json, readJson, route } from "@/backend/http/route";
import { assertObjectId } from "@/backend/lib/validation";
import {
  createReview,
  listProductReviews,
  parseReviewInput,
} from "@/backend/services/reviewService";

const INVALID_ID = "Invalid product ID";

export const GET = route<{ id: string }>(async ({ request, params }) => {
  assertObjectId(params.id, INVALID_ID);

  return json(await listProductReviews(params.id, new URL(request.url).searchParams));
});

export const POST = route<{ id: string }>(async ({ request, params }) => {
  reviewLimiter.begin(request);
  assertObjectId(params.id, INVALID_ID);

  const customer = await requireCustomer(request);
  const input = parseReviewInput(await readJson(request));
  const review = await createReview(params.id, customer, input);

  return json({ message: "Review created", review: { ...review.toObject(), customer: undefined } }, 201);
});

