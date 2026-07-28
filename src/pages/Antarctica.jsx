import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Snowflake, Ship, Plane, Crown, Compass, Calendar, Check, Sparkles,
  ArrowRight, Globe, Users, Sun, Binoculars, Lightbulb,
  PlaneTakeoff, PlaneLanding, CalendarDays, Wand2,
} from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import useSEO from '../hooks/useSEO';
import { handleImgError } from '../utils/imageFallback';
import { useCompactPriceFormatter } from '../components/Price';
import CityAutocomplete from '../features/flights/CityAutocomplete';
import GoldDust from '../components/fx/GoldDust';
import { getWeatherForDates } from '../services/weatherForecast';
import { pickBestValueIndex } from '../utils/dateFareCalendar';
import { wmoInfo } from '../utils/wmoWeatherCodes';
import { predictFlightPrice } from '../services/travelServicesService';

const HERO_IMG = 'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=1800&q=80';

const ROUTE_IMGS = [
  'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551415923-a2297c7fda79?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=900&q=80',
];

/* ── Polar Atlas palette — this page runs colder than the rest of the site:
   deep glacial navy surfaces + a single ice-blue accent. Teal appears only on
   system CTAs (btn-gold), so the cold layer keeps one voice. ── */
const POLAR_HERO = {
  background: [
    'radial-gradient(54% 62% at 84% 6%, rgba(96,177,208,0.26) 0%, transparent 70%)',
    'radial-gradient(44% 54% at 6% 92%, rgba(23,80,106,0.55) 0%, transparent 72%)',
    'radial-gradient(36% 42% at 40% 30%, rgba(159,214,232,0.10) 0%, transparent 65%)',
    'linear-gradient(168deg, #04101f 0%, #0a2033 42%, #0f3348 74%, #175069 108%)',
  ].join(', '),
};
const POLAR_PANEL = {
  background: 'linear-gradient(150deg, #0a1c2c 0%, #071320 55%, #0e2c40 100%)',
};
const ICE_TEXT = {
  backgroundImage: 'linear-gradient(135deg, #eaf8fd 0%, #9fd6e8 48%, #5fa9c6 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

/* Cold section eyebrow — replaces the site-wide teal eyebrow-lux inside the
   glacial layer so this page keeps a single ice accent. */
function Eyebrow({ icon: Icon, children, light = false }) {
  return (
    <div className={`flex items-center gap-2 text-[10.5px] font-black uppercase tracking-[0.24em] mb-2 ${light ? 'text-[#9fd6e8]' : 'text-[#1f6d94]'}`}>
      <Icon className="w-3.5 h-3.5" /> <span>{children}</span>
      <span className={`h-px w-12 ${light ? 'bg-gradient-to-r from-[#9fd6e8]/60 to-transparent' : 'bg-gradient-to-r from-[#1f6d94]/50 to-transparent'}`} />
    </div>
  );
}

/* Jagged iceberg silhouette that cuts the dark hero into the light page —
   two layers for depth (a faint back ridge behind the page-colored front). */
function IceHorizon() {
  return (
    <div className="relative w-full pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="block w-full h-[56px] md:h-[92px]">
        <path
          d="M0,100 L0,70 L90,46 L190,62 L300,34 L420,56 L540,26 L660,50 L780,20 L900,48 L1020,32 L1150,54 L1270,38 L1360,56 L1440,44 L1440,100 Z"
          fill="rgba(200,230,242,0.10)"
        />
        <path
          d="M0,100 L0,80 L110,58 L220,72 L340,46 L470,66 L590,38 L710,60 L830,32 L950,58 L1070,44 L1190,64 L1310,50 L1440,66 L1440,100 Z"
          fill="#f5f7f9"
        />
      </svg>
    </div>
  );
}

/* Base fare per person by expedition length; the departure-date factor is
   applied on top (last-minute flights cost more, mid-window sailings less). */
const BASE_BY_DAYS = { 8: 8990, 9: 9490, 10: 9990 };
const DURATIONS = [8, 9, 10];
const DATE_OFFSETS = [
  { off: 0,  factor: 1.18 },
  { off: 2,  factor: 1.04 },
  { off: 5,  factor: 0.99 },
  { off: 9,  factor: 0.95 },
  { off: 14, factor: 0.90 },
  { off: 21, factor: 0.93 },
];

const cleanCity = (s) => String(s || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fareFor = (days, factor) => Math.round((BASE_BY_DAYS[days] || BASE_BY_DAYS[10]) * factor / 10) * 10;

/* Dedicated landing for travelers dreaming of the White Continent.
   CTAs reuse the existing flows: the AI planner deep-link (same shape the
   Home AI tab builds) and the WhatsApp expert channel. */
export default function Antarctica() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const fmtCompact = useCompactPriceFormatter();

  useSEO({
    title: t('antarctica.seo.title'),
    description: t('antarctica.seo.description'),
    url: 'https://maftravel.com/antarctica',
    keywords: ['Antarctica cruise', 'Antarctica expedition', 'Drake Passage', 'Ushuaia', 'polar travel', 'white continent'],
  });

  /* ── Expedition builder state ── */
  const [fromCity, setFromCity]     = useState('');   // stays empty until the traveler picks
  const [returnCity, setReturnCity] = useState('');   // empty → same as departure
  const [days, setDays]             = useState(10);

  const dateOptions = useMemo(() => {
    const now = new Date();
    return DATE_OFFSETS.map(({ off, factor }) => {
      const d = new Date(now);
      d.setDate(d.getDate() + off);
      return { off, factor, iso: toIso(d), date: d };
    });
  }, []);
  const cheapestIdx = useMemo(
    () => dateOptions.reduce((best, o, i) => (o.factor < dateOptions[best].factor ? i : best), 0),
    [dateOptions],
  );
  // null → follow the best weather+price pick; a number → traveler's manual choice
  const [pickedIdx, setPickedIdx] = useState(null);

  // Real weather (Open-Meteo forecast, or a 3-year same-day average once past
  // the forecast horizon) for every candidate departure date — this is what
  // makes the "best" date shift with actual conditions instead of a fixed offset.
  const [weatherByDate, setWeatherByDate] = useState({});
  useEffect(() => {
    let cancelled = false;
    getWeatherForDates('Antarctica', dateOptions.map((o) => o.iso)).then((map) => {
      if (!cancelled) setWeatherByDate(map);
    });
    return () => { cancelled = true; };
  }, [dateOptions]);

  const valueCandidates = useMemo(
    () => dateOptions.map((o) => ({ price: fareFor(days, o.factor), weather: weatherByDate[o.iso] || null })),
    [dateOptions, weatherByDate, days],
  );
  const bestValueIdx = useMemo(() => pickBestValueIndex(valueCandidates), [valueCandidates]);

  // Follow the best weather+price pick until the traveler manually taps a date card.
  const dateIdx = pickedIdx ?? bestValueIdx;

  // One AI-authored line about the fare trend for this exact route/month
  // (Gemini) — real per-date price/weather math above stays authoritative;
  // this is supporting market color, and quietly disappears if it fails.
  const [aiFareNote, setAiFareNote] = useState(null);
  useEffect(() => {
    const fromClean = cleanCity(fromCity);
    if (!fromClean) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const month = dateOptions[bestValueIdx]?.date?.toLocaleDateString('en', { month: 'long', year: 'numeric' });
      predictFlightPrice({ from: fromClean, to: 'Ushuaia, Argentina (Antarctica gateway)', month, lang })
        .then((r) => { if (!cancelled) setAiFareNote(r); })
        .catch(() => { if (!cancelled) setAiFareNote(null); });
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [fromCity, bestValueIdx, dateOptions, lang]);

  const fmtDay = (d, opts) => {
    try { return d.toLocaleDateString(lang || 'en', opts); }
    catch { return d.toLocaleDateString('en', opts); }
  };

  /* "In {n} days" needs numeral declension in some languages (ru: 2 дня / 5
     дней / 21 день). Dictionaries may provide per-category overrides as
     `inDays_<category>`; anything missing falls back to the base template. */
  const inDaysLabel = (n) => {
    let cat = 'other';
    try { cat = new Intl.PluralRules(lang || 'en').select(n); } catch { /* keep 'other' */ }
    const catKey = `antarctica.builder.inDays_${cat}`;
    const catVal = t(catKey);
    const tpl = (typeof catVal === 'string' && catVal !== catKey) ? catVal : t('antarctica.builder.inDays');
    return String(tpl).replace('{n}', String(n));
  };

  const selected   = dateOptions[dateIdx];
  const total      = fareFor(days, selected.factor);
  const todayFare  = fareFor(days, dateOptions[0].factor);
  const fromClean  = cleanCity(fromCity);
  const backClean  = cleanCity(returnCity) || fromClean;
  const returnDateObj = useMemo(() => {
    const d = new Date(selected.date);
    d.setDate(d.getDate() + days);
    return d;
  }, [selected, days]);

  const scrollToBuilder = () =>
    document.getElementById('expedition-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Same direct-mode deep-link the Home AI tab produces, prefilled with the
  // builder selections (route cards override days/price with their own).
  const buildPlan = (overrides = {}) => {
    if (!fromClean) {
      // No departure city yet — bring the traveler to the empty field instead
      // of silently planning from a city they never chose.
      scrollToBuilder();
      setTimeout(() => document.querySelector('#expedition-builder input')?.focus(), 350);
      return;
    }
    const d = overrides.days ?? days;
    const balance = overrides.price ?? fareFor(d, selected.factor);
    const backDate = (() => {
      const dt = new Date(selected.date);
      dt.setDate(dt.getDate() + d);
      return toIso(dt);
    })();
    const qs = new URLSearchParams({
      to: 'Antarctica', days: String(d), balance: String(balance),
      from: fromClean, start: selected.iso, return: backDate,
      ...(backClean !== fromClean ? { returnTo: backClean } : {}),
    });
    navigate(`/trip-plan?${qs.toString()}`, {
      state: {
        item: {
          id: `direct-${Date.now()}`,
          name: `${d}-day trip to Antarctica`,
          destination: 'Antarctica',
          duration: d,
          price: balance,
          category: 'adventure',
          image: HERO_IMG,
          description: `A ${d}-day expedition plan for Antarctica on a $${balance} budget, departing ${fromClean}${backClean !== fromClean ? ` and returning to ${backClean}` : ''}.`,
        },
        type: 'package',
        fromCity: fromClean,
        returnCity: backClean !== fromClean ? backClean : '',
        startDate: selected.iso,
        returnDate: backDate,
        purpose: 'Polar expedition',
      },
    });
  };

  const routes = [
    { icon: Ship,  img: ROUTE_IMGS[0], title: t('antarctica.routes.r1Title'), desc: t('antarctica.routes.r1Desc'), tag: t('antarctica.routes.r1Tag'), price: 8990,  days: 10 },
    { icon: Plane, img: ROUTE_IMGS[1], title: t('antarctica.routes.r2Title'), desc: t('antarctica.routes.r2Desc'), tag: t('antarctica.routes.r2Tag'), price: 12490, days: 8 },
    { icon: Crown, img: ROUTE_IMGS[2], title: t('antarctica.routes.r3Title'), desc: t('antarctica.routes.r3Desc'), tag: t('antarctica.routes.r3Tag'), price: 24900, days: 12 },
  ];

  const seasons = [
    { icon: Snowflake,  label: t('antarctica.season.nov'), desc: t('antarctica.season.novDesc') },
    { icon: Sun,        label: t('antarctica.season.dec'), desc: t('antarctica.season.decDesc') },
    { icon: Binoculars, label: t('antarctica.season.feb'), desc: t('antarctica.season.febDesc') },
  ];

  const included = [
    t('antarctica.included.i1'), t('antarctica.included.i2'), t('antarctica.included.i3'),
    t('antarctica.included.i4'), t('antarctica.included.i5'), t('antarctica.included.i6'),
  ];

  const stats = [
    { icon: Globe,     value: t('antarctica.stats.continent'), label: t('antarctica.stats.continentSub') },
    { icon: Users,     value: t('antarctica.stats.visitors'),  label: t('antarctica.stats.visitorsSub') },
    { icon: Calendar,  value: t('antarctica.stats.season'),    label: t('antarctica.stats.seasonSub') },
    { icon: Binoculars,value: t('antarctica.stats.wildlife'),  label: t('antarctica.stats.wildlifeSub') },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f9] -mt-[64px]">

      {/* ─── HERO — the glacial front ────────────────────────────── */}
      <section className="relative text-white overflow-hidden pt-[128px]" style={POLAR_HERO}>
        {/* Cold-graded photo wash under the gradient light */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.32]"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: 'saturate(0.55) brightness(0.95)',
          }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(4,16,31,0.62) 0%, rgba(4,16,31,0.10) 42%, rgba(4,16,31,0.55) 100%)' }} />
        <div className="film-grain" />
        <GoldDust className="absolute inset-0" density={0.55} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0.35, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur px-4 py-1.5 text-[10.5px] font-black uppercase tracking-[0.22em] text-[#bfe3f0] mb-7">
              <Snowflake className="w-3.5 h-3.5" /> {t('antarctica.hero.badge')}
            </div>
            <h1 className="font-display text-[clamp(42px,7.4vw,96px)] font-semibold tracking-[-0.045em] leading-[0.94] text-balance break-words mb-6 [text-shadow:0_2px_44px_rgba(0,10,26,0.45)]">
              {t('antarctica.hero.titleLead')}{' '}
              <span className="italic font-medium" style={ICE_TEXT}>{t('antarctica.hero.titleHighlight')}</span> —
              <br className="hidden md:block" />{' '}
              {t('antarctica.hero.titleTail')}
            </h1>
            <p className="text-[15px] md:text-[18px] text-[#cfe3ee]/85 font-medium max-w-xl mb-9 leading-relaxed">
              {t('antarctica.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={scrollToBuilder} className="btn-gold px-7 py-3.5 rounded-xl font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.hero.ctaPlan')}
              </button>
            </div>
          </motion.div>

          {/* Field-report stat row — hairline editorial, no card chrome */}
          <motion.div
            initial={{ opacity: 0.35, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 border-t border-white/15 pt-7 md:pt-9">
            {stats.map((s, i) => (
              <div key={i} className="md:border-l md:border-white/10 md:first:border-l-0 md:pl-6 md:first:pl-0">
                <div className="font-display text-[26px] md:text-[34px] font-semibold leading-none whitespace-nowrap" style={ICE_TEXT}>{s.value}</div>
                <div className="text-[11px] md:text-[12px] font-bold text-white/50 mt-2 leading-snug max-w-[190px]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Ice horizon — the hero calves into the light page */}
        <div className="relative mt-12 md:mt-16">
          <IceHorizon />
        </div>
      </section>

      {/* ─── EXPEDITION BUILDER — the chart room ─────────────────── */}
      <section id="expedition-builder" className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10 scroll-mt-24 reveal">
        <div className="relative overflow-hidden bg-white rounded-2xl border border-[#dfe7ec] shadow-float">
          {/* Dark chart-room header band */}
          <div className="relative px-5 md:px-8 py-6 md:py-7 text-white" style={POLAR_PANEL}>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#9fd6e8]/50 to-transparent" />
            <Eyebrow icon={Compass} light>{t('antarctica.builder.eyebrow')}</Eyebrow>
            <h2 className="font-display text-2xl md:text-[32px] font-semibold tracking-tight">{t('antarctica.builder.heading')}</h2>
            <p className="text-[13.5px] text-white/65 font-medium max-w-2xl mt-2">{t('antarctica.builder.sub')}</p>
          </div>

          <div className="p-5 md:p-8">
            {/* From / return cities */}
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              <CityAutocomplete
                icon={<PlaneTakeoff className="w-3.5 h-3.5" />}
                label={t('antarctica.builder.fromLabel')}
                placeholder={t('antarctica.builder.fromPh')}
                value={fromCity}
                onChange={setFromCity}
              />
              <CityAutocomplete
                icon={<PlaneLanding className="w-3.5 h-3.5" />}
                label={t('antarctica.builder.returnLabel')}
                placeholder={t('antarctica.builder.returnPh')}
                value={returnCity}
                onChange={setReturnCity}
              />
            </div>

            {/* Duration 8 / 9 / 10 days */}
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#0172cb]" /> {t('antarctica.builder.durationLabel')}
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => setDays(d)}
                  className={`rounded-xl border-2 px-3 py-3 text-left transition active:scale-[0.98] ${
                    days === d
                      ? 'border-[#0172cb] bg-[#e8f4fd] ring-4 ring-[#0172cb]/10 shadow-soft'
                      : 'border-[#dfe7ec] bg-white hover:border-[#0172cb]/50'
                  }`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[26px] font-bold text-[#252a31] leading-none">{d}</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#697d95]">{t('antarctica.builder.daysWord')}</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#4a5867] mt-1 leading-snug">{t(`antarctica.builder.d${d}`)}</div>
                </button>
              ))}
            </div>

            {/* Departure dates — fare calendar */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95]">
                <CalendarDays className="w-3.5 h-3.5 text-[#0172cb]" /> {t('antarctica.builder.datesLabel')}
              </div>
              <span className="text-[11px] font-bold text-[#697d95]">{t('antarctica.builder.datesHint')}</span>
            </div>
            {/* pt-2.5 keeps the floating "best price" badge (-top-2) from being
                clipped by the overflow-x scroll container */}
            <div className="flex gap-2 overflow-x-auto pt-2.5 pb-2 -mx-1 px-1 snap-x">
              {dateOptions.map((o, i) => {
                const fare = fareFor(days, o.factor);
                const saving = todayFare - fare;
                const isSel = i === dateIdx;
                const weather = weatherByDate[o.iso];
                const wmo = weather ? wmoInfo(weather.code) : null;
                const WeatherIcon = wmo?.icon;
                return (
                  <button key={o.iso} type="button"
                    onClick={() => setPickedIdx(i)}
                    className={`relative shrink-0 snap-start w-[136px] rounded-xl border-2 px-3 pt-3 pb-2.5 text-left transition active:scale-[0.98] ${
                      isSel
                        ? 'border-[#0172cb] bg-[#e8f4fd] ring-4 ring-[#0172cb]/10 shadow-soft'
                        : 'border-[#dfe7ec] bg-white hover:border-[#0172cb]/50'
                    }`}>
                    {i === bestValueIdx ? (
                      <span className="absolute -top-2 left-2 bg-[#9fd6e8] text-[#0a1c2c] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft flex items-center gap-0.5">
                        <Wand2 className="w-2.5 h-2.5" /> {t('antarctica.builder.bestValue')}
                      </span>
                    ) : i === cheapestIdx && (
                      <span className="absolute -top-2 left-2 bg-[#2e7d4f] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft">
                        {t('antarctica.builder.bestPrice')}
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#0172cb]">
                        {o.off === 0 ? t('antarctica.builder.today') : inDaysLabel(o.off)}
                      </div>
                      {WeatherIcon && (
                        <div className="flex items-center gap-0.5 text-[#4a5867]" title={wmo.label}>
                          <WeatherIcon className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{Math.round(weather.tempMax)}°</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[15px] font-black text-[#252a31] mt-0.5">
                      {fmtDay(o.date, { day: 'numeric', month: 'short' })}
                      <span className="text-[11px] font-bold text-[#697d95] ml-1">{fmtDay(o.date, { weekday: 'short' })}</span>
                    </div>
                    <div className="text-[15px] font-black text-[#252a31] mt-1 whitespace-nowrap">{fmtCompact(fare)}</div>
                    {saving > 0 && (
                      <>
                        <div className="text-[10.5px] font-black text-[#2e7d4f] mt-0.5 whitespace-nowrap">−{fmtCompact(saving)}</div>
                        <div className="text-[9.5px] font-bold text-[#697d95] leading-tight">{t('antarctica.builder.saveVsToday')}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nudge back to the recommended date whenever the traveler has
                picked a different one — mirrors what "best value" means: better
                weather and/or a lower fare than the date currently selected. */}
            {dateIdx !== bestValueIdx && (() => {
              const recSave = fareFor(days, selected.factor) - fareFor(days, dateOptions[bestValueIdx].factor);
              const recDate = fmtDay(dateOptions[bestValueIdx].date, { day: 'numeric', month: 'short' });
              const msg = recSave > 0
                ? t('antarctica.builder.suggestSwitchSaving').replace('{date}', recDate).replace('{save}', fmtCompact(recSave))
                : t('antarctica.builder.suggestSwitchWeather').replace('{date}', recDate);
              return (
                <button type="button"
                  onClick={() => setPickedIdx(null)}
                  className="mt-3 w-full flex items-center gap-2.5 rounded-xl border border-[#9fd6e8]/60 bg-[#eef7fb] px-3.5 py-2.5 text-left hover:bg-[#e2f1f8] transition">
                  <Wand2 className="w-4 h-4 text-[#1f6d94] shrink-0" />
                  <span className="text-[12px] font-bold text-[#0b3a52] leading-snug">{msg}</span>
                </button>
              );
            })()}

            {Boolean(cleanCity(fromCity)) && aiFareNote?.advice && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#eaf5f9] border border-[#bfdeeb] px-3.5 py-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1f6d94] shrink-0 mt-0.5" />
                <span className="text-[11.5px] font-semibold text-[#0b3a52] leading-snug">{aiFareNote.advice}</span>
              </div>
            )}

            {/* Summary + CTA — the manifest */}
            <div className="mt-5 relative overflow-hidden rounded-2xl text-white p-5 md:p-6 shadow-float" style={POLAR_PANEL}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9fd6e8]/60 to-transparent" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#9fd6e8] mb-1.5">{t('antarctica.builder.summaryLabel')}</div>
                  <div className="flex items-center gap-2 text-[15px] md:text-[17px] font-black flex-wrap">
                    <span className={fromClean ? '' : 'text-white/40'}>{fromClean || t('antarctica.builder.yourCity')}</span>
                    <ArrowRight className="w-4 h-4 text-[#9fd6e8] shrink-0" />
                    <span style={ICE_TEXT}>Antarctica</span>
                    <ArrowRight className="w-4 h-4 text-[#9fd6e8] shrink-0" />
                    <span className={backClean ? '' : 'text-white/40'}>{backClean || t('antarctica.builder.yourCity')}</span>
                  </div>
                  <div className="text-[12px] font-bold text-white/60 mt-1.5">
                    {fmtDay(selected.date, { day: 'numeric', month: 'short' })} — {fmtDay(returnDateObj, { day: 'numeric', month: 'short' })} · {days} {t('antarctica.builder.daysWord')}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('antarctica.builder.totalLabel')}</div>
                    <div className="font-display text-[30px] font-semibold leading-tight whitespace-nowrap" style={ICE_TEXT}>{fmtCompact(total)}</div>
                    <div className="text-[10.5px] font-bold text-white/50 max-w-[220px]">{t('antarctica.builder.perPerson')}</div>
                  </div>
                  <div className="flex flex-col items-stretch gap-1.5">
                    <button onClick={() => buildPlan()} className="btn-gold px-6 py-3.5 rounded-xl font-black text-[14px] flex items-center justify-center gap-2 active:scale-95 transition">
                      <Sparkles className="w-4 h-4" /> {t('antarctica.builder.cta')}
                    </button>
                    <span className="text-[10.5px] font-bold text-white/50 text-center">{t('antarctica.builder.ctaHint')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ROUTES — three passages to the ice ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 reveal">
        <Eyebrow icon={Compass}>{t('antarctica.routes.eyebrow')}</Eyebrow>
        <h2 className="font-display text-engraved text-[26px] md:text-[38px] font-bold text-[#252a31] tracking-tight">{t('antarctica.routes.heading')}</h2>
        <p className="text-[14px] text-[#4a5867] font-medium max-w-2xl mt-2 mb-8">{t('antarctica.routes.sub')}</p>

        <div className="space-y-4 md:space-y-5">
          {routes.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0.35, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group lift bg-white rounded-2xl overflow-hidden border border-[#dfe7ec] shadow-soft md:flex">
              <div className="relative h-52 md:h-auto md:w-[42%] shrink-0 overflow-hidden bg-[#2a3540]">
                <img src={r.img} alt={r.title} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04101f]/55 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 bg-[#0a1c2c]/85 backdrop-blur text-[#9fd6e8] text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-md border border-[#9fd6e8]/25">{r.tag}</span>
              </div>
              <div className="flex-1 p-5 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#eaf5f9] text-[#1f6d94] flex items-center justify-center shrink-0">
                    <r.icon className="w-[18px] h-[18px]" />
                  </span>
                  <h3 className="font-display text-[19px] md:text-[24px] font-bold text-[#252a31] tracking-tight">{r.title}</h3>
                </div>
                <p className="text-[13.5px] text-[#4a5867] font-medium leading-relaxed flex-1 max-w-2xl">{r.desc}</p>
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#e8edf1] pt-4 mt-5">
                  <div>
                    <div className="text-[10px] text-[#697d95] font-bold uppercase tracking-wider">{r.days} {t('antarctica.routes.daysLabel')} · {t('antarctica.routes.fromLabel')}</div>
                    <div className="font-display text-[24px] md:text-[26px] font-bold text-[#252a31] whitespace-nowrap leading-tight">{fmtCompact(r.price)}</div>
                  </div>
                  <button onClick={() => buildPlan({ days: r.days, price: r.price })}
                    className="text-[12.5px] font-black text-white bg-[#0172cb] hover:bg-[#015aa3] px-4 py-2.5 rounded-xl transition shadow-soft flex items-center gap-1.5 active:scale-95">
                    {t('antarctica.hero.ctaPlan').split(' ')[0]} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── SEASON — the ice calendar ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-4 reveal">
        <div className="relative overflow-hidden rounded-2xl p-7 md:p-12 text-white shadow-float" style={POLAR_HERO}>
          <div className="film-grain" />
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#9fd6e8]/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <Eyebrow icon={Calendar} light>{t('antarctica.season.eyebrow')}</Eyebrow>
            <h2 className="font-display text-[26px] md:text-[36px] font-semibold tracking-tight mb-8 md:mb-10 text-balance">{t('antarctica.season.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-7 md:gap-10">
              {seasons.map((s, i) => (
                <div key={i} className="border-t border-white/20 pt-5">
                  <s.icon className="w-5 h-5 text-[#9fd6e8] mb-3" />
                  <div className="font-display text-[19px] md:text-[22px] font-semibold mb-1.5">{s.label}</div>
                  <p className="text-[13px] text-white/65 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED — the manifest, honestly ────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 reveal">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <Eyebrow icon={Check}>{t('antarctica.included.eyebrow')}</Eyebrow>
            <h2 className="font-display text-engraved text-[26px] md:text-[38px] font-bold text-[#252a31] tracking-tight mb-2">{t('antarctica.included.heading')}</h2>
            <p className="text-[14px] text-[#4a5867] font-medium mb-6 max-w-xl">{t('antarctica.included.sub')}</p>
            <div>
              {included.map((line, i) => (
                <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-[#e3eaef] last:border-b-0">
                  <span className="mt-0.5 w-6 h-6 rounded-lg bg-[#0a1c2c] text-[#9fd6e8] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[13.5px] font-bold text-[#252a31] leading-snug">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 lg:pt-16">
            <div className="rounded-2xl bg-[#eaf5f9] border border-[#cfe4ee] p-6 shadow-soft">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl text-[#9fd6e8] flex items-center justify-center shrink-0" style={POLAR_PANEL}>
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-[#0b3a52] mb-1.5">{t('antarctica.included.tipTitle')}</p>
                  <p className="text-[13px] text-[#2b5a73] font-medium leading-relaxed">{t('antarctica.included.tipBody')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[stats[2], stats[3]].map((s, i) => (
                <div key={i} className="bg-white border border-[#dfe7ec] rounded-2xl px-4 py-3.5 shadow-soft flex items-start gap-3">
                  <span className="mt-0.5 w-9 h-9 rounded-xl bg-[#eaf5f9] text-[#1f6d94] flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-black text-[#252a31] leading-tight">{s.value}</span>
                    <span className="block text-[11px] font-bold text-[#697d95] mt-0.5 leading-snug">{s.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA — back to the ice ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14 reveal">
        <div className="relative overflow-hidden rounded-2xl p-8 md:p-14 text-white shadow-float text-center" style={POLAR_HERO}>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.22]"
            style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center 60%', filter: 'saturate(0.5)' }}
          />
          <div className="film-grain" />
          <div className="relative max-w-2xl mx-auto">
            <Snowflake className="w-8 h-8 text-[#9fd6e8] mx-auto mb-5 animate-float" />
            <h2 className="font-display text-[30px] md:text-[44px] font-semibold tracking-[-0.025em] leading-[1.05] mb-4 text-balance">{t('antarctica.cta.heading')}</h2>
            <p className="text-[14px] md:text-[15px] text-[#cfe3ee]/85 font-medium mb-8 leading-relaxed">{t('antarctica.cta.body')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => buildPlan()} className="btn-gold px-7 py-3.5 rounded-xl font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.cta.btnPlan')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
