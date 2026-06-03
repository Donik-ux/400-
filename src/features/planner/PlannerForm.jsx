import React, { useMemo } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Sparkles, AlertTriangle, Navigation, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import { getVisaInfo, lookupDestination, getDestinationHero } from '../../services/destinationLookup';

/* ── Budget tiers ─────────────────────────────────────────────────────────── */
/* `budget` values are data; labelKey/descKey resolve to translated UI text. */
const BUDGET_TIERS = [
  { id: 'comfort',    labelKey: 'comfortLabel',    descKey: 'comfortDesc',    budget: 3000 },
  { id: 'economy',    labelKey: 'economyLabel',    descKey: 'economyDesc',    budget: 1500 },
  { id: 'budget',     labelKey: 'budgetLabel',     descKey: 'budgetDesc',     budget: 800  },
  { id: 'hostel',     labelKey: 'hostelLabel',     descKey: 'hostelDesc',     budget: 400  },
  { id: 'minimalist', labelKey: 'minimalistLabel', descKey: 'minimalistDesc', budget: 200  },
];

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
      {children}
    </div>
  </div>
);

const inputCls = "w-full bg-white border border-[#e7e7e7] rounded-xl pl-10 pr-4 py-3 text-[14px] text-[#1a1a1a] placeholder:text-[#c9d1d9] focus:outline-none focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10 transition-premium";

/* ── Destination Preview Card ─────────────────────────────────────────────── */
const DestPreview = ({ destination }) => {
  const { t } = useTranslation();
  const entry = useMemo(() => lookupDestination(destination), [destination]);
  if (!entry || destination.trim().length < 2) return null;
  const hero = entry.hero;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-[#e7e7e7] shadow-soft page-fade">
      {/* Mini hero */}
      <div className="relative h-20 w-full">
        <img src={hero} alt={entry.country} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-3 gap-2">
          <span className="text-2xl leading-none">{entry.country.split(' ').pop()}</span>
          <div>
            <p className="text-white font-black text-[14px] leading-tight">{entry.country}</p>
            {entry.visa ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400/90 text-amber-900 rounded-full px-2 py-0.5 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> {t('plannerPage.form.visaRequiredBadge')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-400/90 text-green-900 rounded-full px-2 py-0.5 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> {t('plannerPage.form.noVisaBadge')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Form ────────────────────────────────────────────────────────────── */
const PlannerForm = ({ formData, onChange, onSubmit, loading }) => {
  const { t } = useTranslation();
  const set = (key) => (e) => onChange({ ...formData, [key]: e.target.value });

  const visaInfo  = useMemo(() => getVisaInfo(formData.destination), [formData.destination]);
  const activeTier = BUDGET_TIERS.find(tier => tier.id === formData.budgetStyle);

  const applyTier = (tier) => {
    onChange({ ...formData, budget: tier.budget, budgetStyle: tier.id });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#e7e7e7] rounded-2xl p-6 md:p-8 shadow-lift"
    >
      {/* ── Route: From → To ── */}
      <div className="mb-5">
        <label className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-2">{t('plannerPage.form.route')}</label>
        <div className="flex items-center gap-2">
          {/* From */}
          <div className="relative flex-1">
            <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
            <input
              type="text"
              placeholder={t('plannerPage.form.fromPlaceholder')}
              value={formData.fromCity || ''}
              onChange={(e) => onChange({ ...formData, fromCity: e.target.value })}
              className={inputCls}
            />
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center gap-0.5 px-1 shrink-0">
            <div className="w-5 h-px bg-[#c9d1d9]" />
            <span className="text-[11px] text-[#9ca3af] font-black">✈</span>
            <div className="w-5 h-px bg-[#c9d1d9]" />
          </div>
          {/* To */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
            <input
              type="text"
              required
              placeholder={t('planner.form.destPlaceholder')}
              value={formData.destination}
              onChange={set('destination')}
              className={inputCls}
            />
          </div>
        </div>

        {/* Live destination preview */}
        <DestPreview destination={formData.destination} />

        {/* Route badge */}
        {formData.fromCity && formData.destination && (
          <div className="mt-2 px-3 py-2 bg-[#f0f5ff] border border-[#0071c2]/20 rounded-xl flex items-center gap-2">
            <span className="text-[12px] text-[#0071c2] font-bold">
              ✈️ {formData.fromCity} → {formData.destination}
            </span>
          </div>
        )}
      </div>

      {/* ── Visa Warning (detailed) ── */}
      {visaInfo && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-black text-amber-800 mb-1">
              ⚠️ {t('plannerPage.form.visaTitle')} {visaInfo.country}
            </p>
            <p className="text-[12px] text-amber-700 leading-snug">{visaInfo.text}</p>
            <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
              📌 {t('plannerPage.form.visaNote')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Start Date */}
        <Field label={t('planner.form.startDate')} icon={Calendar}>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={set('startDate')}
            className={inputCls}
          />
        </Field>

        {/* Days */}
        <Field label={t('planner.form.days')} icon={Clock}>
          <input
            type="number"
            required
            min="1"
            max="14"
            value={formData.days}
            onChange={(e) => onChange({ ...formData, days: Math.max(1, parseInt(e.target.value) || 1) })}
            className={inputCls}
          />
        </Field>

        {/* Budget tiers + input — full width */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-2">
            {t('plannerPage.form.budgetLevel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
            {BUDGET_TIERS.map(tier => {
              const active = (formData.budgetStyle || 'economy') === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => applyTier(tier)}
                  className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-premium ${
                    active
                      ? 'bg-[#003580] border-[#003580] text-white shadow-float -translate-y-0.5'
                      : 'bg-white border-[#e7e7e7] text-[#595959] hover:border-[#0071c2] hover:text-[#003580] hover:-translate-y-0.5 hover:shadow-soft'
                  }`}
                >
                  <span className="text-[13px] font-black leading-tight">{t(`plannerPage.form.tiers.${tier.labelKey}`)}</span>
                  <span className={`text-[10px] leading-tight ${active ? 'text-white/70' : 'text-[#9ca3af]'}`}>
                    ~${tier.budget.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>

          <Field label={t('planner.form.budget')} icon={DollarSign}>
            <input
              type="number"
              required
              min="100"
              step="50"
              value={formData.budget}
              onChange={(e) => onChange({ ...formData, budget: Math.max(100, parseInt(e.target.value) || 100), budgetStyle: undefined })}
              className={inputCls}
            />
          </Field>
          {activeTier && (
            <p className="text-[11px] text-[#0071c2] mt-1 font-medium">
              {t(`plannerPage.form.tiers.${activeTier.labelKey}`)} · {t(`plannerPage.form.tiers.${activeTier.descKey}`)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#1a1a1a]/25 border-t-[#1a1a1a] rounded-full animate-spin" />
              {t('planner.form.generating')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('planner.form.generate')}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PlannerForm;
