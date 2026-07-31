import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Snowflake, Globe, ArrowRight, Clock, Star, Users, Plane, Sparkles, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../store/useLangStore';
import { TOURS } from '../data/exoticTours';
import Price, { usePriceFormatter } from '../components/Price';
import { handleImgError } from '../utils/imageFallback';
import { whatsappLink, WHATSAPP_CONFIGURED, SUPPORT_EMAIL } from '../config/contact';

// Tour data is authored in EUR ('€8,500' etc.) but <Price>/usePriceFormatter
// render the parsed number as a USD base amount — convert once here so
// displayed prices and budget-fit checks aren't off by the EUR/USD spread.
const EUR_TO_USD = 1.09;
const parsePrice = (s) => {
  const n = Number(String(s || '').replace(/[^\d]/g, '')) || 0;
  return String(s || '').trim().startsWith('€') ? Math.round(n * EUR_TO_USD) : n;
};

const TourCard = ({ tour, budget, anchor = false }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = usePriceFormatter();

  const price     = parsePrice(tour.price);
  const hasBudget = budget > 0;
  const fits      = hasBudget && budget >= price;
  const over      = hasBudget ? price - budget : 0;
  const openTour  = () => navigate(`/exotic-tours/${tour.id}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.15 } }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className={`group lift bg-white rounded-2xl border overflow-hidden shadow-soft flex flex-col ${anchor ? 'md:col-span-2' : ''} ${
        hasBudget && !fits
          ? 'border-[#dfe7ec] opacity-65 hover:opacity-100'
          : fits ? 'border-[#cfe3d2]' : 'border-[#dfe7ec]'
      }`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden cursor-pointer" onClick={openTour}>
        <img
          src={tour.image}
          alt={tour.title}
          onError={handleImgError}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Type badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${tour.badgeColor} shadow-lg`}>
          {tour.badge} {tour.badgeLabel}
        </div>

        {/* Budget-fit badge */}
        {hasBudget && (
          <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg ${
            fits ? 'bg-[#2e7d4f] text-white' : 'bg-gradient-to-r from-[#00a58e] to-[#009882] text-[#252a31]'
          }`}>
            {fits ? `✓ ${t('exoticTours.inBudget')}` : `+${fmt(over)}`}
          </div>
        )}

        {/* Title over image */}
        <div className="absolute bottom-4 left-4 right-4 transition-transform duration-500 group-hover:-translate-y-0.5">
          <h3 className="text-white text-[19px] font-black leading-tight drop-shadow-lg">{tour.title}</h3>
          <p className="text-white/80 text-[12px] font-medium">{tour.tagline}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Temperature route */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-gradient-to-r from-[#fdf1e8] via-white to-[#eaf3f4] border border-[#e8edf1]">
          <div className="text-center px-1 shrink-0">
            <div className="text-[18px] leading-none">{tour.from.icon}</div>
            <div className="text-[11px] font-black text-[#252a31] mt-0.5">{tour.from.city}</div>
            <div className="text-[10px] font-black text-[#c26d4a]">{tour.from.temp}</div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-[3px] rounded-full bg-gradient-to-r from-[#009882] to-[#2d6a6f]" />
            <Plane className="w-4 h-4 text-[#0172cb] mx-1 rotate-45 shrink-0" />
          </div>
          <div className="text-center px-1 shrink-0">
            <div className="text-[18px] leading-none">{tour.to.icon}</div>
            <div className="text-[11px] font-black text-[#252a31] mt-0.5">{tour.to.city}</div>
            <div className="text-[10px] font-black text-[#2d6a6f]">{tour.to.temp}</div>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f7f9] text-[11px] font-bold text-[#4a5867]">
            <Clock className="w-3 h-3" />{tour.days} {t('exotic.days')}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#e6f6f3] text-[11px] font-bold text-[#007f6d]">
            <Star className="w-3 h-3 fill-[#00a58e] text-[#00a58e]" />{tour.rating} ({tour.reviews})
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f7f9] text-[11px] font-bold text-[#4a5867]">
            <Users className="w-3 h-3" />{tour.groupSize}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-[#4a5867] leading-relaxed mb-3">{tour.desc}</p>

        {/* Highlights toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[12px] font-bold text-[#0172cb] hover:underline mb-2 flex items-center gap-1 self-start"
        >
          {expanded ? t('exotic.hideHighlights') : t('exotic.showHighlights')} <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <ul className="mb-3 space-y-1.5">
            {tour.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px] text-[#4a5867]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0172cb] shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-auto border-t border-[#e8edf1]">
          <div>
            <div className="text-[10px] text-[#697d95] font-bold uppercase tracking-wider">{t('exotic.perPerson')}</div>
            <div className="text-[22px] font-black text-[#252a31] leading-none"><Price amount={price} /></div>
          </div>
          <button
            onClick={openTour}
            className="btn-gold px-4 py-2.5 rounded-xl text-[12px] flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> {t('exotic.viewTour')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ExoticTours = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [budget, setBudget] = useState(0);
  const { t } = useTranslation();

  const TYPE_FILTERS = [
    { key: null,        label: t('exotic.allTours'),      icon: Globe },
    { key: 'hot-cold',  label: t('exotic.filterHotCold'), icon: Thermometer },
    { key: 'cold-hot',  label: t('exotic.filterColdHot'), icon: Snowflake },
    { key: 'cultural',  label: t('exotic.filterCultural'), icon: Globe },
  ];

  // Filter by type, then (when a budget is set) sort affordable tours first
  const visible = useMemo(() => {
    let list = activeFilter ? TOURS.filter(x => x.type === activeFilter) : TOURS;
    if (budget > 0) {
      list = [...list].sort((a, b) => {
        const fa = budget >= parsePrice(a.price);
        const fb = budget >= parsePrice(b.price);
        if (fa !== fb) return fa ? -1 : 1;
        return parsePrice(a.price) - parsePrice(b.price);
      });
    }
    return list;
  }, [activeFilter, budget]);

  const affordableCount = budget > 0
    ? visible.filter(x => budget >= parsePrice(x.price)).length
    : 0;

  /* Bottom CTA — hand the traveller to a human. WhatsApp when the number is
     configured, otherwise a pre-filled mail to support so the button always
     leads somewhere instead of being decorative. */
  const requestCustomTour = () => {
    const msg = t('exotic.ctaMessage');
    const wa = whatsappLink(msg);
    if (WHATSAPP_CONFIGURED && wa) {
      window.open(wa, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('exotic.ctaBtn'))}&body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-[#eef2f5]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1c2127] via-[#252a31] to-[#252a31] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[200%] bg-white/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[200%] bg-[#0172cb]/30 blur-[100px] rounded-full" />
        </div>
        <div className="absolute top-10 right-[12%] w-64 h-64 rounded-full bg-[#00a58e]/10 blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <Globe className="w-4 h-4 text-white/80" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                {t('exotic.badge')}
              </span>
            </div>

            <h1 className="font-display text-[clamp(38px,10vw,72px)] font-semibold text-white leading-[0.95] tracking-[-0.03em] text-balance break-words mb-6">
              {t('exotic.title1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#61d1bf] to-[#7fc4c9]">
                {t('exotic.title2')}
              </span>
            </h1>

            <p className="text-[17px] text-white/70 max-w-xl leading-relaxed mb-10">
              {t('exotic.sub')}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { value: '8', label: t('exotic.tours') },
                { value: '4', label: t('exotic.continents') },
                { value: '100+', label: t('exotic.travelers') },
                { value: '4.8★', label: t('exotic.rating') },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[28px] font-black text-gradient-gold">{s.value}</div>
                  <div className="text-[12px] text-white/50 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 720 0 0 40V60Z" fill="#eef2f5" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">

        {/* Budget finder */}
        <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4 shadow-soft">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0172cb] to-[#252a31] flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#252a31]">{t('exoticTours.budgetFinderTitle')}</p>
              <p className="text-[12px] text-[#697d95]">{t('exoticTours.budgetFinderSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus-within:border-[#0172cb] transition flex-1 md:max-w-[240px]">
            <span className="text-[16px] font-black text-[#4a5867]">$</span>
            <input
              type="number" min="0" step="500" value={budget || ''}
              onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
              placeholder={t('exoticTours.budgetPlaceholder')}
              className="flex-1 w-full text-[15px] font-black text-[#252a31] outline-none placeholder:text-[#bac7d1] placeholder:font-medium" />
            {budget > 0 && (
              <button onClick={() => setBudget(0)} className="text-[#697d95] hover:text-[#252a31]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {budget > 0 && (
            <span className={`text-[13px] font-black px-3 py-1.5 rounded-lg shrink-0 ${
              affordableCount > 0 ? 'bg-[#e9f3ea] text-ok' : 'bg-[#fdf3dc] text-warn'
            }`}>
              {affordableCount > 0
                ? `✓ ${affordableCount} ${affordableCount === 1 ? t('exoticTours.tourSingular') : t('exoticTours.tourPlural')} ${t('exoticTours.inBudgetSuffix')}`
                : t('exoticTours.noToursInBudget')}
            </span>
          )}
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_FILTERS.map(f => (
            <button
              key={String(f.key)}
              onClick={() => setActiveFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border ${
                activeFilter === f.key
                  ? 'bg-[#252a31] text-white border-[#252a31] shadow-md'
                  : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#252a31] hover:text-[#252a31]'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-[13px] text-[#697d95] font-medium">
            {visible.length} {t('exotic.toursFound')}
          </span>
        </div>

        {/* Tour grid — the first card anchors the layout by spanning 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {visible.map((tour, i) => (
              <TourCard key={tour.id} tour={tour} budget={budget}
                anchor={i === 0 || (i === visible.length - 1 && (visible.length + 1) % 3 === 2)} />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="relative mt-12 bg-gradient-to-br from-[#1c2127] via-[#252a31] to-[#252a31] rounded-3xl p-10 md:p-12 text-center overflow-hidden shadow-lift">
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-[#00a58e]/10 blur-3xl pointer-events-none animate-float" />
          <div className="relative">
            <h2 className="text-[36px] font-black text-white mb-4">
              {t('exotic.ctaTitle')}
            </h2>
            <p className="text-[16px] text-white/70 mb-8 max-w-lg mx-auto">
              {t('exotic.ctaSub')}
            </p>
            <button onClick={requestCustomTour} className="btn-gold px-10 py-4 rounded-2xl text-[15px] active:scale-95 transition">
              {t('exotic.ctaBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExoticTours;
