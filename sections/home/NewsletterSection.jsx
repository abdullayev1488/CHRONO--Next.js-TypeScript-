"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Mail } from "lucide-react";

export const NewsletterSection = () => {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState(""); 
  const [error, setError] = useState(""); 
  const [message, setMessage] = useState(""); 

   // Form göndəriləndə işləyən funksiya
  const handleSubscribe = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(t("errorEmpty"));
      setMessage("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError(t("errorInvalid"));
      setMessage("");
      return;
    }

    setError("");
    setMessage(t("success"));
  };

  return (
    <section className="relative overflow-hidden bg-[#22201E] px-5 py-20 text-white sm:px-8 sm:py-28 lg:py-32">

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#B08D57]/20 sm:h-[500px] sm:w-[500px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full border border-[#B08D57]/10 sm:h-[450px] sm:w-[450px]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">

        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#B08D57]/40">
          <Mail
            size={26}
            strokeWidth={1.3}
            className="text-[#D5B47B]"
          />
        </div>

        {/* Subtitle */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-[#B08D57]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D5B47B] sm:text-xs">
            {t("eyebrow")}
          </span>
          <span className="h-px w-8 bg-[#B08D57]" />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
          {t("title1")}
          <span className="block italic text-[#D5B47B]">
            {t("title2")}
          </span>
        </h2>

        {/* Description */}
        <p className="mt-7 max-w-xl text-sm leading-8 text-white/60 sm:text-base">
          {t("text")}
        </p>

        {/* Newsletter Form - yeni */}
        <form
          onSubmit={handleSubscribe}
          noValidate
          className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder={t("placeholder")}
            aria-label={t("emailLabel")}
            aria-invalid={Boolean(error)}
            aria-describedby="newsletter-feedback"
            className="min-h-14 min-w-0 flex-1 border border-white/20 bg-white/5 px-5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#D5B47B]"
          />

          <button
            type="submit"
            className="flex min-h-14 cursor-pointer items-center justify-center gap-3 bg-[#B08D57] px-8 text-xs font-semibold uppercase tracking-[0.12em] text-[#171717] transition-colors duration-300 hover:bg-[#D5B47B]"
          >
            {t("subscribe")}
            <ArrowUpRight size={18} strokeWidth={1.6} />
          </button>
        </form>

        {/* Form feedback - yeni */}
        <div
          id="newsletter-feedback"
          aria-live="polite"
          className="mt-5 min-h-5 text-xs"
        >
          {error && (
            <p className="text-red-400">{error}</p>
          )}

          {message && (
            <p className="text-[#D5B47B]">{message}</p>
          )}

          {!error && !message && (
            <p className="text-white/35">
              {t("comingSoon")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};