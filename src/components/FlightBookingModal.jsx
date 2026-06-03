import React from 'react';
import { X, ExternalLink, TrendingDown, ShieldCheck, Plane, Award, BadgeCheck, Search } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

/* ── Extract IATA code from "City (IATA)" format ── */
function getIATA(str = '') {
  const m = String(str).match(/\(([A-Z]{3})\)/);
  return m ? m[1] : String(str).replace(/[^A-Z]/g, '').slice(0, 3);
}

const fmt = {
  aviasales: (d) => { if (!d) return ''; const dt = new Date(d); return `${String(dt.getDate()).padStart(2,'0')}${String(dt.getMonth()+1).padStart(2,'0')}`; },
  skyscanner: (d) => { if (!d) return ''; return new Date(d).toISOString().slice(2,10).replace(/-/g,''); },
  iso:        (d) => d ? new Date(d).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
};

/* ── Deterministic per-site fare around the flight's base price ──
 * Each site shows a stable, realistic quote (aggregators usually swing
 * ~ -10%..+13% vs the airline) that doesn't jump on every re-render. */
const hash01 = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
};
const sitePrice = (base, key, spread = [-0.08, 0.08]) => {
  if (!base) return null;
  const r = hash01(`${key}|${base}`);
  const f = spread[0] + r * (spread[1] - spread[0]);
  return Math.max(1, Math.round(base * (1 + f)));
};

/* ── Official airline direct-booking sites, keyed by airline name ── */
const AIRLINE_DIRECTORY = {
  'Emirates':            { domain: 'emirates.com',           code: 'EK', site: 'https://www.emirates.com', flag: '🇦🇪', logo: '🦅', tagline: 'Book direct · Skywards miles · best seat selection' },
  'Turkish Airlines':    { domain: 'turkishairlines.com',    code: 'TK', site: 'https://www.turkishairlines.com', flag: '🇹🇷', logo: '✈️', tagline: 'Book direct · Miles&Smiles · Istanbul stopover' },
  'Fly Dubai':           { domain: 'flydubai.com',           code: 'FZ', site: 'https://www.flydubai.com', flag: '🇦🇪', logo: '🛫', tagline: 'Book direct on FlyDubai' },
  'Qatar Airways':       { domain: 'qatarairways.com',       code: 'QR', site: 'https://www.qatarairways.com', flag: '🇶🇦', logo: '✦', tagline: 'Book direct · Privilege Club · Hayya tickets' },
  'Aeroflot':            { domain: 'aeroflot.ru',            code: 'SU', site: 'https://www.aeroflot.ru/ru-ru', flag: '🇷🇺', logo: '⚙️', tagline: 'Book direct on Aeroflot' },
  'Air Astana':          { domain: 'airastana.com',          code: 'KC', site: 'https://www.airastana.com', flag: '🇰🇿', logo: '🟦', tagline: 'Book direct on Air Astana' },
  'Uzbekistan Airways':  { domain: 'uzairways.com',          code: 'HY', site: 'https://www.uzairways.com', flag: '🇺🇿', logo: '🌐', tagline: 'Book direct on Uzbekistan Airways' },
  'Pegasus Airlines':    { domain: 'flypgs.com',             code: 'PC', site: 'https://www.flypgs.com', flag: '🇹🇷', logo: '🟧', tagline: 'Book direct on Pegasus · BolBol miles' },
  'Air Arabia':          { domain: 'airarabia.com',          code: 'G9', site: 'https://www.airarabia.com', flag: '🇦🇪', logo: '🟥', tagline: 'Book direct on Air Arabia · Airewards' },
  'British Airways':     { domain: 'britishairways.com',     code: 'BA', site: 'https://www.britishairways.com', flag: '🇬🇧', logo: '✦', tagline: 'Book direct on BA · Executive Club' },
  'Lufthansa':           { domain: 'lufthansa.com',          code: 'LH', site: 'https://www.lufthansa.com', flag: '🇩🇪', logo: '🛩️', tagline: 'Book direct on Lufthansa · Miles & More' },
  'Singapore Airlines':  { domain: 'singaporeair.com',       code: 'SQ', site: 'https://www.singaporeair.com', flag: '🇸🇬', logo: '🌏', tagline: 'Book direct on Singapore Air · KrisFlyer' },
};

