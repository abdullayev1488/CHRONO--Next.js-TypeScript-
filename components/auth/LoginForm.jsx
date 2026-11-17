"use client";

import { useState } from "react"; 
import { Eye, EyeOff, ArrowRight } from "lucide-react"; 
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCustomerLogin } from "../../hooks/useCustomer.js";
import { getErrorMessage } from "../../utils/errors.js";

export const LoginForm = ({ onSwitchToRegister, onSuccess }) => { 
    const t = useTranslations("Login");
    const te = useTranslations("Errors");
    const [showPassword, setShowPassword] = useState(false); 
    const login = useCustomerLogin();

    const handleSubmit = (event) => { 
        event.preventDefault(); 

        if (login.isPending) return;

        const formData = new FormData(event.currentTarget);

        login.mutate(
            {
                email: String(formData.get("email") ?? "").trim(),
                password: String(formData.get("password") ?? ""),
            },
            {
                onSuccess: (customer) => {
                    toast.success(t("welcomeBack", { name: customer.firstName }));
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <div className="mb-5 flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-[#B08D57]" />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                        {t("eyebrow")}
                    </span>

                    <span className="h-px w-8 bg-[#B08D57]" />
                </div>

                <h2
                    id="auth-modal-title"
                    className="font-serif text-3xl font-medium text-[#171717] sm:text-4xl"
                >
                    {t.rich("title", {
                        accent: (chunks) => (
                            <span className="italic text-[#B08D57]">{chunks}</span>
                        ),
                    })}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#171717]/50">
                    {t("subtitle")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label
                        htmlFor="modal-login-email"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                    >
                        {t("email")}
                    </label>

                    <input
                        id="modal-login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder={t("emailPlaceholder")}
                        className="h-12 w-full border border-[#E8E2D8] bg-white px-4 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]"
                    />
                </div>

                {/* Password */}
                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="modal-login-password"
                            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                        >
                            {t("password")}
                        </label>

                        <span className="text-[11px] font-medium text-[#B08D57]">
                            {t("forgot")}
                        </span>
                    </div>

                    <div className="relative">
                        <input
                            id="modal-login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder={t("passwordPlaceholder")}
                            className="h-12 w-full border border-[#E8E2D8] bg-white px-4 pr-12 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]"
                        />

                        <button
                            type="button"
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-[#171717]/40 transition-colors hover:text-[#B08D57]"
                        >
                            {showPassword ? (
                                <EyeOff size={18} strokeWidth={1.5} />
                            ) : (
                                <Eye size={18} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>

                {login.isError && (
                    <p role="alert" className="bg-[#F8E2DF] px-3 py-2.5 text-xs text-[#AD4944]">
                        {getErrorMessage(login.error, te)}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={login.isPending}
                    className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-[#171717] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {login.isPending ? t("signingIn") : t("signIn")}

                    <ArrowRight
                        size={16}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </button>
            </form>

            <div className="mt-8 border-t border-[#E8E2D8] pt-7 text-center">
                <p className="text-xs text-[#171717]/55">
                    {t("noAccount")}{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="cursor-pointer font-semibold text-[#B08D57] transition-colors hover:text-[#171717]"
                    >
                        {t("createAccount")}
                    </button>
                </p>
            </div>
        </div>
    );
};