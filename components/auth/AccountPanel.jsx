"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCustomerLogout } from "../../hooks/useCustomer.js";

export const AccountPanel = ({ customer, onClose }) => {
    const t = useTranslations("Account");
    const logout = useCustomerLogout();

    const handleLogout = () => {
        logout.mutate(undefined, {
            onSettled: () => {
                toast.info(t("signedOut"));
                onClose();
            },
        });
    };

    return (
        <div className="w-full text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#B08D57]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                    {t("title")}
                </span>

                <span className="h-px w-8 bg-[#B08D57]" />
            </div>

            <h2
                id="auth-modal-title"
                className="font-serif text-3xl font-medium text-[#171717] sm:text-4xl"
            >
                {customer.firstName}{" "}
                <span className="italic text-[#B08D57]">{customer.lastName}</span>
            </h2>

            <p className="mt-3 break-all text-sm text-[#171717]/60">{customer.email}</p>

            {!customer.emailVerified && (
                <p className="mt-2 text-xs text-[#171717]/45">{t("notVerified")}</p>
            )}

            <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-[#171717] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <LogOut size={16} strokeWidth={1.5} />
                {logout.isPending ? t("signingOut") : t("signOut")}
            </button>
        </div>
    );
};
