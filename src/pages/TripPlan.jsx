import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Users, Sparkles, Loader2, Plane, Hotel, Utensils, Bus,
  Activity, ShoppingBag, Wallet, Printer, Share2, Save, Download, Clock, Heart,
  Check, Map as MapIcon, AlertCircle, Star, Lightbulb, Phone, ShieldAlert, RefreshCcw,
  Navigation, ExternalLink, ArrowRight, UserPlus, X, Landmark, PartyPopper,
  Compass, Plug, Smartphone, HandCoins, Droplets, Shirt, Moon, Footprints,
} from 'lucide-react';
import { mapsUrlFor, mapsUrlFromAddress, dayMapsUrl } from '../utils/mapsUrl';
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import { generateAiItinerary, isAiAvailable, fetchCityInfo, fetchTripWeather, refinePlan } from '../services/aiPlannerService';
import { countryBrief } from '../services/travelServicesService';
import { generateItinerary } from '../services/plannerService';
import { fetchTripFlights, applyFlightPricing } from '../services/tripFlightPricing';
import { SAME_BLOCK_KM } from '../services/hotelProximity';
import { findHotelNearAttractions, applyHotelChoice } from '../services/hotelSearch';
import { localizePlan } from '../services/localizePlan';
import { getEmergencyContacts } from '../services/emergencyContacts';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';
import { useTranslation } from '../store/useLangStore';
import CityAutocomplete from '../features/flights/CityAutocomplete';
import DestinationMap from '../components/DestinationMap';
import { getCoords } from '../data/coords';
import Price, { usePriceFormatter } from '../components/Price';
import useSEO from '../hooks/useSEO';
import { findCity } from '../services/cityDatabase';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—';

// Lightweight {placeholder} interpolation on top of the plain t() lookup.
const fill = (str, vars = {}) =>
  String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const STAT_ROWS = [
  { icon: Plane,       statKey: 'flight',        key: 'flight' },
  { icon: Hotel,       statKey: 'accommodation', key: 'accommodation' },
  { icon: Utensils,    statKey: 'food',          key: 'food' },
  { icon: Bus,         statKey: 'transport',     key: 'transport' },
  { icon: Activity,    statKey: 'activities',    key: 'activities' },
  { icon: ShoppingBag, statKey: 'shopping',      key: 'shopping' },
];

