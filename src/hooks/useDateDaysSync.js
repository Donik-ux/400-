import { useCallback } from 'react';

/**
 * Helpers for keeping (departure date, return date, days) in sync.
 *
 * Usage:
 *   const { onChangeDeparture, onChangeReturn, onChangeDays, returnDate } =
 *     useDateDaysSync({ departure, days, setDeparture, setReturn, setDays });
 *
 * Returned `returnDate` is the canonical value to display: explicit override if set,
 * otherwise computed from departure + days.
 */
export function useDateDaysSync({ departure, returnDate, days, setDeparture, setReturn, setDays }) {
  const addDays = (iso, n) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    d.setDate(d.getDate() + Number(n || 0));
    return d.toISOString().split('T')[0];
  };

  const diffDays = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e)) return null;
    const ms = e.setHours(0,0,0,0) - s.setHours(0,0,0,0);
    return Math.max(1, Math.round(ms / 86400000) + 1);    // inclusive
  };

  /* Departure changes: keep days fixed, slide return date along */
  const onChangeDeparture = useCallback((iso) => {
    setDeparture?.(iso);
    if (iso && days) setReturn?.(addDays(iso, Math.max(0, Number(days) - 1)));
  }, [days, setDeparture, setReturn]);

  /* Return changes: keep departure fixed, recompute days */
  const onChangeReturn = useCallback((iso) => {
    setReturn?.(iso);
    if (departure && iso) {
      const n = diffDays(departure, iso);
      if (n != null) setDays?.(n);
    }
  }, [departure, setDays, setReturn]);

  /* Days changes: keep departure fixed, recompute return */
  const onChangeDays = useCallback((n) => {
    const clamped = Math.max(1, Math.min(60, Number(n) || 1));
    setDays?.(clamped);
    if (departure) setReturn?.(addDays(departure, Math.max(0, clamped - 1)));
  }, [departure, setDays, setReturn]);

  /* If user has departure + days but no explicit return, compute it for display */
  const computedReturn = returnDate || (departure && days
    ? addDays(departure, Math.max(0, Number(days) - 1))
    : '');

  return {
    onChangeDeparture,
    onChangeReturn,
    onChangeDays,
    returnDate: computedReturn,
  };
}
