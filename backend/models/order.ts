import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
  type ShippingMethod,
} from "../constants";

export interface IOrderItem {
  product: Types.ObjectId;
  /** Sifariş anındakı məlumatlar — məhsul sonradan dəyişsə də tarixçə pozulmur */
  name: string;
  brand: string;
  category: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface IOrder {
  orderNumber: string;
  idempotencyKey?: string;
  customer: Types.ObjectId | null;
  contact: { firstName: string; lastName: string; email: string; phone: string };
  shippingAddress: { country: string; city: string; address: string; postalCode: string };
  items: IOrderItem[];
  shippingMethod: ShippingMethod;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
    contact: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, default: "" },
    },
    items: { type: [orderItemSchema], required: true },
    shippingMethod: { type: String, enum: ["standard", "express"], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Unpaid" },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ "items.product": 1 });

export const Order =
  (models.Order as Model<IOrder> | undefined) ?? model<IOrder>("Order", orderSchema);
