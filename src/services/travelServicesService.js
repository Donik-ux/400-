/**
 * AI-backed traveler services (Gemini via grokClient shim).
 *
 * Each function builds a tightly-scoped prompt, asks Gemini for STRICT JSON,
 * and parses it. If the API key is missing or the call fails, every function
 * throws a typed Error so the UI can show a friendly fallback. The widgets in
 * Services.jsx catch these and render a graceful "couldn't reach AI" state.
 */
import { askGrok, isGrokAvailable, extractJson } from './grokClient';

const LANG_NAME = {
  en: 'English', uz: 'Uzbek', ru: 'Russian', es: 'Spanish', fr: 'French',
  de: 'German', tr: 'Turkish', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi',
};
const langName = (code) => LANG_NAME[code] || 'English';

const run = async (prompt, { signal } = {}) => {
  if (!isGrokAvailable()) {
    const e = new Error('AI_UNAVAILABLE');
    e.code = 'AI_UNAVAILABLE';
    throw e;
  }
  const text = await askGrok(prompt, { json: true, temperature: 0.4, signal, timeoutMs: 30000 });
  return extractJson(text);
};

/* ── 1. AI Visa Checker ─────────────────────────────────────────────── */
export async function checkVisa({ nationality, destination, lang = 'en' }, opts) {
  const prompt = `You are a visa requirements assistant. A traveler holding a passport from "${nationality}" wants to visit "${destination}" for tourism.
Respond ONLY with strict JSON, written in ${langName(lang)}, with this exact shape:
{
  "status": "visa_free" | "visa_on_arrival" | "e_visa" | "visa_required" | "unknown",
  "summary": "one short sentence",
  "stayDuration": "e.g. 30 days",
  "estimatedCost": "e.g. Free, or $25",
  "processingTime": "e.g. Instant, or 3-5 days",
  "documents": ["passport valid 6 months", "..."],
  "notes": "one short practical note",
  "disclaimer": "Always confirm with the official embassy before traveling."
}
Be accurate and conservative. If unsure, use "unknown".`;
  return run(prompt, opts);
}

/* ── 2. AI Budget Optimizer ─────────────────────────────────────────── */
export async function optimizeBudget({ destination, days, budget, travelers = 1, lang = 'en' }, opts) {
  const prompt = `You are a travel budget optimizer. Trip: destination "${destination}", ${days} days, ${travelers} traveler(s), total budget $${budget} USD.
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "verdict": "tight" | "comfortable" | "generous",
  "perDay": number,
  "breakdown": [ { "category": "Flights", "amount": number, "pct": number } , ... up to 6 categories: Flights, Stay, Food, Activities, Transport, Misc ],
  "tips": ["3 to 5 concrete money-saving tips for this destination"],
  "summary": "one motivating sentence"
}
Make amounts sum to roughly the total budget. Use realistic ${destination} prices.`;
  return run(prompt, opts);
}

/* ── 3. Cheapest Month to Travel ────────────────────────────────────── */
export async function cheapestMonth({ destination, lang = 'en' }, opts) {
  const prompt = `For tourism to "${destination}", analyze typical seasonal pricing and crowds.
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "cheapest": { "month": "Month name", "why": "short reason" },
  "mostExpensive": { "month": "Month name", "why": "short reason" },
  "bestValue": { "month": "Month name", "why": "good weather + lower price" },
  "months": [ { "month": "Jan", "level": "low" | "medium" | "high" }, ... all 12 short month names in order ],
  "summary": "one sentence"
}`;
  return run(prompt, opts);
}

/* ── 4. Flight Price Prediction ─────────────────────────────────────── */
export async function predictFlightPrice({ from, to, month, lang = 'en' }, opts) {
  const prompt = `Estimate round-trip economy flight prices from "${from}" to "${to}"${month ? ` around ${month}` : ''}.
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "low": number, "typical": number, "high": number,
  "currency": "USD",
  "trend": "rising" | "falling" | "stable",
  "advice": "should they book now or wait? one sentence",
  "bestBookingWindow": "e.g. 4-6 weeks before departure",
  "summary": "one sentence"
}
Use realistic market prices.`;
  return run(prompt, opts);
}

/* ── 5. Hotel Price Prediction ──────────────────────────────────────── */
export async function predictHotelPrice({ city, tier = 'mid-range', month, lang = 'en' }, opts) {
  const prompt = `Estimate nightly hotel prices in "${city}" for a "${tier}" hotel${month ? ` around ${month}` : ''}.
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "low": number, "typical": number, "high": number,
  "currency": "USD",
  "trend": "rising" | "falling" | "stable",
  "advice": "one sentence booking tip",
  "areaTip": "best value neighborhood to stay, one sentence",
  "summary": "one sentence"
}
Use realistic per-night prices.`;
  return run(prompt, opts);
}
