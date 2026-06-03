import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Snowflake, Globe, ArrowRight, Clock, Star, Users, Plane, Sparkles, Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../store/useLangStore';
import { TOURS } from '../data/exoticTours';

const parsePrice = (s) => Number(String(s || '').replace(/[^\d]/g, '')) || 0;

const TourCard = ({ tour, budget }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      className={`group lift bg-white rounded-2xl border overflow-hidden shadow-soft flex flex-col ${
        hasBudget && !fits
          ? 'border-[#e7e7e7] opacity-65 hover:opacity-100'
          : fits ? 'border-green-300' : 'border-[#e7e7e7]'
      }`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden cursor-pointer" onClick={openTour}>
        <img
          src={tour.image}
          alt={tour.title}
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
            fits ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-[#febb02] to-[#f5b942] text-[#1a1a1a]'
          }`}>
            {fits ? `✓ ${t('exoticTours.inBudget')}` : `+€${over.toLocaleString()}`}
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
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-gradient-to-r from-orange-50 via-white to-blue-50 border border-[#f0f0f0]">
          <div className="text-center px-1 shrink-0">
            <div className="text-[18px] leading-none">{tour.from.icon}</div>
            <div className="text-[11px] font-black text-[#1a1a1a] mt-0.5">{tour.from.city}</div>
            <div className="text-[10px] font-black text-orange-500">{tour.from.temp}</div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-[3px] rounded-full bg-gradient-to-r from-orange-400 to-blue-400" />
            <Plane className="w-4 h-4 text-[#0071c2] mx-1 rotate-45 shrink-0" />
          </div>
          <div className="text-center px-1 shrink-0">
            <div className="text-[18px] leading-none">{tour.to.icon}</div>
            <div className="text-[11px] font-black text-[#1a1a1a] mt-0.5">{tour.to.city}</div>
            <div className="text-[10px] font-black text-blue-500">{tour.to.temp}</div>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f5] text-[11px] font-bold text-[#595959]">
            <Clock className="w-3 h-3" />{tour.days} {t('exotic.days')}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#fff7e6] text-[11px] font-bold text-[#a45e00]">
            <Star className="w-3 h-3 fill-[#febb02] text-[#febb02]" />{tour.rating} ({tour.reviews})
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f5] text-[11px] font-bold text-[#595959]">
            <Users className="w-3 h-3" />{tour.groupSize}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-[#595959] leading-relaxed mb-3">{tour.desc}</p>

        {/* Highlights toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[12px] font-bold text-[#0071c2] hover:underline mb-2 flex items-center gap-1 self-start"
        >
          {expanded ? t('exotic.hideHighlights') : t('exotic.showHighlights')} <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <ul className="mb-3 space-y-1.5">
            {tour.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px] text-[#595959]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071c2] shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-auto border-t border-[#f0f0f0]">
          <div>
            <div className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">{t('exotic.perPerson')}</div>
            <div className="text-[22px] font-black text-[#003580] leading-none">{tour.price}</div>
          </div>
          <button
            onClick={openTour}
            className="btn-gold px-4 py-2.5 rounded-xl text-[12px] flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> View tour <ArrowRight className="w-3.5 h-3.5" />
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

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#002250] via-[#003580] to-[#003580] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[200%] bg-white/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[200%] bg-[#0071c2]/30 blur-[100px] rounded-full" />
        </div>
        <div className="absolute top-10 right-[12%] w-64 h-64 rounded-full bg-[#febb02]/10 blur-3xl pointer-events-none animate-float" />

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

            <h1 className="text-[52px] md:text-[72px] font-black text-white leading-[0.95] tracking-tighter mb-6">
              {t('exotic.title1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-blue-300">
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
            <path d="M0 60L1440 60L1440 20C1200 60 720 0 0 40V60Z" fill="#f8f9fa" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">

        {/* Budget finder */}
        <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4 shadow-soft">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0071c2] to-[#003580] flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#1a1a1a]">{t('exoticTours.budgetFinderTitle')}</p>
              <p className="text-[12px] text-[#9ca3af]">{t('exoticTours.budgetFinderSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus-within:border-[#0071c2] transition flex-1 md:max-w-[240px]">
            <span className="text-[16px] font-black text-[#595959]">€</span>
            <input
              type="number" min="0" step="500" value={budget || ''}
              onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
              placeholder={t('exoticTours.budgetPlaceholder')}
              className="flex-1 w-full text-[15px] font-black text-[#1a1a1a] outline-none placeholder:text-[#c9d1d9] placeholder:font-medium" />
            {budget > 0 && (
              <button onClick={() => setBudget(0)} className="text-[#9ca3af] hover:text-[#1a1a1a]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {budget > 0 && (
            <span className={`text-[13px] font-black px-3 py-1.5 rounded-lg shrink-0 ${
              affordableCount > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
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
                  ? 'bg-[#003580] text-white border-[#003580] shadow-md'
                  : 'bg-white text-[#595959] border-[#e7e7e7] hover:border-[#003580] hover:text-[#003580]'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-[13px] text-[#9ca3af] font-medium">
            {visible.length} {t('exotic.toursFound')}
          </span>
        </div>

        {/* Tour grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {visible.map(tour => (
              <TourCard key={tour.id} tour={tour} budget={budget} />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="relative mt-20 bg-gradient-to-br from-[#002250] via-[#003580] to-[#003580] rounded-[32px] p-10 md:p-16 text-center overflow-hidden shadow-lift">
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-[#febb02]/10 blur-3xl pointer-events-none animate-float" />
          <div className="relative">
            <h2 className="text-[36px] font-black text-white mb-4">
              {t('exotic.ctaTitle')}
            </h2>
            <p className="text-[16px] text-white/70 mb-8 max-w-lg mx-auto">
              {t('exotic.ctaSub')}
            </p>
            <button className="btn-gold px-10 py-4 rounded-2xl text-[15px]">
              {t('exotic.ctaBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExoticTours;
