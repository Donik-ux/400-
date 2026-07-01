import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, ArrowRight, Sparkles, Plane } from 'lucide-react';
import SmartImage from './SmartImage';
import { useTranslation } from '../store/useLangStore';
import { detectCurrentLocation } from '../services/geolocation';

/* Curated destination recommendations. */
const RECOMMENDED = [
  { city: 'New York',     country: 'USA',          from: 540, img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80' },
  { city: 'Miami',        country: 'USA',          from: 480, img: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=900&q=80' },
  { city: 'Lauterbrunnen',country: 'Switzerland',  from: 620, img: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=80' },
  { city: 'Paris',        country: 'France',       from: 410, img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80' },
  { city: 'Monaco',       country: 'Monaco',       from: 580, img: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?auto=format&fit=crop&w=900&q=80' },
  { city: 'Dubai',        country: 'UAE',          from: 280, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
];

export default function RecommendedTrips() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [from, setFrom] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [detected, setDetected] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    setLocError('');
    try {
      const loc = await detectCurrentLocation();
      const label = loc.label || loc.city || '';
      if (label) { setFrom(label); setDetected(true); }
      else setLocError(t('tripRec.failed'));
    } catch (e) {
      setLocError(e?.code === 'GEO_DENIED' ? t('tripRec.denied') : t('tripRec.failed'));
    } finally {
      setLocating(false);
    }
  };

  const planTrip = (dest) => {
    const to = `${dest.city}, ${dest.country}`;
    const qs = new URLSearchParams({ to, days: '7', balance: '2000' });
    if (from.trim()) qs.set('from', from.trim());
    navigate(`/trip-plan?${qs.toString()}`, {
      state: {
        item: {
          id: `rec-${dest.city}-${Date.now()}`,
          name: `7-day trip to ${dest.city}`,
          destination: to,
          duration: 7,
          price: 2000,
          category: 'standard',
        },
        type: 'package',
        fromCity: from.trim(),
        purpose: 'Tourism and cultural exploration',
      },
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> {t('tripRec.eyebrow')}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('tripRec.heading')}</h2>
        <p className="text-[14px] text-[#5c5245] font-medium max-w-xl mt-1">{t('tripRec.subtitle')}</p>
      </div>

      {/* From-location control */}
      <div className="bg-white border border-[#e6dcc3] rounded-2xl shadow-soft p-3 md:p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <label className="flex-1 block">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#93876f] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#0071c2]" /> {t('tripRec.fromLabel')}
            </span>
            <input
              value={from}
              onChange={(e) => { setFrom(e.target.value); setDetected(false); setLocError(''); }}
              placeholder={t('tripRec.fromPh')}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e6dcc3] focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15 outline-none text-[14px] font-bold text-[#1a1a1a] bg-white transition placeholder:text-[#a89a7d]"
            />
          </label>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 bg-[#003580] hover:bg-[#0071c2] disabled:opacity-60 text-white font-black text-[13px] rounded-xl py-2.5 px-4 shadow-soft transition active:scale-95 shrink-0">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {locating ? t('tripRec.locating') : t('tripRec.useLocation')}
          </button>
        </div>
        {detected && from && (
          <p className="text-[12px] font-bold text-[#008009] mt-2 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" /> {t('tripRec.detected')}: {from}
          </p>
        )}
        {locError && <p className="text-[12px] font-bold text-amber-700 mt-2">{locError}</p>}
      </div>

      {/* Destination recommendations */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {RECOMMENDED.map((d, i) => (
          <motion.button
            key={d.city}
            onClick={() => planTrip(d)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-soft transition hover:-translate-y-1.5 hover:shadow-lift text-left">
            <SmartImage src={d.img} alt={d.city} wrapperClassName="absolute inset-0" className="group-hover:scale-110 transition-transform duration-[600ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
            <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
              <div className="text-[15px] font-black leading-tight">{d.city}</div>
              <div className="text-[11px] text-white/70 font-semibold mb-2">{d.country}</div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black bg-white/95 text-[#003580] px-2 py-1 rounded-md w-fit group-hover:bg-[#febb02] group-hover:text-[#1a1a1a] transition-colors">
                <Sparkles className="w-3 h-3" /> {t('tripRec.build')} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