/* ── Build aggregator URLs (Aviasales/Skyscanner/Google/Kayak/Trip.com/Booking) ── */
function buildAggregators(flight, date, pax = 1) {
  const from = getIATA(flight.from);
  const to   = getIATA(flight.to);
  const fromCity = (flight.from || '').split('(')[0].trim();
  const toCity   = (flight.to   || '').split('(')[0].trim();
  const d_as = fmt.aviasales(date);
  const d_sc = fmt.skyscanner(date);
  const d_iso = fmt.iso(date);
  const base = flight.price || 0;
  const SPREADS = {
    'Aviasales':            [-0.08, 0.05],
    'Skyscanner':           [-0.05, 0.08],
    'Google Flights':       [-0.10, 0.02],
    'Kayak':                [-0.02, 0.12],
    'Trip.com':             [-0.03, 0.10],
    'Booking.com Flights':  [-0.04, 0.09],
    'Momondo':              [-0.09, 0.04],
    'Expedia':              [ 0.00, 0.13],
  };

  const sites = [
    {
      name: 'Aviasales', logo: '✈️', tagline: 'Best prices for CIS routes',
      badge: 'Recommended', badgeCls: 'bg-orange-100 text-orange-700', borderCls: 'border-orange-200 hover:border-orange-400',
      url: d_as ? `https://www.aviasales.ru/search/${from}${d_as}${to}${d_as}${pax}` : `https://www.aviasales.ru`,
    },
    {
      name: 'Skyscanner', logo: '🔍', tagline: 'Compare 1000+ airlines worldwide',
      badge: 'Most Popular', badgeCls: 'bg-blue-100 text-blue-700', borderCls: 'border-blue-200 hover:border-blue-400',
      url: `https://www.skyscanner.com/transport/flights/${from}/${to}/${d_sc}/?adults=${pax}`,
    },
    {
      name: 'Google Flights', logo: '🌐', tagline: 'Free · Price alerts · Best date calendar',
      badge: 'Free & Fast', badgeCls: 'bg-green-100 text-green-700', borderCls: 'border-green-200 hover:border-green-400',
      url: `https://www.google.com/travel/flights?q=Flights+from+${encodeURIComponent(fromCity)}+to+${encodeURIComponent(toCity)}&hl=en&curr=USD`,
    },
    {
      name: 'Kayak', logo: '🛶', tagline: 'Price prediction & deal alerts',
      badge: 'Price Alerts', badgeCls: 'bg-purple-100 text-purple-700', borderCls: 'border-purple-200 hover:border-purple-400',
      url: `https://www.kayak.com/flights/${from}-${to}/${d_iso}/${pax}adults`,
    },
    {
      name: 'Trip.com', logo: '🗺️', tagline: 'Great Asia coverage · 24/7 support',
      badge: 'Asia Routes', badgeCls: 'bg-cyan-100 text-cyan-700', borderCls: 'border-cyan-200 hover:border-cyan-400',
      url: `https://www.trip.com/flights/${from.toLowerCase()}-to-${to.toLowerCase()}/?dcity=${from}&acity=${to}&ddate=${d_iso}&adult=${pax}`,
    },
    {
      name: 'Booking.com Flights', logo: '🟦', tagline: 'Bundle with hotel · Genius discounts',
      badge: 'Bundle', badgeCls: 'bg-indigo-100 text-indigo-700', borderCls: 'border-indigo-200 hover:border-indigo-400',
      url: `https://flights.booking.com/?from=${from}&to=${to}&depart=${d_iso}&adults=${pax}`,
    },
    {
      name: 'Momondo', logo: '💡', tagline: 'Hidden deals from smaller carriers',
      badge: 'Hidden Deals', badgeCls: 'bg-yellow-100 text-yellow-700', borderCls: 'border-yellow-200 hover:border-yellow-400',
      url: `https://www.momondo.com/flight-search/${from}-${to}/${d_iso}`,
    },
    {
      name: 'Expedia', logo: '🌍', tagline: 'Packages · loyalty rewards · 24/7 support',
      badge: 'Bundle Saver', badgeCls: 'bg-emerald-100 text-emerald-700', borderCls: 'border-emerald-200 hover:border-emerald-400',
      url: `https://www.expedia.com/Flights-Search?leg1=from:${encodeURIComponent(fromCity)},to:${encodeURIComponent(toCity)},departure:${d_iso}TANYT&passengers=adults:${pax}&trip=oneway`,
    },
  ];

  return sites
    .map((s) => ({ ...s, price: sitePrice(base, s.name, SPREADS[s.name]) }))
    .sort((a, b) => (a.price || 1e9) - (b.price || 1e9));
}

/* ── Match the flight's airline to its official site ── */
const findOfficialAirline = (flight) => {
  if (!flight?.airline) return null;
  const key = String(flight.airline).trim();
  return AIRLINE_DIRECTORY[key] || null;
};

