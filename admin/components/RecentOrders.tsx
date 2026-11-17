import { StatusBadge } from "./StatusBadge";
import { formatDate, formatMoney } from "@/admin/utils/format";
import type { RecentOrder } from "@/admin/types/orderSummary";

const COLUMNS = ["Order ID", "Customer", "Total", "Status", "Date"];

export const RecentOrders = ({ orders = [] }: { orders?: RecentOrder[] }) => (
  <div className="border border-[#E8E2D8] bg-white p-5">
    <h2 className="font-serif text-[20px] text-[#171717]">Recent Orders</h2>

    {orders.length === 0 ? (
      <p className="mt-5 text-[13px] text-[#777]">No orders yet</p>
    ) : (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-[#FAF8F4]">
            <tr>
              {COLUMNS.map((title) => (
                <th key={title} className="px-4 py-3 text-[12px] font-medium text-[#666]">
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#E8E2D8] transition-colors hover:bg-[#FAF8F4]"
              >
                <td className="px-4 py-4 text-[12px] font-medium">{order.orderNumber}</td>

                <td className="px-4 py-4 text-[12px]">{order.customer}</td>

                <td className="px-4 py-4 text-[12px]">{formatMoney(order.total)}</td>

                <td className="px-4 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-4 py-4 text-[12px] text-[#777]">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
