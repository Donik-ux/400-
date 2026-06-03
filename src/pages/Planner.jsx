import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MapPin, Sparkles, Car, Lightbulb, Plane, Activity, Hotel, ArrowRight,
  CheckCircle2, ShoppingBag, Footprints, Train,
  Download, Clock, UtensilsCrossed, Wallet, Navigation, ChevronDown,
  ChevronUp, ExternalLink, AlertTriangle, Save, Check, Briefcase, Phone, Smartphone
} from 'lucide-react';
import PlannerForm from '../features/planner/PlannerForm';
import ItineraryCard from '../features/planner/ItineraryCard';
import { usePlanner } from '../hooks/usePlanner';
import useStore from '../store/useStore';
import useSavedPlansStore from '../store/useSavedPlansStore';
import { useTranslation } from '../store/useLangStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { destinations } from '../utils/destinationData';
import { findCity } from '../services/cityDatabase';
import { NAV_APPS } from '../services/aiPlannerService';
import { getDestinationHero, getVisaInfo } from '../services/destinationLookup';
import { generatePackingList } from '../services/packingList';
import { getEmergencyContacts } from '../services/emergencyContacts';
import { getLocalApps } from '../services/localApps';
import { getCurrencyInfo, formatLocal } from '../services/currencyByCountry';
import { toast } from '../components/Toast';
import useSEO from '../hooks/useSEO';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80';

const getDestImg = (name = '') => {
  if (!name) return FALLBACK_IMG;
  // 1. Try large destination lookup table (80+ countries/cities)
  const hero = getDestinationHero(name);
  if (hero) return hero;
  // 2. Try city database
  const db = findCity(name);
  if (db?.hero) return db.hero;
  // 3. Try destinationData array
  const lower = name.toLowerCase().trim();
  const match = destinations.find(d => d.city.toLowerCase().includes(lower) || lower.includes(d.city.toLowerCase()));
  return match?.hero || FALLBACK_IMG;
};

const TRANSPORT_MODES = [
  { id: 'walking', icon: Footprints, labelKey: 'walkingLabel', descKey: 'walkingDesc' },
  { id: 'car',     icon: Car,        labelKey: 'carLabel',     descKey: 'carDesc'     },
  { id: 'public',  icon: Train,      labelKey: 'publicLabel',  descKey: 'publicDesc'  },
];

