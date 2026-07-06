import React from 'react';
import useCurrencyStore from '../store/useCurrencyStore';
import { formatPrice, formatPriceCompact } from '../utils/formatPrice';

// Renders a USD base amount converted + formatted into the user's selected currency.
// Drop-in replacement for `${amount}` wherever a price is displayed.
// Subscribes to `rates` too, so prices refresh when live FX rates arrive.
export default function Price({ amount, className }) {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  return <span className={className}>{formatPrice(amount, currency, rates)}</span>;
}

// For cases where the price is embedded inside a larger string/template
// rather than standing alone as JSX (e.g. inside another translated sentence).
export const usePriceFormatter = () => {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  return (amountUsd) => formatPrice(amountUsd, currency, rates);
};

// Compact variant for tight UI (fare chips): big converted amounts become "UZS 139.9M".
export const useCompactPriceFormatter = () => {
  const currency = useCurrencyStore((s) => s.currency);
  const rates = useCurrencyStore((s) => s.rates);
  return (amountUsd) => formatPriceCompact(amountUsd, currency, rates);
};
