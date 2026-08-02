/**
 * Visa reminder for a trip plan.
 *
 * A plan that quietly schedules five days in a country the traveler cannot
 * legally enter is worse than no plan. This surfaces the requirement before
 * the itinerary, in two layers:
 *
 *   1. The curated lookup (destinationLookup.js) answers instantly and offline
 *      — no key, no quota, no waiting.
 *   2. When the traveler's nationality is on file and AI is available, one
 *      cached call refines it: their actual status, cost, processing time and
 *      the documents to gather.
 *
 * The deadline is the point of the whole thing: "apply by 12 August" is a
 * reminder, "a visa is required" is only a fact.
 */
import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, Clock, FileText } from 'lucide-react';
import { getVisaStatus } from '../../services/destinationLookup';
import { checkVisa } from '../../services/travelServicesService';
import { isGrokAvailable } from '../../services/grokClient';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../store/useLangStore';
import { leadTimeDays, DEFAULT_VISA_LEAD_DAYS } from '../../utils/visaTiming';

const fill = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const STATUS_TONE = {
  visa_required: 'danger',
  e_visa: 'warn',
  visa_on_arrival: 'ok',
  visa_free: 'ok',
};

export default function VisaNotice({ destination, travelDate, nationality, lang = 'en' }) {
  const { t } = useTranslation();
  const [ai, setAi] = useState(null);
  // Frozen once per mount: comparing a deadline against a value that changes
  // on every render would make the banner flip state unpredictably.
  const [now] = useState(() => Date.now());

  const base = getVisaStatus(destination);

  useEffect(() => {
    let cancelled = false;
    if (!destination || !nationality || !isGrokAvailable()) return undefined;
    checkVisa({ nationality, destination, lang })
      .then((r) => { if (!cancelled && r?.status) setAi(r); })
      .catch(() => { /* the curated layer already answered */ });
    return () => { cancelled = true; };
  }, [destination, nationality, lang]);

  // Nothing curated and nothing from AI — say nothing rather than guess.
  if (!base.known && !ai) return null;

  const status = ai?.status || (base.required ? 'visa_required' : 'visa_free');
  if (status === 'unknown') return null;

  const needsVisa = status === 'visa_required' || status === 'e_visa';
  const tone = STATUS_TONE[status] || 'warn';

  // Deadline: travel date minus however long the paperwork takes.
  let applyBy = null;
  const lead = leadTimeDays(ai?.processingTime) ?? (needsVisa ? DEFAULT_VISA_LEAD_DAYS : null);
  if (needsVisa && travelDate && lead > 0) {
    const d = new Date(travelDate);
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() - lead);
      // A deadline already in the past is not a reminder, it is bad news —
      // and worth saying plainly.
      applyBy = { date: d, passed: d.getTime() < now };
    }
  }

  const country = base.country || destination;
  const fmtDate = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

  const shell = tone === 'danger'
    ? 'note-danger text-danger'
    : tone === 'warn'
      ? 'note-warn text-warn'
      : 'bg-[#eafaea] border border-[#bfe6bf] text-[#155724]';

  return (
    <div className={`rounded-2xl p-4 flex items-start gap-3 ${shell}`}>
      {needsVisa
        ? <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-black mb-1">
          {fill(t(`tripPlan.visa.title.${status}`), { country })}
        </p>

        {(ai?.summary || base.text) && (
          <p className="text-[12px] font-semibold leading-snug opacity-90">{ai?.summary || base.text}</p>
        )}

        {needsVisa && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-bold">
            {ai?.processingTime && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ai.processingTime}</span>
            )}
            {ai?.estimatedCost && <span>💳 {ai.estimatedCost}</span>}
            {ai?.stayDuration && <span>🗓 {ai.stayDuration}</span>}
          </div>
        )}

        {applyBy && (
          <p className={`mt-2 text-[12px] font-black ${applyBy.passed ? 'underline' : ''}`}>
            {fill(t(applyBy.passed ? 'tripPlan.visa.deadlinePassed' : 'tripPlan.visa.applyBy'), {
              date: fmtDate(applyBy.date),
            })}
          </p>
        )}

        {ai?.documents?.length > 0 && (
          <details className="mt-2">
            <summary className="text-[11.5px] font-black cursor-pointer flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> {t('tripPlan.visa.documents')}
            </summary>
            <ul className="mt-1 ml-4 list-disc space-y-0.5 text-[11.5px] font-semibold opacity-90">
              {ai.documents.slice(0, 8).map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </details>
        )}

        {!nationality && needsVisa && (
          <p className="mt-2 text-[11px] font-semibold opacity-80">{t('tripPlan.visa.addNationality')}</p>
        )}

        {/* Link, not <a href> — a full page reload here would throw away the
            generated plan the traveler is standing on. */}
        <Link to="/services" className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-black underline">
          {t('tripPlan.visa.fullCheck')} <ArrowRight className="w-3 h-3" />
        </Link>

        <p className="mt-1.5 text-[10.5px] font-semibold opacity-70">{t('tripPlan.visa.disclaimer')}</p>
      </div>
    </div>
  );
}
