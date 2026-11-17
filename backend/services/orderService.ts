import crypto from "node:crypto";
import mongoose, { type HydratedDocument, type Types } from "mongoose";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS, type ShippingMethod } from "../constants";
import { ApiError } from "../http/errors";
import { revalidateCatalog } from "../lib/revalidate";
import { Order, type IOrder, type IOrderItem } from "../models/order";
import { Product } from "../models/product";
import { createPayment } from "./paymentService";

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

export interface PlaceOrderInput {
  items: OrderLineInput[];
  shippingMethod: ShippingMethod;
  contact: IOrder["contact"];
  shippingAddress: IOrder["shippingAddress"];
  customerId?: Types.ObjectId;
  idempotencyKey: string;
}

const toCents = (value: number): number => Math.round(value * 100);
const fromCents = (value: number): number => value / 100;

const generateOrderNumber = (): string =>
  `CH-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

/** Çatdırılma qiyməti yalnız serverdə hesablanır. */
export const calculateShipping = (subtotal: number, shippingMethod: ShippingMethod): number => {
  if (shippingMethod === "standard" && subtotal > FREE_SHIPPING_THRESHOLD) return 0;

  return SHIPPING_METHODS[shippingMethod].price;
};

/** Stoku atomik azaldır və sifariş sətrinin snapshot-ını qaytarır (stok kifayət etmirsə 409 atır). */
const reserveProduct = async (
  { productId, quantity }: OrderLineInput,
  session: mongoose.ClientSession
): Promise<IOrderItem> => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, archived: { $ne: true }, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { session, returnDocument: "before" }
  );

  if (!product) {
    const current = await Product.findOne({ _id: productId, archived: { $ne: true } }).session(
      session
    );

    if (!current) {
      throw ApiError.conflict("A product in your cart is no longer available", { productId });
    }

    throw ApiError.conflict(`Not enough stock for ${current.name}`, {
      productId,
      available: current.stock,
    });
  }

  return {
    product: product._id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    image: product.image,
    unitPrice: product.price,
    quantity,
  };
};

/** Stok azaltma, snapshot və sifariş yaradılması bir transaction daxilindədir. */
export const placeOrder = async ({
  items,
  shippingMethod,
  contact,
  shippingAddress,
  customerId,
  idempotencyKey,
}: PlaceOrderInput): Promise<HydratedDocument<IOrder>> => {
  const session = await mongoose.startSession();

  try {
    let order: HydratedDocument<IOrder> | undefined;

    await session.withTransaction(async () => {
      const orderItems: IOrderItem[] = [];
      let subtotalCents = 0;

      for (const line of items) {
        const item = await reserveProduct(line, session);
        subtotalCents += toCents(item.unitPrice) * item.quantity;
        orderItems.push(item);
      }

      const subtotal = fromCents(subtotalCents);
      const shipping = calculateShipping(subtotal, shippingMethod);
      const payment = await createPayment();

      const [created] = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            idempotencyKey,
            customer: customerId ?? null,
            contact,
            shippingAddress,
            items: orderItems,
            shippingMethod,
            subtotal,
            shipping,
            total: fromCents(toCents(subtotal) + toCents(shipping)),
            paymentStatus: payment.status,
          },
        ],
        { session }
      );

      order = created;
    });

    if (!order) throw new Error("Order was not created");

    // Stok dəyişdi: kataloq keşi təzələnir
    revalidateCatalog(order.items.map((item) => item.product.toString()));
    return order;
  } finally {
    await session.endSession();
  }
};

/** Ləğv edilən sifarişin stokunu geri qaytarır. */
export const restockOrder = async (order: Pick<IOrder, "items">): Promise<void> => {
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
