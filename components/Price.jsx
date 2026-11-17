"use client";

import { useCurrency } from "./CurrencyProvider";

/** USD məbləğini seçilmiş valyutada göstərir. */
export const Price = ({ value, className }) => {
  const { format } = useCurrency();

  return <span className={className}>{format(value)}</span>;
};
