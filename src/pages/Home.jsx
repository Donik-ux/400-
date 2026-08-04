import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, MapPin, Calendar, ArrowRight, ArrowRightLeft, Search, Sparkles,
  Wand2, Wallet, Compass, Navigation, Loader2, Snowflake,
  FileText, BadgePercent, Stamp, ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import useSEO from '../hooks/useSEO';
import { useDateDaysSync } from '../hooks/useDateDaysSync';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';
import Price from '../components/Price';
import BudgetAdvisory from '../components/BudgetAdvisory';
import CityAutocomplete from '../features/flights/CityAutocomplete';
import WeatherWidget from '../components/WeatherWidget';
import { detectCurrentLocation } from '../services/geolocation';
import { parseTripQuery } from '../services/travelServicesService';
import { isGrokAvailable } from '../services/grokClient';

/* The one city every route list on this page departs from. MAFTRAVEL sells out
   of Uzbekistan, so Tashkent is the honest default rather than a guess. */
const ORIGIN = { city: 'Tashkent', code: 'TAS' };

/* Showcase destinations — `from` is the lowest fare we have seen on the route,
   used for the "from $X" labels. Not a live quote; the flight search re-prices. */
const DESTINATIONS = [
  { city: 'Bukhara',   country: 'Uzbekistan',  code: 'BHK', from: 125, img: 'https://images.unsplash.com/photo-1670514535515-e7af911bdadb?auto=format&fit=crop&w=900&q=80' },
  { city: 'Dubai',     country: 'UAE',         code: 'DXB', from: 280, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
  { city: 'Istanbul',  country: 'Turkey',      code: 'IST', from: 220, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80' },
  { city: 'Bali',      country: 'Indonesia',   code: 'DPS', from: 540, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
  { city: 'Paris',     country: 'France',      code: 'CDG', from: 410, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80' },
  { city: 'Tokyo',     country: 'Japan',       code: 'HND', from: 680, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80' },
  { city: 'Maldives',  country: 'Maldives',    code: 'MLE', from: 920, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80' },
  { city: 'New York',  country: 'USA',         code: 'JFK', from: 540, img: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=80' },
];

/* Longer tail for the route list and the footer-style link clusters. */
const MORE_CITIES = [
  { city: 'London',    country: 'United Kingdom', code: 'LHR', from: 450 },
  { city: 'Rome',      country: 'Italy',          code: 'FCO', from: 340 },
  { city: 'Barcelona', country: 'Spain',          code: 'BCN', from: 360 },
  { city: 'Bangkok',   country: 'Thailand',       code: 'BKK', from: 380 },
  { city: 'Singapore', country: 'Singapore',      code: 'SIN', from: 610 },
  { city: 'Las Vegas', country: 'USA',            code: 'LAS', from: 590 },
];

const ALL_CITIES = [...DESTINATIONS, ...MORE_CITIES];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSEO({
    title: t('homePage.seo.title'),
    description: t('homePage.seo.description'),
    url: 'https://maftravel.com',
    keywords: ['cheap flights', 'AI trip planner', 'Antarctica expedition', 'budget travel', 'Tashkent flights'],
  });

  // search widget state
  const [tab, setTab] = useState('flights');
  const [flightFrom, setFlightFrom]     = useState(`${ORIGIN.city} (${ORIGIN.code})`);
  const [flightTo, setFlightTo]         = useState('');
  const [flightDate, setFlightDate]     = useState('');
  const [flightReturn, setFlightReturn] = useState('');
  // dedicated AI-tab state — keeps it isolated from the flight fields
  const [aiBalance, setAiBalance] = useState(2000);
  const [aiDays,    setAiDays]    = useState(7);
  const [aiVibe,    setAiVibe]    = useState('any');
  const [aiDest,    setAiDest]    = useState('');
  const [aiFrom,    setAiFrom]    = useState(ORIGIN.city);
  const [aiStart,   setAiStart]   = useState('');
  const [aiReturn,  setAiReturn]  = useState('');
  const [locatingFrom, setLocatingFrom] = useState(false);
  // hero natural-language wish → fills the AI-tab fields (never deep-links,
  // so a misparse is visible and editable before the user searches)
  const [heroWish, setHeroWish]               = useState('');
  const [heroWishLoading, setHeroWishLoading] = useState(false);
  const searchCardRef = useRef(null);

  // Fill the AI "From" field with the user's detected current city.
  const useMyLocationForAi = async () => {
    setLocatingFrom(true);
    try {
      const loc = await detectCurrentLocation();
      const label = loc.label || loc.city;
      if (label) setAiFrom(label);
      else toast.info(t('tripRec.failed'));
    } catch (e) {
      toast.info(e?.code === 'GEO_DENIED' ? t('tripRec.denied') : t('tripRec.failed'));
    } finally {
      setLocatingFrom(false);
    }
  };

  // Parse the free-text wish and fill the AI-tab fields with what the model
  // is confident about. Direct setters (not the sync callbacks) so we don't
  // fight stale closures; clearing aiReturn lets it recompute from start+days.
  const handleHeroWish = async () => {
    const q = heroWish.trim();
    if (!q || heroWishLoading) return;
    setHeroWishLoading(true);
    try {
      const parsed = await parseTripQuery(q);
      if (!parsed.destination && !parsed.days && !parsed.budget && !parsed.startDate) {
        toast.info(t('plannerPage.magic.nothingTitle'), t('plannerPage.magic.nothingBody'));
        return;
      }
      setTab('ai');
      if (parsed.destination) setAiDest(parsed.destination);
      if (parsed.budget)      setAiBalance(Math.min(50000, Math.max(100, Math.round(parsed.budget))));
      if (parsed.days)        setAiDays(Math.min(21, Math.max(1, Math.round(parsed.days))));
      if (parsed.startDate)   { setAiStart(parsed.startDate); setAiReturn(''); }
      if (parsed.budgetStyle === 'luxury' && !parsed.destination) setAiVibe('luxury');
      setHeroWish('');
      toast.success(t('plannerPage.magic.filledTitle'), t('plannerPage.magic.filledBody'));
      setTimeout(() => searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    } catch {
      toast.error(t('plannerPage.magic.failTitle'), t('plannerPage.magic.failBody'));
    } finally {
      setHeroWishLoading(false);
    }
  };

  // Two-way sync for the AI tab (departure ↔ return ↔ days)
  const aiSync = useDateDaysSync({
    departure: aiStart, returnDate: aiReturn, days: aiDays,
    setDeparture: setAiStart, setReturn: setAiReturn, setDays: setAiDays,
  });

  const openFlights = (to, from = `${ORIGIN.city} (${ORIGIN.code})`) =>
    navigate('/flights', { state: { formData: { from, to, date: '', returnDate: '' } } });

  const submit = (e) => {
    e?.preventDefault?.();
    if (tab === 'flights') {
      navigate('/flights', {
        state: {
          formData: {
            from: flightFrom,
            to: flightTo,
            date: flightDate,
            returnDate: flightReturn,
          },
        },
      });
      return;
    }

    // AI tab — clamp values so the API never gets garbage
    const rawBalance = Number(aiBalance);
    const rawDays    = Number(aiDays);
    const balance    = Number.isFinite(rawBalance) && rawBalance >= 100
      ? Math.min(50000, rawBalance)
      : 2000;
    const d          = Number.isFinite(rawDays) && rawDays > 0
      ? Math.min(21, Math.max(1, Math.round(rawDays)))
      : 7;
    const trimmedDest = (aiDest || '').trim().replace(/\s+/g, ' ');
    const trimmedFrom = (aiFrom || '').trim() || ORIGIN.city;

    if (trimmedDest.length < 2) {
      toast.info(t('homePage.search.needDestTitle'), t('homePage.search.needDestBody'));
      return;
    }

    // Params go via both router state AND URL query so refresh / share still works.
    const item = {
      id: `direct-${Date.now()}`,
      name: `${d}${t('homePage.itemNameDayTripTo')}${trimmedDest}`,
      destination: trimmedDest,
      duration: d,
      price: balance,
      category: 'standard',
      image: heroFor(trimmedDest),
      description: `${t('homePage.itemDescA')}${d}${t('homePage.itemDescPlanFor')}${trimmedDest}${t('homePage.itemDescOnBudget')}$${balance}${t('homePage.itemDescBudgetSuffix')}`,
    };
    const qs = new URLSearchParams({
      to:      trimmedDest,
      days:    String(d),
      balance: String(balance),
      from:    trimmedFrom,
      ...(aiStart  ? { start:  aiStart }  : {}),
      ...(aiReturn ? { return: aiReturn } : {}),
    });
    navigate(`/trip-plan?${qs.toString()}`, {
      state: {
        item, type: 'package',
        fromCity: trimmedFrom,
        startDate: aiStart || '',
        returnDate: aiReturn || '',
        purpose: t('homePage.tripPurpose'),
      },
    });
  };

  const promises = [
    { icon: BadgePercent, title: t('homePage.promise.f1t'), body: t('homePage.promise.f1b') },
    { icon: Sparkles,     title: t('homePage.promise.f2t'), body: t('homePage.promise.f2b') },
    { icon: Stamp,        title: t('homePage.promise.f3t'), body: t('homePage.promise.f3b') },
    { icon: FileText,     title: t('homePage.promise.f4t'), body: t('homePage.promise.f4b') },
  ];

  const countries = [...new Set(ALL_CITIES.map(c => c.country))];

  return (
    <div className="min-h-screen bg-white -mt-[64px]">

      {/* ─── HERO ─────────────────────────────────────────────────
          Short brand band, headline, and the one thing that is ours
          alone: describe the trip in words and the AI fills the form. */}
      <section className="relative bg-[#1c2127] pt-[120px] pb-[120px] md:pb-[128px] overflow-hidden">
        <div aria-hidden="true"
          className="absolute inset-0 opacity-[0.22] bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1800&q=80")' }} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#1c2127]/70 via-[#1c2127]/85 to-[#1c2127]" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}>
            <h1 className="text-[clamp(30px,5.2vw,52px)] font-black tracking-[-0.035em] leading-[1.06] max-w-3xl">
              {t('homePage.hero.titleLead')}{' '}
              <span className="text-[#61d1bf]">{t('homePage.hero.titleHighlight')}</span>, {t('homePage.hero.titleTail')}
            </h1>
            <p className="mt-3 text-[15px] md:text-[17px] text-white/70 font-medium max-w-xl">
              {t('homePage.hero.subtitle')}
            </p>

            {isGrokAvailable() && (
              <div className="mt-7 max-w-2xl">
                <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white/45 mb-2">
                  <Wand2 className="w-3.5 h-3.5 text-[#61d1bf]" /> {t('homePage.wish.eyebrow')}
                </p>
                <div className="flex gap-2 p-1.5 rounded-xl bg-white/10 border border-white/20 focus-within:border-white/45 transition">
                  <input
                    value={heroWish}
                    onChange={(e) => setHeroWish(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleHeroWish(); }}
                    placeholder={t('plannerPage.magic.placeholder')}
                    disabled={heroWishLoading}
                    className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-[14px] font-semibold text-white placeholder:text-white/40 outline-none disabled:opacity-50"
                  />
                  <button type="button" onClick={handleHeroWish} disabled={heroWishLoading || !heroWish.trim()}
                    className="shrink-0 px-4 sm:px-5 py-2.5 rounded-lg bg-[#00a58e] hover:bg-[#009882] text-white text-[13px] font-black flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50">
                    {heroWishLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span className="hidden sm:inline">{heroWishLoading ? t('plannerPage.magic.working') : t('plannerPage.magic.button')}</span>
                  </button>
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/35">{t('homePage.wish.tryLabel')}</span>
                  {['ex1', 'ex2', 'ex3', 'ex4'].map((k) => (
                    <button key={k} type="button" onClick={() => setHeroWish(t(`homePage.wish.${k}`))}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/75 border border-white/15 hover:bg-white/20 hover:text-white transition active:scale-95">
                      {t(`homePage.wish.${k}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── SEARCH ────────────────────────────────────────────────
          Sits across the seam between the band and the page, the way
          every flight search does. Two tabs only: book a seat, or let
          the AI build the whole trip. */}
      <div ref={searchCardRef} className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 -mt-[86px] md:-mt-[92px]">
        <div className="bg-white rounded-2xl border border-[#dfe7ec] shadow-[0_10px_36px_-12px_rgba(16,24,40,0.22)]">
          <div className="flex items-center gap-1.5 p-2 border-b border-[#e8edf1] overflow-x-auto">
            <TabPill active={tab === 'flights'} onClick={() => setTab('flights')}
              icon={<Plane className="w-4 h-4" />} label={t('homePage.tabs.flights')} />
            <TabPill active={tab === 'ai'} onClick={() => setTab('ai')}
              icon={<Sparkles className="w-4 h-4" />} label={t('homePage.tabs.ai')} badge={t('homePage.tabs.newBadge')} />
            {/* Sits in the row right after AI Trip, not pushed to the far edge —
                it's a third way into a trip, so it belongs beside the other two.
                Tinted rather than dark because it leaves the page instead of
                switching the form. */}
            <button type="button" onClick={() => navigate('/antarctica')}
              className="shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap bg-[#eaf6fb] text-[#0172cb] hover:bg-[#d6ebfb] transition active:scale-95">
              <Snowflake className="w-4 h-4 text-[#4aa3c0]" /> Antarctica
            </button>
          </div>

          <form onSubmit={submit} className="p-3 md:p-4">
            {tab === 'flights' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <CityAutocomplete
                  className="md:col-span-3"
                  icon={<MapPin className="w-4 h-4" />}
                  label={t('homePage.search.from')}
                  placeholder="Tashkent (TAS)"
                  value={flightFrom}
                  onChange={setFlightFrom}
                />
                <button type="button" onClick={() => { const tmp = flightFrom; setFlightFrom(flightTo); setFlightTo(tmp); }}
                  className="md:col-span-1 flex items-center justify-center self-center mx-auto md:mx-0 w-9 h-9 rounded-full border border-[#dfe7ec] text-[#0172cb] hover:border-[#0172cb] hover:bg-[#e8f4fd] active:scale-95 transition"
                  aria-label={t('homePage.search.swap')}>
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <CityAutocomplete
                  className="md:col-span-3"
                  icon={<MapPin className="w-4 h-4" />}
                  label={t('homePage.search.to')}
                  placeholder="Dubai (DXB)"
                  value={flightTo}
                  onChange={setFlightTo}
                />
                <Field className="md:col-span-2" icon={<Calendar className="w-4 h-4" />} label={t('homePage.search.depart')}
                  type="date" min={new Date().toISOString().split('T')[0]} value={flightDate} onChange={setFlightDate} />
                <Field className="md:col-span-2" icon={<Calendar className="w-4 h-4" />} label={t('homePage.search.return')}
                  type="date" min={flightDate || new Date().toISOString().split('T')[0]} value={flightReturn} onChange={setFlightReturn} />
                <SubmitButton className="md:col-span-1" label={t('homePage.common.search')} />
              </div>
            )}

            {tab === 'ai' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <CityAutocomplete
                    className="md:col-span-5"
                    icon={<MapPin className="w-4 h-4" />}
                    label={t('homePage.search.whereTo')}
                    placeholder="Berlin, Dubai, Tokyo…"
                    value={aiDest}
                    onChange={setAiDest}
                  />
                  <CityAutocomplete
                    className="md:col-span-3"
                    icon={<Plane className="w-4 h-4" />}
                    label={t('homePage.search.from')}
                    placeholder="Tashkent"
                    value={aiFrom}
                    onChange={setAiFrom}
                  />
                  <Field className="md:col-span-2" icon={<Calendar className="w-4 h-4" />} label={t('homePage.search.depart')}
                    type="date" min={new Date().toISOString().split('T')[0]} value={aiStart} onChange={aiSync.onChangeDeparture} />
                  <Field className="md:col-span-2" icon={<Calendar className="w-4 h-4" />} label={t('homePage.search.return')}
                    type="date" min={aiStart || new Date().toISOString().split('T')[0]} value={aiSync.returnDate} onChange={aiSync.onChangeReturn} />
                </div>

                <div className="px-1">
                  <button type="button" onClick={useMyLocationForAi} disabled={locatingFrom}
                    className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#0172cb] hover:text-[#252a31] disabled:opacity-60 transition active:scale-95">
                    {locatingFrom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    {locatingFrom ? t('tripRec.locating') : t('tripRec.useLocation')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <Field className="md:col-span-4" icon={<Wallet className="w-4 h-4" />} label={t('homePage.search.balance')}
                    type="number" placeholder="2000" value={aiBalance} onChange={setAiBalance} />
                  <Field className="md:col-span-2" icon={<Calendar className="w-4 h-4" />} label={t('homePage.search.days')}
                    type="number" placeholder="7" value={aiDays} onChange={aiSync.onChangeDays} />
                  {!aiDest ? (
                    <label className="md:col-span-5 block border border-[#dfe7ec] hover:border-[#0172cb] focus-within:border-[#0172cb] bg-white rounded-xl px-3 py-2.5 transition">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">
                        <Compass className="w-4 h-4 text-[#0172cb]" />{t('homePage.search.vibeLabel')}
                      </div>
                      <select value={aiVibe} onChange={e => setAiVibe(e.target.value)}
                        className="w-full bg-transparent outline-none text-[14px] font-bold text-[#252a31] cursor-pointer">
                        <option value="any">{t('homePage.vibes.any')}</option>
                        <option value="warm">{t('homePage.vibes.warm')}</option>
                        <option value="beach">{t('homePage.vibes.beach')}</option>
                        <option value="city">{t('homePage.vibes.city')}</option>
                        <option value="cultural">{t('homePage.vibes.cultural')}</option>
                        <option value="nature">{t('homePage.vibes.nature')}</option>
                        <option value="luxury">{t('homePage.vibes.luxury')}</option>
                      </select>
                    </label>
                  ) : (
                    <div className="md:col-span-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#e9f3ea] border border-[#cfe3d2]">
                      <Sparkles className="w-4 h-4 text-[#2e7d4f] shrink-0" />
                      <span className="text-[12px] font-bold text-[#2e7d4f] leading-snug">
                        {t('homePage.search.directModePre')}{aiDays}{t('homePage.search.directModePost')} <strong>{aiDest.split(',')[0]}</strong>
                      </span>
                    </div>
                  )}
                  <SubmitButton className="md:col-span-1" icon={<Wand2 className="w-5 h-5" />} label={t('homePage.common.search')} />
                </div>

                <div className="flex items-center flex-wrap gap-1.5 pt-0.5 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#697d95]">{t('homePage.search.quickDays')}</span>
                  {[3, 5, 7, 10, 14].map(n => (
                    <button key={n} type="button" onClick={() => aiSync.onChangeDays(n)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black transition ${Number(aiDays) === n ? 'bg-[#252a31] text-white' : 'bg-[#eef2f5] text-[#0172cb] hover:bg-[#e8f4fd]'}`}>
                      {n}{t('homePage.search.daySuffix')}
                    </button>
                  ))}
                </div>

                <BudgetAdvisory balance={aiBalance} className="mt-1" />
              </div>
            )}

            {/* Quick picks — fills the destination field of the current tab */}
            <div className="flex items-center flex-wrap gap-1.5 pt-3 px-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">{t('homePage.search.popular')}</span>
              {DESTINATIONS.slice(0, 6).map(d => {
                const value = tab === 'ai' ? d.city : `${d.city} (${d.code})`;
                const active = (tab === 'ai' ? aiDest : flightTo) === value;
                return (
                  <button key={d.city} type="button"
                    onClick={() => (tab === 'ai' ? setAiDest(value) : setFlightTo(value))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                      active ? 'bg-[#252a31] text-white' : 'bg-[#eef2f5] text-[#0172cb] hover:bg-[#e8f4fd]'
                    }`}>
                    {d.city}
                  </button>
                );
              })}
            </div>
          </form>

          {(tab === 'ai' && aiDest) || (tab === 'flights' && flightTo) ? (
            <div className="border-t border-[#e8edf1] px-3 py-2">
              <WeatherWidget city={tab === 'ai' ? aiDest : flightTo} />
            </div>
          ) : null}
        </div>
      </div>

      {/* ─── ANTARCTICA — sits directly under the search card so the two
           things that are ours alone, AI Trip and the expedition, read as
           one pair before the generic booking sections start. ───────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-10">
        <div onClick={() => navigate('/antarctica')}
          className="group relative overflow-hidden rounded-2xl cursor-pointer border border-[#dfe7ec]">
          <img
            src="https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=1800&q=80"
            alt="Antarctica" loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1620]/95 via-[#0d1620]/75 to-[#0d1620]/25" />
          <div className="relative p-6 md:p-10 max-w-2xl text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10.5px] font-black uppercase tracking-[0.14em] mb-4">
              <Snowflake className="w-3.5 h-3.5 text-[#7cc4d9]" /> {t('homePage.antarctica.eyebrow')}
            </div>
            <h2 className="text-[26px] md:text-[38px] font-black tracking-[-0.03em] leading-[1.05] mb-3">
              {t('homePage.antarctica.title1')} <span className="text-[#7cc4d9]">{t('homePage.antarctica.title2')}</span>
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/75 font-medium max-w-lg mb-5">
              {t('homePage.antarctica.sub')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[t('homePage.antarctica.statContinent'), t('homePage.antarctica.statSeason')].map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-[11.5px] font-bold text-[#cfeaf4]">{s}</span>
              ))}
              <span className="px-3 py-1.5 rounded-full bg-[#00a58e]/20 border border-[#00a58e]/40 text-[11.5px] font-black text-[#61d1bf]">
                {t('homePage.antarctica.statFrom')} <Price amount={8990} />
              </span>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00a58e] group-hover:bg-[#009882] text-white text-[13.5px] font-black transition">
              <Snowflake className="w-4 h-4" /> {t('homePage.antarctica.cta')} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </section>
      {/* ─── WHAT YOU GET ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#252a31]">{t('homePage.promise.heading')}</h2>
        <p className="text-[14px] text-[#4a5867] font-medium mt-1 mb-6 max-w-2xl">{t('homePage.promise.sub')}</p>
        {/* Alternating 2:1 / 1:2 rhythm — four equal boxes in a line read as a
            spec sheet; this reads as four separate promises. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promises.map((p, i) => {
            const wide = i === 0 || i === 3;
            return (
              <div key={i}
                className={`bg-white border border-[#dfe7ec] rounded-xl p-4 md:p-5 flex gap-3.5 ${
                  wide ? 'md:col-span-2 items-start' : 'flex-col'
                }`}>
                <div className={`rounded-lg bg-[#e6f6f3] text-[#008f77] flex items-center justify-center shrink-0 ${
                  wide ? 'w-11 h-11' : 'w-9 h-9 mb-1'
                }`}>
                  <p.icon className={wide ? 'w-5 h-5' : 'w-4 h-4'} />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-black text-[#252a31] leading-snug mb-1 ${wide ? 'text-[16px]' : 'text-[14px]'}`}>{p.title}</h3>
                  <p className="text-[12.5px] text-[#4a5867] font-medium leading-relaxed">{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── POPULAR DESTINATIONS ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#252a31]">
              {t('homePage.popularDest.heading')} {ORIGIN.city}
            </h2>
            <p className="text-[14px] text-[#4a5867] font-medium mt-1">{t('homePage.popularDest.sub')}</p>
          </div>
        </div>
        {/* Mosaic, not a grid of clones: the cheapest route gets a 2×2 tile and
            one mid-row tile goes double-wide, so the block has a reading order
            instead of eight equal rectangles. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[164px] md:auto-rows-[186px] gap-3">
          {DESTINATIONS.map((d, i) => {
            const anchor = i === 0;
            const wide   = i === 5;
            return (
              <motion.button
                key={d.city}
                type="button"
                onClick={() => openFlights(`${d.city} (${d.code})`)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: (i % 4) * 0.04 }}
                className={`group relative overflow-hidden rounded-xl border border-[#dfe7ec] bg-[#eef2f5] text-left transition hover:border-[#0172cb] ${
                  anchor ? 'col-span-2 row-span-2' : wide ? 'col-span-2' : ''
                }`}>
                <SmartImage src={d.img} alt={d.city} wrapperClassName="absolute inset-0"
                  className="group-hover:scale-105 transition-transform duration-500" />
                <div aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4 text-white">
                  <div className={`font-black leading-tight ${anchor ? 'text-[24px] md:text-[30px]' : 'text-[15px]'}`}>{d.city}</div>
                  <div className={`font-semibold text-white/70 ${anchor ? 'text-[13px]' : 'text-[11.5px]'}`}>{d.country}</div>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11.5px] font-black text-[#252a31] group-hover:bg-[#0172cb] group-hover:text-white transition-colors">
                    <Plane className="w-3 h-3" /> {t('homePage.common.from')} <Price amount={d.from} />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>


      {/* ─── POPULAR FLIGHTS ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-[22px] md:text-[28px] font-black tracking-[-0.02em] text-[#252a31]">{t('homePage.popularFlights.heading')}</h2>
        <p className="text-[14px] text-[#4a5867] font-medium mt-1 mb-5">{t('homePage.popularFlights.sub')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_CITIES.map(d => (
            <button key={d.city} type="button" onClick={() => openFlights(`${d.city} (${d.code})`)}
              className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#dfe7ec] bg-white hover:border-[#0172cb] transition text-left">
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#252a31] truncate">
                  {ORIGIN.city} <span className="text-[#697d95]">→</span> {d.city}
                </span>
                <span className="block text-[11.5px] text-[#697d95] font-semibold">{d.country}</span>
              </span>
              <span className="shrink-0 flex items-center gap-1 text-[13px] font-black text-[#0172cb]">
                <Price amount={d.from} />
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── EXPLORE LINKS ─────────────────────────────────────── */}
      <section className="border-t border-[#e8edf1] bg-[#f5f7f9]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <h2 className="text-[18px] md:text-[22px] font-black tracking-[-0.02em] text-[#252a31] mb-6">{t('homePage.explore.heading')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#697d95] mb-3">{t('homePage.explore.cities')}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ALL_CITIES.map(d => (
                  <button key={d.city} type="button" onClick={() => openFlights(`${d.city} (${d.code})`)}
                    className="text-[13px] font-semibold text-[#4a5867] hover:text-[#0172cb] hover:underline transition">
                    {t('homePage.explore.flightsTo')} {d.city}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#697d95] mb-3">{t('homePage.explore.countries')}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {countries.map(c => {
                  const first = ALL_CITIES.find(d => d.country === c);
                  return (
                    <button key={c} type="button" onClick={() => openFlights(`${first.city} (${first.code})`)}
                      className="text-[13px] font-semibold text-[#4a5867] hover:text-[#0172cb] hover:underline transition">
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ── Reusable subcomponents ───────────────────────────────────────── */

const TabPill = ({ active, onClick, icon, label, badge }) => (
  <button type="button" onClick={onClick}
    className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition active:scale-95 ${
      active ? 'bg-[#252a31] text-white' : 'text-[#4a5867] hover:bg-[#eef2f5]'
    }`}>
    {icon}{label}
    {badge && !active && (
      <span className="ml-0.5 px-1.5 py-0.5 rounded bg-[#00a58e] text-white text-[9px] font-black uppercase">{badge}</span>
    )}
  </button>
);

const Field = ({ icon, label, placeholder, type = 'text', value, onChange, className = '', min }) => (
  <label className={`block border border-[#dfe7ec] hover:border-[#0172cb] focus-within:border-[#0172cb] bg-white rounded-xl px-3 py-2.5 transition ${className}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">
      <span className="text-[#0172cb]">{icon}</span>{label}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      min={min}
      onChange={e => onChange?.(e.target.value)}
      className="w-full bg-transparent outline-none text-[14px] font-bold text-[#252a31] placeholder:text-[#94a3af]"
    />
  </label>
);

const SubmitButton = ({ className = '', icon, label }) => (
  <button type="submit"
    className={`flex items-center justify-center gap-2 bg-[#0172cb] hover:bg-[#015aa3] text-white font-black text-[14px] rounded-xl py-3 px-5 transition active:scale-95 ${className}`}>
    {icon || <Search className="w-5 h-5" />}
    <span className="md:hidden">{label}</span>
  </button>
);

export default Home;
