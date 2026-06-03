/**
 * Local currency for a destination — answers "what money do I pay with there".
 * Reuses resolveCountry() so "Dubai", "Dubai, UAE" and "dubai" all resolve.
 * perUsd = approximate units of local currency per 1 USD (estimate, not live).
 */
import { resolveCountry } from './emergencyContacts';

const EUR = { code: 'EUR', name: 'Евро', symbol: '€', perUsd: 0.92 };

const CURRENCY = {
  // Eurozone
  Germany: EUR, France: EUR, Italy: EUR, Spain: EUR, Portugal: EUR,
  Netherlands: EUR, Belgium: EUR, Austria: EUR, Greece: EUR,
  // Rest of Europe
  Switzerland: { code: 'CHF', name: 'Швейцарский франк', symbol: '₣',  perUsd: 0.88 },
  Poland:      { code: 'PLN', name: 'Польский злотый',   symbol: 'zł', perUsd: 4.0 },
  Czechia:     { code: 'CZK', name: 'Чешская крона',     symbol: 'Kč', perUsd: 23 },
  UK:          { code: 'GBP', name: 'Фунт стерлингов',   symbol: '£',  perUsd: 0.79 },
  Russia:      { code: 'RUB', name: 'Российский рубль',  symbol: '₽',  perUsd: 90 },
  // Middle East
  UAE:            { code: 'AED', name: 'Дирхам ОАЭ',        symbol: 'د.إ', perUsd: 3.67 },
  Qatar:          { code: 'QAR', name: 'Катарский риал',    symbol: 'ر.ق', perUsd: 3.64 },
  'Saudi Arabia': { code: 'SAR', name: 'Саудовский риял',   symbol: 'ر.س', perUsd: 3.75 },
  Turkey:         { code: 'TRY', name: 'Турецкая лира',     symbol: '₺',  perUsd: 34 },
  Egypt:          { code: 'EGP', name: 'Египетский фунт',   symbol: 'E£', perUsd: 49 },
  Morocco:        { code: 'MAD', name: 'Марокканский дирхам',symbol: 'DH', perUsd: 10 },
  Israel:         { code: 'ILS', name: 'Израильский шекель',symbol: '₪',  perUsd: 3.7 },
  Jordan:         { code: 'JOD', name: 'Иорданский динар',  symbol: 'JD', perUsd: 0.71 },
  // Asia
  Japan:        { code: 'JPY', name: 'Японская иена',     symbol: '¥',  perUsd: 150 },
  China:        { code: 'CNY', name: 'Китайский юань',    symbol: '¥',  perUsd: 7.2 },
  'South Korea':{ code: 'KRW', name: 'Корейская вона',    symbol: '₩',  perUsd: 1350 },
  Thailand:     { code: 'THB', name: 'Тайский бат',       symbol: '฿',  perUsd: 36 },
  Singapore:    { code: 'SGD', name: 'Сингапурский доллар',symbol: 'S$', perUsd: 1.34 },
  Malaysia:     { code: 'MYR', name: 'Малайзийский ринггит',symbol: 'RM', perUsd: 4.5 },
  Indonesia:    { code: 'IDR', name: 'Индонезийская рупия',symbol: 'Rp', perUsd: 15800 },
  Vietnam:      { code: 'VND', name: 'Вьетнамский донг',  symbol: '₫',  perUsd: 25000 },
  India:        { code: 'INR', name: 'Индийская рупия',   symbol: '₹',  perUsd: 83 },
  Maldives:     { code: 'MVR', name: 'Мальдивская руфия', symbol: 'Rf', perUsd: 15.4 },
  // Americas
  USA:       { code: 'USD', name: 'Доллар США',          symbol: '$',  perUsd: 1 },
  Canada:    { code: 'CAD', name: 'Канадский доллар',    symbol: 'C$', perUsd: 1.36 },
  Mexico:    { code: 'MXN', name: 'Мексиканское песо',   symbol: '$',  perUsd: 18 },
  Brazil:    { code: 'BRL', name: 'Бразильский реал',    symbol: 'R$', perUsd: 5.4 },
  Argentina: { code: 'ARS', name: 'Аргентинское песо',   symbol: '$',  perUsd: 970 },
  // Oceania
  Australia:     { code: 'AUD', name: 'Австралийский доллар',   symbol: 'A$',  perUsd: 1.5 },
  'New Zealand': { code: 'NZD', name: 'Новозеландский доллар',  symbol: 'NZ$', perUsd: 1.65 },
  // CIS & home region
  Kyrgyzstan: { code: 'KGS', name: 'Кыргызский сом',  symbol: 'с',  perUsd: 87.5 },
  Uzbekistan: { code: 'UZS', name: 'Узбекский сум',   symbol: "so'm", perUsd: 12600 },
  Kazakhstan: { code: 'KZT', name: 'Казахский тенге', symbol: '₸',  perUsd: 480 },
  Tajikistan: { code: 'TJS', name: 'Таджикский сомони',symbol: 'SM', perUsd: 10.9 },
  Azerbaijan: { code: 'AZN', name: 'Азербайджанский манат', symbol: '₼', perUsd: 1.7 },
  Georgia:    { code: 'GEL', name: 'Грузинский лари', symbol: '₾',  perUsd: 2.7 },
  Armenia:    { code: 'AMD', name: 'Армянский драм',  symbol: '֏',  perUsd: 390 },
};

/** Format an amount of local currency for display. */
export const formatLocal = (n) => {
  const v = Number(n) || 0;
  return v >= 1000 ? Math.round(v).toLocaleString()
       : v >= 10   ? Math.round(v).toLocaleString()
       : v.toFixed(2);
};

/**
 * @param {string} destination - city or "City, Country"
 * @returns {{country,code,name,symbol,perUsd}|null}
 */
export function getCurrencyInfo(destination = '') {
  const country = resolveCountry(destination);
  if (!country) return null;
  const cur = CURRENCY[country];
  return cur ? { country, ...cur } : null;
}
