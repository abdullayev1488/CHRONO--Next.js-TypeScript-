"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useModalBehavior } from "@/admin/hooks/useModalBehavior";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  productName?: string;
  /** Başlıq (standart: "Delete Product") */
  title?: string;
  /** Standart məhsul mətnini əvəz edən izah */
  description?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string;
}

type ContentProps = Omit<ConfirmDeleteModalProps, "isOpen" | "isDeleting" | "error" | "title"> &
  Required<Pick<ConfirmDeleteModalProps, "title">> &
  Required<Pick<ConfirmDeleteModalProps, "isDeleting" | "error">>;

const ConfirmDeleteContent = ({
  productName,
  title,
  description,
  onCancel,
  onConfirm,
  isDeleting,
  error,
}: ContentProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Bağlanma animasiyası zamanı ad itməsin deyə ilk dəyər saxlanılır
  const [name] = useState(productName);

  useModalBehavior(dialogRef, onCancel, !isDeleting);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <motion.div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-[#FAF8F4] shadow-2xl"
      >
        <div className="px-6 py-7 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8E2DF] text-[#B45342]">
            <AlertTriangle size={26} strokeWidth={1.6} />
          </div>

          <h2 id="delete-modal-title" className="mt-5 font-serif text-[24px] text-[#171717]">
            {title}
          </h2>

          <p id="delete-modal-description" className="mt-3 text-[13px] leading-6 text-[#555]">
            {description ?? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#171717]">{name}</span>? This action cannot be
                undone. If the product already has orders, it will be archived so the order history
                is preserved.
              </>
            )}
          </p>

          {error && (
            <p role="alert" className="mt-4 bg-[#F8E2DF] px-3 py-2 text-[12px] text-[#AD4944]">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E8E2D8] bg-white px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            data-autofocus
            className="cursor-pointer border border-[#E8E2D8] px-5 py-2.5 text-[12px] text-[#555] transition-colors hover:bg-[#FAF8F4] disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex cursor-pointer items-center gap-2 bg-[#B45342] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#963F30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={15} />
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ConfirmDeleteModal = ({
  isOpen,
  productName,
  title = "Delete Product",
  description,
  onCancel,
  onConfirm,
  isDeleting = false,
  error = "",
}: ConfirmDeleteModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <ConfirmDeleteContent
        key="delete-modal"
        productName={productName}
        title={title}
        description={description}
        onCancel={onCancel}
        onConfirm={onConfirm}
        isDeleting={isDeleting}
        error={error}
      />
    )}
  </AnimatePresence>
);
