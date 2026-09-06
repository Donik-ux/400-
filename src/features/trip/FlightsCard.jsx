import React, { useState } from 'react';
import { Plane, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { compareNearbyDates } from '../../services/tripFlightPricing';
import { usePriceFormatter } from '../../components/Price';
import { useTranslation } from '../../store/useLangStore';

const fmtDate = (d) => (d
  ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  : '\u2014');

const fill = (str, vars = {}) =>
  String(str || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));

/**
 * The airline mark, whatever shape the fare source hands over: Google Flights
 * returns a logo URL, the other sources return an emoji, and the AI estimate
 * has neither. Printing a URL as text is the one outcome none of them intended.
 */
const AirlineMark = ({ logo }) => {
  if (!logo) return <Plane className="w-3 h-3 text-[#697d95] shrink-0" />;
  if (/^https?:\/\//.test(logo)) {
    return <img src={logo} alt="" width="14" height="14" loading="lazy"
      className="w-3.5 h-3.5 object-contain rounded-sm shrink-0" />;
  }
  return <span className="shrink-0">{logo}</span>;
};

/**
 * The fare a trip plan is costed on — both plan views render this same card,
 * so the AI Trip results and a saved plan never disagree about what the
 * flights cost or which aircraft flies them.
 *
 * @param {object}   flights        the resolved fare (see tripFlightPricing)
 * @param {number}   budgetedFlight what the budget split had set aside, if any
 * @param {object}   query          the same search this fare came from, so the
 *                                  nearby-date check compares like with like
 * @param {Function} onCompare      hand-off to the flight search
 */
