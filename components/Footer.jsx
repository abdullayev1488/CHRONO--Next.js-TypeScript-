"use client";


import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Watch,
  ArrowRight,
  Camera,
} from "lucide-react";

const shopLinks = [
  { key: "home", path: "/" },
  { key: "collections", path: "/products" },
  { key: "aboutLink", path: "/about" },
  { key: "bag", path: "/cart" },
];

export const Footer = ({ year }) => {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-[#171717] text-[#F5F1E9]">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20 lg:px-8">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="font-serif text-4xl font-semibold tracking-[0.15em] text-white">
                CHRONO
              </h2>

              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#B08D57]">
                {t("tagline")}
              </p>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/55">
              {t("about")}
            </p>

            {/* Social icons - UI only */}
            <div className="mt-7 flex items-center gap-3">
              <span className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-[#B08D57] hover:bg-[#B08D57] hover:text-white">
                <Camera size={18} strokeWidth={1.5} />
              </span>

              <span className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-white/70 transition-all duration-300 hover:border-[#B08D57] hover:bg-[#B08D57] hover:text-white">
                f
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("explore")}
            </h3>

            <ul className="mt-7 space-y-4">
              {shopLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition-colors duration-300 hover:text-[#B08D57]"
                  >
                    {t(item.key)}

                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("contact")}
            </h3>

            <div className="mt-7 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#B08D57]"
                />

                <span className="text-sm leading-6 text-white/60">
                  {t("address")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-[#B08D57]"
                />

                <span className="break-all text-sm text-white/60">
                  hello@chrono.com
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-[#B08D57]"
                />

                <span className="text-sm text-white/60">
                  +994 XX XXX XX XX
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter - UI only */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B08D57]">
              {t("journal")}
            </h3>

            <p className="mt-7 text-sm leading-7 text-white/60">
              {t("journalText")}
            </p>

            <div className="mt-6 flex min-w-0 items-center border-b border-white/30 pb-3">
              <Mail
                size={17}
                className="mr-3 shrink-0 text-[#B08D57]"
              />

              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                aria-label={t("emailLabel")}
                readOnly
                className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />

              <ArrowRight
                size={19}
                className="ml-2 shrink-0 text-[#B08D57]"
              />
            </div>

            <p className="mt-3 text-xs text-white/35">
              {t("comingSoon")}
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-5 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/40">
            © {year} CHRONO. {t("rights")}
          </p>

          <div className="flex items-center gap-2 text-[#B08D57]">
            <Watch size={17} strokeWidth={1.5} />

            <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
              {t("slogan")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
