"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Watch, X } from "lucide-react";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { useModalBehavior } from "@/admin/hooks/useModalBehavior";
import { useUpdateOrder } from "@/admin/hooks/useOrders";
import type { Order, OrderChanges, OrderStatus, PaymentStatus } from "@/admin/types/orders";
import { getErrorMessage } from "@/admin/utils/errors";
import { formatDateTime, formatMoney, getImageUrl } from "@/admin/utils/format";

// Serverdəki icazə verilən keçidlərlə eyni olmalıdır (server son qərarı verir)
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

const selectClass =
  "h-10 w-full cursor-pointer border border-[#E8E2D8] bg-white px-3 text-[12px] text-[#171717] outline-none focus:border-[#B08D57] disabled:cursor-not-allowed disabled:opacity-60";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B08D57]">
      {title}
    </h3>
    {children}
  </div>
);

interface OrderDetailsContentProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailsContent = ({ order, onClose }: OrderDetailsContentProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const updateOrder = useUpdateOrder();

  // Yenilənəndən sonra göstərilən dəyərlər serverdən gələn cavabdan götürülür
  const [current, setCurrent] = useState(order);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [nextPayment, setNextPayment] = useState<PaymentStatus | "">("");

  useModalBehavior(dialogRef, onClose, !updateOrder.isPending);

  const statusOptions = STATUS_TRANSITIONS[current.status];
  const paymentOptions = PAYMENT_TRANSITIONS[current.paymentStatus];
  const hasChanges = Boolean(nextStatus || nextPayment);

  const handleSave = () => {
    const changes: OrderChanges = {};

    if (nextStatus) changes.status = nextStatus;
    if (nextPayment) changes.paymentStatus = nextPayment;

    updateOrder.mutate(
      { id: current._id, changes },
      {
        onSuccess: (updated) => {
          setCurrent(updated);
          setNextStatus("");
          setNextPayment("");
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !updateOrder.isPending) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex max-h-[92dvh] w-full max-w-[680px] flex-col overflow-hidden bg-[#FAF8F4] shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E8E2D8] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 id="order-modal-title" className="font-serif text-[24px] text-[#171717]">
              Order {current.orderNumber}
            </h2>

            <p className="mt-1 text-[11px] text-[#888]">
              Placed {formatDateTime(current.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateOrder.isPending}
            aria-label="Close modal"
            data-autofocus
            className="cursor-pointer p-2 text-[#777] transition-colors hover:text-[#171717] disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="flex flex-wrap gap-6">
            <Section title="Status">
              <StatusBadge status={current.status} />
            </Section>

            <Section title="Payment">
              <StatusBadge status={current.paymentStatus} type="payment" />
            </Section>
          </div>

          <Section title="Items">
            <div className="divide-y divide-[#E8E2D8] border border-[#E8E2D8] bg-white">
              {current.items.map((item) => (
                <div key={item.product} className="flex items-center gap-3 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#FAF8F4]">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Watch size={22} className="text-[#B08D57]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#171717]">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#888]">
                      {item.brand} · {item.quantity} × {formatMoney(item.unitPrice)}
                    </p>
                  </div>

                  <p className="text-[13px] font-medium text-[#171717]">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-3 space-y-1 text-[12px]">
              <div className="flex justify-between text-[#555]">
                <dt>Subtotal</dt>
                <dd>{formatMoney(current.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-[#555]">
                <dt>Shipping ({current.shippingMethod})</dt>
                <dd>{current.shipping === 0 ? "Free" : formatMoney(current.shipping)}</dd>
              </div>
              <div className="flex justify-between text-[14px] font-semibold text-[#171717]">
                <dt>Total</dt>
                <dd>{formatMoney(current.total)}</dd>
              </div>
            </dl>
          </Section>

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Customer">
              <p className="text-[13px] text-[#171717]">
                {current.contact.firstName} {current.contact.lastName}
              </p>
              <p className="mt-1 break-all text-[12px] text-[#555]">{current.contact.email}</p>
              <p className="mt-1 text-[12px] text-[#555]">{current.contact.phone}</p>
            </Section>

            <Section title="Shipping Address">
              <p className="text-[12px] leading-5 text-[#555]">
                {current.shippingAddress.address}
                <br />
                {current.shippingAddress.city}
                {current.shippingAddress.postalCode
                  ? `, ${current.shippingAddress.postalCode}`
                  : ""}
                <br />
                {current.shippingAddress.country}
              </p>
            </Section>
          </div>

          <Section title="Update Order">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="next-status" className="mb-1.5 block text-[11px] text-[#555]">
                  Order status
                </label>
                <select
                  id="next-status"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as OrderStatus | "")}
                  disabled={statusOptions.length === 0 || updateOrder.isPending}
                  className={selectClass}
                >
                  <option value="">
                    {statusOptions.length === 0 ? "No further changes" : "Keep current"}
                  </option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="next-payment" className="mb-1.5 block text-[11px] text-[#555]">
                  Payment status
                </label>
                <select
                  id="next-payment"
                  value={nextPayment}
                  onChange={(event) => setNextPayment(event.target.value as PaymentStatus | "")}
                  disabled={paymentOptions.length === 0 || updateOrder.isPending}
                  className={selectClass}
                >
                  <option value="">
                    {paymentOptions.length === 0 ? "No further changes" : "Keep current"}
                  </option>
                  {paymentOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-[#999]">
              Cancelling an order returns its items to stock. Payments are confirmed manually
              until an online payment provider is connected.
            </p>

            {updateOrder.isError && (
              <p role="alert" className="mt-3 bg-[#F8E2DF] px-3 py-2 text-[12px] text-[#AD4944]">
                {getErrorMessage(updateOrder.error)}
              </p>
            )}

            {updateOrder.isSuccess && !hasChanges && (
              <p role="status" className="mt-3 bg-[#E4F0E3] px-3 py-2 text-[12px] text-[#367546]">
                Order updated.
              </p>
            )}
          </Section>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E8E2D8] bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={updateOrder.isPending}
            className="cursor-pointer border border-[#E8E2D8] px-5 py-2.5 text-[12px] text-[#555] transition-colors hover:bg-[#FAF8F4] disabled:cursor-not-allowed"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || updateOrder.isPending}
            className="cursor-pointer bg-[#B08D57] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#967445] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateOrder.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => (
  <AnimatePresence>
    {order && <OrderDetailsContent key={order._id} order={order} onClose={onClose} />}
  </AnimatePresence>
);
