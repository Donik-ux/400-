import React, { useState } from 'react';
import {
  MapPin, Calendar, Search, ArrowRightLeft, Users, Briefcase, Plane,
  ChevronDown, RotateCcw, Loader2,
} from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import CityAutocomplete from './CityAutocomplete';

const CABINS = [
  { val: 'Economy',         labelKey: 'economy'        },
  { val: 'Premium Economy', labelKey: 'premiumEconomy' },
  { val: 'Business',        labelKey: 'businessClass'  },
  { val: 'First',           labelKey: 'firstClass'     },
];

export default function FlightSearch({ formData, onChange, onSubmit, loading }) {
  const { t } = useTranslation();
  const [tripType, setTripType] = useState('roundtrip');
  const [pax, setPax]           = useState(1);
  const [cabin, setCabin]       = useState('Economy');
  const [paxOpen, setPaxOpen]   = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const set = (key) => (e) => onChange({ ...formData, [key]: e.target.value });
  const setVal = (key) => (val) => onChange({ ...formData, [key]: val });
  const swap = () => onChange({ ...formData, from: formData.to, to: formData.from });
  const reset = () => onChange({ from: '', to: '', date: '', returnDate: '' });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...e, formData: { ...formData, pax, cabin, tripType } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_30px_80px_-24px_rgba(0,26,61,0.45)] ring-1 ring-white/60 border border-[#dfe7ec] overflow-hidden">
      {/* ── Trip type / pax / cabin row ── */}
      <div className="bg-[#eef2f5] border-b border-[#dfe7ec] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        {/* Trip type tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#dfe7ec] rounded-lg p-0.5">
          {[
            { v: 'roundtrip', l: t('flightsPage.search.roundtrip') },
            { v: 'oneway',    l: t('flightsPage.search.oneway')    },
            { v: 'multi',     l: t('flightsPage.search.multi')     },
          ].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setTripType(v)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-black transition ${
                tripType === v ? 'bg-[#252a31] text-white' : 'text-[#4a5867] hover:bg-[#eef2f5]'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Pax + cabin combined dropdown */}
        <div className="relative" onMouseLeave={() => setPaxOpen(false)}>
          <button type="button" onClick={() => setPaxOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#dfe7ec] bg-white text-[12px] font-bold text-[#252a31] hover:border-[#0172cb] transition">
            <Users className="w-3.5 h-3.5 text-[#0172cb]" />
            {pax} {pax === 1 ? t('flightsPage.search.travelerSingular') : t('flightsPage.search.travelerPlural')}
            <span className="text-[#697d95]">·</span>
            <Briefcase className="w-3.5 h-3.5 text-[#0172cb]" /> {cabin}
            <ChevronDown className={`w-3 h-3 text-[#697d95] transition ${paxOpen ? 'rotate-180' : ''}`} />
          </button>
          {paxOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[#dfe7ec] rounded-2xl shadow-float z-30 p-3 page-fade">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-2">{t('flightsPage.search.travelers')}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-bold text-[#252a31]">{t('flightsPage.search.adults')}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-md border border-[#0172cb] text-[#0172cb] font-black hover:bg-[#e8f4fd] active:scale-95 transition">−</button>
                  <span className="w-6 text-center font-black">{pax}</span>
                  <button type="button" onClick={() => setPax(p => Math.min(9, p + 1))}
                    className="w-7 h-7 rounded-md border border-[#0172cb] text-[#0172cb] font-black hover:bg-[#e8f4fd] active:scale-95 transition">+</button>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-2">{t('flightsPage.search.cabinClass')}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CABINS.map(c => (
                  <button key={c.val} type="button" onClick={() => { setCabin(c.val); setPaxOpen(false); }}
                    className={`px-2.5 py-2 rounded-lg text-[11.5px] font-black transition ${
                      cabin === c.val ? 'bg-[#252a31] text-white' : 'bg-[#eef2f5] text-[#252a31] hover:bg-[#e8f4fd]'
                    }`}>
                    {t(`flightsPage.search.${c.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main inputs ── */}
      <form onSubmit={submit} className="p-3 md:p-4 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-1 items-stretch">
          {/* From */}
          <CityAutocomplete
            className="md:col-span-3"
            icon={<MapPin className="w-4 h-4" />}
            label={t('flights.form.from') || 'From'}
            placeholder="Dubai (DXB)"
            value={formData.from}
            onChange={setVal('from')}
          />

          {/* Swap button — sits between the two fields */}
          <button type="button" onClick={swap}
            className="md:col-span-1 flex items-center justify-center self-center mx-auto md:mx-0 -my-1 md:my-0 w-9 h-9 rounded-full bg-white border border-[#0172cb] text-[#0172cb] hover:bg-[#e8f4fd] hover:rotate-180 active:scale-95 transition-all duration-300 shadow-soft hover:shadow-float"
            aria-label={t('flightsPage.search.swapAria')}
            title={t('flightsPage.search.swapTitle')}>
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* To */}
          <CityAutocomplete
            className="md:col-span-3"
            icon={<MapPin className="w-4 h-4" />}
            label={t('flights.form.to') || 'To'}
            placeholder="Maldives (MLE)"
            value={formData.to}
            onChange={setVal('to')}
          />

          {/* Departure date */}
          <FieldInput
            className="md:col-span-2"
            icon={<Calendar className="w-4 h-4" />}
            label={t('flights.form.date') || 'Departure'}
            type="date"
            min={today}
            value={formData.date}
            onChange={set('date')}
            required
          />

          {/* Return date (only for round-trip) */}
          {tripType === 'roundtrip' ? (
            <FieldInput
              className="md:col-span-2"
              icon={<Calendar className="w-4 h-4" />}
              label={t('flightsPage.search.return')}
              type="date"
              min={formData.date || today}
              value={formData.returnDate || ''}
              onChange={set('returnDate')}
            />
          ) : (
            <div className="md:col-span-2 hidden md:block" />
          )}

          {/* Search button */}
          <button type="submit" disabled={loading || !formData.from || !formData.to}
            className="btn-gold md:col-span-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-[14px] py-3 px-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="md:hidden">{loading ? t('flightsPage.search.searching') : t('flightsPage.search.search')}</span>
          </button>
        </div>

        {/* Quick from/to chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#697d95]">{t('flightsPage.search.popularRoutes')}</span>
          {[
            { from: 'Dubai (DXB)',     to: 'Maldives (MLE)',   label: 'DXB → MLE' },
            { from: 'Dubai (DXB)',     to: 'Bali (DPS)',       label: 'DXB → DPS' },
            { from: 'Abu Dhabi (AUH)', to: 'Seychelles (SEZ)', label: 'AUH → SEZ' },
            { from: 'Istanbul (IST)',  to: 'Mauritius (MRU)',  label: 'IST → MRU' },
            { from: 'Dubai (DXB)',     to: 'Phuket (HKT)',     label: 'DXB → HKT' },
          ].map(r => {
            const active = formData.from === r.from && formData.to === r.to;
            return (
              <button key={r.label} type="button"
                onClick={() => onChange({ ...formData, from: r.from, to: r.to })}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition active:scale-95 ${
                  active ? 'bg-[#252a31] text-white shadow-soft' : 'bg-[#e8f4fd] text-[#0172cb] hover:bg-[#d6ebfb]'
                }`}>
                {r.label}
              </button>
            );
          })}
          {(formData.from || formData.to || formData.date) && (
            <button type="button" onClick={reset}
              className="ml-auto flex items-center gap-1 text-[11px] font-black text-[#697d95] hover:text-danger transition">
              <RotateCcw className="w-3 h-3" /> {t('flightsPage.search.reset')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Light Booking-style input ── */
function FieldInput({ icon, label, placeholder, type = 'text', value, onChange, className = '', listId, min, required }) {
  return (
    <label className={`block bg-white border border-[#dfe7ec] hover:border-[#0172cb] focus-within:border-[#0172cb] focus-within:ring-4 focus-within:ring-[#0172cb]/15 focus-within:shadow-soft rounded-xl px-3 py-2.5 transition ${className}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#697d95] mb-0.5">
        <span className="text-[#0172cb]">{icon}</span>{label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        list={listId}
        min={min}
        required={required}
        className="w-full bg-transparent outline-none text-[14px] font-bold text-[#252a31] placeholder:text-[#94a3af]"
      />
    </label>
  );
}
