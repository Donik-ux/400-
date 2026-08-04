import React, { useMemo } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Sparkles, AlertTriangle, Navigation, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import { getVisaStatus, lookupDestination } from '../../services/destinationLookup';
import { localizeVisa } from '../../utils/visaTiming';
import CityAutocomplete from '../flights/CityAutocomplete';
import SmartImage from '../../components/SmartImage';

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
    <label className="text-[11px] font-bold uppercase tracking-widest text-[#697d95] block mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697d95] pointer-events-none" />
      {children}
    </div>
  </div>
);

const inputCls = "w-full bg-white border border-[#dfe7ec] rounded-xl pl-10 pr-4 py-3 text-[14px] text-[#252a31] placeholder:text-[#bac7d1] focus:outline-none focus:border-[#0172cb] focus:ring-4 focus:ring-[#0172cb]/10 transition-premium";

/* ── Destination Preview Card ─────────────────────────────────────────────── */
const DestPreview = ({ destination }) => {
  const { t } = useTranslation();
  const entry = useMemo(() => lookupDestination(destination), [destination]);
  if (!entry || destination.trim().length < 2) return null;
  const hero = entry.hero;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-[#dfe7ec] shadow-soft page-fade">
      {/* Mini hero */}
      <div className="relative h-20 w-full">
        <SmartImage src={hero} alt={destination} wrapperClassName="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-3 gap-2">
          <span className="text-2xl leading-none">{entry.country.split(' ').pop()}</span>
          <div>
            <p className="text-white font-black text-[14px] leading-tight">{entry.country}</p>
            {entry.visa ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#009882]/95 text-[#5c3d0e] rounded-full px-2 py-0.5 mt-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> {t('plannerPage.form.visaRequiredBadge')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#8fce9f]/95 text-[#1d4a2a] rounded-full px-2 py-0.5 mt-0.5">
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

  const visaRaw   = useMemo(() => getVisaStatus(formData.destination), [formData.destination]);
  const visaInfo  = visaRaw.required ? localizeVisa(t, visaRaw) : null;
  const activeTier = BUDGET_TIERS.find(tier => tier.id === formData.budgetStyle);

  const applyTier = (tier) => {
    onChange({ ...formData, budget: tier.budget, budgetStyle: tier.id });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-[#dfe7ec] rounded-2xl p-6 md:p-8 shadow-lift"
    >
      {/* ── Route: From → To ── */}
      <div className="mb-5">
        <label className="text-[11px] font-bold uppercase tracking-widest text-[#697d95] block mb-2">{t('plannerPage.form.route')}</label>
        <div className="flex items-center gap-2">
          <CityAutocomplete
            className="flex-1"
            icon={<Navigation className="w-4 h-4" />}
            label={t('plannerPage.form.fromLabel') || 'From'}
            placeholder={t('plannerPage.form.fromPlaceholder')}
            value={formData.fromCity || ''}
            onChange={(val) => onChange({ ...formData, fromCity: val })}
          />
          <div className="flex flex-col items-center gap-0.5 px-1 shrink-0">
            <div className="w-5 h-px bg-[#bac7d1]" />
            <span className="text-[11px] text-[#697d95] font-black">✈</span>
            <div className="w-5 h-px bg-[#bac7d1]" />
          </div>
          <CityAutocomplete
            className="flex-1"
            icon={<MapPin className="w-4 h-4" />}
            label={t('plannerPage.form.toLabel') || 'To'}
            placeholder={t('planner.form.destPlaceholder')}
            value={formData.destination}
            onChange={set('destination')}
          />
        </div>

        {/* Live destination preview */}
        <DestPreview destination={formData.destination} />

        {/* Route badge */}
        {formData.fromCity && formData.destination && (
          <div className="mt-2 px-3 py-2 bg-[#e8f4fd] border border-[#0172cb]/20 rounded-xl flex items-center gap-2">
            <span className="text-[12px] text-[#0172cb] font-bold">
              ✈️ {formData.fromCity} → {formData.destination}
            </span>
          </div>
        )}
      </div>

      {/* ── Visa Warning (detailed) ── */}
      {visaInfo && (
        <div className="mb-5 flex items-start gap-3 p-4 note-warn rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[#009882] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-black text-warn mb-1">
              ⚠️ {t('plannerPage.form.visaTitle')} {visaInfo.country}
            </p>
            <p className="text-[12px] text-[#8a5c17]/90 leading-snug">{visaInfo.text}</p>
            <p className="text-[11px] text-[#8a5c17]/75 mt-1.5 font-medium">
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
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#697d95] block mb-2">
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
                      ? 'bg-[#252a31] border-[#252a31] text-white shadow-float'
                      : 'bg-white border-[#dfe7ec] text-[#4a5867] hover:border-[#0172cb] hover:text-[#252a31] hover:-translate-y-0.5 hover:shadow-soft'
                  }`}
                >
                  <span className="text-[13px] font-black leading-tight">{t(`plannerPage.form.tiers.${tier.labelKey}`)}</span>
                  <span className={`text-[10px] leading-tight ${active ? 'text-white/70' : 'text-[#697d95]'}`}>
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
            <p className="text-[11px] text-[#0172cb] mt-1 font-medium">
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
              <span className="w-4 h-4 border border-[#252a31]/25 border-t-[#252a31] rounded-full animate-spin" />
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
