import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Users, Sparkles, Loader2, Plane, Hotel, Utensils, Bus,
  Activity, ShoppingBag, Wallet, Printer, Share2, Save, Download, Clock, Heart,
  Check, Map as MapIcon, AlertCircle, Star, Lightbulb, Phone, ShieldAlert, RefreshCcw,
  Navigation, ExternalLink, ArrowRight,
} from 'lucide-react';
import { mapsUrlFor, mapsUrlFromAddress, dayMapsUrl } from '../utils/mapsUrl';
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import { generateAiItinerary, isAiAvailable } from '../services/aiPlannerService';
import { generateItinerary } from '../services/plannerService';
import { getEmergencyContacts } from '../services/emergencyContacts';
import { handleImgError } from '../utils/imageFallback';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';
import { useTranslation } from '../store/useLangStore';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—';

// Lightweight {placeholder} interpolation on top of the plain t() lookup.
const fill = (str, vars = {}) =>
  String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const STAT_ROWS = [
  { icon: Plane,       statKey: 'flight',        key: 'flight' },
  { icon: Hotel,       statKey: 'accommodation', key: 'accommodation' },
  { icon: Utensils,    statKey: 'food',          key: 'food' },
  { icon: Bus,         statKey: 'transport',     key: 'transport' },
  { icon: Activity,    statKey: 'activities',    key: 'activities' },
  { icon: ShoppingBag, statKey: 'shopping',      key: 'shopping' },
];

