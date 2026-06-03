// Real flight prices via Kiwi.com's public GraphQL endpoint.
//
// Why Kiwi and not Aviasales? Aviasales' API sits behind a CloudFront WAF +
// fingerprint check that blocks anything that isn't a fully-loaded real browser
// — not realistic to bypass for an MVP. Kiwi.com exposes the SAME GraphQL
// endpoint that powers their own search page WITHOUT any auth / token /
// referrer check, so a plain server-side fetch returns real cached fares.
//
// One drawback: prices/buy-links are Kiwi-branded, not Aviasales-branded. We
// surface the offer with a "Open on Kiwi" link instead.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// The full GraphQL query lives in a sibling file — too big (40KB) to inline.
const QUERY = fs.readFileSync(path.join(__dirname, 'kiwiQuery.gql'), 'utf8');

const ENDPOINT = 'https://api.skypicker.com/umbrella/v2/graphql?featureName=SearchOneWayItinerariesQuery';

// EUR → USD. Refreshed lazily once per process (Kiwi returns priceEur which is
// always EUR, regardless of the `currency` option). 1.07 is the fallback if the
// rates fetch fails — close enough for display.
let _eurUsd = 1.07;
let _eurUsdAt = 0;
async function eurToUsd() {
  if (Date.now() - _eurUsdAt < 6 * 3600_000) return _eurUsd;
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
    if (r.ok) {
      const j = await r.json();
      const v = Number(j?.rates?.USD);
      if (v > 0.5 && v < 3) { _eurUsd = v; _eurUsdAt = Date.now(); }
    }
  } catch { /* keep fallback */ }
  return _eurUsd;
}

const CARRIER_FLAGS = {
  EK: '🇦🇪', TK: '🇹🇷', FZ: '🇦🇪', QR: '🇶🇦', SU: '🇷🇺', KC: '🇰🇿', HY: '🇺🇿',
  PC: '🇹🇷', G9: '🇦🇪', BA: '🇬🇧', LH: '🇩🇪', SQ: '🇸🇬', EY: '🇦🇪', SV: '🇸🇦',
  J2: '🇦🇿', RJ: '🇯🇴', S7: '🇷🇺', U6: '🇷🇺', UT: '🇷🇺', AF: '🇫🇷', KL: '🇳🇱',
  AA: '🇺🇸', DL: '🇺🇸', UA: '🇺🇸', AC: '🇨🇦', KE: '🇰🇷', NH: '🇯🇵', JL: '🇯🇵',
  TG: '🇹🇭', MH: '🇲🇾', CZ: '🇨🇳', CA: '🇨🇳', MU: '🇨🇳', CX: '🇭🇰', QF: '🇦🇺',
  WY: '🇴🇲', GF: '🇧🇭',
};

const pad = (n) => String(n).padStart(2, '0');
const codeOf = (s) => {
  const m = String(s || '').match(/\(([A-Z]{3,4})\)/);
  return m ? m[1].slice(0, 3).toUpperCase() : String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
};

// ── cache ───────────────────────────────────────────────────────────────────
const CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const cacheKey = (o, d, day, adults, cabin) => `${o}|${d}|${day || 'any'}|${adults}|${cabin}`;

// ── variable builder ────────────────────────────────────────────────────────
function buildVariables({ originCode, destinationCode, date, adults = 1, cabin = 'ECONOMY' }) {
  const startISO = date ? `${date}T00:00:00` : undefined;
  const endISO   = date ? `${date}T23:59:59` : undefined;

  return {
    search: {
      itinerary: {
        source:      { ids: [`Station:airport:${originCode}`] },
        destination: { ids: [`Station:airport:${destinationCode}`] },
        ...(startISO ? { outboundDepartureDate: { start: startISO, end: endISO } } : {}),
      },
      passengers: {
        adults: Number(adults) || 1, children: 0, infants: 0,
        adultsHoldBags: [0], adultsHandBags: [0],
        childrenHoldBags: [], childrenHandBags: [],
      },
      cabinClass: {
        cabinClass: String(cabin || 'ECONOMY').toUpperCase().replace(' ', '_'),
        applyMixedClasses: false,
      },
    },
    filter: {
      allowChangeInboundDestination: true,
      allowChangeInboundSource: true,
      allowDifferentStationConnection: true,
      enableSelfTransfer: true,
      enableThrowAwayTicketing: true,
      enableTrueHiddenCity: true,
      transportTypes: ['FLIGHT'],
      contentProviders: ['KIWI', 'FRESH'],
      flightsApiLimit: 25,
      limit: 20,
    },
    options: {
      sortBy: 'PRICE',
      mergePriceDiffRule: 'INCREASED',
      contentProviders: ['KIWI', 'FRESH'],
      currency: 'usd',
      apiUrl: null,
      locale: 'en',
      market: 'us',
      partner: 'skypicker',
      partnerMarket: 'xx',
      affilID: 'skypicker',
      storeSearch: false,
      searchStrategy: 'REDUCED',
      kiwiClub: { isKiwiClubMember: false, isPhoneVerified: false, kiwiClubPerksEligible: false },
      abTestInput: {
        guaranteeExpansionAfKlVanilla: 'DISABLE',
        top5ResultsDiversity: 'ENABLE',
        b2cProductSelectionOnBooking: 'DISABLE',
        profitabilityFixedCpa: 'DISABLE',
      },
      serverToken: null,
      searchSessionId: null,
    },
    conditions: false,
  };
}

