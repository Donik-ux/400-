import React from 'react';
import { PiggyBank, TrendingUp, Calendar, Sparkles, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

/**
 * Friendly advisory shown when the user's travel balance is too small for
 * a comfortable trip. Encourages saving up rather than rushing a stressful
 * underfunded journey.
 *
 * Tiers (USD):
 *   < 200  → "way too low" — strong nudge, prefer staycation
 *   < 500  → "very tight"  — recommend saving up to ~$1000-$1500
 *
 * Returns null at ≥ $500 so the component is safe to render unconditionally.
 */
export default function BudgetAdvisory({ balance, className = '' }) {
  const { t } = useTranslation();
  const b = Math.max(0, Number(balance) || 0);
  if (b >= 500) return null;

  const isTiny = b < 200;
  const target = isTiny ? 1500 : 1200;
  const gap    = target - b;

  // Savings scenarios — months to reach the recommended target
  const scenarios = [
    { perMonth: 50,  label: '$50 / month'  },
    { perMonth: 100, label: '$100 / month' },
    { perMonth: 200, label: '$200 / month' },
  ].map(s => ({ ...s, months: Math.max(1, Math.ceil(gap / s.perMonth)) }));

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-soft ${isTiny ? 'border-red-200 bg-gradient-to-br from-red-50 to-white' : 'border-[#ffe6a8] bg-gradient-to-br from-[#fff7e6] to-white'} ${className}`}>
      <div className={`absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isTiny ? 'bg-red-300/40' : 'bg-[#febb02]/30'}`} />
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isTiny ? 'bg-red-500' : 'bg-gradient-to-b from-[#febb02] to-[#e0a435]'}`} />

      <div className="relative p-4 md:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isTiny ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-[#febb02] to-[#e0a435] text-[#1a1a1a]'}`}>
            {isTiny ? <AlertTriangle className="w-6 h-6" /> : <PiggyBank className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <p className={`text-[14px] md:text-[15px] font-black leading-tight ${isTiny ? 'text-red-900' : 'text-[#7c4a00]'}`}>
              {isTiny
                ? `$${b} — ${t('ui.budget.headlineTiny')}`
                : `$${b} — ${t('ui.budget.headlineTight')}`}
            </p>
            <p className={`text-[12px] md:text-[13px] font-semibold mt-1 leading-snug ${isTiny ? 'text-red-800' : 'text-[#a45e00]'}`}>
              {t('ui.budget.advice')}
            </p>
          </div>
        </div>

        {/* Savings calculator */}
        <div className={`rounded-xl border backdrop-blur-sm ${isTiny ? 'border-red-100 bg-white/90' : 'border-[#febb02]/30 bg-white/85'} p-3 md:p-4 shadow-soft`}>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2.5">
            <TrendingUp className="w-3 h-3 text-[#008009]" />
            {`${t('ui.budget.saveHeader')} $${target}`}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map(s => (
              <div key={s.perMonth} className="rounded-lg bg-[#f8f9fa] border border-[#e7e7e7] p-2.5 text-center transition-premium hover:border-[#003580]/20 hover:bg-white hover:shadow-soft">
                <div className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider">{t('ui.budget.putAside')}</div>
                <div className="text-[13px] font-black text-[#003580] leading-tight my-0.5">{s.label}</div>
                <div className="flex items-center justify-center gap-1 text-[11px] font-black text-[#008009] mt-1">
                  <Calendar className="w-3 h-3" />
                  {s.months} {t('ui.budget.monthsShort')}
                </div>
              </div>
            ))}
          </div>
          <p className={`text-[11px] mt-3 leading-snug ${isTiny ? 'text-red-700' : 'text-[#7c4a00]'} font-semibold flex items-start gap-1.5`}>
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
            {t('ui.budget.tip')}
          </p>
        </div>
      </div>
    </div>
  );
}
