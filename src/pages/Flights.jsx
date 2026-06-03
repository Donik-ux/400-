import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Filter, TrendingDown, ExternalLink, Search, Star, Globe,
  ArrowRight, Sparkles, Shield, BadgePercent, Headphones, ThumbsUp, MapPin,
  X, Wallet, BadgeCheck,
  Telescope, Compass, Map,
} from 'lucide-react';
import FlightSearch from '../features/flights/FlightSearch';
import FlightCard from '../features/flights/FlightCard';
import { useFlights } from '../hooks/useFlights';
import { AIRLINE_LINKS } from '../services/airlineLinks';
import useStore from '../store/useStore';
import { useTranslation } from '../store/useLangStore';
import useSEO from '../hooks/useSEO';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';

/* ── External Booking Sites ── */
const getBookingSites = (t) => [
  { name: 'Aviasales',      icon: Plane,     color: '#0a7cff', url: 'https://aviasales.ru',       desc: t('flights.sites.aviasales.desc'),  badge: t('flights.sites.aviasales.badge'),  rating: 4.8 },
  { name: 'Skyscanner',     icon: Telescope, color: '#0770e3', url: 'https://skyscanner.com',     desc: t('flights.sites.skyscanner.desc'), badge: t('flights.sites.skyscanner.badge'), rating: 4.7 },
  { name: 'Google Flights', icon: Globe,     color: '#34a853', url: 'https://flights.google.com', desc: t('flights.sites.google.desc'),     badge: t('flights.sites.google.badge'),     rating: 4.9 },
  { name: 'Kayak',          icon: Compass,   color: '#ff690f', url: 'https://kayak.com',          desc: t('flights.sites.kayak.desc'),      badge: t('flights.sites.kayak.badge'),      rating: 4.6 },
  { name: 'Trip.com',       icon: Map,       color: '#287dfa', url: 'https://trip.com',           desc: t('flights.sites.trip.desc'),       badge: t('flights.sites.trip.badge'),       rating: 4.5 },
  { name: 'Momondo',        icon: Sparkles,  color: '#e6007e', url: 'https://momondo.com',        desc: t('flights.sites.momondo.desc'),    badge: t('flights.sites.momondo.badge'),    rating: 4.5 },
];

const POPULAR_ROUTES = [
  { from: 'Dubai (DXB)',     to: 'Maldives (MLE)',    city: 'Maldives',   country: 'Maldives',    from$: 410 },
  { from: 'Dubai (DXB)',     to: 'Bali (DPS)',        city: 'Bali',       country: 'Indonesia',   from$: 480 },
  { from: 'Abu Dhabi (AUH)', to: 'Seychelles (SEZ)',  city: 'Seychelles', country: 'Seychelles',  from$: 520 },
  { from: 'Istanbul (IST)',  to: 'Mauritius (MRU)',   city: 'Mauritius',  country: 'Mauritius',   from$: 560 },
  { from: 'Dubai (DXB)',     to: 'Phuket (HKT)',      city: 'Phuket',     country: 'Thailand',    from$: 390 },
  { from: 'Doha (DOH)',      to: 'Bali (DPS)',        city: 'Bali',       country: 'Indonesia',   from$: 500 },
  { from: 'Dubai (DXB)',     to: 'Bangkok (BKK)',     city: 'Bangkok',    country: 'Thailand',    from$: 280 },
  { from: 'Abu Dhabi (AUH)', to: 'Maldives (MLE)',    city: 'Maldives',   country: 'Maldives',    from$: 430 },
];

