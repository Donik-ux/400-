import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Plane, Clock, Star, Users, Wallet, Calendar,
  Minus, Plus, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Check,
  MapPin, Quote, Compass,
} from 'lucide-react';
import { getTourById } from '../data/exoticTours';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';

const parsePrice = (s) => Number(String(s || '').replace(/[^\d]/g, '')) || 0;

const COST_SPLIT = [
  { labelKey: 'costFlights',    emoji: '✈️', pct: 0.30 },
  { labelKey: 'costStay',       emoji: '🏨', pct: 0.28 },
  { labelKey: 'costExpedition', emoji: '🧭', pct: 0.27 },
  { labelKey: 'costFood',       emoji: '🍽️', pct: 0.10 },
  { labelKey: 'costTransfers',  emoji: '🚐', pct: 0.05 },
];

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

  useSEO({
    title: tour ? `${tour.title} · Exotic Tour` : 'Tour not found',
    description: tour?.desc || 'Exotic contrast tour',
  });

  const pricePer = parsePrice(tour?.price);
  const today    = new Date().toISOString().split('T')[0];
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget]       = useState(pricePer * 2);
  const [date, setDate]           = useState('');

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0071c2]/15 to-[#003580]/10 flex items-center justify-center mb-5 animate-float">
          <Compass className="w-10 h-10 text-[#0071c2]" />
        </div>
        <h1 className="text-2xl font-black text-[#1a1a1a] mb-2">{t('tourDetail.notFoundTitle')}</h1>
        <p className="text-[#595959] mb-6">{t('tourDetail.notFoundSub')}</p>
        <Link to="/exotic-tours" className="px-5 py-3 rounded-xl bg-[#003580] text-white font-black text-[13px] shadow-soft transition hover:bg-[#0071c2] active:scale-95">
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
  const fmt = (n) => '€' + Number(n || 0).toLocaleString();

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
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* Hero */}
      <div className="relative h-[400px] md:h-[460px] overflow-hidden">
        <motion.img
          src={tour.image} alt={tour.title}
          initial={{ scale: 1.08 }} animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001a3d] via-[#001a3d]/45 to-[#001a3d]/25" />
        <div className="absolute top-8 right-[10%] w-56 h-56 rounded-full bg-[#febb02]/10 blur-3xl pointer-events-none animate-float" />

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
              <span className="flex items-center gap-1.5 text-[13px] font-bold"><Star className="w-4 h-4 fill-[#febb02] text-[#febb02]" />{tour.rating} ({tour.reviews})</span>
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
            <h2 className="text-[20px] font-black text-[#1a1a1a] mb-3">{t('tourDetail.aboutTitle')}</h2>
            <p className="text-[14px] text-[#595959] leading-relaxed">{tour.desc}</p>
          </section>

          {/* Temperature contrast */}
          <section className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft">
            <h2 className="text-[15px] font-black text-[#1a1a1a] mb-4">{t('tourDetail.contrastTitle')}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <div className="text-[32px] leading-none mb-1">{tour.from.icon}</div>
                <div className="text-[14px] font-black text-[#1a1a1a]">{tour.from.city}</div>
                <div className="text-[12px] text-[#9ca3af]">{tour.from.country}</div>
                <div className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[13px] font-black">{tour.from.temp}</div>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <Plane className="w-5 h-5 text-[#0071c2] rotate-45" />
                <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-orange-400 to-blue-400" />
                <span className="text-[10px] font-bold text-[#9ca3af]">{tour.days} {t('tourDetail.contrastDays')}</span>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[32px] leading-none mb-1">{tour.to.icon}</div>
                <div className="text-[14px] font-black text-[#1a1a1a]">{tour.to.city}</div>
                <div className="text-[12px] text-[#9ca3af]">{tour.to.country}</div>
                <div className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[13px] font-black">{tour.to.temp}</div>
              </div>
            </div>
          </section>

          {/* Highlights / itinerary */}
          <section>
            <h2 className="text-[20px] font-black text-[#1a1a1a] mb-4">{t('tourDetail.itineraryTitle')}</h2>
            <div className="space-y-2.5">
              {tour.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center gap-3 bg-white border border-[#e7e7e7] rounded-xl p-3.5 shadow-soft transition-colors hover:border-[#0071c2]/40"
                >
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0071c2] to-[#003580] text-white text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">{h}</span>
                  <Check className="w-4 h-4 text-green-600 ml-auto shrink-0" strokeWidth={3} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[40px] font-black text-gradient leading-none">{tour.rating}</div>
                <div className="flex items-center gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(tour.rating) ? 'fill-[#febb02] text-[#febb02]' : 'text-[#e7e7e7]'}`} />
                  ))}
                </div>
                <div className="text-[11px] text-[#9ca3af] mt-1">{tour.reviews} {t('tourDetail.reviewsCount')}</div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(stars => {
                  const pct = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : stars === 2 ? 1 : 1;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#9ca3af] w-3">{stars}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                        <div className="h-full rounded-full bg-[#febb02]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3 border-t border-[#f0f0f0] pt-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#003580] text-white text-[12px] font-black flex items-center justify-center shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black text-[#1a1a1a]">{r.name}</span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-[#febb02] text-[#febb02]' : 'text-[#e7e7e7]'}`} />
                        ))}
                      </span>
                      <span className="text-[11px] text-[#9ca3af] ml-auto">{t(`tourDetail.${r.whenKey}`)}</span>
                    </div>
                    <p className="text-[13px] text-[#595959] leading-relaxed mt-0.5 flex gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-[#c9d1d9] shrink-0 mt-0.5" />
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
          <div className="lg:sticky lg:top-[80px] bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-float">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">{t('tourDetail.pricePerPerson')}</div>
                <div className="text-[26px] font-black text-gradient leading-none">{tour.price}</div>
              </div>
              <div className="flex items-center gap-1 text-[12px] font-bold text-[#595959]">
                <Star className="w-3.5 h-3.5 fill-[#febb02] text-[#febb02]" />{tour.rating}
              </div>
            </div>

            <p className="text-[12px] text-[#9ca3af] mb-4">
              {t('tourDetail.calcIntro')}
            </p>

            {/* Travelers */}
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-[13px] font-bold text-[#1a1a1a]">
                <Users className="w-4 h-4 text-[#0071c2]" /> {t('tourDetail.travelers')}
              </span>
              <div className="flex items-center gap-3">
                <button onClick={() => setTravelers(v => Math.max(1, v - 1))}
                  className="w-8 h-8 rounded-lg border border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] transition active:scale-90">
                  <Minus className="w-4 h-4 text-[#595959]" />
                </button>
                <span className="text-[15px] font-black text-[#1a1a1a] w-6 text-center">{travelers}</span>
                <button onClick={() => setTravelers(v => Math.min(12, v + 1))}
                  className="w-8 h-8 rounded-lg border border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] transition active:scale-90">
                  <Plus className="w-4 h-4 text-[#595959]" />
                </button>
              </div>
            </div>

            {/* Budget + date */}
            <label className="block mb-3">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1a1a] mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#0071c2]" /> {t('tourDetail.totalBudget')}
              </span>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus-within:border-[#0071c2] transition">
                <span className="text-[15px] font-black text-[#595959]">€</span>
                <input type="number" min="0" step="100" value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                  className="flex-1 w-full text-[15px] font-black text-[#1a1a1a] outline-none" />
              </div>
            </label>
            <label className="block mb-4">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a1a1a] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071c2]" /> {t('tourDetail.departureDate')}
              </span>
              <input type="date" min={today} value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] outline-none text-[14px] font-bold text-[#1a1a1a] transition" />
            </label>

            {/* Fit banner */}
            <div className={`p-3.5 rounded-xl border-2 mb-4 ${
              fits ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex items-start gap-2.5">
                {fits
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={`text-[13px] font-black ${fits ? 'text-green-800' : 'text-amber-800'}`}>
                    {fits
                      ? `${t('tourDetail.budgetEnoughPrefix')} ${fmt(diff)} ${t('tourDetail.budgetEnoughSuffix')}`
                      : `${t('tourDetail.budgetShortPrefix')} ${fmt(Math.abs(diff))}`}
                  </p>
                  <p className={`text-[11px] ${fits ? 'text-green-700' : 'text-amber-700'}`}>
                    {t('tourDetail.tourLineLabel')} {fmt(pricePer)} × {travelers} = <b>{fmt(tourTotal)}</b>
                  </p>
                </div>
              </div>
              <div className="mt-2.5 h-2 rounded-full bg-white/70 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${fits ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Breakdown */}
            <p className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">{t('tourDetail.priceBreakdownTitle')}</p>
            <div className="space-y-1.5 mb-4">
              {breakdown.map(b => (
                <div key={b.labelKey} className="flex items-center gap-2">
                  <span className="text-[13px] w-5 text-center">{b.emoji}</span>
                  <span className="text-[11px] text-[#595959] flex-1 truncate">{t(`tourDetail.${b.labelKey}`)}</span>
                  <span className="text-[12px] font-black text-[#1a1a1a]">{fmt(b.amount)}</span>
                </div>
              ))}
            </div>

            {/* Savings tips */}
            {savingTips.length > 0 && (
              <div className="bg-[#fff7e6] border border-[#ffd76e] rounded-xl p-3.5 mb-4">
                <p className="flex items-center gap-1.5 text-[12px] font-black text-[#a45e00] mb-1.5">
                  <Lightbulb className="w-4 h-4" /> {t('tourDetail.savingTipsTitle')}
                </p>
                <ul className="space-y-1">
                  {savingTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-[#7c4a00] font-medium flex gap-1.5">
                      <span className="text-[#a45e00]">•</span> {tip}
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
            <p className="text-[10px] text-[#9ca3af] text-center mt-2 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" /> {t('tourDetail.dayPlanFor1')} {tour.to.city} {t('tourDetail.dayPlanFor2')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
