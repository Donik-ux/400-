import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Coins, Search } from 'lucide-react';
import useCurrencyStore, { POPULAR_CURRENCIES } from '../store/useCurrencyStore';
import { useTranslation } from '../store/useLangStore';
import { currencyFlag, currencyNamer } from '../utils/currencyMeta';

/**
 * Currency picker — every world currency the live FX feed knows (~160),
 * searchable, with a popular quick-pick group on top. Prices site-wide are
 * stored in USD and converted for display via <Price> / usePriceFormatter.
 *
 * Props:
 *   align – 'left' | 'right' (panel alignment to the trigger, default 'right')
 *   full  – trigger stretches to full width (mobile menu)
 */

export default function CurrencySwitcher({ align = 'right', full = false }) {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  const { lang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Localized currency names straight from the browser — no dictionary needed
  const nameFor = useMemo(() => currencyNamer(lang || 'en'), [lang]);

  const allCodes = useMemo(() => Object.keys(rates).sort(), [rates]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return allCodes;
    return allCodes.filter(
      (code) => code.toLowerCase().includes(q) || nameFor(code).toLowerCase().includes(q),
    );
  }, [allCodes, q, nameFor]);

  const popular = q ? [] : POPULAR_CURRENCIES.filter((c) => rates[c]);
  const rest = q ? filtered : filtered.filter((c) => !POPULAR_CURRENCIES.includes(c));

  useEffect(() => {
    if (!open) return undefined;
    // Let the panel mount, then focus the search box
    const focusT = setTimeout(() => searchRef.current?.focus(), 30);
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(focusT);
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Row = ({ code }) => (
    <button
      onClick={() => { setCurrency(code); setOpen(false); }}
      className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left transition-premium ${
        currency === code ? 'bg-[#e6f6f3]' : 'hover:bg-[#f5f7f9]'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-[15px] shrink-0">{currencyFlag(code)}</span>
        <span className="flex flex-col min-w-0">
          <span className={`text-[13px] font-bold ${currency === code ? 'text-[#008f77]' : 'text-[#252a31]'}`}>{code}</span>
          <span className="text-[11px] text-[#697d95] truncate">{nameFor(code)}</span>
        </span>
      </span>
      {currency === code && <Check className="w-4 h-4 text-[#008f77] shrink-0" />}
    </button>
  );

  return (
    <div ref={ref} className={`relative ${full ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => { if (!open) setQuery(''); setOpen((v) => !v); }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold text-[#4a5867] hover:text-[#252a31] hover:bg-[#eef2f5] transition-premium border border-[#dfe7ec] ${full ? 'w-full justify-between' : ''}`}
      >
        <Coins className="w-3.5 h-3.5 shrink-0" />
        <span>{currency}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-72 bg-white border border-[#dfe7ec] rounded-xl shadow-[0_10px_36px_-12px_rgba(16,24,40,0.28)] overflow-hidden z-[60] page-fade`}
        >
          {/* Search across all world currencies */}
          <div className="p-2.5 border-b border-[#e8edf1] bg-[#f5f7f9]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#dfe7ec] focus-within:border-[#0172cb] transition-premium">
              <Search className="w-3.5 h-3.5 text-[#697d95] shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('ui.currency.placeholder')}
                className="w-full bg-transparent outline-none text-[13px] font-semibold text-[#252a31] placeholder:text-[#94a3af]"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {popular.length > 0 && (
              <>
                <div className="px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#008f77]">{t('ui.currency.popular')}</div>
                {popular.map((code) => <Row key={code} code={code} />)}
                <div className="px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#697d95]">{t('ui.currency.all')} · {rest.length}</div>
              </>
            )}
            {rest.map((code) => <Row key={code} code={code} />)}
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[#697d95] font-semibold">{t('ui.currency.nothingFound')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
