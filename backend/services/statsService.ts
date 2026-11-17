import type { Types } from "mongoose";
import { ApiError } from "../http/errors";
import { Customer } from "../models/customer";
import { Order } from "../models/order";
import { Product } from "../models/product";

const LOW_STOCK_LIMIT = 3;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MS = 366 * DAY_MS;
const HOURLY_SPAN_MS = 36 * HOUR_MS;

interface RangeTotals {
  revenue: number;
  orders: number;
}

interface SeriesEntry extends RangeTotals {
  _id: string;
}

interface CategoryEntry {
  _id: string;
  revenue: number;
}

interface BrandEntry {
  _id: string;
  sold: number;
}

interface TopProductEntry {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  image: string;
  sold: number;
  revenue: number;
}

const isValidTimeZone = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
};

const percentChange = (current: number, previous: number): number | null =>
  previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

const round2 = (value: number): number => Math.round(value * 100) / 100;

const revenueOf = async (match: Record<string, unknown>): Promise<RangeTotals> => {
  const [result] = await Order.aggregate<RangeTotals>([
    { $match: { ...match, status: { $ne: "Cancelled" } } },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
  ]);

  return { revenue: result?.revenue ?? 0, orders: result?.orders ?? 0 };
};

const lineRevenue = { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } };

/** Sorğudakı from/tz parametrlərini yoxlayıb statistika aralığını qaytarır. */
const parseRange = (params: URLSearchParams) => {
  const from = new Date(params.get("from") ?? "");
  const to = new Date();
  const tz = params.get("tz");
  const timeZone = tz && isValidTimeZone(tz) ? tz : "UTC";

  if (Number.isNaN(from.getTime()) || from >= to || to.getTime() - from.getTime() > MAX_RANGE_MS) {
    throw ApiError.badRequest("Invalid date range");
  }

  return { from, to, timeZone, span: to.getTime() - from.getTime() };
};

/** Dashboard üçün KPI-lar, satış seriyası və siyahılar. */
export const getStats = async (params: URLSearchParams) => {
  const { from, to, timeZone, span } = parseRange(params);
  const previousFrom = new Date(from.getTime() - span);

  const inRange = { createdAt: { $gte: from, $lte: to } };
  const inPreviousRange = { createdAt: { $gte: previousFrom, $lt: from } };
  const activeInRange = { ...inRange, status: { $ne: "Cancelled" } };

  const bucketFormat = span <= HOURLY_SPAN_MS ? "%Y-%m-%dT%H" : "%Y-%m-%d";

  const [
    current,
    previous,
    newCustomers,
    previousCustomers,
    series,
    byCategory,
    topBrands,
    topProducts,
    lowStock,
    recentOrders,
    productCount,
  ] = await Promise.all([
    revenueOf(inRange),
    revenueOf(inPreviousRange),
    Customer.countDocuments(inRange),
    Customer.countDocuments(inPreviousRange),
    Order.aggregate<SeriesEntry>([
      { $match: activeInRange },
      {
        $group: {
          _id: { $dateToString: { format: bucketFormat, date: "$createdAt", timezone: timeZone } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate<CategoryEntry>([
      { $match: activeInRange },
      { $unwind: "$items" },
      { $group: { _id: "$items.category", revenue: lineRevenue } },
      { $sort: { revenue: -1 } },
    ]),
    Order.aggregate<BrandEntry>([
      { $match: activeInRange },
      { $unwind: "$items" },
      { $group: { _id: "$items.brand", sold: { $sum: "$items.quantity" } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate<TopProductEntry>([
      { $match: activeInRange },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          brand: { $first: "$items.brand" },
          image: { $first: "$items.image" },
          sold: { $sum: "$items.quantity" },
          revenue: lineRevenue,
        },
      },
      { $sort: { sold: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
    Product.find({ archived: { $ne: true }, stock: { $lte: LOW_STOCK_LIMIT } })
      .sort({ stock: 1, name: 1 })
      .limit(5)
      .select("name image stock"),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Product.countDocuments({ archived: { $ne: true } }),
  ]);

  const categoryTotal = byCategory.reduce((sum, entry) => sum + entry.revenue, 0);
  const averageOf = (totals: RangeTotals): number =>
    totals.orders ? totals.revenue / totals.orders : 0;

  return {
    kpis: {
      revenue: {
        value: round2(current.revenue),
        change: percentChange(current.revenue, previous.revenue),
      },
      orders: {
        value: current.orders,
        change: percentChange(current.orders, previous.orders),
      },
      averageOrderValue: {
        value: round2(averageOf(current)),
        change: percentChange(averageOf(current), averageOf(previous)),
      },
      newCustomers: {
        value: newCustomers,
        change: percentChange(newCustomers, previousCustomers),
      },
    },
    productCount,
    series: series.map((entry) => ({
      key: entry._id,
      revenue: round2(entry.revenue),
      orders: entry.orders,
    })),
    granularity: bucketFormat === "%Y-%m-%d" ? "day" : "hour",
    salesByCategory: byCategory.map((entry) => ({
      name: entry._id,
      revenue: round2(entry.revenue),
      percentage: categoryTotal ? Math.round((entry.revenue / categoryTotal) * 100) : 0,
    })),
    topBrands: topBrands.map((entry) => ({ name: entry._id, sold: entry.sold })),
    topProducts: topProducts.map((entry) => ({
      id: entry._id,
      name: entry.name,
      brand: entry.brand,
      image: entry.image,
      sold: entry.sold,
      revenue: round2(entry.revenue),
    })),
    lowStock: lowStock.map((product) => ({
      id: product._id,
      name: product.name,
      image: product.image,
      stock: product.stock,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customer: `${order.contact.firstName} ${order.contact.lastName}`,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    })),
  };
};
