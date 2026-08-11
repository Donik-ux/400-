// Server-side proxy for SerpApi's Google Flights engine.
//
// The trip planner's other fare sources are either unconfigured
// (Travelpayouts/Amadeus/Duffel all need their own accounts) or estimates.
// Google Flights returns the fare a traveler would actually see, with the
// operating airline, real departure times and the layover count — which is
// what "exact prices" means for a ticket.
//
// Passenger-count note: SerpApi's docs do not state whether `price` is per
// passenger or the total for the party. Rather than guess — a wrong guess
// doubles or halves every fare — every request asks for ONE adult, where the
// two readings coincide. The caller multiplies by the party size itself.
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const SERP_URL = 'https://serpapi.com/search.json';
const getApiKey = () => process.env.SERPAPI_KEY || '';

// Searches are billed and the free tier is 250/month, so a warm instance
// reuses the same route+dates rather than re-billing it.
const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 60_000;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IATA = /^[A-Z]{3}$/;

const CLASS_ID = { economy: '1', premium: '2', business: '3', first: '4' };

/** 305 → "5h 05m" */
const fmtDuration = (min) => {
  const m = Number(min);
  if (!Number.isFinite(m) || m <= 0) return '';
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};

/** "2026-09-20 08:15" → "08:15" */
const clockOf = (s) => (String(s || '').split(' ')[1] || '');

function mapItinerary(it, isBest) {
  const segments = Array.isArray(it?.flights) ? it.flights : [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  const price = Number(it?.price);
  if (!first || !Number.isFinite(price) || price <= 0) return null;

  return {
    price: Math.round(price),
    // Google's own "best flights" bucket — its balance of price against
    // duration and stops, which a pure price sort would throw away.
    best: Boolean(isBest),
    airline: first.airline || '',
    airlineLogo: it.airline_logo || first.airline_logo || '',
    flightNumber: first.flight_number || '',
    duration: fmtDuration(it.total_duration),
    durationMin: Number(it.total_duration) || null,
    stops: Array.isArray(it.layovers) ? it.layovers.length : Math.max(0, segments.length - 1),
    from: first.departure_airport?.id || '',
    to: last?.arrival_airport?.id || '',
    departure: clockOf(first.departure_airport?.time),
    arrival: clockOf(last?.arrival_airport?.time),
    overnight: Boolean(segments.some((s) => s.overnight)),
    tripType: it.type || '',
    bookingToken: it.booking_token || '',
    departureToken: it.departure_token || '',
    legs: segments.map((s) => ({
      from: s.departure_airport?.id || '',
      to: s.arrival_airport?.id || '',
      departure: clockOf(s.departure_airport?.time),
      arrival: clockOf(s.arrival_airport?.time),
      airline: s.airline || '',
      flightNumber: s.flight_number || '',
      duration: fmtDuration(s.duration),
    })),
  };
}

/**
 * @param {{ departureId: string, arrivalId: string, outboundDate: string,
 *           returnDate?: string, travelClass?: string, currency?: string,
 *           stops?: string, gl?: string, hl?: string }} params
 */
export async function searchGoogleFlights({
  departureId, arrivalId, outboundDate, returnDate,
  travelClass = 'economy', currency = 'USD', stops, gl = 'us', hl = 'en',
} = {}) {
  const key = getApiKey();
  if (!key) return { status: 501, body: { error: 'SerpApi not configured', flights: [] } };

  const from = String(departureId || '').toUpperCase();
  const to = String(arrivalId || '').toUpperCase();
  if (!IATA.test(from) || !IATA.test(to) || !ISO_DATE.test(String(outboundDate))) {
    return { status: 400, body: { error: 'departureId, arrivalId (IATA) and outboundDate (YYYY-MM-DD) are required', flights: [] } };
  }
  const hasReturn = ISO_DATE.test(String(returnDate || ''));

  const cacheKey = [from, to, outboundDate, hasReturn ? returnDate : '', travelClass, currency, stops || ''].join('|');
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    return { status: 200, body: { ...hit.body, cached: true } };
  }

  const qs = new URLSearchParams({
    engine: 'google_flights',
    departure_id: from,
    arrival_id: to,
    outbound_date: outboundDate,
    type: hasReturn ? '1' : '2',
    travel_class: CLASS_ID[travelClass] || '1',
    adults: '1',                       // see the passenger-count note at the top
    currency,
    gl, hl,
    api_key: key,
  });
  if (hasReturn) qs.set('return_date', returnDate);
  if (stops) qs.set('stops', String(stops));

  let data;
  try {
    const res = await fetch(`${SERP_URL}?${qs}`);
    data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error || res.statusText;
      return { status: res.status === 429 ? 429 : 502, body: { error: `SerpApi ${res.status}: ${String(msg).slice(0, 200)}`, flights: [] } };
    }
  } catch (err) {
    return { status: 502, body: { error: String(err?.message || err), flights: [] } };
  }
  // SerpApi answers 200 with an `error` string for "no flights on this route".
  if (data?.error) return { status: 200, body: { flights: [], source: 'google-flights', note: String(data.error).slice(0, 200) } };

  const flights = [
    ...(data?.best_flights || []).map((it) => mapItinerary(it, true)),
    ...(data?.other_flights || []).map((it) => mapItinerary(it, false)),
  ]
    .filter(Boolean)
    .sort((a, b) => a.price - b.price)
    .slice(0, 20);

  const pi = data?.price_insights;
  const body = {
    flights,
    source: 'google-flights',
    // Round trip when we asked for one — matters to the caller, which must not
    // double a fare that already covers both directions.
    roundTrip: hasReturn,
    perPassenger: 1,
    currency,
    priceInsights: pi ? {
      lowest: Number(pi.lowest_price) || null,
      level: pi.price_level || '',          // "low" | "typical" | "high"
    } : null,
  };

  cache.set(cacheKey, { body, expiresAt: Date.now() + CACHE_TTL_MS });
  return { status: 200, body };
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  if (req.method !== 'GET') return send(405, { error: 'GET only', flights: [] });

  const rl = checkRateLimit(req, { limit: 15, windowMs: 5 * 60_000, bucket: 'flights-serp' });
  if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

  res.setHeader?.('Cache-Control', 'public, s-maxage=10800, stale-while-revalidate=86400');
  const p = Object.fromEntries(new URL(req.url, 'http://internal').searchParams);
  const { status, body } = await searchGoogleFlights({
    departureId: p.departureId,
    arrivalId: p.arrivalId,
    outboundDate: p.outboundDate,
    returnDate: p.returnDate,
    travelClass: p.travelClass,
    currency: p.currency,
    stops: p.stops,
    gl: p.gl,
    hl: p.hl,
  });
  return send(status, body);
}
