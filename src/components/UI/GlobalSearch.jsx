import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plane, Package, Hotel, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/useAdminStore';
import { useTranslation } from '../../store/useLangStore';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const inputRef          = useRef(null);
  const navigate          = useNavigate();

  const adminFlights = useAdminStore(s => s.adminFlights);
  const packages     = useAdminStore(s => s.packages);
  const hotels       = useAdminStore(s => s.hotels);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const q = query.toLowerCase().trim();

  const results = q.length < 2 ? [] : [
    ...adminFlights.filter(f => f.available && (
      f.from.toLowerCase().includes(q) || f.to.toLowerCase().includes(q) || f.airline.toLowerCase().includes(q)
    )).slice(0, 5).map(f => ({ type: 'flight', icon: Plane, title: `${f.from} → ${f.to}`, sub: `${f.airline} · ${f.cabin} · $${f.price}`, action: () => navigate('/flights') })),
  ];

  const TYPE_COLOR = { flight: 'bg-cyan-100 text-cyan-700' };

  const handleSelect = (item) => { item.action(); setOpen(false); setQuery(''); };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/[0.07] hover:bg-white/15 hover:border-[#f5b942]/40 transition-all text-white/55 text-sm">
        <Search className="w-4 h-4" />
        <span className="hidden sm:block text-[12px]">{t('ui.search.trigger')}</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#f0f0f0]">
              <Search className="w-5 h-5 text-[#9ca3af] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('ui.search.placeholder')}
                className="flex-1 text-[15px] text-[#1a1a1a] outline-none placeholder:text-[#c9d1d9]"
              />
              {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-[#c9d1d9]" /></button>}
              <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f8f9fa] border border-[#e7e7e7] text-[#c9d1d9]">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {q.length < 2 ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 mx-auto mb-3 text-[#e7e7e7]" />
                  <p className="text-[#9ca3af] text-sm">{t('ui.search.hint')}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[#9ca3af] text-sm">{t('ui.search.noResults')} "<strong>{query}</strong>"</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fa] transition-all group text-left">
                        <div className="w-9 h-9 rounded-xl bg-[#f5f5f5] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#595959]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{item.title}</p>
                          <p className="text-[11px] text-[#9ca3af] truncate">{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${TYPE_COLOR[item.type]}`}>
                            {item.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#c9d1d9] group-hover:text-[#0071c2] transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#f0f0f0] flex items-center gap-4 text-[10px] text-[#c9d1d9] font-bold">
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
