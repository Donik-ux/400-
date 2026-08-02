/**
 * Collapse a price range into the single figure a traveler can actually plan
 * with.
 *
 * Itineraries used to be full of "$300–500" and "15–25 долларов США": true,
 * but useless for budgeting — you cannot add a range to a running total, and
 * a 60% spread reads as "we don't know". The generators are now told to give
 * one number, and this is the safety net for when a model hands back a range
 * anyway (they often do, whatever the prompt says).
 *
 * The midpoint is used, rounded to a figure that looks like a price rather
 * than an average: "$300–500" → "$400", "15–25 долларов США" → "20 долларов
 * США", "IDR 60,000–80,000" → "IDR 70,000". Everything around the numbers —
 * currency symbol, words, "per person" tails — is preserved untouched.
 */

/** "1,200" / "1 200" / "1.30" → Number. */
const parseAmount = (s) => {
  const cleaned = String(s).replace(/\s/g, '');
  // A dot or comma is a decimal separator only when it is followed by 1–2
  // digits at the very end ("1.30"); otherwise it groups thousands ("60,000").
  const decimal = /[.,]\d{1,2}$/.test(cleaned)
    ? cleaned.replace(/[.,](?=\d{1,2}$)/, '#').replace(/[.,]/g, '').replace('#', '.')
    : cleaned.replace(/[.,]/g, '');
  const n = Number(decimal);
  return Number.isFinite(n) ? n : NaN;
};

/** Round to something that reads like a real price, not a computed mean. */
const roundNicely = (n) => {
  if (n >= 1000) return Math.round(n / 50) * 50;
  if (n >= 100)  return Math.round(n / 10) * 10;
  return Math.max(1, Math.round(n));     // whole units — "$4.50" reads as change, not a price
};

/** Re-apply the input's thousands grouping so "60,000" doesn't become "70000". */
const formatLike = (n, sample) => {
  const grouped = /\d[.,\s]\d{3}\b/.test(String(sample));
  if (!grouped) return String(n);
  const sep = /\d,\d{3}/.test(String(sample)) ? ',' : /\d\.\d{3}/.test(String(sample)) ? '.' : ' ';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
};

const RANGE = /(\d[\d\s.,]*\d|\d)\s*[-–—]\s*(\d[\d\s.,]*\d|\d)/;

/**
 * @param {string} raw a price string, possibly containing a range
 * @returns {string} the same string with any range collapsed to one figure
 */
export const exactPrice = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';

  const collapsed = s.replace(RANGE, (match, lo, hi) => {
    const a = parseAmount(lo);
    const b = parseAmount(hi);
    // Not a range we understand (or "$50-off" style text) — leave it alone.
    if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return match;
    return formatLike(roundNicely((a + b) / 2), lo);
  });

  // "~" and "approx." promise imprecision we no longer have to admit to.
  return collapsed.replace(/^\s*[~≈]\s*/, '').replace(/^\s*(approx\.?|around|about)\s+/i, '').trim();
};

/** Apply exactPrice to every price-bearing field of a generated plan, in place. */
export const exactPricesInPlan = (plan) => {
  if (!plan) return plan;
  for (const d of plan.days || []) {
    for (const ev of d.events || []) {
      if (ev.price) ev.price = exactPrice(ev.price);
    }
    if (d.halalRestaurant?.avgPrice) d.halalRestaurant.avgPrice = exactPrice(d.halalRestaurant.avgPrice);
    if (d.hotel?.price) d.hotel.price = exactPrice(d.hotel.price);
  }
  if (plan.hotel?.pricePerNight) plan.hotel.pricePerNight = exactPrice(plan.hotel.pricePerNight);
  if (plan.hotel?.price)         plan.hotel.price         = exactPrice(plan.hotel.price);
  return plan;
};