export default function FlightsCard({ flights, budgetedFlight, query, onCompare }) {
  const { t } = useTranslation();
  const fmt = usePriceFormatter();

  /* "Would a different day be cheaper?" — each answer costs a real flight
     search, so it runs on the traveller's click and never on load. */
  const [dateProbe, setDateProbe] = useState({ status: 'idle', results: [] });
  const checkNearbyDates = async () => {
    setDateProbe({ status: 'loading', results: [] });
    try {
      const results = await compareNearbyDates(query || {});
      setDateProbe(results.length ? { status: 'done', results } : { status: 'error', results: [] });
    } catch {
      setDateProbe({ status: 'error', results: [] });
    }
  };

  if (!flights) return null;
  const f = flights;
  const legs = [f.outbound, f.inbound].filter(Boolean);

  return (
      <div className="bg-white border border-[#dfe7ec] rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0172cb] flex items-center gap-1">
            <Plane className="w-3.5 h-3.5" /> {t('tripPlan.flights.title')}
          </span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
            f.isLive ? 'text-[#008009] bg-[#eafaea]' : 'text-[#697d95] bg-[#eef2f5]'
          }`}>
            {f.isLive
              ? fill(t('tripPlan.flights.liveBadge'), { source: f.source })
              : t('tripPlan.flights.estimateBadge')}
          </span>
        </div>

        <ul className="space-y-2">
          {legs.map((leg, i) => (
            <li key={i} className="flex items-center gap-3 flex-wrap">
              <span className="text-[13px] font-black text-[#252a31] tabular-nums whitespace-nowrap">
                {leg.from} → {leg.to}
              </span>
              {leg.date && <span className="text-[11px] text-[#697d95] font-bold">{fmtDate(leg.date)}</span>}
              {leg.airline && (
                <span className="text-[11px] text-[#4a5867] font-semibold inline-flex items-center gap-1">
                  <AirlineMark logo={leg.airlineLogo} /> {leg.airline}
                </span>
              )}
              {leg.aircraft && (
                <span className="text-[10px] font-bold text-[#4a5867] bg-[#eef2f5] border border-[#dfe7ec] px-1.5 py-0.5 rounded">
                  {leg.aircraft}
                </span>
              )}
              {leg.duration && <span className="text-[11px] text-[#697d95] font-bold">{leg.duration}</span>}
              {Number.isFinite(leg.stops) && (
                <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-1.5 py-0.5 rounded">
                  {leg.stops === 0
                    ? t('tripPlan.flights.direct')
                    : leg.stops === 1
                      ? t('tripPlan.flights.stopOne')
                      : fill(t('tripPlan.flights.stops'), { count: leg.stops })}
                </span>
              )}
              {leg.departure && (
                <span className="text-[11px] text-[#697d95] font-bold tabular-nums">{leg.departure}{leg.arrival ? `–${leg.arrival}` : ''}</span>
              )}
              {/* A round-trip ticket has one price, shown once in the
                  total row — a per-leg figure here would be invented. */}
              {Number.isFinite(leg.price) && (
                <span className="ml-auto text-[13px] font-black text-[#252a31] whitespace-nowrap">{fmt(leg.price)}</span>
              )}
            </li>
          ))}
        </ul>

        {f.priceLevel && (
          <p className={`mt-2 text-[11px] font-bold ${
            f.priceLevel === 'low' ? 'text-[#008009]' : f.priceLevel === 'high' ? 'text-[#b3402e]' : 'text-[#697d95]'
          }`}>
            {t(`tripPlan.flights.level.${f.priceLevel}`)}
          </p>
        )}

        {/* What else flies this route on these dates. The search already
            returned twenty itineraries and the plan quoted one of them,
            so the choice was there all along — it just was not shown.
            Three rows at most, and only when they answer different
            questions: the fare the plan uses, the cheapest, the quickest. */}
        {Array.isArray(f.options) && f.options.length > 1 && (
          <div className="mt-3 pt-3 border-t border-[#eef2f5]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-2">
              {t('tripPlan.flights.optionsTitle')}
            </p>
            <ul className="space-y-1.5">
              {f.options.map((o, i) => (
                <li key={i}
                  className={`flex items-center gap-2 flex-wrap rounded-lg px-2.5 py-2 border ${
                    o.chosen ? 'border-[#00a58e]/40 bg-[#e6f6f3]' : 'border-[#eef2f5] bg-[#f5f7f9]'
                  }`}>
                  <span className="text-[11.5px] font-black text-[#252a31] inline-flex items-center gap-1">
                    <AirlineMark logo={o.airlineLogo} /> {o.airline}
                  </span>
                  {o.aircraft && (
                    <span className="text-[10px] font-bold text-[#4a5867] bg-white border border-[#dfe7ec] px-1.5 py-0.5 rounded">
                      {o.aircraft}
                    </span>
                  )}
                  {o.duration && (
                    <span className="text-[11px] text-[#697d95] font-bold">{o.duration}</span>
                  )}
                  <span className="text-[10px] font-black text-[#007f6d] bg-[#e6f6f3] px-1.5 py-0.5 rounded">
                    {o.stops === 0
                    ? t('tripPlan.flights.direct')
                    : o.stops === 1
                      ? t('tripPlan.flights.stopOne')
                      : fill(t('tripPlan.flights.stops'), { count: o.stops })}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    o.role === 'chosen' ? 'text-[#007f6d] bg-white' : 'text-[#0172cb] bg-[#e8f4fd]'
                  }`}>
                    {t(`tripPlan.flights.role.${o.role}`)}
                  </span>
                  <span className="ml-auto flex items-baseline gap-1.5 whitespace-nowrap">
                    {o.delta !== 0 && (
                      <span className={`text-[10px] font-black ${o.delta < 0 ? 'text-[#008009]' : 'text-[#8a99ab]'}`}>
                        {o.delta < 0
                          ? fill(t('tripPlan.flights.saves'), { amount: fmt(Math.abs(o.delta)) })
                          : `+${fmt(o.delta)}`}
                      </span>
                    )}
                    <span className="text-[13px] font-black text-[#252a31]">{fmt(o.price)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[10px] text-[#8a99ab] font-semibold">
              {t('tripPlan.flights.optionsNote')}
            </p>
          </div>
        )}

        {/* Shifting the trip a few days is the other lever on the fare.
            Every figure here is a real search for that date rather than
            a weekend rule of thumb applied to the price we already have,
            which is why it waits to be asked for. */}
        {f.roundTripFare && f.isLive && query?.startDate && (
          <div className="mt-3 pt-3 border-t border-[#eef2f5]">
            {dateProbe.status === 'done' ? (() => {
              const best = dateProbe.results.reduce((a, b) => (b.perPerson < a.perPerson ? b : a));
              const saves = f.perPerson - best.perPerson;
              return (
                <>
                  <p className={`text-[11.5px] font-black ${saves > 0 ? 'text-[#008009]' : 'text-[#4a5867]'}`}>
                    {saves > 0
                      ? fill(t('tripPlan.flights.datesCheaper'), {
                          when: fill(t(best.offset < 0 ? 'tripPlan.flights.daysEarlier' : 'tripPlan.flights.daysLater'),
                            { count: Math.abs(best.offset) }),
                          amount: fmt(saves),
                          price: fmt(best.perPerson),
                        })
                      : t('tripPlan.flights.datesBest')}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {dateProbe.results.map((r) => (
                      <li key={r.offset} className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="font-bold text-[#4a5867]">
                          {fill(t(r.offset < 0 ? 'tripPlan.flights.daysEarlier' : 'tripPlan.flights.daysLater'),
                            { count: Math.abs(r.offset) })}
                        </span>
                        <span className="text-[#697d95] font-bold">{fmtDate(r.startDate)}</span>
                        {r.aircraft && <span className="text-[#8a99ab] font-semibold">{r.aircraft}</span>}
                        <span className={`ml-auto font-black ${
                          r.perPerson < f.perPerson ? 'text-[#008009]' : 'text-[#697d95]'
                        }`}>
                          {fmt(r.perPerson)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              );
            })() : (
              <>
                <button onClick={checkNearbyDates} disabled={dateProbe.status === 'loading'}
                  className="px-3 py-2 rounded-lg border border-[#dfe7ec] text-[#0172cb] text-[11px] font-black inline-flex items-center gap-1.5 hover:bg-[#e8f4fd] active:scale-95 transition disabled:opacity-60">
                  {dateProbe.status === 'loading'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Calendar className="w-3.5 h-3.5" />}
                  {dateProbe.status === 'loading'
                    ? t('tripPlan.flights.checkingDates')
                    : t('tripPlan.flights.checkDates')}
                </button>
                {dateProbe.status === 'error' && (
                  <p className="mt-2 text-[11px] font-bold text-[#697d95]">{t('tripPlan.flights.datesFailed')}</p>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#eef2f5] flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#697d95]">
            {fill(t(f.travelers === 1 ? 'tripPlan.flights.totalOne' : 'tripPlan.flights.totalMany'), { count: f.travelers })}
          </span>
          <span className="text-[15px] font-black text-[#252a31]">
            {/* Per-leg rows are per person — spell out the multiplication
                so the total doesn't look like it came from nowhere. */}
            {f.travelers > 1 && (
              <span className="text-[11px] text-[#697d95] font-bold mr-1.5">{fmt(f.perPerson)} × {f.travelers} =</span>
            )}
            {fmt(f.total)}
          </span>
        </div>

        {/* The budget split assumed a cheaper ticket than the route
            actually costs — say so instead of letting the tiles imply
            the trip still fits. */}
        {budgetedFlight > 0
          && f.perPerson > budgetedFlight * 1.25 && (
          <p className="mt-2 p-2 rounded-lg note-danger text-danger text-[11px] font-bold">
            {fill(t('tripPlan.flights.overBudget'), {
              actual: fmt(f.perPerson),
              planned: fmt(budgetedFlight),
            })}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {(f.bookLink || f.outbound?.buyLink) && (
            <a href={f.bookLink || f.outbound.buyLink} target="_blank" rel="noreferrer noopener"
              className="px-3 py-2 rounded-lg bg-[#00a58e] hover:bg-[#008f77] text-white text-[11px] font-black inline-flex items-center gap-1 active:scale-95 transition">
              {t('tripPlan.flights.book')} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button onClick={onCompare}
            className="px-3 py-2 rounded-lg border border-[#dfe7ec] text-[#0172cb] text-[11px] font-black hover:bg-[#e8f4fd] active:scale-95 transition">
            {t('tripPlan.flights.compare')}
          </button>
        </div>

        <p className="mt-2 text-[10px] text-[#8a99ab] font-semibold">
          {f.isLive ? t('tripPlan.flights.liveNote') : t('tripPlan.flights.estimateNote')}
        </p>
      </div>
  );
}
