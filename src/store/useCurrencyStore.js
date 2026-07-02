import { create } from 'zustand';

/* Site-wide display currency. Prices are stored in USD and converted for
   display via <Price> / usePriceFormatter.

   Rates come from the free open.er-api.com feed (~160 world currencies, daily
   refresh, no API key) — the same source the Tools converter already uses.
   They're cached in localStorage so the picker works instantly on revisit and
   keeps working offline; the bundled table below is only the first-paint /
   no-network fallback. */

// Approximate rates per 1 USD — fallback when the live API is unreachable
export const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, AED: 3.67, UZS: 12700, KGS: 87.5, KZT: 480,
  RUB: 90, TRY: 34, THB: 36, JPY: 150, CNY: 7.2, INR: 83, KRW: 1350, GEL: 2.7,
  CHF: 0.88, CAD: 1.36, AUD: 1.5, SGD: 1.34, HKD: 7.8, EGP: 48, SAR: 3.75,
  QAR: 3.64, IDR: 16000, MYR: 4.4, VND: 25000, PHP: 58, TJS: 10.6, AZN: 1.7,
  AMD: 388, BYN: 3.3, UAH: 41, PLN: 3.9, CZK: 23, SEK: 10.4, NOK: 10.6,
  DKK: 6.9, ILS: 3.7, MXN: 18, BRL: 5.6, ZAR: 18, MAD: 9.9, LKR: 300, NPR: 133,
};

// Shown as a quick-pick group at the top of the currency dropdown
export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'UZS', 'KGS', 'KZT', 'RUB', 'TRY', 'CNY', 'JPY', 'SAR'];

const RATES_CACHE_KEY = 'currency_rates_v1';
const RATES_TTL_MS = 12 * 60 * 60 * 1000; // refresh live rates twice a day

const readCachedRates = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(RATES_CACHE_KEY) || 'null');
    if (raw && raw.rates && typeof raw.rates.USD === 'number') return raw;
  } catch { /* corrupted cache — ignore */ }
  return null;
};

const readCurrency = () => localStorage.getItem('currency') || 'USD';

const cached = readCachedRates();

const useCurrencyStore = create((set, get) => ({
  currency: readCurrency(),
  rates: cached?.rates || FALLBACK_RATES,
  ratesStatus: cached ? 'cached' : 'fallback', // fallback | cached | live

  setCurrency: (code) => {
    if (!get().rates[code]) return;
    localStorage.setItem('currency', code);
    set({ currency: code });
  },

  loadRates: async () => {
    const fresh = readCachedRates();
    if (fresh && Date.now() - fresh.ts < RATES_TTL_MS) {
      set({ rates: fresh.rates, ratesStatus: 'cached' });
      return;
    }
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.rates?.USD) {
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: data.rates, ts: Date.now() }));
        set({ rates: data.rates, ratesStatus: 'live' });
        // If the saved currency vanished from the feed, fall back to USD
        if (!data.rates[get().currency]) set({ currency: 'USD' });
      }
    } catch { /* stay on cached/fallback rates */ }
  },
}));

// Kick off the live-rate load once per app start
useCurrencyStore.getState().loadRates();

export default useCurrencyStore;
