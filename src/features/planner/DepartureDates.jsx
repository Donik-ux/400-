import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Wand2 } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import { useCompactPriceFormatter } from '../../components/Price';
import { getWeatherForDates } from '../../services/weatherForecast';
import { compareNearbyDates } from '../../services/tripFlightPricing';
import { pickBestValueIndex } from '../../utils/dateFareCalendar';
import { wmoInfo } from '../../utils/wmoWeatherCodes';

/**
 * Departure-date cards for the AI Trip form — the same strip the Antarctica
 * builder has: six dates from today, each with the fare it would cost, the
 * weather that day at the destination, the saving against flying today, and
 * an "AI pick" on the best weather-for-price date (pickBestValueIndex). A
 * tap writes the date into the form's Start date field; the field still
 * accepts any other date by hand.
 *
 * Fares: the moment the route is known we probe Google Flights for every
 * card (compareNearbyDates, one round trip per date, debounced) and show the
 * live per-person fare. Until then — and wherever the fare feed is
 * unavailable — each card carries an estimate: the flight share of the
 * traveler's budget scaled by a how-far-ahead factor (last-minute costs
 * more, two to three weeks out is the trough), the same shape as the
 * Antarctica calendar. The hint under the label says which one is showing.
 */
const DATE_OFFSETS = [
  { off: 0,  factor: 1.18 },
  { off: 2,  factor: 1.04 },
  { off: 5,  factor: 0.99 },
  { off: 9,  factor: 0.95 },
  { off: 14, factor: 0.90 },
  { off: 21, factor: 0.93 },
];

/* Flight share of the budget by tier — mirrors getBudgetBreakdown in
   aiPlannerService (kept private there); an estimate is all this needs. */
