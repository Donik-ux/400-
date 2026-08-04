import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Plane, Clock, Star, Users, Wallet, Calendar,
  Minus, Plus, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Check,
  MapPin, Quote, Compass, Loader2,
} from 'lucide-react';
import { getTourById } from '../data/exoticTours';
import useSEO from '../hooks/useSEO';
import { tourFitAdvisor } from '../services/travelServicesService';
import { isGrokAvailable } from '../services/grokClient';
import { useTranslation } from '../store/useLangStore';
import Price, { usePriceFormatter } from '../components/Price';
import { handleImgError } from '../utils/imageFallback';
import { searchHotels } from '../services/hotelService';
import { getCityCode } from '../data/cityCodes';

// Tour data is authored in EUR ('€8,500' etc.) but <Price>/usePriceFormatter
// render the parsed number as a USD base amount — convert once here, matching
// ExoticTours.jsx, so displayed prices aren't off by the EUR/USD spread.
const EUR_TO_USD = 1.09;
const parsePrice = (s) => {
  const n = Number(String(s || '').replace(/[^\d]/g, '')) || 0;
  return String(s || '').trim().startsWith('€') ? Math.round(n * EUR_TO_USD) : n;
};

const COST_SPLIT = [
  { labelKey: 'costFlights',    emoji: '✈️', pct: 0.30 },
  { labelKey: 'costStay',       emoji: '🏨', pct: 0.28 },
  { labelKey: 'costExpedition', emoji: '🧭', pct: 0.27 },
  { labelKey: 'costFood',       emoji: '🍽️', pct: 0.10 },
  { labelKey: 'costTransfers',  emoji: '🚐', pct: 0.05 },
];

/* ── "Is this tour right for me?" — click-driven AI advisor ── */
const FIT_WHO = [
  { key: 'solo',    en: 'a solo traveler' },
  { key: 'couple',  en: 'a couple' },
  { key: 'family',  en: 'a family with children' },
  { key: 'friends', en: 'a group of friends' },
];
const FIT_PACE = [
  { key: 'relaxed',  en: 'relaxed' },
  { key: 'balanced', en: 'balanced' },
  { key: 'active',   en: 'active' },
];

