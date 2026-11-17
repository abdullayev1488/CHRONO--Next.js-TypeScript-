import { json, route } from "@/backend/http/route";
import { Product } from "@/backend/models/product";
import { withRatings } from "@/backend/services/reviewService";

// Arxivlənmiş məhsullar ictimai siyahıda göstərilmir
export const GET = route(async () => {
  const products = await Product.find({ archived: { $ne: true } }).select("-archived");

  return json(await withRatings(products));
});
