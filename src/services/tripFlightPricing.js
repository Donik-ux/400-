/**
 * Real round-trip airfare for a generated trip plan.
 *
 * Until now the plan's flight cost was a slice of the traveler's own budget
 * (22% of it, ±20%) — the same "$352–528" whether the route was Tashkent →
 * Istanbul or Tashkent → Sydney. This resolves an actual price instead:
 *
 *   1. Google Flights (SerpApi) — one round-trip search returning the fare a
 *      traveler would see on google.com/travel/flights, with the operating
 *      airline, real times and the layover count.
 *   2. /api/flights — Travelpayouts / Amadeus / Duffel, two one-way lookups.
 *   3. AI estimate  — flightService.refineWithAi, a route-aware typical fare.
 *   4. null         — caller keeps its budget-derived figure.
 *
 * The `source` field travels with the result so the UI can be honest about
 * which of those the traveler is looking at.
 */
import { searchAirports } from '../data/airports';
import { getCityCode } from '../data/cityCodes';
import { refineWithAi } from './flightService';

/** Live-offer sources — anything else is an estimate and must be labelled so. */
export const REAL_FARE_SOURCES = ['google-flights', 'amadeus', 'travelpayouts', 'duffel', 'kiwi'];

/** Class tier per trip style, matching what the itinerary assumes. */
const CLASS_FOR_STYLE = { luxury: 'business', comfort: 'premium' };

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
 * One round-trip Google Flights search. The endpoint always asks for a single
 * adult (see api/flightsSerp.js), so the fare returned here is per person for
 * the whole round trip — the party total is applied by the caller.
 */
const googleFlightsRoundTrip = async ({ from, to, outboundDate, returnDate, style, signal }) => {
  const qs = new URLSearchParams({
    departureId: from, arrivalId: to, outboundDate, currency: 'USD',
    travelClass: CLASS_FOR_STYLE[style] || 'economy',
  });
  if (returnDate) qs.set('returnDate', returnDate);

  let json;
  try {
    const res = await fetch(`/api/flightsSerp?${qs}`, { signal });
    if (!res.ok) return null;         // 501 = no key, 429 = search quota spent
    json = await res.json();
  } catch {
    return null;
  }
  // The list is price-sorted, so this takes the CHEAPEST of Google's "best
  // flights" — the ones it considers a fair trade of price against duration
  // and stops. Taking flights[0] outright would hand a traveler an 11-hour
  // one-stop itinerary to save $43 over a 5-hour direct.
  const list = json?.flights || [];
  const best = list.find((f) => f.best) || list[0];
  if (!best) return null;

  return {
    source: 'google-flights',
    isLive: true,
    // The fare already covers both directions, so neither leg carries a price
    // of its own — one round-trip figure is the honest presentation.
    outbound: {
      from, to, date: outboundDate,
      airline: best.airline, airlineLogo: best.airlineLogo || '✈️',
      duration: best.duration, stops: best.stops,
      departure: best.departure, arrival: best.arrival,
      flightNumber: best.flightNumber,
    },
    inbound: returnDate ? { from: to, to: from, date: returnDate } : null,
    perPerson: best.price,
    roundTripFare: true,
    priceLevel: json?.priceInsights?.level || '',
    bookLink: `https://www.google.com/travel/flights?q=${encodeURIComponent(
      `Flights from ${from} to ${to} on ${outboundDate}${returnDate ? ` through ${returnDate}` : ''}`,
    )}`,
  };
};

/**
 * Price the trip's flights.
 *
 * @returns {Promise<null | {
 *   source: string, isLive: boolean,
 *   outbound: object, inbound: object|null,
 *   perPerson: number, total: number, travelers: number,
 *   roundTripFare?: boolean, priceLevel?: string, bookLink?: string, note?: string,
 * }>} `perPerson` always covers the whole trip for one traveler. When
 *     `roundTripFare` is set, the legs carry no prices of their own — the one
 *     figure already covers both directions.
 */
export const fetchTripFlights = async ({
  fromCity, destination, returnCity, startDate, days = 5, travelers = 1, style, signal,
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

  // ── 1. Google Flights: one search, the fare the traveler would actually see ──
  // Only when the return is to the origin; an open-jaw trip is two different
  // routes and this single round-trip search cannot price it.
  if (outDate && back === origin) {
    const gf = await googleFlightsRoundTrip({
      from: origin, to: dest, outboundDate: outDate, returnDate: backDate, style, signal,
    });
    if (gf) return { ...gf, total: gf.perPerson * pax, travelers: pax };
  }

  // ── 2. Per-leg live offers ──
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

  // ── 3. Route-aware AI estimate ──
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

    // A round-trip ticket has no per-leg price to state. Putting the whole
    // fare on the outbound and marking the return as covered is literally
    // what the traveler bought; splitting it in half would be invented.
    const fare = flights.roundTripFare
      ? (isReturn ? null : flights.perPerson)
      : leg.price;
    if (!Number.isFinite(fare)) {
      return {
        ...d,
        events: (d.events || []).map((ev) => (ev.type === 'flight' ? { ...ev, price: includedLabel } : ev)),
      };
    }

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
        price: money(fare),
        priceUsd: fare,
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
