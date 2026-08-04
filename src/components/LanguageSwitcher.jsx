import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import useLangStore, { useTranslation } from '../store/useLangStore';
import { LANGUAGES, LANG_MAP } from '../i18n/languages';

/**
 * Global language picker — flags, native names, and a search box for every
 * supported language (see i18n/languages.js). Used in the navbar (desktop +
 * mobile) and the entry disclaimer modal — all light surfaces, so the trigger
 * and panel are styled light.
 *
 * The dropdown panel is rendered in a portal with fixed positioning so it never
 * gets clipped by `overflow-hidden` containers (e.g. the disclaimer modal).
 *
 * Props:
 *   align    – 'left' | 'right' (panel alignment to the trigger, default 'right')
 *   showName – show the native name next to the flag on the trigger (default true)
 *   full     – trigger stretches to full width (mobile / modal)
 */
const PANEL_WIDTH = 288; // w-72

export default function LanguageSwitcher({ align = 'right', showName = true, full = false }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const current = LANG_MAP[lang] || LANG_MAP.en;

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
    let left = align === 'right' ? r.right - width : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setPos({ top: r.bottom + 8, left, width });
  }, [align]);

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onScroll = () => place();
    const onClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    setTimeout(() => searchRef.current?.focus(), 30);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, place]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q),
    );
  }, [query]);

  const choose = (code) => { setLang(code); setOpen(false); };

  return (
    <div className={`relative ${full ? 'w-full' : ''}`} dir="ltr">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setQuery(''); setOpen((v) => !v); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-bold text-[#4a5867] hover:text-[#252a31] hover:bg-[#eef2f5] transition-premium border border-[#dfe7ec] ${full ? 'w-full justify-between' : ''}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[15px] leading-none">{current.flag}</span>
          {showName && <span className="truncate max-w-[120px]">{current.native}</span>}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          dir="ltr"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width || PANEL_WIDTH }}
          className="bg-white border border-[#dfe7ec] rounded-2xl shadow-[0_10px_36px_-12px_rgba(16,24,40,0.28)] overflow-hidden z-[10001] page-fade"
        >
          <div className="p-2.5 border-b border-[#e8edf1] bg-[#f5f7f9]">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-[#dfe7ec] focus-within:border-[#0172cb] transition-premium">
              <Search className="w-4 h-4 text-[#697d95] shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('ui.language.searchPlaceholder')}
                className="bg-transparent outline-none text-[13px] font-semibold text-[#252a31] placeholder:text-[#94a3af] w-full"
              />
            </div>
          </div>

          <div className="max-h-[min(60vh,360px)] overflow-y-auto py-1.5">
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[#697d95] font-semibold">{t('ui.language.noneFound')}</p>
            )}
            {filtered.map((l) => (
              <button
                key={l.code}
                onClick={() => choose(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-premium ${
                  lang === l.code ? 'bg-[#e6f6f3]' : 'hover:bg-[#f5f7f9]'
                }`}
              >
                <span className="text-[18px] leading-none w-6 text-center">{l.flag}</span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[13px] font-bold truncate ${lang === l.code ? 'text-[#008f77]' : 'text-[#252a31]'}`}>
                    {l.native}
                  </span>
                  <span className="block text-[11px] text-[#697d95] truncate">{l.name}</span>
                </span>
                {lang === l.code && <Check className="w-4 h-4 text-[#008f77] shrink-0" />}
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-[#e8edf1] bg-[#f5f7f9] flex items-center gap-2 text-[10.5px] text-[#697d95] font-black uppercase tracking-wide">
            <Globe className="w-3.5 h-3.5" />
            {LANGUAGES.length} {t('ui.language.countBadge')}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
