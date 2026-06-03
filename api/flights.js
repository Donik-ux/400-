// Real flight prices for ANY route, with a direct buy-link.
//
// Priority:
//   1. Kiwi.com GraphQL — free, no auth, real cached fares + Kiwi buy-link.
//      Default for everyone — works out of the box, no env vars needed.
//   2. Travelpayouts / Aviasales v3 — needs TRAVELPAYOUTS_TOKEN, gives Aviasales
//      buy-links and affiliate commission.
//   3. Amadeus Self-Service — live GDS prices when configured (major routes).
//   4. 501 → client falls back to its AI/template estimate.
//
// Buying is ALWAYS an external redirect (Aviasales / airline site) — we only
// show prices here, never sell tickets ourselves.
//
// Works on Vercel (default export handler) and in `npm run dev`
// (named `searchAmadeus` is kept for the Vite middleware; `searchFlightsApi`
// is the new combined entry).
import { searchKiwi } from './scrapers/kiwiClient.js';
const AMADEUS_HOSTS = {
  test: 'https://test.api.amadeus.com',
  production: 'https://api.amadeus.com',
};
// Carrier IATA → exact name used in services/airlineLinks.js so the airline
// deep-link / logo resolves correctly.
const CARRIER_NAMES = {
  EK: 'Emirates', TK: 'Turkish Airlines', FZ: 'Fly Dubai', QR: 'Qatar Airways',
  SU: 'Aeroflot', KC: 'Air Astana', HY: 'Uzbekistan Airways', PC: 'Pegasus Airlines',
  G9: 'Air Arabia', BA: 'British Airways', LH: 'Lufthansa', SQ: 'Singapore Airlines',
  AF: 'Air France', KL: 'KLM', AC: 'Air Canada', AA: 'American Airlines',
  DL: 'Delta', UA: 'United', EY: 'Etihad', SV: 'Saudia', MH: 'Malaysia Airlines',
  TG: 'Thai Airways', JL: 'Japan Airlines', NH: 'ANA', KE: 'Korean Air',
  OZ: 'Asiana', CZ: 'China Southern', CA: 'Air China', MU: 'China Eastern',
  CX: 'Cathay Pacific', QF: 'Qantas', WY: 'Oman Air', GF: 'Gulf Air',
  J2: 'Azerbaijan Airlines', PS: 'Ukraine Intl', FZ_: 'Fly Dubai',
};
const CARRIER_FLAGS = {
  EK: '🇦🇪', TK: '🇹🇷', FZ: '🇦🇪', QR: '🇶🇦', SU: '🇷🇺', KC: '🇰🇿', HY: '🇺🇿',
  PC: '🇹🇷', G9: '🇦🇪', BA: '🇬🇧', LH: '🇩🇪', SQ: '🇸🇬', EY: '🇦🇪', SV: '🇸🇦',
};
const titleCase = (s) => String(s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const codeOf = (s) => {
  const m = String(s || '').match(/\(([A-Z]{3,4})\)/);
  return m ? m[1].slice(0, 3) : String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
};
const pad = (n) => String(n).padStart(2, '0');
// Minutes-from-midnight → "9:05 AM"
const fmtClock = (totalMin) => {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${pad(m)} ${period}`;
};
function buildAviasalesLink({ origin, destination, dateISO, link, marker }) {
  // Prefer the API-supplied deep link (points to the exact offer).
  if (link) {
    const url = link.startsWith('http') ? link : `https://www.aviasales.com${link}`;
    return marker ? `${url}${url.includes('?') ? '&' : '?'}marker=${marker}` : url;
  }
  // Fallback: standard Aviasales search deep link  ORIG DDMM DEST 1
  const d = dateISO ? new Date(`${dateISO}T00:00:00`) : null;
  const ddmm = d ? `${pad(d.getDate())}${pad(d.getMonth() + 1)}` : '';
  const base = `https://www.aviasales.com/search/${origin}${ddmm}${destination}1`;
  return marker ? `${base}?marker=${marker}` : base;
}
function mapTpOffer(o, { from, to, marker }) {
  const dep = o.departure_at ? new Date(o.departure_at) : null;
  const depDate = dep ? o.departure_at.slice(0, 10) : '';
  const depMins = dep ? dep.getHours() * 60 + dep.getMinutes() : 0;
  const durMin = Number(o.duration || o.duration_to || 0);
  const arrMinsAbs = depMins + durMin;
  const code = o.airline || '';
  return {
    id: `tp-${code}-${o.flight_number || Math.round(o.price)}-${depDate}`,
    airline: CARRIER_NAMES[code] || code || 'Airline',
    airlineCode: `${code}-${o.flight_number || ''}`,
    airlineLogo: CARRIER_FLAGS[code] || '✈️',
    cabin: 'Economy',
    price: Math.round(Number(o.price) || 0),
    pricePerPerson: Math.round(Number(o.price) || 0),
    departure: dep ? fmtClock(depMins) : '—',
    arrival: durMin ? fmtClock(arrMinsAbs) : '—',
    departMins: depMins,
    arrNextDay: durMin ? arrMinsAbs >= 24 * 60 : false,
    duration: durMin ? `${Math.floor(durMin / 60)}h ${pad(durMin % 60)}m` : '—',
    stops: Number(o.transfers || 0),
    from: String(from || o.origin || '').toUpperCase(),
    to: String(to || o.destination || '').toUpperCase(),
    date: depDate,
    seats: null,
    eco: Number(o.transfers || 0) === 0,
    buyLink: buildAviasalesLink({
      origin: codeOf(from) || o.origin,
      destination: codeOf(to) || o.destination,
      dateISO: depDate,
      link: o.link,
      marker,
    }),
    source: 'travelpayouts',
  };
}

