// Server-side proxy for SerpApi's Google Hotels engine.
//
// Why this exists alongside api/hotels.js (Amadeus): Amadeus returns bookable
// offers but no coordinates, so there is no way to tell whether a hotel is
// next to the Blue Mosque or forty minutes out by the airport. Google Hotels
// returns `gps_coordinates` on every property, which lets the trip planner
// rank real, priced hotels by their actual walking distance to the
// attractions the itinerary schedules (see src/services/hotelSearch.js).
//
// The key is server-only — a VITE_-prefixed key would be readable in the
// public bundle, and SerpApi bills per search.
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const SERP_URL = 'https://serpapi.com/search.json';
const getApiKey = () => process.env.SERPAPI_KEY || '';

// SerpApi charges per search and the free tier is 100/month, so a warm
// instance reuses the same city+dates result rather than re-billing it.
const cache = new Map();          // cacheKey -> { hotels, expiresAt }
const CACHE_TTL_MS = 6 * 60 * 60_000;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** SerpApi `hotel_class` accepts 2..5; our style tiers map onto that. */
const CLASS_FOR_STYLE = { economy: '2,3', standard: '3,4', comfort: '4', luxury: '4,5' };

function mapProperty(p) {
  const lat = Number(p?.gps_coordinates?.latitude);
  const lng = Number(p?.gps_coordinates?.longitude);
  const nightly = Number(p?.rate_per_night?.extracted_lowest);
  if (!p?.name) return null;

  return {
    name:        p.name,
    description: p.description || '',
    link:        p.link || '',
    token:       p.property_token || '',
    type:        p.type || '',
    lat:         Number.isFinite(lat) ? lat : null,
    lng:         Number.isFinite(lng) ? lng : null,
    // `extracted_lowest` is the numeric form of `lowest` ("$92"); keep the
    // display string too so we never re-format a currency we didn't parse.
    nightly:     Number.isFinite(nightly) ? Math.round(nightly) : null,
    nightlyText: p.rate_per_night?.lowest || '',
    totalText:   p.total_rate?.lowest || '',
    hotelClass:  Number(p.extracted_hotel_class) || null,
    rating:      Number(p.overall_rating) || null,
    reviews:     Number(p.reviews) || null,
    locationRating: Number(p.location_rating) || null,
    image:       p.images?.[0]?.original_image || p.images?.[0]?.thumbnail || '',
    amenities:   Array.isArray(p.amenities) ? p.amenities.slice(0, 8) : [],
    // Google's own "what's nearby" with travel times — useful context next to
    // the distances we compute ourselves from the itinerary.
    nearbyPlaces: Array.isArray(p.nearby_places)
      ? p.nearby_places.slice(0, 5).map((n) => ({
          name: n?.name || '',
          transportations: Array.isArray(n?.transportations)
            ? n.transportations.slice(0, 2).map((tr) => ({ type: tr?.type || '', duration: tr?.duration || '' }))
            : [],
        })).filter((n) => n.name)
      : [],
  };
}

/**
 * @param {{ q: string, checkInDate: string, checkOutDate: string, adults?: number,
 *           currency?: string, style?: string, maxPrice?: number, gl?: string, hl?: string }} params
 */
export async function searchGoogleHotels({
  q, checkInDate, checkOutDate, adults = 2, currency = 'USD', style, maxPrice, gl = 'us', hl = 'en',
} = {}) {
  const key = getApiKey();
  if (!key) return { status: 501, body: { error: 'SerpApi not configured', hotels: [] } };

  const query = String(q || '').trim().slice(0, 120);
  if (!query || !ISO_DATE.test(String(checkInDate)) || !ISO_DATE.test(String(checkOutDate))) {
    return { status: 400, body: { error: 'q, checkInDate and checkOutDate (YYYY-MM-DD) are required', hotels: [] } };
  }

  const pax = Math.max(1, Math.min(12, Number(adults) || 2));
  const cap = Number(maxPrice) > 0 ? Math.round(Number(maxPrice)) : null;
  const cacheKey = [query.toLowerCase(), checkInDate, checkOutDate, pax, currency, style || '', cap || ''].join('|');
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return { status: 200, body: { hotels: hit.hotels, source: 'serpapi', cached: true } };

  const qs = new URLSearchParams({
    engine: 'google_hotels',
    q: query,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    adults: String(pax),
    currency,
    gl, hl,
    api_key: key,
  });
  const hotelClass = CLASS_FOR_STYLE[style];
  if (hotelClass) qs.set('hotel_class', hotelClass);
  if (cap) qs.set('max_price', String(cap));

  let data;
  try {
    const res = await fetch(`${SERP_URL}?${qs}`);
    data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error || res.statusText;
      // SerpApi answers 401 for a bad key and 429 once the plan's searches run out.
      return { status: res.status === 429 ? 429 : 502, body: { error: `SerpApi ${res.status}: ${String(msg).slice(0, 200)}`, hotels: [] } };
    }
  } catch (err) {
    return { status: 502, body: { error: String(err?.message || err), hotels: [] } };
  }
  if (data?.error) return { status: 200, body: { hotels: [], source: 'serpapi', note: String(data.error).slice(0, 200) } };

  const hotels = [...(data?.properties || []), ...(data?.ads || [])]
    .map(mapProperty)
    .filter((h) => h && h.lat !== null && h.lng !== null)   // no coordinates = useless for ranking
    .slice(0, 40);

  cache.set(cacheKey, { hotels, expiresAt: Date.now() + CACHE_TTL_MS });
  return { status: 200, body: { hotels, source: 'serpapi' } };
}

