"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

// Escape ilə bağlama, fokus tutma (focus trap), scroll lock və fokusu əvvəlki elementə qaytarma
export const useModalBehavior = (
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  canClose = true
): void => {
  const closeRef = useRef(onClose);
  const canCloseRef = useRef(canClose);

  useEffect(() => {
    closeRef.current = onClose;
    canCloseRef.current = canClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const getFocusable = (): HTMLElement[] =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    (dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? getFocusable()[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && canCloseRef.current) {
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [dialogRef]);
};