async function searchTravelpayouts({ from, to, date, oneWay = true }) {
  const token  = process.env.TRAVELPAYOUTS_TOKEN;
  const marker = process.env.TRAVELPAYOUTS_MARKER || '';
  if (!token) return null; // not configured → let caller try next source

  const origin = codeOf(from);
  const destination = codeOf(to);
  if (!origin || !destination) return { status: 400, body: { error: 'from/to required', flights: [] } };

  const qs = new URLSearchParams({
    origin,
    destination,
    currency: 'usd',
    token,
    limit: '30',
    page: '1',
    one_way: String(!!oneWay),
    sorting: 'price',
  });
  // departure_at accepts YYYY-MM-DD or YYYY-MM. If we have a date, pin the day.
  if (date) qs.set('departure_at', date);

  const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`;
  const r = await fetch(url, { headers: { 'Accept-Encoding': 'gzip' } });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    return { status: 502, body: { error: `Travelpayouts ${r.status}`, detail: body.slice(0, 200), flights: [] } };
  }
  const json = await r.json();
  if (!json.success || !Array.isArray(json.data)) {
    return { status: 200, body: { flights: [], source: 'travelpayouts' } };
  }
  const flights = json.data
    .map((o) => mapTpOffer(o, { from, to, marker }))
    .filter((f) => f.price > 0)
    .sort((a, b) => a.price - b.price);
  return { status: 200, body: { flights, source: 'travelpayouts' } };
}



let _token = { value: null, exp: 0 };
async function getAmadeusToken(host, id, secret) {
  if (_token.value && Date.now() < _token.exp - 30_000) return _token.value;
  const res = await fetch(`${host}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const json = await res.json();
  _token = { value: json.access_token, exp: Date.now() + (json.expires_in || 1799) * 1000 };
  return _token.value;
}


