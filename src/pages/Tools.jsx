import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench, RefreshCw, ArrowLeftRight, Receipt, Clock, Users, Minus, Plus,
  Ruler, Languages, Volume2,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { LANGUAGES, PHRASE_LABELS } from '../data/phrasebook';
import { useTranslation } from '../store/useLangStore';

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
  { city: 'Бишкек',   flag: '🇰🇬', tz: 'Asia/Bishkek' },
  { city: 'Дубай',    flag: '🇦🇪', tz: 'Asia/Dubai' },
  { city: 'Стамбул',  flag: '🇹🇷', tz: 'Europe/Istanbul' },
  { city: 'Бангкок',  flag: '🇹🇭', tz: 'Asia/Bangkok' },
  { city: 'Лондон',   flag: '🇬🇧', tz: 'Europe/London' },
  { city: 'Токио',    flag: '🇯🇵', tz: 'Asia/Tokyo' },
  { city: 'Нью-Йорк', flag: '🇺🇸', tz: 'America/New_York' },
  { city: 'Париж',    flag: '🇫🇷', tz: 'Europe/Paris' },
];

const fmtMoney = (n) => {
  if (!Number.isFinite(n)) return '—';
  return n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2);
};

const CurrencySelect = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10 outline-none text-[14px] font-bold text-[#1a1a1a] bg-white transition-premium">
    {CURRENCIES.map(c => (
      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
    ))}
  </select>
);

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

  return (
    <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 text-[#0071c2]" />
        </div>
        <h2 className="text-[16px] font-black text-[#1a1a1a]">{t('toolsPage.converter.title')}</h2>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${
          status === 'live' ? 'bg-green-50 text-green-700'
          : status === 'loading' ? 'bg-[#f0f5ff] text-[#0071c2]'
          : 'bg-amber-50 text-amber-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'live' ? 'bg-green-500' : status === 'loading' ? 'bg-[#0071c2] animate-pulse' : 'bg-amber-500'
          }`} />
          {status === 'live' ? t('toolsPage.converter.statusLive') : status === 'loading' ? t('toolsPage.converter.statusLoading') : t('toolsPage.converter.statusOffline')}
        </span>
      </div>
      <p className="text-[12px] text-[#9ca3af] mb-4">{t('toolsPage.converter.sub')}</p>

      <label className="block mb-3">
        <span className="text-[12px] font-bold text-[#1a1a1a] mb-1.5 block">{t('toolsPage.converter.amount')}</span>
        <input type="number" min="0" value={amount}
          onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10 outline-none text-[18px] font-black text-[#1a1a1a] transition-premium" />
      </label>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label>
          <span className="text-[12px] font-bold text-[#1a1a1a] mb-1.5 block">{t('toolsPage.converter.from')}</span>
          <CurrencySelect value={from} onChange={setFrom} />
        </label>
        <button onClick={swap} title={t('toolsPage.converter.swap')}
          className="w-10 h-[42px] rounded-xl bg-[#003580] text-white flex items-center justify-center hover:bg-[#0071c2] transition-premium active:scale-90 shadow-soft hover:shadow-float">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <label>
          <span className="text-[12px] font-bold text-[#1a1a1a] mb-1.5 block">{t('toolsPage.converter.to')}</span>
          <CurrencySelect value={to} onChange={setTo} />
        </label>
      </div>

      <div className="mt-4 bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-2xl p-5 text-white shadow-float relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, #f5b942 0%, transparent 45%)' }} />
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
    <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
          <Receipt className="w-5 h-5 text-[#0071c2]" />
        </div>
        <h2 className="text-[16px] font-black text-[#1a1a1a]">{t('toolsPage.tip.title')}</h2>
      </div>
      <p className="text-[12px] text-[#9ca3af] mb-4">{t('toolsPage.tip.sub')}</p>

      <label className="block mb-3">
        <span className="text-[12px] font-bold text-[#1a1a1a] mb-1.5 block">{t('toolsPage.tip.bill')}</span>
        <input type="number" min="0" value={bill}
          onChange={e => setBill(Math.max(0, Number(e.target.value)))}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10 outline-none text-[18px] font-black text-[#1a1a1a] transition-premium" />
      </label>

      <span className="text-[12px] font-bold text-[#1a1a1a] mb-1.5 block">{t('toolsPage.tip.tipLabel')}</span>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[0, 5, 10, 15, 20].map(p => (
          <button key={p} onClick={() => setPct(p)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-black border transition-premium ${
              pct === p ? 'bg-[#003580] text-white border-[#003580] shadow-float' : 'bg-white text-[#595959] border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#003580]'
            }`}>{p}%</button>
        ))}
        <div className="flex items-center gap-1 px-2 rounded-lg border border-[#e7e7e7] focus-within:border-[#0071c2] focus-within:ring-4 focus-within:ring-[#0071c2]/10 transition-premium">
          <input type="number" min="0" max="100" value={pct}
            onChange={e => setPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-12 text-[12px] font-black text-[#1a1a1a] outline-none py-1.5" />
          <span className="text-[12px] font-bold text-[#9ca3af]">%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-[13px] font-bold text-[#1a1a1a]">
          <Users className="w-4 h-4 text-[#0071c2]" /> {t('toolsPage.tip.people')}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => setPeople(v => Math.max(1, v - 1))}
            className="w-8 h-8 rounded-lg border border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] hover:bg-[#f0f5ff] transition-premium active:scale-90">
            <Minus className="w-4 h-4 text-[#595959]" />
          </button>
          <span className="text-[15px] font-black text-[#1a1a1a] w-6 text-center tabular-nums">{people}</span>
          <button onClick={() => setPeople(v => Math.min(50, v + 1))}
            className="w-8 h-8 rounded-lg border border-[#e7e7e7] flex items-center justify-center hover:border-[#0071c2] hover:bg-[#f0f5ff] transition-premium active:scale-90">
            <Plus className="w-4 h-4 text-[#595959]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-4">
        <div className="flex justify-between text-[13px]"><span className="text-[#595959]">{t('toolsPage.tip.tipRow')}</span><span className="font-black text-[#1a1a1a]">{fmtMoney(tip)}</span></div>
        <div className="flex justify-between text-[13px]"><span className="text-[#595959]">{t('toolsPage.tip.totalRow')}</span><span className="font-black text-[#1a1a1a]">{fmtMoney(total)}</span></div>
        <div className="hairline my-1" />
        <div className="flex justify-between text-[14px]">
          <span className="font-black text-[#003580]">{t('toolsPage.tip.perHead')}</span>
          <span className="font-black text-gradient text-[18px]">{fmtMoney(perHead)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── World clock ─────────── */
function WorldClock() {
  const { t } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeIn = (tz) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now);
    } catch { return '—'; }
  };
  const dayIn = (tz) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(now);
    } catch { return ''; }
  };

  return (
    <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-[#0071c2]" />
        </div>
        <h2 className="text-[16px] font-black text-[#1a1a1a]">{t('toolsPage.clock.title')}</h2>
      </div>
      <p className="text-[12px] text-[#9ca3af] mb-4">{t('toolsPage.clock.sub')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
        {CLOCK_CITIES.map(c => (
          <div key={c.city} className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-3 text-center hover:border-[#0071c2]/40 hover:bg-white transition-premium">
            <div className="text-[18px] leading-none mb-1">{c.flag}</div>
            <div className="text-[12px] font-bold text-[#595959]">{c.city}</div>
            <div className="text-[20px] font-black text-gradient leading-tight tabular-nums">{timeIn(c.tz)}</div>
            <div className="text-[10px] text-[#9ca3af]">{dayIn(c.tz)}</div>
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
    <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft lift">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
          <Ruler className="w-5 h-5 text-[#0071c2]" />
        </div>
        <h2 className="text-[16px] font-black text-[#1a1a1a]">{t('toolsPage.units.title')}</h2>
      </div>
      <p className="text-[12px] text-[#9ca3af] mb-4">{t('toolsPage.units.sub')}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {UNIT_CATS.map(u => (
          <button key={u.key} onClick={() => pickCat(u.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-black border transition-premium ${
              cat === u.key ? 'bg-[#003580] text-white border-[#003580] shadow-float' : 'bg-white text-[#595959] border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#003580]'
            }`}>{u.emoji} {t(`toolsPage.units.${u.labelKey}`)}</button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <span className="text-[11px] font-bold text-[#9ca3af] mb-1 block">{fromU}</span>
          <input type="number" value={val}
            onChange={e => setVal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e7e7e7] focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10 outline-none text-[18px] font-black text-[#1a1a1a] transition-premium" />
        </div>
        <button onClick={() => setDir(d => !d)} title={t('toolsPage.units.flipTitle')}
          className="w-10 h-[42px] mt-5 rounded-xl bg-[#003580] text-white flex items-center justify-center hover:bg-[#0071c2] transition-premium active:scale-90 shadow-soft hover:shadow-float">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[11px] font-bold text-[#9ca3af] mb-1 block">{toU}</span>
          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#f0f5ff] to-[#f8f9fa] border-2 border-[#0071c2]/15 text-[18px] font-black text-gradient">
            {result.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Phrasebook ─────────── */
const BCP = { en: 'en-US', tr: 'tr-TR', ar: 'ar-SA', th: 'th-TH', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', es: 'es-ES' };

function Phrasebook() {
  const { t } = useTranslation();
  const [code, setCode] = useState('tr');
  const lang = LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);

  const speak = (text) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP[code] || 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
          <Languages className="w-5 h-5 text-[#0071c2]" />
        </div>
        <h2 className="text-[16px] font-black text-[#1a1a1a]">{t('toolsPage.phrasebook.title')}</h2>
      </div>
      <p className="text-[12px] text-[#9ca3af] mb-4">
        {canSpeak ? t('toolsPage.phrasebook.subWithSpeak') : t('toolsPage.phrasebook.subNoSpeak')}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setCode(l.code)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold border transition-premium ${
              code === l.code ? 'bg-[#003580] text-white border-[#003580] shadow-float' : 'bg-white text-[#595959] border-[#e7e7e7] hover:border-[#0071c2] hover:text-[#003580]'
            }`}>{l.flag} {l.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PHRASE_LABELS.map(p => {
          const entry = lang.phrases[p.key];
          if (!entry) return null;
          return (
            <div key={p.key} className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-3.5 flex items-start gap-2 hover:border-[#0071c2]/40 hover:bg-white hover:shadow-soft transition-premium">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#9ca3af] font-medium mb-0.5">{p.ru}</p>
                <p className="text-[15px] font-black text-[#1a1a1a] leading-tight">{entry[0]}</p>
                <p className="text-[12px] text-[#0071c2] font-semibold italic">[{entry[1]}]</p>
              </div>
              {canSpeak && (
                <button onClick={() => speak(entry[0])} title={t('toolsPage.phrasebook.listen')}
                  className="w-8 h-8 rounded-lg bg-white border border-[#e7e7e7] flex items-center justify-center text-[#0071c2] hover:bg-[#003580] hover:text-white hover:border-[#003580] transition-premium shrink-0 active:scale-90">
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */
export default function Tools() {
  const { t } = useTranslation();
  useSEO({
    title: 'Инструменты путешественника — конвертер валют, чаевые, время',
    description: 'Полезные инструменты для поездки: конвертер валют по актуальному курсу, калькулятор чаевых и мировые часы.',
    keywords: ['конвертер валют', 'калькулятор чаевых', 'мировое время', 'инструменты путешественника'],
  });

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#002250] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none animate-float"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 80% 70%, #f5b942 0%, transparent 38%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px hairline-gold pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5b942] text-[#002250] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <Wrench className="w-3.5 h-3.5" /> {t('toolsPage.hero.badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">
            {t('toolsPage.hero.title1')} <span className="text-gradient-gold">{t('toolsPage.hero.title2')}</span>
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
