import { CURRENCIES } from '../store/useCurrencyStore';

// `amountUsd` is always the site's internal base price (USD). Converts + formats
// it for display in the given currency code.
export const formatPrice = (amountUsd, currencyCode = 'USD') => {
  const cfg = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = (Number(amountUsd) || 0) * cfg.rate;
  const rounded = Math.round(converted).toLocaleString('en-US');
  return `${cfg.symbol}${rounded}${cfg.suffix}`;
};
