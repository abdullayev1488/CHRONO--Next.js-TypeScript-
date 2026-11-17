"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { useCurrency } from "./CurrencyProvider";
import { FREE_SHIPPING_THRESHOLD } from "../lib/shipping";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react"; 
import dynamic from "next/dynamic";

// Modallar yalnız ilk dəfə açılanda yüklənir (ilkin JS yüngül qalır)
const AuthModal = dynamic(() => import("./AuthModal").then((module) => module.AuthModal), {
  ssr: false,
});
const SearchModal = dynamic(() => import("./SearchModal").then((module) => module.SearchModal), {
  ssr: false,
});
import {
  Truck,
  Search,
  UserRound,
  ShoppingBag,
  Heart,
  Menu,
  X, 
} from "lucide-react";

const navItems = [
  { key: "home", path: "/" },
  { key: "collections", path: "/products" },
  { key: "about", path: "/about" },
];

// react-router NavLink əvəzi: aktiv səhifəni pathname ilə müəyyən edirik
const isActivePath = (pathname, path) =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

export const Header = () => {
  const t = useTranslations("Header");
  // CartPage ilə eyni say: ümumi ədəd
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const wishlistCount = useSelector((state) => state.wishlist.ids.length);
  const { format } = useCurrency();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Bağlananda çıxış animasiyası işləsin deyə, bir dəfə açılan modal qoşulu qalır
  const [authLoaded, setAuthLoaded] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);

  // Sabit referans: modalların effektləri hər render-də yenidən qurulmasın
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const pathname = usePathname();

  const [previousPathname, setPreviousPathname] = useState(pathname);

  // Səhifə dəyişəndə mobil menyunu bağlayırıq
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Escape düyməsi ilə menyunu bağlayırıq
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Announcement Bar */}
        <div className="bg-[#171717] px-3 py-2 text-[#F5F1E9]">
          <div className="mx-auto flex items-center justify-center gap-2">
            <Truck
              size={14}
              strokeWidth={1.5}
              className="shrink-0 text-[#D5B47B]"
            />

            <p className="text-center text-[9px] font-medium uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.15em]">
              {t.rich("announcement", {
                amount: format(FREE_SHIPPING_THRESHOLD),
                highlight: (chunks) => (
                  <span className="text-[#D5B47B]">{chunks}</span>
                ),
              })}
            </p>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="border-b border-[#B08D57]/20 bg-[#F5F1E9] shadow-sm">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[84px] lg:px-8">

            {/* Logo */}
            <Link
              href="/"
              className="flex min-w-0 shrink-0 flex-col"
              onClick={() => setIsMobileMenuOpen(false)} 
            >
              <span className="font-serif text-[27px] max-[389px]:text-[22px] font-semibold leading-none tracking-[0.12em] text-[#171717] sm:text-[32px] lg:text-[36px]">
                CHRONO
              </span>

              <span className="mt-1 text-[7px] font-medium uppercase tracking-[0.16em] text-[#B08D57] sm:text-[8px]">
                — {t("tagline")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-12 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 hover:text-[#B08D57] ${
                    isActivePath(pathname, item.path)
                      ? "text-[#B08D57]"
                      : "text-[#171717]"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex shrink-0 items-center gap-1 max-[389px]:gap-0 sm:gap-3">

              {/* Search */}
              <button
                type="button"
                aria-label={t("searchLabel")}
                aria-haspopup="dialog"
                onClick={() => {
                  setIsMobileMenuOpen(false); 
                  setIsSearchOpen(true);
                  setSearchLoaded(true);
                }}
                className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#171717] transition-colors hover:text-[#B08D57] sm:flex"
              >
                <Search size={20} strokeWidth={1.6} />
              </button>

              {/* Account */}
              <button
                type="button"
                aria-label={t("accountLabel")}
                aria-haspopup="dialog"
                onClick={() => {
                  setIsMobileMenuOpen(false); 
                  setIsAuthOpen(true);
                  setAuthLoaded(true);
                }}
                className="flex h-10 w-10 max-[389px]:h-9 max-[389px]:w-9 cursor-pointer items-center justify-center rounded-full text-[#171717] transition-colors hover:text-[#B08D57]"
              >
                <UserRound size={20} strokeWidth={1.6} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label={t("wishlistLabel")}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative flex h-10 w-10 max-[389px]:h-9 max-[389px]:w-9 items-center justify-center rounded-full text-[#171717] transition-colors hover:text-[#B08D57]"
              >
                <Heart size={20} strokeWidth={1.6} />

                {wishlistCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B08D57] px-1 text-[9px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={t("cartLabel")}
                onClick={() => setIsMobileMenuOpen(false)} 
                className="relative flex h-10 w-10 max-[389px]:h-9 max-[389px]:w-9 items-center justify-center rounded-full text-[#171717] transition-colors hover:text-[#B08D57]"
              >
                <ShoppingBag size={21} strokeWidth={1.6} />

                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B08D57] px-1 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              </Link>

              <div className="hidden items-center lg:flex">
                <CurrencySwitcher />
                <LanguageSwitcher />
              </div>

              {/* Mobile Divider */}
              <span className="mx-1 h-6 w-px bg-[#B08D57]/30 max-[389px]:hidden lg:hidden" />

              {/* Mobile Menu Button - yeni */}
              <button
                type="button"
                aria-label={
                  isMobileMenuOpen ? t("closeMenu") : t("openMenu")
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() =>
                  setIsMobileMenuOpen((previous) => !previous)
                }
                className="flex h-10 w-10 max-[389px]:h-9 max-[389px]:w-9 cursor-pointer items-center justify-center text-[#171717] transition-colors hover:text-[#B08D57] lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X size={24} strokeWidth={1.5} />
                ) : (
                  <Menu size={24} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - yeni */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.nav
              id="mobile-navigation"
              aria-label={t("mobileNav")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-b border-[#B08D57]/20 bg-[#F5F1E9] lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col px-6 py-5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`border-b border-[#B08D57]/15 py-4 text-xs font-semibold uppercase tracking-[0.15em] transition-colors hover:text-[#B08D57] ${
                      isActivePath(pathname, item.path)
                        ? "text-[#B08D57]"
                        : "text-[#171717]"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}

                {/* Axtarış: dar ekranda yuxarı panelə sığmır, menyuda göstərilir */}
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                    setSearchLoaded(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-[#B08D57]/15 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-[#171717] transition-colors hover:text-[#B08D57] sm:hidden"
                >
                  <Search size={16} strokeWidth={1.6} />
                  {t("searchLabel")}
                </button>

                {/* Dil və valyuta: kiçik ekranda yuxarı panelə sığmır, menyuda göstərilir */}
                <CurrencySwitcher inline />
                <LanguageSwitcher inline />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {authLoaded && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={closeAuth}
        />
      )}

      {searchLoaded && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={closeSearch}
        />
      )}
    </>
  );
};