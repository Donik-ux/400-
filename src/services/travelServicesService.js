/**
 * AI-backed traveler services (Gemini via grokClient shim).
 *
 * Each function builds a tightly-scoped prompt, asks Gemini for STRICT JSON,
 * and parses it. If the API key is missing or the call fails, every function
 * throws a typed Error so the UI can show a friendly fallback. The widgets in
 * Services.jsx catch these and render a graceful "couldn't reach AI" state.
 */
import { askGrok, isGrokAvailable, extractJson } from './grokClient';
import { getWeatherForDates } from './weatherForecast';
import { LANG_MAP } from '../i18n/languages';

const LANG_NAME = {
  en: 'English', uz: 'Uzbek', ru: 'Russian', es: 'Spanish', fr: 'French',
  de: 'German', tr: 'Turkish', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi',
};
const langName = (code) => LANG_NAME[code] || LANG_MAP[code]?.target || LANG_MAP[code]?.name || 'English';

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

/* ── Natural-language trip parser ("Дубай на неделю за $2500 в июне") ── */
/**
 * Turns a free-text trip wish in ANY language into planner form fields.
 * Returns only fields the model is confident about; everything else null.
 */
export async function parseTripQuery(query, opts) {
  const text = String(query || '').trim().slice(0, 300);
  if (!text) {
    const e = new Error('EMPTY_QUERY');
    e.code = 'EMPTY_QUERY';
    throw e;
  }
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `A traveler typed this trip wish (any language): "${text}"
Today is ${today}. Extract planner fields. Respond ONLY with strict JSON:
{
  "destination": "city name in English (e.g. Dubai), or null if none mentioned",
  "days": number or null,
  "budget": number (total trip budget in USD) or null,
  "startDate": "YYYY-MM-DD or null — resolve phrases like 'in June' to the 1st of that month AFTER today",
  "budgetStyle": "luxury" | "comfort" | "standard" | "economy" | "budget" | null
}
Use null for anything not clearly stated — never invent a destination.`;
  const parsed = await run(prompt, opts);
  const days = Number(parsed?.days);
  const budget = Number(parsed?.budget);
  return {
    destination: typeof parsed?.destination === 'string' && parsed.destination.trim() && parsed.destination !== 'null'
      ? parsed.destination.trim() : null,
    days:   Number.isFinite(days)   && days   >= 1 && days   <= 21     ? Math.round(days)   : null,
    budget: Number.isFinite(budget) && budget >= 50 && budget <= 500000 ? Math.round(budget) : null,
    startDate: typeof parsed?.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.startDate)
      ? parsed.startDate : null,
    budgetStyle: ['luxury', 'comfort', 'standard', 'economy', 'budget'].includes(parsed?.budgetStyle)
      ? parsed.budgetStyle : null,
  };
}

/* ── Fare Advice grounded in live offers ────────────────────────────── */
// 30-min per-route cache — repeat clicks cost zero AI quota (same pattern as
// the flight-price cache in flightService.js).
const FARE_ADVICE_CACHE = new Map();
const FARE_ADVICE_TTL = 30 * 60_000;

/**
 * "Book now or wait" verdict grounded in the REAL fares currently on screen
 * (Kiwi/Aviasales/Duffel/Amadeus results), not model guesses alone.
 * @param {{ from: string, to: string, date?: string,
 *           offers: {i:number, price:number, airline:string, stops:number, duration?:string}[],
 *           lang?: string }} params
 */
export async function explainFares({ from, to, date, offers, lang = 'en' }, opts) {
  // The verdict indexes into THIS offers list — different filters/refreshed
  // fares must not reuse a cached answer computed against another list.
  const offersSig = offers.map((o) => `${o.price}${o.airline}`).join(',');
  const cacheKey = `${from}|${to}|${date || ''}|${lang}|${offersSig}`;
  const hit = FARE_ADVICE_CACHE.get(cacheKey);
  if (hit && Date.now() - hit.at < FARE_ADVICE_TTL) return hit.data;

  const table = offers
    .map((o) => `#${o.i}: $${o.price}, ${o.airline}, ${o.stops === 0 ? 'non-stop' : `${o.stops} stop(s)`}${o.duration ? `, ${o.duration}` : ''}`)
    .join('\n');
  const prompt = `These are REAL flight offers currently shown to a traveler for ${from} → ${to}${date ? ` departing ${date}` : ''}:
${table}
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "bestOfferIndex": number,
  "verdict": "book" | "wait" | "neutral",
  "typicalPrice": number,
  "reason": "2 short sentences that reference the actual prices listed above",
  "confidence": "low" | "medium" | "high"
}
"bestOfferIndex" is the # of the best VALUE offer (balance of price, stops and airline quality — not always the cheapest). "typicalPrice" is the typical market round-trip fare in USD for this route and season. "verdict" compares the listed prices to that typical fare: "book" when clearly below it, "wait" when clearly above.`;

  const parsed = await run(prompt, opts);
  const idx = Number(parsed?.bestOfferIndex);
  const data = {
    bestOfferIndex: Number.isInteger(idx) && idx >= 0 && idx < offers.length ? idx : 0,
    verdict: ['book', 'wait', 'neutral'].includes(parsed?.verdict) ? parsed.verdict : 'neutral',
    typicalPrice: Number(parsed?.typicalPrice) > 0 ? Math.round(Number(parsed.typicalPrice)) : null,
    reason: typeof parsed?.reason === 'string' ? parsed.reason : '',
    confidence: ['low', 'medium', 'high'].includes(parsed?.confidence) ? parsed.confidence : 'medium',
  };
  FARE_ADVICE_CACHE.set(cacheKey, { at: Date.now(), data });
  return data;
}