// ── response mapper ─────────────────────────────────────────────────────────
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

function mapItinerary(it, ctx, eurUsd) {
  const segments = it.sector?.sectorSegments?.map((s) => s.segment).filter(Boolean) || [];
  if (segments.length === 0) return null;
  const first = segments[0];
  const last  = segments[segments.length - 1];
  const carrier = first.carrier || {};

  const priceEur = Number(it.priceEur?.amount || 0);
  if (!(priceEur > 0)) return null;
  const priceUsd = Math.round(priceEur * eurUsd);

  const stops = segments.length - 1;
  const durSec = Number(it.duration || it.sector?.duration || 0);
  const durMin = Math.round(durSec / 60);

  const depLocal = first.source?.localTime || '';
  const arrLocal = last.destination?.localTime || '';
  const depDate = depLocal ? depLocal.slice(0, 10) : (ctx.date || '');
  const arrDate = arrLocal ? arrLocal.slice(0, 10) : '';

  return {
    id: `kiwi-${it.legacyId || it.id?.slice(-32) || `${carrier.code}-${Math.round(priceEur)}`}`,
    airline: carrier.name || carrier.code || 'Airline',
    airlineCode: `${carrier.code || ''}-${first.code || ''}`,
    airlineLogo: CARRIER_FLAGS[carrier.code] || '✈️',
    cabin: String(first.cabinClass || 'Economy').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    price: priceUsd,
    pricePerPerson: priceUsd,
    departure: fmtClockFromIso(depLocal),
    arrival:   fmtClockFromIso(arrLocal),
    departMins: minsFromIso(depLocal),
    arrNextDay: !!(depDate && arrDate && arrDate > depDate),
    duration: durMin ? `${Math.floor(durMin / 60)}h ${pad(durMin % 60)}m` : '—',
    stops,
    from: ctx.originCode,
    to:   ctx.destinationCode,
    date: depDate,
    seats: null,
    eco: stops === 0,
    buyLink: it.shareId
      ? `https://www.kiwi.com/deep?from=${ctx.originCode}&to=${ctx.destinationCode}&departure=${depDate}&affilid=skypicker&shareId=${encodeURIComponent(it.shareId)}`
      : `https://www.kiwi.com/en/search/results/${ctx.originCode}/${ctx.destinationCode}/${depDate}/no-return`,
    source: 'kiwi',
  };
}

// ── main entry ──────────────────────────────────────────────────────────────
export async function searchKiwi({ from, to, date, adults = 1, cabin = 'ECONOMY' } = {}) {
  const originCode = codeOf(from);
  const destinationCode = codeOf(to);
  if (!originCode || !destinationCode) {
    return { status: 400, body: { error: 'from/to required', flights: [] } };
  }

  const key = cacheKey(originCode, destinationCode, date, adults, cabin);
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return { status: 200, body: { flights: hit.flights, source: 'kiwi', cached: true } };
  }

  const variables = buildVariables({ originCode, destinationCode, date, adults, cabin });

  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables }),
    });
    if (!r.ok) {
      const detail = (await r.text().catch(() => '')).slice(0, 200);
      return { status: 502, body: { error: `Kiwi ${r.status}`, detail, flights: [] } };
    }
    const json = await r.json();
    const node = json?.data?.onewayItineraries;
    if (!node || node.__typename === 'AppError') {
      return { status: 502, body: { error: node?.error || 'Kiwi error', flights: [] } };
    }
    const items = node.itineraries || [];
    const eurUsd = await eurToUsd();
    const ctx = { originCode, destinationCode, date };
    const flights = items
      .map((it) => mapItinerary(it, ctx, eurUsd))
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);

    if (flights.length === 0) {
      return { status: 502, body: { error: 'Kiwi returned no itineraries', flights: [], source: 'kiwi' } };
    }
    CACHE.set(key, { ts: Date.now(), flights });
    return { status: 200, body: { flights, source: 'kiwi' } };
  } catch (err) {
    return { status: 500, body: { error: err.message || String(err), flights: [], source: 'kiwi' } };
  }
}
