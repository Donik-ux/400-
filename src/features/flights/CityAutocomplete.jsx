import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { searchAirports } from '../../data/airports';

/**
 * City/airport autocomplete for the flight search.
 *
 * Stores the value as "City (CODE)" (what flightService expects). As the user
 * types it shows a styled dropdown of matching airports — by city, country or
 * IATA code — with full mouse + keyboard support.
 *
 * Props:
 *   value     – current string value ("City (CODE)" or free text)
 *   onChange  – (nextValue: string) => void
 *   icon, label, placeholder, className
 */
export default function CityAutocomplete({
  icon, label, placeholder, value, onChange, className = '',
}) {
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listId  = useId();

  // Suggestion list is derived from the current value (no effect needed).
  const results = useMemo(() => searchAirports(value, 8), [value]);

  // Close the dropdown when clicking outside the component.
  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  const choose = (airport) => {
    onChange(airport.label);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      if (results[active]) {
        e.preventDefault();
        choose(results[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <label className="block bg-white border-2 border-[#e7e7e7] hover:border-[#0071c2] focus-within:border-[#0071c2] focus-within:ring-4 focus-within:ring-[#0071c2]/15 focus-within:shadow-soft rounded-xl px-3 py-2.5 transition">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-0.5">
          <span className="text-[#0071c2]">{icon}</span>{label}
        </div>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => { onChange(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent outline-none text-[14px] font-bold text-[#1a1a1a] placeholder:text-[#b0b0b0]"
        />
      </label>

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-auto bg-white border border-[#e7e7e7] rounded-2xl shadow-float z-40 py-1.5 page-fade"
        >
          {results.map((a, i) => (
            <li
              key={a.code}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              // onMouseDown (not onClick) so the selection fires before the
              // input's blur closes the list.
              onMouseDown={(e) => { e.preventDefault(); choose(a); }}
              className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer transition ${
                i === active ? 'bg-[#f0f5ff]' : 'hover:bg-[#f8f9fa]'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-black text-[#1a1a1a] truncate">{a.city}</span>
                <span className="block text-[11px] font-bold text-[#9ca3af] truncate">{a.country}</span>
              </span>
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#003580] text-white text-[11px] font-black tracking-wider">
                {a.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
