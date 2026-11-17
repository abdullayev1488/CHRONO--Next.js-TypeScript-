import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { listCustomers } from "@/backend/services/adminCustomerService";

export const GET = route(async ({ request }) => {
  await requireAdmin(request);

  return json(await listCustomers(new URL(request.url).searchParams));
});