const FLIGHT_SHARE = {
  luxury: 0.18, comfort: 0.20, standard: 0.22, economy: 0.28,
  budget: 0.32, hostel: 0.38, minimalist: 0.42,
};

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const cleanCity = (s) => String(s || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
const round5 = (n) => Math.round(n / 5) * 5;

export default function DepartureDates({ formData, onChange }) {
  const { t, lang } = useTranslation();
  const fmtCompact = useCompactPriceFormatter();

  const options = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return DATE_OFFSETS.map(({ off, factor }) => {
      const d = new Date(now);
      d.setDate(d.getDate() + off);
      return { off, factor, iso: toIso(d), date: d };
    });
  }, []);

  const destination = cleanCity(formData.destination);
  const fromCity    = cleanCity(formData.fromCity);
  const days        = Math.max(1, Number(formData.days) || 5);
  const budget      = Math.max(100, Number(formData.budget) || 0);
  const share       = FLIGHT_SHARE[formData.budgetStyle] || FLIGHT_SHARE.standard;

  /* Live fares, keyed by ISO date; tagged with the route they were priced
     for so a route change can never show the previous route's numbers. */
  const [live, setLive] = useState({ key: '', byIso: {} });
  useEffect(() => {
    if (!fromCity || !destination) return undefined;
    const key = `${fromCity}|${destination}|${days}|${formData.budgetStyle || ''}`;
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      compareNearbyDates({
        fromCity, destination, startDate: options[0].iso, days,
        travelers: 1, style: formData.budgetStyle,
        offsets: options.map((o) => o.off), signal: ctrl.signal,
      })
        .then((rows) => {
          if (cancelled) return;
          const byIso = {};
          (rows || []).forEach((r) => { byIso[r.startDate] = r.perPerson; });
          setLive({ key, byIso });
        })
        .catch(() => { if (!cancelled) setLive({ key, byIso: {} }); });
    }, 800);
    return () => { cancelled = true; ctrl.abort(); clearTimeout(timer); };
  }, [fromCity, destination, days, formData.budgetStyle, options]);
  const liveKey = `${fromCity}|${destination}|${days}|${formData.budgetStyle || ''}`;
  const liveByIso = live.key === liveKey ? live.byIso : {};
  const hasLive = Object.keys(liveByIso).length > 0;

  /* Weather at the destination for each card, tagged the same way. */
  const [weather, setWeather] = useState({ city: '', map: {} });
  useEffect(() => {
    if (!destination) return undefined;
    let cancelled = false;
    getWeatherForDates(destination, options.map((o) => o.iso))
      .then((map) => { if (!cancelled) setWeather({ city: destination, map: map || {} }); })
      .catch(() => { if (!cancelled) setWeather({ city: destination, map: {} }); });
    return () => { cancelled = true; };
  }, [destination, options]);
  const weatherByIso = weather.city === destination ? weather.map : {};

  const fareFor = (o) => {
    const liveFare = liveByIso[o.iso];
    if (Number.isFinite(liveFare)) return Math.round(liveFare);
    return round5(budget * share * o.factor);
  };

  const fares       = options.map(fareFor);
  const todayFare   = fares[0];
  const cheapestIdx = fares.reduce((best, f, i) => (f < fares[best] ? i : best), 0);
  const bestIdx     = useMemo(
    () => pickBestValueIndex(options.map((o, i) => ({ price: fares[i], weather: weatherByIso[o.iso] || null }))),
    // fares is rebuilt every render; its values are what matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, weatherByIso, fares.join(',')],
  );
  const selectedIdx = options.findIndex((o) => o.iso === formData.startDate);

  const fmtDay = (d, opts) => {
    try { return d.toLocaleDateString(lang || 'en', opts); }
    catch { return d.toLocaleDateString('en', opts); }
  };
  /* "In {n} days" needs numeral declension in some languages; dictionaries
     may supply `inDays_<category>` overrides (same scheme as Antarctica). */
  const inDaysLabel = (n) => {
    let cat = 'other';
    try { cat = new Intl.PluralRules(lang || 'en').select(n); } catch { /* keep 'other' */ }
    const catKey = `plannerPage.form.dates.inDays_${cat}`;
    const catVal = t(catKey);
    const tpl = (typeof catVal === 'string' && catVal !== catKey) ? catVal : t('plannerPage.form.dates.inDays');
    return String(tpl).replace('{n}', String(n));
  };

  const pick = (o) => onChange({ ...formData, startDate: o.iso });

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#697d95]">
          <CalendarDays className="w-3.5 h-3.5 text-[#0172cb]" /> {t('plannerPage.form.dates.label')}
        </div>
        <span className="text-[11px] font-bold text-[#697d95]">
          {hasLive ? t('plannerPage.form.dates.hintLive') : t('plannerPage.form.dates.hintEstimate')}
        </span>
      </div>

      {/* pt-2.5 keeps the floating badge (-top-2) inside the scroll box */}
      <div className="flex gap-2 overflow-x-auto pt-2.5 pb-2 -mx-1 px-1 snap-x">
        {options.map((o, i) => {
          const fare = fares[i];
          const saving = todayFare - fare;
          const isSel = i === selectedIdx;
          const w = weatherByIso[o.iso];
          const wmo = w ? wmoInfo(w.code) : null;
          const WeatherIcon = wmo?.icon;
          return (
            <button key={o.iso} type="button" onClick={() => pick(o)}
              className={`relative shrink-0 snap-start w-[136px] rounded-xl border px-3 pt-3 pb-2.5 text-left transition active:scale-[0.98] ${
                isSel
                  ? 'border-[#0172cb] bg-[#e8f4fd] ring-4 ring-[#0172cb]/10 shadow-soft'
                  : 'border-[#dfe7ec] bg-white hover:border-[#0172cb]/50'
              }`}>
              {i === bestIdx ? (
                <span className="absolute -top-2 left-2 bg-[#9fd6e8] text-[#0a1c2c] text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft flex items-center gap-0.5">
                  <Wand2 className="w-2.5 h-2.5" /> {t('plannerPage.form.dates.aiPick')}
                </span>
              ) : i === cheapestIdx && (
                <span className="absolute -top-2 left-2 bg-[#2e7d4f] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-soft">
                  {t('plannerPage.form.dates.bestPrice')}
                </span>
              )}
              <div className="flex items-center justify-between gap-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#0172cb]">
                  {o.off === 0 ? t('plannerPage.form.dates.today') : inDaysLabel(o.off)}
                </div>
                {WeatherIcon && (
                  <div className="flex items-center gap-0.5 text-[#4a5867]" title={wmo.label}>
                    <WeatherIcon className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{Math.round(w.tempMax)}°</span>
                  </div>
                )}
              </div>
              <div className="text-[15px] font-black text-[#252a31] mt-0.5">
                {fmtDay(o.date, { day: 'numeric', month: 'short' })}
                <span className="text-[11px] font-bold text-[#697d95] ml-1">{fmtDay(o.date, { weekday: 'short' })}</span>
              </div>
              <div className="text-[15px] font-black text-[#252a31] mt-1 whitespace-nowrap">{fmtCompact(fare)}</div>
              {saving > 0 && (
                <>
                  <div className="text-[10.5px] font-black text-[#2e7d4f] mt-0.5 whitespace-nowrap">−{fmtCompact(saving)}</div>
                  <div className="text-[9.5px] font-bold text-[#697d95] leading-tight">{t('plannerPage.form.dates.saveVsToday')}</div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Nudge towards the recommended date whenever another one is chosen
          (or the field holds a date outside the strip). */}
      {selectedIdx !== bestIdx && (() => {
        const best = options[bestIdx];
        const recSave = selectedIdx >= 0 ? fares[selectedIdx] - fares[bestIdx] : 0;
        const recDate = fmtDay(best.date, { day: 'numeric', month: 'short' });
        const msg = recSave > 0
          ? t('plannerPage.form.dates.suggestSaving').replace('{date}', recDate).replace('{save}', fmtCompact(recSave))
          : t('plannerPage.form.dates.suggestWeather').replace('{date}', recDate);
        return (
          <button type="button" onClick={() => pick(best)}
            className="mt-1 w-full flex items-center gap-2.5 rounded-xl border border-[#9fd6e8]/60 bg-[#eef7fb] px-3.5 py-2.5 text-left hover:bg-[#e2f1f8] transition">
            <Wand2 className="w-4 h-4 text-[#1f6d94] shrink-0" />
            <span className="text-[12px] font-bold text-[#0b3a52] leading-snug">{msg}</span>
          </button>
        );
      })()}
    </div>
  );
}
