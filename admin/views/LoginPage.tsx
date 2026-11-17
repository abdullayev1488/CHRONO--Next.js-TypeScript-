"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAdminLogin, useAdminSession } from "@/admin/hooks/useAdmin";
import { getErrorMessage } from "@/admin/utils/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  "h-12 w-full border border-[#E8E2D8] bg-white px-4 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]";

const LABEL_CLASS =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717]/75";

export const LoginPage = () => {
  const router = useRouter();
  const { data: admin, isLoading } = useAdminSession();
  const login = useAdminLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Artıq giriş edilibsə dashboard-a yönləndirilir
  useEffect(() => {
    if (admin) router.replace("/admin");
  }, [admin, router]);

  if (isLoading || admin) {
    return <div className="h-dvh bg-[#FAF8F4]" />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (login.isPending) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!EMAIL_PATTERN.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setFormError("Please enter your password.");
      return;
    }

    setFormError("");

    login.mutate({ email, password }, { onSuccess: () => router.replace("/admin") });
  };

  const loginError = (): string => {
    if (!login.isError) return "";

    return isAxiosError(login.error) && login.error.response?.status === 429
      ? "Too many attempts. Please try again later."
      : getErrorMessage(login.error);
  };

  const errorMessage = formError || loginError();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FAF8F4] px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-[34px] tracking-[0.12em] text-[#171717]">CHRONO</h1>

          <p className="mt-1 text-[10px] tracking-[0.3em] text-[#B08D57]">ADMIN PANEL</p>
        </div>

        <div className="border border-[#E8E2D8] bg-white p-6 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#B08D57]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
                Authorized Access
              </span>

              <span className="h-px w-8 bg-[#B08D57]" />
            </div>

            <h2 className="font-serif text-3xl font-medium text-[#171717]">
              Welcome <span className="italic text-[#B08D57]">Back</span>
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#171717]/50">
              Sign in to manage your store.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label htmlFor="admin-email" className={LABEL_CLASS}>
                Email Address
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                data-autofocus
                placeholder="admin@example.com"
                disabled={login.isPending}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className={LABEL_CLASS}>
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={login.isPending}
                  className={`${INPUT_CLASS} pr-12`}
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {errorMessage && (
              <p role="alert" className="bg-[#F8E2DF] px-3 py-2.5 text-[12px] text-[#AD4944]">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="group flex h-12 w-full cursor-pointer items-center justify-center gap-3 bg-[#171717] px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {login.isPending ? "Signing in..." : "Sign In"}

              {!login.isPending && (
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
