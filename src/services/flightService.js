import { askGrok, isGrokAvailable, extractJson } from './grokClient';

// Real-world airlines that actually fly the listed regions
const AIRLINES = [
  { name: 'Turkish Airlines',   code: 'TK', logo: '🇹🇷' },
  { name: 'Emirates',           code: 'EK', logo: '🇦🇪' },
  { name: 'Fly Dubai',          code: 'FZ', logo: '🇦🇪' },
  { name: 'Qatar Airways',      code: 'QR', logo: '🇶🇦' },
  { name: 'Aeroflot',           code: 'SU', logo: '🇷🇺' },
  { name: 'Air Astana',         code: 'KC', logo: '🇰🇿' },
  { name: 'Uzbekistan Airways', code: 'HY', logo: '🇺🇿' },
  { name: 'Pegasus Airlines',   code: 'PC', logo: '🇹🇷' },
  { name: 'Air Arabia',         code: 'G9', logo: '🇦🇪' },
  { name: 'British Airways',    code: 'BA', logo: '🇬🇧' },
  { name: 'Lufthansa',          code: 'LH', logo: '🇩🇪' },
  { name: 'Singapore Airlines', code: 'SQ', logo: '🇸🇬' },
];

// Deterministic pseudo-random helper (so the same route+date always returns the same flights)
const hashSeed = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const mulberry32 = (seed) => {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (h, m) => {
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${pad(m)} ${period}`;
};

// Resolve the departure date → default to the nearest upcoming day (tomorrow) when none picked
const resolveDepartDate = (d) => {
  if (d) return d;
  const dt = new Date();
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString().split('T')[0];
};

// Format "YYYY-MM-DD" → "Mon, 12 Jun" (short, human-readable departure-day label)
export const formatFlightDate = (iso, locale = 'en-US') => {
  if (!iso) return '';
  const dt = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
};

const CABIN_MULTIPLIER = {
  'Economy':         1,
  'Premium Economy': 1.6,
  'Business':        3.2,
  'First':           6.0,
};

/* ── Grok-powered base-price refinement (cached per route+date) ──
 *
 * Asks Grok for a realistic typical economy fare for the given route on the given
 * date based on its knowledge of the airline market — then we derive the 6 flights
 * around that anchor price using the same deterministic mulberry seeding so the
 * results stay consistent on re-search.
 */
const PRICE_CACHE = new Map();
const PRICE_CACHE_TTL = 30 * 60 * 1000;  // 30 minutes

const cacheKey = (from, to, date) => `${from}|${to}|${date || 'any'}`;

// Once Grok returns 403 in this session, stop retrying — the key is bad/expired
// and every additional call just pollutes the console with the same error.
let _grokDisabled = false;

const askGrokForPrice = async ({ from, to, date, signal }) => {
  if (_grokDisabled || !isGrokAvailable()) return null;

  const prompt = `You are an airfare expert. Estimate a realistic ONE-WAY ECONOMY base fare in USD for a flight from ${from} to ${to}${date ? ` on or near ${date}` : ''}.
Consider: airline market (low-cost vs full-service), route distance, typical layovers, seasonality of the date.
Return ONLY a tight JSON object: { "median": NUMBER, "low": NUMBER, "high": NUMBER, "currency": "USD", "note": "<one short sentence>" }.
Prices should be sane (no extreme outliers): commonly $120–$1500 for most routes.`;

  try {
    const raw = await askGrok(prompt, { temperature: 0.4, json: true, signal, timeoutMs: 18_000 });
    const parsed = extractJson(raw);
    const median = Number(parsed.median);
    if (!Number.isFinite(median) || median < 50 || median > 5000) return null;
    return {
      median,
      low:  Number(parsed.low)  || Math.round(median * 0.75),
      high: Number(parsed.high) || Math.round(median * 1.4),
      note: String(parsed.note || '').slice(0, 140),
    };
  } catch (err) {
    if (/\b40[13]\b/.test(err.message)) {
      _grokDisabled = true;
      console.info('Grok API key rejected (403/401) — skipping AI price refinement.');
    } else {
      console.warn('Grok price estimate failed:', err.message);
    }
    return null;
  }
};

export const refineWithAi = async ({ from, to, date }) => {
  const key = cacheKey(from, to, date);
  const cached = PRICE_CACHE.get(key);
  if (cached && Date.now() - cached.ts < PRICE_CACHE_TTL) return cached.value;

  const value = await askGrokForPrice({ from, to, date });
  if (value) PRICE_CACHE.set(key, { ts: Date.now(), value });
  return value;
};

export const searchFlights = async ({ from, to, date, cabin = 'Economy', pax = 1, aiBasePrice } = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!from || !to) return [];

  // Every flight is anchored to a concrete departure day (the one the user picked,
  // or the nearest upcoming day if they didn't pick one).
  const departDate = resolveDepartDate(date);
  const seedStr = `${from}|${to}|${departDate}|${cabin}`;
  const rand = mulberry32(hashSeed(seedStr));
  // Approximate ECONOMY fares in the ~$400–$900 band (deterministic per route+date).
  // NOTE: these are ESTIMATES only — the exact, real-time fare is always shown on
  // the airline / booking site the user is redirected to. AI refinement may nudge
  // the anchor but the number still isn't a live quote.
  const cabinMult = CABIN_MULTIPLIER[cabin] || 1;

  const pickAirline = () => AIRLINES[Math.floor(rand() * AIRLINES.length)];

  return Array.from({ length: 6 }, (_, i) => {
    const airline   = pickAirline();
    const stops     = rand() > 0.55 ? 0 : rand() > 0.5 ? 1 : 2;

    // Duration: nonstop = 3-5h, 1 stop = 6-10h, 2 stops = 11-16h
    const baseMins  = stops === 0 ? 180 + Math.floor(rand() * 120)
                   : stops === 1 ? 360 + Math.floor(rand() * 240)
                   :               660 + Math.floor(rand() * 300);
    const durH = Math.floor(baseMins / 60);
    const durM = baseMins % 60;
    const duration = `${durH}h ${pad(durM)}m`;

    // Departure 04:00–23:00
    const depH = 4 + Math.floor(rand() * 19);
    const depM = Math.floor(rand() * 12) * 5;
    const depMins = depH * 60 + depM;
    const arrNextDay = depMins + baseMins >= 24 * 60;       // lands the following day
    const arrTotal = (depMins + baseMins) % (24 * 60);
    const arrH = Math.floor(arrTotal / 60);
    const arrM = arrTotal % 60;

    // Approximate economy fare in the $400–$900 band, varied per flight.
    const economyAnchor = Number.isFinite(aiBasePrice)
      ? aiBasePrice * (0.85 + rand() * 0.3)
      : 400 + Math.floor(rand() * 501);            // 400..900
    const stopCost = stops * (-10 - rand() * 20);  // stops usually a bit cheaper
    let price = Math.round(economyAnchor * cabinMult + stopCost);
    if (cabin === 'Economy') price = Math.max(400, Math.min(900, price));

    const seatsLeft = 1 + Math.floor(rand() * 23);

    return {
      id: `${airline.code}-${i}-${seedStr.length}`,
      airline:     airline.name,
      airlineCode: `${airline.code}-${100 + Math.floor(rand() * 900)}`,
      airlineLogo: airline.logo,
      cabin,
      price,
      pricePerPerson: price,
      totalPrice: price * Math.max(1, Number(pax) || 1),
      departure: fmtTime(depH, depM),
      arrival:   fmtTime(arrH, arrM),
      departMins: depMins,          // minutes from midnight → for "nearest departure" sorting
      arrNextDay,
      duration,
      stops,
      from: String(from).toUpperCase(),
      to:   String(to).toUpperCase(),
      date: departDate,
      seats: seatsLeft,
      eco:   stops === 0 && airline.code !== 'EK',  // direct + non-Emirates pseudo "eco"
    };
  }).sort((a, b) => a.price - b.price);
};
