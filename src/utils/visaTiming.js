/**
 * How far ahead a visa has to be applied for.
 *
 * Processing times arrive as free text from the AI visa checker ("3-5 days",
 * "2–8 недель", "up to 6 weeks"), so they have to be parsed rather than read.
 */

/**
 * @param {string} text a human-written processing time
 * @returns {number | null} lead time in days, 0 for instant, null if unparseable
 */
export const leadTimeDays = (text) => {
  const s = String(text || '').toLowerCase();
  if (!s) return null;
  if (/instant|immediate|немедленно|сразу|darhol/.test(s)) return 0;

  const numbers = (s.match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  if (!numbers.length) return null;

  // The UPPER bound of a range: a deadline built on the optimistic end is the
  // one that makes people miss their trip.
  const value = Math.max(...numbers);
  if (/week|недел|hafta/.test(s)) return value * 7;
  if (/month|месяц|oy\b/.test(s)) return value * 30;
  return value;                                   // already days
};

/** Default assumption when nothing usable came back, in days. */
export const DEFAULT_VISA_LEAD_DAYS = 28;
