import type { HydratedDocument, QueryFilter, Types } from "mongoose";
import { ApiError } from "../http/errors";
import { escapeRegex, parsePagination } from "../lib/validation";
import { Customer, type ICustomer } from "../models/customer";
import { Order } from "../models/order";

interface CustomerTotals {
  ordersCount: number;
  totalSpent: number;
}

interface TotalsEntry extends CustomerTotals {
  _id: Types.ObjectId;
}

const orderTotalsByCustomer = async (
  customerIds: Types.ObjectId[]
): Promise<Map<string, CustomerTotals>> => {
  const totals = await Order.aggregate<TotalsEntry>([
    { $match: { customer: { $in: customerIds } } },
    {
      $group: {
        _id: "$customer",
        ordersCount: { $sum: 1 },
        // Ləğv edilmiş sifarişlər xərclənən məbləğə daxil edilmir
        totalSpent: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 0, "$total"] } },
      },
    },
  ]);

  return new Map(totals.map((entry) => [entry._id.toString(), entry]));
};

const withTotals = (customer: HydratedDocument<ICustomer>, totals: Map<string, CustomerTotals>) => {
  const entry = totals.get(customer._id.toString());

  return {
    ...customer.toObject(),
    ordersCount: entry?.ordersCount ?? 0,
    totalSpent: entry?.totalSpent ?? 0,
  };
};

export const listCustomers = async (params: URLSearchParams) => {
  const { page, limit, skip } = parsePagination(params);
  const filter: QueryFilter<ICustomer> = {};
  const search = (params.get("search")?.trim() ?? "").slice(0, 100);

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ firstName: pattern }, { lastName: pattern }, { email: pattern }];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  const totals = await orderTotalsByCustomer(customers.map((customer) => customer._id));

  return {
    customers: customers.map((customer) => withTotals(customer, totals)),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getCustomer = async (id: string) => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound("Customer not found");

  const [totals, orders] = await Promise.all([
    orderTotalsByCustomer([customer._id]),
    Order.find({ customer: customer._id }).sort({ createdAt: -1 }),
  ]);

  return { ...withTotals(customer, totals), orders };
};
