import { json, readJson, route } from "@/backend/http/route";
import { customerLoginLimiter } from "@/backend/http/rateLimit";
import { startSession } from "@/backend/http/session";
import { authenticateCustomer, toPublicCustomer } from "@/backend/services/customerAuthService";

export const POST = route(async ({ request, cookies }) => {
  // Yalnız uğursuz giriş cəhdləri sayılır
  const attempt = customerLoginLimiter.begin(request);

  const customer = await authenticateCustomer(await readJson(request));
  attempt.succeed();
  cookies.push(await startSession("customer", customer.id));

  return json({ message: "Login successful", customer: toPublicCustomer(customer) });
});