/* ── AI Packing Brief (weather-grounded) ────────────────────────────── */
/**
 * Personalized packing list grounded in the REAL Open-Meteo forecast/climate
 * for the trip dates. Returns the same `{ seasonLabel, categories }` shape as
 * the rule-based src/services/packingList.js (plus `narrative` and `ai:true`)
 * so the Planner checklist card and PDF consume it unchanged. Cached per
 * trip signature in localStorage so repeat visits cost zero AI quota.
 */
export async function aiPackingBrief({ destination, startDate, days = 5, purpose = '', travelers = 1, lang = 'en' }, opts) {
  const cacheKey = `maf_pack_v1_${destination}_${String(startDate || '').slice(0, 10)}_${days}_${purpose}_${lang}`;
  try {
    const hit = localStorage.getItem(cacheKey);
    if (hit) {
      const parsed = JSON.parse(hit);
      if (Array.isArray(parsed?.categories) && parsed.categories.length) return parsed;
    }
  } catch { /* corrupt cache — regenerate */ }

  // Real weather summary for the dates (never invented; skipped when unknown).
  let weatherLine = '';
  try {
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start)) {
        const n = Math.min(Math.max(1, Number(days) || 5), 14);
        const pad = (x) => String(x).padStart(2, '0');
        const isoDates = Array.from({ length: n }, (_, i) => {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        });
        const wx = await getWeatherForDates(destination, isoDates);
        const vals = Object.values(wx || {}).filter(Boolean);
        if (vals.length) {
          const maxT = Math.round(Math.max(...vals.map((v) => v.tempMax)));
          const minT = Math.round(Math.min(...vals.map((v) => v.tempMin ?? v.tempMax)));
          const rainDays = vals.filter((v) => (v.precipitation ?? 0) > 2).length;
          const src = vals[0].source === 'forecast' ? 'live forecast' : '3-year climate average';
          weatherLine = `\nREAL WEATHER for these dates (${src}, Open-Meteo): ${minT}°C to ${maxT}°C, rainy days ${rainDays} of ${vals.length}. Ground the items and narrative in this data — do not contradict it.`;
        }
      }
    }
  } catch { /* weather is a bonus, not a requirement */ }

  const prompt = `Build a packing brief for a real trip: destination "${destination}", ${days} days, ${travelers} traveler(s)${purpose ? `, purpose: ${purpose}` : ''}${startDate ? `, starting ${new Date(startDate).toDateString()}` : ''}.${weatherLine}
Respond ONLY with strict JSON, written in ${langName(lang)}, shape:
{
  "narrative": "2-3 sentences on what the weather and days will actually feel like there and how to dress",
  "seasonLabel": "very short label with one emoji, e.g. '🌧 Rainy autumn'",
  "categories": [ { "title": "short category name", "emoji": "one emoji", "items": ["specific item — short reason when helpful"] } ]
}
Max 5 categories, 4-8 items each. Make items destination-specific (dress codes, mosque/temple visits, sun, altitude, plugs). When real weather is given, reference it concretely (e.g. "compact umbrella (rain on 4 of 7 days)").`;

  const parsed = await run(prompt, opts);
  const categories = (Array.isArray(parsed?.categories) ? parsed.categories : [])
    .filter((c) => c && typeof c.title === 'string' && Array.isArray(c.items) && c.items.length)
    .slice(0, 6)
    .map((c) => ({
      title: c.title,
      emoji: typeof c.emoji === 'string' ? c.emoji.slice(0, 4) : '🎒',
      items: c.items.filter((i) => typeof i === 'string' && i.trim()).slice(0, 10),
    }));
  if (!categories.length) {
    const e = new Error('AI_BAD_SHAPE');
    e.code = 'AI_BAD_SHAPE';
    throw e;
  }
  const out = {
    seasonLabel: typeof parsed.seasonLabel === 'string' ? parsed.seasonLabel : '',
    narrative:   typeof parsed.narrative   === 'string' ? parsed.narrative   : '',
    categories,
    ai: true,
  };
  try { localStorage.setItem(cacheKey, JSON.stringify(out)); } catch { /* quota full — fine */ }
  return out;
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
