import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { assertObjectId } from "@/backend/lib/validation";
import { getCustomer } from "@/backend/services/adminCustomerService";

type Params = { id: string };

export const GET = route<Params>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid customer ID");

  return json(await getCustomer(params.id));
});
