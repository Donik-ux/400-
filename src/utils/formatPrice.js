import useCurrencyStore from '../store/useCurrencyStore';

// `amountUsd` is always the site's internal base price (USD). Converts + formats
// it for display in the given currency. Intl.NumberFormat knows the symbol and
// decimal conventions for every ISO 4217 currency, so any world currency works.
// `rates` can be passed by reactive callers (see <Price>); plain calls read the
// current store snapshot.
export const formatPrice = (amountUsd, currencyCode = 'USD', rates) => {
  const table = rates || useCurrencyStore.getState().rates;
  const code = table[currencyCode] ? currencyCode : 'USD';
  const converted = (Number(amountUsd) || 0) * (table[code] ?? 1);
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    // Unknown-to-Intl code — plain number + code suffix
    return `${Math.round(converted).toLocaleString('en-US')} ${code}`;
  }
};
