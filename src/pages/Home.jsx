import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, Search, MapPin, Calendar, Users, ArrowRight, ArrowRightLeft,
  Flame, Sparkles, Star, Shield, Headphones, BadgePercent, Globe,
  TrendingUp, Heart, Mountain, Waves, Building2, Compass, Clock, Wand2, Wallet,
  ChevronRight, Award, ThumbsUp, Check, Mail, FileText, Download,
  FileCheck, ShieldCheck, Wifi, Car, Navigation, Loader2, LayoutGrid, X, Snowflake,
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
import ReviewForm from '../components/ReviewForm';
import { fetchReviews } from '../services/reviewsService';
import PhotoLightbox from '../components/PhotoLightbox';
import StatsPrism from '../components/StatsPrism';
import AutoStrip from '../components/AutoStrip';
import GlobePoints from '../components/fx/GlobePoints';
import GoldDust from '../components/fx/GoldDust';
import Tilt3D from '../components/fx/Tilt3D';
import { detectCurrentLocation } from '../services/geolocation';

/* ── Static showcases ─────────────────────────────────────────────── */
const TRENDING = [
  { city: 'Bukhara',   country: 'Uzbekistan',  from: 125, img: 'https://images.unsplash.com/photo-1670514535515-e7af911bdadb?auto=format&fit=crop&w=900&q=80' },
  { city: 'Dubai',     country: 'UAE',         from: 280, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
  { city: 'New York',  country: 'USA',         from: 540, img: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=900&q=80' },
  { city: 'Los Angeles', country: 'USA',       from: 620, img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=80' },
  { city: 'Las Vegas', country: 'USA',         from: 590, img: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=900&q=80' },
  { city: 'Bali',      country: 'Indonesia',   from: 540, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80' },
  { city: 'Istanbul',  country: 'Turkey',      from: 220, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80' },
  { city: 'Tokyo',     country: 'Japan',       from: 680, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80' },
  { city: 'Maldives',  country: 'Maldives',    from: 920, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80' },
  { city: 'Paris',     country: 'France',      from: 410, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80' },
  { city: 'Bangkok',   country: 'Thailand',    from: 380, img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80' },
  { city: 'Barcelona', country: 'Spain',       from: 360, img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80' },
  { city: 'Antarctica',country: 'White Continent', from: 4200, img: 'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=900&q=80' },
  { city: 'Rome',      country: 'Italy',       from: 340, img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80' },
  { city: 'London',    country: 'United Kingdom', from: 450, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80' },
  { city: 'Singapore', country: 'Singapore',   from: 610, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80' },
];

const THEMES = [
  { id: 'beach',    labelKey: 'themes.beach',     icon: Waves,    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80' },
  { id: 'city',     labelKey: 'themes.city',      icon: Building2,img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=700&q=80' },
  { id: 'mountain', labelKey: 'themes.mountain', icon: Mountain, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80' },
  { id: 'culture',  labelKey: 'themes.culture',  icon: Globe,    img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=700&q=80' },
  { id: 'family',   labelKey: 'themes.family',    icon: Heart,    img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=700&q=80' },
  { id: 'luxury',   labelKey: 'themes.luxury',    icon: Award,    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=700&q=80' },
];

// Lightweight {placeholder} interpolation on top of the plain t() lookup.
const fill = (str, vars = {}) =>
  String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

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

  // Featured deals, with Bukhara (pkg9) and Las Vegas (pkg8) lifted to right
  // after the headline Antarctica deal — they seed late in the list and would
  // otherwise be cut off.
  const featured = useMemo(() => {
    const f = packages.filter(p => p.featured);
    const lifted = ['pkg9', 'pkg8'].map(id => f.find(p => p.id === id)).filter(Boolean);
    const rest = f.filter(p => !lifted.includes(p));
    return (rest.length ? [rest[0], ...lifted, ...rest.slice(1)] : f).slice(0, 4);
  }, [packages]);
  const allPackages = useMemo(() => packages.slice(0, 10), [packages]);

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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { destination, image }
  useEffect(() => {
    let cancelled = false;
    fetchReviews().then((r) => { if (!cancelled) { setReviews(r); setReviewsLoading(false); } });
    return () => { cancelled = true; };
  }, []);

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

  // Mouse-parallax for the hero: writes normalized cursor coords into CSS vars
  // that the .parallax-layer children read. Purely decorative.
  const heroRef = useRef(null);
  const heroRaf = useRef(0);
  const onHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(heroRaf.current);
    heroRaf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--my', ((clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  };

  const submit = (e) => {
    e?.preventDefault?.();
    if (tab === 'tours') {
      const qs = new URLSearchParams({
        ...(dest.trim() ? { to: dest.trim() } : {}),
        days: String(Math.max(1, Math.min(21, Number(toursDays) || 7))),
        ...(checkin ? { start: checkin } : {}),
      });
      navigate(`/hot-tours?${qs.toString()}`);
    }
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
    <div className="min-h-screen bg-[#f5f7f9] -mt-[64px]">

      {/* ─── HERO + SEARCH (Editorial luxe) ───────────────────── */}
      <section ref={heroRef} onMouseMove={onHeroMove} className="relative aurora-bg pt-[100px] pb-32 md:pb-40 overflow-hidden">
        {/* destination photograph, warm-graded for an editorial travel-journal feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.16] mix-blend-soft-light parallax-layer"
             style={{ backgroundImage:'url("https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1800&q=80")', backgroundSize:'cover', backgroundPosition:'center', filter:'saturate(1.15) sepia(0.12)', '--depth': -14, '--pscale': 1.06 }} />
        <div className="film-grain" />
        <div className="pattern-lux" />
        <GoldDust className="absolute inset-0" />
        <div className="absolute inset-0 sheen-top pointer-events-none" />
        <div className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-[#0172cb]/30 blur-3xl pointer-events-none parallax-layer" style={{ '--depth': 26 }} />
        <div className="absolute -right-24 -bottom-10 w-80 h-80 rounded-full bg-[#00a58e]/15 blur-3xl pointer-events-none parallax-layer" style={{ '--depth': 18 }} />

        {/* 3D point globe — the world drawn in gold + ice-blue dots, live flight
            arcs pulsing between MAFTRAVEL destinations */}
        <div className="hidden lg:block absolute right-[1%] xl:right-[4%] top-[54px] w-[460px] h-[460px] parallax-layer" style={{ '--depth': 34 }}>
          <div className="absolute inset-10 rounded-full bg-[#0172cb]/25 blur-3xl" />
          <div className="absolute inset-16 rounded-full bg-[#00a58e]/10 blur-3xl" />
          <GlobePoints className="absolute inset-0" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-white max-w-3xl">
            <div className="badge-editorial px-4 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-[0.16em] mb-5">
              <Sparkles className="w-3.5 h-3.5 text-[#61d1bf]" /> {t('homePage.hero.badge')}
            </div>
            <h1 className="font-display text-[clamp(40px,6.6vw,84px)] font-semibold tracking-[-0.045em] leading-[0.95] text-balance break-words mb-5 [text-shadow:0_2px_30px_rgba(0,0,0,0.30)]">
              {t('homePage.hero.titleLead')} <span className="italic font-medium text-gradient-gold gold-animate">{t('homePage.hero.titleHighlight')}</span>,<br className="hidden md:block" /> {t('homePage.hero.titleTail')}
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
          <div className="absolute inset-x-8 md:inset-x-12 -top-6 bottom-0 bg-gradient-to-b from-[#00a58e]/35 via-[#00a58e]/12 to-transparent rounded-[28px] blur-2xl pointer-events-none" aria-hidden="true" />
          <div className="frame-lux relative bg-white rounded-2xl shadow-vitrine">
            <div className="flex items-center gap-1 px-2 pt-2">
              <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto min-w-0">
                <Tab active={tab === 'tours'}    onClick={() => setTab('tours')}    icon={<Plane className="w-4 h-4" />} label={t('homePage.tabs.tours')} />
                <Tab active={tab === 'flights'} onClick={() => setTab('flights')} icon={<Globe className="w-4 h-4" />} label={t('homePage.tabs.flights')} />
                <Tab active={tab === 'ai'}       onClick={() => setTab('ai')}       icon={<Sparkles className="w-4 h-4" />} label={t('homePage.tabs.ai')} highlight newLabel={t('homePage.tabs.newBadge')} />
                {/* Antarctica spotlight — sits right next to AI Trip, label always
                    visible (mobile included) so nobody has to scroll to find it */}
                <button type="button" onClick={() => navigate('/antarctica')}
                  className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-2.5 rounded-t-xl text-[12px] sm:text-[13px] font-black whitespace-nowrap transition active:scale-95 text-[#0172cb] bg-[#eaf6fb]/70 hover:bg-[#eaf6fb] hover:text-[#252a31]">
                  <Snowflake className="w-4 h-4 text-[#4aa3c0]" />
                  Antarctica
                </button>
              </div>
              {/* Kept outside the scroll area so it's always reachable, not scrolled off on mobile */}
              <button type="button" onClick={() => setServicesOpen(true)}
                className="ml-auto shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-t-xl text-[13px] font-black whitespace-nowrap transition text-[#4a5867] hover:bg-[#e8f4fd] hover:text-[#0172cb]">
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
                    placeholder="Dubai, Bukhara, Maldives…"
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
                    className="md:col-span-1 flex items-center justify-center self-center mx-auto md:mx-0 -my-1 md:my-0 w-9 h-9 rounded-full bg-white border-2 border-[#0172cb] text-[#0172cb] hover:bg-[#e8f4fd] hover:rotate-180 active:scale-95 transition-all duration-300 shadow-soft"
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
                      className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#0172cb] hover:text-[#252a31] disabled:opacity-60 transition active:scale-95">
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
                      <label className="md:col-span-5 block border-2 border-[#dfe7ec] hover:border-[#0172cb] focus-within:border-[#0172cb] focus-within:ring-2 focus-within:ring-[#0172cb]/15 bg-white rounded-xl px-3 py-2.5 transition">
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#697d95] self-center">{t('homePage.search.quickDays')}</span>
                    {[3, 5, 7, 10, 14].map(n => (
                      <button key={n} type="button" onClick={() => aiSync.onChangeDays(n)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black transition ${Number(aiDays) === n ? 'bg-[#252a31] text-white' : 'bg-[#e8f4fd] text-[#0172cb] hover:bg-[#d6ebfb]'}`}>
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
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">{t('homePage.search.popular')}</span>
                  {['Dubai', 'Bukhara', 'New York', 'Bali', 'Istanbul', 'Maldives', 'Tokyo', 'Paris', 'Antarctica'].map(c => {
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
                          active ? 'bg-[#252a31] text-white shadow-md' : 'bg-[#e8f4fd] text-[#0172cb] hover:bg-[#d6ebfb]'
                        }`}
                      >{c === 'Antarctica' ? '❄ Antarctica' : c}</button>
                    );
                  })}
                </div>
              )}

              {/* Quick flight routes for flights tab */}
              {tab === 'flights' && (
                <div className="flex items-center flex-wrap gap-1.5 pt-3 px-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">{t('homePage.search.popular')}</span>
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
                          active ? 'bg-[#252a31] text-white shadow-md' : 'bg-[#e8f4fd] text-[#0172cb] hover:bg-[#d6ebfb]'
                        }`}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            {(tab === 'ai' && aiDest) || (tab === 'tours' && dest) || (tab === 'flights' && flightTo) ? (
              <div className="border-t border-[#dfe7ec] mt-2 pt-2">
                <WeatherWidget city={tab === 'ai' ? aiDest : tab === 'flights' ? flightTo : dest} />
              </div>
            ) : null}
          </div>
        </motion.div>
      </section>

      {/* spacer for the floating card */}
      <div className="h-24 md:h-28" />

      {/* ─── STATS + TRUST PRISM (rotates every 5s, hold to pause) ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-6">
        <StatsPrism faces={[
          { stat: { icon: Users,        value: '10,000+',             label: t('homeStats.travelers') },
            trust: { icon: BadgePercent, title: t('homePage.trust.bestPriceTitle'), sub: t('homePage.trust.bestPriceSub') } },
          { stat: { icon: Globe,        value: '50+',                 label: t('homeStats.countries') },
            trust: { icon: Shield,       title: t('homePage.trust.secureTitle'),    sub: t('homePage.trust.secureSub') } },
          { stat: { icon: Sparkles,     value: t('homeStats.ai'),     label: t('homeStats.aiSub') },
            trust: { icon: Headphones,   title: t('homePage.trust.supportTitle'),   sub: t('homePage.trust.supportSub') } },
          { stat: { icon: BadgePercent, value: t('homeStats.prices'), label: t('homeStats.pricesSub') },
            trust: { icon: ThumbsUp,     title: t('homePage.trust.ratingTitle'),    sub: t('homePage.trust.ratingSub') } },
        ]} />
      </section>

      {/* ─── VALUE PROPS: BUDGET + PDF ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: copy + feature cards */}
          <div className="flex flex-col justify-center">
            <div className="eyebrow-lux mb-2">
              <Sparkles className="w-3.5 h-3.5" /> {t('homePage.valueProps.eyebrow')}
            </div>
            <h2 className="h-editorial text-engraved text-[28px] md:text-[40px] text-[#252a31] mb-2">
              {t('homePage.valueProps.heading')}
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#4a5867] font-medium leading-relaxed mb-6 max-w-xl">
              {t('homePage.valueProps.subtitle')}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-[#dfe7ec] rounded-2xl shadow-soft p-5 lift">
                <div className="w-11 h-11 rounded-xl bg-[#e8f4fd] text-[#0172cb] flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-[#252a31] mb-1.5 leading-snug">{t('homePage.valueProps.budgetTitle')}</h3>
                <p className="text-[13px] text-[#4a5867] font-medium leading-relaxed">{t('homePage.valueProps.budgetBody')}</p>
              </div>
              <div className="bg-white border border-[#dfe7ec] rounded-2xl shadow-soft p-5 lift">
                <div className="w-11 h-11 rounded-xl bg-[#e6f6f3] text-[#008f77] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-[#252a31] mb-1.5 leading-snug">{t('homePage.valueProps.pdfTitle')}</h3>
                <p className="text-[13px] text-[#4a5867] font-medium leading-relaxed">{t('homePage.valueProps.pdfBody')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/hot-tours')} className="btn-gold px-6 py-3 rounded-xl text-[#252a31] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Wand2 className="w-4 h-4" /> {t('homePage.valueProps.ctaPlan')}
              </button>
              <button onClick={() => navigate('/my-plans')} className="px-6 py-3 rounded-xl bg-white border border-[#dfe7ec] hover:border-[#0172cb] text-[#252a31] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#0172cb]/10 to-[#00a58e]/10 rounded-3xl blur-2xl pointer-events-none" />
            <div className="corner-gilt relative w-full max-w-md bg-white rounded-2xl shadow-float border border-[#dfe7ec] overflow-hidden">
              <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 bg-[#00a58e] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-float">
                <FileText className="w-3.5 h-3.5" /> {t('homePage.valueProps.pdfBadge')}
              </span>
              <div className="bg-gradient-to-br from-[#001026] via-[#1c2127] to-[#252a31] text-white p-6">
                <div className="label-gold">✦ {t('homePage.valueProps.pdfPreviewBrand')}</div>
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
                    <span className="mt-0.5 w-6 h-6 rounded-lg bg-[#e8f4fd] text-[#0172cb] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] font-bold text-[#252a31] leading-snug">{line}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="h-2 bg-[#e8edf1] rounded-full w-full mb-2" />
                  <div className="h-2 bg-[#e8edf1] rounded-full w-4/5 mb-2" />
                  <div className="h-2 bg-[#e8edf1] rounded-full w-2/3" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-lux max-w-7xl mx-auto px-4 md:px-8 py-2">
        <span className="lux-gem" aria-hidden="true" />
      </div>

      {/* ─── HOT TOURS TEASER ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="eyebrow-lux mb-1">
              <Flame className="w-3.5 h-3.5" /> {t('homePage.hotTours.eyebrow')}
            </div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('homePage.hotTours.heading')}</h2>
          </div>
          <button onClick={() => navigate('/hot-tours')} className="group hidden md:flex items-center gap-1 text-[13px] font-bold text-[#0172cb] hover:underline">
            {t('homePage.hotTours.viewAll')} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-fr">
          {featured.map((p, i) => {
            const discount = [42, 35, 28, 22][i] || 20;
            const original = Math.round(p.price / (1 - discount / 100));
            return (
              <FeaturedDealCard
                key={p.id}
                p={p} i={i} discount={discount} original={original}
                t={t} navigate={navigate} setLightbox={setLightbox}
                isInWishlist={isInWishlist} toggleWishlist={toggleWishlist}
              />
            );
          })}
        </div>

        <div className="md:hidden mt-4 text-center">
          <button onClick={() => navigate('/hot-tours')} className="text-[14px] font-black text-[#0172cb]">{t('homePage.hotTours.viewAllDeals')}</button>
        </div>
      </section>

      {/* ─── ANTARCTICA SPOTLIGHT — the rarest journey, one tap away ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 reveal">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate('/antarctica')}
          className="group relative overflow-hidden rounded-3xl shadow-float cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=1800&q=80"
            alt="Antarctica" loading="lazy" onError={handleImgError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001026]/95 via-[#1b2026]/75 to-[#00295c]/30 pointer-events-none" />
          <div className="film-grain" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7cc4d9]/60 to-transparent pointer-events-none" />

          <div className="relative p-7 md:p-12 max-w-2xl text-white">
            <div className="badge-editorial px-3.5 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-[0.16em] mb-4">
              <Snowflake className="w-3.5 h-3.5 text-[#7cc4d9]" /> {t('homePage.antarctica.eyebrow')}
            </div>
            <h2 className="font-display text-[30px] md:text-[46px] font-semibold tracking-[-0.03em] leading-[1.02] text-balance mb-3 [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
              {t('homePage.antarctica.title1')} <span className="italic font-medium text-gradient-gold gold-animate">{t('homePage.antarctica.title2')}</span>
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/80 font-medium leading-relaxed max-w-xl mb-5">
              {t('homePage.antarctica.sub')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                t('homePage.antarctica.statContinent'),
                t('homePage.antarctica.statSeason'),
              ].map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-white/[0.08] border border-[#7cc4d9]/30 text-[11.5px] font-bold text-[#cfeaf4]">{s}</span>
              ))}
              <span className="px-3 py-1.5 rounded-full bg-[#00a58e]/15 border border-[#00a58e]/40 text-[11.5px] font-black text-[#61d1bf]">
                {t('homePage.antarctica.statFrom')} <Price amount={8990} />
              </span>
            </div>
            <button onClick={() => navigate('/antarctica')}
              className="btn-gold px-6 py-3 rounded-xl text-[#252a31] font-black text-[14px] inline-flex items-center gap-2 active:scale-95 transition">
              <Snowflake className="w-4 h-4" /> {t('homePage.antarctica.cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── AI BUDGET CTA STRIP ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="panel-inlay relative overflow-hidden bg-gradient-to-r from-[#1c2127] via-[#0058b1] to-[#0172cb] rounded-3xl p-7 md:p-12 text-white shadow-float">
          <div className="pattern-lux" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#00a58e]/30 blur-3xl pointer-events-none depth-up" />
          <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-[#0172cb]/40 blur-3xl pointer-events-none depth-down" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00a58e] text-white text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
                <Wand2 className="w-3.5 h-3.5" /> {t('homePage.aiCta.badge')}
              </div>
              <h2 className="h-editorial text-3xl md:text-[40px] mb-3">
                {t('homePage.aiCta.heading')}
              </h2>
              <p className="text-[15px] text-white/85 font-medium mb-6 max-w-md">
                {t('homePage.aiCta.body')}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => navigate('/hot-tours')} className="btn-gold px-6 py-3 rounded-xl text-[#252a31] font-black text-[14px] flex items-center gap-2">
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
                  <f.icon className="w-5 h-5 text-[#00a58e] mb-2 group-hover:scale-110 transition-transform" />
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
            <div className="eyebrow-lux mb-1">
              <Sparkles className="w-3.5 h-3.5" /> {t('servicesHome.eyebrow')}
            </div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('servicesHome.heading')}</h2>
            <p className="text-[14px] text-[#4a5867] font-medium max-w-xl mt-1">{t('servicesHome.subtitle')}</p>
          </div>
          <button onClick={() => navigate('/services')} className="group hidden md:flex items-center gap-1 text-[13px] font-bold text-[#0172cb] hover:underline">
            {t('servicesHome.cta')} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: FileCheck,   label: t('servicesPage.visa.title'),     accent: 'bg-[#f0fdf4] text-[#008009]' },
            { icon: Wallet,      label: t('servicesPage.budget.title'),   accent: 'bg-[#e8f4fd] text-[#0172cb]' },
            { icon: Plane,       label: t('servicesPage.flightPredict.title'), accent: 'bg-[#e6f6f3] text-[#008f77]' },
            { icon: Hotel,       label: t('servicesPage.hotelPredict.title'),  accent: 'bg-[#fdf2f8] text-[#be185d]' },
            { icon: ShieldCheck, label: t('servicesPage.insurance.title'), accent: 'bg-[#f0fdf4] text-[#008009]' },
            { icon: Wifi,        label: t('servicesPage.esim.title'),      accent: 'bg-[#e8f4fd] text-[#0172cb]' },
            { icon: Car,         label: t('servicesPage.transfer.title'),  accent: 'bg-[#e6f6f3] text-[#008f77]' },
            { icon: Award,       label: t('servicesPage.lounge.title'),    accent: 'bg-[#e8f4fd] text-[#0172cb]' },
          ].map((s, i) => (
            <motion.button
              key={i}
              onClick={() => navigate('/services')}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: (i % 4) * 0.05 }}
              className="group bg-white border border-[#dfe7ec] rounded-2xl shadow-soft p-4 flex items-center gap-3 hover:border-[#0172cb] lift text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-[13px] font-black text-[#252a31] leading-snug">{s.label}</div>
            </motion.button>
          ))}
        </div>
        <div className="md:hidden mt-4 text-center">
          <button onClick={() => navigate('/services')} className="text-[14px] font-black text-[#0172cb]">{t('servicesHome.cta')}</button>
        </div>
      </section>

      {/* ─── TRENDING DESTINATIONS ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="eyebrow-lux mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> {t('homePage.trending.eyebrow')}
            </div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('homePage.trending.heading')}</h2>
          </div>
        </div>

        <AutoStrip className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {TRENDING.map((d, i) => (
            <Tilt3D key={i} max={9} className="card-sheen shrink-0 w-56 md:w-64 aspect-[4/3] snap-start rounded-2xl shadow-soft">
              <motion.button
                onClick={() => navigate(d.city === 'Antarctica' ? '/antarctica' : '/flights', {
                  state: d.city === 'Antarctica' ? undefined : { formData: { from: '', to: d.city, date: '', returnDate: '' } },
                })}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
                className="group absolute inset-0 overflow-hidden rounded-2xl text-left">
                <SmartImage src={d.img} alt={d.city} wrapperClassName="absolute inset-0" className="group-hover:scale-110 transition-transform duration-[600ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end text-left text-white">
                  <div className="text-[16px] md:text-[18px] font-black leading-tight">{d.city}</div>
                  <div className="text-[11px] text-white/75 font-semibold mb-1.5">{d.country}</div>
                  <div className="text-[11px] inline-flex items-center gap-1 bg-white/95 text-[#252a31] font-black px-2 py-0.5 rounded-md w-fit shadow-float group-hover:bg-[#00a58e] group-hover:text-white transition-colors">
                    <Plane className="w-3 h-3" /> {t('homePage.common.from')} <Price amount={d.from} />
                  </div>
                </div>
              </motion.button>
            </Tilt3D>
          ))}
        </AutoStrip>
      </section>

      {/* ─── DESTINATION MAP ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="eyebrow-lux mb-1">
              <Globe className="w-3.5 h-3.5" /> {t('homePage.map.eyebrow') || 'Explore'}
            </div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('homePage.map.heading') || 'Destinations worldwide'}</h2>
          </div>
        </div>
        <DestinationMap destinations={TRENDING} className="edge-gilded" />
      </section>

      <div className="divider-lux max-w-7xl mx-auto px-4 md:px-8 py-2">
        <span className="lux-gem" aria-hidden="true" />
      </div>

      {/* ─── BROWSE BY THEME ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31] mb-1">{t('homePage.themesSection.heading')}</h2>
        <p className="text-[14px] text-[#4a5867] font-medium mb-6">{t('homePage.themesSection.subtitle')}</p>

        <AutoStrip className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {THEMES.map((th, i) => (
            <motion.button
              key={th.id}
              onClick={() => navigate('/hot-tours')}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: (i % 6) * 0.04 }}
              className="group shrink-0 w-40 md:w-44 snap-start bg-white rounded-2xl border border-[#dfe7ec] shadow-soft hover:border-[#0172cb] overflow-hidden lift">
              <div className="aspect-[4/3] overflow-hidden">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-[600ms]" style={{ backgroundImage:`url(${th.img})` }} />
              </div>
              <div className="p-3 flex items-center gap-2">
                <th.icon className="w-4 h-4 text-[#0172cb] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-[13px] font-black text-[#252a31]">{t(`homePage.${th.labelKey}`)}</div>
              </div>
            </motion.button>
          ))}
        </AutoStrip>
      </section>

      {/* ─── ALL PACKAGES (Booking.com property cards style) ─────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('homePage.recommended.heading')}</h2>
            <p className="text-[14px] text-[#4a5867] font-medium">{t('homePage.recommended.subtitle')}</p>
          </div>
        </div>

        <AutoStrip className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {allPackages.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
              className="card-sheen shrink-0 w-72 snap-start bg-white rounded-2xl overflow-hidden border border-[#dfe7ec] shadow-soft lift group cursor-pointer"
              onClick={() => navigate('/hot-tours')}>
              <div className="relative h-44 overflow-hidden"
                onClick={(e) => { e.stopPropagation(); setLightbox({ destination: p.destination, image: p.image }); }}>
                <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.featured && <span className="absolute top-2.5 left-2.5 bg-white text-[#0172cb] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float">{t('homePage.recommended.bestseller')}</span>}
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-black text-[#252a31] mb-1 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-[#4a5867] font-semibold mb-2">
                  <MapPin className="w-3 h-3 text-[#0172cb]" /> {p.destination}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#4a5867] mb-3">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="bg-[#252a31] text-white px-1.5 py-0.5 rounded text-[10px] font-black">{p.rating}</span>
                    <span className="font-bold">{p.rating >= 4.8 ? t('homePage.recommended.exceptional') : t('homePage.recommended.veryGood')}</span>
                    <span className="text-[#697d95]">· {p.reviews} {t('homePage.recommended.reviews')}</span>
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-[#e8edf1] pt-3">
                  <div>
                    <div className="text-[10px] text-[#697d95] font-bold uppercase">{p.duration} {t('homePage.recommended.daysPerPerson')}</div>
                    <div className="text-[20px] font-black text-[#252a31]"><Price amount={p.price} /></div>
                  </div>
                  <span className="text-[12px] font-black text-white bg-[#0172cb] group-hover:bg-[#015aa3] px-3 py-2 rounded-lg transition shadow-soft">{t('homePage.recommended.viewDeal')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AutoStrip>
      </section>

      {/* ─── REVIEWS (real, visitor-submitted — see api/reviews.js) ──── */}
      <section className="paper-linen bg-white border-y border-[#dfe7ec]">
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-[#00a58e] mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-[#00a58e]" />)}
            </div>
            <h2 className="h-editorial text-engraved text-[26px] md:text-[36px] text-[#252a31]">{t('homePage.reviews.heading')}</h2>
            <p className="text-[14px] text-[#4a5867] font-medium">
              {reviews.length > 0
                ? fill(t('homePage.reviews.subtitleCount'), {
                    count: reviews.length,
                    reviewWord: t(reviews.length === 1 ? 'homePage.reviews.reviewWordSingular' : 'homePage.reviews.reviewWordPlural'),
                    avg: (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1),
                  })
                : t('homePage.reviews.subtitleEmpty')}
            </p>
            {!showReviewForm && (
              <button onClick={() => setShowReviewForm(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[#252a31] hover:bg-[#0172cb] text-white text-[13px] font-black rounded-xl px-4 py-2.5 transition active:scale-95 shadow-soft">
                <Star className="w-4 h-4" /> {t('homePage.reviews.leaveReviewCta')}
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="max-w-xl mx-auto mb-8">
              <ReviewForm
                t={t}
                onSubmitted={(review) => { setReviews((prev) => [review, ...prev]); setShowReviewForm(false); }}
              />
              <button onClick={() => setShowReviewForm(false)}
                className="mt-2 text-[12px] font-bold text-[#697d95] hover:text-[#252a31] transition mx-auto block">
                {t('homePage.reviews.cancel')}
              </button>
            </div>
          )}

          {!reviewsLoading && reviews.length === 0 && !showReviewForm && (
            <div className="max-w-md mx-auto text-center bg-[#eef2f5] rounded-2xl border border-[#dfe7ec] p-6">
              <div className="font-black text-[#252a31] mb-1">{t('homePage.reviews.emptyTitle')}</div>
              <p className="text-[13px] text-[#4a5867] font-medium">{t('homePage.reviews.emptyBody')}</p>
            </div>
          )}

          {reviews.length > 0 && (
            <AutoStrip className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
              {reviews.slice(0, 20).map((r, i) => (
                <motion.div
                  key={`${r.name}-${r.createdAt || i}`}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: (i % 6) * 0.08 }}
                  className="quote-lux relative shrink-0 w-[85vw] sm:w-80 snap-start bg-[#eef2f5] rounded-2xl border border-[#dfe7ec] shadow-soft p-5 pt-9 lift">
                  {r.destination && (
                    <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wide bg-white text-[#0172cb] px-2 py-1 rounded-md shadow-soft flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {r.destination}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mb-2 text-[#00a58e]">
                    {Array.from({ length: r.rating || 5 }).map((_, k) => <Star key={k} className="w-3.5 h-3.5 fill-[#00a58e]" />)}
                  </div>
                  <p className="font-display italic text-[16px] text-[#252a31] leading-relaxed mb-3">{r.text}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#252a31] text-white text-[11px] font-black flex items-center justify-center shadow-soft">
                      {r.name.charAt(0)}
                    </div>
                    <div className="text-[12px]">
                      <div className="font-black text-[#252a31]">{r.name}</div>
                      {r.city && <div className="text-[#697d95] font-semibold">{r.city}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AutoStrip>
          )}
        </div>
      </section>

      {/* ─── NEWSLETTER ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-[#1c2127] to-[#252a31] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-float">
          <div className="pattern-lux" />
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-[#00a58e]/20 blur-3xl pointer-events-none depth-up" />
          <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-[#0172cb]/30 blur-3xl pointer-events-none depth-down" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Mail className="w-8 h-8 text-[#00a58e] mb-3" />
              <h2 className="h-editorial text-[26px] md:text-[34px] mb-2">{t('homePage.newsletter.heading')}</h2>
              <p className="text-[14px] text-white/80 font-medium">{t('homePage.newsletter.body')}</p>
            </div>
            <form onSubmit={e => { e.preventDefault(); toast.success(t('homePage.newsletter.toastTitle'), t('homePage.newsletter.toastBody')); }}
              className="flex gap-2 bg-white/10 backdrop-blur rounded-xl p-1.5 border border-white/15 focus-within:border-white/40 transition">
              <input type="email" required placeholder={t('footer.emailPlaceholder')} className="flex-1 min-w-0 bg-transparent px-3 py-3 text-[14px] font-bold placeholder:text-white/50 outline-none" />
              <button className="btn-gold shrink-0 px-4 sm:px-5 py-3 rounded-lg text-[#252a31] font-black text-[12px] sm:text-[13px] uppercase tracking-wider whitespace-nowrap">
                {t('homePage.newsletter.subscribe')}
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      <ServicesDrawer open={servicesOpen} onClose={() => setServicesOpen(false)} t={t} navigate={navigate} />

      {lightbox && (
        <PhotoLightbox destination={lightbox.destination} mainImage={lightbox.image} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
};

/* ── Reusable subcomponents ───────────────────────────────────────── */

/* Featured deal tile in three mosaic variants: i===0 renders as the big hero
   tile (text over the photo, spans 2×2), i===3 as a wide horizontal tile,
   the rest as compact cards. Texts and actions are identical across variants. */
const FeaturedDealCard = ({ p, i, discount, original, t, navigate, setLightbox, isInWishlist, toggleWishlist }) => {
  const wishlistBtn = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const wasIn = isInWishlist(p.id, 'package');
        toggleWishlist('package', p);
        if (wasIn) toast.info(t('homePage.wishlist.removed'), p.name);
        else       toast.success(t('homePage.wishlist.saved'), p.name);
      }}
      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-float hover:scale-110 active:scale-95 transition z-10"
      aria-label={isInWishlist(p.id, 'package') ? t('homePage.wishlist.removeAria') : t('homePage.wishlist.saveAria')}
    >
      <Heart className={`w-4 h-4 ${isInWishlist(p.id, 'package') ? 'fill-red-500 text-red-500' : 'text-[#4a5867]'}`} />
    </button>
  );
  const discountBadge = (
    <span className="absolute top-2.5 left-2.5 bg-[#00a58e] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float z-10">-{discount}%</span>
  );

  if (i === 0) return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}
      className="group relative md:col-span-2 md:row-span-2 min-h-[280px] rounded-xl overflow-hidden cursor-pointer"
      onClick={() => navigate('/hot-tours')}>
      <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      {discountBadge}
      {wishlistBtn}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-1 text-[11px] font-bold text-white/80 mb-1">
          <MapPin className="w-3 h-3" /> {p.destination}
        </div>
        <h3 className="text-[22px] font-black leading-tight mb-1.5">{p.name}</h3>
        <div className="flex items-center gap-2 text-[12px] text-white/80 mb-2.5">
          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#00a58e] text-[#00a58e]" /> {p.rating}</span>
          <span>· {p.duration} {t('homePage.common.days')}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[12px] text-white/60 line-through font-bold"><Price amount={original} /></div>
            <div className="text-[24px] font-black"><Price amount={p.price} /></div>
          </div>
          <span className="text-[12px] font-black bg-white text-[#252a31] px-3.5 py-2 rounded-lg flex items-center gap-1 group-hover:bg-[#00a58e] group-hover:text-white transition-colors">
            {t('homePage.common.book')} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (i === 3) return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}
      className="group relative md:col-span-2 bg-white rounded-xl overflow-hidden border border-[#dfe7ec] shadow-soft cursor-pointer flex"
      onClick={() => navigate('/hot-tours')}>
      <div className="relative w-2/5 shrink-0 overflow-hidden"
        onClick={(e) => { e.stopPropagation(); setLightbox({ destination: p.destination, image: p.image }); }}>
        <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {discountBadge}
      </div>
      <div className="p-4 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1 text-[11px] text-[#4a5867] font-bold mb-1">
          <MapPin className="w-3 h-3 text-[#0172cb]" /> {p.destination}
        </div>
        <h3 className="text-[15px] font-black text-[#252a31] mb-1 line-clamp-1">{p.name}</h3>
        <div className="flex items-center gap-2 text-[11px] text-[#4a5867] mb-2">
          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#00a58e] text-[#00a58e]" /> {p.rating}</span>
          <span>· {p.duration} {t('homePage.common.days')}</span>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-[11px] text-[#697d95] line-through font-bold"><Price amount={original} /></div>
            <div className="text-[18px] font-black text-[#252a31]"><Price amount={p.price} /></div>
          </div>
          <span className="text-[11px] font-black text-[#0172cb] flex items-center gap-0.5 mb-0.5">
            {t('homePage.common.book')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
      className="group bg-white rounded-xl overflow-hidden border border-[#dfe7ec] shadow-soft cursor-pointer"
      onClick={() => navigate('/hot-tours')}>
      <div className="relative h-28 overflow-hidden"
        onClick={(e) => { e.stopPropagation(); setLightbox({ destination: p.destination, image: p.image }); }}>
        <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {discountBadge}
        {wishlistBtn}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-1 text-[10px] text-[#4a5867] font-bold mb-0.5">
          <MapPin className="w-3 h-3 text-[#0172cb]" /> {p.destination}
        </div>
        <h3 className="text-[13.5px] font-black text-[#252a31] mb-1 line-clamp-1">{p.name}</h3>
        <div className="flex items-end justify-between">
          <div className="text-[15px] font-black text-[#252a31]"><Price amount={p.price} /></div>
          <span className="text-[10.5px] font-black text-[#0172cb] flex items-center gap-0.5">
            {t('homePage.common.book')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
const Tab = ({ active, onClick, icon, label, highlight, newLabel }) => (
  <button type="button" onClick={onClick}
    className={`shrink-0 flex items-center gap-1.5 px-1.5 sm:px-4 py-2.5 rounded-t-xl text-[12px] sm:text-[13px] font-black whitespace-nowrap transition active:scale-95 ${
      active
        ? 'bg-white text-[#252a31] shadow-[0_-3px_0_#0172cb_inset]'
        : 'text-[#4a5867] hover:bg-[#e8f4fd] hover:text-[#0172cb]'
    }`}>
    {/* On phones the icons go — four labelled tabs have to fit with no scrolling */}
    <span className="hidden sm:inline-flex">{icon}</span>{label}
    {highlight && !active && <span className="ml-1 px-1 sm:px-1.5 py-0.5 rounded bg-[#00a58e] text-white text-[9px] font-black uppercase animate-pulse">{newLabel}</span>}
  </button>
);

const SearchInput = ({ icon, label, placeholder, type = 'text', value, onChange, className = '', min, max }) => (
  <label className={`block border-2 border-[#dfe7ec] hover:border-[#0172cb] focus-within:border-[#0172cb] focus-within:ring-2 focus-within:ring-[#0172cb]/15 bg-white rounded-xl px-3 py-2.5 transition ${className}`}>
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">
      <span className="text-[#0172cb]">{icon}</span>{label}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={e => onChange?.(e.target.value)}
      className="w-full bg-transparent outline-none text-[14px] font-bold text-[#252a31] placeholder:text-[#94a3af]"
    />
  </label>
);

const SearchButton = ({ className = '', icon, label }) => (
  <button type="submit" className={`group flex items-center justify-center gap-2 bg-gradient-to-b from-[#0172cb] to-[#015aa3] hover:from-[#0079d0] hover:to-[#0172cb] text-white font-black text-[14px] rounded-xl py-3 px-5 shadow-soft hover:shadow-lift transition active:scale-95 ${className}`}>
    <span className="group-hover:scale-110 transition-transform">{icon || <Search className="w-5 h-5" />}</span>
    <span className="md:hidden">{label}</span>
  </button>
);

/* Slide-in drawer — quick access to the travel services (visa, esim, insurance…)
   that don't fit into the Tours/Flights/AI Trip search tabs but travelers still need. */
const ServicesDrawer = ({ open, onClose, t, navigate }) => {
  const items = [
    { icon: FileCheck,   label: t('servicesPage.visa.title'),           accent: 'bg-[#f0fdf4] text-[#008009]' },
    { icon: Wallet,      label: t('servicesPage.budget.title'),         accent: 'bg-[#e8f4fd] text-[#0172cb]' },
    { icon: Plane,       label: t('servicesPage.flightPredict.title'),  accent: 'bg-[#e6f6f3] text-[#008f77]' },
    { icon: Hotel,       label: t('servicesPage.hotelPredict.title'),   accent: 'bg-[#fdf2f8] text-[#be185d]' },
    { icon: ShieldCheck, label: t('servicesPage.insurance.title'),      accent: 'bg-[#f0fdf4] text-[#008009]' },
    { icon: Wifi,        label: t('servicesPage.esim.title'),           accent: 'bg-[#e8f4fd] text-[#0172cb]' },
    { icon: Car,         label: t('servicesPage.transfer.title'),       accent: 'bg-[#e6f6f3] text-[#008f77]' },
    { icon: Award,       label: t('servicesPage.lounge.title'),         accent: 'bg-[#e8f4fd] text-[#0172cb]' },
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
            <div className="sticky top-0 z-10 bg-gradient-to-br from-[#1c2127] via-[#252a31] to-[#252a31] text-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#009882]">{t('homePage.servicesDrawer.eyebrow')}</div>
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
                  className="group bg-white border border-[#dfe7ec] rounded-2xl shadow-soft p-4 flex flex-col items-start gap-2.5 hover:border-[#0172cb] lift text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${s.accent}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-[13px] font-black text-[#252a31] leading-snug">{s.label}</div>
                </button>
              ))}
            </div>

            <div className="px-5 pb-6">
              <button onClick={go} className="btn-gold w-full py-3.5 rounded-xl text-[#252a31] font-black text-[13px] flex items-center justify-center gap-2">
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
