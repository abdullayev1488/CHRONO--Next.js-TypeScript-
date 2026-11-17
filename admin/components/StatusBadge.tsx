import type { OrderStatus, PaymentStatus } from "@/backend/constants";

const orderColors: Record<OrderStatus, string> = {
  Pending: "bg-[#FBEDD1] text-[#986018]",
  Paid: "bg-[#E6EDF4] text-[#456A90]",
  Shipped: "bg-[#F6E8C8] text-[#9F6A20]",
  Delivered: "bg-[#E4F0E3] text-[#367546]",
  Cancelled: "bg-[#F8E2DF] text-[#AD4944]",
};

const paymentColors: Record<PaymentStatus, string> = {
  Unpaid: "bg-[#FBEDD1] text-[#986018]",
  Paid: "bg-[#E4F0E3] text-[#367546]",
  Refunded: "bg-[#F8E2DF] text-[#AD4944]",
};

const FALLBACK_COLORS = "bg-[#F1EDE6] text-[#555]";

type StatusBadgeProps =
  | { status: OrderStatus; type?: "order" }
  | { status: PaymentStatus; type: "payment" };

export const StatusBadge = (props: StatusBadgeProps) => {
  const colors: Record<string, string> =
    props.type === "payment" ? paymentColors : orderColors;

  return (
    <span
      className={`inline-block rounded-[3px] px-3 py-1 text-[11px] ${colors[props.status] ?? FALLBACK_COLORS}`}
    >
      {props.status}
    </span>
  );
};
