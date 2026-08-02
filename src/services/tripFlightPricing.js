/**
 * Real round-trip airfare for a generated trip plan.
 *
 * Until now the plan's flight cost was a slice of the traveler's own budget
 * (22% of it, ±20%) — the same "$352–528" whether the route was Tashkent →
 * Istanbul or Tashkent → Sydney. This resolves an actual price instead, using
 * the same cascade as the Flights page:
 *
 *   1. /api/flights  — Travelpayouts / Amadeus / Duffel live offers (needs the
 *                      server env keys; returns a real bookable fare).
 *   2. AI estimate   — flightService.refineWithAi, a route-aware typical fare.
 *   3. null          — caller keeps its budget-derived range.
 *
 * The `source` field travels with the result so the UI can be honest about
 * which of those the traveler is looking at.
 */
import { searchAirports } from '../data/airports';
import { getCityCode } from '../data/cityCodes';
import { refineWithAi } from './flightService';

/** Live-offer sources — anything else is an estimate and must be labelled so. */
export const REAL_FARE_SOURCES = ['amadeus', 'travelpayouts', 'duffel', 'kiwi'];

/**
 * "Istanbul (IST)" / "Istanbul, Turkey" / "istanbul" → "IST".
 * Returns null rather than guessing when the place isn't in our airport list.
 */
export const iataFor = (place) => {
  const raw = String(place || '').trim();
  if (!raw) return null;

  // CityAutocomplete hands back "City (CODE)" — trust the explicit code.
  const explicit = raw.match(/\(([A-Za-z]{3})\)\s*$/);
  if (explicit) return explicit[1].toUpperCase();

  if (/^[A-Za-z]{3}$/.test(raw)) return raw.toUpperCase();

  // "Istanbul, Turkey" → match on the city part only.
  const city = raw.split(',')[0].trim();
  const hit = searchAirports(city, 1)[0];
  if (hit && hit.city.toLowerCase() === city.toLowerCase()) return hit.code;

  return getCityCode(city);
};

const isoDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
};

/** Cheapest live offer for one leg, or null when no source can price it. */
const cheapestLiveOffer = async ({ from, to, date, adults, signal }) => {
  const qs = new URLSearchParams({
    from, to, adults: String(adults), cabin: 'ECONOMY', ...(date ? { date } : {}),
  });
  let json;
  try {
    const res = await fetch(`/api/flights?${qs}`, { signal });
    if (!res.ok) return null;          // 501 = keys not configured, 502 = upstream down
    json = await res.json();
  } catch {
    return null;
  }
  const offers = Array.isArray(json?.flights) ? json.flights.filter((f) => f.price > 0) : [];
  if (!offers.length) return null;

  const best = offers.reduce((a, b) => (b.price < a.price ? b : a));
  return {
    price:       Math.round(best.price),
    airline:     best.airline || '',
    airlineLogo: best.airlineLogo || '✈️',
    duration:    best.duration || '',
    stops:       Number(best.stops) || 0,
    departure:   best.departure || '',
    buyLink:     best.buyLink || '',
    from, to, date,
    source:      json.source || 'amadeus',
  };
};

/**
 * Price the trip's outbound and return legs.
 *
 * @returns {Promise<null | {
 *   source: string, isLive: boolean,
 *   outbound: object, inbound: object|null,
 *   perPerson: number, total: number, travelers: number,
 *   range?: { low: number, high: number }, note?: string,
 * }>}
 */