/**
 * Details for one property, keyed by the `property_token` from a search.
 *
 * This is the only place Google Hotels exposes a STREET address — the search
 * response carries coordinates but no address at all, which left the trip
 * planner printing "Sultanahmet, Istanbul" where a traveler needs a door
 * number. It also returns Google's own nearby-landmark list with travel
 * times, which reads naturally next to the distances we compute ourselves.
 *
 * Billed as its own search, so it is only ever called for the ONE hotel the
 * planner actually picked, and cached for a day (an address does not move).
 */
export async function getHotelDetails({
  propertyToken, checkInDate, checkOutDate, adults = 2, currency = 'USD', gl = 'us', hl = 'en',
} = {}) {
  const key = getApiKey();
  if (!key) return { status: 501, body: { error: 'SerpApi not configured' } };

  const token = String(propertyToken || '').trim();
  if (!token || !ISO_DATE.test(String(checkInDate)) || !ISO_DATE.test(String(checkOutDate))) {
    return { status: 400, body: { error: 'propertyToken, checkInDate and checkOutDate are required' } };
  }

  const cacheKey = `detail|${token}|${checkInDate}|${checkOutDate}|${currency}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return { status: 200, body: { ...hit.body, cached: true } };

  const qs = new URLSearchParams({
    engine: 'google_hotels',
    property_token: token,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    adults: String(Math.max(1, Math.min(12, Number(adults) || 2))),
    currency, gl, hl,
    api_key: key,
  });

  let data;
  try {
    const res = await fetch(`${SERP_URL}?${qs}`);
    data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error || res.statusText;
      return { status: res.status === 429 ? 429 : 502, body: { error: `SerpApi ${res.status}: ${String(msg).slice(0, 200)}` } };
    }
  } catch (err) {
    return { status: 502, body: { error: String(err?.message || err) } };
  }
  if (data?.error) return { status: 200, body: { note: String(data.error).slice(0, 200) } };

  const body = {
    address: data.address || '',
    phone: data.phone || '',
    lat: Number(data.gps_coordinates?.latitude) || null,
    lng: Number(data.gps_coordinates?.longitude) || null,
    checkInTime: data.check_in_time || '',
    checkOutTime: data.check_out_time || '',
    locationRating: Number(data.location_rating) || null,
    // Google's "what's around here" — landmark plus how long it takes to reach.
    nearbyPlaces: Array.isArray(data.nearby_places)
      ? data.nearby_places.slice(0, 6).map((n) => ({
          name: n?.name || '',
          transportations: Array.isArray(n?.transportations)
            ? n.transportations.slice(0, 2).map((tr) => ({ type: tr?.type || '', duration: tr?.duration || '' }))
            : [],
        })).filter((n) => n.name)
      : [],
    source: 'serpapi',
  };

  cache.set(cacheKey, { body, expiresAt: Date.now() + 24 * 60 * 60_000 });
  return { status: 200, body };
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  if (req.method !== 'GET') return send(405, { error: 'GET only', hotels: [] });

  // Tighter than the other proxies: every miss costs a billed SerpApi search.
  const rl = checkRateLimit(req, { limit: 15, windowMs: 5 * 60_000, bucket: 'hotels-serp' });
  if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

  res.setHeader?.('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  const p = Object.fromEntries(new URL(req.url, 'http://internal').searchParams);

  // `propertyToken` switches this endpoint into details mode — the only way to
  // get a street address out of Google Hotels.
  if (p.propertyToken) {
    const detail = await getHotelDetails({
      propertyToken: p.propertyToken,
      checkInDate: p.checkInDate,
      checkOutDate: p.checkOutDate,
      adults: p.adults,
      currency: p.currency,
      gl: p.gl,
      hl: p.hl,
    });
    return send(detail.status, detail.body);
  }

  const { status, body } = await searchGoogleHotels({
    q: p.q,
    checkInDate: p.checkInDate,
    checkOutDate: p.checkOutDate,
    adults: p.adults,
    currency: p.currency,
    style: p.style,
    maxPrice: p.maxPrice,
    gl: p.gl,
    hl: p.hl,
  });
  return send(status, body);
}
