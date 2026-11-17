import type { Order } from "./orders";

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface CustomerDetails extends Customer {
  orders: Order[];
}

export interface CustomersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  pages: number;
}
