import React from 'react';
import useCurrencyStore from '../store/useCurrencyStore';
import { formatPrice } from '../utils/formatPrice';

// Renders a USD base amount converted + formatted into the user's selected currency.
// Drop-in replacement for `${amount}` wherever a price is displayed.
export default function Price({ amount, className }) {
  const currency = useCurrencyStore((s) => s.currency);
  return <span className={className}>{formatPrice(amount, currency)}</span>;
}

// For cases where the price is embedded inside a larger string/template
// rather than standing alone as JSX (e.g. inside another translated sentence).
export const usePriceFormatter = () => {
  const currency = useCurrencyStore((s) => s.currency);
  return (amountUsd) => formatPrice(amountUsd, currency);
};
