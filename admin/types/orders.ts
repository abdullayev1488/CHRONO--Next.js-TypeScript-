export const ORDER_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Paid", "Refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type ShippingMethod = "standard" | "express";

export const ORDER_SORTS = ["newest", "oldest", "total-high", "total-low"] as const;
export type OrderSort = (typeof ORDER_SORTS)[number];

export interface OrderItem {
  product: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersParams {
  page: number;
  limit: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sort: OrderSort;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export interface OrderChanges {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}