/* ─── PDF Download ─── */
function downloadPDF(destination, days, meta, itineraries, t, extras = {}) {
  const { emergency, packing, localApps, currency } = extras;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>MAFTRAVEL — ${destination} ${days}-Day Plan</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 20px; background: white; }
  h1 { color: #003580; font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #595959; font-size: 14px; margin-bottom: 24px; }
  .badge { background: #e8f4fd; color: #003580; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 24px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 13px; font-weight: bold; color: #003580; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e8f4fd; }
  .budget-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .budget-row span:last-child { font-weight: bold; }
  .day-card { background: #f8f9fa; border: 1px solid #e7e7e7; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
  .day-title { font-size: 15px; font-weight: bold; color: #003580; margin-bottom: 8px; }
  .event { display: flex; gap: 10px; margin-bottom: 6px; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #eee; }
  .event-time { color: #0071c2; font-weight: bold; min-width: 50px; }
  .event-dur { color: #9ca3af; min-width: 60px; }
  .event-name { flex: 1; }
  .event-price { color: #003580; font-weight: bold; }
  .halal { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 10px; margin-top: 8px; font-size: 12px; color: #166534; }
  .places-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .place { background: #f8f9fa; border: 1px solid #e7e7e7; border-radius: 8px; padding: 10px 12px; page-break-inside: avoid; }
  .place-head { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .place-icon { font-size: 15px; }
  .place-name { font-size: 13px; font-weight: bold; color: #1a1a1a; flex: 1; }
  .place-day { font-size: 10px; font-weight: bold; color: #003580; background: #e8f4fd; padding: 2px 7px; border-radius: 10px; white-space: nowrap; }
  .place-addr { font-size: 11px; color: #9ca3af; margin-bottom: 5px; line-height: 1.4; }
  .place-map { font-size: 11px; color: #0071c2; text-decoration: none; font-weight: bold; }
  .tips li { font-size: 13px; margin-bottom: 6px; color: #595959; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e7e7e7; color: #9ca3af; font-size: 11px; text-align: center; }
  @media print { body { padding: 10px; } }
</style></head><body>
<div class="badge">🌍 MAFTRAVEL Planning</div>
<h1>✈️ ${destination} — ${days}-Day Travel Plan</h1>
<p class="subtitle">AI-Generated Travel Itinerary · Total Budget: $${meta?.budgetBreakdown?.total?.toLocaleString() || '—'}</p>

${meta?.budgetBreakdown ? `
<div class="section">
<div class="section-title">💰 ${t('planner.results.budgetBreakdown')}</div>
${[
  ['✈️ ' + t('planner.results.flights'), meta.budgetBreakdown.flight],
  ['🏨 ' + t('planner.results.accommodation'), meta.budgetBreakdown.accommodation],
  ['🥗 ' + t('planner.results.food'), meta.budgetBreakdown.food],
  ['🚌 ' + t('planner.results.transport'), meta.budgetBreakdown.transport],
  ['🎭 ' + t('planner.results.activities'), meta.budgetBreakdown.activities],
  ['🛍️ Shopping', meta.budgetBreakdown.shopping],
].map(([l, v]) => `<div class="budget-row"><span>${l}</span><span>$${v?.toLocaleString() || 0}</span></div>`).join('')}
<div class="budget-row" style="background:#e8f4fd;font-weight:bold;"><span>TOTAL</span><span>$${meta.budgetBreakdown.total?.toLocaleString()}</span></div>
</div>` : ''}

${(() => {
  /* Collect every sightseeing spot from the itinerary, de-duplicated */
  const VISIT_TYPES = ['attraction', 'museum', 'nature', 'landmark', 'viewpoint', 'leisure', 'shopping', 'park', 'market'];
  const TYPE_ICON = { attraction: '📸', museum: '🏛️', nature: '🌿', landmark: '🗿', viewpoint: '🌄', leisure: '🎡', shopping: '🛍️', park: '🌳', market: '🛒' };
  const seen = new Set();
  const places = [];
  itineraries.forEach(day => (day.events || []).forEach(ev => {
    const type = (ev.type || 'attraction').toLowerCase();
    if (!VISIT_TYPES.includes(type)) return;
    const key = (ev.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    places.push({ ...ev, type, day: day.day });
  }));
  if (!places.length) return '';
  const mapLink = (ev) => {
    if (Number.isFinite(ev.lat) && Number.isFinite(ev.lng))
      return `https://www.google.com/maps?q=${ev.lat},${ev.lng}`;
    const q = [ev.name, ev.address].filter(Boolean).join(', ').trim();
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
  };
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
<div class="section">
<div class="section-title">📍 Places to Visit · ${places.length} spots</div>
<div class="places-grid">
${places.map(p => {
  const url = mapLink(p);
  return `<div class="place">
  <div class="place-head">
    <span class="place-icon">${TYPE_ICON[p.type] || '📍'}</span>
    <span class="place-name">${esc(p.name)}</span>
    <span class="place-day">${t('planner.results.day')} ${p.day}</span>
  </div>
  ${p.address ? `<div class="place-addr">📍 ${esc(p.address)}${p.district ? ` · ${esc(p.district)}` : ''}</div>` : ''}
  ${url ? `<a class="place-map" href="${url}">🗺️ Open in Google Maps</a>` : ''}
</div>`;
}).join('')}
</div>
</div>`;
})()}

<div class="section">
<div class="section-title">📅 Day-by-Day Itinerary</div>
${itineraries.map(day => `
<div class="day-card">
<div class="day-title">${t('planner.results.day')} ${day.day}: ${day.title || day.place} — ~$${day.cost}</div>
${(day.events || []).map(ev => `
<div class="event">
  <span class="event-time">${ev.time || ''}</span>
  <span class="event-dur">${ev.duration || ''}</span>
  <span class="event-name"><b>${ev.name}</b> ${ev.address ? `<br><small style="color:#9ca3af">📍 ${ev.address}</small>` : ''}</span>
  <span class="event-price">${ev.price || ''}</span>
</div>
${ev.halalNote ? `<div class="halal">🥩 ${ev.halalNote}</div>` : ''}`).join('')}
${day.halalRestaurant ? `<div class="halal">🥩 <b>Halal Restaurant:</b> ${day.halalRestaurant.name} · ${day.halalRestaurant.address} · ${day.halalRestaurant.avgPrice}</div>` : ''}
</div>`).join('')}
</div>

${packing ? `
<div class="section">
<div class="section-title">🎒 Packing Checklist · ${esc(packing.seasonLabel)}</div>
${packing.categories.map(cat => `
<div class="day-card">
<div class="day-title">${cat.emoji} ${esc(cat.title)}</div>
${cat.items.map(it => `<div class="event" style="padding:4px 0;"><span style="color:#9ca3af;min-width:18px;">☐</span><span class="event-name">${esc(it)}</span></div>`).join('')}
</div>`).join('')}
</div>` : ''}

${localApps ? `
<div class="section">
<div class="section-title">📱 Useful Apps · ${esc(localApps.country)}</div>
${currency ? `<p style="font-size:12px;color:#595959;margin:-2px 0 10px;">💰 Local currency: ${esc(currency.name)} (${esc(currency.code)} ${esc(currency.symbol)}) · 1 USD ≈ ${esc(String(currency.perUsd))} ${esc(currency.code)}</p>` : ''}
${[
  ['🚕 Taxi & transfer',    localApps.taxi],
  ['🗺️ Maps & navigation',  localApps.maps],
  ['🌐 Translators',        localApps.translator],
].map(([label, list]) => `
<div class="day-card">
<div class="day-title">${label}</div>
${list.map(app => `<div class="event" style="padding:4px 0;"><span class="event-name"><b>${esc(app.name)}</b> — <small style="color:#9ca3af">${esc(app.reason)}</small></span></div>`).join('')}
</div>`).join('')}
</div>` : ''}

${emergency ? `
<div class="section">
<div class="section-title">🆘 Emergency Contacts · ${emergency.flag} ${esc(emergency.country)}</div>
${emergency.numbers.map(n => `<div class="budget-row"><span>${n.icon || '📞'} ${esc(n.service)}${n.note ? ` — <small style="color:#9ca3af">${esc(n.note)}</small>` : ''}</span><span>${esc(n.number)}</span></div>`).join('')}
${emergency.tips?.length ? `<p style="font-size:12px;color:#595959;margin-top:10px;">💡 ${emergency.tips.map(esc).join(' · ')}</p>` : ''}
</div>` : ''}

${meta?.travelTips?.length ? `
<div class="section">
<div class="section-title">💡 ${t('planner.results.tips')}</div>
<ul class="tips">${meta.travelTips.map(t => `<li>✓ ${t}</li>`).join('')}</ul>
</div>` : ''}

${meta?.halalFoodGuide ? `
<div class="section">
<div class="section-title">🕌 Halal Food Guide</div>
<p style="font-size:13px;color:#595959;">${meta.halalFoodGuide}</p>
</div>` : ''}

<div class="footer">
Generated by MAFTRAVEL · maftravel.com · All halal restaurants verified 🥩
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const w    = window.open(url, '_blank');
  setTimeout(() => { if (w) { w.print(); } URL.revokeObjectURL(url); }, 800);
}

/* ─── Budget bar ─── */
const BudgetBar = ({ label, amount, total, color, icon: Icon }) => {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#595959]" />
          <span className="text-[13px] text-[#595959]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#1a1a1a]">${amount.toLocaleString()}</span>
          <span className="text-[11px] text-[#9ca3af]">{pct}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#f0f0f0]">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ─── Main Planner ─── */
export default function Planner() {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const resultsRef = useRef(null);
  const printRef   = useRef(null);
  useSEO({
    title: 'AI Travel Planner — Get Your Personalized Itinerary',
    description: 'Use our AI-powered travel planner to generate a custom day-by-day itinerary with budget breakdown, halal restaurants, and local tips for any destination worldwide.',
    keywords: ['AI travel planner', 'trip itinerary generator', 'halal travel planner', 'budget travel planning', 'custom travel plan', 'MAFTRAVEL planner'],
  });

  const [formData, setFormData] = useState({ destination: '', startDate: '', days: 5, budget: 2000 });
  const [transport, setTransport] = useState('walking');
  const [showNavApps, setShowNavApps] = useState(false);
  const [saved, setSaved] = useState(false);
  const [packChecked, setPackChecked] = useState({});

  const location = useLocation();
  const { itineraries, itineraryMeta } = useStore();
  const { getPlan, loading, error }    = usePlanner();
  const savePlan = useSavedPlansStore(s => s.savePlan);

  // Restore a saved plan, or auto-generate one when arriving from an Exotic Tour
  useEffect(() => {
    const restored = location.state?.restoredFormData;
    const autoPlan = location.state?.autoPlanFormData;
    if (restored) {
      setFormData(restored);
      setTransport(restored.transportMode || 'walking');
      setSaved(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } else if (autoPlan) {
      setFormData(autoPlan);
      setTransport(autoPlan.transportMode || 'public');
      setSaved(false);
      setPackChecked({});
      getPlan({ ...autoPlan, transportMode: autoPlan.transportMode || 'public' })
        .then(() => setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    setPackChecked({});
    await getPlan({ ...formData, transportMode: transport });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSavePlan = () => {
    if (saved) return;
    savePlan({ formData: { ...formData, transportMode: transport }, itineraries, meta });
    setSaved(true);
    toast.success(t('plannerPage.results.savedToast'), t('plannerPage.results.savedToastBody'));
  };

  const meta       = itineraryMeta;
  const hasResults = itineraries.length > 0 && meta;

  const packing    = useMemo(() => hasResults ? generatePackingList(formData) : null, [hasResults, formData]);
  const emergency  = useMemo(() => hasResults ? getEmergencyContacts(formData.destination) : null, [hasResults, formData.destination]);
  const localApps  = useMemo(() => hasResults ? getLocalApps(formData.destination) : null, [hasResults, formData.destination]);
  const currency   = useMemo(() => hasResults ? getCurrencyInfo(formData.destination) : null, [hasResults, formData.destination]);
  const planTotal  = meta?.budgetBreakdown?.total || 0;
  const userBudget = Number(formData.budget) || 0;
  const budgetDiff = userBudget - planTotal;

  const budgetRows = meta ? [
    { label: t('plannerPage.budgetRows.flights'),       amount: meta.budgetBreakdown.flight,        icon: Plane,           color: 'bg-blue-400'    },
    { label: `${t('planner.results.accommodation')} (${meta.budgetBreakdown.nights || '—'} ${t('plannerPage.budgetRows.hotelNights')})`, amount: meta.budgetBreakdown.accommodation, icon: Hotel, color: 'bg-indigo-400' },
    { label: t('plannerPage.budgetRows.food'),          amount: meta.budgetBreakdown.food,          icon: UtensilsCrossed, color: 'bg-orange-400'  },
    { label: t('plannerPage.budgetRows.transport'),     amount: meta.budgetBreakdown.transport,     icon: Car,             color: 'bg-green-400'   },
    { label: t('plannerPage.budgetRows.activities'),    amount: meta.budgetBreakdown.activities,    icon: Activity,        color: 'bg-purple-400'  },
    { label: t('plannerPage.budgetRows.shopping'),      amount: meta.budgetBreakdown.shopping,      icon: ShoppingBag,     color: 'bg-pink-400'    },
  ] : [];

  const navApps = meta?.navApps || NAV_APPS[transport] || NAV_APPS.walking;

  return (
    <div className="bg-[#f5f5f5] min-h-screen">

      {/* ── Hero / Form Section ── */}
      <div className="bg-[#003580] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-14">
          <div className="max-w-2xl mb-8 page-fade">
            <div className="inline-flex items-center gap-2 bg-white/[0.12] rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">{t('planner.badge')}</span>
            </div>
            <h1 className="text-[36px] md:text-[52px] font-black leading-tight mb-3">
              {t('planner.title1')}<br />
              <span className="text-white/60">{t('planner.title2')}</span>
            </h1>
            <p className="text-white/55 text-[15px] leading-relaxed">{t('planner.sub')}</p>
          </div>

          {/* Transport mode selector */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">{t('plannerPage.transport.prompt')}</p>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_MODES.map(m => (
                <button key={m.id} onClick={() => setTransport(m.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-premium ${
                    transport === m.id
                      ? 'bg-white text-[#003580] border-white shadow-float -translate-y-0.5'
                      : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white hover:bg-white/5'
                  }`}>
                  <m.icon className="w-4 h-4" /> {t(`plannerPage.transport.${m.labelKey}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick fill */}
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{t('plannerPage.quickFill.title')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🇩🇪 Berlin 10d',    d: { destination: 'Berlin',   startDate: '2026-05-01', days: 10, budget: 2900, budgetStyle: 'economy' } },
                { label: '🇦🇪 Dubai 7d',      d: { destination: 'Dubai',    startDate: '2026-06-01', days: 7,  budget: 2500, budgetStyle: 'comfort' } },
                { label: '🇹🇷 Istanbul 6d',   d: { destination: 'Istanbul', startDate: '2026-06-15', days: 6,  budget: 1500, budgetStyle: 'economy' } },
                { label: '🇺🇸 New York 7d',   d: { destination: 'New York', startDate: '2026-07-01', days: 7,  budget: 3500, budgetStyle: 'comfort' } },
                { label: '🇹🇭 Bangkok 8d',    d: { destination: 'Bangkok',  startDate: '2026-05-15', days: 8,  budget: 1200, budgetStyle: 'budget'  } },
                { label: '🇯🇵 Tokyo 7d',      d: { destination: 'Tokyo',    startDate: '2026-08-01', days: 7,  budget: 2800, budgetStyle: 'economy' } },
                { label: '🇲🇻 Maldives 5d',   d: { destination: 'Maldives', startDate: '2026-09-01', days: 5,  budget: 3000, budgetStyle: 'comfort' } },
                { label: '🇬🇪 Tbilisi 5d',    d: { destination: 'Tbilisi',  startDate: '2026-05-20', days: 5,  budget: 800,  budgetStyle: 'budget'  } },
              ].map(s => (
                <button key={s.label} onClick={() => setFormData(s.d)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/70 text-[12px] hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 transition-premium">
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl">
            <PlannerForm formData={formData} onChange={setFormData} onSubmit={handleSubmit} loading={loading} />
            {error && <p className="mt-3 text-red-300 text-sm bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2.5">{error}</p>}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {hasResults && (
        <div ref={resultsRef} className="max-w-7xl mx-auto px-4 md:px-8 py-8 page-fade">

          {/* Destination hero */}
          <div className="relative h-52 md:h-72 rounded-2xl overflow-hidden mb-6 shadow-lift">
            <img src={getDestImg(formData.destination)} alt={formData.destination} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-white/70" /> {formData.destination}
                </h2>
                {formData.fromCity && (
                  <p className="text-white/80 text-sm mt-0.5 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> {formData.fromCity} → {formData.destination}
                  </p>
                )}
                <p className="text-white/60 text-sm mt-1">{itineraries.length} {t('plannerPage.results.daysWord')} · ${meta.budgetBreakdown.total.toLocaleString()} {t('plannerPage.results.budgetWord')}</p>
              </div>
              {/* Save + PDF Download */}
              <div className="no-print flex items-center gap-2">
                <button
                  onClick={handleSavePlan}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold ${
                    saved
                      ? 'rounded-xl bg-green-500 text-white cursor-default shadow-float transition-premium'
                      : 'btn-gold'
                  }`}>
                  {saved
                    ? <><Check className="w-4 h-4" /> {t('plannerPage.results.saved')}</>
                    : <><Save className="w-4 h-4" /> {t('plannerPage.results.savePlan')}</>}
                </button>
                <button
                  onClick={() => downloadPDF(formData.destination, formData.days, meta, itineraries, t, { emergency, packing, localApps, currency })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#003580] text-[13px] font-bold hover:bg-white/90 transition-premium shadow-float">
                  <Download className="w-4 h-4" /> {t('plannerPage.results.downloadPDF')}
                </button>
              </div>
            </div>
          </div>

          {/* Visa warning in results */}
          {(() => {
            const vi = getVisaInfo(formData.destination);
            return vi ? (
              <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-black text-amber-800 mb-1">
                    ⚠️ {t('plannerPage.results.visaTitle')} {vi.country}
                  </p>
                  <p className="text-[12px] text-amber-700 leading-snug">{vi.text}</p>
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    📌 {t('plannerPage.results.visaNote')}
                  </p>
                </div>
              </div>
            ) : null;
          })()}

          {/* Budget fit check */}
          {userBudget > 0 && (
            <div className={`mb-5 flex items-start gap-3 p-4 rounded-2xl border-2 ${
              budgetDiff >= 0 ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
            }`}>
              {budgetDiff >= 0
                ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-[14px] font-black mb-0.5 ${budgetDiff >= 0 ? 'text-green-800' : 'text-amber-800'}`}>
                  {budgetDiff >= 0
                    ? `✅ ${t('plannerPage.results.budgetFitOk')} $${budgetDiff.toLocaleString()}`
                    : `⚠️ ${t('plannerPage.results.budgetFitOver')} $${Math.abs(budgetDiff).toLocaleString()}`}
                </p>
                <p className={`text-[12px] ${budgetDiff >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
                  {t('plannerPage.results.budgetYours')} ${userBudget.toLocaleString()} · {t('plannerPage.results.budgetPlanCost')} ${planTotal.toLocaleString()}
                  {budgetDiff < 0 && ` — ${t('plannerPage.results.budgetOverHint')}`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            {/* Budget card */}
            <div className="lg:col-span-2 bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">{t('planner.results.budgetBreakdown')}</p>
                  <p className="text-3xl font-black text-gradient">${meta.budgetBreakdown.total.toLocaleString()}</p>
                  <p className="text-[#9ca3af] text-sm">{t('planner.results.totalCost')}</p>
                </div>
                <div className="bg-[#f8f9fa] rounded-xl p-3 text-center border border-[#e7e7e7]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{t('plannerPage.results.stay')}</p>
                  <p className="text-[13px] font-bold text-[#1a1a1a]">{meta.budgetBreakdown.hotelName}</p>
                </div>
              </div>
              <div className="space-y-4">
                {budgetRows.map(r => <BudgetBar key={r.label} {...r} total={meta.budgetBreakdown.total} />)}
              </div>
            </div>

            {/* Info cards */}
            <div className="flex flex-col gap-4">
              {/* Transport */}
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-[#0071c2]" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af]">{t('planner.results.transportSuggestion')}</p>
                </div>
                <p className="text-[13px] text-[#595959] leading-relaxed">{meta.transportSuggestion}</p>

                {/* Nav apps (always show for car) */}
                {(transport === 'car' || navApps?.length > 0) && (
                  <div className="mt-4">
                    <button onClick={() => setShowNavApps(v => !v)}
                      className="flex items-center justify-between w-full text-[12px] font-bold text-[#0071c2] hover:text-[#003580] transition-premium">
                      <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> {t('plannerPage.results.recommendedApps')}</span>
                      {showNavApps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showNavApps && (
                      <div className="mt-3 flex flex-col gap-2">
                        {navApps.map(app => (
                          <div key={app.name} className="flex items-start gap-2.5 p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e7e7e7]">
                            <span className="text-lg">{app.icon}</span>
                            <div>
                              <p className="text-[12px] font-bold text-[#1a1a1a]">{app.name}</p>
                              <p className="text-[11px] text-[#9ca3af]">{app.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Halal food guide */}
              {meta.halalFoodGuide && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🕌</span>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">{t('plannerPage.results.halalGuide')}</p>
                  </div>
                  <p className="text-[13px] text-green-800 leading-relaxed">{meta.halalFoodGuide}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af]">{t('planner.results.tips')}</p>
                </div>
                <ul className="space-y-2.5">
                  {(meta.travelTips || []).map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0071c2] shrink-0 mt-0.5" />
                      <span className="text-[12px] text-[#595959] leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Local apps — taxi, maps, translators that work in this city */}
          {localApps && (
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Smartphone className="w-5 h-5 text-[#0071c2]" />
                <h3 className="text-[16px] font-black text-[#1a1a1a]">{t('plannerPage.apps.title')}</h3>
                <span className="text-[13px] font-bold text-[#595959]">· {localApps.country}</span>
              </div>
              <p className="text-[12px] text-[#9ca3af] mb-4">
                {t('plannerPage.apps.sub')}
              </p>

              {/* Local currency */}
              {currency && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-4 p-3.5 rounded-xl bg-[#f0f5ff] border border-[#0071c2]/15">
                  <span className="text-[13px] font-black text-[#003580]">
                    💰 {t('plannerPage.apps.localCurrency')}: {currency.name} · {currency.code} {currency.symbol}
                  </span>
                  <span className="text-[12px] font-bold text-[#595959]">
                    1 USD ≈ {formatLocal(currency.perUsd)} {currency.code}
                  </span>
                  {userBudget > 0 && (
                    <span className="text-[12px] font-bold text-[#595959]">
                      {t('plannerPage.apps.yourBudget')} ${userBudget.toLocaleString()} ≈ {formatLocal(userBudget * currency.perUsd)} {currency.code}
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'taxi',       label: t('plannerPage.apps.taxi'),       emoji: '🚕', list: localApps.taxi },
                  { key: 'maps',       label: t('plannerPage.apps.maps'),       emoji: '🗺️', list: localApps.maps },
                  { key: 'translator', label: t('plannerPage.apps.translator'), emoji: '🌐', list: localApps.translator },
                ].map(group => (
                  <div key={group.key} className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-4">
                    <p className="text-[13px] font-black text-[#1a1a1a] mb-3">{group.emoji} {group.label}</p>
                    <div className="flex flex-col gap-2">
                      {group.list.map(app => (
                        <a key={app.name} href={app.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-[#e7e7e7] hover:border-[#0071c2]/40 hover:shadow-sm transition-premium">
                          <span className="text-lg shrink-0">{app.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[#1a1a1a]">{app.name}</p>
                            <p className="text-[11px] text-[#9ca3af] leading-snug">{app.reason}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#9ca3af] shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {itineraries.map((dayPlan, idx) => (
              <ItineraryCard
                key={dayPlan.day}
                dayPlan={dayPlan}
                index={idx}
                transportMode={transport}
                navApps={navApps}
              />
            ))}
          </div>

          {/* Packing checklist */}
          {packing && (
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Briefcase className="w-5 h-5 text-[#0071c2]" />
                <h3 className="text-[16px] font-black text-[#1a1a1a]">{t('plannerPage.packing.title')}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0071c2]">{packing.seasonLabel}</span>
              </div>
              <p className="text-[12px] text-[#9ca3af] mb-4">{t('plannerPage.packing.sub')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packing.categories.map(cat => (
                  <div key={cat.title} className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-4">
                    <p className="text-[13px] font-black text-[#1a1a1a] mb-2.5">{cat.emoji} {cat.title}</p>
                    <div className="flex flex-col gap-1.5">
                      {cat.items.map((it, i) => {
                        const key = `${cat.title}-${i}`;
                        const checked = !!packChecked[key];
                        return (
                          <button key={key} onClick={() => setPackChecked(p => ({ ...p, [key]: !p[key] }))}
                            className="flex items-start gap-2 text-left group">
                            <span className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-premium ${
                              checked ? 'bg-[#0071c2] border-[#0071c2]' : 'border-[#c9d1d9] group-hover:border-[#0071c2]'
                            }`}>
                              {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </span>
                            <span className={`text-[12px] leading-snug ${checked ? 'text-[#9ca3af] line-through' : 'text-[#595959]'}`}>{it}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency contacts */}
          {emergency && (
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Phone className="w-5 h-5 text-red-500" />
                <h3 className="text-[16px] font-black text-[#1a1a1a]">{t('plannerPage.emergency.title')}</h3>
                <span className="text-[15px]">{emergency.flag}</span>
                <span className="text-[13px] font-bold text-[#595959]">{emergency.country}</span>
              </div>
              <p className="text-[12px] text-[#9ca3af] mb-4">{t('plannerPage.emergency.sub')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {emergency.numbers.map((n, i) => (
                  <a key={i} href={`tel:${String(n.number).replace(/\s/g, '')}`}
                    className="flex items-center gap-3 p-3 bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl hover:border-red-300 hover:bg-red-50 transition-premium">
                    <span className="text-xl shrink-0">{n.icon || '📞'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black text-[#1a1a1a] truncate">{n.service}</p>
                      {n.note && <p className="text-[11px] text-[#9ca3af] truncate">{n.note}</p>}
                    </div>
                    <span className="text-[14px] font-black text-red-600 shrink-0">{n.number}</span>
                  </a>
                ))}
              </div>
              {emergency.tips?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {emergency.tips.map((tip, i) => (
                    <span key={i} className="text-[11px] text-[#595959] bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">💡 {tip}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Budget summary table */}
          <div className="bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#0071c2]" />
              <p className="text-[13px] font-bold text-[#1a1a1a]">{t('plannerPage.results.estimatedSummary')}</p>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {budgetRows.map(({ label, amount, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#f8f9fa] transition-premium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#595959]" />
                    </div>
                    <span className="text-[14px] text-[#595959]">{label}</span>
                  </div>
                  <span className="text-[14px] font-bold text-[#1a1a1a]">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-[#003580]">
              <span className="text-[14px] font-black text-white uppercase tracking-wider">{t('plannerPage.results.totalBudget')}</span>
              <span className="text-xl font-black text-white">${meta.budgetBreakdown.total.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA Flights */}
          <div className="bg-[#003580] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1">{t('planner.cta.flightBadge')}</p>
              <h3 className="text-xl font-black text-white">{t('planner.cta.flightTitle')}</h3>
              <p className="text-white/55 text-sm">{t('planner.cta.flightSub')}</p>
            </div>
            <button onClick={() => navigate('/flights')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#003580] font-black text-[13px] hover:bg-white/90 transition-premium whitespace-nowrap">
              <Plane className="w-4 h-4" /> {t('planner.cta.flightBtn')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
