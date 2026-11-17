"use client";

import { useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Search } from "lucide-react";
import { OrderDetailsModal } from "@/admin/components/OrderDetailsModal";
import { Pagination } from "@/admin/components/Pagination";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { useDebouncedValue } from "@/admin/hooks/useDebouncedValue";
import { useOrders } from "@/admin/hooks/useOrders";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderSort,
  type OrderStatus,
  type PaymentStatus,
} from "@/admin/types/orders";
import { formatDate, formatMoney } from "@/admin/utils/format";

const PAGE_SIZE = 10;

const TABLE_HEADINGS = ["Order", "Customer", "Items", "Total", "Status", "Payment", "Date"];

const SORT_OPTIONS: ReadonlyArray<{ value: OrderSort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total-high", label: "Total: high to low" },
  { value: "total-low", label: "Total: low to high" },
];

const selectClass =
  "h-10 cursor-pointer border border-[#E8E2D8] bg-white px-3 text-[12px] text-[#171717] outline-none focus:border-[#B08D57]";

const Message = ({
  children,
  tone = "text-[#777]",
}: {
  children: ReactNode;
  tone?: string;
}) => (
  <div className={`border border-[#E8E2D8] bg-white p-8 text-center text-[13px] ${tone}`}>
    {children}
  </div>
);

const countItems = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

export const OrdersPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [sort, setSort] = useState<OrderSort>("newest");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());

  const { data, isLoading, isError, isFetching } = useOrders({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    sort,
  });

  const orders = data?.orders ?? [];

  // Filtr dəyişəndə həmişə birinci səhifəyə qayıdılır
  const changeFilter =
    <T extends string>(setter: Dispatch<SetStateAction<T>>) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value as T);
      setPage(1);
    };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-6 sm:px-6 md:px-8">
      <div className="mb-7">
        <h1 className="font-serif text-[30px] text-[#171717]">Orders</h1>
        <p className="mt-1 text-[12px] text-[#777]">Track and manage customer orders</p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#999]" />
          <input
            type="search"
            aria-label="Search orders"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order number, name or email"
            className="h-10 w-full border border-[#E8E2D8] bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-[#AAA] focus:border-[#B08D57]"
          />
        </div>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by payment"
          value={paymentStatus}
          onChange={changeFilter(setPaymentStatus)}
          className={selectClass}
        >
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort orders"
          value={sort}
          onChange={changeFilter(setSort)}
          className={selectClass}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <Message>Loading orders...</Message>}

      {isError && <Message tone="text-red-600">Failed to load orders.</Message>}

      {!isLoading && !isError && orders.length === 0 && (
        <Message>
          {debouncedSearch || status || paymentStatus
            ? "No orders match your filters."
            : "No orders yet. Orders placed in the store will appear here."}
        </Message>
      )}

      {data && orders.length > 0 && (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden border border-[#E8E2D8] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-[#F7F4EE]">
                  <tr>
                    {TABLE_HEADINGS.map((title) => (
                      <th key={title} className="px-5 py-4 text-[12px] font-medium text-[#666]">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer border-t border-[#E8E2D8] transition-colors hover:bg-[#FAF8F4]"
                    >
                      <td className="px-5 py-4 text-[12px] font-medium">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="cursor-pointer text-left hover:text-[#B08D57]"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[12px]">
                        {order.contact.firstName} {order.contact.lastName}
                        <span className="block text-[11px] text-[#888]">{order.contact.email}</span>
                      </td>
                      <td className="px-5 py-4 text-[12px]">{countItems(order)}</td>
                      <td className="px-5 py-4 text-[12px] font-medium">
                        {formatMoney(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#777]">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="min-w-0 cursor-pointer border border-[#E8E2D8] bg-white p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#171717]">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-[12px] text-[#555]">
                      {order.contact.firstName} {order.contact.lastName}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#171717]">
                    {formatMoney(order.total)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.status} />
                  <StatusBadge status={order.paymentStatus} type="payment" />
                  <span className="text-[11px] text-[#888]">{formatDate(order.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>

          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </div>
      )}

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
