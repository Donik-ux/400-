import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const HERO_IMG = 'https://images.unsplash.com/photo-1516569422572-d9e0514b9598?auto=format&fit=crop&w=1800&q=80';

const ROUTE_IMGS = [
  'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551415923-a2297c7fda79?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=900&q=80',
];

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
  const [dateIdx, setDateIdx] = useState(cheapestIdx);
  const userPickedDate = useRef(false);

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

  // Auto-select the best weather+price pick as soon as it's known — but only
  // until the traveler manually taps a different date card.
  useEffect(() => {
    if (!userPickedDate.current) setDateIdx(bestValueIdx);
  }, [bestValueIdx]);

  // One AI-authored line about the fare trend for this exact route/month
  // (Gemini) — real per-date price/weather math above stays authoritative;
  // this is supporting market color, and quietly disappears if it fails.
  const [aiFareNote, setAiFareNote] = useState(null);
  useEffect(() => {
    const fromClean = cleanCity(fromCity);
    if (!fromClean) { setAiFareNote(null); return; }
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
    <div className="min-h-screen bg-[#faf6ed] -mt-[64px]">

      {/* ─── HERO — the ice at night ─────────────────────────────── */}
      <section className="relative aurora-bg text-white overflow-hidden pt-[120px] pb-20 md:pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-[0.28] mix-blend-soft-light"
             style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'saturate(0.9)' }} />
        <div className="film-grain" />
        <div className="absolute inset-0 sheen-top pointer-events-none" />
        <GoldDust className="absolute inset-0" density={0.8} />
        <div className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-[#7cc4d9]/25 blur-3xl pointer-events-none animate-float" />
        <div className="absolute -right-24 -bottom-10 w-80 h-80 rounded-full bg-[#febb02]/12 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl">
            <div className="badge-editorial px-4 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-[0.16em] mb-5">
              <Snowflake className="w-3.5 h-3.5 text-[#7cc4d9]" /> {t('antarctica.hero.badge')}
            </div>
            <h1 className="font-display text-[clamp(40px,6.6vw,80px)] font-semibold tracking-[-0.045em] leading-[0.95] mb-5 text-balance break-words [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
              {t('antarctica.hero.titleLead')} <span className="italic font-medium text-gradient-gold gold-animate">{t('antarctica.hero.titleHighlight')}</span> —<br className="hidden md:block" /> {t('antarctica.hero.titleTail')}
            </h1>
            <p className="text-[15px] md:text-[18px] text-white/80 font-medium max-w-xl mb-8 leading-relaxed">
              {t('antarctica.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={scrollToBuilder} className="btn-gold px-7 py-3.5 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.hero.ctaPlan')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAND ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#00214f] to-[#001427] rounded-2xl shadow-lift p-4 md:p-5 text-center lift">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7cc4d9]/70 to-transparent" />
              <div className="relative w-10 h-10 mx-auto rounded-xl bg-[#7cc4d9]/12 text-[#7cc4d9] flex items-center justify-center mb-2 ring-1 ring-[#7cc4d9]/25">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="relative font-display text-[22px] md:text-[26px] font-semibold text-gradient-gold leading-none">{s.value}</div>
              <div className="relative text-[11px] md:text-[12px] font-bold text-white/50 mt-1.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── EXPEDITION BUILDER ──────────────────────────────────── */}
      <section id="expedition-builder" className="max-w-7xl mx-auto px-4 md:px-8 pt-12 scroll-mt-24 reveal">
        <div className="relative overflow-hidden bg-white rounded-3xl border border-[#e6dcc3] shadow-float">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7cc4d9] via-[#febb02] to-[#7cc4d9]" />
          <div className="p-5 md:p-8">
            <div className="eyebrow-lux mb-2">
              <Compass className="w-3.5 h-3.5" /> {t('antarctica.builder.eyebrow')}
            </div>
            <h2 className="font-display text-engraved text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('antarctica.builder.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium max-w-2xl mt-2 mb-6">{t('antarctica.builder.sub')}</p>

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
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#93876f] mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#0071c2]" /> {t('antarctica.builder.durationLabel')}
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => setDays(d)}
                  className={`rounded-xl border-2 px-3 py-3 text-left transition active:scale-[0.98] ${
                    days === d
                      ? 'border-[#0071c2] bg-[#f0f5ff] ring-4 ring-[#0071c2]/10 shadow-soft'
                      : 'border-[#e6dcc3] bg-white hover:border-[#0071c2]/50'
                  }`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[26px] font-bold text-[#003580] leading-none">{d}</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#93876f]">{t('antarctica.builder.daysWord')}</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#5c5245] mt-1 leading-snug">{t(`antarctica.builder.d${d}`)}</div>
                </button>
              ))}
            </div>

            {/* Departure dates — fare calendar */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#93876f]">
                <CalendarDays className="w-3.5 h-3.5 text-[#0071c2]" /> {t('antarctica.builder.datesLabel')}
              </div>
              <span className="text-[11px] font-bold text-[#93876f]">{t('antarctica.builder.datesHint')}</span>
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
                    onClick={() => { userPickedDate.current = true; setDateIdx(i); }}
                    className={`relative shrink-0 snap-start w-[136px] rounded-xl border-2 px-3 pt-3 pb-2.5 text-left transition active:scale-[0.98] ${
                      isSel
                        ? 'border-[#0071c2] bg-[#f0f5ff] ring-4 ring-[#0071c2]/10 shadow-soft'
                        : 'border-[#e6dcc3] bg-white hover:border-[#0071c2]/50'
                    }`}>
                    {i === bestValueIdx ? (
                      <span className="absolute -top-2 left-2 bg-[#7cc4d9] text-[#00214f] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft flex items-center gap-0.5">
                        <Wand2 className="w-2.5 h-2.5" /> {t('antarctica.builder.bestValue')}
                      </span>
                    ) : i === cheapestIdx && (
                      <span className="absolute -top-2 left-2 bg-[#2e7d4f] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft">
                        {t('antarctica.builder.bestPrice')}
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#0071c2]">
                        {o.off === 0 ? t('antarctica.builder.today') : inDaysLabel(o.off)}
                      </div>
                      {WeatherIcon && (
                        <div className="flex items-center gap-0.5 text-[#5c5245]" title={wmo.label}>
                          <WeatherIcon className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{Math.round(weather.tempMax)}°</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[15px] font-black text-[#1a1a1a] mt-0.5">
                      {fmtDay(o.date, { day: 'numeric', month: 'short' })}
                      <span className="text-[11px] font-bold text-[#93876f] ml-1">{fmtDay(o.date, { weekday: 'short' })}</span>
                    </div>
                    <div className="text-[15px] font-black text-[#003580] mt-1 whitespace-nowrap">{fmtCompact(fare)}</div>
                    {saving > 0 && (
                      <>
                        <div className="text-[10.5px] font-black text-[#2e7d4f] mt-0.5 whitespace-nowrap">−{fmtCompact(saving)}</div>
                        <div className="text-[9.5px] font-bold text-[#93876f] leading-tight">{t('antarctica.builder.saveVsToday')}</div>
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
                  onClick={() => { userPickedDate.current = false; setDateIdx(bestValueIdx); }}
                  className="mt-3 w-full flex items-center gap-2.5 rounded-xl border border-[#7cc4d9]/50 bg-[#f0f9fb] px-3.5 py-2.5 text-left hover:bg-[#e3f3f7] transition">
                  <Wand2 className="w-4 h-4 text-[#0071c2] shrink-0" />
                  <span className="text-[12px] font-bold text-[#00435c] leading-snug">{msg}</span>
                </button>
              );
            })()}

            {aiFareNote?.advice && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#fff7e6] border border-[#ffd76e]/60 px-3.5 py-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#a45e00] shrink-0 mt-0.5" />
                <span className="text-[11.5px] font-semibold text-[#7c4a00] leading-snug">{aiFareNote.advice}</span>
              </div>
            )}

            {/* Summary + CTA */}
            <div className="mt-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00214f] to-[#001427] text-white p-5 md:p-6 shadow-float">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7cc4d9]/70 to-transparent" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#7cc4d9] mb-1.5">{t('antarctica.builder.summaryLabel')}</div>
                  <div className="flex items-center gap-2 text-[15px] md:text-[17px] font-black flex-wrap">
                    <span className={fromClean ? '' : 'text-white/40'}>{fromClean || t('antarctica.builder.yourCity')}</span>
                    <ArrowRight className="w-4 h-4 text-[#febb02] shrink-0" />
                    <span className="text-gradient-gold">Antarctica</span>
                    <ArrowRight className="w-4 h-4 text-[#febb02] shrink-0" />
                    <span className={backClean ? '' : 'text-white/40'}>{backClean || t('antarctica.builder.yourCity')}</span>
                  </div>
                  <div className="text-[12px] font-bold text-white/60 mt-1.5">
                    {fmtDay(selected.date, { day: 'numeric', month: 'short' })} — {fmtDay(returnDateObj, { day: 'numeric', month: 'short' })} · {days} {t('antarctica.builder.daysWord')}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{t('antarctica.builder.totalLabel')}</div>
                    <div className="font-display text-[30px] font-semibold text-gradient-gold leading-tight whitespace-nowrap">{fmtCompact(total)}</div>
                    <div className="text-[10.5px] font-bold text-white/50 max-w-[220px]">{t('antarctica.builder.perPerson')}</div>
                  </div>
                  <div className="flex flex-col items-stretch gap-1.5">
                    <button onClick={() => buildPlan()} className="btn-gold px-6 py-3.5 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center justify-center gap-2 active:scale-95 transition">
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

      {/* ─── ROUTES / EXPEDITIONS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 reveal">
        <div className="eyebrow-lux mb-2">
          <Compass className="w-3.5 h-3.5" /> {t('antarctica.routes.eyebrow')}
        </div>
        <h2 className="font-display text-engraved text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('antarctica.routes.heading')}</h2>
        <p className="text-[14px] text-[#5c5245] font-medium max-w-2xl mt-2 mb-7">{t('antarctica.routes.sub')}</p>

        <div className="grid md:grid-cols-3 gap-4">
          {routes.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`group lift card-sheen bg-white rounded-2xl overflow-hidden border border-[#e6dcc3] flex flex-col ${i === 2 ? 'edge-gilded' : 'shadow-soft'}`}>
              <div className="relative h-44 overflow-hidden">
                <img src={r.img} alt={r.title} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <span className="absolute top-2.5 left-2.5 bg-[#febb02] text-[#1a1a1a] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float">{r.tag}</span>
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white">
                  <r.icon className="w-4 h-4 text-[#ffd76e]" />
                  <span className="text-[15px] font-black [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">{r.title}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[13px] text-[#5c5245] font-medium leading-relaxed flex-1">{r.desc}</p>
                <div className="flex items-end justify-between border-t border-[#efe6d2] pt-3 mt-4">
                  <div>
                    <div className="text-[10px] text-[#93876f] font-bold uppercase">{r.days} {t('antarctica.routes.daysLabel')} · {t('antarctica.routes.fromLabel')}</div>
                    <div className="text-[20px] font-black text-[#003580] whitespace-nowrap">{fmtCompact(r.price)}</div>
                  </div>
                  <button onClick={() => buildPlan({ days: r.days, price: r.price })}
                    className="text-[12px] font-black text-white bg-[#0071c2] hover:bg-[#005fa3] px-3 py-2 rounded-lg transition shadow-soft flex items-center gap-1 active:scale-95">
                    {t('antarctica.hero.ctaPlan').split(' ')[0]} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── SEASON ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 reveal">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00214f] to-[#001427] rounded-3xl p-7 md:p-10 text-white shadow-float">
          <div className="pattern-lux" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#7cc4d9]/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="eyebrow-lux eyebrow-lux--light mb-2">
              <Calendar className="w-3.5 h-3.5" /> {t('antarctica.season.eyebrow')}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">{t('antarctica.season.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {seasons.map((s, i) => (
                <div key={i} className="bg-white/[0.07] backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-[#7cc4d9]/40 transition">
                  <s.icon className="w-5 h-5 text-[#7cc4d9] mb-3" />
                  <div className="text-[15px] font-black mb-1">{s.label}</div>
                  <p className="text-[13px] text-white/70 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 reveal">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="eyebrow-lux mb-2">
              <Check className="w-3.5 h-3.5" /> {t('antarctica.included.eyebrow')}
            </div>
            <h2 className="font-display text-engraved text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight mb-2">{t('antarctica.included.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium mb-6 max-w-xl">{t('antarctica.included.sub')}</p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {included.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white border border-[#e6dcc3] rounded-xl px-3.5 py-3 shadow-soft">
                  <span className="mt-0.5 w-5 h-5 rounded-md bg-[#e9f3ea] text-[#2e7d4f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-[12.5px] font-bold text-[#1a1a1a] leading-snug">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="note-warn rounded-2xl p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#febb02] to-[#e0a435] text-[#1a1a1a] flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-black text-warn mb-1.5">{t('antarctica.included.tipTitle')}</p>
                <p className="text-[13px] text-[#8a5c17]/90 font-medium leading-relaxed">{t('antarctica.included.tipBody')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14 reveal">
        <div className="panel-inlay relative overflow-hidden aurora-bg rounded-3xl p-8 md:p-12 text-white shadow-float text-center">
          <div className="film-grain" />
          <div className="relative max-w-2xl mx-auto">
            <Snowflake className="w-8 h-8 text-[#7cc4d9] mx-auto mb-4 animate-float" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-3 text-balance">{t('antarctica.cta.heading')}</h2>
            <p className="text-[14px] md:text-[15px] text-white/80 font-medium mb-7 leading-relaxed">{t('antarctica.cta.body')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => buildPlan()} className="btn-gold px-7 py-3.5 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.cta.btnPlan')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
