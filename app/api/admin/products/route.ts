import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { createProduct, readProductForm } from "@/backend/services/adminProductService";

export const POST = route(async ({ request }) => {
  await requireAdmin(request);

  const product = await createProduct(await readProductForm(request));

  return json(product, 201);
});
