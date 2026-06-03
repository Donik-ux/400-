import React, { useEffect, useRef } from 'react';
import { X, MapPin, Calendar, Globe, Users, Plane, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../store/useLangStore';

const DestinationModal = ({ destination, onClose }) => {
  const navigate    = useNavigate();
  const { lang, t } = useTranslation();
  const overlayRef  = useRef(null);
  const panelRef    = useRef(null);

  const desc = destination?.description?.[lang] || destination?.description?.en || '';

  useEffect(() => {
    if (!destination) return;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);

    requestAnimationFrame(() => {
      if (overlayRef.current) overlayRef.current.style.opacity = '1';
      if (panelRef.current)   panelRef.current.style.transform = 'translateY(0)';
    });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [destination, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handlePlan = () => {
    onClose();
    navigate('/planner');
  };

  const handleFlights = () => {
    onClose();
    navigate('/flights');
  };

  if (!destination) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
      style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
    >
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
        <div
          ref={panelRef}
          className="relative w-full md:max-w-3xl max-h-[95vh] md:max-h-[90vh] bg-[#0D0D0D] border border-white/[0.1] ring-1 ring-inset ring-white/[0.03] rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.85)]"
          style={{ transform: 'translateY(100%)', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
        >
          {/* ─── HERO IMAGE ─── */}
          <div className="relative h-64 md:h-72 shrink-0 overflow-hidden">
            <img
              src={destination.hero}
              alt={destination.city}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/30 to-transparent" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white hover:bg-black/70 hover:rotate-90 transition-premium active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-7 pb-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[26px]">{destination.flag}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">{destination.country}</span>
                  </div>
                  <h2 className="text-[38px] md:text-[48px] font-black text-white leading-none tracking-[-0.03em]">
                    {destination.city}
                  </h2>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 mb-0.5">
                    {t('home.flightsFrom')}
                  </div>
                  <div className="text-[26px] font-black text-gradient-gold leading-none">{destination.from}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SCROLLABLE BODY ─── */}
          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-8">

            {/* Description */}
            <p className="text-[14px] text-white/50 leading-[1.75]">{desc}</p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar, label: t('modal.bestTime'),   value: destination.stats.bestTime   },
                { icon: Globe,    label: t('modal.language'),    value: destination.stats.language   },
                { icon: Users,    label: t('modal.population'),  value: destination.stats.population },
                { icon: Clock,    label: t('modal.currency'),    value: destination.stats.currency   },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] hover:border-white/[0.1] transition-premium">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3 h-3 text-[#febb02]/70" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">{label}</span>
                  </div>
                  <div className="text-[12px] font-bold text-white/70 leading-tight">{value}</div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-4">
                {t('modal.highlights')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.highlights.map(({ icon, title, desc: hDesc }) => (
                  <div
                    key={title}
                    className="group flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.14] hover:bg-white/[0.06] transition-premium"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center text-[18px] shrink-0 transition-premium group-hover:scale-110 group-hover:border-[#febb02]/30 group-hover:bg-[#febb02]/[0.08]">
                      {icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-white mb-1">{title}</div>
                      <div className="text-[12px] text-white/40 leading-snug">
                        {hDesc?.[lang] || hDesc?.en}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-4">{t('modal.gallery')}</div>
              <div className="grid grid-cols-3 gap-2.5">
                {destination.gallery.map((url, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={url}
                      alt={`${destination.city} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-premium duration-500"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── FOOTER CTAs ─── */}
          <div className="shrink-0 border-t border-white/[0.06] px-7 py-5 flex gap-3 bg-[#0D0D0D]/95 backdrop-blur-sm">
            <button
              onClick={handlePlan}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-[#0A0A0A] text-[11px] font-black uppercase tracking-[0.14em] hover:bg-white/95 hover:scale-[1.02] hover:-translate-y-0.5 transition-premium active:scale-95 shadow-[0_8px_24px_-6px_rgba(255,255,255,0.25)]"
            >
              <MapPin className="w-3.5 h-3.5" />
              {t('home.planTrip')}
            </button>
            <button
              onClick={handleFlights}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.07] border border-white/[0.1] text-white text-[11px] font-black uppercase tracking-[0.14em] hover:bg-white/[0.12] hover:border-white/[0.2] hover:scale-[1.02] hover:-translate-y-0.5 transition-premium active:scale-95"
            >
              <Plane className="w-3.5 h-3.5" />
              {t('home.searchFlights')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationModal;
