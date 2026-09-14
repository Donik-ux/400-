/**
 * "Popular places to visit" list for a trip plan — the destination's most
 * visited attractions, each with its entrance price, shown as one glanceable
 * card above the day-by-day itinerary.
 *
 * Sources, in order of trust:
 *   1. the AI plan's own `mustSee` array (asked for explicitly in the prompt);
 *   2. the curated CITY_ATTRACTIONS table (real addresses + local prices);
 *   3. the itinerary's own sightseeing events, so a plan for a city we have no
 *      table for still gets a list — those are places the plan already prices.
 * Everything is de-duplicated by name and capped so the card stays a card.
 */
import { findCityAttractions } from './cityAttractions';
import { exactPrice } from '../utils/priceText';
import { getCoords } from '../data/coords';
import { plausibleCoord } from '../utils/geoDistance';

const MAX_PLACES = 12;
const SIGHT_TYPES = new Set(['attraction', 'museum', 'nature', 'leisure', 'shopping']);

const nameKey = (s) => String(s || '').toLowerCase().replace(/\s*\([^)]*\)\s*/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const coord = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? undefined : Number(v));

/**
 * Normalise one place from any of the three sources into the card's shape.
 * `center`, when given, is the destination's known city-centre coordinate —
 * a place whose lat/lng lands implausibly far from it (a hallucinated
 * number, or one for the wrong city entirely) has its coordinate dropped so
 * the "Map" link falls back to searching the address text instead of
 * pinning the wrong spot. Passed only for AI-sourced places; the curated
 * table's hand-verified coordinates are trusted as-is.
 */
const cleanPlace = (p, fallbackType = 'attraction', center) => {
  if (!p || typeof p !== 'object') return null;
  const name = String(p.name || '').trim();
  if (!name) return null;
  const rawPrice = p.entryPrice ?? p.price ?? '';
  let lat = coord(p.lat);
  let lng = coord(p.lng);
  if (center && !plausibleCoord(lat, lng, center)) { lat = undefined; lng = undefined; }
  return {
    name,
    address:    String(p.address || '').trim(),
    district:   String(p.district || '').trim(),
    // "Free" stays "Free"; "€10–20" collapses to one figure; '' means "check on site".
    entryPrice: exactPrice(String(rawPrice || '').trim()),
    hours:      String(p.hours || '').trim(),
    why:        String(p.why || p.note || '').trim(),
    type:       p.type || fallbackType,
    lat,
    lng,
  };
};

/**
 * Sanitize an AI-returned mustSee array without inventing anything: a place
 * with no name is dropped, prices are collapsed to one exact figure.
 * @param {object} [center] the destination's known city-centre coordinate,
 *   used to drop an implausible AI-supplied lat/lng (see cleanPlace).
 */
export const normalizeMustSee = (raw, center) => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const p of raw) {
    const c = cleanPlace(p, 'attraction', center);
    if (!c) continue;
    const k = nameKey(c.name);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= MAX_PLACES) break;
  }
  return out;
};

/**
 * Build the final list for a plan. `aiList` (already normalised or raw) comes
 * first; curated attractions and the plan's own sightseeing events top it up
 * so the card never shows fewer than a handful of places when we know any.
 */
export const buildMustSee = ({ destination = '', days = [], aiList = [] } = {}) => {
  // Only used to sanity-check AI-supplied coordinates (see cleanPlace) — a
  // destination outside this curated ~50-city table simply skips the check,
  // there being no cheap synchronous reference to validate against.
  const center = getCoords(destination) || null;
  const seen = new Set();
  const out = [];
  const push = (p) => {
    if (!p || out.length >= MAX_PLACES) return;
    const k = nameKey(p.name);
    if (!k || seen.has(k)) return;
    // Skip hotel check-ins, transfers and meals — the traveler wants sights.
    if (!SIGHT_TYPES.has(p.type)) return;
    seen.add(k);
    out.push(p);
  };

  normalizeMustSee(aiList, center).forEach(push);

  (findCityAttractions(destination) || []).forEach((a) => push(cleanPlace(a)));

  for (const d of Array.isArray(days) ? days : []) {
    for (const ev of d?.events || []) {
      if (!SIGHT_TYPES.has(ev?.type)) continue;
      // Generic template labels ("City Centre walk") are not places to visit.
      if (/\b(walk|stroll|rest|free time|check-?in|check-?out|transfer)\b/i.test(ev.name || '') && !ev.address) continue;
      push(cleanPlace({ ...ev, why: '' }, ev.type, center));
    }
  }
  return out;
};

/** Label for the price chip: the exact price, "Free", or a "check on site" hint. */
export const entryPriceKind = (entryPrice) => {
  const p = String(entryPrice || '').trim();
  if (!p) return 'unknown';
  if (/^\s*free\b/i.test(p)) return 'free';
  return 'paid';
};