export default function TripPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore(s => s.user);
  const addBooking = useAdminStore(s => s.addBooking);
  const fmt = usePriceFormatter();

  // 1) Try router state (from in-app navigation).
  // 2) Fall back to URL query (so refresh / shared links still work).
  const stateItem = location.state?.item;
  const stateType = location.state?.type;
  const itemFromUrl = useMemo(() => {
    if (stateItem) return null;
    const destination = (searchParams.get('to') || '').trim();
    if (!destination) return null;
    const duration = Math.max(1, Math.min(21, Number(searchParams.get('days')) || 5));
    const price    = Math.max(100, Number(searchParams.get('balance')) || 1500);
    return {
      id: `url-${Date.now()}`,
      name: `${duration}-day trip to ${destination}`,
      destination,
      duration,
      price,
      category: searchParams.get('style') || 'standard',
      image: heroFor(destination),
      description: `A ${duration}-day AI-built trip plan for ${destination} on a ${fmt(price)} budget.`,
    };
  }, [stateItem, searchParams, fmt]);

  const rawItem = stateItem || itemFromUrl;
  const type    = stateType || (itemFromUrl ? 'package' : null);

  // Always present an item with a usable hero image (direct-mode entries may not provide one).
  const item = useMemo(() => {
    if (!rawItem) return null;
    if (rawItem.image) return rawItem;
    return { ...rawItem, image: heroFor(rawItem.destination || rawItem.name) };
  }, [rawItem]);

  // Keep the alias used by runGenerate effect / callbacks pointing at the same enriched item.
  const itemWithHero = item;

  const fromCityState  = location.state?.fromCity   || searchParams.get('from')   || '';
  const startDateState = location.state?.startDate  || searchParams.get('start')  || '';
  const purposeState   = location.state?.purpose    || searchParams.get('purpose')|| '';
  // Optional different arrival city for the way back (e.g. Dubai → Antarctica → Tashkent)
  const returnToState  = location.state?.returnCity || searchParams.get('returnTo') || '';

  // Party size can arrive from the Home tours search (`pax`), via router state
  // or the URL, so a shared/refreshed link keeps the same headcount.
  const [travelers,  setTravelers]  = useState(
    Math.max(1, Math.min(9, Number(location.state?.travelers) || Number(searchParams.get('pax')) || 2)),
  );
  const [travelDate, setTravelDate] = useState(startDateState || '');
  const [returnDate, setReturnDate] = useState(location.state?.returnDate || searchParams.get('return') || '');
  const [fromCity,   setFromCity]   = useState(fromCityState || 'Bishkek');
  const [purpose,    setPurpose]    = useState(purposeState || 'Tourism and cultural exploration');
  const [name,       setName]       = useState(user?.name || '');
  const [loading,    setLoading]    = useState(false);
  const savedPlanState = location.state?.savedPlan;
  const [plan,       setPlan]       = useState(savedPlanState || null);
  const [error,      setError]      = useState(null);
  const [saved,      setSaved]      = useState(Boolean(savedPlanState));
  const [refineText, setRefineText] = useState('');
  const [refining,   setRefining]   = useState(false);
  const [prevPlan,   setPrevPlan]   = useState(null);
  const [brief,      setBrief]      = useState(null);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);
  // Not signed in at all, or only ever used "continue as guest" — either way
  // this plan lives in localStorage only and won't survive a cache clear.
  const isGuest = !user || user.role === 'guest';

  /* ── Auto-generate the full plan when the user lands here ──
     Skipped when a previously-saved plan was passed in (e.g. reopening a
     booking from My Bookings) — regenerating would discard what was saved. */
  useEffect(() => {
    if (!itemWithHero || !type) return;
    if (savedPlanState) return;
    runGenerate();
    // Persist core params in URL so refresh works.
    if (!searchParams.get('to') && itemWithHero.destination) {
      const next = new URLSearchParams(searchParams);
      next.set('to',      itemWithHero.destination);
      next.set('days',    String(itemWithHero.duration || 5));
      next.set('balance', String(itemWithHero.price    || 1500));
      if (fromCityState)  next.set('from',  fromCityState);
      if (startDateState) next.set('start', startDateState);
      if (purposeState)   next.set('purpose', purposeState);
      if (returnToState)  next.set('returnTo', returnToState);
      if (travelers !== 2) next.set('pax', String(travelers));
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Re-build the plan in the newly selected language ── */
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;       // ignore the initial render
    prevLang.current = lang;
    if (!plan || loading || refining || !itemWithHero || !type) return;
    if (!isAiAvailable()) return;                // no AI → keep current plan
    toast.info(t('tripPlan.translatingTitle'), t('tripPlan.translatingBody'));
    runGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ── Pre-departure country brief — one cached AI call per destination+lang ── */
  const briefDest = itemWithHero?.destination || itemWithHero?.name || '';
  useEffect(() => {
    if (!briefDest || !plan || !isAiAvailable()) return undefined;
    let cancelled = false;
    setBrief(null);
    countryBrief({ destination: briefDest, lang })
      .then((b) => { if (!cancelled) setBrief(b); })
      .catch(() => { /* card simply doesn't render */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on destination+lang; plan only gates the first fetch
  }, [briefDest, lang, !!plan]);

  const handleRefine = async () => {
    const instruction = refineText.trim();
    if (!instruction || refining || loading || !plan) return;
    setRefining(true);
    try {
      let next = await refinePlan(plan, instruction, {
        destination: itemWithHero?.destination || itemWithHero?.name || '',
        lang,
      });
      // A refine round-trips the itinerary through the model, which re-invents
      // the flight-event prices. Stamp the resolved fare back on so an edit
      // like "make day 3 cheaper" can't quietly replace a real quoted airfare
      // with a guess.
      if (plan.flights) {
        next = applyFlightPricing(next, plan.flights, {
          fmt,
          includedLabel: t('tripPlan.flights.includedInTicket'),
        });
      }
      setPrevPlan(plan);
      setPlan(next);
      setRefineText('');
      setSaved(false);
      toast.success(t('tripPlan.refine.successTitle'), t('tripPlan.refine.successBody'));
    } catch {
      toast.error(t('tripPlan.refine.failTitle'), t('tripPlan.refine.failBody'));
    } finally {
      setRefining(false);
    }
  };

  const handleUndoRefine = () => {
    if (!prevPlan) return;
    setPlan(prevPlan);
    setPrevPlan(null);
  };

  const runGenerate = async () => {
    if (!itemWithHero || loading || refining) return;  // guard: no item OR already generating/refining
    setLoading(true);
    setError(null);
    setPrevPlan(null);
    try {
      const params = {
        destination: itemWithHero.destination || itemWithHero.name,
        fromCity,
        returnCity:  returnToState,
        days:        Number(itemWithHero.duration) || 5,
        budget:      Number(itemWithHero.price)    || 1500,
        style:       itemWithHero.category || itemWithHero.style || 'standard',
        interests:   ['culture','food','sightseeing'],
        transportMode: 'walking',
        startDate:   travelDate,
        purpose,
        lang,
      };
      let result;
      if (isAiAvailable()) {
        try { result = await generateAiItinerary(params); }
        catch (e) {
          console.warn('Grok plan fallback:', e.message);
          if (/timed out/i.test(e.message)) toast.info(t('tripPlan.aiSlowTitle'), t('tripPlan.aiSlowBody'));
        }
      }
      if (!result) result = await generateItinerary(params);
      // Offline/template plans are English — translate them for free via the
      // Google proxy. AI (grok) plans are already generated in-language.
      if (result && result.source !== 'grok' && lang && lang !== 'en') {
        result = await localizePlan(result, lang);
      }
      // Template-fallback plans have no per-day weather — attach the same real
      // Open-Meteo data the AI path uses so the day chips render either way.
      if (travelDate && Array.isArray(result?.days) && !result.days.some((d) => d.weather)) {
        const wx = await fetchTripWeather(params.destination, travelDate, result.days.length);
        if (wx) {
          const start = new Date(travelDate);
          const pad = (n) => String(n).padStart(2, '0');
          result.days.forEach((d, i) => {
            const dd = new Date(start);
            dd.setDate(dd.getDate() + i);
            d.weather = wx[`${dd.getFullYear()}-${pad(dd.getMonth() + 1)}-${pad(dd.getDate())}`] || null;
          });
        }
      }
      // Ensure header & emergency are always populated, even if a stale path skipped them.
      if (!result.emergency)  result.emergency = getEmergencyContacts(itemWithHero.destination || itemWithHero.name);
      if (!result.header) {
        result.header = {
          title:   `Travel Plan – ${itemWithHero.destination || itemWithHero.name}`,
          dates:   travelDate ? new Date(travelDate).toDateString() : `${params.days} days`,
          route:   fromCity ? `${fromCity} → ${itemWithHero.destination || itemWithHero.name} → ${returnToState || fromCity}` : (itemWithHero.destination || itemWithHero.name),
          purpose,
        };
      }
      setPlan(result);

      // Real airfare for the route, resolved after the plan renders so a slow
      // or unconfigured flight API never delays the itinerary. Replaces the
      // budget-derived guess (a flat % of the traveler's budget, identical for
      // every route) with a live offer, or a route-aware AI estimate.
      fetchTripFlights({
        fromCity,
        destination: params.destination,
        returnCity:  returnToState,
        startDate:   travelDate,
        days:        params.days,
        travelers,
        style:       params.style,
      }).then((flights) => {
        if (!flights) return;
        setPlan((p) => (p ? applyFlightPricing(p, flights, {
          fmt,
          includedLabel: t('tripPlan.flights.includedInTicket'),
        }) : p));
      }).catch((e) => console.warn('Trip flight pricing failed:', e.message));

      // Swap the model's invented hotel for a real, priced one that actually
      // sits closest to the attractions this plan schedules — ranked from the
      // itinerary's own coordinates (see hotelSearch.js). A curated partner
      // property stays put: it is there on purpose, not by accident.
      if (!result.hotel?.recommended) {
        findHotelNearAttractions({
          destination: params.destination,
          days:        result.days,
          startDate:   travelDate,
          nights:      Math.max(1, params.days - 1),
          travelers,
          style:       params.style,
          maxNightly:  result.budgetBreakdown?.accommodation && params.days > 1
            ? Math.round((result.budgetBreakdown.accommodation / (params.days - 1)) * 1.4)
            : undefined,
        }).then((hotel) => {
          if (!hotel) return;
          setPlan((p) => (p && !p.hotel?.recommended ? applyHotelChoice(p, hotel) : p));
        }).catch((e) => console.warn('Hotel proximity search failed:', e.message));
      }

      // Template fallback has no city info — try a much smaller standalone AI
      // call for it (often fits even when the full plan call was rate-limited).
      if (!result.cityInfo && isAiAvailable()) {
        fetchCityInfo({ destination: params.destination, startDate: travelDate, lang }).then((cityInfo) => {
          if (cityInfo) setPlan((p) => (p && !p.cityInfo ? { ...p, cityInfo } : p));
        });
      }
    } catch {
      setError(t('tripPlan.genericError'));
    } finally {
      setLoading(false);
    }
  };

  /* ── SEO: pull in any verified partner names (hotel/restaurant) for this
     destination so a search for THEM can also surface this plan page. ── */
  const destName = item?.destination || item?.name || '';
  const cityData  = useMemo(() => findCity(destName), [destName]);
  const partnerNames = useMemo(() => {
    const names = [];
    if (plan?.hotel?.recommended && plan.hotel.name) names.push(plan.hotel.name);
    if (cityData?.mustInclude?.length) names.push(...cityData.mustInclude.map(p => p.name));
    return [...new Set(names)];
  }, [plan?.hotel?.recommended, plan?.hotel?.name, cityData]);
  useSEO({
    title: destName ? `${item.duration || ''}-Day ${destName} Trip Plan`.trim() : undefined,
    description: destName
      ? `Free AI-built day-by-day plan for ${destName}${partnerNames.length ? ` — featuring ${partnerNames.join(' and ')}` : ''}, with real hotels, restaurants and a full budget breakdown.`
      : undefined,
    image: item?.image,
    keywords: destName ? [destName, `${destName} trip plan`, `${destName} itinerary`, ...partnerNames] : [],
  });

  /* ── No item passed in → friendly redirect ── */
  if (!item || !type) {
    return (
      <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#dfe7ec] p-10 max-w-md w-full text-center shadow-float relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#00a58e]/15 blur-3xl pointer-events-none animate-float" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00a58e] to-[#008f77] flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lift">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-[#252a31] mb-1.5">{t('tripPlan.noItemTitle')}</h2>
            <p className="text-[#4a5867] text-[14px] font-medium mb-6 leading-relaxed">
              {t('tripPlan.noItemSub')}
            </p>
            <button onClick={() => navigate('/hot-tours')}
              className="btn-gold px-6 py-3.5 text-[13px] inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {t('tripPlan.openStudio')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Save plan locally (no payment, just a saved plan) ── */
  const handleSave = () => {
    if (saved) return;
    const b = addBooking({
      userId:    user?.id || 'guest',
      userName:  name || user?.name || 'Guest traveler',
      userEmail: user?.email || '—',
      type:      'plan',
      itemId:    item.id,
      itemName:  `${item.name || item.destination} (${item.duration} days)`,
      date:      travelDate,
      passengers: travelers,
      total:     item.price,
      status:    'saved',
      plan,
    });
    setSaved(true);
    toast.success(t('tripPlan.savedToastTitle'), fill(t('tripPlan.savedToastBody'), { name: b.itemName }));
  };

  /* ── Print friendly view ── */
  const handlePrint = () => {
    toast.info(t('tripPlan.printToastTitle'), t('tripPlan.printToastBody'));
    setTimeout(() => window.print(), 200);
  };

  /* ── Share trip text ── */
  const handleShare = async () => {
    const text = buildShareText({ item, plan, travelDate, travelers, fmt });
    if (navigator.share) {
      try { await navigator.share({ title: `MAFTRAVEL · ${item.destination || item.name}`, text }); return; } catch { /* ignore */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('tripPlan.planCopiedTitle'), t('tripPlan.planCopiedBody'));
    } catch {
      toast.error(t('tripPlan.copyFailTitle'), t('tripPlan.copyFailBody'));
    }
  };

  /* ── Download a single-page HTML the browser can print to PDF ── */
  const handleDownload = () => {
    const html = buildPdfHtml({ item, plan, travelers, travelDate, name });
    const win = window.open('', '_blank');
    if (!win) {
      toast.error(t('tripPlan.popupBlockedTitle'), t('tripPlan.popupBlockedBody'));
      return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const totalNice = fmt(item.price);

  return (
    <div className="min-h-screen bg-[#f5f7f9]">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1c2127] via-[#252a31] to-[#0172cb] text-white overflow-hidden">
        <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-[#00a58e]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-7">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[12px] font-bold mb-3 transition">
            <ArrowLeft className="w-4 h-4" /> {t('tripPlan.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a58e] text-white text-[10px] font-black uppercase tracking-widest mb-2.5 shadow-float">
            <Sparkles className="w-3.5 h-3.5" /> {t('tripPlan.freeBadge')}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {item.destination || item.name}
          </h1>
          <p className="text-[13px] text-white/70 font-medium mt-1">
            {fill(t('tripPlan.heroSub'), { total: totalNice })}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 page-fade">

        {plan && isGuest && !guestBannerDismissed && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#009882]/50 bg-[#e6f6f3] p-4 shadow-soft">
            <div className="w-9 h-9 rounded-xl bg-[#00a58e] flex items-center justify-center text-white shrink-0">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-black text-[#252a31]">{t('tripPlan.guestBanner.title')}</p>
              <p className="text-[13px] text-[#4a5867] font-medium mt-0.5">{t('tripPlan.guestBanner.body')}</p>
              <button
                onClick={() => navigate('/register')}
                className="mt-2.5 inline-flex items-center gap-1.5 bg-[#252a31] hover:bg-[#0172cb] text-white text-[12px] font-black rounded-lg px-3.5 py-2 shadow-soft transition active:scale-95">
                <UserPlus className="w-3.5 h-3.5" /> {t('tripPlan.guestBanner.cta')}
              </button>
            </div>
            <button
              onClick={() => setGuestBannerDismissed(true)}
              aria-label={t('tripPlan.guestBanner.dismiss')}
              className="text-[#697d95] hover:text-[#252a31] transition shrink-0 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Plan ── */}
          <div className="lg:col-span-2 space-y-5" id="print-plan">

            {/* ── Upcoming holiday banner (AI-found, near the travel dates) ── */}
            {plan?.cityInfo?.upcomingEvent && (
              <div className="flex items-start gap-3 rounded-2xl border border-[#009882]/50 bg-gradient-to-r from-[#e6f6f3] to-[#fffdf5] p-4 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-[#00a58e] flex items-center justify-center text-white shrink-0">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#007f6d]">{t('tripPlan.upcomingEventLabel')}</div>
                  <div className="text-[15px] font-black text-[#252a31] mt-0.5">
                    {plan.cityInfo.upcomingEvent.name}
                    {plan.cityInfo.upcomingEvent.date && <span className="text-[#007f6d]"> · {plan.cityInfo.upcomingEvent.date}</span>}
                  </div>
                  {plan.cityInfo.upcomingEvent.note && (
                    <p className="text-[13px] text-[#4a5867] font-medium leading-relaxed mt-1">{plan.cityInfo.upcomingEvent.note}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Berlin-style header summary ── */}
            <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 md:p-6 shadow-soft">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0172cb] mb-1.5">
                <MapIcon className="w-3.5 h-3.5" /> {t('tripPlan.sectionLabel')}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#252a31] tracking-tight leading-tight">
                {plan?.header?.title || fill(t('tripPlan.titleFallback'), { destination: item.destination || item.name })}
              </h2>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <HeaderStat icon={<Calendar className="w-3.5 h-3.5" />} label={t('tripPlan.travelDates')}
                  value={plan?.header?.dates || (travelDate ? fmtDate(travelDate) : fill(t('tripPlan.daysValue'), { days: item.duration }))} />
                <HeaderStat icon={<Plane className="w-3.5 h-3.5" />} label={t('tripPlan.route')}
                  value={plan?.header?.route || (fromCity ? `${fromCity} → ${item.destination || item.name} → ${returnToState || fromCity}` : '—')} />
                <HeaderStat icon={<Sparkles className="w-3.5 h-3.5" />} label={t('tripPlan.purpose')}
                  value={plan?.header?.purpose || purpose} />
              </div>
            </div>

            {/* Hero card */}
            {item.image && (
              <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden shadow-float">
                <SmartImage src={item.image} alt={item.destination || item.name} wrapperClassName="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
                    <MapPin className="w-3 h-3 text-[#00a58e]" /> {item.destination}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight">{item.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-[12px] font-bold">
                    {item.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#00a58e] text-[#00a58e]" /> {item.rating}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fill(t('tripPlan.daysValue'), { days: item.duration })}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur capitalize">{item.category || t('tripPlan.categoryStandard')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── About this destination (AI-written: history + what's on now) ── */}
            {plan?.cityInfo && (plan.cityInfo.about || plan.cityInfo.currentHappenings) && (
              <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0172cb] mb-2.5">
                  <Landmark className="w-3.5 h-3.5" /> {fill(t('tripPlan.aboutLabel'), { destination: item.destination || item.name })}
                </div>
                {plan.cityInfo.about && (
                  <p className="text-[14px] text-[#252a31] font-medium leading-relaxed">{plan.cityInfo.about}</p>
                )}
                {plan.cityInfo.currentHappenings && (
                  <div className="mt-3 flex items-start gap-2 bg-[#e8f4fd] rounded-xl p-3">
                    <Clock className="w-4 h-4 text-[#0172cb] mt-0.5 shrink-0" />
                    <p className="text-[13px] text-[#252a31] font-semibold leading-relaxed">{plan.cityInfo.currentHappenings}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Route map ── */}
            {(() => {
              const cleanCity = (s) => String(s || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
              const destCity = cleanCity(item.destination || item.name);
              const fromClean = cleanCity(fromCity);
              const backClean = cleanCity(returnToState);
              const mapPoints = [
                fromClean && getCoords(fromClean) ? { city: fromClean } : null,
                getCoords(destCity) ? { city: destCity } : null,
                backClean && backClean !== fromClean && getCoords(backClean) ? { city: backClean } : null,
              ].filter(Boolean);
              if (!mapPoints.length) return null;
              return (
                <div className="bg-white border border-[#dfe7ec] rounded-2xl p-4 shadow-soft">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0172cb] mb-3 px-1">
                    <MapIcon className="w-3.5 h-3.5" /> {t('tripPlan.routeMapLabel')}
                  </div>
                  <DestinationMap destinations={mapPoints} />
                </div>
              );
            })()}

            {/* Description / includes */}
            {(item.description || item.includes?.length) && (
              <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                {item.description && <p className="text-[14px] text-[#252a31] font-medium leading-relaxed mb-4">{item.description}</p>}
                {item.includes?.length > 0 && (
                  <>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-2">{fill(t('tripPlan.whatsCovered'), { total: totalNice })}</div>
                    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {item.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-[#252a31] font-semibold">
                          <Check className="w-3.5 h-3.5 text-[#008009] mt-0.5 shrink-0" strokeWidth={3} /> {inc}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* ── Flights card — the fare the plan is actually costed on ── */}
            {plan?.flights && (() => {
              const f = plan.flights;
              const legs = [f.outbound, f.inbound].filter(Boolean);
              return (
                <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0172cb] flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5" /> {t('tripPlan.flights.title')}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      f.isLive ? 'text-[#008009] bg-[#eafaea]' : 'text-[#697d95] bg-[#eef2f5]'
                    }`}>
                      {f.isLive
                        ? fill(t('tripPlan.flights.liveBadge'), { source: f.source })
                        : t('tripPlan.flights.estimateBadge')}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {legs.map((leg, i) => (
                      <li key={i} className="flex items-center gap-3 flex-wrap">
                        <span className="text-[13px] font-black text-[#252a31] tabular-nums whitespace-nowrap">
                          {leg.from} → {leg.to}
                        </span>
                        {leg.date && <span className="text-[11px] text-[#697d95] font-bold">{fmtDate(leg.date)}</span>}
                        {leg.airline && (
                          <span className="text-[11px] text-[#4a5867] font-semibold">{leg.airlineLogo} {leg.airline}</span>
                        )}
                        {leg.duration && <span className="text-[11px] text-[#697d95] font-bold">{leg.duration}</span>}
                        {Number.isFinite(leg.stops) && (
                          <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-1.5 py-0.5 rounded">
                            {leg.stops === 0 ? t('tripPlan.flights.direct') : fill(t('tripPlan.flights.stops'), { count: leg.stops })}
                          </span>
                        )}
                        {leg.departure && (
                          <span className="text-[11px] text-[#697d95] font-bold tabular-nums">{leg.departure}{leg.arrival ? `–${leg.arrival}` : ''}</span>
                        )}
                        {/* A round-trip ticket has one price, shown once in the
                            total row — a per-leg figure here would be invented. */}
                        {Number.isFinite(leg.price) && (
                          <span className="ml-auto text-[13px] font-black text-[#252a31] whitespace-nowrap">{fmt(leg.price)}</span>
                        )}
                      </li>
                    ))}
                  </ul>

                  {f.priceLevel && (
                    <p className={`mt-2 text-[11px] font-bold ${
                      f.priceLevel === 'low' ? 'text-[#008009]' : f.priceLevel === 'high' ? 'text-[#b3402e]' : 'text-[#697d95]'
                    }`}>
                      {t(`tripPlan.flights.level.${f.priceLevel}`)}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-[#eef2f5] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">
                      {fill(t(f.travelers === 1 ? 'tripPlan.flights.totalOne' : 'tripPlan.flights.totalMany'), { count: f.travelers })}
                    </span>
                    <span className="text-[15px] font-black text-[#252a31]">
                      {/* Per-leg rows are per person — spell out the multiplication
                          so the total doesn't look like it came from nowhere. */}
                      {f.travelers > 1 && (
                        <span className="text-[11px] text-[#697d95] font-bold mr-1.5">{fmt(f.perPerson)} × {f.travelers} =</span>
                      )}
                      {fmt(f.total)}
                    </span>
                  </div>

                  {/* The budget split assumed a cheaper ticket than the route
                      actually costs — say so instead of letting the tiles imply
                      the trip still fits. */}
                  {plan.budgetBreakdown?.flightBudgeted > 0
                    && f.perPerson > plan.budgetBreakdown.flightBudgeted * 1.25 && (
                    <p className="mt-2 p-2 rounded-lg note-danger text-danger text-[11px] font-bold">
                      {fill(t('tripPlan.flights.overBudget'), {
                        actual: fmt(f.perPerson),
                        planned: fmt(plan.budgetBreakdown.flightBudgeted),
                      })}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {(f.bookLink || f.outbound?.buyLink) && (
                      <a href={f.bookLink || f.outbound.buyLink} target="_blank" rel="noreferrer noopener"
                        className="px-3 py-2 rounded-lg bg-[#00a58e] hover:bg-[#008f77] text-white text-[11px] font-black inline-flex items-center gap-1 active:scale-95 transition">
                        {t('tripPlan.flights.book')} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const bare = (s) => String(s || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
                        navigate('/flights', {
                          state: {
                            formData: {
                              from: `${bare(fromCity)} (${f.outbound?.from})`,
                              to:   `${bare(item.destination || item.name)} (${f.outbound?.to})`,
                              date: f.outbound?.date || '',
                              returnDate: f.inbound?.date || '',
                            },
                          },
                        });
                      }}
                      className="px-3 py-2 rounded-lg border border-[#dfe7ec] text-[#0172cb] text-[11px] font-black hover:bg-[#e8f4fd] active:scale-95 transition">
                      {t('tripPlan.flights.compare')}
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] text-[#8a99ab] font-semibold">
                    {f.isLive ? t('tripPlan.flights.liveNote') : t('tripPlan.flights.estimateNote')}
                  </p>
                </div>
              );
            })()}

            {/* ── Hotel card ── */}
            {plan?.hotel && (plan.hotel.name || plan.hotel.address) && (() => {
              const h = plan.hotel;
              const fullAddress = [h.name, h.address].filter(Boolean).join(', ');
              const url = h.mapUrl || mapsUrlFromAddress(fullAddress || h.name);
              const prox = h.proximity;
              return (
                <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                  <div className="flex items-start gap-3">
                    {h.image ? (
                      <SmartImage src={h.image} alt={h.name} wrapperClassName="w-16 h-16 rounded-xl shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#e8f4fd] flex items-center justify-center text-[#0172cb] shrink-0">
                        <Hotel className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0172cb]">{t('tripPlan.yourStay')}</span>
                        {h.recommended && (
                          <span className="text-[10px] font-black text-white bg-[#008009] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" /> {t('tripPlan.recommendedBadge')}
                          </span>
                        )}
                        {h.stars && (
                          <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            {h.stars}★
                          </span>
                        )}
                        {h.pricePerNight && <span className="text-[10px] font-black text-[#252a31] bg-[#e8f4fd] px-2 py-0.5 rounded-md">{h.pricePerNight}</span>}
                        {h.rating > 0 && (
                          <span className="text-[10px] font-black text-[#252a31] bg-[#fdf3e0] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-[#e8a33d] text-[#e8a33d]" /> {h.rating}
                            {h.reviews > 0 && <span className="text-[#697d95] font-bold">({h.reviews.toLocaleString()})</span>}
                          </span>
                        )}
                        {h.source === 'serpapi' && (
                          <span className="text-[10px] font-black text-[#008009] bg-[#eafaea] px-2 py-0.5 rounded-md">
                            {t('tripPlan.realHotelBadge')}
                          </span>
                        )}
                      </div>
                      <div className="text-[16px] font-black text-[#252a31]">{h.name}</div>
                      {h.address && (
                        <a href={url || '#'} target="_blank" rel="noreferrer noopener"
                          className="mt-1 inline-flex items-start gap-1 text-[12px] text-[#0172cb] hover:underline font-semibold">
                          <MapPin className="w-3 h-3 mt-0.5 text-[#00a58e]" /> {h.address}{h.area ? ` · ${h.area}` : ''}
                          <ExternalLink className="w-2.5 h-2.5 mt-0.5" />
                        </a>
                      )}
                    </div>
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer noopener"
                        className="px-3 py-2 rounded-lg bg-[#00a58e] hover:bg-[#008f77] text-white text-[11px] font-black flex items-center gap-1 active:scale-95 transition shrink-0">
                        <Navigation className="w-3.5 h-3.5" /> {t('tripPlan.navigate')}
                      </a>
                    )}
                  </div>

                  {/* ── Why this hotel: how close it sits to the planned sights ── */}
                  {prox && (
                    <div className="mt-4 pt-4 border-t border-[#eef2f5]">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#697d95] flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5 text-[#00a58e]" /> {t('tripPlan.closestToSights')}
                        </span>
                        <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-2 py-0.5 rounded-md">
                          {fill(
                            prox.basis === 'coords' ? t('tripPlan.walkableStops') : t('tripPlan.sameDistrictStops'),
                            { count: prox.walkableCount, total: prox.totalStops },
                          )}
                        </span>
                      </div>

                      {h.whyHere && (
                        <p className="text-[12px] text-[#4a5867] font-semibold mb-2">{h.whyHere}</p>
                      )}

                      <ul className="space-y-1">
                        {prox.nearest.map((s, i) => (
                          <li key={i} className="flex items-baseline gap-2 text-[12px]">
                            <span className="font-bold text-[#252a31] truncate">{s.name}</span>
                            {Number.isFinite(s.walkMin) ? (
                              <span className="shrink-0 font-black text-[#00a58e] whitespace-nowrap">
                                {s.km <= SAME_BLOCK_KM
                                  ? t('tripPlan.rightNextTo')
                                  : s.walkMin <= 25
                                    ? fill(t('tripPlan.walkMin'), { min: s.walkMin })
                                    : fill(t('tripPlan.awayKm'), { km: s.km.toFixed(1) })}
                              </span>
                            ) : s.district ? (
                              <span className="shrink-0 text-[#697d95] font-semibold whitespace-nowrap">{s.district}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>

                      <p className="mt-2 text-[10px] text-[#8a99ab] font-semibold">
                        {prox.basis === 'coords' ? t('tripPlan.walkNote') : t('tripPlan.districtNote')}
                      </p>

                      {/* Runners-up from the same ranking — so "closest" is a
                          choice the traveler can see, not a black box. */}
                      {h.alternatives?.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-[11px] font-black text-[#0172cb] cursor-pointer">
                            {t('tripPlan.otherNearbyHotels')}
                          </summary>
                          <ul className="mt-1.5 space-y-1">
                            {h.alternatives.map((alt, i) => (
                              <li key={i} className="flex items-baseline gap-2 text-[11.5px]">
                                {alt.link ? (
                                  <a href={alt.link} target="_blank" rel="noreferrer noopener"
                                    className="font-bold text-[#0172cb] hover:underline truncate">{alt.name}</a>
                                ) : (
                                  <span className="font-bold text-[#252a31] truncate">{alt.name}</span>
                                )}
                                {alt.nightly && <span className="shrink-0 text-[#252a31] font-black">{alt.nightly}</span>}
                                <span className="shrink-0 text-[#697d95] font-semibold">
                                  {fill(t('tripPlan.altWalkable'), { count: alt.walkableCount })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {h.bookLink && (
                        <a href={h.bookLink} target="_blank" rel="noreferrer noopener"
                          className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0172cb] hover:bg-[#015ba3] text-white text-[11px] font-black active:scale-95 transition">
                          {t('tripPlan.bookHotel')} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Budget breakdown */}
            <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-3">
                <Wallet className="w-3.5 h-3.5 text-[#0172cb]" /> {fill(t('tripPlan.whereMoneyGoes'), { total: totalNice })}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                {STAT_ROWS.map((s, i) => {
                  const val = plan?.budgetBreakdown?.[s.key] ?? Math.round(item.price / STAT_ROWS.length);
                  return (
                    <div key={i} className="group bg-gradient-to-b from-white to-[#eef2f5] border border-[#e8edf1] rounded-xl p-3 text-center transition-all hover:border-[#cfe2f7] hover:shadow-soft">
                      <div className="w-8 h-8 rounded-lg bg-[#e8f4fd] flex items-center justify-center mx-auto mb-1.5 transition-colors group-hover:bg-[#d6ebfb]">
                        <s.icon className="w-4 h-4 text-[#0172cb]" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-black text-[#697d95]">{t(`tripPlan.stat.${s.statKey}`)}</div>
                      <div className="text-[14px] font-black text-[#252a31]"><Price amount={val} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day-by-day plan */}
            <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-black text-[#252a31]">{t('tripPlan.dayByDay')}</h3>
                {plan?.source && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0172cb] bg-[#e8f4fd] px-2 py-1 rounded-md">
                    {plan.source === 'grok' ? t('tripPlan.sourceAi') : t('tripPlan.sourceSmart')}
                  </span>
                )}
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0172cb] mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-[#4a5867]">
                    {isAiAvailable() ? t('tripPlan.buildingAi') : t('tripPlan.buildingSmart')}
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl note-danger text-danger text-[13px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  <button onClick={runGenerate} className="ml-auto text-[12px] font-black underline">{t('tripPlan.retry')}</button>
                </div>
              )}

              {!loading && plan?.days?.length > 0 && (() => {
                const totalDayCosts = plan.days.reduce((s, x) => s + (Number(x.cost) || 0), 0);
                return (
                <div className="space-y-3">
                  {/* Running budget tracker */}
                  <div className="rounded-xl border border-[#dfe7ec] bg-gradient-to-br from-white to-[#eef2f5] px-4 py-3.5 flex items-center gap-3 flex-wrap shadow-soft">
                    <Wallet className="w-4 h-4 text-[#0172cb] shrink-0" />
                    <div className="text-[12px] font-black uppercase tracking-widest text-[#697d95]">{t('tripPlan.spendingPlan')}</div>
                    <div className="flex-1 min-w-32">
                      <div className="h-2.5 bg-[#e8edf1] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${totalDayCosts > Number(item.price) ? 'bg-[#b3402e]' : 'bg-gradient-to-r from-[#00a58e] to-[#009882]'}`}
                          style={{ width: `${Math.min(100, (totalDayCosts / Math.max(1, Number(item.price))) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-[12px] font-black text-[#252a31]">
                      {fmt(totalDayCosts)} <span className="text-[#697d95] font-bold">/ {fmt(item.price)}</span>
                    </div>
                    {totalDayCosts <= Number(item.price) && (
                      <span className="text-[10px] font-black text-[#008009] bg-[#e8f5e9] px-2 py-0.5 rounded">
                        {fill(t('tripPlan.buffer'), { amount: fmt(Number(item.price) - totalDayCosts) })}
                      </span>
                    )}
                  </div>

                  {plan.days.map((d, dayIdx) => {
                    const dayMap = dayMapsUrl(d);
                    const runningTotal = plan.days.slice(0, dayIdx + 1).reduce((s, x) => s + (Number(x.cost) || 0), 0);
                    return (
                    <motion.div key={d.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className="relative rounded-xl border border-[#dfe7ec] bg-[#eef2f5] overflow-hidden shadow-soft">
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0172cb] to-[#252a31]" />
                      <div className="px-4 py-3 pl-5 bg-white border-b border-[#e8edf1] flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#252a31] to-[#0172cb] text-white text-[13px] font-black flex items-center justify-center shrink-0 shadow-soft">D{d.day}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0172cb]">{fill(t('tripPlan.dayLabel'), { day: d.day })}</span>
                            {d.weekday && <span className="text-[10px] font-bold text-[#697d95]">· {d.weekday}{d.date ? `, ${d.date.split(',').slice(-1)[0].trim()}` : ''}</span>}
                            {d.label && <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-2 py-0.5 rounded-md">{d.label}</span>}
                            {d.weather && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                d.weather.precipitation > 2 ? 'text-[#0172cb] bg-[#e8f4fd]' : 'text-[#8a6d1a] bg-[#fdf3d7]'
                              }`} title={d.weather.source === 'forecast' ? t('tripPlan.weather.forecast') : t('tripPlan.weather.climate')}>
                                {d.weather.precipitation > 2 ? '🌧' : '☀️'} {Math.round(d.weather.tempMax)}°/{Math.round(d.weather.tempMin ?? d.weather.tempMax)}°
                                {d.weather.precipitation > 2 ? ` · ${t('tripPlan.weather.rainLikely')}` : ''}
                              </span>
                            )}
                          </div>
                          <div className="text-[14px] font-black text-[#252a31] mt-0.5">{d.title || `${t('tripPlan.day')} ${d.day}`}</div>
                          <div className="text-[12px] text-[#4a5867] font-semibold">
                            {d.place || item.destination}{d.cost ? ` · ${fill(t('tripPlan.estCost'), { cost: fmt(d.cost) })}` : ''}
                          </div>
                        </div>
                        {dayMap && (
                          <a href={dayMap} target="_blank" rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#e8f4fd] hover:bg-[#d6ebfb] text-[#0172cb] text-[11px] font-black transition"
                            title="Open this day's route in Google Maps">
                            <MapIcon className="w-3.5 h-3.5" /> {t('tripPlan.dayMap')} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {d.transportNote && (
                        <div className="px-4 py-2 bg-[#e8f4fd] border-b border-[#d6ebfb] flex items-start gap-2 text-[12px] text-[#252a31] font-semibold">
                          <Bus className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {d.transportNote}
                        </div>
                      )}

                      {Array.isArray(d.events) && d.events.length > 0 && (
                        <ol className="relative">
                          {d.events.map((ev, j) => {
                            const isLast = j === d.events.length - 1;
                            const mapUrl = mapsUrlFor(ev);
                            return (
                            <li key={j} className="relative">
                              <div className="px-4 py-3 flex items-start gap-3">
                                <div className="w-14 shrink-0 text-[#0172cb] font-black text-[13px] tabular-nums pt-0.5">
                                  {ev.time || '—'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="text-[14px] font-black text-[#252a31] leading-snug">{ev.name}</div>
                                    {ev.type && <span className="px-1.5 py-0.5 rounded bg-[#e8f4fd] text-[#0172cb] text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap">{ev.type}</span>}
                                  </div>

                                  {ev.address && (
                                    <a href={mapUrl || '#'} target="_blank" rel="noreferrer noopener"
                                      className="flex items-start gap-1.5 text-[12px] text-[#252a31] font-semibold hover:text-[#0172cb] leading-snug break-words group/loc"
                                      title="Open in Google Maps">
                                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#00a58e]" />
                                      <span className="break-words">
                                        <span className="text-[#697d95] font-black uppercase tracking-wider text-[10px] mr-1">{t('tripPlan.location')}</span>
                                        <span className="text-[#0172cb] group-hover/loc:underline">{ev.address}</span>
                                        {ev.district && <span className="text-[#4a5867]"> · {ev.district}</span>}
                                        <ExternalLink className="inline w-2.5 h-2.5 ml-1 mb-0.5 opacity-50" />
                                      </span>
                                    </a>
                                  )}

                                  <div className="flex items-start gap-1.5 text-[12px] text-[#252a31] font-semibold mt-0.5">
                                    <span className="text-[14px] leading-none mt-0.5">💰</span>
                                    <span>
                                      <span className="text-[#697d95] font-black uppercase tracking-wider text-[10px] mr-1">{t('tripPlan.cost')}</span>
                                      <span className={
                                        !ev.price ? 'text-[#697d95] font-bold italic'
                                        : /free/i.test(ev.price) ? 'text-[#008009] font-black'
                                        : 'text-[#252a31] font-black'
                                      }>
                                        {Number.isFinite(ev.priceUsd) ? fmt(ev.priceUsd) : (ev.price || t('tripPlan.priceOnSite'))}
                                      </span>
                                      {ev.airline && <span className="text-[#4a5867] font-bold ml-2">· {ev.airline}</span>}
                                      {ev.duration && <span className="text-[#697d95] font-bold ml-2">· {ev.duration}</span>}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Transport hint connecting to next event */}
                              {!isLast && ev.transportToNext && (
                                <div className="ml-12 pl-3 pr-4 py-1.5 border-l-2 border-dashed border-[#d6ebfb] flex items-center gap-2 text-[11px] text-[#4a5867] font-semibold">
                                  <Navigation className="w-3 h-3 text-[#0172cb] shrink-0" />
                                  <span className="truncate">{ev.transportToNext}</span>
                                </div>
                              )}
                            </li>
                            );
                          })}
                        </ol>
                      )}

                      {d.halalRestaurant && (() => {
                        const halalUrl = mapsUrlFromAddress(`${d.halalRestaurant.name}, ${d.halalRestaurant.address}`);
                        return (
                          <a href={halalUrl || '#'} target="_blank" rel="noreferrer noopener"
                            className="px-4 py-2.5 bg-[#f0fdf4] border-t border-[#bbf7d0] flex items-start gap-3 hover:bg-[#e0f7e2] transition">
                            <Utensils className="w-4 h-4 text-[#008009] mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px] font-black text-[#155724]">🥩 {d.halalRestaurant.name}</div>
                              <div className="text-[11px] text-[#155724]/85 font-semibold flex items-start gap-1">
                                <MapPin className="w-2.5 h-2.5 mt-0.5 shrink-0" /> {d.halalRestaurant.address} · {d.halalRestaurant.avgPrice}
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#008009] mt-1 shrink-0" />
                          </a>
                        );
                      })()}

                      {/* Daily spend summary */}
                      <div className="px-4 py-2.5 bg-white border-t border-[#dfe7ec] flex items-center justify-between flex-wrap gap-2">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#697d95] flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-[#0172cb]" /> {t('tripPlan.spentToday')}
                        </div>
                        <div className="flex items-center gap-3 text-[12px] font-black">
                          <span className="text-[#252a31]">{fmt(Number(d.cost) || 0)}</span>
                          <span className="text-[#697d95] font-bold">·</span>
                          <span className="text-[#4a5867]">
                            {t('tripPlan.runningTotal')} <span className="text-[#252a31]">{fmt(runningTotal)}</span>
                            <span className="text-[#697d95] font-bold"> / {fmt(item.price)}</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
                );
              })()}
            </div>

            {/* ── Know before you go — AI country brief + halal scorecard ── */}
            {brief && (() => {
              const ICONS = { plug: Plug, sim: Smartphone, money: Wallet, tip: HandCoins, water: Droplets, dress: Shirt };
              return (
                <div className="bg-white border border-[#dfe7ec] rounded-2xl shadow-soft overflow-hidden">
                  <div className="bg-[#252a31] px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#61d1bf] shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-black text-white leading-tight">
                        {fill(t('tripPlan.brief.title'), { destination: item.destination || item.name })}
                      </h3>
                      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">{t('tripPlan.brief.sub')}</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#61d1bf]/70 ml-auto shrink-0" />
                  </div>

                  <div className="p-5">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {brief.essentials.map((e) => {
                        const Icon = ICONS[e.key] || Compass;
                        return (
                          <div key={e.key} className="flex items-start gap-3 p-3 rounded-xl bg-[#eef2f5] border border-[#e8edf1]">
                            <div className="w-9 h-9 rounded-lg bg-white border border-[#dfe7ec] flex items-center justify-center text-[#0172cb] shrink-0">
                              <Icon className="w-[18px] h-[18px]" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-black text-[#697d95] uppercase tracking-wider">{t(`tripPlan.brief.k.${e.key}`)}</div>
                              <div className="text-[13px] font-black text-[#252a31] leading-snug">{e.value}</div>
                              {e.note && <div className="text-[11.5px] text-[#4a5867] font-semibold leading-snug mt-0.5">{e.note}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(brief.halal.foodScore || brief.halal.foodNote || brief.halal.mosques) && (
                      <div className="mt-3 rounded-xl bg-[#e6f6f3] border border-[#bfe8df] p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-[11px] font-black uppercase tracking-widest text-[#007f6d]">🥩 {t('tripPlan.brief.halalTitle')}</span>
                          {brief.halal.foodScore && (
                            <span className="flex items-center gap-1 ml-auto" title={`${brief.halal.foodScore}/5`}>
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} className={`w-2 h-2 rounded-full ${i <= brief.halal.foodScore ? 'bg-[#00a58e]' : 'bg-[#bfe8df]'}`} />
                              ))}
                              <span className="text-[11px] font-black text-[#007f6d] ml-1">{brief.halal.foodScore}/5</span>
                            </span>
                          )}
                        </div>
                        {brief.halal.foodNote && <p className="text-[12.5px] text-[#00584c] font-semibold leading-snug">{brief.halal.foodNote}</p>}
                        {brief.halal.mosques && <p className="text-[12.5px] text-[#00584c] font-medium leading-snug mt-1">🕌 {brief.halal.mosques}</p>}
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {brief.halal.airportPrayerRoom != null && (
                            <span className="text-[10.5px] font-black px-2 py-1 rounded-md bg-white/70 text-[#00584c]">
                              ✈️ {brief.halal.airportPrayerRoom ? t('tripPlan.brief.prayerRoomYes') : t('tripPlan.brief.prayerRoomNo')}
                            </span>
                          )}
                          {brief.halal.ramadanNote && (
                            <span className="text-[10.5px] font-bold px-2 py-1 rounded-md bg-white/70 text-[#00584c] flex items-center gap-1">
                              <Moon className="w-3 h-3" /> {brief.halal.ramadanNote}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(brief.visaHint || brief.safetyNote) && (
                      <div className="mt-3 space-y-1.5">
                        {brief.visaHint && (
                          <p className="text-[12px] text-[#4a5867] font-semibold leading-snug">🛂 {brief.visaHint}</p>
                        )}
                        {brief.safetyNote && (
                          <p className="text-[12px] text-[#4a5867] font-semibold leading-snug">🛡 {brief.safetyNote}</p>
                        )}
                        <p className="text-[10.5px] text-[#8fa1b3] font-semibold">{t('tripPlan.brief.disclaimer')}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── Emergency contacts (per country) ── */}
            {plan?.emergency && (
              <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-[#faeae6] flex items-center justify-center text-danger shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-black text-[#252a31]">
                      {fill(t('tripPlan.emergencyTitle'), { country: plan.emergency.country })} {plan.emergency.flag}
                    </h3>
                    <p className="text-[11px] text-[#697d95] font-bold uppercase tracking-widest">
                      {t('tripPlan.emergencySub')}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {(plan.emergency.numbers || []).map((n, i) => (
                    <a key={i} href={`tel:${String(n.number).replace(/\s/g, '')}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#eef2f5] border border-[#dfe7ec] hover:border-[#0172cb] hover:bg-[#e8f4fd] transition group">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#dfe7ec] flex items-center justify-center text-[18px] shrink-0">
                        {n.icon || '☎️'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-black text-[#697d95] uppercase tracking-wider truncate">{n.service}</div>
                        <div className="text-[16px] font-black text-[#252a31] tabular-nums">{n.number}</div>
                        {n.note && <div className="text-[10.5px] text-[#4a5867] font-semibold truncate">{n.note}</div>}
                      </div>
                      <Phone className="w-4 h-4 text-[#697d95] group-hover:text-[#0172cb] transition" />
                    </a>
                  ))}
                </div>
                {plan.emergency.tips?.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl note-warn text-[12px] text-[#7c4a00] font-semibold flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      {plan.emergency.tips.map((t, i) => <p key={i}>{t}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Travel tips */}
            {plan?.travelTips?.length > 0 && (
              <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#00a58e]" />
                  <h3 className="text-[16px] font-black text-[#252a31]">{t('tripPlan.localTips')}</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                  {plan.travelTips.map((tip, i) => (
                    <li key={i} className="text-[13px] text-[#252a31] font-semibold flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#00a58e] mt-0.5 shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right: Actions ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#dfe7ec] rounded-2xl overflow-hidden sticky top-[80px] shadow-float no-print">

              <div className="relative bg-gradient-to-br from-[#1c2127] to-[#0172cb] text-white px-5 py-5 overflow-hidden">
                <div className="absolute -top-12 -right-8 w-40 h-40 rounded-full bg-[#00a58e]/15 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-0.5">{t('tripPlan.totalTripCost')}</div>
                  <div className="text-[30px] font-black text-gradient-gold leading-none">{totalNice}</div>
                  <div className="text-[11px] font-bold text-white/70 mt-1.5">{fill(t(travelers === 1 ? 'tripPlan.forDaysTravelers' : 'tripPlan.forDaysTravelersPlural'), { days: item.duration, count: travelers })}</div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <Field label={t('tripPlan.yourName')} icon={<Users className="w-3.5 h-3.5" />}>
                  <input type="text" placeholder={t('tripPlan.yourNamePh')} value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#252a31] placeholder:text-[#94a3af]" />
                </Field>

                <CityAutocomplete
                  className="w-full"
                  icon={<Plane className="w-3.5 h-3.5" />}
                  label={t('tripPlan.fromCity')}
                  placeholder={t('tripPlan.fromCityPh')}
                  value={fromCity}
                  onChange={setFromCity}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('tripPlan.depart')} icon={<Calendar className="w-3.5 h-3.5" />}>
                    <input type="date" value={travelDate} min={new Date().toISOString().split('T')[0]}
                      onChange={e => {
                        const v = e.target.value;
                        setTravelDate(v);
                        // Slide return date along to keep duration the same
                        if (v && item?.duration) {
                          const d = new Date(v); d.setDate(d.getDate() + Math.max(0, Number(item.duration) - 1));
                          if (!isNaN(d)) setReturnDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#252a31]" />
                  </Field>
                  <Field label={t('tripPlan.return')} icon={<Calendar className="w-3.5 h-3.5" />}>
                    <input type="date" value={returnDate} min={travelDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#252a31]" />
                  </Field>
                </div>

                <Field label={t('tripPlan.tripPurpose')} icon={<Sparkles className="w-3.5 h-3.5" />}>
                  <select value={purpose} onChange={e => setPurpose(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px] font-semibold text-[#252a31] cursor-pointer">
                    <option value="Tourism and cultural exploration">{t('tripPlan.purposeTourism')}</option>
                    <option value="Family vacation">{t('tripPlan.purposeFamily')}</option>
                    <option value="Honeymoon">{t('tripPlan.purposeHoneymoon')}</option>
                    <option value="Adventure & nature">{t('tripPlan.purposeAdventure')}</option>
                    <option value="Business + leisure">{t('tripPlan.purposeBusiness')}</option>
                    <option value="Religious pilgrimage">{t('tripPlan.purposeReligious')}</option>
                    <option value="Shopping & food">{t('tripPlan.purposeShopping')}</option>
                  </select>
                </Field>

                <Field label={t('tripPlan.travelers')} icon={<Users className="w-3.5 h-3.5" />}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTravelers(t => Math.max(1, t - 1))}
                      className="w-7 h-7 rounded-md bg-[#e8f4fd] text-[#0172cb] text-[16px] font-black hover:bg-[#d6ebfb] active:scale-95 transition">−</button>
                    <span className="text-[16px] font-black text-[#252a31] w-8 text-center">{travelers}</span>
                    <button type="button" onClick={() => setTravelers(t => Math.min(9, t + 1))}
                      className="w-7 h-7 rounded-md bg-[#e8f4fd] text-[#0172cb] text-[16px] font-black hover:bg-[#d6ebfb] active:scale-95 transition">+</button>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={handleSave} disabled={saved}
                    className={`px-3 py-3 rounded-xl text-[12px] font-black transition active:scale-95 flex items-center justify-center gap-1.5 ${saved ? 'bg-[#e8f5e9] text-[#008009] cursor-default' : 'btn-gold'}`}>
                    {saved ? (<><Check className="w-4 h-4" /> {t('tripPlan.saved')}</>) : (<><Save className="w-4 h-4" /> {t('tripPlan.savePlan')}</>)}
                  </button>
                  <button onClick={handleShare}
                    className="px-3 py-3 rounded-xl border-2 border-[#0172cb] text-[#0172cb] text-[12px] font-black hover:bg-[#e8f4fd] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Share2 className="w-4 h-4" /> {t('tripPlan.share')}
                  </button>
                  <button onClick={handlePrint}
                    className="px-3 py-3 rounded-xl border-2 border-[#dfe7ec] text-[#252a31] text-[12px] font-black hover:border-[#0172cb] hover:bg-[#e8f4fd] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Printer className="w-4 h-4" /> {t('tripPlan.print')}
                  </button>
                  <button onClick={handleDownload}
                    className="px-3 py-3 rounded-xl border-2 border-[#dfe7ec] text-[#252a31] text-[12px] font-black hover:border-[#0172cb] hover:bg-[#e8f4fd] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> {t('tripPlan.pdf')}
                  </button>
                </div>

                {isAiAvailable() && plan && (
                  <div className="pt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0172cb]" /> {t('tripPlan.refine.title')}
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefine(); }}
                        placeholder={t('tripPlan.refine.placeholder')}
                        disabled={refining || loading}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus:border-[#0172cb] outline-none text-[12px] font-semibold text-[#252a31] placeholder:text-[#8fa1b3] disabled:opacity-50 bg-white"
                      />
                      <button onClick={handleRefine} disabled={refining || loading || !refineText.trim()}
                        className="px-3.5 py-2.5 rounded-xl bg-[#0172cb] hover:bg-[#015fa8] text-white text-[12px] font-black transition active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1.5">
                        {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {refining ? t('tripPlan.refine.working') : t('tripPlan.refine.button')}
                      </button>
                    </div>
                    {prevPlan && !refining && (
                      <button onClick={handleUndoRefine}
                        className="mt-1.5 text-[11px] font-bold text-[#697d95] hover:text-[#0172cb] underline underline-offset-2 transition">
                        ↩ {t('tripPlan.refine.undo')}
                      </button>
                    )}
                  </div>
                )}

                <button onClick={runGenerate} disabled={loading || refining}
                  className="w-full py-2.5 rounded-xl bg-[#e8f4fd] hover:bg-[#d6ebfb] text-[#0172cb] text-[12px] font-black transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <Sparkles className="w-3.5 h-3.5" /> {loading ? t('tripPlan.regenerating') : t('tripPlan.regenerate')}
                </button>
              </div>

              <div className="bg-[#eef2f5] border-t border-[#dfe7ec] px-5 py-3 flex items-start gap-2">
                <Heart className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-semibold text-[#4a5867] leading-snug">
                  {t('tripPlan.footerNote')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Header stat tile ─────────────────────────────────────── */
const HeaderStat = ({ icon, label, value }) => (
  <div className="bg-[#eef2f5] border border-[#e8edf1] rounded-xl px-3 py-2.5">
    <div className="flex items-center gap-1 text-[9.5px] font-black uppercase tracking-widest text-[#697d95] mb-1">
      <span className="text-[#0172cb]">{icon}</span>{label}
    </div>
    <div className="text-[13px] font-black text-[#252a31] leading-tight">{value || '—'}</div>
  </div>
);

/* ── Small field shell ─────────────────────────────────────── */
const Field = ({ icon, label, children }) => (
  <label className="block bg-white border border-[#dfe7ec] rounded-xl px-3 py-2 focus-within:border-[#0172cb] focus-within:ring-4 focus-within:ring-[#0172cb]/10 transition">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">
      <span className="text-[#0172cb]">{icon}</span>{label}
    </div>
    {children}
  </label>
);

/* ── Share text builder ─────────────────────────────────────── */
function buildShareText({ item, plan, travelDate, travelers, fmt }) {
  const lines = [
    `🌍 MAFTRAVEL trip plan · ${item.destination || item.name}`,
    `Duration: ${item.duration} days  ·  Budget: ${fmt(item.price)}  ·  Travelers: ${travelers}`,
    travelDate ? `Start date: ${fmtDate(travelDate)}` : null,
    '',
    'Day-by-day:',
    ...(plan?.days || []).slice(0, 12).map(d =>
      `  D${d.day} · ${d.title || d.place || 'Day plan'}${d.cost ? ` (est. ${fmt(d.cost)})` : ''}`
    ),
    '',
    'Plan built with MAFTRAVEL — https://maftravel.com',
  ];
  return lines.filter(Boolean).join('\n');
}

/* ── Printable HTML — Berlin-style layout ─────────────────── */
function buildPdfHtml({ item, plan, travelers, travelDate, name }) {
  let runningPdfTotal = 0;
  const dayBlocks = (plan?.days || []).map(d => {
    runningPdfTotal += Number(d.cost) || 0;
    return `
    <div class="day">
      <h3>📅 Day ${d.day} – ${escapeHtml(d.weekday || '')}${d.date ? `, ${escapeHtml(d.date)}` : ''}${d.weather ? ` · ${Math.round(d.weather.tempMax)}°/${Math.round(d.weather.tempMin ?? d.weather.tempMax)}°C` : ''}${d.label ? ` <span class="label">${escapeHtml(d.label)}</span>` : ''}</h3>
      <p class="muted">${escapeHtml(d.title || '')}${d.place ? ` · ${escapeHtml(d.place)}` : ''}</p>
      ${d.transportNote ? `<p class="transport">🚌 ${escapeHtml(d.transportNote)}</p>` : ''}
      ${Array.isArray(d.events) ? `<ul>${d.events.map((ev, i, arr) =>
        `<li><strong>${escapeHtml(ev.time || '')}</strong> — ${escapeHtml(ev.name || '')}${
          ev.address ? `<br><span class="addr"><strong>📍 Location:</strong> ${escapeHtml(ev.address)}${ev.district ? ` · ${escapeHtml(ev.district)}` : ''}</span>` : ''
        }<br><span class="cost"><strong>💰 Cost:</strong> ${escapeHtml(ev.price || 'check price on site')}${ev.airline ? ` · ${escapeHtml(ev.airline)}` : ''}${ev.duration ? ` · ${escapeHtml(ev.duration)}` : ''}</span>${
          i < arr.length - 1 && ev.transportToNext ? `<br><span class="next">→ ${escapeHtml(ev.transportToNext)}</span>` : ''
        }</li>`
      ).join('')}</ul>` : ''}
      ${d.halalRestaurant ? `<div class="halal">🥩 ${escapeHtml(d.halalRestaurant.name)}<br>📍 ${escapeHtml(d.halalRestaurant.address || '')} · 💰 ${escapeHtml(d.halalRestaurant.avgPrice || '')}</div>` : ''}
      <div class="day-total">💰 Spent today: <strong>$${(Number(d.cost) || 0).toLocaleString()}</strong> · Running: $${runningPdfTotal.toLocaleString()} / $${Number(item.price).toLocaleString()}</div>
    </div>
  `;}).join('');

  const f = plan?.flights;
  const flightsBlock = f
    ? `<h2>✈️ Your flights — ${f.isLive ? `live fare (${escapeHtml(f.source)})` : 'estimate'}</h2>
       <div class="hotel">
         ${[f.outbound, f.inbound].filter(Boolean).map((leg) =>
           `<strong>${escapeHtml(leg.from)} → ${escapeHtml(leg.to)}</strong>${leg.date ? ` · ${escapeHtml(leg.date)}` : ''}${
             leg.airline ? ` · ${escapeHtml(leg.airline)}` : ''}${leg.duration ? ` · ${escapeHtml(leg.duration)}` : ''} — $${Number(leg.price).toLocaleString()}`
         ).join('<br>')}
         <br><strong>Round trip${f.travelers > 1 ? ` × ${f.travelers} travellers` : ''}: $${Number(f.total).toLocaleString()}</strong>
       </div>`
    : '';

  const prox = plan?.hotel?.proximity;
  const proximityLine = prox
    ? `<br>🚶 ${prox.basis === 'coords'
          ? `${prox.walkableCount} of ${prox.totalStops} stops within a 15-min walk`
          : `${prox.walkableCount} of ${prox.totalStops} stops in this district`}${
        prox.nearest.length
          ? ` — ${prox.nearest.map(s => escapeHtml(
              !Number.isFinite(s.walkMin) ? s.name
                : s.km <= SAME_BLOCK_KM ? `${s.name} (right by the hotel)`
                : `${s.name} (${s.walkMin} min)`,
            )).join(', ')}`
          : ''}`
    : '';

  const hotelBlock = plan?.hotel && (plan.hotel.name || plan.hotel.address)
    ? `<h2>🏨 Your stay</h2>
       <div class="hotel">
         <strong>${escapeHtml(plan.hotel.name)}</strong>${plan.hotel.stars ? ` · ${escapeHtml(plan.hotel.stars)}★` : ''}${plan.hotel.pricePerNight ? ` · ${escapeHtml(plan.hotel.pricePerNight)}` : ''}<br>
         ${plan.hotel.address ? `📍 ${escapeHtml(plan.hotel.address)}` : ''}${plan.hotel.area ? ` · ${escapeHtml(plan.hotel.area)}` : ''}${proximityLine}
       </div>`
    : '';

  const emergency = plan?.emergency
    ? `<h2>🚨 Emergency contacts — ${escapeHtml(plan.emergency.country)} ${escapeHtml(plan.emergency.flag || '')}</h2>
       <ul class="emerg">${(plan.emergency.numbers || []).map(n =>
        `<li><strong>${escapeHtml(n.icon || '☎️')} ${escapeHtml(n.service)}:</strong> ${escapeHtml(n.number)}${n.note ? ` <span class="muted">(${escapeHtml(n.note)})</span>` : ''}</li>`
      ).join('')}</ul>
      ${plan.emergency.tips?.length ? `<p class="muted">${plan.emergency.tips.map(escapeHtml).join(' · ')}</p>` : ''}`
    : '';

  const h = plan?.header || {};
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MAFTRAVEL · ${escapeHtml(item.destination || item.name)}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#252a31;padding:32px;max-width:820px;margin:auto;}
    h1{color:#252a31;font-size:30px;margin:6px 0 4px} h2{color:#252a31;font-size:18px;margin:28px 0 8px;border-bottom:2px solid #dfe7ec;padding-bottom:4px}
    h3{color:#252a31;margin:10px 0 2px;font-size:15px} h3 .label{background:#e6f6f3;color:#007f6d;padding:2px 6px;border-radius:5px;font-size:11px;margin-left:4px}
    ul{margin:6px 0 14px 18px;padding:0} li{margin-bottom:6px;font-size:12.5px;line-height:1.45}
    .muted{color:#4a5867;font-size:12px} .badge{background:#00a58e;color:#252a31;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;display:inline-block;margin-right:6px}
    .summary{background:#e8f4fd;border-radius:10px;padding:14px;margin:12px 0 20px}
    .summary strong{color:#252a31}
    .day{padding:10px 0;border-top:1px solid #e8edf1}
    .addr{color:#252a31;font-size:12px} .addr strong{color:#252a31}
    .cost{color:#252a31;font-size:12px} .cost strong{color:#252a31}
    .next{color:#0172cb;font-size:11px;font-style:italic}
    .transport{background:#e8f4fd;border:1px solid #d6ebfb;padding:6px 10px;border-radius:6px;color:#252a31;font-size:12px;margin:0 0 8px 0}
    .hotel{background:#e6f6f3;border:1px solid #61d1bf;padding:10px 12px;border-radius:8px;font-size:13px;margin:6px 0 16px}
    .halal{background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 10px;border-radius:6px;font-size:12px;color:#155724;margin-top:6px}
    .day-total{background:#eef2f5;border:1px solid #dfe7ec;padding:6px 10px;border-radius:6px;font-size:12px;margin-top:8px;text-align:right}
    .emerg li{font-size:13px}
    .footer{margin-top:28px;padding-top:14px;border-top:2px solid #dfe7ec;color:#697d95;font-size:11px;text-align:center}
  </style></head><body>
    <span class="badge">MAFTRAVEL · Free Trip Plan</span>
    <h1>${escapeHtml(h.title || `Travel Plan – ${item.destination || item.name}`)}</h1>
    <div class="summary">
      <strong>Travel Dates:</strong> ${escapeHtml(h.dates || (travelDate ? fmtDate(travelDate) : `${item.duration || ''} days`))}<br>
      <strong>Route:</strong> ${escapeHtml(h.route || (item.destination || item.name))}<br>
      <strong>Purpose:</strong> ${escapeHtml(h.purpose || 'Tourism and cultural exploration')}<br>
      <strong>Traveler:</strong> ${escapeHtml(name || 'Guest')} · ${travelers} pax · Total budget $${escapeHtml(String(item.price))}
    </div>
    ${item.includes?.length ? `<h2>What's included</h2><ul>${item.includes.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}
    ${flightsBlock}
    ${hotelBlock}
    <h2>Day-by-day plan</h2>
    ${dayBlocks || '<p class="muted">No detailed plan generated yet.</p>'}
    ${emergency}
    ${plan?.travelTips?.length ? `<h2>Local tips</h2><ul>${plan.travelTips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    <div class="footer">Built with MAFTRAVEL · https://maftravel.com · We help you plan, not pay.</div>
  </body></html>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