export default function Flights() {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  useSEO({
    title: 'Search Cheap Flights · Compare 6 Airlines',
    description: 'Find cheap flights from Dubai, Abu Dhabi, Doha and Istanbul to the Maldives, Bali, Seychelles, Mauritius and 100+ destinations. Smart filters, real-time prices.',
    keywords: ['cheap flights', 'flight search', 'Dubai flights', 'Maldives flights', 'Bali flights', 'compare airfare', 'MAFTRAVEL flights'],
  });

  const [formData, setFormData] = useState({ from: '', to: '', date: '', returnDate: '' });
  const [filter,   setFilter]   = useState('all');                         // all | nonstop | business
  const [airlineFilter, setAirlineFilter] = useState(null);                // null = all
  const [maxPrice,   setMaxPrice]         = useState(null);                // null = no cap

  const { flights }                   = useStore();
  const { getFlights, loading, error, aiRefining, aiSource, source } = useFlights();

  const handleSearch = async (eOrPayload) => {
    if (eOrPayload?.preventDefault) eOrPayload.preventDefault();
    const payload = eOrPayload?.formData || formData;
    try {
      await getFlights(payload);
      setAirlineFilter(null);
      setMaxPrice(null);
      toast.success(t('flightsPage.toast.foundTitle'), `${payload.from} → ${payload.to}`);
    } catch {
      toast.error(t('flightsPage.toast.failedTitle'), t('flightsPage.toast.failedBody'));
    }
  };

  const BOOKING_SITES = getBookingSites(t);

  /* ── Derived: filter state ── */
  const priceRange = useMemo(() => {
    if (!flights.length) return [0, 1000];
    const prices = flights.map(f => f.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [flights]);

  const availableAirlines = useMemo(() => {
    const set = new Set(flights.map(f => f.airline));
    return Array.from(set);
  }, [flights]);

  const filtered = useMemo(() => {
    return flights.filter(f => {
      if (filter === 'nonstop'  && f.stops !== 0)       return false;
      if (filter === 'business' && f.cabin !== 'Business') return false;
      if (airlineFilter && f.airline !== airlineFilter) return false;
      if (maxPrice != null && f.price > maxPrice)        return false;
      return true;
    });
  }, [flights, filter, airlineFilter, maxPrice]);

  const cheapest  = flights.length ? Math.min(...flights.map(f => f.price)) : null;

  const clearFilters = () => { setFilter('all'); setAirlineFilter(null); setMaxPrice(null); };
  const hasFilters = filter !== 'all' || airlineFilter || maxPrice != null;

  return (
    <div className="relative bg-[#f7f8fa] min-h-screen -mt-[64px] overflow-hidden">
      {/* ── soft, airy ambient tints ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[820px]"
        style={{
          background:
            'radial-gradient(46rem 40rem at 10% 0%, rgba(0,113,194,0.06) 0%, transparent 60%), radial-gradient(42rem 38rem at 94% 2%, rgba(245,185,66,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10">
      {/* ── HERO + SEARCH ── */}
      <section className="relative text-white pt-[120px] pb-36 md:pb-44 overflow-hidden">
        {/* real Maldives photo */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroFor('maldives')})` }}
        />
        {/* navy gradient for white-text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001a3d]/85 via-[#002250]/70 to-[#003580]/55" />
        {/* fade INTO the light page */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-[#f7f8fa]" />
        <Plane className="absolute right-[6%] top-[120px] w-40 h-40 text-white/[0.08] -rotate-[25deg] animate-float pointer-events-none hidden md:block" />
        <div className="absolute -right-24 -bottom-12 w-80 h-80 rounded-full bg-[#febb02]/12 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
              <Plane className="w-3.5 h-3.5" /> {t('flights.badge') || t('flightsPage.hero.badge')}
            </div>
            <h1 className="font-display text-[40px] md:text-[62px] font-semibold tracking-[-0.03em] leading-[1.0] mb-3 [text-shadow:0_2px_30px_rgba(0,0,0,0.28)]">
              {t('flightsPage.hero.titleLine1')}<br className="hidden md:block" /> <span className="italic font-medium text-gradient-gold">{t('flightsPage.hero.titleLine2')}</span>
            </h1>
            <p className="text-[15px] md:text-[18px] text-white/80 font-medium max-w-xl leading-relaxed">
              {t('flightsPage.hero.subtitle')}
            </p>
          </div>
        </div>

        {/* Floating search card */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 -mb-24">
          <FlightSearch formData={formData} onChange={setFormData} onSubmit={handleSearch} loading={loading} />
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-[13px] font-semibold text-red-700 flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      </section>

      <div className="h-24" />

      {/* ── Trust strip ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: BadgePercent, t: t('flightsPage.trust.bestPrice'), s: t('flightsPage.trust.bestPriceSub') },
            { icon: Shield,       t: t('flightsPage.trust.secure'),    s: t('flightsPage.trust.secureSub') },
            { icon: Headphones,   t: t('flightsPage.trust.support'),   s: t('flightsPage.trust.supportSub') },
            { icon: ThumbsUp,     t: t('flightsPage.trust.rating'),    s: t('flightsPage.trust.ratingSub') },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-[#ececf0] rounded-2xl p-4 flex items-center gap-3 hover:border-[#0071c2]/40 shadow-soft hover:shadow-float hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f0f5ff] to-[#dceaff] text-[#0071c2] flex items-center justify-center shrink-0 shadow-soft">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-[#1a1a1a] truncate">{f.t}</div>
                <div className="text-[11px] font-semibold text-[#9ca3af] truncate">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="mt-2 space-y-3">
            <div className="h-6 w-48 rounded-md shimmer mb-3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e7e7e7] shadow-soft rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded shimmer" />
                    <div className="h-3 w-1/2 rounded shimmer" />
                  </div>
                  <div className="w-24 h-10 rounded-xl shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search results with smart filters ── */}
        {!loading && flights.length > 0 && (
          <div className="grid lg:grid-cols-4 gap-6 mt-4">
            {/* Filters sidebar */}
            <aside className="lg:col-span-1 space-y-3 lg:sticky lg:top-[80px] self-start max-h-[80vh] overflow-auto pr-1">
              <div className="bg-white border border-[#e7e7e7] shadow-soft rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-[#9ca3af]">{t('flightsPage.filters.title')}</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-[11px] font-black text-red-500 hover:underline">{t('flightsPage.filters.clearAll')}</button>
                  )}
                </div>

                {/* Stops */}
                <FilterGroup title={t('flightsPage.filters.stops')}>
                  {[
                    { v: 'all',     l: t('flightsPage.filters.any')      },
                    { v: 'nonstop', l: t('flightsPage.filters.nonstop') },
                    { v: 'business',l: t('flightsPage.filters.business') },
                  ].map(o => (
                    <FilterChip key={o.v} active={filter === o.v} onClick={() => setFilter(o.v)}>{o.l}</FilterChip>
                  ))}
                </FilterGroup>

                {/* Price */}
                <FilterGroup title={`${t('flightsPage.filters.maxPrice')} · $${maxPrice ?? priceRange[1]}`}>
                  <input type="range"
                    min={priceRange[0]} max={priceRange[1]} step={10}
                    value={maxPrice ?? priceRange[1]}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#0071c2] cursor-pointer" />
                  <div className="flex justify-between text-[10px] font-bold text-[#9ca3af] mt-1">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </FilterGroup>

                {/* Airlines */}
                <FilterGroup title={t('flightsPage.filters.airlines')}>
                  <div className="space-y-1">
                    {availableAirlines.map(a => {
                      const minP = Math.min(...flights.filter(f => f.airline === a).map(f => f.price));
                      return (
                        <button key={a} onClick={() => setAirlineFilter(airlineFilter === a ? null : a)}
                          className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12px] font-bold transition active:scale-[0.98] ${
                            airlineFilter === a ? 'bg-[#003580] text-white shadow-soft' : 'hover:bg-[#f0f5ff] text-[#1a1a1a]'
                          }`}>
                          <span className="truncate">{a}</span>
                          <span className={airlineFilter === a ? 'text-white/80' : 'text-[#9ca3af]'}>${minP}</span>
                        </button>
                      );
                    })}
                  </div>
                </FilterGroup>
              </div>

              {/* Quick insights */}
              {cheapest != null && (
                <div className="bg-white border border-[#ececf0] shadow-soft rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">{t('flightsPage.highlights.title')}</h3>
                  <Insight icon={<Wallet className="w-3.5 h-3.5" />} label={t('flightsPage.highlights.cheapest')} val={`$${cheapest}`} sub={flights.find(f => f.price === cheapest)?.airline} />
                  <Insight icon={<Plane className="w-3.5 h-3.5" />}  label={t('flightsPage.highlights.nonstop') || 'Non-stop'} val={`${flights.filter(f => f.stops === 0).length}`} sub={t('flights.results.direct') || 'direct'} />
                </div>
              )}
            </aside>

            {/* Results list */}
            <div className="lg:col-span-3">
              <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h2 className="text-[20px] font-black text-[#1a1a1a]">{formData.from} → {formData.to}</h2>
                  <div className="text-[12px] text-[#595959] font-medium">
                    <strong>{filtered.length}</strong> {t('flightsPage.results.matchPrefix')} {flights.length} {t('flightsPage.results.matchSuffix')}
                    {cheapest && <> · {t('flightsPage.results.from')} <strong className="text-[#003580]">${cheapest}</strong></>}
                  </div>
                </div>
                <button
                  onClick={() => handleSearch({ formData })}
                  disabled={loading || aiRefining}
                  className="px-3.5 py-2 rounded-xl border-2 border-[#0071c2] text-[#0071c2] hover:bg-[#f0f5ff] text-[12px] font-black flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 shadow-soft hover:shadow-float"
                  title={t('flightsPage.results.refreshTitle')}>
                  <Sparkles className={`w-3.5 h-3.5 ${aiRefining ? 'animate-pulse' : ''}`} />
                  {aiRefining ? t('flightsPage.results.aiRefining') : t('flightsPage.results.refreshWithAI')}
                </button>
              </div>

              {/* Source banner — real-price provider */}
              {(source === 'kiwi' || source === 'travelpayouts' || source === 'amadeus') && (
                <div className="mb-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#e8f5e9] to-white border border-[#bbf7d0] shadow-soft flex items-center gap-2.5">
                  <span className="text-[18px]">📡</span>
                  <div className="text-[12px] font-bold text-[#155724] leading-snug">
                    <strong>{t('flightsPage.banners.realtimeTitle')}</strong>{' '}
                    {source === 'kiwi'
                      ? t('flightsPage.banners.kiwiBody')
                      : source === 'travelpayouts'
                        ? t('flightsPage.banners.travelpayoutsBody')
                        : t('flightsPage.banners.amadeusBody')}
                  </div>
                </div>
              )}
              {aiRefining && source !== 'amadeus' && (
                <div className="mb-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#f0f5ff] to-[#dceaff] border border-[#0071c2]/20 shadow-soft flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#0071c2] animate-pulse shrink-0" />
                  <div className="text-[12px] text-[#003580] font-bold">
                    {t('flightsPage.banners.grokRefining')}
                  </div>
                </div>
              )}
              {!aiRefining && source === 'grok' && aiSource && (
                <div className="mb-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#fff7e6] to-white border border-[#ffd76e] shadow-soft flex items-center gap-2.5">
                  <BadgeCheck className="w-4 h-4 text-[#a45e00] shrink-0" />
                  <div className="text-[12px] font-bold text-[#7c4a00] leading-snug">
                    <strong>{t('flightsPage.banners.aiEstimateTitle')}</strong> · {t('flightsPage.banners.aiEstimateMedian')} <strong>${aiSource.median}</strong> · {t('flightsPage.banners.aiEstimateRange')} ${aiSource.low}–${aiSource.high}{aiSource.note ? ` · ${aiSource.note}` : ''}
                    <br/>
                    <span className="font-semibold text-[#a45e00]/85">{t('flightsPage.banners.aiEstimateNote')}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filtered.length > 0 ? (
                  filtered.map((flight, idx) => (
                    <motion.div key={flight.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.04 }}>
                      <FlightCard flight={flight} index={idx} aiPriced={!!aiSource} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-[#e7e7e7] shadow-soft">
                    <Filter className="w-10 h-10 mx-auto mb-3 text-[#c9d1d9]" />
                    <p className="text-[#1a1a1a] font-bold mb-1">{t('flightsPage.results.noMatchTitle')}</p>
                    <p className="text-[#9ca3af] text-sm mb-4">{t('flightsPage.results.noMatchSub')}</p>
                    <button onClick={clearFilters}
                      className="px-4 py-2 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[13px] font-black transition active:scale-95 shadow-soft hover:shadow-float">
                      {t('flightsPage.results.clearFilters')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Inspiration: Popular routes (only when no search yet) ── */}
        {!loading && flights.length === 0 && (
          <>
            <section className="mt-10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                    <TrendingDown className="w-3.5 h-3.5" /> {t('flightsPage.inspiration.eyebrow')}
                  </div>
                  <h2 className="font-display text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('flightsPage.inspiration.title')}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {POPULAR_ROUTES.map((r, i) => (
                  <button key={i}
                    onClick={() => {
                      setFormData({ from: r.from, to: r.to, date: '', returnDate: '' });
                      handleSearch({ formData: { from: r.from, to: r.to, date: '' } });
                      window.scrollTo({ top: 80, behavior: 'smooth' });
                    }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-cover bg-center shadow-soft hover:shadow-float hover:-translate-y-1 border border-[#ececf0] transition-all duration-300 active:scale-[0.98]"
                    style={{ backgroundImage: `url(${heroFor(r.city)})` }}>
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${heroFor(r.city)})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                    <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end text-left text-white">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#febb02] mb-1">{r.country}</div>
                      <div className="font-display text-[18px] md:text-[21px] font-bold leading-tight">{r.city}</div>
                      <div className="text-[10px] text-white/75 font-bold mb-2.5">{r.from.split(' (')[0]} → {r.to.split(' (')[0]}</div>
                      <div className="inline-flex items-center gap-1.5 bg-[#febb02] text-[#1a1a1a] font-black px-2.5 py-1 rounded-lg w-fit text-[11px] shadow-soft group-hover:gap-2.5 transition-all">
                        <Plane className="w-3 h-3" /> {t('flightsPage.inspiration.from')} ${r.from$}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* AI Trip CTA — rich blue/gold accent band */}
            <section className="mt-10">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#003580] via-[#0071c2] to-[#003580] rounded-3xl p-6 md:p-9 text-white shadow-float">
                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#febb02]/30 blur-3xl pointer-events-none animate-float" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> {t('flightsPage.aiCta.badge')}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">
                      {t('flightsPage.aiCta.title')}
                    </h2>
                    <p className="text-[14px] text-white/85 font-medium">
                      {t('flightsPage.aiCta.body')}
                    </p>
                  </div>
                  <button onClick={() => navigate('/hot-tours')}
                    className="btn-gold px-5 py-3 text-[14px] flex items-center gap-2 shrink-0">
                    <Sparkles className="w-4 h-4" /> {t('flightsPage.aiCta.button')}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}


        {/* ── Official airlines · book direct ── */}
        <section className="mt-12">
          <div className="inline-flex items-center gap-2 text-[#008009] text-[11px] font-black uppercase tracking-[0.2em] mb-2">
            <BadgeCheck className="w-3.5 h-3.5" /> {t('flightsPage.direct.official')}
          </div>
          <h2 className="font-display text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('flightsPage.direct.title')}</h2>
          <p className="text-[#595959] text-[13px] md:text-[14px] font-medium mb-6 mt-2 max-w-2xl leading-relaxed">
            {t('flightsPage.direct.sub')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.values(AIRLINE_LINKS).map((al) => (
              <a key={al.name} href={al.homepage} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-[#ececf0] hover:border-[#008009]/40 shadow-soft hover:shadow-float hover:-translate-y-0.5 rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300 group active:scale-[0.98]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#e7e7e7] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {al.flag}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-[#1a1a1a] truncate leading-tight">{al.name}</p>
                      <p className="text-[10.5px] text-[#0071c2] font-bold truncate">{al.domain}</p>
                    </div>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-[#008009] shrink-0 mt-0.5" title={t('flightsPage.direct.officialAirline')} />
                </div>
                <div className="flex items-center gap-1 text-[#008009] text-[11px] font-black group-hover:gap-2 transition-all mt-auto">
                  {t('flightsPage.direct.bookDirect')} <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-5 bg-[#e8f5e9] border border-[#bbf7d0] rounded-2xl p-4 flex items-start gap-3 shadow-soft">
            <BadgeCheck className="w-5 h-5 text-[#008009] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#155724] font-semibold leading-relaxed">
              <strong className="font-black">{t('flightsPage.direct.whyTitle')}</strong> {t('flightsPage.direct.whyBody')}
            </div>
          </div>
        </section>

        {/* ── Aggregators · compare prices ── */}
        <section className="mt-12">
          <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-[0.2em] mb-2">
            <Globe className="w-3.5 h-3.5" /> {t('flightsPage.aggregators.thirdParty')}
          </div>
          <h2 className="font-display text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('flights.bookingSites') || 'Compare on aggregators'}</h2>
          <p className="text-[#595959] text-[13px] md:text-[14px] font-medium mb-6 mt-2 max-w-2xl leading-relaxed">
            {t('flights.bookingSub') || 'Open the platform with the best fare for your route. Sometimes 10–30% cheaper than the airline itself.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOOKING_SITES.map((site) => (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer"
                style={{ '--brand': site.color }}
                className="group relative bg-white border border-[#e7e7e7] shadow-soft rounded-2xl p-5 flex flex-col gap-3.5 overflow-hidden hover:border-[var(--brand)] hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
                {/* brand glow on hover */}
                <div className="absolute -top-14 -right-14 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none"
                  style={{ background: site.color }} />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(150deg, ${site.color}, ${site.color}c8)`,
                        boxShadow: `0 6px 16px -4px ${site.color}80`,
                      }}>
                      {/* glossy highlight */}
                      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-b from-white/35 to-transparent" />
                      {/* inner ring */}
                      <div className="absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/25" />
                      <site.icon className="relative w-[26px] h-[26px] text-white drop-shadow-sm" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-[#1a1a1a] leading-tight">{site.name}</p>
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-[#fff7e6]">
                        <Star className="w-3 h-3 text-[#febb02] fill-[#febb02]" />
                        <span className="text-[11px] font-black text-[#a45e00]">{site.rating}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-[#febb02] text-[#1a1a1a] px-2 py-1 rounded-md shrink-0">{site.badge}</span>
                </div>

                <p className="relative text-[13px] text-[#595959] leading-relaxed flex-1">{site.desc}</p>

                <div className="relative flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
                  <span className="text-[12px] font-black" style={{ color: site.color }}>
                    {t('flights.searchOn') || 'Search on'} {site.name}
                  </span>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:translate-x-0.5 transition-transform duration-300"
                    style={{ background: site.color }}>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-5 bg-[#fff7e6] border border-[#ffd76e] rounded-2xl p-4 flex items-start gap-3 shadow-soft">
            <div className="text-xl shrink-0">💡</div>
            <div>
              <p className="text-[13px] font-black text-[#a45e00] mb-1">{t('flights.proTip') || 'Pro tip: compare before you buy'}</p>
              <p className="text-[12px] text-[#7c4a00] font-semibold">{t('flights.proTipSub') || 'Prices vary 10-30% between sites. Open 2-3 platforms before booking, then verify on the airline\'s own site.'}</p>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

/* ── Subcomponents ── */
const FilterGroup = ({ title, children }) => (
  <div className="mb-4 last:mb-0">
    <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">{title}</p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);

const FilterChip = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[12px] font-black border transition active:scale-95 ${
      active ? 'bg-[#003580] text-white border-[#003580] shadow-soft' : 'bg-white border-[#e7e7e7] text-[#1a1a1a] hover:border-[#0071c2]'
    }`}>
    {children}
  </button>
);

const Insight = ({ icon, label, val, sub }) => (
  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8f9fa] border border-[#eef2f6]">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f0f5ff] to-[#dceaff] flex items-center justify-center text-[#0071c2] shrink-0 shadow-soft">{icon}</div>
    <div className="min-w-0">
      <div className="text-[9.5px] font-black uppercase tracking-widest text-[#9ca3af]">{label}</div>
      <div className="text-[13px] font-black text-[#003580] leading-tight">{val}</div>
      {sub && <div className="text-[10px] text-[#595959] font-semibold truncate">{sub}</div>}
    </div>
  </div>
);
