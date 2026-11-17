import type { HydratedDocument, QueryFilter } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "../constants";
import { ApiError } from "../http/errors";
import { revalidateCatalog } from "../lib/revalidate";
import { escapeRegex, parsePagination } from "../lib/validation";
import { Order, type IOrder } from "../models/order";
import { Product } from "../models/product";

const STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  Pending: ["Paid", "Shipped", "Cancelled"],
  Paid: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  Unpaid: ["Paid"],
  Paid: ["Refunded"],
  Refunded: [],
};

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "total-high": { total: -1, createdAt: -1 },
  "total-low": { total: 1, createdAt: -1 },
} as const;

type SortKey = keyof typeof SORTS;

const isSortKey = (value: string): value is SortKey => value in SORTS;

const isOrderStatus = (value: unknown): value is OrderStatus =>
  (ORDER_STATUSES as readonly unknown[]).includes(value);

const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  (PAYMENT_STATUSES as readonly unknown[]).includes(value);

const param = (params: URLSearchParams, key: string): string => params.get(key)?.trim() ?? "";

/** Admin sifariş siyahısı: status/ödəniş filtri, axtarış, sıralama və səhifələmə. */
export const listOrders = async (params: URLSearchParams) => {
  const { page, limit, skip } = parsePagination(params);
  const filter: QueryFilter<IOrder> = {};

  const status = param(params, "status");
  const paymentStatus = param(params, "paymentStatus");
  const search = param(params, "search").slice(0, 100);

  if (isOrderStatus(status)) filter.status = status;
  if (isPaymentStatus(paymentStatus)) filter.paymentStatus = paymentStatus;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { orderNumber: pattern },
      { "contact.email": pattern },
      { "contact.firstName": pattern },
      { "contact.lastName": pattern },
    ];
  }

  const sortParam = param(params, "sort");
  const sort = SORTS[isSortKey(sortParam) ? sortParam : "newest"];

  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
};

export const getOrder = async (id: string) => {
  const order = await Order.findById(id).populate("customer", "firstName lastName email");
  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

/** Ləğv edilən sifarişin stokunu geri qaytarır. */
const restockOrder = async (order: HydratedDocument<IOrder>): Promise<void> => {
  await Product.bulkWrite(
    order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } },
      },
    }))
  );
  revalidateCatalog(order.items.map((item) => item.product.toString()));
};

export interface OrderUpdateInput {
  status?: unknown;
  paymentStatus?: unknown;
}

/** Status/ödəniş dəyişikliyini keçid qaydalarına uyğun tətbiq edir. */
export const updateOrder = async (id: string, input: OrderUpdateInput) => {
  const { status, paymentStatus } = input;

  if (status === undefined && paymentStatus === undefined) {
    throw ApiError.badRequest("Nothing to update");
  }
  if (status !== undefined && !isOrderStatus(status)) {
    throw ApiError.badRequest("Invalid order status");
  }
  if (paymentStatus !== undefined && !isPaymentStatus(paymentStatus)) {
    throw ApiError.badRequest("Invalid payment status");
  }

  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound("Order not found");

  const statusChanges = status !== undefined && status !== order.status;
  const paymentChanges = paymentStatus !== undefined && paymentStatus !== order.paymentStatus;

  if (statusChanges && !STATUS_TRANSITIONS[order.status].includes(status as OrderStatus)) {
    throw ApiError.conflict(`Cannot change status from ${order.status} to ${status}`);
  }

  if (
    paymentChanges &&
    !PAYMENT_TRANSITIONS[order.paymentStatus].includes(paymentStatus as PaymentStatus)
  ) {
    throw ApiError.conflict(
      `Cannot change payment from ${order.paymentStatus} to ${paymentStatus}`
    );
  }

  // Ləğv edilmiş sifarişin ödənişi təsdiqlənə bilməz
  const nextStatus = statusChanges ? status : order.status;
  if (paymentChanges && paymentStatus === "Paid" && nextStatus === "Cancelled") {
    throw ApiError.conflict("Cancelled orders cannot be marked as paid");
  }

  if (statusChanges) {
    order.status = status as OrderStatus;
    if (status === "Paid") order.paymentStatus = "Paid";
  }
  if (paymentChanges) order.paymentStatus = paymentStatus as PaymentStatus;

  await order.save();

  if (statusChanges && status === "Cancelled") await restockOrder(order);

  return order;
};
