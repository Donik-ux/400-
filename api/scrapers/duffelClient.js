// Real flight offers via the Duffel API (https://duffel.com).
//
// Why Duffel: unlike Skyscanner/Kayak/Momondo/Google Flights/Booking.com/Expedia
// — none of which expose a public self-serve API for real-time fares (those are
// partner-only, needing a business agreement) — Duffel is a modern NDC
// aggregator with a genuinely self-serve signup: create a free account at
// https://app.duffel.com/join, and a `duffel_test_...` API key is issued
// immediately with no approval step. Test-mode keys return realistic offers
// from Duffel's sandbox airlines (not live inventory) — good enough to show
// real comparative pricing without needing a production/live agreement.
//
// Set DUFFEL_API_KEY in .env to enable this source; leave it unset and this
// module quietly no-ops (status 501), same pattern as Amadeus/Travelpayouts.

const API_BASE = 'https://api.duffel.com';
// Duffel requires a Duffel-Version header; check
// https://duffel.com/docs/api/overview/api-versioning for the current value
// if requests start failing with a version-related 4xx. Overridable via env
// without a code change since this integration is untested against a live
// key (the author had no Duffel account to verify against).
const DUFFEL_VERSION = process.env.DUFFEL_API_VERSION || 'v2';

const CARRIER_FLAGS = {
  EK: '🇦🇪', TK: '🇹🇷', FZ: '🇦🇪', QR: '🇶🇦', SU: '🇷🇺', KC: '🇰🇿', HY: '🇺🇿',
  PC: '🇹🇷', G9: '🇦🇪', BA: '🇬🇧', LH: '🇩🇪', SQ: '🇸🇬', EY: '🇦🇪', SV: '🇸🇦',
  AF: '🇫🇷', KL: '🇳🇱', AA: '🇺🇸', DL: '🇺🇸', UA: '🇺🇸', AC: '🇨🇦', KE: '🇰🇷',
  NH: '🇯🇵', JL: '🇯🇵', TG: '🇹🇭', MH: '🇲🇾', CZ: '🇨🇳', CA: '🇨🇳', MU: '🇨🇳',
  CX: '🇭🇰', QF: '🇦🇺', WY: '🇴🇲', GF: '🇧🇭',
};

const pad = (n) => String(n).padStart(2, '0');
const codeOf = (s) => {
  const m = String(s || '').match(/\(([A-Z]{3,4})\)/);
  return m ? m[1].slice(0, 3).toUpperCase() : String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
};
const titleCase = (s) => String(s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// "9:05 AM" from an ISO local timestamp, e.g. "2026-08-01T09:05:00"
function fmtClockFromIso(iso) {
  if (!iso) return '—';
  const t = iso.split('T')[1] || '';
  const [hh = '0', mm = '0'] = t.split(':');
  const h = Number(hh), m = Number(mm);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${pad(m)} ${period}`;
}
function minsFromIso(iso) {
  if (!iso) return 0;
  const t = iso.split('T')[1] || '';
  const [hh = '0', mm = '0'] = t.split(':');
  return Number(hh) * 60 + Number(mm);
}

// Duffel segment.duration is an ISO 8601 duration like "PT7H30M" — parse
// hours/minutes explicitly rather than stripping non-digits (which would
// concatenate "7" and "30" into a nonsense 730-minute duration).
function minsFromIsoDuration(dur) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(dur || ''));
  if (!m) return 0;
  return (Number(m[1]) || 0) * 60 + (Number(m[2]) || 0);
}

function mapDuffelOffer(offer, { from, to }) {
  const slice = offer.slices?.[0];
  const segments = slice?.segments || [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first) return null;

  const carrierCode = first.operating_carrier?.iata_code || first.marketing_carrier?.iata_code || '';
  const carrierName = first.operating_carrier?.name || first.marketing_carrier?.name || carrierCode || 'Airline';
  const price = Math.round(Number(offer.total_amount) || 0);
  if (!(price > 0)) return null;

  const depLocal = first.departing_at || '';
  const arrLocal = last?.arriving_at || '';
  const depDate = depLocal ? depLocal.slice(0, 10) : '';
  const arrDate = arrLocal ? arrLocal.slice(0, 10) : '';
  const depMins = minsFromIso(depLocal);
  // Sum each segment's own duration rather than diffing dep/arr wall-clock
  // strings — those are LOCAL to their own airport (different timezones per
  // leg), so a raw diff would be wrong by each leg's UTC offset delta.
  const durMin = segments.reduce((sum, s) => sum + minsFromIsoDuration(s.duration), 0);

  return {
    id: `duffel-${offer.id}`,
    airline: carrierName,
    airlineCode: `${carrierCode}-${first.marketing_carrier_flight_number || ''}`,
    airlineLogo: CARRIER_FLAGS[carrierCode] || '✈️',
    cabin: titleCase(offer.cabin_class || segments[0]?.passengers?.[0]?.cabin_class) || 'Economy',
    price,
    pricePerPerson: price,
    departure: fmtClockFromIso(depLocal),
    arrival: fmtClockFromIso(arrLocal),
    departMins: depMins,
    arrNextDay: !!(depDate && arrDate && arrDate > depDate),
    duration: durMin ? `${Math.floor(durMin / 60)}h ${pad(durMin % 60)}m` : '—',
    stops: Math.max(0, segments.length - 1),
    from: codeOf(from) || first.origin?.iata_code || '',
    to: codeOf(to) || last?.destination?.iata_code || '',
    date: depDate,
    seats: null,
    eco: segments.length === 1,
    // Deliberately no buyLink: Duffel offers are meant to be booked through
    // the integrating platform's own checkout, not a per-offer public URL.
    // Leaving this unset lets FlightCard fall back to the airline's own
    // official booking deep-link (services/airlineLinks.js) instead of
    // pointing at Duffel's marketing homepage, which isn't actionable here.
    source: 'duffel',
  };
}

export async function searchDuffel({ from, to, date, adults = 1, cabin = 'ECONOMY' } = {}) {
  const apiKey = process.env.DUFFEL_API_KEY;
  if (!apiKey) return { status: 501, body: { error: 'Duffel not configured', flights: [] } };

  const originCode = codeOf(from);
  const destinationCode = codeOf(to);
  if (!originCode || !destinationCode || !date) {
    return { status: 400, body: { error: 'from, to and date are required', flights: [] } };
  }

  const payload = {
    data: {
      slices: [{ origin: originCode, destination: destinationCode, departure_date: date }],
      passengers: Array.from({ length: Math.max(1, Number(adults) || 1) }, () => ({ type: 'adult' })),
      cabin_class: String(cabin || 'ECONOMY').toLowerCase(),
    },
  };

  try {
    const r = await fetch(`${API_BASE}/air/offer_requests?return_offers=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Duffel-Version': DUFFEL_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      return { status: 502, body: { error: `Duffel ${r.status}`, detail: body.slice(0, 200), flights: [] } };
    }
    const json = await r.json();
    const offers = json?.data?.offers || [];
    const flights = offers
      .map((o) => mapDuffelOffer(o, { from, to }))
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);
    return { status: 200, body: { flights, source: 'duffel' } };
  } catch (err) {
    return { status: 500, body: { error: err.message || String(err), flights: [], source: 'duffel' } };
  }
}
