import { create } from 'zustand';

// Fixed, approximate conversion rates from USD (the site's base pricing currency).
// Not live-rate-synced — good enough for display purposes, no paid FX API required.
export const CURRENCIES = {
  USD: { symbol: '$',     suffix: '',     label: 'US Dollar',   rate: 1 },
  EUR: { symbol: '€',     suffix: '',     label: 'Euro',        rate: 0.92 },
  AED: { symbol: 'AED ',  suffix: '',     label: 'UAE Dirham',  rate: 3.67 },
  UZS: { symbol: '',      suffix: ' UZS', label: 'Uzbek Som',   rate: 12700 },
};

const readCurrency = () => {
  const saved = localStorage.getItem('currency');
  return CURRENCIES[saved] ? saved : 'USD';
};

const useCurrencyStore = create((set) => ({
  currency: readCurrency(),
  setCurrency: (code) => {
    if (!CURRENCIES[code]) return;
    localStorage.setItem('currency', code);
    set({ currency: code });
  },
}));

export default useCurrencyStore;
