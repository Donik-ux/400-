import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Wallet, Minus, Plus, Plane, Hotel, Sparkles, ArrowRight,
  CheckCircle2, MapPin, Calendar,
} from 'lucide-react';
import { findDestinations, ORIGIN } from '../services/budgetDestinations';
import { heroFor } from '../utils/destinationImages';
import SmartImage from '../components/SmartImage';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';
import { usePriceFormatter } from '../components/Price';

/* Region values keep their original data strings (used for filtering the data
 * lists); `tKey` maps each to a translated display label. */
const REGIONS = [
  { value: 'Центральная Азия', tKey: 'centralAsia' },
  { value: 'Кавказ',           tKey: 'caucasus' },
  { value: 'Ближний Восток',   tKey: 'middleEast' },
  { value: 'Азия',             tKey: 'asia' },
  { value: 'Африка',           tKey: 'africa' },
  { value: 'Европа',           tKey: 'europe' },
  { value: 'Америка',          tKey: 'americas' },
];

const VIBES = [
  { key: 'beach',   emoji: '🏖️', tags: ['пляж', 'море', 'отдых', 'дайвинг'] },
  { key: 'city',    emoji: '🏙️', tags: ['город'] },
  { key: 'history', emoji: '🏛️', tags: ['история', 'культура'] },
  { key: 'food',    emoji: '🍽️', tags: ['еда', 'вино'] },
  { key: 'lux',     emoji: '💎', tags: ['люкс', 'шопинг'] },
  { key: 'budget',  emoji: '💰', tags: ['бюджетно', 'рядом'] },
  { key: 'nature',  emoji: '🌿', tags: ['природа', 'горы'] },
];

