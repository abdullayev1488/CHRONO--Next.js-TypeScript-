// Qiymətlər bazada həmişə USD ilə saxlanılır; valyuta yalnız göstəriş üçündür.

export const DEFAULT_CURRENCY = "USD";

export const CURRENCIES = {
  USD: { code: "USD", symbol: "USA", locale: "en-US" },
  AZN: { code: "AZN", symbol: "AZN", locale: "az-AZ" },
  RUB: { code: "RUB", symbol: "RU", locale: "ru-RU" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

// DİQQƏT: Aşağıdakı məzənnələr SABİT NÜMUNƏ (placeholder) dəyərlərdir.
// Real məzənnə mənbəyi (məs. Mərkəzi Bank API-si) qoşulanda bu obyekt əvəz olunmalıdır.
// Dəyər: 1 USD = ? valyuta
export const RATES_FROM_USD = {
  USD: 1,
  AZN: 1.7,
  RUB: 90,
};

export const isCurrencyCode = (value) => Object.hasOwn(CURRENCIES, value);

export const convertFromUsd = (usdAmount, currency) =>
  usdAmount * RATES_FROM_USD[currency];

const formatters = new Map();

const getFormatter = (currency) => {
  if (!formatters.has(currency)) {
    const { locale } = CURRENCIES[currency];

    formatters.set(
      currency,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      })
    );
  }

  return formatters.get(currency);
};

/** USD məbləğini seçilmiş valyutada formatlanmış mətnə çevirir. */
export const formatPrice = (usdAmount, currency = DEFAULT_CURRENCY) =>
  getFormatter(currency).format(convertFromUsd(usdAmount, currency));