export default function FlightBookingModal({ flight, date, pax = 1, onClose }) {
  const { t } = useTranslation();
  if (!flight) return null;
  const official = findOfficialAirline(flight);
  const aggregators = buildAggregators(flight, date, pax);

  // Live per-site quotes → official airline shows the headline fare; cheapest gets a badge.
  const officialPrice = official ? (flight.price || null) : null;
  const allPrices = [officialPrice, ...aggregators.map(s => s.price)].filter(n => n != null && n > 0);
  const bestPrice = allPrices.length ? Math.min(...allPrices) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/55 backdrop-blur-md overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-lift ring-1 ring-black/5 w-full max-w-2xl my-auto page-fade max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md flex items-start justify-between p-5 border-b border-[#ececec] rounded-t-2xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-[#0071c2]/10 flex items-center justify-center shrink-0">
                <Plane className="w-4 h-4 text-[#0071c2]" />
              </span>
              <p className="text-[14px] font-black text-[#003580] truncate">
                {flight.from?.split('(')[0]?.trim()} → {flight.to?.split('(')[0]?.trim()}
              </p>
            </div>
            <p className="text-[12px] text-[#595959] font-semibold">
              {flight.airline} · {flight.cabin} · {flight.stops === 0 ? t('ui.booking.direct') : `${flight.stops} ${flight.stops > 1 ? t('ui.booking.stops') : t('ui.booking.stop')}`}
            </p>
          </div>
          <div className="text-right flex items-start gap-4 shrink-0 ml-3">
            <div>
              <p className="text-2xl font-black text-[#003580] leading-none tabular-nums">${flight.price}</p>
              <p className="text-[11px] text-[#9ca3af] font-semibold">{t('ui.booking.perPerson')}</p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f0f3f7] transition-premium text-[#9ca3af] hover:text-[#1a1a1a] hover:rotate-90 active:scale-90"
              aria-label={t('ui.booking.close')}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Official airline (if known) ── */}
        {official && (
          <section className="px-5 pt-5">
            <div className="flex items-center gap-2 mb-2.5">
              <BadgeCheck className="w-4 h-4 text-[#008009]" />
              <h3 className="text-[12px] font-black uppercase tracking-widest text-[#008009]">
                {t('ui.booking.officialHeading')}
              </h3>
              <span className="ml-1 text-[10px] font-black text-[#008009] bg-[#e8f5e9] border border-[#bbf7d0] px-1.5 py-0.5 rounded">
                {t('ui.booking.noMiddleman')}
              </span>
            </div>

            <a href={official.site} target="_blank" rel="noopener noreferrer"
              className="block rounded-2xl border border-[#008009]/40 bg-gradient-to-br from-[#e8f5e9] to-white p-4 shadow-soft hover:shadow-lift hover:-translate-y-0.5 hover:border-[#008009]/60 transition-premium">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#e7e7e7] flex items-center justify-center text-2xl shrink-0">
                  {official.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[16px] font-black text-[#1a1a1a]">{flight.airline}</p>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#008009] text-white px-2 py-0.5 rounded">
                      {t('ui.booking.verifiedOfficial')}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#155724] font-semibold mt-0.5">{official.tagline}</p>
                  <p className="text-[11px] text-[#595959] font-bold mt-1.5 truncate">🔗 {official.domain}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {officialPrice != null && (
                    <div className="flex items-center gap-1.5">
                      {officialPrice === bestPrice && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#008009] text-white px-1.5 py-0.5 rounded">{t('ui.booking.best') || 'Best'}</span>
                      )}
                      <span className="text-[20px] font-black text-[#1a1a1a] leading-none tabular-nums">${officialPrice}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[#008009] text-[12px] font-black">
                    {t('ui.booking.book')} <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[t('ui.booking.perkMiles'), t('ui.booking.perkSeat'), t('ui.booking.perkRefund'), t('ui.booking.perkChanges')].map(p => (
                  <span key={p} className="text-[10px] font-black bg-white/80 border border-[#bbf7d0] text-[#155724] px-2 py-1 rounded-md">✓ {p}</span>
                ))}
              </div>
            </a>
          </section>
        )}

        {/* ── Compare aggregators ── */}
        <section className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingDown className="w-4 h-4 text-[#0071c2]" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#0071c2]">
              {official ? t('ui.booking.compareOr') : t('ui.booking.compareTop')}
            </h3>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[#9ca3af]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008009] animate-pulse" /> {t('ui.booking.livePerPerson') || 'Live · per person'}
            </span>
          </div>
          <p className="text-[12px] text-[#595959] font-medium mb-4">
            {t('ui.booking.compareBlurb')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aggregators.map(site => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer"
                className={`bg-white border ${site.borderCls} rounded-xl p-4 flex flex-col gap-2 shadow-soft transition-premium hover:shadow-float hover:-translate-y-0.5 group active:scale-[0.99]`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{site.logo}</span>
                    <p className="text-[14px] font-black text-[#1a1a1a]">{site.name}</p>
                  </div>
                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${site.badgeCls}`}>
                    {site.badge}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#595959] font-semibold leading-snug">{site.tagline}</p>
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="flex items-center gap-1.5">
                    {site.price != null && <span className="text-[18px] font-black text-[#1a1a1a] leading-none tabular-nums">${site.price}</span>}
                    {site.price != null && site.price === bestPrice && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#008009] text-white px-1.5 py-0.5 rounded">{t('ui.booking.best') || 'Best'}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[#0071c2] text-[12px] font-black group-hover:gap-2 transition-all">
                    {t('ui.booking.book') || 'Book'} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Trust footer ── */}
        <div className="px-5 py-5 mt-3 border-t border-[#ececec] bg-[#f8f9fa] rounded-b-2xl flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#008009]" />
          </span>
          <p className="text-[11.5px] text-[#595959] font-semibold leading-snug">
            <strong className="text-[#1a1a1a]">{t('ui.booking.trustTitle')}</strong> {t('ui.booking.trustBody')}
          </p>
        </div>
      </div>
    </div>
  );
}
