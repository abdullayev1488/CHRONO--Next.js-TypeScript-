import { requireAdmin } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { assertObjectId } from "@/backend/lib/validation";
import { deleteReview } from "@/backend/services/reviewService";

export const DELETE = route<{ id: string }>(async ({ request, params }) => {
  await requireAdmin(request);
  assertObjectId(params.id, "Invalid review ID");
  await deleteReview(params.id);

  return json({ message: "Review deleted" });
});
