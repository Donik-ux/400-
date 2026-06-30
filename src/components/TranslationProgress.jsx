import React, { useState } from 'react';
import { Languages, AlertTriangle, RotateCw } from 'lucide-react';
import useLangStore from '../store/useLangStore';
import { LANG_MAP } from '../i18n/languages';
import { retranslate } from '../i18n/autoTranslate';

/**
 * Thin top progress bar shown while the whole-site AI translation pass runs.
 * Purely informational and non-blocking — the site stays fully usable (English
 * shows until each string is translated, then swaps in live).
 */
export default function TranslationProgress() {
  const progress = useLangStore((s) => s.progress);
  const { running, done, total, lang, error } = progress || {};
  // Track which error string was dismissed so a new error re-shows the banner.
  const [dismissedError, setDismissedError] = useState(null);

  const meta = LANG_MAP[lang];

  // Error state — make a failed translation visible instead of silently English.
  if (error && !running && error !== dismissedError && lang !== 'en') {
    const rateLimited = /429|rate limit|quota|RESOURCE_EXHAUSTED/i.test(error);
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10050] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-red-950/95 border border-red-500/40 shadow-2xl max-w-[90vw] page-fade">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-[12px] font-semibold text-red-100">
          {rateLimited
            ? 'Gemini daily limit reached — partial translation. Try again later or use a paid key.'
            : 'Translation unavailable — showing English.'}
        </span>
        <button
          onClick={() => { setDismissedError(null); retranslate(lang); }}
          className="flex items-center gap-1 text-[12px] font-bold text-white bg-red-500/30 hover:bg-red-500/50 rounded-lg px-2 py-1 transition"
        >
          <RotateCw className="w-3.5 h-3.5" /> Retry
        </button>
        <button
          onClick={() => setDismissedError(error)}
          className="text-red-300 hover:text-white text-[12px] font-bold px-1.5"
        >
          ✕
        </button>
      </div>
    );
  }

  if (!running || !total) return null;

  const pct = Math.min(100, Math.round((done / total) * 100));

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[10050] h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#f5b942] to-[#ffd76e] shadow-[0_0_10px_rgba(245,185,66,0.7)] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Floating chip */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10050] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#012154] border border-white/15 shadow-2xl page-fade pointer-events-none">
        <Languages className="w-4 h-4 text-[#f5b942] animate-pulse" />
        <span className="text-[12px] font-bold text-white">
          {meta?.flag} Translating to {meta?.native || lang}…
        </span>
        <span className="text-[12px] font-black text-[#f5b942] tabular-nums">{pct}%</span>
      </div>
    </>
  );
}
