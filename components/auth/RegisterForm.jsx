"use client";

import { useState } from "react"; //yeni
import { Eye, EyeOff, ArrowRight } from "lucide-react"; //yeni
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCustomerRegister } from "../../hooks/useCustomer.js";
import { getErrorMessage } from "../../utils/errors.js";

export const RegisterForm = ({ onSwitchToLogin, onSuccess }) => { //yeni
    const t = useTranslations("Register");
    const te = useTranslations("Errors");
    const register = useCustomerRegister();
    const [showPassword, setShowPassword] = useState(false); //yeni
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); //yeni
    const [passwordError, setPasswordError] = useState(""); //yeni

    const handleSubmit = (event) => { //yeni
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const confirmPassword = formData.get("confirmPassword");
        const [firstName, ...rest] = String(formData.get("name") ?? "").trim().split(/\s+/);
        const lastName = rest.join(" ");

        if (register.isPending) return;

        if (!firstName || !lastName) {
            setPasswordError(t("nameError"));
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError(t("mismatch"));
            return;
        }

        setPasswordError("");

        register.mutate(
            {
                firstName,
                lastName,
                email: String(formData.get("email") ?? "").trim(),
                password,
            },
            {
                onSuccess: (customer) => {
                    toast.success(t("welcome", { name: customer.firstName }));
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <div className="w-full">
            {/* Heading */}
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

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="modal-register-name"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                    >
                        {t("fullName")}
                    </label>

                    <input
                        id="modal-register-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        minLength={2}
                        placeholder={t("fullNamePlaceholder")}
                        className="h-12 w-full border border-[#E8E2D8] bg-white px-4 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]"
                    />
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="modal-register-email"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                    >
                        {t("email")}
                    </label>

                    <input
                        id="modal-register-email"
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
                    <label
                        htmlFor="modal-register-password"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                    >
                        {t("password")}
                    </label>

                    <div className="relative">
                        <input
                            id="modal-register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={10}
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

                    <p className="mt-2 text-[11px] text-[#171717]/40">
                        {t("passwordHint")}
                    </p>
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="modal-register-confirm-password"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75"
                    >
                        {t("confirmPassword")}
                    </label>

                    <div className="relative">
                        <input
                            id="modal-register-confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={10}
                            placeholder={t("confirmPlaceholder")}
                            aria-invalid={Boolean(passwordError)}
                            aria-describedby={
                                passwordError ? "register-password-error" : undefined
                            }
                            onChange={() => {
                                if (passwordError) setPasswordError("");
                            }}
                            className={`h-12 w-full border bg-white px-4 pr-12 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 ${passwordError
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[#E8E2D8] focus:border-[#B08D57]"
                                }`}
                        />

                        <button
                            type="button"
                            aria-label={
                                showConfirmPassword
                                    ? t("hideConfirm")
                                    : t("showConfirm")
                            }
                            aria-pressed={showConfirmPassword}
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-[#171717]/40 transition-colors hover:text-[#B08D57]"
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} strokeWidth={1.5} />
                            ) : (
                                <Eye size={18} strokeWidth={1.5} />
                            )}
                        </button>
                    </div>

                    {passwordError && (
                        <p
                            id="register-password-error"
                            role="alert"
                            className="mt-2 text-xs text-red-600"
                        >
                            {passwordError}
                        </p>
                    )}
                </div>

                {register.isError && (
                    <p role="alert" className="bg-[#F8E2DF] px-3 py-2.5 text-xs text-[#AD4944]">
                        {getErrorMessage(register.error, te)}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={register.isPending}
                    className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-[#171717] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {register.isPending ? t("creating") : t("create")}

                    <ArrowRight
                        size={16}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 border-t border-[#E8E2D8] pt-7 text-center">
                <p className="text-xs text-[#171717]/55">
                    {t("haveAccount")}{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="cursor-pointer font-semibold text-[#B08D57] transition-colors hover:text-[#171717]"
                    >
                        {t("signIn")}
                    </button>
                </p>
            </div>
        </div>
    );
};