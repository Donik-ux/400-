import React, { useState } from 'react';
import { Plane, Users, Leaf, ExternalLink, BadgeCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import FlightBookingModal from '../../components/FlightBookingModal';
import { officialUrlFor, airlineMetaOf } from '../../services/airlineLinks';
import { formatFlightDate } from '../../services/flightService';

export default function FlightCard({ flight, index, aiPriced }) {
  const { t }   = useTranslation();
  const [open, setOpen] = useState(false);

  const seatsTight = flight.seats != null && flight.seats <= 5;
  // Prefer the exact buy-link from the price source (Aviasales/Travelpayouts) so
  // the button opens the real page for THIS flight; else the airline deep-link.
  const officialUrl = flight.buyLink || officialUrlFor(flight);
  const meta = airlineMetaOf(flight);
  // Real quote (Kiwi/Travelpayouts/Amadeus) vs in-app estimate → controls the "≈ approx" hint.
  const isRealPrice = flight.source === 'kiwi' || flight.source === 'travelpayouts' || flight.source === 'amadeus';
  const fromCity = (flight.from || '').split('(')[0].trim();
  const toCity   = (flight.to   || '').split('(')[0].trim();
  const sourceLabel = flight.source === 'kiwi' ? 'Kiwi' : flight.source === 'travelpayouts' ? 'Aviasales' : null;
  const bookLabel = meta?.domain ? meta.domain.split('.')[0] : (sourceLabel || flight.airline);
  const nonStop = flight.stops === 0;

  return (
    <>
      <div
        className="group relative bg-white border border-[#ececf0] hover:border-[#0071c2]/45 shadow-soft hover:shadow-lift rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 page-fade"
        style={{ animationDelay: `${(index || 0) * 0.05}s` }}
        onClick={() => setOpen(true)}
      >
        {/* hover accent rail */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0071c2] to-[#003580] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col lg:flex-row">
          {/* ── Left: airline + route ── */}
          <div className="flex-1 p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Airline */}
            {officialUrl ? (
              <a href={officialUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 sm:w-44 shrink-0 rounded-xl -m-1.5 p-1.5 hover:bg-[#f0f5ff] transition-colors group/airline"
                title={`${t('flightsPage.card.bookDirectTitle')} ${meta?.domain || flight.airline}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f3f8ff] to-[#dceaff] border border-[#dceaff] shadow-soft flex items-center justify-center text-2xl shrink-0 group-hover/airline:scale-105 group-hover/airline:shadow-float transition-all duration-300">
                  {meta?.flag || flight.airlineLogo || <Plane className="w-5 h-5 text-[#0071c2] -rotate-45" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate tracking-tight">{flight.airline}</p>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#008009] shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#0071c2] font-bold truncate flex items-center gap-1 group-hover/airline:underline decoration-[#0071c2]/40 underline-offset-2">
                    {meta?.domain || flight.airlineCode} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 sm:w-44 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f3f8ff] to-[#dceaff] border border-[#dceaff] shadow-soft flex items-center justify-center text-2xl shrink-0">
                  {flight.airlineLogo || <Plane className="w-5 h-5 text-[#0071c2] -rotate-45" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate tracking-tight">{flight.airline}</p>
                  <p className="text-[11px] text-[#9ca3af] font-semibold">{flight.airlineCode} · {flight.cabin}</p>
                </div>
              </div>
            )}

            {/* Route */}
            <div className="flex-1 flex items-center gap-3 sm:gap-4 w-full">
              <div className="text-center shrink-0 min-w-[64px]">
                <p className="text-[19px] font-extrabold text-[#1a1a1a] leading-tight tracking-tight">{fromCity}</p>
                {flight.date && <p className="text-[10px] text-[#0071c2] font-bold mt-0.5 uppercase tracking-wide">{formatFlightDate(flight.date)}</p>}
              </div>

              <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0 px-1">
                <div className="w-full flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0071c2] bg-white shrink-0" />
                  <div className={`flex-1 h-[2.5px] rounded-full relative ${nonStop ? 'bg-gradient-to-r from-[#008009] to-[#34d058]' : 'bg-gradient-to-r from-[#f5b942] to-[#ffd76e]'}`}>
                    {!nonStop && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f5b942] border-2 border-white shadow-soft" />
                    )}
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#ececf0] shadow-soft flex items-center justify-center">
                      <Plane className="w-3 h-3 text-[#0071c2] fill-[#0071c2] -rotate-12" />
                    </span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#003580] shrink-0" />
                </div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${nonStop ? 'text-[#008009]' : 'text-[#a45e00]'}`}>
                  {nonStop
                    ? `✓ ${t('flights.results.direct') || 'Non-stop'}`
                    : `${flight.stops} ${flight.stops === 1 ? t('flightsPage.card.stop') : t('flightsPage.card.stops')}`}
                </span>
              </div>

              <div className="text-center shrink-0 min-w-[64px]">
                <p className="text-[19px] font-extrabold text-[#1a1a1a] leading-tight tracking-tight">{toCity}</p>
              </div>
            </div>
          </div>

          {/* ── Right: price + actions (tinted panel) ── */}
          <div className="lg:w-[218px] shrink-0 bg-gradient-to-b from-[#fafbfc] to-[#f4f6f9] border-t lg:border-t-0 lg:border-l border-[#eef1f5] p-5 lg:p-6 flex flex-row lg:flex-col items-center lg:items-stretch justify-between gap-4">
            <div className="text-left lg:text-center">
              <p className="text-[28px] font-extrabold text-gradient leading-none tabular-nums tracking-tight">
                {!isRealPrice && <span className="text-[#9ca3af] text-[20px] font-bold">≈ </span>}${flight.price}
              </p>
              <p className="text-[10.5px] text-[#9ca3af] font-bold mt-1.5">
                {isRealPrice
                  ? (t('flights.results.perPerson') || 'per person')
                  : `${aiPriced ? '🤖 ' : ''}${t('flightsPage.card.approxPrice') || 'approx · per person'}`}
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 w-full max-w-[180px]">
              {officialUrl && (
                <a href={officialUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2.5 rounded-xl bg-[#008009] hover:bg-[#006d07] text-white text-[11px] font-extrabold transition-all active:scale-95 whitespace-nowrap shadow-soft hover:shadow-float flex items-center justify-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5" /> {t('flightsPage.card.bookOn')} {bookLabel}
                </a>
              )}
              <button
                onClick={e => { e.stopPropagation(); setOpen(true); }}
                className="px-3 py-2.5 rounded-xl border-[1.5px] border-[#f5b942] bg-white text-[#a45e00] hover:bg-[#f5b942] hover:text-white hover:border-[#f5b942] text-[11px] font-extrabold transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5 group/cmp">
                {t('flightsPage.card.comparePrices')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cmp:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer tags ── */}
        <div className="px-5 lg:px-6 py-2.5 border-t border-[#f0f1f4] flex items-center gap-2 flex-wrap bg-white">
          {nonStop && (
            <span className="px-2.5 py-1 bg-[#e8f5e9] text-[#008009] text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              {t('flights.results.nonstop') || 'Non-stop'}
            </span>
          )}
          <span className="px-2.5 py-1 bg-[#f0f5ff] text-[#0071c2] text-[10px] font-extrabold rounded-full uppercase tracking-wider">{flight.cabin}</span>
          {flight.eco && (
            <span className="px-2.5 py-1 bg-[#e8f5e9] text-[#008009] text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-2.5 h-2.5" /> {t('flightsPage.card.lowerCo2')}
            </span>
          )}
          {flight.seats != null && (
            <span className={`ml-auto text-[11px] font-bold flex items-center gap-1 ${seatsTight ? 'text-[#d92d20]' : 'text-[#9ca3af]'}`}>
              <Users className="w-3 h-3" />{flight.seats} {seatsTight ? t('flightsPage.card.left') : (t('flights.results.seats') || 'seats')}
            </span>
          )}
        </div>
      </div>

      {open && (
        <FlightBookingModal
          flight={flight}
          date={flight.date || null}
          pax={1}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
