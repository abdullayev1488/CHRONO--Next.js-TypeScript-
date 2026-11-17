import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { getStats } from "@/backend/services/statsService";

export const GET = route(async ({ request }) => {
  await requireAdmin(request);

  return json(await getStats(new URL(request.url).searchParams));
});
