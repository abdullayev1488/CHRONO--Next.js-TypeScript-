import type { OrderStatus } from "@/backend/constants";

/** Dashboard-dakı "Recent Orders" cədvəli üçün qısa sifariş görünüşü */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
