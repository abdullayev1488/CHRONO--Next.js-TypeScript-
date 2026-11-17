import { getOptionalCustomer } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { toPublicCustomer } from "@/backend/services/customerAuthService";

// Giriş edilməyibsə 401 əvəzinə customer: null qaytarır ki, brauzer konsolunda xəta görünməsin
export const GET = route(async ({ request }) => {
  const customer = await getOptionalCustomer(request);

  return json({ customer: customer ? toPublicCustomer(customer) : null });
});
