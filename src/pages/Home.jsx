import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, Search, MapPin, Calendar, Users, ArrowRight, ArrowRightLeft,
  Flame, Sparkles, Star, Shield, Headphones, BadgePercent, Globe,
  TrendingUp, Heart, Mountain, Waves, Building2, Compass, Clock, Wand2, Wallet,
  ChevronRight, Award, ThumbsUp, Check, Mail, FileText, Download,
  FileCheck, ShieldCheck, Wifi, Car, Navigation, Loader2, LayoutGrid, X,
} from 'lucide-react';
import useAdminStore from '../store/useAdminStore';
import { useTranslation } from '../store/useLangStore';
import useWishlistStore from '../store/useWishlistStore';
import useSEO from '../hooks/useSEO';
import { useDateDaysSync } from '../hooks/useDateDaysSync';
import { handleImgError } from '../utils/imageFallback';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';
import Price from '../components/Price';
import BudgetAdvisory from '../components/BudgetAdvisory';
import CityAutocomplete from '../features/flights/CityAutocomplete';
import WeatherWidget from '../components/WeatherWidget';
import DestinationMap from '../components/DestinationMap';
import RecommendedTrips from '../components/RecommendedTrips';
import { detectCurrentLocation } from '../services/geolocation';

/* ── Static showcases ─────────────────────────────────────────────── */
const TRENDING = [
  { city: 'Dubai',     country: 'UAE',         from: 280, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
  { city: 'Bali',      country: 'Indonesia',   from: 540, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
  { city: 'Istanbul',  country: 'Turkey',      from: 220, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80' },
  { city: 'Tokyo',     country: 'Japan',       from: 680, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80' },
  { city: 'Maldives',  country: 'Maldives',    from: 920, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80' },
  { city: 'Paris',     country: 'France',      from: 410, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80' },
  { city: 'Bangkok',   country: 'Thailand',    from: 380, img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80' },
  { city: 'Barcelona', country: 'Spain',       from: 360, img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80' },
  { city: 'Antarctica',country: 'White Continent', from: 4200, img: 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?auto=format&fit=crop&w=900&q=80' },
  { city: 'Rome',      country: 'Italy',       from: 340, img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80' },
  { city: 'London',    country: 'United Kingdom', from: 450, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80' },
  { city: 'Singapore', country: 'Singapore',   from: 610, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80' },
];

const THEMES = [
  { id: 'beach',    labelKey: 'themes.beach',     icon: Waves,    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80' },
  { id: 'city',     labelKey: 'themes.city',      icon: Building2,img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=700&q=80' },
  { id: 'mountain', labelKey: 'themes.mountain', icon: Mountain, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80' },
  { id: 'culture',  labelKey: 'themes.culture',  icon: Globe,    img: 'https://images.unsplash.com/photo-1539020140153-e479b8c7d486?auto=format&fit=crop&w=700&q=80' },
  { id: 'family',   labelKey: 'themes.family',    icon: Heart,    img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=700&q=80' },
  { id: 'luxury',   labelKey: 'themes.luxury',    icon: Award,    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=700&q=80' },
];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSEO({
    title: t('homePage.seo.title'),
    description: t('homePage.seo.description'),
    url: 'https://maftravel.com',
    keywords: ['cheap flights', 'tour packages', 'hot tours', 'AI trip planner', 'budget travel', 'booking', 'kiwi'],
  });

  const packages = useAdminStore(s => s.packages);
  const toggleWishlist = useWishlistStore(s => s.toggleWishlist);
  const isInWishlist   = useWishlistStore(s => s.isInWishlist);

  const featured = useMemo(() => packages.filter(p => p.featured).slice(0, 4), [packages]);
  const allPackages = useMemo(() => packages.slice(0, 8), [packages]);

  // search widget state
  const [tab, setTab]         = useState('tours');
  const [servicesOpen, setServicesOpen] = useState(false);
  const [dest, setDest]       = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [travelers, setTravelers] = useState(2);
  // flights tab state
  const [flightFrom, setFlightFrom]       = useState('');
  const [flightTo, setFlightTo]           = useState('');
  const [flightDate, setFlightDate]       = useState('');
  const [flightReturn, setFlightReturn]   = useState('');
  // dedicated AI-tab state — keeps it isolated from the flight/tour fields
  const [aiBalance, setAiBalance] = useState(2000);
  const [aiDays,    setAiDays]    = useState(7);
  const [aiVibe,    setAiVibe]    = useState('any');
  const [aiDest,    setAiDest]    = useState('');
  const [aiFrom,    setAiFrom]    = useState('Dubai');
  const [aiStart,   setAiStart]   = useState('');
  const [aiReturn,  setAiReturn]  = useState('');
  const [locatingFrom, setLocatingFrom] = useState(false);

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

  // Two-way sync for the AI tab (departure ↔ return ↔ days)
  const aiSync = useDateDaysSync({
    departure: aiStart, returnDate: aiReturn, days: aiDays,
    setDeparture: setAiStart, setReturn: setAiReturn, setDays: setAiDays,
  });

  // Two-way sync for the Tours tab (uses `checkin` as departure, `checkout` as return)
  const [toursDays, setToursDays] = useState(7);
  const toursSync = useDateDaysSync({
    departure: checkin, returnDate: checkout, days: toursDays,
    setDeparture: setCheckin, setReturn: setCheckout, setDays: setToursDays,
  });

  const submit = (e) => {
    e?.preventDefault?.();
    if (tab === 'tours') navigate('/hot-tours');
    else if (tab === 'flights') {
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
    } else if (tab === 'ai') {
      // Clamp values so the API never gets garbage
      const rawBalance = Number(aiBalance);
      const rawDays    = Number(aiDays);
      const balance    = Number.isFinite(rawBalance) && rawBalance >= 100
        ? Math.min(50000, rawBalance)
        : 2000;
      const d          = Number.isFinite(rawDays) && rawDays > 0
        ? Math.min(21, Math.max(1, Math.round(rawDays)))
        : 7;
      const trimmedDest = (aiDest || '').trim().replace(/\s+/g, ' ');
      const trimmedFrom = (aiFrom || '').trim() || 'Dubai';

      // If user provided a destination → go straight to the full Berlin-style trip plan,
      // and pass params via both router state AND URL query so refresh / share still works.
      if (trimmedDest.length > 1) {
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
        return;
      }

      // No destination → 4-package picker on /hot-tours
      navigate(`/hot-tours?balance=${balance}&days=${d}&vibe=${encodeURIComponent(aiVibe || 'any')}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ed] -mt-[64px]">

      {/* ─── HERO + SEARCH (Editorial luxe) ───────────────────── */}
      <section className="relative aurora-bg pt-[100px] pb-32 md:pb-40 overflow-hidden">
        {/* destination photograph, warm-graded for an editorial travel-journal feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.16] mix-blend-soft-light"
             style={{ backgroundImage:'url("https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1800&q=80")', backgroundSize:'cover', backgroundPosition:'center', filter:'saturate(1.15) sepia(0.12)' }} />
        <div className="film-grain" />
        <div className="pattern-lux" />
        <div className="absolute inset-0 sheen-top pointer-events-none" />
        <div className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-[#0071c2]/30 blur-3xl pointer-events-none animate-float" />
        <div className="absolute -right-24 -bottom-10 w-80 h-80 rounded-full bg-[#febb02]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-white max-w-3xl">
            <div className="badge-editorial px-4 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-[0.16em] mb-7">
              <Sparkles className="w-3.5 h-3.5 text-[#ffd76e]" /> {t('homePage.hero.badge')}
            </div>
            <h1 className="font-display text-[46px] md:text-[76px] font-semibold tracking-[-0.035em] leading-[0.98] mb-5 [text-shadow:0_2px_30px_rgba(0,0,0,0.30)]">
              {t('homePage.hero.titleLead')} <span className="italic font-medium text-gradient-gold">{t('homePage.hero.titleHighlight')}</span>,<br className="hidden md:block" /> {t('homePage.hero.titleTail')}
            </h1>
            <p className="text-[15px] md:text-[19px] text-white/75 font-medium max-w-xl mb-8 leading-relaxed">
              {t('homePage.hero.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Floating Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          className="relative max-w-6xl mx-auto px-4 md:px-8 -mb-24 md:-mb-28">
          {/* ambient gold glow behind the card */}
          <div className="absolute inset-x-8 md:inset-x-12 -top-6 bottom-0 bg-gradient-to-b from-[#febb02]/35 via-[#febb02]/12 to-transparent rounded-[28px] blur-2xl pointer-events-none" aria-hidden="true" />
          <div className="frame-lux relative bg-white rounded-2xl shadow-lift">
            <div className="flex items-center gap-1 px-2 pt-2 overflow-x-auto">
              <Tab active={tab === 'tours'}    onClick={() => setTab('tours')}    icon={<Plane className="w-4 h-4" />} label={t('homePage.tabs.tours')} />
              <Tab active={tab === 'flights'} onClick={() => setTab('flights')} icon={<Globe className="w-4 h-4" />} label={t('homePage.tabs.flights')} />
              <Tab active={tab === 'ai'}       onClick={() => setTab('ai')}       icon={<Sparkles className="w-4 h-4" />} label={t('homePage.tabs.ai')} highlight newLabel={t('homePage.tabs.newBadge')} />
              <button type="button" onClick={() => setServicesOpen(true)}
                className="ml-auto shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[13px] font-black whitespace-nowrap transition text-[#5c5245] hover:bg-[#f0f5ff] hover:text-[#0071c2]">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{t('homePage.tabs.services')}</span>
              </button>
            </div>

            <form onSubmit={submit} className="p-3 md:p-4">
              {tab === 'tours' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1">
                  <CityAutocomplete
                    className="md:col-span-4"
                    icon={<MapPin className="w-4 h-4" />}
                    label={t('homePage.search.whereTo')}
                    placeholder="Dubai, Bali, Maldives…"
                    value={dest}
                    onChange={setDest}
                  />
                  <SearchInput
                    className="md:col-span-3"
                    icon={<Calendar className="w-4 h-4" />}
                    label={t('homePage.search.depart')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={checkin}
                    onChange={toursSync.onChangeDeparture}
                  />
                  <SearchInput
                    className="md:col-span-3"
                    icon={<Calendar className="w-4 h-4" />}
                    label={t('homePage.search.return')}
                    type="date"
                    min={checkin || new Date().toISOString().split('T')[0]}
                    value={toursSync.returnDate}
                    onChange={toursSync.onChangeReturn}
                  />
                  <SearchInput
                    className="md:col-span-1"
                    icon={<Users className="w-4 h-4" />}
                    label={t('homePage.search.pax')}
                    type="number"
                    value={travelers}
                    onChange={setTravelers}
                  />
                  <SearchButton className="md:col-span-1" label={t('homePage.common.search')} />
                </div>
              )}

              {tab === 'flights' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1">
                  <CityAutocomplete
                    className="md:col-span-3"
                    icon={<MapPin className="w-4 h-4" />}
                    label={t('homePage.search.from')}
                    placeholder="Dubai (DXB)"
                    value={flightFrom}
                    onChange={setFlightFrom}
                  />
                  <button type="button" onClick={() => { const tmp = flightFrom; setFlightFrom(flightTo); setFlightTo(tmp); }}
                    className="md:col-span-1 flex items-center justify-center self-center mx-auto md:mx-0 -my-1 md:my-0 w-9 h-9 rounded-full bg-white border-2 border-[#0071c2] text-[#0071c2] hover:bg-[#f0f5ff] hover:rotate-180 active:scale-95 transition-all duration-300 shadow-soft"
                    aria-label="Swap from and to">
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <CityAutocomplete
                    className="md:col-span-3"
                    icon={<MapPin className="w-4 h-4" />}
                    label={t('homePage.search.to')}
                    placeholder="Maldives (MLE)"
                    value={flightTo}
                    onChange={setFlightTo}
                  />
                  <SearchInput
                    className="md:col-span-2"
                    icon={<Calendar className="w-4 h-4" />}
                    label={t('homePage.search.depart')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={flightDate}
                    onChange={setFlightDate}
                  />
                  <SearchInput
                    className="md:col-span-2"
                    icon={<Calendar className="w-4 h-4" />}
                    label={t('homePage.search.return')}
                    type="date"
                    min={flightDate || new Date().toISOString().split('T')[0]}
                    value={flightReturn}
                    onChange={setFlightReturn}
                  />
                  <SearchButton className="md:col-span-1" label={t('homePage.common.search')} />
                </div>
              )}

              {tab === 'ai' && (
                <div className="space-y-2">
                  {/* Row 1: destination + from + start date */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1">
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
                      placeholder="Dubai"
                      value={aiFrom}
                      onChange={setAiFrom}
                    />
                    <SearchInput
                      className="md:col-span-2"
                      icon={<Calendar className="w-4 h-4" />}
                      label={t('homePage.search.depart')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={aiStart}
                      onChange={aiSync.onChangeDeparture}
                    />
                    <SearchInput
                      className="md:col-span-2"
                      icon={<Calendar className="w-4 h-4" />}
                      label={t('homePage.search.return')}
                      type="date"
                      min={aiStart || new Date().toISOString().split('T')[0]}
                      value={aiSync.returnDate}
                      onChange={aiSync.onChangeReturn}
                    />
                  </div>

                  {/* Use my current location → fills the From field */}
                  <div className="px-1">
                    <button type="button" onClick={useMyLocationForAi} disabled={locatingFrom}
                      className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#0071c2] hover:text-[#003580] disabled:opacity-60 transition active:scale-95">
                      {locatingFrom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      {locatingFrom ? t('tripRec.locating') : t('tripRec.useLocation')}
                    </button>
                  </div>

                  {/* Row 2: balance + days + vibe + button */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1">
                    <SearchInput
                      className="md:col-span-4"
                      icon={<Wallet className="w-4 h-4" />}
                      label={t('homePage.search.balance')}
                      placeholder="2000"
                      type="number"
                      value={aiBalance}
                      onChange={setAiBalance}
                    />
                    <SearchInput
                      className="md:col-span-2"
                      icon={<Calendar className="w-4 h-4" />}
                      label={t('homePage.search.days')}
                      type="number"
                      placeholder="7"
                      value={aiDays}
                      onChange={aiSync.onChangeDays}
                    />
                    {!aiDest && (
                      <label className="md:col-span-5 block border-2 border-[#e6dcc3] hover:border-[#0071c2] focus-within:border-[#0071c2] focus-within:ring-2 focus-within:ring-[#0071c2]/15 bg-white rounded-xl px-3 py-2.5 transition">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#93876f] mb-0.5">
                          <Compass className="w-4 h-4 text-[#0071c2]" />{t('homePage.search.vibeLabel')}
                        </div>
                        <select value={aiVibe} onChange={e => setAiVibe(e.target.value)}
                          className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a] cursor-pointer">
                          <option value="any">{t('homePage.vibes.any')}</option>
                          <option value="warm">{t('homePage.vibes.warm')}</option>
                          <option value="beach">{t('homePage.vibes.beach')}</option>
                          <option value="city">{t('homePage.vibes.city')}</option>
                          <option value="cultural">{t('homePage.vibes.cultural')}</option>
                          <option value="nature">{t('homePage.vibes.nature')}</option>
                          <option value="luxury">{t('homePage.vibes.luxury')}</option>
                        </select>
                      </label>
                    )}
                    {aiDest && (
                      <div className="md:col-span-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f0fdf4] border-2 border-[#bbf7d0]">
                        <Sparkles className="w-4 h-4 text-[#008009] shrink-0" />
                        <span className="text-[12px] font-bold text-[#155724] leading-snug">
                          {t('homePage.search.directModePre')}{aiDays}{t('homePage.search.directModePost')} <strong>{aiDest.split(',')[0]}</strong>
                        </span>
                      </div>
                    )}
                    <SearchButton className="md:col-span-1" icon={<Wand2 className="w-4 h-4" />} label={t('homePage.common.search')} />
                  </div>

                  {/* Quick day chips for AI */}
                  <div className="flex items-center flex-wrap gap-1.5 pt-0.5 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#93876f] self-center">{t('homePage.search.quickDays')}</span>
                    {[3, 5, 7, 10, 14].map(n => (
                      <button key={n} type="button" onClick={() => aiSync.onChangeDays(n)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black transition ${Number(aiDays) === n ? 'bg-[#003580] text-white' : 'bg-[#f0f5ff] text-[#0071c2] hover:bg-[#dceaff]'}`}>
                        {n}{t('homePage.search.daySuffix')}
                      </button>
                    ))}
                  </div>

                  {/* Low-budget advisory — appears when balance < $500 */}
                  <BudgetAdvisory balance={aiBalance} className="mt-1" />
                </div>
              )}

              {/* Quick destination chips — fills the destination field of the CURRENT tab, never switches */}
              {tab !== 'flights' && (
                <div className="flex items-center flex-wrap gap-1.5 pt-3 px-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#93876f]">{t('homePage.search.popular')}</span>
                  {['Dubai', 'Bali', 'Istanbul', 'Maldives', 'Tokyo', 'Berlin', 'Paris'].map(c => {
                    const currentValue = tab === 'ai' ? aiDest : dest;
                    const active = String(currentValue || '').toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (tab === 'ai') setAiDest(c);
                          else              setDest(c);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                          active ? 'bg-[#003580] text-white shadow-md' : 'bg-[#f0f5ff] text-[#0071c2] hover:bg-[#dceaff]'
                        }`}
                      >{c}</button>
                    );
                  })}
                </div>
              )}

              {/* Quick flight routes for flights tab */}
              {tab === 'flights' && (
                <div className="flex items-center flex-wrap gap-1.5 pt-3 px-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#93876f]">{t('homePage.search.popular')}</span>
                  {[
                    { from: 'Dubai (DXB)', to: 'Maldives (MLE)', label: 'DXB → MLE' },
                    { from: 'Dubai (DXB)', to: 'Bali (DPS)', label: 'DXB → DPS' },
                    { from: 'Abu Dhabi (AUH)', to: 'Seychelles (SEZ)', label: 'AUH → SEZ' },
                    { from: 'Istanbul (IST)', to: 'Mauritius (MRU)', label: 'IST → MRU' },
                    { from: 'Dubai (DXB)', to: 'Phuket (HKT)', label: 'DXB → HKT' },
                  ].map(r => {
                    const active = flightFrom === r.from && flightTo === r.to;
                    return (
                      <button key={r.label} type="button"
                        onClick={() => { setFlightFrom(r.from); setFlightTo(r.to); }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition active:scale-95 ${
                          active ? 'bg-[#003580] text-white shadow-md' : 'bg-[#f0f5ff] text-[#0071c2] hover:bg-[#dceaff]'
                        }`}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            {(tab === 'ai' && aiDest) || (tab === 'tours' && dest) || (tab === 'flights' && flightTo) ? (
              <div className="border-t border-[#e6dcc3] mt-2 pt-2">
                <WeatherWidget city={tab === 'ai' ? aiDest : dest} />
              </div>
            ) : null}
          </div>
        </motion.div>
      </section>

      {/* spacer for the floating card */}
      <div className="h-24 md:h-28" />

      {/* ─── STATS BAND ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Users,        value: '10,000+', label: t('homeStats.travelers') },
            { icon: Globe,        value: '50+',     label: t('homeStats.countries') },
            { icon: Sparkles,     value: t('homeStats.ai'),     label: t('homeStats.aiSub') },
            { icon: BadgePercent, value: t('homeStats.prices'), label: t('homeStats.pricesSub') },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#00214f] to-[#001427] rounded-2xl shadow-lift p-4 md:p-5 text-center lift">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5b942]/70 to-transparent" />
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-[#febb02]/10 blur-2xl pointer-events-none" />
              <div className="relative w-10 h-10 mx-auto rounded-xl bg-[#f5b942]/12 text-[#ffd76e] flex items-center justify-center mb-2 ring-1 ring-[#f5b942]/25">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="relative font-display text-[24px] md:text-[28px] font-semibold text-gradient-gold leading-none">{s.value}</div>
              <div className="relative text-[11px] md:text-[12px] font-bold text-white/50 mt-1.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TRUST STRIP ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: BadgePercent,  title: t('homePage.trust.bestPriceTitle'), sub: t('homePage.trust.bestPriceSub') },
            { icon: Shield,        title: t('homePage.trust.secureTitle'),    sub: t('homePage.trust.secureSub') },
            { icon: Headphones,    title: t('homePage.trust.supportTitle'),   sub: t('homePage.trust.supportSub') },
            { icon: ThumbsUp,      title: t('homePage.trust.ratingTitle'),    sub: t('homePage.trust.ratingSub') },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="group bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-4 flex items-center gap-3 hover:border-[#0071c2] lift">
              <div className="w-10 h-10 rounded-xl bg-[#f0f5ff] text-[#0071c2] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-black text-[#1a1a1a] truncate">{f.title}</div>
                <div className="text-[11px] font-semibold text-[#93876f] truncate">{f.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── VALUE PROPS: BUDGET + PDF ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: copy + feature cards */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> {t('homePage.valueProps.eyebrow')}
            </div>
            <h2 className="text-2xl md:text-[34px] font-black text-[#1a1a1a] tracking-tight leading-tight mb-2">
              {t('homePage.valueProps.heading')}
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#5c5245] font-medium leading-relaxed mb-6 max-w-xl">
              {t('homePage.valueProps.subtitle')}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-5 lift">
                <div className="w-11 h-11 rounded-xl bg-[#f0f5ff] text-[#0071c2] flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-[#1a1a1a] mb-1.5 leading-snug">{t('homePage.valueProps.budgetTitle')}</h3>
                <p className="text-[13px] text-[#5c5245] font-medium leading-relaxed">{t('homePage.valueProps.budgetBody')}</p>
              </div>
              <div className="bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-5 lift">
                <div className="w-11 h-11 rounded-xl bg-[#fff7e6] text-[#b8860b] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-[#1a1a1a] mb-1.5 leading-snug">{t('homePage.valueProps.pdfTitle')}</h3>
                <p className="text-[13px] text-[#5c5245] font-medium leading-relaxed">{t('homePage.valueProps.pdfBody')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/hot-tours')} className="btn-gold px-6 py-3 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Wand2 className="w-4 h-4" /> {t('homePage.valueProps.ctaPlan')}
              </button>
              <button onClick={() => navigate('/my-plans')} className="px-6 py-3 rounded-xl bg-white border border-[#e6dcc3] hover:border-[#0071c2] text-[#003580] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Download className="w-4 h-4" /> {t('homePage.valueProps.ctaPlans')}
              </button>
            </div>
          </div>

          {/* Right: PDF mockup */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0071c2]/10 to-[#febb02]/10 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-float border border-[#e6dcc3] overflow-hidden">
              <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-float">
                <FileText className="w-3.5 h-3.5" /> {t('homePage.valueProps.pdfBadge')}
              </span>
              <div className="bg-gradient-to-br from-[#001026] via-[#002250] to-[#003580] text-white p-6">
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#febb02] font-black">✦ {t('homePage.valueProps.pdfPreviewBrand')}</div>
                <div className="text-[22px] font-black mt-2 leading-tight">{t('homePage.valueProps.pdfPreviewTitle')}</div>
                <div className="text-[12px] text-white/80 font-semibold mt-1">{t('homePage.valueProps.pdfPreviewMeta')}</div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  t('homePage.valueProps.pdfPreviewLine1'),
                  t('homePage.valueProps.pdfPreviewLine2'),
                  t('homePage.valueProps.pdfPreviewLine3'),
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-[#f0f5ff] text-[#0071c2] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] font-bold text-[#1a1a1a] leading-snug">{line}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="h-2 bg-[#efe6d2] rounded-full w-full mb-2" />
                  <div className="h-2 bg-[#efe6d2] rounded-full w-4/5 mb-2" />
                  <div className="h-2 bg-[#efe6d2] rounded-full w-2/3" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-lux max-w-7xl mx-auto px-4 md:px-8 py-2">
        <span className="text-[#febb02] text-[13px]">◆</span>
      </div>

      {/* ─── HOT TOURS TEASER ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#febb02] text-[11px] font-black uppercase tracking-widest mb-1">
              <Flame className="w-3.5 h-3.5" /> {t('homePage.hotTours.eyebrow')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('homePage.hotTours.heading')}</h2>
          </div>
          <button onClick={() => navigate('/hot-tours')} className="group hidden md:flex items-center gap-1 text-[13px] font-bold text-[#0071c2] hover:underline">
            {t('homePage.hotTours.viewAll')} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p, i) => {
            const discount = [42, 35, 28, 22][i] || 20;
            const original = Math.round(p.price / (1 - discount / 100));
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden border border-[#e6dcc3] shadow-soft lift cursor-pointer"
                onClick={() => navigate('/hot-tours')}
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="absolute top-2.5 left-2.5 bg-[#febb02] text-[#1a1a1a] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float">-{discount}%</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const wasIn = isInWishlist(p.id, 'package');
                      toggleWishlist('package', p);
                      if (wasIn) toast.info(t('homePage.wishlist.removed'), p.name);
                      else       toast.success(t('homePage.wishlist.saved'), p.name);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-float hover:scale-110 active:scale-95 transition"
                    aria-label={isInWishlist(p.id, 'package') ? t('homePage.wishlist.removeAria') : t('homePage.wishlist.saveAria')}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(p.id, 'package') ? 'fill-red-500 text-red-500' : 'text-[#5c5245]'}`} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-[11px] text-[#5c5245] font-bold mb-1">
                    <MapPin className="w-3 h-3 text-[#0071c2]" /> {p.destination}
                  </div>
                  <h3 className="text-[15px] font-black text-[#1a1a1a] mb-1.5 line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#5c5245] mb-3">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#febb02] text-[#febb02]" /> {p.rating}</span>
                    <span>· {p.duration} {t('homePage.common.days')}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[11px] text-[#93876f] line-through font-bold"><Price amount={original} /></div>
                      <div className="text-[18px] font-black text-[#003580]"><Price amount={p.price} /></div>
                    </div>
                    <span className="text-[11px] font-black text-[#0071c2] flex items-center gap-0.5">
                      {t('homePage.common.book')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="md:hidden mt-4 text-center">
          <button onClick={() => navigate('/hot-tours')} className="text-[14px] font-black text-[#0071c2]">{t('homePage.hotTours.viewAllDeals')}</button>
        </div>
      </section>

      {/* ─── AI BUDGET CTA STRIP ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#002250] via-[#0058b1] to-[#0071c2] rounded-3xl p-7 md:p-12 text-white shadow-float">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#febb02]/30 blur-3xl pointer-events-none animate-float" />
          <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-[#0071c2]/40 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
                <Wand2 className="w-3.5 h-3.5" /> {t('homePage.aiCta.badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
                {t('homePage.aiCta.heading')}
              </h2>
              <p className="text-[15px] text-white/85 font-medium mb-6 max-w-md">
                {t('homePage.aiCta.body')}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate('/hot-tours')} className="btn-gold px-6 py-3 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('homePage.aiCta.tryBtn')}
                </button>
                <button onClick={() => navigate('/planner')} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 font-black text-[14px] active:scale-95 transition">
                  {t('homePage.aiCta.sampleBtn')}
                </button>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { icon: Wallet,  label: t('homePage.aiCta.feat1') },
                { icon: Hotel,   label: t('homePage.aiCta.feat2') },
                { icon: Compass, label: t('homePage.aiCta.feat3') },
                { icon: Check,   label: t('homePage.aiCta.feat4') },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                  className="group bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 hover:bg-white/15 hover:border-white/30 transition">
                  <f.icon className="w-5 h-5 text-[#febb02] mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[13px] font-semibold leading-snug">{f.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── RECOMMENDED TRIPS (current location → destination) ──── */}
      <RecommendedTrips />

      {/* ─── TRAVEL SERVICES PROMO ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" /> {t('servicesHome.eyebrow')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('servicesHome.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium max-w-xl mt-1">{t('servicesHome.subtitle')}</p>
          </div>
          <button onClick={() => navigate('/services')} className="group hidden md:flex items-center gap-1 text-[13px] font-bold text-[#0071c2] hover:underline">
            {t('servicesHome.cta')} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: FileCheck,   label: t('servicesPage.visa.title'),     accent: 'bg-[#f0fdf4] text-[#008009]' },
            { icon: Wallet,      label: t('servicesPage.budget.title'),   accent: 'bg-[#f0f5ff] text-[#0071c2]' },
            { icon: Plane,       label: t('servicesPage.flightPredict.title'), accent: 'bg-[#fff7e6] text-[#b8860b]' },
            { icon: Hotel,       label: t('servicesPage.hotelPredict.title'),  accent: 'bg-[#fdf2f8] text-[#be185d]' },
            { icon: ShieldCheck, label: t('servicesPage.insurance.title'), accent: 'bg-[#f0fdf4] text-[#008009]' },
            { icon: Wifi,        label: t('servicesPage.esim.title'),      accent: 'bg-[#f0f5ff] text-[#0071c2]' },
            { icon: Car,         label: t('servicesPage.transfer.title'),  accent: 'bg-[#fff7e6] text-[#b8860b]' },
            { icon: Award,       label: t('servicesPage.lounge.title'),    accent: 'bg-[#f0f5ff] text-[#0071c2]' },
          ].map((s, i) => (
            <motion.button
              key={i}
              onClick={() => navigate('/services')}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: (i % 4) * 0.05 }}
              className="group bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-4 flex items-center gap-3 hover:border-[#0071c2] lift text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-[13px] font-black text-[#1a1a1a] leading-snug">{s.label}</div>
            </motion.button>
          ))}
        </div>
        <div className="md:hidden mt-4 text-center">
          <button onClick={() => navigate('/services')} className="text-[14px] font-black text-[#0071c2]">{t('servicesHome.cta')}</button>
        </div>
      </section>

      {/* ─── TRENDING DESTINATIONS ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> {t('homePage.trending.eyebrow')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('homePage.trending.heading')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {TRENDING.map((d, i) => (
            <motion.button
              key={i}
              onClick={() => navigate('/flights')}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft transition hover:-translate-y-1.5 hover:shadow-lift">
              <SmartImage src={d.img} alt={d.city} wrapperClassName="absolute inset-0" className="group-hover:scale-110 transition-transform duration-[600ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end text-left text-white">
                <div className="text-[16px] md:text-[18px] font-black leading-tight">{d.city}</div>
                <div className="text-[11px] text-white/75 font-semibold mb-1.5">{d.country}</div>
                <div className="text-[11px] inline-flex items-center gap-1 bg-white/95 text-[#003580] font-black px-2 py-0.5 rounded-md w-fit shadow-float group-hover:bg-[#febb02] group-hover:text-[#1a1a1a] transition-colors">
                  <Plane className="w-3 h-3" /> {t('homePage.common.from')} <Price amount={d.from} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ─── DESTINATION MAP ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
              <Globe className="w-3.5 h-3.5" /> {t('homePage.map.eyebrow') || 'Explore'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('homePage.map.heading') || 'Destinations worldwide'}</h2>
          </div>
        </div>
        <DestinationMap destinations={TRENDING} className="shadow-float" />
      </section>

      {/* ─── BROWSE BY THEME ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight mb-1">{t('homePage.themesSection.heading')}</h2>
        <p className="text-[14px] text-[#5c5245] font-medium mb-6">{t('homePage.themesSection.subtitle')}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {THEMES.map((th, i) => (
            <motion.button
              key={th.id}
              onClick={() => navigate('/hot-tours')}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: (i % 6) * 0.04 }}
              className="group bg-white rounded-2xl border border-[#e6dcc3] shadow-soft hover:border-[#0071c2] overflow-hidden lift">
              <div className="aspect-[4/3] overflow-hidden">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-[600ms]" style={{ backgroundImage:`url(${th.img})` }} />
              </div>
              <div className="p-3 flex items-center gap-2">
                <th.icon className="w-4 h-4 text-[#0071c2] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-[13px] font-black text-[#1a1a1a]">{t(`homePage.${th.labelKey}`)}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ─── ALL PACKAGES (Booking.com property cards style) ─────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('homePage.recommended.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium">{t('homePage.recommended.subtitle')}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allPackages.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#e6dcc3] shadow-soft lift group cursor-pointer"
              onClick={() => navigate('/hot-tours')}>
              <div className="relative h-44 overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.featured && <span className="absolute top-2.5 left-2.5 bg-white text-[#0071c2] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float">{t('homePage.recommended.bestseller')}</span>}
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-black text-[#1a1a1a] mb-1 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-[#5c5245] font-semibold mb-2">
                  <MapPin className="w-3 h-3 text-[#0071c2]" /> {p.destination}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5c5245] mb-3">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="bg-[#003580] text-white px-1.5 py-0.5 rounded text-[10px] font-black">{p.rating}</span>
                    <span className="font-bold">{p.rating >= 4.8 ? t('homePage.recommended.exceptional') : t('homePage.recommended.veryGood')}</span>
                    <span className="text-[#93876f]">· {p.reviews} {t('homePage.recommended.reviews')}</span>
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-[#efe6d2] pt-3">
                  <div>
                    <div className="text-[10px] text-[#93876f] font-bold uppercase">{p.duration} {t('homePage.recommended.daysPerPerson')}</div>
                    <div className="text-[20px] font-black text-[#1a1a1a]"><Price amount={p.price} /></div>
                  </div>
                  <span className="text-[12px] font-black text-white bg-[#0071c2] group-hover:bg-[#005fa3] px-3 py-2 rounded-lg transition shadow-soft">{t('homePage.recommended.viewDeal')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── REVIEWS ─────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#e6dcc3]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-[#febb02] mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-[#febb02]" />)}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">{t('homePage.reviews.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium">{t('homePage.reviews.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Aisha R.', city: 'Bishkek', text: t('homePage.reviews.t1'), rating: 5 },
              { name: 'Daniyar K.', city: 'Almaty', text: t('homePage.reviews.t2'), rating: 5 },
              { name: 'Sofia M.', city: 'Tashkent', text: t('homePage.reviews.t3'), rating: 5 },
            ].map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-[#f6f1e4] rounded-2xl border border-[#e6dcc3] shadow-soft p-5 lift">
                <div className="flex items-center gap-1 mb-2 text-[#febb02]">
                  {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#febb02]" />)}
                </div>
                <p className="text-[14px] text-[#1a1a1a] font-medium leading-relaxed mb-3">{r.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#003580] text-white text-[11px] font-black flex items-center justify-center shadow-soft">
                    {r.name.charAt(0)}
                  </div>
                  <div className="text-[12px]">
                    <div className="font-black text-[#1a1a1a]">{r.name}</div>
                    <div className="text-[#93876f] font-semibold">{r.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-[#002250] to-[#003580] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-float">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-[#febb02]/20 blur-3xl pointer-events-none animate-float" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-[#0071c2]/30 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Mail className="w-8 h-8 text-[#febb02] mb-3" />
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{t('homePage.newsletter.heading')}</h2>
              <p className="text-[14px] text-white/80 font-medium">{t('homePage.newsletter.body')}</p>
            </div>
            <form onSubmit={e => { e.preventDefault(); toast.success(t('homePage.newsletter.toastTitle'), t('homePage.newsletter.toastBody')); }}
              className="flex gap-2 bg-white/10 backdrop-blur rounded-xl p-1.5 border border-white/15 focus-within:border-white/40 transition">
              <input type="email" required placeholder="you@email.com" className="flex-1 bg-transparent px-3 py-3 text-[14px] font-bold placeholder:text-white/50 outline-none" />
              <button className="btn-gold px-5 py-3 rounded-lg text-[#1a1a1a] font-black text-[13px] uppercase tracking-wider">
                {t('homePage.newsletter.subscribe')}
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      <ServicesDrawer open={servicesOpen} onClose={() => setServicesOpen(false)} t={t} navigate={navigate} />
    </div>
  );
};

/* ── Reusable subcomponents ───────────────────────────────────────── */
const Tab = ({ active, onClick, icon, label, highlight, newLabel }) => (
  <button type="button" onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[13px] font-black whitespace-nowrap transition active:scale-95 ${
      active
        ? 'bg-white text-[#003580] shadow-[0_-3px_0_#0071c2_inset]'
        : 'text-[#5c5245] hover:bg-[#f0f5ff] hover:text-[#0071c2]'
    }`}>
    {icon}{label}
    {highlight && !active && <span className="ml-1 px-1.5 py-0.5 rounded bg-[#febb02] text-[#1a1a1a] text-[9px] font-black uppercase animate-pulse">{newLabel}</span>}
  </button>
);

const SearchInput = ({ icon, label, placeholder, type = 'text', value, onChange, className = '', min, max }) => (
  <label className={`block border-2 border-[#e6dcc3] hover:border-[#0071c2] focus-within:border-[#0071c2] focus-within:ring-2 focus-within:ring-[#0071c2]/15 bg-white rounded-xl px-3 py-2.5 transition ${className}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#93876f] mb-0.5">
      <span className="text-[#0071c2]">{icon}</span>{label}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={e => onChange?.(e.target.value)}
      className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a] placeholder:text-[#a89a7d]"
    />
  </label>
);

const SearchButton = ({ className = '', icon, label }) => (
  <button type="submit" className={`group flex items-center justify-center gap-2 bg-gradient-to-b from-[#0071c2] to-[#005fa3] hover:from-[#0079d0] hover:to-[#0071c2] text-white font-black text-[14px] rounded-xl py-3 px-5 shadow-soft hover:shadow-lift transition active:scale-95 ${className}`}>
    <span className="group-hover:scale-110 transition-transform">{icon || <Search className="w-5 h-5" />}</span>
    <span className="md:hidden">{label}</span>
  </button>
);

/* Slide-in drawer — quick access to the travel services (visa, esim, insurance…)
   that don't fit into the Tours/Flights/AI Trip search tabs but travelers still need. */
const ServicesDrawer = ({ open, onClose, t, navigate }) => {
  const items = [
    { icon: FileCheck,   label: t('servicesPage.visa.title'),           accent: 'bg-[#f0fdf4] text-[#008009]' },
    { icon: Wallet,      label: t('servicesPage.budget.title'),         accent: 'bg-[#f0f5ff] text-[#0071c2]' },
    { icon: Plane,       label: t('servicesPage.flightPredict.title'),  accent: 'bg-[#fff7e6] text-[#b8860b]' },
    { icon: Hotel,       label: t('servicesPage.hotelPredict.title'),   accent: 'bg-[#fdf2f8] text-[#be185d]' },
    { icon: ShieldCheck, label: t('servicesPage.insurance.title'),      accent: 'bg-[#f0fdf4] text-[#008009]' },
    { icon: Wifi,        label: t('servicesPage.esim.title'),           accent: 'bg-[#f0f5ff] text-[#0071c2]' },
    { icon: Car,         label: t('servicesPage.transfer.title'),       accent: 'bg-[#fff7e6] text-[#b8860b]' },
    { icon: Award,       label: t('servicesPage.lounge.title'),         accent: 'bg-[#f0f5ff] text-[#0071c2]' },
  ];

  const go = () => { navigate('/services'); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[91] shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-gradient-to-br from-[#002250] via-[#003580] to-[#003580] text-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#f5b942]">{t('homePage.servicesDrawer.eyebrow')}</div>
                  <div className="text-[19px] font-black mt-0.5">{t('homePage.servicesDrawer.heading')}</div>
                  <p className="text-[12px] text-white/70 font-medium mt-1 max-w-[280px]">{t('homePage.servicesDrawer.sub')}</p>
                </div>
                <button onClick={onClose} aria-label="Close"
                  className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-2 gap-3">
              {items.map((s, i) => (
                <button key={i} onClick={go}
                  className="group bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-4 flex flex-col items-start gap-2.5 hover:border-[#0071c2] lift text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${s.accent}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-[13px] font-black text-[#1a1a1a] leading-snug">{s.label}</div>
                </button>
              ))}
            </div>

            <div className="px-5 pb-6">
              <button onClick={go} className="btn-gold w-full py-3.5 rounded-xl text-[#1a1a1a] font-black text-[13px] flex items-center justify-center gap-2">
                {t('homePage.servicesDrawer.cta')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Home;
