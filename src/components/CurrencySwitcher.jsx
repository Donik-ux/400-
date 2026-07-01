import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins } from 'lucide-react';
import useCurrencyStore, { CURRENCIES } from '../store/useCurrencyStore';

/**
 * Currency picker — USD / EUR / AED / UZS. Prices site-wide are stored in USD
 * and converted for display via <Price> / usePriceFormatter, driven by this store.
 *
 * Props:
 *   align – 'left' | 'right' (panel alignment to the trigger, default 'right')
 *   full  – trigger stretches to full width (mobile menu)
 */
export default function CurrencySwitcher({ align = 'right', full = false }) {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${full ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold text-white/80 hover:text-white hover:bg-white/10 transition-premium border border-white/15 ${full ? 'w-full justify-between' : ''}`}
      >
        <Coins className="w-3.5 h-3.5 shrink-0" />
        <span>{currency}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-48 bg-[#012154] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60] page-fade`}
        >
          {Object.entries(CURRENCIES).map(([code, cfg]) => (
            <button
              key={code}
              onClick={() => { setCurrency(code); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-premium ${
                currency === code ? 'bg-[#f5b942]/15' : 'hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex flex-col">
                <span className={`text-[13px] font-bold ${currency === code ? 'text-[#f5b942]' : 'text-white'}`}>{code}</span>
                <span className="text-[11px] text-white/40">{cfg.label}</span>
              </span>
              {currency === code && <Check className="w-4 h-4 text-[#f5b942] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