export const fetchTripFlights = async ({
  fromCity, destination, returnCity, startDate, days = 5, travelers = 1, signal,
} = {}) => {
  const origin = iataFor(fromCity);
  const dest   = iataFor(destination);
  if (!origin || !dest || origin === dest) return null;

  const back = iataFor(returnCity) || origin;
  const pax  = Math.max(1, Number(travelers) || 1);

  const outDate = startDate ? isoDate(startDate) : '';
  let backDate = '';
  if (outDate) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.max(0, (Number(days) || 5) - 1));
    backDate = isoDate(d);
  }

  // ── 1. Live offers ──
  const [out, ret] = await Promise.all([
    cheapestLiveOffer({ from: origin, to: dest, date: outDate, adults: pax, signal }),
    cheapestLiveOffer({ from: dest, to: back, date: backDate, adults: pax, signal }),
  ]);

  if (out) {
    const perPerson = out.price + (ret?.price || 0);
    return {
      source: out.source,
      isLive: REAL_FARE_SOURCES.includes(out.source),
      outbound: out,
      inbound: ret,
      perPerson,
      total: perPerson * pax,
      travelers: pax,
    };
  }

  // ── 2. Route-aware AI estimate ──
  const ai = await refineWithAi({ from: origin, to: dest, date: outDate });
  if (ai && Number.isFinite(ai.median)) {
    const oneWay = Math.round(ai.median);
    // A return leg is priced as its own one-way here; round trips usually come
    // in slightly under 2× a one-way, so trim 10% rather than doubling blindly.
    const perPerson = Math.round(oneWay * 1.8);
    return {
      source: 'ai-estimate',
      isLive: false,
      outbound: { from: origin, to: dest,  date: outDate,  price: oneWay, airlineLogo: '✈️' },
      inbound:  { from: dest,   to: back,  date: backDate, price: perPerson - oneWay, airlineLogo: '✈️' },
      perPerson,
      total: perPerson * pax,
      travelers: pax,
      range: { low: Math.round(ai.low * 1.8), high: Math.round(ai.high * 1.8) },
      note: ai.note || '',
    };
  }

  return null;
};

/**
 * Write the resolved fare into the plan so the number in the day-by-day
 * timeline is the same one on the flights card.
 *
 * A day often carries several flight-typed events ("Departure from Tashkent",
 * "Flight to Istanbul", "Arrival at IST") — they are one ticket, so exactly one
 * of them shows the fare and the rest are marked as covered by it. Otherwise
 * the same $420 would appear three times and read as $1,260.
 *
 * Only the first and last days are touched: a flight-typed event on a middle
 * day is a separate hop (a domestic leg, a day trip) and keeps its own price.
 *
 * @param {(n: number) => string} opts.fmt          money formatter (user's currency)
 * @param {string} opts.includedLabel               shown on the follow-on legs
 */
export const applyFlightPricing = (plan, flights, { fmt, includedLabel = 'Included in ticket' } = {}) => {
  if (!plan || !flights || !Array.isArray(plan.days)) return plan;
  const money = typeof fmt === 'function' ? fmt : (n) => `$${Math.round(n).toLocaleString()}`;

  const lastIdx = plan.days.length - 1;
  const days = plan.days.map((d, i) => {
    // The return leg only exists on the final day of a multi-day trip.
    const isReturn = i === lastIdx && lastIdx > 0 && Boolean(flights.inbound);
    if (i !== 0 && !isReturn) return d;          // middle-day hops are their own tickets
    const leg = isReturn ? flights.inbound : flights.outbound;
    if (!leg) return d;

    // Which row carries the fare: on the way out the flight comes first and
    // the airport events follow it, on the way home it is the other way round
    // ("check-in & security", then "departure flight"). Anchoring to the first
    // vs last flight-typed event of the day puts the price on the leg itself
    // rather than on the queueing that surrounds it.
    const flightIdx = (d.events || []).reduce(
      (acc, ev, k) => (ev.type === 'flight' && (acc === -1 || isReturn) ? k : acc),
      -1,
    );
    if (flightIdx === -1) return d;

    const events = (d.events || []).map((ev, k) => {
      if (ev.type !== 'flight') return ev;
      if (k !== flightIdx) return { ...ev, price: includedLabel };
      return {
        ...ev,
        // `price` is the formatted snapshot that print/share/saved plans keep;
        // `priceUsd` lets the live UI re-format it when the traveler switches
        // currency, which a baked-in string could not do.
        price: money(leg.price),
        priceUsd: leg.price,
        airline: leg.airline || ev.airline,
        duration: leg.duration || ev.duration,
      };
    });
    return { ...d, events };
  });

  return {
    ...plan,
    days,
    flights,
    // The budget tiles all describe one traveler's share of the trip budget, so
    // the per-person fare is what belongs there — the ×travellers total stays on
    // the flights card. `flightBudgeted` keeps the original allocation so the UI
    // can point out when the real fare blows past what the budget assumed.
    budgetBreakdown: plan.budgetBreakdown
      ? {
          ...plan.budgetBreakdown,
          flight: flights.perPerson,
          flightBudgeted: plan.budgetBreakdown.flight,
        }
      : plan.budgetBreakdown,
  };
};
