import { requireCustomer } from "@/backend/http/auth";
import { json, route } from "@/backend/http/route";
import { Order } from "@/backend/models/order";

export const GET = route(async ({ request }) => {
  const customer = await requireCustomer(request);
  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

  return json(orders);
});
