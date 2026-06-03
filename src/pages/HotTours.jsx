import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Sparkles, Wallet, Calendar, MapPin, Wand2, Star, Plane,
  TrendingDown, Hotel, Utensils, Bus, Activity, ShoppingBag, Check,
  ArrowRight, Tag, BadgePercent, Heart, Globe2, RefreshCcw, Cpu, Zap, ChevronRight,
  Clock, Loader2,
} from 'lucide-react';
import useAdminStore from '../store/useAdminStore';
import useWishlistStore from '../store/useWishlistStore';
import useAuthStore from '../store/useAuthStore';
import { useTranslation } from '../store/useLangStore';
import { generateAiPackages, isAiAvailable, tierLabel, tierOf, sanitizeVibe } from '../services/aiPackageService';
import { generateAiItinerary } from '../services/aiPlannerService';
import { generateItinerary } from '../services/plannerService';
import { handleImgError } from '../utils/imageFallback';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import useSEO from '../hooks/useSEO';
import { useDateDaysSync } from '../hooks/useDateDaysSync';
import BudgetAdvisory from '../components/BudgetAdvisory';

const PREFS_KEY = 'maf_ai_prefs';
const loadPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; } };
const savePrefs = (p) => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {} };

/* ── Static dressing for the Hot Deals section (admin-seeded) ────── */
const buildHotDeals = (packages) => {
  const discounts = [42, 35, 30, 28, 25, 22];
  return packages.slice(0, 6).map((p, i) => {
    const discount = discounts[i] || 20;
    const originalPrice = Math.round(p.price / (1 - discount / 100));
    return { ...p, discount, originalPrice, seatsLeft: 3 + ((i * 7) % 9), hoursLeft: 6 + ((i * 11) % 42) };
  });
};

const STYLE_BADGE = {
  economy:  { label: 'Economy',  cls: 'bg-[#e8f5e9] text-[#008009]' },
  standard: { label: 'Standard', cls: 'bg-[#f0f5ff] text-[#0071c2]' },
  comfort:  { label: 'Comfort',  cls: 'bg-[#fff7e6] text-[#a45e00]' },
  luxury:   { label: 'Luxury',   cls: 'bg-[#fdf2ff] text-[#a020c4]' },
};

