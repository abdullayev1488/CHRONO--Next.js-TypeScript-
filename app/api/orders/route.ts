import { getOptionalCustomer } from "@/backend/http/auth";
import { ApiError } from "@/backend/http/errors";
import { orderLimiter } from "@/backend/http/rateLimit";
import { json, readJson, route } from "@/backend/http/route";
import { Order } from "@/backend/models/order";
import { IDEMPOTENCY_KEY, parseOrderInput } from "@/backend/services/orderInput";
import { placeOrder } from "@/backend/services/orderService";

const DUPLICATE_KEY_CODE = 11000;

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === DUPLICATE_KEY_CODE;

export const POST = route(async ({ request }) => {
  orderLimiter.begin(request);

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) {
    throw ApiError.badRequest("Valid Idempotency-Key header is required");
  }

  const customer = await getOptionalCustomer(request);
  const { errors, value } = parseOrderInput(await readJson(request));
  if (errors.length > 0) throw ApiError.badRequest(errors[0], { errors });

  // Eyni açarla təkrar sorğu: artıq yaradılmış sifarişi qaytarırıq
  const existing = await Order.findOne({ idempotencyKey });
  if (existing) return json(existing);

  try {
    const order = await placeOrder({ ...value, customerId: customer?._id, idempotencyKey });
    return json(order, 201);
  } catch (error) {
    // Eyni anda gələn təkrar sorğu
    if (isDuplicateKeyError(error)) {
      const duplicate = await Order.findOne({ idempotencyKey });
      if (duplicate) return json(duplicate);
    }
    throw error;
  }
});
