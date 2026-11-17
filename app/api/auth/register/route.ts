import { json, readJson, route } from "@/backend/http/route";
import { registerLimiter } from "@/backend/http/rateLimit";
import { startSession } from "@/backend/http/session";
import { registerCustomer, toPublicCustomer } from "@/backend/services/customerAuthService";

export const POST = route(async ({ request, cookies }) => {
  registerLimiter.begin(request);

  const customer = await registerCustomer(await readJson(request));
  cookies.push(await startSession("customer", customer.id));

  return json({ message: "Account created", customer: toPublicCustomer(customer) }, 201);
});
