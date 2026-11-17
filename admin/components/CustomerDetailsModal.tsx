"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { useCustomer } from "@/admin/hooks/useCustomers";
import { useModalBehavior } from "@/admin/hooks/useModalBehavior";
import type { Customer } from "@/admin/types/customers";
import { formatDate, formatMoney } from "@/admin/utils/format";

interface CustomerDetailsContentProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetailsContent = ({ customer, onClose }: CustomerDetailsContentProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useCustomer(customer._id);

  useModalBehavior(dialogRef, onClose);

  const orders = data?.orders ?? [];

  const summary: ReadonlyArray<readonly [label: string, value: string | number]> = [
    ["Orders", customer.ordersCount],
    ["Total spent", formatMoney(customer.totalSpent)],
    ["Joined", formatDate(customer.createdAt)],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex max-h-[92dvh] w-full max-w-[600px] flex-col overflow-hidden bg-[#FAF8F4] shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E8E2D8] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 id="customer-modal-title" className="font-serif text-[24px] text-[#171717]">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="mt-1 break-all text-[11px] text-[#888]">{customer.email}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            data-autofocus
            className="cursor-pointer p-2 text-[#777] transition-colors hover:text-[#171717]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid grid-cols-3 gap-3">
            {summary.map(([label, value]) => (
              <div key={label} className="border border-[#E8E2D8] bg-white p-3">
                <p className="text-[10px] text-[#888]">{label}</p>
                <p className="mt-1 text-[13px] font-semibold text-[#171717]">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#777]">
            Email {customer.emailVerified ? "verified" : "not verified"}
          </p>

          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B08D57]">
              Order History
            </h3>

            {isLoading && <p className="text-[12px] text-[#777]">Loading orders...</p>}
            {isError && <p className="text-[12px] text-red-600">Failed to load orders.</p>}
            {!isLoading && !isError && orders.length === 0 && (
              <p className="text-[12px] text-[#777]">This customer has no orders yet.</p>
            )}

            {orders.length > 0 && (
              <div className="divide-y divide-[#E8E2D8] border border-[#E8E2D8] bg-white">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3"
                  >
                    <div>
                      <p className="text-[12px] font-medium text-[#171717]">{order.orderNumber}</p>
                      <p className="mt-0.5 text-[11px] text-[#888]">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-[12px] font-semibold text-[#171717]">
                        {formatMoney(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface CustomerDetailsModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerDetailsModal = ({ customer, onClose }: CustomerDetailsModalProps) => (
  <AnimatePresence>
    {customer && (
      <CustomerDetailsContent key={customer._id} customer={customer} onClose={onClose} />
    )}
  </AnimatePresence>
);