/* ── Page ─────────────────────────────────────────────────────────── */
const HotTours = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const packages = useAdminStore(s => s.packages);
  const user = useAuthStore(s => s.user);
  const toggleWishlist = useWishlistStore(s => s.toggleWishlist);
  const isInWishlist   = useWishlistStore(s => s.isInWishlist);

  useSEO({
    title: 'AI Trip Studio · Custom Tours on Your Balance | MAFTRAVEL',
    description: 'Type in your balance, AI builds 4 complete tour packages that fit inside it — destinations, prices, day-by-day plans. Plus last-minute hot deals.',
    url: 'https://maftravel.com/hot-tours',
    keywords: ['AI trip planner','custom tour packages','budget travel','last minute deals','MAFTRAVEL'],
  });

  const hotDeals = useMemo(() => buildHotDeals(packages), [packages]);

  // Read query params to support deep-links from Home AI tab;
  // fall back to last-used preferences from localStorage; then to sensible defaults.
  const saved = loadPrefs();
  const initialBalance = Number(searchParams.get('balance')) || Number(saved.balance) || 2000;
  const initialDays    = Math.max(1, Math.min(21, Number(searchParams.get('days')) || Number(saved.days) || 7));
  const initialVibe    = sanitizeVibe(searchParams.get('vibe') || saved.vibe);
  const initialDest    = searchParams.get('to') || saved.destination || '';
  const initialFrom    = searchParams.get('from') || saved.fromCity || 'Bishkek';
  const initialStart   = searchParams.get('start') || '';

  // ── AI Studio state ──
  const [balance, setBalance] = useState(initialBalance);
  const [days,    setDays]    = useState(initialDays);
  const [vibe,    setVibe]    = useState(initialVibe);
  const [from,    setFrom]    = useState(initialFrom);
  const [destInput, setDestInput] = useState(initialDest);
  const [startDate, setStartDate] = useState(initialStart);
  const [returnDate, setReturnDate] = useState('');
  const sync = useDateDaysSync({
    departure: startDate, returnDate, days,
    setDeparture: setStartDate, setReturn: setReturnDate, setDays,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);          // { packages, source, tier }
  const [openPkg, setOpenPkg] = useState(null);
  const [planFor, setPlanFor] = useState({});

  // Run AI on first mount so the page feels alive
  useEffect(() => {
    runStudio(initialBalance, initialDays, initialVibe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Top-level handler for the big Generate button.
   * Branches: destination filled → straight to TripPlan; otherwise → 4 AI packages.
   */
  const onGenerate = () => {
    if (loading) return;
    if (destInput && destInput.trim().length > 1) {
      const dest    = destInput.trim().replace(/\s+/g, ' ');
      const fromTr  = (from || '').trim() || 'Bishkek';
      const dClamp  = Math.max(1, Math.min(21, Math.round(Number(days) || 5)));
      const bClamp  = Math.max(100, Math.min(50000, Number(balance) || 1500));
      savePrefs({ balance: bClamp, days: dClamp, vibe: sanitizeVibe(vibe), destination: dest, fromCity: fromTr });
      toast.ai('Building your detailed plan', `${dClamp} days in ${dest.split(',')[0]} on $${bClamp}`);
      const item = {
        id: `direct-${Date.now()}`,
        name: `${dClamp}-day trip to ${dest}`,
        destination: dest,
        duration: dClamp,
        price: bClamp,
        category: 'standard',
        image: heroFor(dest),
        description: `A ${dClamp}-day AI-built trip plan for ${dest} on a $${bClamp} budget.`,
      };
      const qs = new URLSearchParams({
        to:      dest,
        days:    String(dClamp),
        balance: String(bClamp),
        from:    fromTr,
        ...(startDate ? { start: startDate } : {}),
      });
      navigate(`/trip-plan?${qs.toString()}`, { state: { item, type: 'package', fromCity: fromTr, startDate, purpose: 'Tourism and cultural exploration' } });
      return;
    }
    runStudio();
  };

  const runStudio = async (b = balance, d = days, v = vibe, f = from) => {
    setError(null); setResult(null); setOpenPkg(null); setPlanFor({});
    setLoading(true);
    // Scroll the result strip into view so the user sees something happen.
    setTimeout(() => {
      const el = document.getElementById('ai-packages-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    try {
      const r = await generateAiPackages({
        balance: Number(b),
        days: Number(d),
        vibe: sanitizeVibe(v),
        fromCity: f,
      });
      setResult(r);
      savePrefs({ balance: Number(b), days: Number(d), vibe: sanitizeVibe(v) });
      toast.ai(
        r.source === 'ai' ? 'AI built 4 tours for your balance' : 'Smart Match found 4 tours for your balance',
        `${d} day${Number(d) === 1 ? '' : 's'} · all under $${b}`
      );
    } catch (err) {
      setError('Could not generate packages right now. Try again in a moment.');
      toast.error('Generation failed', 'Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => runStudio(balance, days, vibe, from);

  const openPlanForPkg = async (idx, pkg) => {
    setOpenPkg(idx);
    if (planFor[idx]?.plan || planFor[idx]?.loading) return;
    setPlanFor(s => ({ ...s, [idx]: { loading: true } }));
    try {
      const params = {
        destination: `${pkg.destination}, ${pkg.country}`,
        days: pkg.days,
        budget: pkg.price,
        style: pkg.style,
        interests: vibe === 'any' ? ['culture','food'] : [vibe],
        transportMode: 'walking',
      };
      let plan;
      if (isAiAvailable()) {
        try { plan = await generateAiItinerary(params); } catch {}
      }
      if (!plan) plan = await generateItinerary(params);
      setPlanFor(s => ({ ...s, [idx]: { loading: false, plan } }));
    } catch {
      setPlanFor(s => ({ ...s, [idx]: { loading: false, plan: null, error: true } }));
    }
  };

  const bookPackage = (pkg) => {
    const itemForCheckout = {
      id: `aipkg-${Date.now()}-${pkg.destination}`,
      name: `${pkg.destination} · ${pkg.tier}`,
      destination: `${pkg.destination}, ${pkg.country}`,
      duration: pkg.days,
      price: pkg.price,
      image: pkg.image,
      rating: pkg.rating,
      category: pkg.style,
      includes: pkg.includes,
      highlights: pkg.highlights,
      description: `AI-curated ${pkg.days}-day ${pkg.style} tour to ${pkg.destination}.`,
    };
    toast.success('Opening your full trip plan', `${pkg.destination} · $${pkg.price.toLocaleString()}`);
    navigate('/trip-plan', { state: { item: itemForCheckout, type: 'package' } });
  };

  const aiAvailable = isAiAvailable();
  const greeting = user?.name ? `, ${user.name.split(' ')[0]}` : '';

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ── HERO + STUDIO INPUTS ─────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#002250] via-[#003580] to-[#003580] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage:'radial-gradient(circle at 18% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 82% 70%, #febb02 0%, transparent 35%)' }} />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#febb02]/10 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-4">
                <Cpu className="w-3.5 h-3.5" /> {t('hotTours.hero.badge')} · {aiAvailable ? t('hotTours.hero.poweredGrok') : t('hotTours.hero.smartMatch')}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.03] mb-3">
                {t('hotTours.hero.title1')}{greeting}.<br className="hidden md:block" />
                <span className="text-[#febb02]">{t('hotTours.hero.title2')}</span>
              </h1>
              <p className="text-[15px] md:text-[17px] text-white/85 font-medium max-w-xl">
                {t('hotTours.hero.sub')}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white text-[#1a1a1a] rounded-2xl shadow-2xl ring-4 ring-[#febb02]/20 border border-[#febb02]/40 overflow-hidden">
                <div className="bg-[#febb02] text-[#1a1a1a] px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                    <Wand2 className="w-3.5 h-3.5" /> {t('hotTours.form.buildTitle')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/70">{t('hotTours.form.noPayment')}</div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <BalanceField value={balance} onChange={setBalance} label={t('hotTours.form.balanceLabel')} />

                  {/* Low-budget advisory — appears under $500 */}
                  <BudgetAdvisory balance={balance} />

                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0071c2]" /> {t('hotTours.form.daysQuestion')}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {[3, 5, 10].map(n => (
                        <button key={n} type="button" onClick={() => sync.onChangeDays(n)}
                          className={`py-3 rounded-xl text-[14px] font-black transition active:scale-95 ${
                            Number(days) === n
                              ? 'bg-[#003580] text-white shadow-md ring-2 ring-[#003580]/30'
                              : 'bg-[#f8f9fa] border border-[#e7e7e7] text-[#1a1a1a] hover:border-[#0071c2] hover:bg-[#f0f5ff]'
                          }`}>
                          {n} {t('hotTours.form.daysSuffix')}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl px-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">{t('hotTours.form.customLabel')}</span>
                      <button type="button" onClick={() => sync.onChangeDays(Math.max(1, Number(days) - 1))}
                        className="w-7 h-7 rounded-md bg-white border border-[#e7e7e7] text-[#0071c2] text-[16px] font-black hover:border-[#0071c2] active:scale-95 transition">−</button>
                      <input type="number" min="1" max="21" value={days} onChange={e => sync.onChangeDays(e.target.value)}
                        className="w-12 bg-transparent outline-none text-[16px] font-black text-[#003580] text-center" />
                      <button type="button" onClick={() => sync.onChangeDays(Math.min(21, Number(days) + 1))}
                        className="w-7 h-7 rounded-md bg-white border border-[#e7e7e7] text-[#0071c2] text-[16px] font-black hover:border-[#0071c2] active:scale-95 transition">+</button>
                      <span className="text-[11px] text-[#9ca3af] font-bold ml-auto">{t('hotTours.form.daysUnit')}</span>
                    </div>
                  </div>

                  <Field icon={<MapPin className="w-4 h-4" />} label={t('hotTours.form.destLabel')}>
                    <input type="text" value={destInput} onChange={e => setDestInput(e.target.value)}
                      placeholder={t('hotTours.form.destPlaceholder')}
                      className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a] placeholder:text-[#b0b0b0]" />
                  </Field>

                  <Field icon={<Plane className="w-4 h-4" />} label={t('hotTours.form.fromLabel')}>
                    <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder={t('hotTours.form.fromPlaceholder')}
                      className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a]" />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field icon={<Calendar className="w-4 h-4" />} label={t('hotTours.form.departLabel')}>
                      <input type="date" value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => sync.onChangeDeparture(e.target.value)}
                        className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a]" />
                    </Field>
                    <Field icon={<Calendar className="w-4 h-4" />} label={t('hotTours.form.returnLabel')}>
                      <input type="date" value={sync.returnDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={e => sync.onChangeReturn(e.target.value)}
                        className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a]" />
                    </Field>
                  </div>

                  {!destInput && (
                    <Field icon={<Globe2 className="w-4 h-4" />} label={t('hotTours.form.vibeLabel')}>
                      <select value={vibe} onChange={e => setVibe(e.target.value)}
                        className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a] cursor-pointer">
                        <option value="any">{t('hotTours.form.vibeAny')}</option>
                        <option value="warm">{t('hotTours.form.vibeWarm')}</option>
                        <option value="beach">{t('hotTours.form.vibeBeach')}</option>
                        <option value="city">{t('hotTours.form.vibeCity')}</option>
                        <option value="cultural">{t('hotTours.form.vibeCultural')}</option>
                        <option value="nature">{t('hotTours.form.vibeNature')}</option>
                        <option value="luxury">{t('hotTours.form.vibeLuxury')}</option>
                      </select>
                    </Field>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] self-center">{t('hotTours.form.quickBalance')}</span>
                    {[500, 1000, 2000, 3500, 6000].map(v => (
                      <button key={v} type="button" onClick={() => setBalance(v)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black transition ${Number(balance) === v ? 'bg-[#003580] text-white' : 'bg-[#f0f5ff] text-[#0071c2] hover:bg-[#dceaff]'}`}>
                        ${v}
                      </button>
                    ))}
                  </div>

                  <button onClick={onGenerate} disabled={loading || !balance || !days}
                    className="w-full py-3.5 rounded-xl bg-[#003580] hover:bg-[#002a66] text-white font-black text-[14px] flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60">
                    {loading
                      ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t('hotTours.form.crafting')} {days}-{destInput ? t('hotTours.form.craftingPlanDay') : t('hotTours.form.craftingPlanDays')}…</>)
                      : destInput
                        ? (<><Sparkles className="w-5 h-5" /> {t('hotTours.form.planTripTo')} {days}-{t('hotTours.form.dayTripTo')} {destInput.split(',')[0]}</>)
                        : (<><Sparkles className="w-5 h-5" /> {t('hotTours.form.pick4')} ${balance} · {days}d</>)}
                  </button>

                  {error && <p className="text-[12px] text-red-500 font-bold text-center">{error}</p>}
                  <p className="text-[11px] text-[#9ca3af] font-semibold text-center">
                    {destInput
                      ? t('hotTours.form.directHint')
                      : (aiAvailable ? t('hotTours.form.aiHint') : t('hotTours.form.smartHint'))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI PACKAGE GRID ──────────────────────────────────────── */}
      <section id="ai-packages-grid" className="max-w-7xl mx-auto px-4 md:px-8 py-10 scroll-mt-6">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-1">
              <Zap className="w-3.5 h-3.5" /> {t('hotTours.grid.curatedFor')} ${balance} · {days} {Number(days) === 1 ? t('hotTours.grid.daySingular') : t('hotTours.grid.dayPlural')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">
              {loading
                ? `${t('hotTours.grid.building')} ${days}-${t('hotTours.grid.buildingMid')} $${balance}…`
                : result?.packages?.length
                  ? `${result.tier || tierLabel[tierOf(balance) - 1]} · 4 × ${days}-${t('hotTours.grid.optionsThatFit')} $${balance}`
                  : t('hotTours.grid.pressGenerate')}
            </h2>
          </div>
          <button onClick={regenerate} disabled={loading}
            className="px-4 py-2.5 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] text-[13px] font-black text-[#1a1a1a] flex items-center gap-2 transition disabled:opacity-50">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('hotTours.grid.regenerate')}
          </button>
        </div>

        {/* Skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft">
                <div className="h-44 shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-3 shimmer rounded w-1/3" />
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-1/2" />
                  <div className="h-9 shimmer rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result cards */}
        {!loading && result?.packages?.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.packages.map((p, i) => {
              const badge = STYLE_BADGE[p.style] || STYLE_BADGE.standard;
              const fakeId = `${p.destination}-${i}`;
              return (
                <motion.div
                  key={fakeId}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                  className="group lift bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={p.image} alt={`${p.destination}, ${p.country}`} loading="lazy" onError={handleImgError}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1 ${badge.cls} text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm`}>
                        <Sparkles className="w-3 h-3" /> {t(`hotTours.styleBadge.${p.style}`) ?? badge.label}
                      </span>
                      {p.saving > 0 && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#febb02] to-[#f5b942] text-[#1a1a1a] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                          <BadgePercent className="w-3 h-3" /> {t('hotTours.grid.savesPrefix')} ${p.saving}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const wasIn = isInWishlist(fakeId, 'package');
                        toggleWishlist('package', { id: fakeId, name: `${p.destination} · ${p.tier}`, image: p.image, price: p.price });
                        if (wasIn) toast.info('Removed from wishlist', p.destination);
                        else       toast.success('Saved to wishlist', `${p.destination} · $${p.price}`);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                      aria-label={isInWishlist(fakeId, 'package') ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(fakeId, 'package') ? 'fill-red-500 text-red-500' : 'text-[#595959]'}`} />
                    </button>
                    <div className="absolute bottom-2 right-2 glass-dark text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                      {p.tagline}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#595959] font-bold mb-1">
                      <MapPin className="w-3 h-3 text-[#0071c2]" /> {p.destination}, {p.country}
                    </div>
                    <h3 className="text-[16px] font-black text-[#1a1a1a] leading-tight mb-1.5">{p.days}-{t('hotTours.grid.dayTrip')} {p.tier.split(' ')[0]} {t('hotTours.grid.tripSuffix')}</h3>

                    <div className="flex items-center gap-2 text-[11px] text-[#595959] mb-3">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[#febb02] text-[#febb02]" /> {p.rating}</span>
                      <span>·</span>
                      <span>{p.reviews} {t('hotTours.grid.reviews')}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {p.days}d</span>
                    </div>

                    <ul className="space-y-1 mb-3">
                      {(p.includes || []).slice(0, 3).map((inc, k) => (
                        <li key={k} className="flex items-start gap-1.5 text-[11.5px] text-[#1a1a1a] font-semibold">
                          <Check className="w-3 h-3 text-[#008009] mt-0.5 shrink-0" strokeWidth={3} /> {inc}
                        </li>
                      ))}
                    </ul>

                    {/* ── Money breakdown so user sees what each $ goes to ── */}
                    <div className="bg-[#f8f9fa] border border-[#eef2f6] rounded-xl p-2.5 mb-3">
                      <div className="text-[9.5px] font-black uppercase tracking-widest text-[#9ca3af] mb-1.5 flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-[#0071c2]" /> {t('hotTours.grid.whereGoes1')} ${p.price.toLocaleString()} {t('hotTours.grid.whereGoes2')}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                        <BreakdownRow icon={<Plane className="w-3 h-3" />}    label={t('hotTours.grid.flight')} val={p.breakdown?.flight} />
                        <BreakdownRow icon={<Hotel className="w-3 h-3" />}    label={t('hotTours.grid.hotel')}  val={p.breakdown?.hotel} />
                        <BreakdownRow icon={<Utensils className="w-3 h-3" />} label={t('hotTours.grid.food')}   val={p.breakdown?.food} />
                        <BreakdownRow icon={<Activity className="w-3 h-3" />} label={t('hotTours.grid.tours')}  val={p.breakdown?.activities} />
                      </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-[#f0f0f0]">
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <div className="text-[10px] text-[#9ca3af] font-bold uppercase">{t('hotTours.grid.totalAllIn')}</div>
                          <div className="text-[22px] font-black text-[#003580] leading-none">${p.price.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#9ca3af] font-bold uppercase">{t('hotTours.grid.yourBalance')}</div>
                          <div className="text-[12px] text-[#008009] font-black flex items-center justify-end gap-0.5">
                            <Check className="w-3 h-3" strokeWidth={3} /> {t('hotTours.grid.fits')}
                          </div>
                          {p.saving > 0 && <div className="text-[10px] text-[#008009] font-black">${p.saving} {t('hotTours.grid.left')}</div>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={() => openPlanForPkg(i, p)}
                          className="px-2 py-2 rounded-lg border-2 border-[#0071c2] text-[#0071c2] text-[11px] font-black hover:bg-[#f0f5ff] transition active:scale-95 flex items-center justify-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> {t('hotTours.grid.dayPlan')}
                        </button>
                        <button onClick={() => bookPackage(p)}
                          className="btn-gold px-2 py-2 rounded-lg text-[11px] flex items-center justify-center gap-1">
                          {t('hotTours.grid.getPlan')} <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Day-plan drawer */}
        <AnimatePresence>
          {openPkg != null && result?.packages?.[openPkg] && (
            <DayPlanDrawer
              pkg={result.packages[openPkg]}
              state={planFor[openPkg]}
              balance={balance}
              t={t}
              onClose={() => setOpenPkg(null)}
              onBook={() => bookPackage(result.packages[openPkg])}
            />
          )}
        </AnimatePresence>

        {/* Empty / error */}
        {!loading && !result?.packages?.length && (
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-12 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#febb02]/20 to-[#f5b942]/10 flex items-center justify-center animate-float">
              <Sparkles className="w-8 h-8 text-[#f5b942]" />
            </div>
            <p className="text-[#1a1a1a] font-black text-[17px] mb-1">{t('hotTours.grid.emptyTitle')}</p>
            <p className="text-[#595959] text-sm font-medium">{t('hotTours.grid.emptySub')}</p>
          </div>
        )}
      </section>

      {/* ── BUDGET TIER SHORTCUTS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0f5ff] text-[#0071c2] text-[11px] font-black uppercase tracking-widest mb-3">
            <TrendingDown className="w-3.5 h-3.5" /> {t('hotTours.tiers.badge')}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('hotTours.tiers.title')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {[
            { lab: t('hotTours.tiers.budgetSaver'),     min: 500,  max: 800,    img: 'https://images.unsplash.com/photo-1604608672516-9656d6678f86?auto=format&fit=crop&w=600&q=80' },
            { lab: t('hotTours.tiers.smartValue'),      min: 800,  max: 1500,   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
            { lab: t('hotTours.tiers.comfortClass'),    min: 1500, max: 3000,   img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
            { lab: t('hotTours.tiers.premiumEscape'),   min: 3000, max: 5000,   img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' },
            { lab: t('hotTours.tiers.luxurySignature'), min: 5000, max: 12000,  img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80' },
          ].map((b, i) => (
            <button key={i} onClick={() => { const v = Math.round((b.min + b.max) / 2); setBalance(v); runStudio(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group lift relative overflow-hidden rounded-2xl aspect-[4/5] shadow-soft border border-[#e7e7e7]">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110" style={{ backgroundImage:`url(${b.img})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-left text-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#febb02]">{b.lab}</span>
                <span className="text-[17px] font-black leading-tight mt-0.5">${b.min}–{b.max >= 12000 ? '12K+' : `$${b.max}`}</span>
                <span className="text-[11px] font-semibold text-white/75 mt-1.5 flex items-center gap-1">
                  {t('hotTours.tiers.runAi')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOT DEALS GRID (admin-seeded, with discounts) ────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#febb02] text-[11px] font-black uppercase tracking-widest mb-1">
              <Flame className="w-3.5 h-3.5" /> {t('hotTours.deals.badge')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">{t('hotTours.deals.title')}</h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotDeals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className="group lift bg-white rounded-2xl overflow-hidden border border-[#e7e7e7] shadow-soft"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#febb02] to-[#e0a435] text-[#1a1a1a] text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    <BadgePercent className="w-3 h-3" /> -{p.discount}%
                  </span>
                  {p.featured && (
                    <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur text-[#0071c2] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      <Star className="w-3 h-3 fill-[#febb02] text-[#febb02]" /> {t('hotTours.deals.bestseller')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const wasIn = isInWishlist(p.id, 'package');
                    toggleWishlist('package', p);
                    if (wasIn) toast.info('Removed from wishlist', p.name);
                    else       toast.success('Saved to wishlist', p.name);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                  aria-label={isInWishlist(p.id, 'package') ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(p.id, 'package') ? 'fill-red-500 text-red-500' : 'text-[#595959]'}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 glass-dark text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <Clock className="w-3 h-3" /> {t('hotTours.deals.endsIn')} {p.hoursLeft}h
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 text-[12px] text-[#595959] font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0071c2]" /> {p.destination}
                </div>
                <h3 className="text-[16px] font-black text-[#1a1a1a] mb-2 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-3 text-[12px] text-[#595959] mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{p.duration} {t('hotTours.deals.days')}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#febb02] text-[#febb02]" />{p.rating}</span>
                  <span className="text-red-500 font-bold">{t('hotTours.deals.only')} {p.seatsLeft} {t('hotTours.deals.leftSuffix')}</span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-[#9ca3af] line-through font-semibold">${p.originalPrice}</div>
                    <div className="text-[22px] font-black text-[#003580] leading-tight">${p.price}<span className="text-[11px] font-bold text-[#595959]"> {t('hotTours.deals.perPerson')}</span></div>
                  </div>
                  <button
                    onClick={() => navigate('/trip-plan', { state: { item: p, type: 'package' } })}
                    className="btn-gold px-4 py-2.5 rounded-lg text-[13px] flex items-center gap-1.5 shrink-0"
                  >
                    {t('hotTours.deals.getPlan')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

/* ── Sub-components ───────────────────────────────────────────────── */

const BreakdownRow = ({ icon, label, val }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-1 text-[#595959] font-semibold">
      <span className="text-[#0071c2]">{icon}</span>{label}
    </span>
    <span className="text-[#1a1a1a] font-black">${(val || 0).toLocaleString()}</span>
  </div>
);

const Field = ({ icon, label, children }) => (
  <label className="block bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl px-3.5 py-2.5 focus-within:border-[#0071c2] focus-within:ring-4 focus-within:ring-[#0071c2]/10 transition">
    <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">
      <span className="text-[#0071c2]">{icon}</span> {label}
    </div>
    {children}
  </label>
);

const BalanceField = ({ value, onChange, label }) => (
  <label className="block bg-[#003580] text-white rounded-xl px-4 py-3 border-2 border-[#febb02]/40 focus-within:border-[#febb02] focus-within:ring-4 focus-within:ring-[#febb02]/25 transition">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">
      <Wallet className="w-3.5 h-3.5 text-[#febb02]" /> {label}
    </div>
    <div className="flex items-center">
      <span className="text-[32px] font-black text-[#febb02] mr-1">$</span>
      <input type="number" min="200" step="50" value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-[32px] font-black tracking-tight" />
    </div>
  </label>
);

/* ── Modal-ish drawer that shows the full day-by-day plan ── */
const DayPlanDrawer = ({ pkg, state, balance, t, onClose, onBook }) => {
  const plan = state?.plan;
  const loading = state?.loading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.28 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-52 bg-cover bg-center" style={{ backgroundImage:`url(${pkg.image})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-[#1a1a1a] font-black active:scale-95">✕</button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="text-[11px] font-black uppercase tracking-widest text-[#febb02] mb-1">{pkg.tier} · {pkg.style}</div>
            <h3 className="text-2xl md:text-3xl font-black leading-tight">{pkg.destination}, {pkg.country}</h3>
            <p className="text-[13px] font-semibold text-white/85 mt-1">{pkg.days}-{t('hotTours.drawer.planSuffix')} · ${pkg.price} {t('hotTours.drawer.perPerson')} ${balance} {t('hotTours.drawer.balanceSuffix')}</p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0071c2] mx-auto mb-2" />
              <p className="text-[13px] font-bold text-[#595959]">{t('hotTours.drawer.laying')}</p>
            </div>
          )}

          {!loading && plan && (
            <>
              {/* Budget split */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
                {[
                  { icon: Plane,       label: t('hotTours.drawer.flights'),    key: 'flight' },
                  { icon: Hotel,       label: t('hotTours.drawer.stay'),       key: 'accommodation' },
                  { icon: Utensils,    label: t('hotTours.drawer.food'),       key: 'food' },
                  { icon: Bus,         label: t('hotTours.drawer.transport'),  key: 'transport' },
                  { icon: Activity,    label: t('hotTours.drawer.activities'), key: 'activities' },
                  { icon: ShoppingBag, label: t('hotTours.drawer.shopping'),   key: 'shopping' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-2.5 text-center">
                    <s.icon className="w-3.5 h-3.5 text-[#0071c2] mx-auto mb-1" />
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#9ca3af]">{s.label}</div>
                    <div className="text-[13px] font-black text-[#003580]">${plan.budgetBreakdown?.[s.key] || 0}</div>
                  </div>
                ))}
              </div>

              {/* Days */}
              <h4 className="text-[12px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">{t('hotTours.drawer.dayByDay')}</h4>
              <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1">
                {(plan.days || []).map(d => (
                  <div key={d.day} className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eef2f6]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#003580] text-white text-[12px] font-black flex items-center justify-center shrink-0">D{d.day}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-black text-[#1a1a1a]">{d.title || `${t('hotTours.drawer.dayPrefix')} ${d.day}`}</div>
                        <div className="text-[12px] text-[#595959] font-semibold">{d.place} · {t('hotTours.drawer.estPrefix')} ${d.cost}</div>
                        {Array.isArray(d.events) && d.events.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {d.events.slice(0, 3).map((ev, j) => (
                              <li key={j} className="text-[11.5px] text-[#595959] font-medium truncate">
                                <span className="font-black text-[#0071c2] mr-1">{ev.time}</span>{ev.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {plan.travelTips?.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2 mb-5">
                  {plan.travelTips.slice(0, 4).map((tip, i) => (
                    <div key={i} className="text-[12px] text-[#595959] font-semibold flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#febb02] mt-0.5 shrink-0" /> {tip}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#f0f0f0]">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] text-[13px] font-black text-[#1a1a1a] transition active:scale-95">
              {t('hotTours.drawer.compareOthers')}
            </button>
            <button onClick={onBook}
              className="btn-gold flex-1 py-3 rounded-xl text-[13px] flex items-center justify-center gap-2">
              {t('hotTours.drawer.viewFullPlan')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HotTours;
