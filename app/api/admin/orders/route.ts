import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { listOrders } from "@/backend/services/adminOrderService";

export const GET = route(async ({ request }) => {
  await requireAdmin(request);

  return json(await listOrders(new URL(request.url).searchParams));
});
