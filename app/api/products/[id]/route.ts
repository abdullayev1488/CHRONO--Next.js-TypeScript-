import { ApiError } from "@/backend/http/errors";
import { json, route } from "@/backend/http/route";
import { isObjectId } from "@/backend/lib/validation";
import { Product } from "@/backend/models/product";
import { withRatings } from "@/backend/services/reviewService";

export const GET = route<{ id: string }>(async ({ params }) => {
  if (!isObjectId(params.id)) throw ApiError.badRequest("Invalid product ID");

  const product = await Product.findOne({ _id: params.id, archived: { $ne: true } }).select(
    "-archived"
  );
  if (!product) throw ApiError.notFound("Product not found");

  const [withRating] = await withRatings([product]);

  return json(withRating);
});
