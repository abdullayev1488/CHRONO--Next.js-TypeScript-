import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { toPublicAdmin } from "@/backend/services/adminService";

export const GET = route(async ({ request }) => {
  const admin = await requireAdmin(request);

  return json({ admin: toPublicAdmin(admin) });
});
