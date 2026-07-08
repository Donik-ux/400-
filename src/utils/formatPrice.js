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

// Same conversion, but large amounts collapse to compact notation ("UZS 139.9M")
// so weak-currency prices fit in tight UI like fare-calendar chips. Small
// amounts keep the full format — "$9,990" is already short.
// The K/M/B scaling is done by hand: Intl engines that predate `notation`
// silently ignore the option and render the full 11-digit number, which
// overflows the chips.
export const formatPriceCompact = (amountUsd, currencyCode = 'USD', rates) => {
  const table = rates || useCurrencyStore.getState().rates;
  const code = table[currencyCode] ? currencyCode : 'USD';
  const converted = (Number(amountUsd) || 0) * (table[code] ?? 1);
  if (converted < 100000) return formatPrice(amountUsd, currencyCode, rates);
  const [div, suffix] = converted >= 1e9 ? [1e9, 'B'] : converted >= 1e6 ? [1e6, 'M'] : [1e3, 'K'];
  const short = Math.round((converted / div) * 10) / 10;
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(short) + suffix;
  } catch {
    return `${short.toLocaleString('en-US')}${suffix} ${code}`;
  }
};
