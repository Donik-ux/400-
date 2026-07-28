import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench, RefreshCw, ArrowLeftRight, Receipt, Clock, Users, Minus, Plus,
  Ruler, Languages, Volume2, Sparkles, Loader2, Search,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { LANGUAGES, PHRASE_LABELS } from '../data/phrasebook';
import { aiPhrasebook } from '../services/travelServicesService';
import { isGrokAvailable } from '../services/grokClient';
import { useTranslation } from '../store/useLangStore';
import { currencyFlag, currencyNamer } from '../utils/currencyMeta';

/* ── Currencies ── */
const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'Доллар США' },
  { code: 'EUR', flag: '🇪🇺', name: 'Евро' },
  { code: 'KGS', flag: '🇰🇬', name: 'Кыргызский сом' },
  { code: 'KZT', flag: '🇰🇿', name: 'Казахский тенге' },
  { code: 'RUB', flag: '🇷🇺', name: 'Российский рубль' },
  { code: 'UZS', flag: '🇺🇿', name: 'Узбекский сум' },
  { code: 'GBP', flag: '🇬🇧', name: 'Фунт стерлингов' },
  { code: 'TRY', flag: '🇹🇷', name: 'Турецкая лира' },
  { code: 'AED', flag: '🇦🇪', name: 'Дирхам ОАЭ' },
  { code: 'THB', flag: '🇹🇭', name: 'Тайский бат' },
  { code: 'JPY', flag: '🇯🇵', name: 'Японская иена' },
  { code: 'CNY', flag: '🇨🇳', name: 'Китайский юань' },
  { code: 'INR', flag: '🇮🇳', name: 'Индийская рупия' },
  { code: 'GEL', flag: '🇬🇪', name: 'Грузинский лари' },
  { code: 'KRW', flag: '🇰🇷', name: 'Корейская вона' },
];

/* Approximate rates per 1 USD — fallback when the live API is unreachable */
const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, KGS: 87.5, KZT: 480, RUB: 90, UZS: 12600, GBP: 0.79,
  TRY: 34, AED: 3.67, THB: 36, JPY: 150, CNY: 7.2, INR: 83, GEL: 2.7, KRW: 1350,
};

/* ── World clock cities ── */
const CLOCK_CITIES = [
  { key: 'bishkek', flag: '🇰🇬', tz: 'Asia/Bishkek' },
  { key: 'dubai',   flag: '🇦🇪', tz: 'Asia/Dubai' },
  { key: 'istanbul', flag: '🇹🇷', tz: 'Europe/Istanbul' },
  { key: 'bangkok', flag: '🇹🇭', tz: 'Asia/Bangkok' },
  { key: 'london',  flag: '🇬🇧', tz: 'Europe/London' },
  { key: 'tokyo',   flag: '🇯🇵', tz: 'Asia/Tokyo' },
  { key: 'newYork', flag: '🇺🇸', tz: 'America/New_York' },
  { key: 'paris',   flag: '🇫🇷', tz: 'Europe/Paris' },
];

const fmtMoney = (n) => {
  if (!Number.isFinite(n)) return '—';
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2);
};

const CurrencySelect = ({ value, onChange, codes }) => {
  const { lang } = useTranslation();
  const nameFor = useMemo(() => currencyNamer(lang || 'en'), [lang]);
  // Every currency the live feed knows; static list until rates arrive
  const list = codes && codes.length ? codes : CURRENCIES.map(c => c.code);
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus:border-[#0172cb] focus:ring-4 focus:ring-[#0172cb]/10 outline-none text-[14px] font-bold text-[#252a31] bg-white transition-premium">
      {list.map(code => (
        <option key={code} value={code}>{currencyFlag(code)} {code} — {nameFor(code)}</option>
      ))}
    </select>
  );
};

