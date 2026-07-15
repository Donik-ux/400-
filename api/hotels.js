// Real hotel prices via Amadeus Self-Service Hotel Search — same
// AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET credentials used by api/flights.js
// (free tier, no extra signup). Two calls are required by Amadeus's API shape:
//   1. Hotel List by City  — resolve a city code (e.g. "DXB") to a set of
//      hotelIds actually present in that city.
//   2. Hotel Search v3     — get live-priced offers for those hotelIds.
//
// Note on AMADEUS_ENV=test: the test environment returns a smaller, curated
// hotel/offer set than production — expect empty results for less common
// destinations until the app is upgraded to a production Amadeus key, same
// caveat as the flight-offers test data in scrapers/duffelClient.js.
//
// Works on Vercel (default export handler) and in `npm run dev` (named
// `searchHotelsApi` is the entry point used by vite.config.js's dev proxy).
import { amadeusHost, getAmadeusToken } from './_amadeusAuth.js';
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const codeOf = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

function mapHotelOffer(entry) {
  const hotel = entry?.hotel;
  const offer = entry?.offers?.[0];
  if (!hotel || !offer) return null;
  const price = Math.round(Number(offer.price?.total) || 0);
  if (!(price > 0)) return null;

  const checkIn = offer.checkInDate;
  const checkOut = offer.checkOutDate;
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000))
    : 1;

  return {
    id: `amadeus-hotel-${hotel.hotelId}`,
    name: hotel.name || 'Hotel',
    rating: hotel.rating ? Number(hotel.rating) : null,
    address: [hotel.address?.lines?.[0], hotel.address?.cityName].filter(Boolean).join(', '),
    price,
    pricePerNight: Math.round(price / nights),
    currency: offer.price?.currency || 'USD',
    nights,
    checkIn,
    checkOut,
    source: 'amadeus',
  };
}

export async function searchHotelsApi({ cityCode, checkInDate, checkOutDate, adults = 1 } = {}) {
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  const host = amadeusHost();
  if (!id || !secret) return { status: 501, body: { error: 'Amadeus not configured', hotels: [] } };

  const city = codeOf(cityCode);
  if (!city || !checkInDate || !checkOutDate) {
    return { status: 400, body: { error: 'cityCode, checkInDate and checkOutDate are required', hotels: [] } };
  }

  try {
    const token = await getAmadeusToken(host, id, secret);
    const authHeader = { Authorization: `Bearer ${token}` };

    // 1) Resolve hotelIds present in this city (cap at 20 to keep the
    //    offers request small and fast).
    const listQs = new URLSearchParams({ cityCode: city, radius: '20', radiusUnit: 'KM' });
    const listRes = await fetch(`${host}/v1/reference-data/locations/hotels/by-city?${listQs}`, { headers: authHeader });
    if (!listRes.ok) {
      const detail = (await listRes.text().catch(() => '')).slice(0, 200);
      return { status: 502, body: { error: `Amadeus hotel list failed: ${listRes.status}`, detail, hotels: [] } };
    }
    const listJson = await listRes.json();
    const hotelIds = (listJson.data || []).slice(0, 20).map((h) => h.hotelId).filter(Boolean);
    if (hotelIds.length === 0) {
      return { status: 200, body: { hotels: [], source: 'amadeus' } };
    }

    // 2) Live-priced offers for those hotels.
    const offersQs = new URLSearchParams({
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults: String(Math.max(1, Number(adults) || 1)),
      currency: 'USD',
      bestRateOnly: 'true',
    });
    const offersRes = await fetch(`${host}/v3/shopping/hotel-offers?${offersQs}`, { headers: authHeader });
    if (!offersRes.ok) {
      const detail = (await offersRes.text().catch(() => '')).slice(0, 200);
      return { status: 502, body: { error: `Amadeus hotel offers failed: ${offersRes.status}`, detail, hotels: [] } };
    }
    const offersJson = await offersRes.json();
    const hotels = (offersJson.data || [])
      .map(mapHotelOffer)
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);

    return { status: 200, body: { hotels, source: 'amadeus' } };
  } catch (err) {
    return { status: 500, body: { error: err.message || String(err), hotels: [] } };
  }
}

// Vercel serverless entrypoint
export default async function handler(req, res) {
  const rl = checkRateLimit(req, { limit: 30, windowMs: 5 * 60_000, bucket: 'hotels' });
  if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

  res.setHeader?.('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  const { cityCode, checkInDate, checkOutDate, adults = 1 } = req.query || {};
  const { status, body } = await searchHotelsApi({ cityCode, checkInDate, checkOutDate, adults });
  return res.status(status).json(body);
}