function DestinationCard({ dest, days, budget }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const usd = usePriceFormatter();
  const regionTKey = REGIONS.find(r => r.value === dest.region)?.tKey;
  const regionLabel = regionTKey ? t(`whereToGo.regions.${regionTKey}`) : dest.region;

  const handlePlan = () => {
    navigate('/planner', {
      state: {
        autoPlanFormData: {
          destination:   dest.city,
          fromCity:      ORIGIN.city,
          startDate:     '',
          days,
          budget:        Math.max(1, Math.round(Number(budget) || dest.total)),
          budgetStyle:   'economy',
          transportMode: 'public',
        },
      },
    });
  };

  return (
    <div className={`group card-sheen bg-white border rounded-2xl overflow-hidden flex flex-col lift shadow-soft ${
      dest.fits ? 'border-[#cfe3d2]' : 'border-[#dfe7ec] opacity-80 hover:opacity-100'
    }`}>
      <div className="relative">
        <SmartImage src={heroFor(dest.city)} alt={dest.city} aspect="aspect-[16/10]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black text-[#252a31] shadow-soft">
          {regionLabel}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black shadow-float ${
          dest.fits ? 'bg-[#2e7d4f] text-white' : 'bg-[#00a58e] text-white'
        }`}>
          {dest.fits ? t('whereToGo.card.fits') : `+${usd(Math.abs(dest.spare))}`}
        </span>
        <h3 className="absolute bottom-3 left-3.5 right-3.5 text-white text-[18px] font-black flex items-center gap-1.5 drop-shadow-lg">
          {dest.flag} {dest.city}
          <span className="text-white/75 text-[12px] font-bold">· {dest.country}</span>
        </h3>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[12px] text-[#4a5867] leading-snug mb-3">{dest.blurb}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {dest.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold text-[#0172cb] bg-[#e8f4fd] rounded-full px-2 py-0.5">#{tag}</span>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="bg-[#eef2f5] border border-[#dfe7ec] rounded-xl p-3 mb-3 text-[11px] font-bold text-[#4a5867]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Plane className="w-3 h-3 text-[#0172cb]" /> {t('whereToGo.card.flight')}</span>
            <span>{usd(dest.flight)}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1.5"><Hotel className="w-3 h-3 text-[#0172cb]" /> {days} {t('whereToGo.card.daysOnSite')}</span>
            <span>{usd(dest.ground)}</span>
          </div>
          <div className="hairline my-2" />
          <div className="flex items-center justify-between text-[#252a31]">
            <span className="font-black">{t('whereToGo.card.total')}</span>
            <span className="text-[15px] font-black text-gradient">{usd(dest.total)}</span>
          </div>
        </div>

        <button onClick={handlePlan}
          className="mt-auto w-full py-2.5 rounded-xl bg-[#252a31] text-white text-[12px] font-black flex items-center justify-center gap-1.5 hover:bg-[#0172cb] transition-premium active:scale-[0.98] shadow-soft group-hover:shadow-float">
          <Sparkles className="w-3.5 h-3.5" /> {t('whereToGo.card.plan')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default function WhereToGo() {
  const { t } = useTranslation();
  const usd = usePriceFormatter();
  const [budget, setBudget] = useState(1500);
  const [days, setDays]     = useState(7);
  const [region, setRegion] = useState(null);
  const [vibe, setVibe]     = useState(null);

  useSEO({
    title: t('whereToGo.seo.title'),
    description: t('whereToGo.seo.description'),
    keywords: t('whereToGo.seo.keywords'),
  });

  const results = useMemo(() => {
    let list = findDestinations({ budget, days });
    if (region) list = list.filter(r => r.region === region);
    if (vibe) {
      const vibeTags = VIBES.find(v => v.key === vibe)?.tags || [];
      list = list.filter(r => r.tags.some(tag => vibeTags.includes(tag)));
    }
    return list;
  }, [budget, days, region, vibe]);

  const affordable    = results.filter(r => r.fits);
  const nearMiss      = results.filter(r => !r.fits).slice(0, 6);
  const filtersActive = region || vibe;

  return (
    <div className="bg-[#f5f7f9] min-h-screen">

      {/* Hero + search */}
      <section className="relative bg-[#1c2127] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none animate-float"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #0172cb 0%, transparent 45%), radial-gradient(circle at 80% 70%, #009882 0%, transparent 38%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#009882] text-[#1c2127] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <Compass className="w-3.5 h-3.5" /> {t('whereToGo.hero.badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">
            {t('whereToGo.hero.title1')} <span className="text-gradient-gold">{t('whereToGo.hero.title2')}</span>
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/70 font-medium mb-7 max-w-xl">
            {t('whereToGo.hero.sub')}
          </p>

          {/* Search card */}
          <div className="bg-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-end gap-4 max-w-3xl shadow-lift">
            <label className="flex-1">
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#252a31] mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#0172cb]" /> {t('whereToGo.hero.budgetLabel')}
              </span>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 border-[#dfe7ec] focus-within:border-[#0172cb] focus-within:ring-4 focus-within:ring-[#0172cb]/10 transition-premium">
                <span className="text-[16px] font-black text-[#4a5867]">$</span>
                <input type="number" min="0" step="100" value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                  className="flex-1 w-full text-[16px] font-black text-[#252a31] outline-none" />
              </div>
            </label>

            <div>
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#252a31] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0172cb]" /> {t('whereToGo.hero.daysLabel')}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setDays(v => Math.max(1, v - 1))}
                  className="w-10 h-[46px] rounded-xl border-2 border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] hover:bg-[#e8f4fd] transition-premium active:scale-90">
                  <Minus className="w-4 h-4 text-[#4a5867]" />
                </button>
                <span className="text-[16px] font-black text-[#252a31] w-8 text-center tabular-nums">{days}</span>
                <button onClick={() => setDays(v => Math.min(30, v + 1))}
                  className="w-10 h-[46px] rounded-xl border-2 border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] hover:bg-[#e8f4fd] transition-premium active:scale-90">
                  <Plus className="w-4 h-4 text-[#4a5867]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-[#eef2f5] border border-[#dfe7ec] text-[12px] font-bold text-[#4a5867]">
              <Plane className="w-3.5 h-3.5 text-[#0172cb] rotate-45" /> {t('whereToGo.hero.fromPrefix')} {ORIGIN.city} ({ORIGIN.code})
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Filters */}
        <div className="mb-6 space-y-2.5">
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v => (
              <button key={v.key} onClick={() => setVibe(vibe === v.key ? null : v.key)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-premium ${
                  vibe === v.key
                    ? 'bg-[#252a31] text-white border-[#252a31] shadow-float'
                    : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#252a31] shadow-soft'
                }`}>
                {v.emoji} {t(`whereToGo.vibes.${v.key}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button key={r.value} onClick={() => setRegion(region === r.value ? null : r.value)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-premium ${
                  region === r.value
                    ? 'bg-[#0172cb] text-white border-[#0172cb] shadow-float'
                    : 'bg-white text-[#697d95] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#0172cb]'
                }`}>
                {t(`whereToGo.regions.${r.tKey}`)}
              </button>
            ))}
            {filtersActive && (
              <button onClick={() => { setRegion(null); setVibe(null); }}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-black text-danger hover:bg-[#faeae6] transition-premium">
                ✕ {t('whereToGo.filters.reset')}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-5">
          <h2 className="text-[18px] font-black text-[#252a31]">
            {affordable.length > 0
              ? `${affordable.length} ${affordable.length === 1 ? t('whereToGo.results.headingOne') : t('whereToGo.results.headingMany')}`
              : t('whereToGo.results.headingNone')}
          </h2>
          <span className="text-[13px] text-[#697d95] font-medium">· {budget ? usd(budget) : '—'} · {days} {t('whereToGo.results.daysSuffix')}</span>
        </div>

        {affordable.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {affordable.map((dest, i) => (
              <div key={dest.city} className="page-fade" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                <DestinationCard dest={dest} days={days} budget={budget} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#dfe7ec] rounded-2xl p-10 text-center mb-8 shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f4fd] flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-[#0172cb] animate-float" />
            </div>
            <p className="text-[15px] font-black text-[#252a31] mb-1">{t('whereToGo.results.emptyTitle')}</p>
            <p className="text-[13px] text-[#697d95]">{t('whereToGo.results.emptySub')}</p>
          </div>
        )}

        {/* Near misses */}
        {nearMiss.length > 0 && (
          <>
            <h2 className="text-[18px] font-black text-[#252a31] mt-10 mb-1">{t('whereToGo.results.nearMissTitle')}</h2>
            <p className="text-[13px] text-[#697d95] mb-5">{t('whereToGo.results.nearMissSub')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearMiss.map((dest, i) => (
                <div key={dest.city} className="page-fade" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  <DestinationCard dest={dest} days={days} budget={budget} />
                </div>
              ))}
            </div>
          </>
        )}

        <p className="flex items-center gap-1.5 text-[11px] text-[#697d95] mt-8">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('whereToGo.results.disclaimer')}
        </p>
      </div>
    </div>
  );
}
