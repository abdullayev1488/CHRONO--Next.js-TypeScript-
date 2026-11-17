import { requireAdmin } from "@/backend/http/auth";
import { json, readJson, route } from "@/backend/http/route";
import { assertObjectId } from "@/backend/lib/validation";
import { getOrder, updateOrder, type OrderUpdateInput } from "@/backend/services/adminOrderService";

type Params = { id: string };

export const GET = route<Params>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid order ID");

  return json(await getOrder(params.id));
});

export const PATCH = route<Params>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid order ID");

  return json(await updateOrder(params.id, await readJson<OrderUpdateInput>(request)));
});