/* ─────────── Currency converter ─────────── */
function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(100);
  const [from, setFrom]     = useState('USD');
  const [to, setTo]         = useState('KGS');
  const [rates, setRates]   = useState(FALLBACK_RATES);
  const [status, setStatus] = useState('loading'); // loading | live | offline

  useEffect(() => {
    let alive = true;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (!alive) return;
        if (data?.rates) { setRates(data.rates); setStatus('live'); }
        else setStatus('offline');
      })
      .catch(() => { if (alive) setStatus('offline'); });
    return () => { alive = false; };
  }, []);

  const result = useMemo(() => {
    const rf = rates[from], rt = rates[to];
    if (!rf || !rt) return NaN;
    return (Number(amount) || 0) * (rt / rf);
  }, [amount, from, to, rates]);

  const oneUnit = useMemo(() => {
    const rf = rates[from], rt = rates[to];
    return rf && rt ? rt / rf : NaN;
  }, [from, to, rates]);

  const swap = () => { setFrom(to); setTo(from); };
  const allCodes = useMemo(() => Object.keys(rates).sort(), [rates]);

  return (
    <div className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 text-[#0172cb]" />
        </div>
        <h2 className="text-[16px] font-black text-[#252a31]">{t('toolsPage.converter.title')}</h2>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${
          status === 'live' ? 'bg-[#e9f3ea] text-ok'
          : status === 'loading' ? 'bg-[#e8f4fd] text-[#0172cb]'
          : 'bg-[#fdf3dc] text-warn'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'live' ? 'bg-[#2e7d4f]' : status === 'loading' ? 'bg-[#0172cb] animate-pulse' : 'bg-[#009882]'
          }`} />
          {status === 'live' ? t('toolsPage.converter.statusLive') : status === 'loading' ? t('toolsPage.converter.statusLoading') : t('toolsPage.converter.statusOffline')}
        </span>
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">{t('toolsPage.converter.sub')}</p>

      <label className="block mb-3">
        <span className="text-[12px] font-bold text-[#252a31] mb-1.5 block">{t('toolsPage.converter.amount')}</span>
        <input type="number" min="0" value={amount}
          onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus:border-[#0172cb] focus:ring-4 focus:ring-[#0172cb]/10 outline-none text-[18px] font-black text-[#252a31] transition-premium" />
      </label>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label>
          <span className="text-[12px] font-bold text-[#252a31] mb-1.5 block">{t('toolsPage.converter.from')}</span>
          <CurrencySelect value={from} onChange={setFrom} codes={allCodes} />
        </label>
        <button onClick={swap} title={t('toolsPage.converter.swap')}
          className="w-10 h-[42px] rounded-xl bg-[#252a31] text-white flex items-center justify-center hover:bg-[#0172cb] transition-premium active:scale-90 shadow-soft hover:shadow-float">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <label>
          <span className="text-[12px] font-bold text-[#252a31] mb-1.5 block">{t('toolsPage.converter.to')}</span>
          <CurrencySelect value={to} onChange={setTo} codes={allCodes} />
        </label>
      </div>

      <div className="mt-4 bg-[#252a31] rounded-2xl p-5 text-white shadow-soft relative overflow-hidden">
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">{amount || 0} {from} =</p>
          <p className="text-[32px] font-black leading-tight">{fmtMoney(result)} <span className="text-[16px] text-white/70">{to}</span></p>
          {Number.isFinite(oneUnit) && (
            <p className="text-[11px] text-white/55 mt-0.5">1 {from} = {fmtMoney(oneUnit)} {to}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Tip calculator ─────────── */
function TipCalculator() {
  const { t } = useTranslation();
  const [bill, setBill]   = useState(50);
  const [pct, setPct]     = useState(10);
  const [people, setPeople] = useState(2);

  const tip      = (Number(bill) || 0) * (Number(pct) || 0) / 100;
  const total    = (Number(bill) || 0) + tip;
  const perHead  = total / Math.max(1, people);

  return (
    <div className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
          <Receipt className="w-5 h-5 text-[#0172cb]" />
        </div>
        <h2 className="text-[16px] font-black text-[#252a31]">{t('toolsPage.tip.title')}</h2>
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">{t('toolsPage.tip.sub')}</p>

      <label className="block mb-3">
        <span className="text-[12px] font-bold text-[#252a31] mb-1.5 block">{t('toolsPage.tip.bill')}</span>
        <input type="number" min="0" value={bill}
          onChange={e => setBill(Math.max(0, Number(e.target.value)))}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus:border-[#0172cb] focus:ring-4 focus:ring-[#0172cb]/10 outline-none text-[18px] font-black text-[#252a31] transition-premium" />
      </label>

      <span className="text-[12px] font-bold text-[#252a31] mb-1.5 block">{t('toolsPage.tip.tipLabel')}</span>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[0, 5, 10, 15, 20].map(p => (
          <button key={p} onClick={() => setPct(p)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-black border transition-premium ${
              pct === p ? 'bg-[#252a31] text-white border-[#252a31] shadow-float' : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#252a31]'
            }`}>{p}%</button>
        ))}
        <div className="flex items-center gap-1 px-2 rounded-lg border border-[#dfe7ec] focus-within:border-[#0172cb] focus-within:ring-4 focus-within:ring-[#0172cb]/10 transition-premium">
          <input type="number" min="0" max="100" value={pct}
            onChange={e => setPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-12 text-[12px] font-black text-[#252a31] outline-none py-1.5" />
          <span className="text-[12px] font-bold text-[#697d95]">%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-[13px] font-bold text-[#252a31]">
          <Users className="w-4 h-4 text-[#0172cb]" /> {t('toolsPage.tip.people')}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => setPeople(v => Math.max(1, v - 1))}
            className="w-8 h-8 rounded-lg border border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] hover:bg-[#e8f4fd] transition-premium active:scale-90">
            <Minus className="w-4 h-4 text-[#4a5867]" />
          </button>
          <span className="text-[15px] font-black text-[#252a31] w-6 text-center tabular-nums">{people}</span>
          <button onClick={() => setPeople(v => Math.min(50, v + 1))}
            className="w-8 h-8 rounded-lg border border-[#dfe7ec] flex items-center justify-center hover:border-[#0172cb] hover:bg-[#e8f4fd] transition-premium active:scale-90">
            <Plus className="w-4 h-4 text-[#4a5867]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 bg-[#eef2f5] border border-[#dfe7ec] rounded-xl p-4">
        <div className="flex justify-between text-[13px]"><span className="text-[#4a5867]">{t('toolsPage.tip.tipRow')}</span><span className="font-black text-[#252a31]">{fmtMoney(tip)}</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[#4a5867]">{t('toolsPage.tip.totalRow')}</span><span className="font-black text-[#252a31]">{fmtMoney(total)}</span></div>
        <div className="hairline my-1" />
        <div className="flex justify-between text-[14px]">
          <span className="font-black text-[#252a31]">{t('toolsPage.tip.perHead')}</span>
          <span className="font-black text-gradient text-[18px]">{fmtMoney(perHead)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── World clock ─────────── */
function WorldClock() {
  const { t, lang } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeIn = (tz) => {
    try {
      return new Intl.DateTimeFormat(lang || 'en', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now);
    } catch { return '—'; }
  };
  const dayIn = (tz) => {
    try {
      return new Intl.DateTimeFormat(lang || 'en', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(now);
    } catch { return ''; }
  };

  return (
    <div className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-[#0172cb]" />
        </div>
        <h2 className="text-[16px] font-black text-[#252a31]">{t('toolsPage.clock.title')}</h2>
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">{t('toolsPage.clock.sub')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
        {CLOCK_CITIES.map(c => (
          <div key={c.key} className="bg-[#eef2f5] border border-[#dfe7ec] rounded-xl p-3 text-center hover:border-[#0172cb]/40 hover:bg-white transition-premium">
            <div className="text-[18px] leading-none mb-1">{c.flag}</div>
            <div className="text-[12px] font-bold text-[#4a5867]">{t(`toolsPage.clock.cities.${c.key}`)}</div>
            <div className="text-[20px] font-black text-gradient leading-tight tabular-nums">{timeIn(c.tz)}</div>
            <div className="text-[10px] text-[#697d95]">{dayIn(c.tz)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Unit converter ─────────── */
/* Unit symbols (°C, km, lb…) are universal data and kept as-is; only the
 * category name is translated via labelKey. */
const UNIT_CATS = [
  { key: 'temp',   emoji: '🌡️', labelKey: 'temp',   from: '°C',  to: '°F',  conv: (c) => c * 9 / 5 + 32, inv: (f) => (f - 32) * 5 / 9, def: 20 },
  { key: 'dist',   emoji: '📏', labelKey: 'dist',   from: 'km',  to: 'mi',  conv: (k) => k * 0.621371,   inv: (m) => m / 0.621371,    def: 10 },
  { key: 'weight', emoji: '⚖️', labelKey: 'weight', from: 'kg',  to: 'lb',  conv: (k) => k * 2.20462,    inv: (l) => l / 2.20462,     def: 20 },
];

function UnitConverter() {
  const { t } = useTranslation();
  const [cat, setCat] = useState('temp');
  const [val, setVal] = useState(20);
  const [dir, setDir] = useState(false); // false: from→to

  const c = UNIT_CATS.find(x => x.key === cat);
  const num = Number(val) || 0;
  const result = dir ? c.inv(num) : c.conv(num);
  const fromU = dir ? c.to : c.from;
  const toU   = dir ? c.from : c.to;

  const pickCat = (k) => {
    const next = UNIT_CATS.find(x => x.key === k);
    setCat(k); setVal(next.def); setDir(false);
  };

  return (
    <div className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
          <Ruler className="w-5 h-5 text-[#0172cb]" />
        </div>
        <h2 className="text-[16px] font-black text-[#252a31]">{t('toolsPage.units.title')}</h2>
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">{t('toolsPage.units.sub')}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {UNIT_CATS.map(u => (
          <button key={u.key} onClick={() => pickCat(u.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-black border transition-premium ${
              cat === u.key ? 'bg-[#252a31] text-white border-[#252a31] shadow-float' : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#252a31]'
            }`}>{u.emoji} {t(`toolsPage.units.${u.labelKey}`)}</button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <span className="text-[11px] font-bold text-[#697d95] mb-1 block">{fromU}</span>
          <input type="number" value={val}
            onChange={e => setVal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#dfe7ec] focus:border-[#0172cb] focus:ring-4 focus:ring-[#0172cb]/10 outline-none text-[18px] font-black text-[#252a31] transition-premium" />
        </div>
        <button onClick={() => setDir(d => !d)} title={t('toolsPage.units.flipTitle')}
          className="w-10 h-[42px] mt-5 rounded-xl bg-[#252a31] text-white flex items-center justify-center hover:bg-[#0172cb] transition-premium active:scale-90 shadow-soft hover:shadow-float">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[11px] font-bold text-[#697d95] mb-1 block">{toU}</span>
          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#e8f4fd] to-[#eef2f5] border-2 border-[#0172cb]/15 text-[18px] font-black text-gradient">
            {result.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Phrasebook ─────────── */
const BCP = { en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', th: 'th-TH', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', es: 'es-ES' };
/* Endonyms — chip labels read correctly whatever UI language the visitor uses */
const NATIVE_NAME = { en: 'English', tr: 'Türkçe', ar: 'العربية', th: 'ไทย', zh: '中文', ja: '日本語', ko: '한국어', es: 'Español' };
/* Unambiguous English names fed to the AI prompt for the preset chips */
const PROMPT_NAME = { en: 'English', tr: 'Turkish', ar: 'Arabic', th: 'Thai', zh: 'Chinese (Mandarin)', ja: 'Japanese', ko: 'Korean', es: 'Spanish' };

function Phrasebook() {
  const { t, lang } = useTranslation();
  const [target, setTarget] = useState({ type: 'preset', code: 'tr' });
  const [query, setQuery] = useState('');
  const [aiRes, setAiRes] = useState(null); // { id, data } | { id, error } — written only from async callbacks
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const aiOn = isGrokAvailable();

  const preset = target.type === 'preset' ? (LANGUAGES.find(l => l.code === target.code) || LANGUAGES[0]) : null;
  /* Results are stamped with the request they answer, so loading/error/stale
     are all derived — no state resets needed inside the effect. */
  const reqId = `${target.type}:${target.type === 'custom' ? target.name : target.code}:${lang}`;
  /* Russian readers already have the hand-written Cyrillic book for the preset
     languages; every other reader gets labels + pronunciation rewritten by AI
     in their own language (cached 30 days). Typed-in languages are always AI. */
  const aiLangName = target.type === 'custom'
    ? target.name
    : (lang === 'ru' ? null : PROMPT_NAME[target.code]);
  const wantAi = Boolean(aiLangName) && aiOn;

  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);

  useEffect(() => {
    if (!wantAi) return undefined;
    let cancelled = false;
    aiPhrasebook({ language: aiLangName, lang })
      .then((r) => { if (!cancelled) setAiRes({ id: reqId, data: r }); })
      .catch(() => { if (!cancelled) setAiRes({ id: reqId, error: true }); });
    return () => { cancelled = true; };
  }, [wantAi, aiLangName, lang, reqId]);

  const aiData = aiRes?.id === reqId ? aiRes.data : null;
  const aiError = aiRes?.id === reqId && Boolean(aiRes.error);
  const aiLoading = wantAi && (!aiRes || aiRes.id !== reqId);

  const speak = (text) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const bcp = aiData?.bcp47 || (preset ? BCP[preset.code] : null) || 'en-US';
    u.lang = bcp;
    const base = bcp.split('-')[0].toLowerCase();
    const voice = window.speechSynthesis.getVoices().find(v => v.lang?.toLowerCase().startsWith(base));
    if (voice) u.voice = voice;
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  /* AI result when ready; the static book renders instantly for presets and
     stays up if the AI call fails, so the widget never goes blank. */
  const rows = aiData
    ? aiData.phrases
    : preset
      ? PHRASE_LABELS.map((p) => {
          const entry = preset.phrases[p.key];
          if (!entry) return null;
          // ru keeps its authored labels; other languages resolve through i18n
          return { key: p.key, label: lang === 'ru' ? p.ru : t(`toolsPage.phrasebook.p.${p.key}`), local: entry[0], pron: entry[1] };
        }).filter(Boolean)
      : [];

  const submitCustom = (e) => {
    e.preventDefault();
    const name = query.trim();
    if (name && !(target.type === 'custom' && target.name === name)) setTarget({ type: 'custom', name });
  };

  const customActive = target.type === 'custom';

  return (
    <div className="bg-white border border-[#dfe7ec] rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
          <Languages className="w-5 h-5 text-[#0172cb]" />
        </div>
        <h2 className="text-[16px] font-black text-[#252a31]">{t('toolsPage.phrasebook.title')}</h2>
        {aiData && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#007f6d] bg-[#e6f6f3] border border-[#bfe8df] px-2 py-1 rounded-md">
            <Sparkles className="w-3 h-3" /> {t('toolsPage.phrasebook.aiTag')}
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#697d95] mb-4">
        {canSpeak ? t('toolsPage.phrasebook.subWithSpeak') : t('toolsPage.phrasebook.subNoSpeak')}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setTarget({ type: 'preset', code: l.code })}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold border transition-premium ${
              !customActive && preset?.code === l.code ? 'bg-[#252a31] text-white border-[#252a31] shadow-float' : 'bg-white text-[#4a5867] border-[#dfe7ec] hover:border-[#0172cb] hover:text-[#252a31]'
            }`}>{l.flag} {NATIVE_NAME[l.code] || l.name}</button>
        ))}
        {customActive && (
          <span className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold border bg-[#252a31] text-white border-[#252a31] shadow-float flex items-center gap-1.5">
            {aiData?.flag || '🌍'} {aiData?.langLabel || target.name}
          </span>
        )}
      </div>

      {/* Any-language AI search — the 8 chips are just shortcuts */}
      {aiOn && (
        <form onSubmit={submitCustom} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa1b3] pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('toolsPage.phrasebook.anyLangPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dfe7ec] bg-[#f5f7f9] text-[13px] font-bold text-[#252a31] placeholder:text-[#8fa1b3] placeholder:font-medium focus:outline-none focus:border-[#0172cb] focus:bg-white transition"
            />
          </div>
          <button type="submit" disabled={!query.trim() || aiLoading}
            className="px-4 py-2.5 rounded-xl bg-[#0172cb] hover:bg-[#015aa3] disabled:opacity-40 text-white text-[12.5px] font-black flex items-center gap-1.5 transition active:scale-95 shrink-0">
            <Sparkles className="w-4 h-4" /> {t('toolsPage.phrasebook.aiBuild')}
          </button>
        </form>
      )}

      {aiLoading && !rows.length && (
        <div className="flex items-center gap-2.5 rounded-xl bg-[#eef2f5] border border-[#dfe7ec] px-4 py-3.5 mb-2.5">
          <Loader2 className="w-4 h-4 text-[#0172cb] animate-spin shrink-0" />
          <span className="text-[12.5px] font-bold text-[#4a5867]">{t('toolsPage.phrasebook.aiLoading')}</span>
        </div>
      )}
      {aiError && customActive && (
        <div className="rounded-xl bg-[#fdf0ee] border border-[#f3c9c2] px-4 py-3.5 mb-2.5 text-[12.5px] font-bold text-[#a03e2d]">
          {t('toolsPage.phrasebook.aiFail')}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {rows.map((p) => (
          <div key={p.key} className="bg-[#eef2f5] border border-[#dfe7ec] rounded-xl p-3.5 flex items-start gap-2 hover:border-[#0172cb]/40 hover:bg-white hover:shadow-soft transition-premium">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#697d95] font-medium mb-0.5">{p.label}</p>
              <p className="text-[15px] font-black text-[#252a31] leading-tight">{p.local}</p>
              {p.pron && <p className="text-[12px] text-[#0172cb] font-semibold italic">[{p.pron}]</p>}
            </div>
            {canSpeak && (
              <button onClick={() => speak(p.local)} title={t('toolsPage.phrasebook.listen')}
                className="w-8 h-8 rounded-lg bg-white border border-[#dfe7ec] flex items-center justify-center text-[#0172cb] hover:bg-[#252a31] hover:text-white hover:border-[#252a31] transition-premium shrink-0 active:scale-90">
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */
export default function Tools() {
  const { t } = useTranslation();
  useSEO({
    title: t('toolsPage.seo.title'),
    description: t('toolsPage.seo.description'),
    keywords: t('toolsPage.seo.keywords'),
  });

  return (
    <div className="bg-[#f5f7f9] min-h-screen">
      {/* Hero */}
      <section className="relative aurora-bg text-white overflow-hidden">
        <div className="film-grain" />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-10">
          <div className="badge-editorial inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4">
            <Wrench className="w-3.5 h-3.5 text-[#61d1bf]" /> {t('toolsPage.hero.badge')}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] mb-2 text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.25)]">
            {t('toolsPage.hero.title1')} <span className="italic font-medium text-gradient-gold gold-animate">{t('toolsPage.hero.title2')}</span>
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/70 font-medium max-w-xl">
            {t('toolsPage.hero.sub')}
          </p>
        </div>
      </section>

      {/* Tools */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-5 page-fade">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CurrencyConverter />
          <TipCalculator />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UnitConverter />
          <WorldClock />
        </div>
        <Phrasebook />
      </div>
    </div>
  );
}
