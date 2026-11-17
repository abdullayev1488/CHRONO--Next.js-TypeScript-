import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { listReviewsForAdmin } from "@/backend/services/reviewService";

export const GET = route(async ({ request }) => {
  await requireAdmin(request);

  return json(await listReviewsForAdmin(new URL(request.url).searchParams));
});
