import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plane, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/useAdminStore';
import { useTranslation } from '../../store/useLangStore';
import { usePriceFormatter } from '../Price';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const fmt = usePriceFormatter();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef          = useRef(null);
  const navigate          = useNavigate();

  const adminFlights = useAdminStore(s => s.adminFlights);
  const packages     = useAdminStore(s => s.packages);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setQuery(''); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...adminFlights.filter(f => f.available && (
      f.from.toLowerCase().includes(q) || f.to.toLowerCase().includes(q) || f.airline.toLowerCase().includes(q)
    )).slice(0, 5).map(f => ({ type: 'flight', icon: Plane, title: `${f.from} → ${f.to}`, sub: `${f.airline} · ${f.cabin} · ${fmt(f.price)}`, action: () => navigate('/flights') })),
    ...packages.filter(p => p.available && (
      p.name.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
    )).slice(0, 5).map(p => ({ type: 'package', icon: Package, title: p.name, sub: `${p.destination} · ${p.duration} days · ${fmt(p.price)}`, action: () => navigate(`/trip-plan?to=${encodeURIComponent(p.destination)}&days=${p.duration}&balance=${p.price}`) })),
  ];

  const TYPE_COLOR = { flight: 'bg-[#eaf3f4] text-[#2d6a6f]', package: 'bg-[#eef2f5] text-[#007f6d]' };

  const handleSelect = (item) => { item.action(); setOpen(false); setQuery(''); };

  const onInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); handleSelect(results[activeIndex]); }
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => { setQuery(''); setOpen(true); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-white/15 hover:border-[#009882]/40 transition-all text-white/55 text-sm">
        <Search className="w-4 h-4" />
        {/* Full label only on very wide screens — long-locale nav rows need the room */}
        <span className="hidden 2xl:block text-[12px]">{t('ui.search.trigger')}</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e8edf1]">
              <Search className="w-5 h-5 text-[#697d95] shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={onInputKeyDown}
                placeholder={t('ui.search.placeholder')}
                className="flex-1 text-[15px] text-[#252a31] outline-none placeholder:text-[#bac7d1]"
              />
              {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-[#bac7d1]" /></button>}
              <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eef2f5] border border-[#dfe7ec] text-[#bac7d1]">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {q.length < 2 ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 mx-auto mb-3 text-[#dfe7ec]" />
                  <p className="text-[#697d95] text-sm">{t('ui.search.hint')}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[#697d95] text-sm">{t('ui.search.noResults')} "<strong>{query}</strong>"</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all group text-left ${i === activeIndex ? 'bg-[#eef2f5]' : 'hover:bg-[#eef2f5]'}`}>
                        <div className="w-9 h-9 rounded-xl bg-[#f5f7f9] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#4a5867]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#252a31] truncate">{item.title}</p>
                          <p className="text-[11px] text-[#697d95] truncate">{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${TYPE_COLOR[item.type]}`}>
                            {item.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#bac7d1] group-hover:text-[#0172cb] transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#e8edf1] flex items-center gap-4 text-[10px] text-[#bac7d1] font-bold">
              <span>↑↓ {t('ui.search.navigate')}</span>
              <span>↵ {t('ui.search.openHint')}</span>
              <span>ESC {t('ui.search.closeHint')}</span>
              <span className="ml-auto">{results.length} {t('ui.search.resultsLabel')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