function mapAmadeusOffer(offer, dict) {
  const itin = offer.itineraries?.[0];
  const seg0 = itin?.segments?.[0];
  const segN = itin?.segments?.[itin.segments.length - 1];
  if (!seg0) return null;
  const carrierCode = seg0.carrierCode;
  const carrierName = CARRIER_NAMES[carrierCode] || titleCase(dict?.carriers?.[carrierCode]) || carrierCode;
  const stops = (itin.segments.length || 1) - 1;
  const dur = (itin.duration || '').replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase();
  const depDate = seg0.departure?.at?.split('T')[0] || '';
  const arrDate = segN.arrival?.at?.split('T')[0] || '';
  return {
    id: `am-${offer.id}`,
    airline: carrierName,
    airlineCode: `${carrierCode}-${seg0.number || ''}`,
    airlineLogo: CARRIER_FLAGS[carrierCode] || '✈️',
    cabin: titleCase(offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin) || 'Economy',
    price: Math.round(Number(offer.price?.grandTotal || offer.price?.total || 0)),
    pricePerPerson: Math.round(Number(offer.price?.grandTotal || offer.price?.total || 0)),
    departure: seg0.departure?.at?.split('T')[1]?.slice(0, 5) || '',
    arrival: segN.arrival?.at?.split('T')[1]?.slice(0, 5) || '',
    duration: dur || '—',
    stops,
    from: seg0.departure?.iataCode || codeOf('') || '',
    to: segN.arrival?.iataCode || '',
    seats: offer.numberOfBookableSeats || null,
    date: depDate,
    arrNextDay: !!(depDate && arrDate && arrDate > depDate),
    source: 'amadeus',
  };
}

export async function searchAmadeus({ from, to, date, adults = 1, cabin = 'ECONOMY' } = {}) {
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  const host = AMADEUS_HOSTS[process.env.AMADEUS_ENV === 'production' ? 'production' : 'test'];
  if (!id || !secret) return { status: 501, body: { error: 'Amadeus not configured', flights: [] } };
  if (!from || !to || !date) return { status: 400, body: { error: 'from, to and date are required', flights: [] } };
  try {
    const token = await getAmadeusToken(host, id, secret);
    const qs = new URLSearchParams({
      originLocationCode: codeOf(from),
      destinationLocationCode: codeOf(to),
      departureDate: date,
      adults: String(adults || 1),
      travelClass: String(cabin || 'ECONOMY').toUpperCase().replace(' ', '_'),
      currencyCode: 'USD',
      max: '12',
    });
    const r = await fetch(`${host}/v2/shopping/flight-offers?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      return { status: 502, body: { error: `Amadeus search failed: ${r.status}`, detail: body.slice(0, 200), flights: [] } };
    }
    const json = await r.json();
    const flights = (json.data || []).map((o) => mapAmadeusOffer(o, json.dictionaries)).filter(Boolean).sort((a, b) => a.price - b.price);
    return { status: 200, body: { flights, source: 'amadeus' } };
  } catch (err) {
    return { status: 500, body: { error: err.message, flights: [] } };
  }
}

/* ────────────────────────── Combined entry ─────────────────────────────── */

export async function searchFlightsApi(params = {}) {
  // 1) Kiwi.com — open GraphQL, works without any token.
  try {
    const kw = await searchKiwi(params);
    if (kw && kw.status === 200 && kw.body.flights.length > 0) return kw;
  } catch (err) {
    console.warn('Kiwi failed:', err?.message);
  }
  // 2) Travelpayouts (when token configured — preferred for Aviasales buy-links)
  try {
    const tp = await searchTravelpayouts(params);
    if (tp && tp.status === 200 && tp.body.flights.length > 0) return tp;
  } catch (err) {
    console.warn('Travelpayouts failed:', err?.message);
  }
  // 3) Amadeus (live, major routes)
  const am = await searchAmadeus(params);
  if (am.status === 200 && am.body.flights.length > 0) return am;

  // Nothing real available → signal client to use its own estimate.
  return { status: 501, body: { error: 'No real fares available for this route', flights: [] } };
}

// Vercel serverless entrypoint
export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  const { from, to, date, adults = 1, cabin = 'ECONOMY' } = req.query || {};
  const { status, body } = await searchFlightsApi({ from, to, date, adults, cabin });
  return res.status(status).json(body);
}