function FitAdvisor({ tour, pricePer }) {
  const { t, lang } = useTranslation();
  const [who, setWho]   = useState('couple');
  const [pace, setPace] = useState('balanced');
  const [busy, setBusy] = useState(false);
  const [res, setRes]   = useState(null); // { id, data } | { id, error } — stamped so a stale verdict hides on profile change

  const profileKey = `${who}_${pace}`;
  const reqId = `${profileKey}_${lang}`;
  const verdict = res?.id === reqId && res.data ? res.data : null;
  const failed  = res?.id === reqId && Boolean(res.error);

  const ask = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const data = await tourFitAdvisor({
        tour: {
          id: tour.id, title: tour.title, desc: tour.desc,
          fromCity: tour.from.city, fromTemp: tour.from.temp,
          toCity: tour.to.city, toTemp: tour.to.temp,
          days: tour.days, groupSize: tour.groupSize, price: pricePer,
          highlights: tour.highlights,
        },
        who:  FIT_WHO.find(w => w.key === who)?.en,
        pace: FIT_PACE.find(p => p.key === pace)?.en,
        profileKey,
        lang,
      });
      setRes({ id: reqId, data });
    } catch {
      setRes({ id: reqId, error: true });
    }
    setBusy(false);
  };

  const chip = (active) => `px-3.5 py-1.5 rounded-lg text-[12px] font-bold border transition ${
    active ? 'bg-[#252a31] text-white border-[#252a31] shadow-soft' : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#252a31]'
  }`;
  const scoreTone = verdict
    ? verdict.score >= 4 ? 'text-[#2e7d4f]' : verdict.score === 3 ? 'text-[#b07d1d]' : 'text-[#b3402a]'
    : '';

  return (
    <section className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e6f6f3] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#007f6d]" />
        </div>
        <h2 className="text-[15px] font-black text-[#252a31]">{t('tourDetail.fit.title')}</h2>
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">{t('tourDetail.fit.sub')}</p>

      <p className="text-[10.5px] font-black uppercase tracking-widest text-[#697d95] mb-1.5">{t('tourDetail.fit.whoLabel')}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FIT_WHO.map(w => (
          <button key={w.key} onClick={() => setWho(w.key)} className={chip(who === w.key)}>
            {t(`tourDetail.fit.who.${w.key}`)}
          </button>
        ))}
      </div>
      <p className="text-[10.5px] font-black uppercase tracking-widest text-[#697d95] mb-1.5">{t('tourDetail.fit.paceLabel')}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FIT_PACE.map(p => (
          <button key={p.key} onClick={() => setPace(p.key)} className={chip(pace === p.key)}>
            {t(`tourDetail.fit.pace.${p.key}`)}
          </button>
        ))}
      </div>

      {!verdict && (
        <button onClick={ask} disabled={busy}
          className="px-5 py-2.5 rounded-xl bg-[#0172cb] hover:bg-[#015aa3] disabled:opacity-60 text-white text-[12.5px] font-black flex items-center gap-2 transition active:scale-95">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {busy ? t('tourDetail.fit.loading') : t('tourDetail.fit.ask')}
        </button>
      )}
      {failed && !busy && (
        <p className="mt-3 text-[12px] font-bold text-[#b3402a]">{t('tourDetail.fit.fail')}</p>
      )}

      {verdict && (
        <div className="mt-1 border-t border-[#e8edf1] pt-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">{t('tourDetail.fit.scoreLabel')}</span>
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= verdict.score ? (verdict.score >= 4 ? 'bg-[#2e7d4f]' : verdict.score === 3 ? 'bg-[#d9a439]' : 'bg-[#c4573f]') : 'bg-[#e3eaef]'}`} />
              ))}
            </span>
            <span className={`text-[13px] font-black ${scoreTone}`}>{verdict.score}/5</span>
          </div>
          <p className="text-[14px] font-black text-[#252a31] leading-snug mb-3">{verdict.headline}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {verdict.pros.length > 0 && (
              <div className="rounded-xl bg-[#e9f3ea] border border-[#cfe3d2] p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#24513a] mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('tourDetail.fit.prosTitle')}
                </p>
                <ul className="space-y-1">
                  {verdict.pros.map((p, i) => (
                    <li key={i} className="text-[12px] text-[#2e5b40] font-semibold leading-snug flex gap-1.5"><span>•</span>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {verdict.cons.length > 0 && (
              <div className="rounded-xl bg-[#fdf3dc] border border-[#f0dfb4] p-3.5">
                <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#8a5c17] mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t('tourDetail.fit.consTitle')}
                </p>
                <ul className="space-y-1">
                  {verdict.cons.map((c, i) => (
                    <li key={i} className="text-[12px] text-[#7c5a1c] font-semibold leading-snug flex gap-1.5"><span>•</span>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {verdict.tip && (
            <p className="mt-3 flex items-start gap-2 text-[12px] text-[#00584c] font-semibold bg-[#e6f6f3] border border-[#bfe8df] rounded-xl px-3.5 py-2.5">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#007f6d]" /> {verdict.tip}
            </p>
          )}
          <p className="mt-2.5 text-[10.5px] text-[#8fa1b3] font-semibold">{t('tourDetail.fit.disclaimer')}</p>
        </div>
      )}
    </section>
  );
}

const REVIEWS = [
  { name: 'Aizada K.',   initials: 'AK', rating: 5, whenKey: 'reviewWhen1', textKey: 'reviewText1' },
  { name: 'Marat T.',    initials: 'MT', rating: 5, whenKey: 'reviewWhen2', textKey: 'reviewText2' },
  { name: 'Elena V.',    initials: 'EV', rating: 4, whenKey: 'reviewWhen3', textKey: 'reviewText3' },
];

export default function TourDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const tour     = getTourById(id);
  const fmt      = usePriceFormatter();

  useSEO({
    title: tour ? `${tour.title} · Exotic Tour` : 'Tour not found',
    description: tour?.desc || 'Exotic contrast tour',
  });

  const pricePer = parsePrice(tour?.price);
  const today    = new Date().toISOString().split('T')[0];
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget]       = useState(pricePer * 2);
  const [date, setDate]           = useState('');

  const cityCode = getCityCode(tour?.to?.city);
  const [hotels, setHotels]               = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsStatus, setHotelsStatus]   = useState(null);

  useEffect(() => {
    if (!tour || !cityCode) return undefined;
    // Sample a 3-night stay to check live rates — the tour's own duration
    // splits across two legs (origin + destination), so it isn't the same
    // as the destination hotel's length of stay.
    const checkIn  = date || new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0];
    const checkOut = new Date(new Date(`${checkIn}T00:00:00`).getTime() + 3 * 86_400_000).toISOString().split('T')[0];
    let cancelled = false;
    const run = async () => {
      setHotelsLoading(true);
      try {
        const res = await searchHotels({ city: tour.to.city, checkInDate: checkIn, checkOutDate: checkOut, adults: Math.min(travelers, 4) });
        if (!cancelled) { setHotels(res.hotels); setHotelsStatus(res.status); }
      } catch {
        if (!cancelled) { setHotels([]); setHotelsStatus(500); }
      } finally {
        if (!cancelled) setHotelsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [tour, cityCode, date, travelers]);

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#eef2f5] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0172cb]/15 to-[#252a31]/10 flex items-center justify-center mb-5 animate-float">
          <Compass className="w-10 h-10 text-[#0172cb]" />
        </div>
        <h1 className="text-2xl font-black text-[#252a31] mb-2">{t('tourDetail.notFoundTitle')}</h1>
        <p className="text-[#4a5867] mb-6">{t('tourDetail.notFoundSub')}</p>
        <Link to="/exotic-tours" className="px-5 py-3 rounded-xl bg-[#252a31] text-white font-black text-[13px] shadow-soft transition hover:bg-[#0172cb] active:scale-95">
          {t('tourDetail.allExoticTours')}
        </Link>
      </div>
    );
  }

  const tourTotal = pricePer * travelers;
  const diff      = budget - tourTotal;
  const fits      = diff >= 0;
  const progress  = Math.min(100, tourTotal > 0 ? (budget / tourTotal) * 100 : 100);
  const breakdown = COST_SPLIT.map(b => ({ ...b, amount: Math.round(tourTotal * b.pct) }));

  const savingTips = !fits ? [
    `${t('tourDetail.tipShortBy1')} ${fmt(Math.abs(diff))} — ${t('tourDetail.tipShortBy2')} ${fmt(Math.ceil(Math.abs(diff) / Math.max(1, travelers)))} ${t('tourDetail.tipShortBy3')}`,
    travelers > 2 && `${t('tourDetail.tipTravelDuoA')} ${travelers} ${t('tourDetail.tipTravelDuoB')} ${fmt(pricePer * 2)} ${t('tourDetail.tipTravelDuoC')} ${fmt(tourTotal)}.`,
    t('tourDetail.tipOffPeak'),
    t('tourDetail.tipShorterTours'),
  ].filter(Boolean) : [];

  const handleGenerate = () => {
    navigate('/planner', {
      state: {
        autoPlanFormData: {
          destination:   tour.to.city,
          fromCity:      tour.from.city,
          startDate:     date || '',
          days:          tour.days,
          budget:        Math.max(1, Math.round(budget / Math.max(1, travelers))),
          budgetStyle:   'comfort',
          transportMode: 'public',
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#eef2f5]">

      {/* Hero */}
      <div className="relative h-[400px] md:h-[460px] overflow-hidden">
        <motion.img
          src={tour.image} alt={tour.title}
          onError={handleImgError}
          initial={{ scale: 1.08 }} animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001a3d] via-[#001a3d]/45 to-[#001a3d]/25" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col">
          {/* Back */}
          <button onClick={() => navigate('/exotic-tours')}
            className="self-start mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[12px] font-bold backdrop-blur-sm transition active:scale-95">
            <ArrowLeft className="w-4 h-4" /> {t('tourDetail.backAllTours')}
          </button>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-auto mb-8">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${tour.badgeColor} shadow-lg mb-3`}>
              {tour.badge} {tour.badgeLabel}
            </div>
            <h1 className="text-[34px] md:text-[48px] font-black text-white leading-[1.05] tracking-tight mb-2 max-w-2xl">
              {tour.title}
            </h1>
            <p className="text-white/75 text-[15px] font-medium mb-4">{tour.tagline}</p>

            {/* Route + facts */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/90">
              <span className="flex items-center gap-1.5 text-[13px] font-bold">
                {tour.from.flag} {tour.from.city}
                <Plane className="w-3.5 h-3.5 rotate-45 text-white/60" />
                {tour.to.city} {tour.to.flag}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] font-bold"><Clock className="w-4 h-4 text-white/60" />{tour.days} {t('tourDetail.daysSuffix')}</span>
              <span className="flex items-center gap-1.5 text-[13px] font-bold"><Star className="w-4 h-4 fill-[#00a58e] text-[#00a58e]" />{tour.rating} ({tour.reviews})</span>
              <span className="flex items-center gap-1.5 text-[13px] font-bold"><Users className="w-4 h-4 text-white/60" />{tour.groupSize} {t('tourDetail.peopleSuffix')}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: content ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          <section>
            <h2 className="text-[20px] font-black text-[#252a31] mb-3">{t('tourDetail.aboutTitle')}</h2>
            <p className="text-[14px] text-[#4a5867] leading-relaxed">{tour.desc}</p>
          </section>

          {/* Temperature contrast */}
          <section className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft">
            <h2 className="text-[15px] font-black text-[#252a31] mb-4">{t('tourDetail.contrastTitle')}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="text-[32px] leading-none mb-1">{tour.from.icon}</div>
                <div className="text-[14px] font-black text-[#252a31]">{tour.from.city}</div>
                <div className="text-[12px] text-[#697d95]">{tour.from.country}</div>
                <div className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-[#fdf1e8] text-[#c26d4a] text-[13px] font-black">{tour.from.temp}</div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <Plane className="w-5 h-5 text-[#0172cb] rotate-45" />
                <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-[#009882] to-[#2d6a6f]" />
                <span className="text-[10px] font-bold text-[#697d95]">{tour.days} {t('tourDetail.contrastDays')}</span>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[32px] leading-none mb-1">{tour.to.icon}</div>
                <div className="text-[14px] font-black text-[#252a31]">{tour.to.city}</div>
                <div className="text-[12px] text-[#697d95]">{tour.to.country}</div>
                <div className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-[#eaf3f4] text-[#2d6a6f] text-[13px] font-black">{tour.to.temp}</div>
              </div>
            </div>
          </section>

          {/* Highlights / itinerary */}
          <section>
            <h2 className="text-[20px] font-black text-[#252a31] mb-4">{t('tourDetail.itineraryTitle')}</h2>
            <div className="space-y-2.5">
              {tour.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center gap-3 bg-white border border-[#dfe7ec] rounded-xl p-3.5 shadow-soft transition-colors hover:border-[#0172cb]/40"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#0172cb] text-white text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-semibold text-[#252a31]">{h}</span>
                  <Check className="w-4 h-4 text-[#2e7d4f] ml-auto shrink-0" strokeWidth={3} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* "Is this tour right for me?" — click-driven, so it never spends AI quota unasked */}
          {isGrokAvailable() && <FitAdvisor tour={tour} pricePer={pricePer} />}

          {/* Real hotel prices (Amadeus) — only shown for cities we can map to a code */}
          {cityCode && (
            <section className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft">
              <h2 className="text-[15px] font-black text-[#252a31] mb-1">{t('tourDetail.hotelsTitle')}</h2>
              <p className="text-[12px] text-[#697d95] mb-4">{t('tourDetail.hotelsSub')} {tour.to.city}</p>

              {hotelsLoading && (
                <p className="text-[12px] text-[#697d95]">{t('tourDetail.hotelsLoading')}</p>
              )}
              {!hotelsLoading && hotelsStatus === 501 && (
                <p className="text-[12px] text-[#697d95]">{t('tourDetail.hotelsNotConfigured')}</p>
              )}
              {!hotelsLoading && hotelsStatus && hotelsStatus !== 501 && hotels.length === 0 && (
                <p className="text-[12px] text-[#697d95]">{t('tourDetail.hotelsNone')}</p>
              )}
              {!hotelsLoading && hotels.length > 0 && (
                <div className="space-y-2.5">
                  {hotels.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center gap-3 border border-[#dfe7ec] rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-black text-[#252a31] truncate">{h.name}</div>
                        {h.address && <div className="text-[11px] text-[#697d95] truncate">{h.address}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[14px] font-black text-gradient"><Price amount={h.pricePerNight} /></div>
                        <div className="text-[10px] text-[#697d95]">{t('tourDetail.hotelsPerNight')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Reviews */}
          <section className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[40px] font-black text-gradient leading-none">{tour.rating}</div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(tour.rating) ? 'fill-[#00a58e] text-[#00a58e]' : 'text-[#dfe7ec]'}`} />
                  ))}
                </div>
                <div className="text-[11px] text-[#697d95] mt-1">{tour.reviews} {t('tourDetail.reviewsCount')}</div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(stars => {
                  const pct = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : stars === 2 ? 1 : 1;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#697d95] w-3">{stars}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#e8edf1] overflow-hidden">
                        <div className="h-full rounded-full bg-[#00a58e]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3 border-t border-[#e8edf1] pt-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#252a31] text-white text-[12px] font-black flex items-center justify-center shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black text-[#252a31]">{r.name}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-[#00a58e] text-[#00a58e]' : 'text-[#dfe7ec]'}`} />
                        ))}
                      </span>
                      <span className="text-[11px] text-[#697d95] ml-auto">{t(`tourDetail.${r.whenKey}`)}</span>
                    </div>
                    <p className="text-[13px] text-[#4a5867] leading-relaxed mt-0.5 flex gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-[#bac7d1] shrink-0 mt-0.5" />
                      {t(`tourDetail.${r.textKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: budget calculator ── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-[80px] bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-float">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] text-[#697d95] font-bold uppercase tracking-wider">{t('tourDetail.pricePerPerson')}</div>
                <div className="text-[26px] font-black text-gradient leading-none"><Price amount={pricePer} /></div>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-[#4a5867]">
                <Star className="w-3.5 h-3.5 fill-[#00a58e] text-[#00a58e]" />{tour.rating}
              </div>
            </div>

            <p className="text-[12px] text-[#697d95] mb-4">
              {t('tourDetail.calcIntro')}
            </p>

            {/* Travelers */}
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-[13px] font-bold text-[#252a31]">
                <Users className="w-4 h-4 text-[#0172cb]" /> {t('tourDetail.travelers')}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={() => setTravelers(v => Math.max(1, v - 1))}
                  className="w-8 h-8 rounded-lg border border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] transition active:scale-90">
                  <Minus className="w-4 h-4 text-[#4a5867]" />
                </button>
                <span className="text-[15px] font-black text-[#252a31] w-6 text-center">{travelers}</span>
                <button onClick={() => setTravelers(v => Math.min(12, v + 1))}
                  className="w-8 h-8 rounded-lg border border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] transition active:scale-90">
                  <Plus className="w-4 h-4 text-[#4a5867]" />
                </button>
              </div>
            </div>

            {/* Budget + date */}
            <label className="block mb-3">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#252a31] mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#0172cb]" /> {t('tourDetail.totalBudget')}
              </span>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#dfe7ec] focus-within:border-[#0172cb] transition">
                <span className="text-[15px] font-black text-[#4a5867]">$</span>
                <input type="number" min="0" step="100" value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                  className="flex-1 w-full text-[15px] font-black text-[#252a31] outline-none" />
              </div>
            </label>
            <label className="block mb-4">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#252a31] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0172cb]" /> {t('tourDetail.departureDate')}
              </span>
              <input type="date" min={today} value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#dfe7ec] focus:border-[#0172cb] outline-none text-[14px] font-bold text-[#252a31] transition" />
            </label>

            {/* Fit banner */}
            <div className={`p-3.5 rounded-xl border mb-4 ${
              fits ? 'bg-[#e9f3ea] border-[#cfe3d2]' : 'bg-[#fdf3dc] border-[#f0dfb4]'
            }`}>
              <div className="flex items-start gap-2.5">
                {fits
                  ? <CheckCircle2 className="w-5 h-5 text-[#2e7d4f] shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-[#009882] shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={`text-[13px] font-black ${fits ? 'text-[#24513a]' : 'text-warn'}`}>
                    {fits
                      ? `${t('tourDetail.budgetEnoughPrefix')} ${fmt(diff)} ${t('tourDetail.budgetEnoughSuffix')}`
                      : `${t('tourDetail.budgetShortPrefix')} ${fmt(Math.abs(diff))}`}
                  </p>
                  <p className={`text-[11px] ${fits ? 'text-ok' : 'text-[#8a5c17]/90'}`}>
                    {t('tourDetail.tourLineLabel')} {fmt(pricePer)} × {travelers} = <b>{fmt(tourTotal)}</b>
                  </p>
                </div>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-white/70 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${fits ? 'bg-[#2e7d4f]' : 'bg-[#008f77]'}`}
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Breakdown */}
            <p className="text-[11px] font-black uppercase tracking-widest text-[#697d95] mb-2">{t('tourDetail.priceBreakdownTitle')}</p>
            <div className="space-y-1.5 mb-4">
              {breakdown.map(b => (
                <div key={b.labelKey} className="flex items-center gap-2">
                  <span className="text-[13px] w-5 text-center">{b.emoji}</span>
                  <span className="text-[11px] text-[#4a5867] flex-1 truncate">{t(`tourDetail.${b.labelKey}`)}</span>
                  <span className="text-[12px] font-black text-[#252a31]">{fmt(b.amount)}</span>
                </div>
              ))}
            </div>

            {/* Savings tips */}
            {savingTips.length > 0 && (
              <div className="bg-[#e6f6f3] border border-[#61d1bf] rounded-xl p-3.5 mb-4">
                <p className="flex items-center gap-1.5 text-[12px] font-black text-[#007f6d] mb-1.5">
                  <Lightbulb className="w-4 h-4" /> {t('tourDetail.savingTipsTitle')}
                </p>
                <ul className="space-y-1">
                  {savingTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-[#7c4a00] font-medium flex gap-1.5">
                      <span className="text-[#007f6d]">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <button onClick={handleGenerate}
              className="btn-gold w-full py-3.5 rounded-xl text-[13px] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> {t('tourDetail.generateBtn')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-[#697d95] text-center mt-2 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {t('tourDetail.dayPlanFor1')} {tour.to.city} {t('tourDetail.dayPlanFor2')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
