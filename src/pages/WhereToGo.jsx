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

const usd = (n) => '$' + Number(n || 0).toLocaleString();

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
    <div className={`group bg-white border rounded-2xl overflow-hidden flex flex-col lift shadow-soft ${
      dest.fits ? 'border-green-200' : 'border-[#e7e7e7] opacity-80 hover:opacity-100'
    }`}>
      <div className="relative">
        <SmartImage src={heroFor(dest.city)} alt={dest.city} aspect="aspect-[16/10]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black text-[#003580] shadow-soft">
          {dest.region}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black shadow-float ${
          dest.fits ? 'bg-green-500 text-white' : 'bg-[#febb02] text-[#1a1a1a]'
        }`}>
          {dest.fits ? t('whereToGo.card.fits') : `+${usd(Math.abs(dest.spare))}`}
        </span>
        <h3 className="absolute bottom-3 left-3.5 right-3.5 text-white text-[18px] font-black flex items-center gap-1.5 drop-shadow-lg">
          {dest.flag} {dest.city}
          <span className="text-white/75 text-[12px] font-bold">· {dest.country}</span>
        </h3>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[12px] text-[#595959] leading-snug mb-3">{dest.blurb}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {dest.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold text-[#0071c2] bg-[#f0f5ff] rounded-full px-2 py-0.5">#{tag}</span>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-3 mb-3 text-[11px] font-bold text-[#595959]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Plane className="w-3 h-3 text-[#0071c2]" /> {t('whereToGo.card.flight')}</span>
            <span>{usd(dest.flight)}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="flex items-center gap-1.5"><Hotel className="w-3 h-3 text-[#0071c2]" /> {days} {t('whereToGo.card.daysOnSite')}</span>
            <span>{usd(dest.ground)}</span>
          </div>
          <div className="hairline my-2" />
          <div className="flex items-center justify-between text-[#1a1a1a]">
            <span className="font-black">{t('whereToGo.card.total')}</span>
            <span className="text-[15px] font-black text-gradient">{usd(dest.total)}</span>
          </div>
        </div>

        <button onClick={handlePlan}
          className="mt-auto w-full py-2.5 rounded-xl bg-[#003580] text-white text-[12px] font-black flex items-center justify-center gap-1.5 hover:bg-[#0071c2] transition-premium active:scale-[0.98] shadow-soft group-hover:shadow-float">
          <Sparkles className="w-3.5 h-3.5" /> {t('whereToGo.card.plan')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default function WhereToGo() {
  const { t } = useTranslation();
  const [budget, setBudget] = useState(1500);
  const [days, setDays]     = useState(7);
  const [region, setRegion] = useState(null);
  const [vibe, setVibe]     = useState(null);

  useSEO({
    title: 'Куда полететь на ваш бюджет — подбор направлений',
    description: 'Введите бюджет и срок поездки — покажем, в какие страны вы можете полететь из Бишкека, с оценкой стоимости и AI-планом.',
    keywords: ['куда полететь', 'подбор тура по бюджету', 'дешёвые направления из Бишкека'],
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
    <div className="bg-[#f5f5f5] min-h-screen">

      {/* Hero + search */}
      <section className="relative bg-[#002250] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none animate-float"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 80% 70%, #f5b942 0%, transparent 38%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5b942] text-[#002250] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
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
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#1a1a1a] mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#0071c2]" /> {t('whereToGo.hero.budgetLabel')}
              </span>
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border-2 border-[#e7e7e7] focus-within:border-[#0071c2] focus-within:ring-4 focus-within:ring-[#0071c2]/10 transition-premium">
                <span className="text-[16px] font-black text-[#595959]">$</span>
                <input type="number" min="0" step="100" value={budget}
                  onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                  className="flex-1 w-full text-[16px] font-black text-[#1a1a1a] outline-none" />
              </div>
            </label>

            <div>
              <span className="flex items-center gap-1.5 text-[12px] font-black text-[#1a1a1a] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071c2]" /> {t('whereToGo.hero.daysLabel')}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setDays(v => Math.max(1, v - 1))}
                  className="w-10 h-[46px] rounded-xl border-2 border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] hover:bg-[#f0f5ff] transition-premium active:scale-90">
                  <Minus className="w-4 h-4 text-[#595959]" />
                </button>
                <span className="text-[16px] font-black text-[#1a1a1a] w-8 text-center tabular-nums">{days}</span>
                <button onClick={() => setDays(v => Math.min(30, v + 1))}
                  className="w-10 h-[46px] rounded-xl border-2 border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] hover:bg-[#f0f5ff] transition-premium active:scale-90">
                  <Plus className="w-4 h-4 text-[#595959]" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-[#f8f9fa] border border-[#e7e7e7] text-[12px] font-bold text-[#595959]">
              <Plane className="w-3.5 h-3.5 text-[#0071c2] rotate-45" /> {t('whereToGo.hero.fromPrefix')} {ORIGIN.city} ({ORIGIN.code})
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
                    ? 'bg-[#003580] text-white border-[#003580] shadow-float'
                    : 'bg-white text-[#595959] border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#003580] shadow-soft'
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
                    ? 'bg-[#0071c2] text-white border-[#0071c2] shadow-float'
                    : 'bg-white text-[#9ca3af] border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#0071c2]'
                }`}>
                {t(`whereToGo.regions.${r.tKey}`)}
              </button>
            ))}
            {filtersActive && (
              <button onClick={() => { setRegion(null); setVibe(null); }}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-black text-red-500 hover:bg-red-50 transition-premium">
                ✕ {t('whereToGo.filters.reset')}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-5">
          <h2 className="text-[18px] font-black text-[#1a1a1a]">
            {affordable.length > 0
              ? `${affordable.length} ${affordable.length === 1 ? t('whereToGo.results.headingOne') : t('whereToGo.results.headingMany')}`
              : t('whereToGo.results.headingNone')}
          </h2>
          <span className="text-[13px] text-[#9ca3af] font-medium">· {budget ? usd(budget) : '—'} · {days} {t('whereToGo.results.daysSuffix')}</span>
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
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-10 text-center mb-8 shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-[#f0f5ff] flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-[#0071c2] animate-float" />
            </div>
            <p className="text-[15px] font-black text-[#1a1a1a] mb-1">{t('whereToGo.results.emptyTitle')}</p>
            <p className="text-[13px] text-[#9ca3af]">{t('whereToGo.results.emptySub')}</p>
          </div>
        )}

        {/* Near misses */}
        {nearMiss.length > 0 && (
          <>
            <h2 className="text-[18px] font-black text-[#1a1a1a] mt-10 mb-1">{t('whereToGo.results.nearMissTitle')}</h2>
            <p className="text-[13px] text-[#9ca3af] mb-5">{t('whereToGo.results.nearMissSub')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearMiss.map((dest, i) => (
                <div key={dest.city} className="page-fade" style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                  <DestinationCard dest={dest} days={days} budget={budget} />
                </div>
              ))}
            </div>
          </>
        )}

        <p className="flex items-center gap-1.5 text-[11px] text-[#9ca3af] mt-8">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t('whereToGo.results.disclaimer')}
        </p>
      </div>
    </div>
  );
}
