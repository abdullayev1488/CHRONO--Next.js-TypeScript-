"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";
import { AccountPanel } from "./auth/AccountPanel";
import { useCustomer } from "../hooks/useCustomer.js";

export const AuthModal = ({ isOpen, onClose }) => {
    const t = useTranslations("AuthModal");
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
    const closeButtonRef = useRef(null);
    const [activeForm, setActiveForm] = useState("login");
    const { data: customer } = useCustomer();
    const [wasOpen, setWasOpen] = useState(isOpen);

    // Modal hər açılanda login formasına qayıdırıq
    if (wasOpen !== isOpen) {
        setWasOpen(isOpen);

        if (isOpen) {
            setActiveForm("login");
        }
    }

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }

            if (event.key === "Tab") {
                const modal = closeButtonRef.current?.closest("[role='dialog']");
                const focusable = modal?.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                if (!focusable?.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [isOpen, onClose]);


    // document.body yalnız brauzerdə mövcuddur (SSR-də portal yoxdur)
    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="auth-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 py-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="auth-modal-title"
                        initial={{ opacity: 0, y: 25, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.97 }}
                        transition={{
                            duration: 0.35,
                            ease: "easeOut",
                        }}
                        className="relative max-h-[90dvh] w-full max-w-[460px] overflow-y-auto bg-[#FAF8F4] px-6 py-10 shadow-2xl sm:px-10"
                    >
                        {/* Close Button */}
                        <button
                            ref={closeButtonRef}
                            type="button"
                            aria-label={t("close")}
                            onClick={onClose}
                            className="absolute right-5 top-5 cursor-pointer text-[#171717]/60 transition-colors hover:text-[#B08D57]"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>

                        {/* Login / Register animated content */}
                        <AnimatePresence mode="wait" initial={false}>

                            {/* Account */}
                            {customer && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <AccountPanel customer={customer} onClose={onClose} />
                                </motion.div>
                            )}

                            {/* Login */}
                            {!customer && activeForm === "login" && (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <LoginForm
                                        onSuccess={onClose}
                                        onSwitchToRegister={() =>
                                            setActiveForm("register")
                                        }
                                    />
                                </motion.div>
                            )}

                            {/* Register */}
                            {!customer && activeForm === "register" && (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {/* Yeni Register komponenti */}
                                    <RegisterForm
                                        onSuccess={onClose}
                                        onSwitchToLogin={() =>
                                            setActiveForm("login")
                                        }
                                    />
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};