"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_CURRENCY,
  formatPrice,
  isCurrencyCode,
} from "../lib/currency";

const STORAGE_KEY = "currency";

// Seçim localStorage-da saxlanılır; əlçatmazdırsa yalnız cari sessiyada (yaddaşda) qalır
let memoryCurrency = DEFAULT_CURRENCY;
const listeners = new Set();

const readCurrency = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(saved) ? saved : memoryCurrency;
  } catch {
    return memoryCurrency;
  }
};

const subscribe = (listener) => {
  listeners.add(listener);
  // Başqa tabda dəyişiklik olanda da yenilənir
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const writeCurrency = (next) => {
  memoryCurrency = next;

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Yaddaş əlçatmazdırsa seçim yalnız cari sessiyada qalır
  }

  listeners.forEach((listener) => listener());
};

// Hər istifadəçi komponent valyutanı ÖZÜ oxuyur: Suspense daxilində gec hydrate olan komponentlər də
// hydrate zamanı server snapshot-ını (USD) götürür, sonra seçilmiş valyutaya keçir (mismatch olmur)
const getServerCurrency = () => DEFAULT_CURRENCY;

const setCurrency = (next) => {
  if (isCurrencyCode(next)) writeCurrency(next);
};

export const useCurrency = () => {
  const currency = useSyncExternalStore(subscribe, readCurrency, getServerCurrency);

  return useMemo(
    () => ({
      currency,
      setCurrency,
      format: (usdAmount) => formatPrice(usdAmount, currency),
    }),
    [currency]
  );
};

// Provider artıq vəziyyət saxlamır; mövcud istifadə yerləri dəyişməsin deyə saxlanılıb
export const CurrencyProvider = ({ children }) => children;
