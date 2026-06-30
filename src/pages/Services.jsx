import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, FileCheck, Wallet, CalendarRange, Plane, Hotel, ShieldCheck,
  Wifi, Car, Armchair, Loader2, AlertCircle, ArrowRight, TrendingUp,
  TrendingDown, Minus, Check, MessageCircle,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';
import { whatsappLink } from '../config/contact';
import {
  checkVisa, optimizeBudget, cheapestMonth, predictFlightPrice, predictHotelPrice,
} from '../services/travelServicesService';

/* ── Shared shells ─────────────────────────────────────────────────── */
const Shell = ({ icon: Icon, title, desc, children }) => (
  <div className="bg-white border border-[#e7e7e7] rounded-2xl shadow-soft p-5 md:p-6 lift flex flex-col">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 rounded-xl bg-[#f0f5ff] text-[#0071c2] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-[16px] font-black text-[#1a1a1a] leading-tight">{title}</h3>
        <p className="text-[12px] text-[#9ca3af] font-medium mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = 'text', min }) => (
  <label className="block">
    <span className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af]">{label}</span>
    <input
      type={type} value={value} min={min} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15 outline-none text-[14px] font-bold text-[#1a1a1a] bg-white transition placeholder:text-[#b0b0b0]"
    />
  </label>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af]">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/15 outline-none text-[14px] font-bold text-[#1a1a1a] bg-white transition cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

const RunButton = ({ onClick, loading, disabled, label, loadingLabel }) => (
  <button onClick={onClick} disabled={loading || disabled}
    className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#0071c2] to-[#005fa3] hover:from-[#0079d0] hover:to-[#0071c2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[14px] rounded-xl py-2.5 px-5 shadow-soft hover:shadow-lift transition active:scale-95">
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
    {loading ? loadingLabel : label}
  </button>
);

const ErrorNote = ({ children }) => (
  <div className="flex items-start gap-2 text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{children}</span>
  </div>
);

const TrendBadge = ({ trend }) => {
  const { t } = useTranslation();
  const map = {
    rising:  { icon: TrendingUp,   cls: 'text-red-600 bg-red-50',   label: t('servicesPage.trendRising') },
    falling: { icon: TrendingDown, cls: 'text-green-600 bg-green-50', label: t('servicesPage.trendFalling') },
    stable:  { icon: Minus,        cls: 'text-[#0071c2] bg-[#f0f5ff]', label: t('servicesPage.trendStable') },
  };
  const m = map[trend] || map.stable;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full ${m.cls}`}>
      <m.icon className="w-3.5 h-3.5" /> {m.label}
    </span>
  );
};

/* Wrap an AI call: returns {data, loading, error, run} via hook */
const useAI = (fn) => {
  const { t } = useTranslation();
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const run = async (args) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn(args);
      setState({ data, loading: false, error: null });
    } catch (e) {
      const msg = e?.code === 'AI_UNAVAILABLE' ? t('servicesPage.common.unavailable') : t('servicesPage.common.error');
      setState({ data: null, loading: false, error: msg });
    }
  };
  return { ...state, run };
};

const PriceRange = ({ data, unit }) => (
  <div className="grid grid-cols-3 gap-2 mt-3">
    {[['low', data.low], ['typical', data.typical], ['high', data.high]].map(([k, v]) => (
      <div key={k} className={`rounded-xl p-3 text-center border ${k === 'typical' ? 'bg-[#003580] text-white border-[#003580]' : 'bg-[#f8f9fa] border-[#e7e7e7]'}`}>
        <div className={`text-[9px] font-black uppercase tracking-widest ${k === 'typical' ? 'text-white/60' : 'text-[#9ca3af]'}`}>{k}</div>
        <div className={`text-[18px] font-black leading-tight ${k === 'typical' ? 'text-white' : 'text-[#1a1a1a]'}`}>${Math.round(v)}</div>
        {unit && <div className={`text-[9px] font-bold ${k === 'typical' ? 'text-white/50' : 'text-[#9ca3af]'}`}>{unit}</div>}
      </div>
    ))}
  </div>
);

/* ── 1. Visa Checker ───────────────────────────────────────────────── */
function VisaChecker() {
  const { t, lang } = useTranslation();
  const [nationality, setNationality] = useState('');
  const [destination, setDestination] = useState('');
  const ai = useAI((a) => checkVisa(a));

  const statusMap = {
    visa_free:        { label: t('servicesPage.visa.statusFree'),     cls: 'bg-green-50 text-green-700 border-green-200' },
    visa_on_arrival:  { label: t('servicesPage.visa.statusArrival'),  cls: 'bg-[#f0f5ff] text-[#0071c2] border-[#bcd9ff]' },
    e_visa:           { label: t('servicesPage.visa.statusEvisa'),    cls: 'bg-[#f0f5ff] text-[#0071c2] border-[#bcd9ff]' },
    visa_required:    { label: t('servicesPage.visa.statusRequired'), cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    unknown:          { label: t('servicesPage.visa.statusUnknown'),  cls: 'bg-[#f8f9fa] text-[#595959] border-[#e7e7e7]' },
  };
  const d = ai.data;
  const st = d && (statusMap[d.status] || statusMap.unknown);

  return (
    <Shell icon={FileCheck} title={t('servicesPage.visa.title')} desc={t('servicesPage.visa.desc')}>
      <div className="space-y-2.5">
        <Field label={t('servicesPage.visa.nationality')} value={nationality} onChange={setNationality} placeholder={t('servicesPage.visa.nationalityPh')} />
        <Field label={t('servicesPage.visa.destination')} value={destination} onChange={setDestination} placeholder={t('servicesPage.visa.destinationPh')} />
        <RunButton onClick={() => ai.run({ nationality, destination, lang })} loading={ai.loading}
          disabled={!nationality.trim() || !destination.trim()}
          label={t('servicesPage.common.check')} loadingLabel={t('servicesPage.common.loading')} />
        {ai.error && <ErrorNote>{ai.error}</ErrorNote>}
        {d && (
          <div className="space-y-2.5 pt-1">
            <div className={`inline-flex items-center gap-1.5 text-[12px] font-black px-3 py-1.5 rounded-full border ${st.cls}`}>
              <Check className="w-3.5 h-3.5" /> {st.label}
            </div>
            <p className="text-[13px] font-bold text-[#1a1a1a] leading-snug">{d.summary}</p>
            <div className="grid grid-cols-3 gap-2">
              <Stat label={t('servicesPage.visa.stay')} value={d.stayDuration} />
              <Stat label={t('servicesPage.visa.cost')} value={d.estimatedCost} />
              <Stat label={t('servicesPage.visa.processing')} value={d.processingTime} />
            </div>
            {Array.isArray(d.documents) && d.documents.length > 0 && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">{t('servicesPage.visa.documents')}</div>
                <ul className="space-y-1">
                  {d.documents.map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] font-medium text-[#595959]">
                      <Check className="w-3.5 h-3.5 text-[#0071c2] shrink-0 mt-0.5" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[11px] text-[#9ca3af] italic">{d.disclaimer || t('servicesPage.common.disclaimer')}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

const Stat = ({ label, value }) => (
  <div className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-2.5 text-center">
    <div className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">{label}</div>
    <div className="text-[12px] font-black text-[#1a1a1a] leading-tight mt-0.5">{value || '—'}</div>
  </div>
);

/* ── 2. Budget Optimizer ───────────────────────────────────────────── */
function BudgetOptimizer() {
  const { t, lang } = useTranslation();
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(1);
  const ai = useAI((a) => optimizeBudget(a));
  const d = ai.data;
  const verdictLabel = d && {
    tight: t('servicesPage.budget.verdictTight'),
    comfortable: t('servicesPage.budget.verdictComfortable'),
    generous: t('servicesPage.budget.verdictGenerous'),
  }[d.verdict];

  return (
    <Shell icon={Wallet} title={t('servicesPage.budget.title')} desc={t('servicesPage.budget.desc')}>
      <div className="space-y-2.5">
        <Field label={t('servicesPage.budget.destination')} value={destination} onChange={setDestination} placeholder="Dubai" />
        <div className="grid grid-cols-3 gap-2">
          <Field label={t('servicesPage.budget.budget')} value={budget} onChange={setBudget} type="number" min="100" />
          <Field label={t('servicesPage.budget.days')} value={days} onChange={setDays} type="number" min="1" />
          <Field label={t('servicesPage.budget.travelers')} value={travelers} onChange={setTravelers} type="number" min="1" />
        </div>
        <RunButton onClick={() => ai.run({ destination, budget, days, travelers, lang })} loading={ai.loading}
          disabled={!destination.trim()} label={t('servicesPage.common.optimize')} loadingLabel={t('servicesPage.common.loading')} />
        {ai.error && <ErrorNote>{ai.error}</ErrorNote>}
        {d && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-[#003580]">{verdictLabel}</span>
              {Number.isFinite(d.perDay) && (
                <span className="text-[12px] font-bold text-[#595959]">${Math.round(d.perDay)} / {t('servicesPage.budget.perDay').toLowerCase()}</span>
              )}
            </div>
            {Array.isArray(d.breakdown) && (
              <div className="space-y-1.5">
                {d.breakdown.map((b, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[12px] font-bold mb-0.5">
                      <span className="text-[#1a1a1a]">{b.category}</span>
                      <span className="text-[#595959]">${Math.round(b.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0071c2] to-[#003580]" style={{ width: `${Math.min(100, b.pct || 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(d.tips) && (
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">{t('servicesPage.budget.tips')}</div>
                <ul className="space-y-1">
                  {d.tips.map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] font-medium text-[#595959]">
                      <Sparkles className="w-3.5 h-3.5 text-[#febb02] shrink-0 mt-0.5" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[11px] text-[#9ca3af] italic">{t('servicesPage.common.disclaimer')}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── 3. Cheapest Month ─────────────────────────────────────────────── */
function CheapestMonth() {
  const { t, lang } = useTranslation();
  const [destination, setDestination] = useState('');
  const ai = useAI((a) => cheapestMonth(a));
  const d = ai.data;
  const levelCls = { low: 'bg-green-500', medium: 'bg-[#febb02]', high: 'bg-red-500' };

  return (
    <Shell icon={CalendarRange} title={t('servicesPage.cheapest.title')} desc={t('servicesPage.cheapest.desc')}>
      <div className="space-y-2.5">
        <Field label={t('servicesPage.cheapest.destination')} value={destination} onChange={setDestination} placeholder="Bali" />
        <RunButton onClick={() => ai.run({ destination, lang })} loading={ai.loading} disabled={!destination.trim()}
          label={t('servicesPage.common.analyze')} loadingLabel={t('servicesPage.common.loading')} />
        {ai.error && <ErrorNote>{ai.error}</ErrorNote>}
        {d && (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <Stat label={t('servicesPage.cheapest.cheapest')} value={d.cheapest?.month} />
              <Stat label={t('servicesPage.cheapest.bestValue')} value={d.bestValue?.month} />
              <Stat label={t('servicesPage.cheapest.priciest')} value={d.mostExpensive?.month} />
            </div>
            {Array.isArray(d.months) && (
              <div className="flex items-end gap-1 h-16 pt-1">
                {d.months.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" title={m.level}>
                    <div className={`w-full rounded-t ${levelCls[m.level] || 'bg-[#e7e7e7]'}`}
                      style={{ height: m.level === 'high' ? '100%' : m.level === 'medium' ? '60%' : '30%' }} />
                    <span className="text-[8px] font-bold text-[#9ca3af]">{String(m.month).slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            )}
            {d.summary && <p className="text-[12px] font-medium text-[#595959] leading-snug">{d.summary}</p>}
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── 4. Flight Price Prediction ────────────────────────────────────── */
function FlightPredict() {
  const { t, lang } = useTranslation();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [month, setMonth] = useState('');
  const ai = useAI((a) => predictFlightPrice(a));
  const d = ai.data;

  return (
    <Shell icon={Plane} title={t('servicesPage.flightPredict.title')} desc={t('servicesPage.flightPredict.desc')}>
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('servicesPage.flightPredict.from')} value={from} onChange={setFrom} placeholder="Dubai" />
          <Field label={t('servicesPage.flightPredict.to')} value={to} onChange={setTo} placeholder="Tokyo" />
        </div>
        <Field label={t('servicesPage.flightPredict.month')} value={month} onChange={setMonth} placeholder="October" />
        <RunButton onClick={() => ai.run({ from, to, month, lang })} loading={ai.loading} disabled={!from.trim() || !to.trim()}
          label={t('servicesPage.common.predict')} loadingLabel={t('servicesPage.common.loading')} />
        {ai.error && <ErrorNote>{ai.error}</ErrorNote>}
        {d && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between"><TrendBadge trend={d.trend} /></div>
            <PriceRange data={d} />
            <div className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">{t('servicesPage.flightPredict.window')}</div>
              <div className="text-[13px] font-black text-[#1a1a1a]">{d.bestBookingWindow}</div>
            </div>
            {d.advice && <p className="text-[12px] font-medium text-[#595959] leading-snug">{d.advice}</p>}
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── 5. Hotel Price Prediction ─────────────────────────────────────── */
function HotelPredict() {
  const { t, lang } = useTranslation();
  const [city, setCity] = useState('');
  const [tier, setTier] = useState('mid-range');
  const [month, setMonth] = useState('');
  const ai = useAI((a) => predictHotelPrice(a));
  const d = ai.data;

  return (
    <Shell icon={Hotel} title={t('servicesPage.hotelPredict.title')} desc={t('servicesPage.hotelPredict.desc')}>
      <div className="space-y-2.5">
        <Field label={t('servicesPage.hotelPredict.city')} value={city} onChange={setCity} placeholder="Istanbul" />
        <div className="grid grid-cols-2 gap-2">
          <Select label={t('servicesPage.hotelPredict.tier')} value={tier} onChange={setTier}
            options={[
              { value: 'budget', label: t('servicesPage.hotelPredict.tierBudget') },
              { value: 'mid-range', label: t('servicesPage.hotelPredict.tierMid') },
              { value: 'luxury', label: t('servicesPage.hotelPredict.tierLuxury') },
            ]} />
          <Field label={t('servicesPage.hotelPredict.month')} value={month} onChange={setMonth} placeholder="July" />
        </div>
        <RunButton onClick={() => ai.run({ city, tier, month, lang })} loading={ai.loading} disabled={!city.trim()}
          label={t('servicesPage.common.predict')} loadingLabel={t('servicesPage.common.loading')} />
        {ai.error && <ErrorNote>{ai.error}</ErrorNote>}
        {d && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between"><TrendBadge trend={d.trend} /></div>
            <PriceRange data={d} unit={t('servicesPage.hotelPredict.perNight')} />
            {d.areaTip && <p className="text-[12px] font-medium text-[#595959] leading-snug">📍 {d.areaTip}</p>}
            {d.advice && <p className="text-[12px] font-medium text-[#595959] leading-snug">{d.advice}</p>}
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── Bookable service card (WhatsApp lead-gen) ─────────────────────── */
function BookableCard({ icon: Icon, title, desc, accent, message }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group bg-white border border-[#e7e7e7] rounded-2xl shadow-soft p-5 lift flex flex-col">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[16px] font-black text-[#1a1a1a] leading-tight mb-1">{title}</h3>
      <p className="text-[13px] text-[#595959] font-medium leading-snug mb-4 flex-1">{desc}</p>
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-black text-[13px] rounded-xl py-2.5 px-4 shadow-soft transition active:scale-95">
        <MessageCircle className="w-4 h-4" /> {t('servicesPage.common.requestOnWhatsApp')}
      </a>
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function Services() {
  const { t } = useTranslation();
  useSEO({
    title: t('servicesPage.seoTitle'),
    description: t('servicesPage.seoDesc'),
    keywords: ['travel visa checker', 'esim', 'travel insurance', 'airport transfer', 'lounge pass', 'flight price prediction', 'AI travel'],
  });

  const bookables = [
    { icon: ShieldCheck, accent: 'bg-[#f0fdf4] text-[#008009]', title: t('servicesPage.insurance.title'), desc: t('servicesPage.insurance.desc'), message: 'Hi MAFTRAVEL! I want a travel insurance quote.' },
    { icon: Wifi,        accent: 'bg-[#f0f5ff] text-[#0071c2]', title: t('servicesPage.esim.title'),      desc: t('servicesPage.esim.desc'),      message: 'Hi MAFTRAVEL! I want a travel eSIM.' },
    { icon: Car,         accent: 'bg-[#fff7e6] text-[#b8860b]', title: t('servicesPage.transfer.title'),  desc: t('servicesPage.transfer.desc'),  message: 'Hi MAFTRAVEL! I want to book an airport transfer.' },
    { icon: Armchair,    accent: 'bg-[#fdf2f8] text-[#be185d]', title: t('servicesPage.lounge.title'),    desc: t('servicesPage.lounge.desc'),    message: 'Hi MAFTRAVEL! I want an airport lounge pass.' },
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#002250] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none animate-float"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 80% 70%, #f5b942 0%, transparent 38%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5b942] text-[#002250] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <Sparkles className="w-3.5 h-3.5" /> {t('servicesPage.hero.badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">
            {t('servicesPage.hero.title1')} <span className="text-gradient-gold">{t('servicesPage.hero.title2')}</span>
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/70 font-medium max-w-xl">{t('servicesPage.hero.sub')}</p>
        </div>
      </section>

      {/* AI tools */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 page-fade">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" /> {t('servicesPage.aiSection')}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('servicesPage.aiSectionSub')}</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <VisaChecker />
          <BudgetOptimizer />
          <CheapestMonth />
          <FlightPredict />
          <HotelPredict />
        </div>
      </section>

      {/* Bookable services */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 text-[#febb02] text-[11px] font-black uppercase tracking-widest mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> {t('servicesPage.bookSection')}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('servicesPage.bookSectionSub')}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bookables.map((b, i) => <BookableCard key={i} {...b} />)}
        </div>
      </section>
    </div>
  );
}
