import React from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import { usePriceFormatter } from '../../components/Price';

const TYPE_CFG = {
  attraction: { emoji: '🏛️' },
  museum:     { emoji: '🖼️' },
  food:       { emoji: '🍽️' },
  hotel:      { emoji: '🏨' },
  transport:  { emoji: '🚖' },
  flight:     { emoji: '✈️' },
  train:      { emoji: '🚆' },
  nature:     { emoji: '🌿' },
  shopping:   { emoji: '🛍️' },
  leisure:    { emoji: '☕' },
  rest:       { emoji: '😴' },
};

const ItineraryCard = ({ dayPlan, index, transportMode = 'walking', navApps = [] }) => {
  const { t } = useTranslation();
  const fmt = usePriceFormatter();
  const hasEvents = Array.isArray(dayPlan.events) && dayPlan.events.length > 0;

  return (
    <div
      className="bg-white border border-[#dfe7ec] rounded-2xl overflow-hidden shadow-soft lift page-fade"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Header */}
      <div className="relative bg-[#1c2127] px-5 py-4 overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, #0172cb 0%, transparent 55%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center shrink-0">
              <span className="text-[15px] font-black text-white">{dayPlan.day}</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{t('planner.results.day')} {dayPlan.day}</p>
              {dayPlan.date && <p className="text-[12px] font-semibold text-white/75">{dayPlan.date}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-black text-white leading-none">{fmt(dayPlan.cost)}</p>
            <p className="text-[9px] text-white/45 uppercase tracking-wider">{t('planner.results.est')} {t('plannerPage.card.estSpend')}</p>
          </div>
        </div>
      </div>

      {/* Place */}
      <div className="flex items-center gap-2 px-5 py-3 bg-[#eef2f5] border-b border-[#e8edf1]">
        <MapPin className="w-3.5 h-3.5 text-[#0172cb] shrink-0" />
        <span className="text-[13px] font-bold text-[#4a5867] truncate">{dayPlan.place}</span>
      </div>

      {/* Events */}
      <div className="divide-y divide-[#eef2f5]">
        {hasEvents ? dayPlan.events.map((ev, i) => {
          const { emoji } = TYPE_CFG[ev.type] || TYPE_CFG.attraction;
          const mapsQuery = ev.address ? encodeURIComponent(ev.address) : null;
          const mapsUrl   = mapsQuery
            ? (transportMode === 'walking'
                ? `https://maps.google.com/?q=${mapsQuery}&mode=walking`
                : `https://maps.google.com/?q=${mapsQuery}`)
            : null;

          return (
            <div key={i} className="px-5 py-3.5 hover:bg-[#eef2f5] transition-premium">
              <div className="flex items-start gap-3">
                {/* Time badge */}
                <div className="shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-[#0172cb] bg-[#e8f4fd] ring-1 ring-[#0172cb]/10 px-2 py-1 rounded-md whitespace-nowrap">
                    {ev.time || '—'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + price */}
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="text-[13px] font-bold text-[#252a31] leading-snug">
                      <span className="mr-1">{emoji}</span>{ev.name}
                    </p>
                    {ev.price && (
                      <span className="text-[11px] font-bold text-[#252a31] shrink-0 whitespace-nowrap">
                        {ev.price}
                      </span>
                    )}
                  </div>

                  {/* Address — prominent */}
                  {ev.address && (
                    <div className="flex items-start gap-1.5 mt-1 bg-[#f0f7ff] border border-[#d6ebfb] rounded-lg px-2 py-1.5">
                      <MapPin className="w-3 h-3 text-[#0172cb] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#252a31] leading-snug font-semibold">{ev.address}</p>
                    </div>
                  )}

                  {/* Duration + Navigate */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {ev.duration && (
                      <span className="flex items-center gap-1 text-[10px] text-[#697d95] font-semibold">
                        <Clock className="w-3 h-3" />{ev.duration}
                      </span>
                    )}
                    {mapsUrl && ev.address && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#0172cb] font-bold hover:text-[#252a31] transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        {transportMode === 'car' ? t('plannerPage.card.navigate') : t('plannerPage.card.directions')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          /* Fallback for morning/afternoon/evening format */
          <div className="px-5 py-4 space-y-3">
            {[
              { label: t('planner.results.morning'),   value: dayPlan.morning   },
              { label: t('planner.results.afternoon'), value: dayPlan.afternoon },
              { label: t('planner.results.evening'),   value: dayPlan.evening   },
            ].filter(s => s.value).map(s => (
              <div key={s.label}>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">{s.label}</p>
                <p className="text-[13px] text-[#4a5867]">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Halal Restaurant */}
      {dayPlan.halalRestaurant && (
        <div className="mx-4 mb-4 mt-2 note-ok rounded-xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-[16px] shrink-0">🥩</span>
            <div className="min-w-0">
              <p className="text-[12px] font-black text-[#24513a]">{dayPlan.halalRestaurant.name}</p>
              <div className="flex items-start gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#2e7d4f] shrink-0 mt-0.5" />
                <p className="text-[11px] text-ok font-medium">{dayPlan.halalRestaurant.address}</p>
              </div>
              {dayPlan.halalRestaurant.avgPrice && (
                <p className="text-[10px] text-[#2e7d4f] mt-0.5 font-bold">{t('plannerPage.card.avg')}: {dayPlan.halalRestaurant.avgPrice}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Car nav apps strip */}
      {transportMode === 'car' && navApps.length > 0 && (
        <div className="border-t border-[#e8edf1] px-4 py-3 bg-[#eef2f5]">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#697d95] mb-2">{t('plannerPage.card.navApps')}</p>
          <div className="flex flex-wrap gap-2">
            {navApps.slice(0, 3).map(app => (
              <span key={app.name} className="flex items-center gap-1 text-[10px] font-bold text-[#4a5867] bg-white border border-[#dfe7ec] px-2 py-1 rounded-lg">
                <span>{app.icon}</span>{app.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryCard;