export default function TripPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore(s => s.user);
  const addBooking = useAdminStore(s => s.addBooking);

  // 1) Try router state (from in-app navigation).
  // 2) Fall back to URL query (so refresh / shared links still work).
  const stateItem = location.state?.item;
  const stateType = location.state?.type;
  const itemFromUrl = useMemo(() => {
    if (stateItem) return null;
    const destination = (searchParams.get('to') || '').trim();
    if (!destination) return null;
    const duration = Math.max(1, Math.min(21, Number(searchParams.get('days')) || 5));
    const price    = Math.max(100, Number(searchParams.get('balance')) || 1500);
    return {
      id: `url-${Date.now()}`,
      name: `${duration}-day trip to ${destination}`,
      destination,
      duration,
      price,
      category: searchParams.get('style') || 'standard',
      image: heroFor(destination),
      description: `A ${duration}-day AI-built trip plan for ${destination} on a $${price} budget.`,
    };
  }, [stateItem, searchParams]);

  const rawItem = stateItem || itemFromUrl;
  const type    = stateType || (itemFromUrl ? 'package' : null);

  // Always present an item with a usable hero image (direct-mode entries may not provide one).
  const item = useMemo(() => {
    if (!rawItem) return null;
    if (rawItem.image) return rawItem;
    return { ...rawItem, image: heroFor(rawItem.destination || rawItem.name) };
  }, [rawItem]);

  // Keep the alias used by runGenerate effect / callbacks pointing at the same enriched item.
  const itemWithHero = item;

  const fromCityState  = location.state?.fromCity   || searchParams.get('from')   || '';
  const startDateState = location.state?.startDate  || searchParams.get('start')  || '';
  const purposeState   = location.state?.purpose    || searchParams.get('purpose')|| '';

  const [travelers,  setTravelers]  = useState(2);
  const [travelDate, setTravelDate] = useState(startDateState || '');
  const [returnDate, setReturnDate] = useState(location.state?.returnDate || searchParams.get('return') || '');
  const [fromCity,   setFromCity]   = useState(fromCityState || 'Bishkek');
  const [purpose,    setPurpose]    = useState(purposeState || 'Tourism and cultural exploration');
  const [name,       setName]       = useState(user?.name || '');
  const [loading,    setLoading]    = useState(false);
  const [plan,       setPlan]       = useState(null);
  const [error,      setError]      = useState(null);
  const [saved,      setSaved]      = useState(false);

  /* ── Auto-generate the full plan when the user lands here ── */
  useEffect(() => {
    if (!itemWithHero || !type) return;
    runGenerate();
    // Persist core params in URL so refresh works.
    if (!searchParams.get('to') && itemWithHero.destination) {
      const next = new URLSearchParams(searchParams);
      next.set('to',      itemWithHero.destination);
      next.set('days',    String(itemWithHero.duration || 5));
      next.set('balance', String(itemWithHero.price    || 1500));
      if (fromCityState)  next.set('from',  fromCityState);
      if (startDateState) next.set('start', startDateState);
      if (purposeState)   next.set('purpose', purposeState);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runGenerate = async () => {
    if (!itemWithHero || loading) return;       // guard: no item OR already generating
    setLoading(true);
    setError(null);
    try {
      const params = {
        destination: itemWithHero.destination || itemWithHero.name,
        fromCity,
        days:        Number(itemWithHero.duration) || 5,
        budget:      Number(itemWithHero.price)    || 1500,
        style:       itemWithHero.category || itemWithHero.style || 'standard',
        interests:   ['culture','food','sightseeing'],
        transportMode: 'walking',
        startDate:   travelDate,
        purpose,
      };
      let result;
      if (isAiAvailable()) {
        try { result = await generateAiItinerary(params); }
        catch (e) {
          console.warn('Grok plan fallback:', e.message);
          if (/timed out/i.test(e.message)) toast.info(t('tripPlan.aiSlowTitle'), t('tripPlan.aiSlowBody'));
        }
      }
      if (!result) result = await generateItinerary(params);
      // Ensure header & emergency are always populated, even if a stale path skipped them.
      if (!result.emergency)  result.emergency = getEmergencyContacts(itemWithHero.destination || itemWithHero.name);
      if (!result.header) {
        result.header = {
          title:   `Travel Plan – ${itemWithHero.destination || itemWithHero.name}`,
          dates:   travelDate ? new Date(travelDate).toDateString() : `${params.days} days`,
          route:   fromCity ? `${fromCity} → ${itemWithHero.destination || itemWithHero.name} → ${fromCity}` : (itemWithHero.destination || itemWithHero.name),
          purpose,
        };
      }
      setPlan(result);
    } catch (err) {
      setError(t('tripPlan.genericError'));
    } finally {
      setLoading(false);
    }
  };

  /* ── No item passed in → friendly redirect ── */
  if (!item || !type) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#e7e7e7] p-10 max-w-md w-full text-center shadow-float relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#febb02]/15 blur-3xl pointer-events-none animate-float" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#febb02] to-[#e0a435] flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lift">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-[#1a1a1a] mb-1.5">{t('tripPlan.noItemTitle')}</h2>
            <p className="text-[#595959] text-[14px] font-medium mb-6 leading-relaxed">
              {t('tripPlan.noItemSub')}
            </p>
            <button onClick={() => navigate('/hot-tours')}
              className="btn-gold px-6 py-3.5 text-[13px] inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {t('tripPlan.openStudio')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Save plan locally (no payment, just a saved plan) ── */
  const handleSave = () => {
    if (saved) return;
    const b = addBooking({
      userId:    user?.id || 'guest',
      userName:  name || user?.name || 'Guest traveler',
      userEmail: user?.email || '—',
      type:      'plan',
      itemId:    item.id,
      itemName:  `${item.name || item.destination} (${item.duration} days)`,
      date:      travelDate,
      passengers: travelers,
      total:     item.price,
      status:    'saved',
      plan,
    });
    setSaved(true);
    toast.success(t('tripPlan.savedToastTitle'), fill(t('tripPlan.savedToastBody'), { name: b.itemName }));
  };

  /* ── Print friendly view ── */
  const handlePrint = () => {
    toast.info(t('tripPlan.printToastTitle'), t('tripPlan.printToastBody'));
    setTimeout(() => window.print(), 200);
  };

  /* ── Share trip text ── */
  const handleShare = async () => {
    const text = buildShareText({ item, plan, travelDate, travelers });
    if (navigator.share) {
      try { await navigator.share({ title: `MAFTRAVEL · ${item.destination || item.name}`, text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('tripPlan.planCopiedTitle'), t('tripPlan.planCopiedBody'));
    } catch {
      toast.error(t('tripPlan.copyFailTitle'), t('tripPlan.copyFailBody'));
    }
  };

  /* ── Download a single-page HTML the browser can print to PDF ── */
  const handleDownload = () => {
    const html = buildPdfHtml({ item, plan, travelers, travelDate, name });
    const win = window.open('', '_blank');
    if (!win) {
      toast.error(t('tripPlan.popupBlockedTitle'), t('tripPlan.popupBlockedBody'));
      return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const totalNice = Number(item.price).toLocaleString();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#002250] via-[#003580] to-[#0071c2] text-white overflow-hidden">
        <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-[#febb02]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-7">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[12px] font-bold mb-3 transition">
            <ArrowLeft className="w-4 h-4" /> {t('tripPlan.back')}
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#febb02] text-[#1a1a1a] text-[10px] font-black uppercase tracking-widest mb-2.5 shadow-float">
            <Sparkles className="w-3.5 h-3.5" /> {t('tripPlan.freeBadge')}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {item.destination || item.name}
          </h1>
          <p className="text-[13px] text-white/70 font-medium mt-1">
            {fill(t('tripPlan.heroSub'), { total: totalNice })}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 page-fade">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Plan ── */}
          <div className="lg:col-span-2 space-y-5" id="print-plan">

            {/* ── Berlin-style header summary ── */}
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 md:p-6 shadow-soft">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0071c2] mb-1.5">
                <MapIcon className="w-3.5 h-3.5" /> {t('tripPlan.sectionLabel')}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight leading-tight">
                {plan?.header?.title || fill(t('tripPlan.titleFallback'), { destination: item.destination || item.name })}
              </h2>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <HeaderStat icon={<Calendar className="w-3.5 h-3.5" />} label={t('tripPlan.travelDates')}
                  value={plan?.header?.dates || (travelDate ? fmtDate(travelDate) : fill(t('tripPlan.daysValue'), { days: item.duration }))} />
                <HeaderStat icon={<Plane className="w-3.5 h-3.5" />} label={t('tripPlan.route')}
                  value={plan?.header?.route || (fromCity ? `${fromCity} → ${item.destination || item.name} → ${fromCity}` : '—')} />
                <HeaderStat icon={<Sparkles className="w-3.5 h-3.5" />} label={t('tripPlan.purpose')}
                  value={plan?.header?.purpose || purpose} />
              </div>
            </div>

            {/* Hero card */}
            {item.image && (
              <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden shadow-float">
                <SmartImage src={item.image} alt={item.destination || item.name} wrapperClassName="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
                    <MapPin className="w-3 h-3 text-[#febb02]" /> {item.destination}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight">{item.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-[12px] font-bold">
                    {item.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#febb02] text-[#febb02]" /> {item.rating}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fill(t('tripPlan.daysValue'), { days: item.duration })}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur capitalize">{item.category || t('tripPlan.categoryStandard')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description / includes */}
            {(item.description || item.includes?.length) && (
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
                {item.description && <p className="text-[14px] text-[#1a1a1a] font-medium leading-relaxed mb-4">{item.description}</p>}
                {item.includes?.length > 0 && (
                  <>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">{fill(t('tripPlan.whatsCovered'), { total: totalNice })}</div>
                    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {item.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a] font-semibold">
                          <Check className="w-3.5 h-3.5 text-[#008009] mt-0.5 shrink-0" strokeWidth={3} /> {inc}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* ── Hotel card ── */}
            {plan?.hotel && (plan.hotel.name || plan.hotel.address) && (() => {
              const h = plan.hotel;
              const fullAddress = [h.name, h.address].filter(Boolean).join(', ');
              const url = mapsUrlFromAddress(fullAddress || h.name);
              return (
                <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#f0f5ff] flex items-center justify-center text-[#0071c2] shrink-0">
                      <Hotel className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0071c2]">{t('tripPlan.yourStay')}</span>
                        {h.stars && (
                          <span className="text-[10px] font-black text-[#a45e00] bg-[#fff7e6] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            {h.stars}★
                          </span>
                        )}
                        {h.pricePerNight && <span className="text-[10px] font-black text-[#1a1a1a] bg-[#f0f5ff] px-2 py-0.5 rounded-md">{h.pricePerNight}</span>}
                      </div>
                      <div className="text-[16px] font-black text-[#1a1a1a]">{h.name}</div>
                      {h.address && (
                        <a href={url || '#'} target="_blank" rel="noreferrer noopener"
                          className="mt-1 inline-flex items-start gap-1 text-[12px] text-[#0071c2] hover:underline font-semibold">
                          <MapPin className="w-3 h-3 mt-0.5 text-[#febb02]" /> {h.address}{h.area ? ` · ${h.area}` : ''}
                          <ExternalLink className="w-2.5 h-2.5 mt-0.5" />
                        </a>
                      )}
                    </div>
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer noopener"
                        className="px-3 py-2 rounded-lg bg-[#febb02] hover:bg-[#ffb700] text-[#1a1a1a] text-[11px] font-black flex items-center gap-1 active:scale-95 transition shrink-0">
                        <Navigation className="w-3.5 h-3.5" /> {t('tripPlan.navigate')}
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Budget breakdown */}
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-3">
                <Wallet className="w-3.5 h-3.5 text-[#0071c2]" /> {fill(t('tripPlan.whereMoneyGoes'), { total: totalNice })}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                {STAT_ROWS.map((s, i) => {
                  const val = plan?.budgetBreakdown?.[s.key] ?? Math.round(item.price / STAT_ROWS.length);
                  return (
                    <div key={i} className="group bg-gradient-to-b from-white to-[#f8f9fa] border border-[#eef2f6] rounded-xl p-3 text-center transition-all hover:border-[#cfe2f7] hover:shadow-soft">
                      <div className="w-8 h-8 rounded-lg bg-[#f0f5ff] flex items-center justify-center mx-auto mb-1.5 transition-colors group-hover:bg-[#dceaff]">
                        <s.icon className="w-4 h-4 text-[#0071c2]" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-black text-[#9ca3af]">{t(`tripPlan.stat.${s.statKey}`)}</div>
                      <div className="text-[14px] font-black text-[#003580]">${val.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day-by-day plan */}
            <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-black text-[#1a1a1a]">{t('tripPlan.dayByDay')}</h3>
                {plan?.source && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0071c2] bg-[#f0f5ff] px-2 py-1 rounded-md">
                    {plan.source === 'grok' ? t('tripPlan.sourceAi') : t('tripPlan.sourceSmart')}
                  </span>
                )}
              </div>

              {loading && (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0071c2] mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-[#595959]">
                    {isAiAvailable() ? t('tripPlan.buildingAi') : t('tripPlan.buildingSmart')}
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  <button onClick={runGenerate} className="ml-auto text-[12px] font-black underline">{t('tripPlan.retry')}</button>
                </div>
              )}

              {!loading && plan?.days?.length > 0 && (() => {
                const totalDayCosts = plan.days.reduce((s, x) => s + (Number(x.cost) || 0), 0);
                return (
                <div className="space-y-3">
                  {/* Running budget tracker */}
                  <div className="rounded-xl border border-[#e7e7e7] bg-gradient-to-br from-white to-[#f8f9fa] px-4 py-3.5 flex items-center gap-3 flex-wrap shadow-soft">
                    <Wallet className="w-4 h-4 text-[#0071c2] shrink-0" />
                    <div className="text-[12px] font-black uppercase tracking-widest text-[#9ca3af]">{t('tripPlan.spendingPlan')}</div>
                    <div className="flex-1 min-w-32">
                      <div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${totalDayCosts > Number(item.price) ? 'bg-red-500' : 'bg-gradient-to-r from-[#febb02] to-[#f5b942]'}`}
                          style={{ width: `${Math.min(100, (totalDayCosts / Math.max(1, Number(item.price))) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-[12px] font-black text-[#1a1a1a]">
                      ${totalDayCosts.toLocaleString()} <span className="text-[#9ca3af] font-bold">/ ${Number(item.price).toLocaleString()}</span>
                    </div>
                    {totalDayCosts <= Number(item.price) && (
                      <span className="text-[10px] font-black text-[#008009] bg-[#e8f5e9] px-2 py-0.5 rounded">
                        {fill(t('tripPlan.buffer'), { amount: (Number(item.price) - totalDayCosts).toLocaleString() })}
                      </span>
                    )}
                  </div>

                  {plan.days.map((d, dayIdx) => {
                    const dayMap = dayMapsUrl(d);
                    const runningTotal = plan.days.slice(0, dayIdx + 1).reduce((s, x) => s + (Number(x.cost) || 0), 0);
                    return (
                    <motion.div key={d.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className="relative rounded-xl border border-[#e7e7e7] bg-[#f8f9fa] overflow-hidden shadow-soft">
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0071c2] to-[#003580]" />
                      <div className="px-4 py-3 pl-5 bg-white border-b border-[#f0f0f0] flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003580] to-[#0071c2] text-white text-[13px] font-black flex items-center justify-center shrink-0 shadow-soft">D{d.day}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0071c2]">{fill(t('tripPlan.dayLabel'), { day: d.day })}</span>
                            {d.weekday && <span className="text-[10px] font-bold text-[#9ca3af]">· {d.weekday}{d.date ? `, ${d.date.split(',').slice(-1)[0].trim()}` : ''}</span>}
                            {d.label && <span className="text-[10px] font-black text-[#a45e00] bg-[#fff7e6] px-2 py-0.5 rounded-md">{d.label}</span>}
                          </div>
                          <div className="text-[14px] font-black text-[#1a1a1a] mt-0.5">{d.title || `${t('tripPlan.day')} ${d.day}`}</div>
                          <div className="text-[12px] text-[#595959] font-semibold">
                            {d.place || item.destination}{d.cost ? ` · ${fill(t('tripPlan.estCost'), { cost: d.cost })}` : ''}
                          </div>
                        </div>
                        {dayMap && (
                          <a href={dayMap} target="_blank" rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#f0f5ff] hover:bg-[#dceaff] text-[#0071c2] text-[11px] font-black transition"
                            title="Open this day's route in Google Maps">
                            <MapIcon className="w-3.5 h-3.5" /> {t('tripPlan.dayMap')} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {d.transportNote && (
                        <div className="px-4 py-2 bg-[#f0f5ff] border-b border-[#dceaff] flex items-start gap-2 text-[12px] text-[#003580] font-semibold">
                          <Bus className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {d.transportNote}
                        </div>
                      )}

                      {Array.isArray(d.events) && d.events.length > 0 && (
                        <ol className="relative">
                          {d.events.map((ev, j) => {
                            const isLast = j === d.events.length - 1;
                            const mapUrl = mapsUrlFor(ev);
                            return (
                            <li key={j} className="relative">
                              <div className="px-4 py-3 flex items-start gap-3">
                                <div className="w-14 shrink-0 text-[#0071c2] font-black text-[13px] tabular-nums pt-0.5">
                                  {ev.time || '—'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="text-[14px] font-black text-[#1a1a1a] leading-snug">{ev.name}</div>
                                    {ev.type && <span className="px-1.5 py-0.5 rounded bg-[#f0f5ff] text-[#0071c2] text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap">{ev.type}</span>}
                                  </div>

                                  {ev.address && (
                                    <a href={mapUrl || '#'} target="_blank" rel="noreferrer noopener"
                                      className="flex items-start gap-1.5 text-[12px] text-[#1a1a1a] font-semibold hover:text-[#0071c2] leading-snug break-words group/loc"
                                      title="Open in Google Maps">
                                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#febb02]" />
                                      <span className="break-words">
                                        <span className="text-[#9ca3af] font-black uppercase tracking-wider text-[10px] mr-1">{t('tripPlan.location')}</span>
                                        <span className="text-[#0071c2] group-hover/loc:underline">{ev.address}</span>
                                        {ev.district && <span className="text-[#595959]"> · {ev.district}</span>}
                                        <ExternalLink className="inline w-2.5 h-2.5 ml-1 mb-0.5 opacity-50" />
                                      </span>
                                    </a>
                                  )}

                                  <div className="flex items-start gap-1.5 text-[12px] text-[#1a1a1a] font-semibold mt-0.5">
                                    <span className="text-[14px] leading-none mt-0.5">💰</span>
                                    <span>
                                      <span className="text-[#9ca3af] font-black uppercase tracking-wider text-[10px] mr-1">{t('tripPlan.cost')}</span>
                                      <span className={ev.price && /free|0/i.test(ev.price) ? 'text-[#008009] font-black' : 'text-[#003580] font-black'}>
                                        {ev.price || t('tripPlan.free')}
                                      </span>
                                      {ev.duration && <span className="text-[#9ca3af] font-bold ml-2">· {ev.duration}</span>}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Transport hint connecting to next event */}
                              {!isLast && ev.transportToNext && (
                                <div className="ml-12 pl-3 pr-4 py-1.5 border-l-2 border-dashed border-[#dceaff] flex items-center gap-2 text-[11px] text-[#595959] font-semibold">
                                  <Navigation className="w-3 h-3 text-[#0071c2] shrink-0" />
                                  <span className="truncate">{ev.transportToNext}</span>
                                </div>
                              )}
                            </li>
                            );
                          })}
                        </ol>
                      )}

                      {d.halalRestaurant && (() => {
                        const halalUrl = mapsUrlFromAddress(`${d.halalRestaurant.name}, ${d.halalRestaurant.address}`);
                        return (
                          <a href={halalUrl || '#'} target="_blank" rel="noreferrer noopener"
                            className="px-4 py-2.5 bg-[#f0fdf4] border-t border-[#bbf7d0] flex items-start gap-3 hover:bg-[#e0f7e2] transition">
                            <Utensils className="w-4 h-4 text-[#008009] mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px] font-black text-[#155724]">🥩 {d.halalRestaurant.name}</div>
                              <div className="text-[11px] text-[#155724]/85 font-semibold flex items-start gap-1">
                                <MapPin className="w-2.5 h-2.5 mt-0.5 shrink-0" /> {d.halalRestaurant.address} · {d.halalRestaurant.avgPrice}
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#008009] mt-1 shrink-0" />
                          </a>
                        );
                      })()}

                      {/* Daily spend summary */}
                      <div className="px-4 py-2.5 bg-white border-t border-[#e7e7e7] flex items-center justify-between flex-wrap gap-2">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af] flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-[#0071c2]" /> {t('tripPlan.spentToday')}
                        </div>
                        <div className="flex items-center gap-3 text-[12px] font-black">
                          <span className="text-[#1a1a1a]">${(Number(d.cost) || 0).toLocaleString()}</span>
                          <span className="text-[#9ca3af] font-bold">·</span>
                          <span className="text-[#595959]">
                            {t('tripPlan.runningTotal')} <span className="text-[#003580]">${runningTotal.toLocaleString()}</span>
                            <span className="text-[#9ca3af] font-bold"> / ${Number(item.price).toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
                );
              })()}
            </div>

            {/* ── Emergency contacts (per country) ── */}
            {plan?.emergency && (
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-black text-[#1a1a1a]">
                      {fill(t('tripPlan.emergencyTitle'), { country: plan.emergency.country })} {plan.emergency.flag}
                    </h3>
                    <p className="text-[11px] text-[#9ca3af] font-bold uppercase tracking-widest">
                      {t('tripPlan.emergencySub')}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {(plan.emergency.numbers || []).map((n, i) => (
                    <a key={i} href={`tel:${String(n.number).replace(/\s/g, '')}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f9fa] border border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] transition group">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#e7e7e7] flex items-center justify-center text-[18px] shrink-0">
                        {n.icon || '☎️'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-black text-[#9ca3af] uppercase tracking-wider truncate">{n.service}</div>
                        <div className="text-[16px] font-black text-[#003580] tabular-nums">{n.number}</div>
                        {n.note && <div className="text-[10.5px] text-[#595959] font-semibold truncate">{n.note}</div>}
                      </div>
                      <Phone className="w-4 h-4 text-[#9ca3af] group-hover:text-[#0071c2] transition" />
                    </a>
                  ))}
                </div>
                {plan.emergency.tips?.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-[#7c4a00] font-semibold flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      {plan.emergency.tips.map((t, i) => <p key={i}>{t}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Travel tips */}
            {plan?.travelTips?.length > 0 && (
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#febb02]" />
                  <h3 className="text-[16px] font-black text-[#1a1a1a]">{t('tripPlan.localTips')}</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                  {plan.travelTips.map((tip, i) => (
                    <li key={i} className="text-[13px] text-[#1a1a1a] font-semibold flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#febb02] mt-0.5 shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right: Actions ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden sticky top-[80px] shadow-float no-print">

              <div className="relative bg-gradient-to-br from-[#002250] to-[#0071c2] text-white px-5 py-5 overflow-hidden">
                <div className="absolute -top-12 -right-8 w-40 h-40 rounded-full bg-[#febb02]/15 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-0.5">{t('tripPlan.totalTripCost')}</div>
                  <div className="text-[30px] font-black text-gradient-gold leading-none">${totalNice}</div>
                  <div className="text-[11px] font-bold text-white/70 mt-1.5">{fill(t(travelers === 1 ? 'tripPlan.forDaysTravelers' : 'tripPlan.forDaysTravelersPlural'), { days: item.duration, count: travelers })}</div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <Field label={t('tripPlan.yourName')} icon={<Users className="w-3.5 h-3.5" />}>
                  <input type="text" placeholder={t('tripPlan.yourNamePh')} value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#1a1a1a] placeholder:text-[#b0b0b0]" />
                </Field>

                <Field label={t('tripPlan.fromCity')} icon={<Plane className="w-3.5 h-3.5" />}>
                  <input type="text" placeholder={t('tripPlan.fromCityPh')} value={fromCity} onChange={e => setFromCity(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#1a1a1a] placeholder:text-[#b0b0b0]" />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('tripPlan.depart')} icon={<Calendar className="w-3.5 h-3.5" />}>
                    <input type="date" value={travelDate} min={new Date().toISOString().split('T')[0]}
                      onChange={e => {
                        const v = e.target.value;
                        setTravelDate(v);
                        // Slide return date along to keep duration the same
                        if (v && item?.duration) {
                          const d = new Date(v); d.setDate(d.getDate() + Math.max(0, Number(item.duration) - 1));
                          if (!isNaN(d)) setReturnDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#1a1a1a]" />
                  </Field>
                  <Field label={t('tripPlan.return')} icon={<Calendar className="w-3.5 h-3.5" />}>
                    <input type="date" value={returnDate} min={travelDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full bg-transparent outline-none text-[14px] font-semibold text-[#1a1a1a]" />
                  </Field>
                </div>

                <Field label={t('tripPlan.tripPurpose')} icon={<Sparkles className="w-3.5 h-3.5" />}>
                  <select value={purpose} onChange={e => setPurpose(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px] font-semibold text-[#1a1a1a] cursor-pointer">
                    <option value="Tourism and cultural exploration">{t('tripPlan.purposeTourism')}</option>
                    <option value="Family vacation">{t('tripPlan.purposeFamily')}</option>
                    <option value="Honeymoon">{t('tripPlan.purposeHoneymoon')}</option>
                    <option value="Adventure & nature">{t('tripPlan.purposeAdventure')}</option>
                    <option value="Business + leisure">{t('tripPlan.purposeBusiness')}</option>
                    <option value="Religious pilgrimage">{t('tripPlan.purposeReligious')}</option>
                    <option value="Shopping & food">{t('tripPlan.purposeShopping')}</option>
                  </select>
                </Field>

                <Field label={t('tripPlan.travelers')} icon={<Users className="w-3.5 h-3.5" />}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTravelers(t => Math.max(1, t - 1))}
                      className="w-7 h-7 rounded-md bg-[#f0f5ff] text-[#0071c2] text-[16px] font-black hover:bg-[#dceaff] active:scale-95 transition">−</button>
                    <span className="text-[16px] font-black text-[#1a1a1a] w-8 text-center">{travelers}</span>
                    <button type="button" onClick={() => setTravelers(t => Math.min(9, t + 1))}
                      className="w-7 h-7 rounded-md bg-[#f0f5ff] text-[#0071c2] text-[16px] font-black hover:bg-[#dceaff] active:scale-95 transition">+</button>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={handleSave} disabled={saved}
                    className={`px-3 py-3 rounded-xl text-[12px] font-black transition active:scale-95 flex items-center justify-center gap-1.5 ${saved ? 'bg-[#e8f5e9] text-[#008009] cursor-default' : 'btn-gold'}`}>
                    {saved ? (<><Check className="w-4 h-4" /> {t('tripPlan.saved')}</>) : (<><Save className="w-4 h-4" /> {t('tripPlan.savePlan')}</>)}
                  </button>
                  <button onClick={handleShare}
                    className="px-3 py-3 rounded-xl border-2 border-[#0071c2] text-[#0071c2] text-[12px] font-black hover:bg-[#f0f5ff] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Share2 className="w-4 h-4" /> {t('tripPlan.share')}
                  </button>
                  <button onClick={handlePrint}
                    className="px-3 py-3 rounded-xl border-2 border-[#e7e7e7] text-[#1a1a1a] text-[12px] font-black hover:border-[#0071c2] hover:bg-[#f0f5ff] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Printer className="w-4 h-4" /> {t('tripPlan.print')}
                  </button>
                  <button onClick={handleDownload}
                    className="px-3 py-3 rounded-xl border-2 border-[#e7e7e7] text-[#1a1a1a] text-[12px] font-black hover:border-[#0071c2] hover:bg-[#f0f5ff] transition active:scale-95 flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> {t('tripPlan.pdf')}
                  </button>
                </div>

                <button onClick={runGenerate} disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#f0f5ff] hover:bg-[#dceaff] text-[#0071c2] text-[12px] font-black transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50">
                  <Sparkles className="w-3.5 h-3.5" /> {loading ? t('tripPlan.regenerating') : t('tripPlan.regenerate')}
                </button>
              </div>

              <div className="bg-[#f8f9fa] border-t border-[#e7e7e7] px-5 py-3 flex items-start gap-2">
                <Heart className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-semibold text-[#595959] leading-snug">
                  {t('tripPlan.footerNote')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Header stat tile ─────────────────────────────────────── */
const HeaderStat = ({ icon, label, value }) => (
  <div className="bg-[#f8f9fa] border border-[#eef2f6] rounded-xl px-3 py-2.5">
    <div className="flex items-center gap-1 text-[9.5px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">
      <span className="text-[#0071c2]">{icon}</span>{label}
    </div>
    <div className="text-[13px] font-black text-[#1a1a1a] leading-tight">{value || '—'}</div>
  </div>
);

/* ── Small field shell ─────────────────────────────────────── */
const Field = ({ icon, label, children }) => (
  <label className="block bg-white border border-[#e7e7e7] rounded-xl px-3 py-2 focus-within:border-[#0071c2] focus-within:ring-4 focus-within:ring-[#0071c2]/10 transition">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-0.5">
      <span className="text-[#0071c2]">{icon}</span>{label}
    </div>
    {children}
  </label>
);

/* ── Share text builder ─────────────────────────────────────── */
function buildShareText({ item, plan, travelDate, travelers }) {
  const lines = [
    `🌍 MAFTRAVEL trip plan · ${item.destination || item.name}`,
    `Duration: ${item.duration} days  ·  Budget: $${item.price}  ·  Travelers: ${travelers}`,
    travelDate ? `Start date: ${fmtDate(travelDate)}` : null,
    '',
    'Day-by-day:',
    ...(plan?.days || []).slice(0, 12).map(d =>
      `  D${d.day} · ${d.title || d.place || 'Day plan'}${d.cost ? ` (est. $${d.cost})` : ''}`
    ),
    '',
    'Plan built with MAFTRAVEL — https://maftravel.com',
  ];
  return lines.filter(Boolean).join('\n');
}

/* ── Printable HTML — Berlin-style layout ─────────────────── */
function buildPdfHtml({ item, plan, travelers, travelDate, name }) {
  let runningPdfTotal = 0;
  const dayBlocks = (plan?.days || []).map(d => {
    runningPdfTotal += Number(d.cost) || 0;
    return `
    <div class="day">
      <h3>📅 Day ${d.day} – ${escapeHtml(d.weekday || '')}${d.date ? `, ${escapeHtml(d.date)}` : ''}${d.label ? ` <span class="label">${escapeHtml(d.label)}</span>` : ''}</h3>
      <p class="muted">${escapeHtml(d.title || '')}${d.place ? ` · ${escapeHtml(d.place)}` : ''}</p>
      ${d.transportNote ? `<p class="transport">🚌 ${escapeHtml(d.transportNote)}</p>` : ''}
      ${Array.isArray(d.events) ? `<ul>${d.events.map((ev, i, arr) =>
        `<li><strong>${escapeHtml(ev.time || '')}</strong> — ${escapeHtml(ev.name || '')}${
          ev.address ? `<br><span class="addr"><strong>📍 Location:</strong> ${escapeHtml(ev.address)}${ev.district ? ` · ${escapeHtml(ev.district)}` : ''}</span>` : ''
        }<br><span class="cost"><strong>💰 Cost:</strong> ${escapeHtml(ev.price || 'Free')}${ev.duration ? ` · ${escapeHtml(ev.duration)}` : ''}</span>${
          i < arr.length - 1 && ev.transportToNext ? `<br><span class="next">→ ${escapeHtml(ev.transportToNext)}</span>` : ''
        }</li>`
      ).join('')}</ul>` : ''}
      ${d.halalRestaurant ? `<div class="halal">🥩 ${escapeHtml(d.halalRestaurant.name)}<br>📍 ${escapeHtml(d.halalRestaurant.address || '')} · 💰 ${escapeHtml(d.halalRestaurant.avgPrice || '')}</div>` : ''}
      <div class="day-total">💰 Spent today: <strong>$${(Number(d.cost) || 0).toLocaleString()}</strong> · Running: $${runningPdfTotal.toLocaleString()} / $${Number(item.price).toLocaleString()}</div>
    </div>
  `;}).join('');

  const hotelBlock = plan?.hotel && (plan.hotel.name || plan.hotel.address)
    ? `<h2>🏨 Your stay</h2>
       <div class="hotel">
         <strong>${escapeHtml(plan.hotel.name)}</strong>${plan.hotel.stars ? ` · ${escapeHtml(plan.hotel.stars)}★` : ''}${plan.hotel.pricePerNight ? ` · ${escapeHtml(plan.hotel.pricePerNight)}` : ''}<br>
         ${plan.hotel.address ? `📍 ${escapeHtml(plan.hotel.address)}` : ''}${plan.hotel.area ? ` · ${escapeHtml(plan.hotel.area)}` : ''}
       </div>`
    : '';

  const emergency = plan?.emergency
    ? `<h2>🚨 Emergency contacts — ${escapeHtml(plan.emergency.country)} ${escapeHtml(plan.emergency.flag || '')}</h2>
       <ul class="emerg">${(plan.emergency.numbers || []).map(n =>
        `<li><strong>${escapeHtml(n.icon || '☎️')} ${escapeHtml(n.service)}:</strong> ${escapeHtml(n.number)}${n.note ? ` <span class="muted">(${escapeHtml(n.note)})</span>` : ''}</li>`
      ).join('')}</ul>
      ${plan.emergency.tips?.length ? `<p class="muted">${plan.emergency.tips.map(escapeHtml).join(' · ')}</p>` : ''}`
    : '';

  const h = plan?.header || {};
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MAFTRAVEL · ${escapeHtml(item.destination || item.name)}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:32px;max-width:820px;margin:auto;}
    h1{color:#003580;font-size:30px;margin:6px 0 4px} h2{color:#003580;font-size:18px;margin:28px 0 8px;border-bottom:2px solid #e7e7e7;padding-bottom:4px}
    h3{color:#003580;margin:10px 0 2px;font-size:15px} h3 .label{background:#fff7e6;color:#a45e00;padding:2px 6px;border-radius:5px;font-size:11px;margin-left:4px}
    ul{margin:6px 0 14px 18px;padding:0} li{margin-bottom:6px;font-size:12.5px;line-height:1.45}
    .muted{color:#595959;font-size:12px} .badge{background:#febb02;color:#1a1a1a;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;display:inline-block;margin-right:6px}
    .summary{background:#f0f5ff;border-radius:10px;padding:14px;margin:12px 0 20px}
    .summary strong{color:#003580}
    .day{padding:10px 0;border-top:1px solid #f0f0f0}
    .addr{color:#1a1a1a;font-size:12px} .addr strong{color:#003580}
    .cost{color:#1a1a1a;font-size:12px} .cost strong{color:#003580}
    .next{color:#0071c2;font-size:11px;font-style:italic}
    .transport{background:#f0f5ff;border:1px solid #dceaff;padding:6px 10px;border-radius:6px;color:#003580;font-size:12px;margin:0 0 8px 0}
    .hotel{background:#fff7e6;border:1px solid #ffd76e;padding:10px 12px;border-radius:8px;font-size:13px;margin:6px 0 16px}
    .halal{background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 10px;border-radius:6px;font-size:12px;color:#155724;margin-top:6px}
    .day-total{background:#f8f9fa;border:1px solid #e7e7e7;padding:6px 10px;border-radius:6px;font-size:12px;margin-top:8px;text-align:right}
    .emerg li{font-size:13px}
    .footer{margin-top:28px;padding-top:14px;border-top:2px solid #e7e7e7;color:#9ca3af;font-size:11px;text-align:center}
  </style></head><body>
    <span class="badge">MAFTRAVEL · Free Trip Plan</span>
    <h1>${escapeHtml(h.title || `Travel Plan – ${item.destination || item.name}`)}</h1>
    <div class="summary">
      <strong>Travel Dates:</strong> ${escapeHtml(h.dates || (travelDate ? fmtDate(travelDate) : `${item.duration || ''} days`))}<br>
      <strong>Route:</strong> ${escapeHtml(h.route || (item.destination || item.name))}<br>
      <strong>Purpose:</strong> ${escapeHtml(h.purpose || 'Tourism and cultural exploration')}<br>
      <strong>Traveler:</strong> ${escapeHtml(name || 'Guest')} · ${travelers} pax · Total budget $${escapeHtml(String(item.price))}
    </div>
    ${item.includes?.length ? `<h2>What's included</h2><ul>${item.includes.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}
    ${hotelBlock}
    <h2>Day-by-day plan</h2>
    ${dayBlocks || '<p class="muted">No detailed plan generated yet.</p>'}
    ${emergency}
    ${plan?.travelTips?.length ? `<h2>Local tips</h2><ul>${plan.travelTips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    <div class="footer">Built with MAFTRAVEL · https://maftravel.com · We help you plan, not pay.</div>
  </body></html>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
