import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { assertObjectId } from "@/backend/lib/validation";
import {
  deleteProduct,
  readProductForm,
  updateProduct,
} from "@/backend/services/adminProductService";

type Params = { id: string };

export const PUT = route<Params>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid product ID");

  const product = await updateProduct(params.id, await readProductForm(request));

  return json(product);
});

export const DELETE = route<Params>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid product ID");

  return json(await deleteProduct(params.id));
});
