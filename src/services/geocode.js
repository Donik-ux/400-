/**
 * Coordinates for any city the traveler can type, not just the fifty in
 * src/data/coords.js.
 *
 * Everything that puts a place on screen — the route map, the weather widget,
 * the date recommender — used to gate on that hand-written table. The search
 * offers 244 cities across 153 countries, so a plan to Accra or Lima simply
 * lost its map and its weather with no explanation. This resolves the rest
 * through Open-Meteo's geocoding API: free, no key, and the same provider
 * already serving the forecasts, so it adds no new dependency.
 *
 * Order of resolution, cheapest first:
 *   1. the curated table   — instant, no network, covers the common routes
 *   2. localStorage        — instant after the first visit
 *   3. Open-Meteo          — one request per city, ever
 *
 * A city that genuinely cannot be resolved caches as a miss too, so a typo
 * does not re-query on every render.
 */
import { getCoords } from '../data/coords';

const API = (name) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;

const STORE_KEY = 'maf_geocode_v1';
const MAX_CACHED = 400;          // keep localStorage small; cities are ~80 bytes each

/** "Dubai (DXB)" and " dubai " are the same lookup. */
const normalize = (city) => String(city || '').split('(')[0].trim().toLowerCase();

const memory = new Map();        // normalized name -> {lat,lng,country} | null
const inFlight = new Map();      // normalized name -> Promise

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch { return {}; }
};

const writeStore = (key, value) => {
  try {
    const store = readStore();
    // Cheapest possible eviction: past the cap, start over. The table is a
    // convenience, and refilling it costs one request per city again.
    if (Object.keys(store).length >= MAX_CACHED) {
      localStorage.setItem(STORE_KEY, JSON.stringify({ [key]: value }));
      return;
    }
    store[key] = value;
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* private mode or quota: the in-memory cache still works */ }
};

/**
 * @param {string} city  free text — "Accra", "Dubai (DXB)", "New York"
 * @returns {Promise<{lat:number,lng:number,country?:string}|null>}
 */
export async function resolveCoords(city) {
  const key = normalize(city);
  if (!key) return null;

  // 1. Curated table — also the authority when it disagrees with the geocoder,
  //    since these are the routes the site actually sells.
  const curated = getCoords(city);
  if (curated) return curated;

  if (memory.has(key)) return memory.get(key);

  const stored = readStore();
  if (Object.prototype.hasOwnProperty.call(stored, key)) {
    memory.set(key, stored[key]);
    return stored[key];
  }

  // 3. One request per city, shared by every caller that asks while it is open.
  if (inFlight.has(key)) return inFlight.get(key);

  const request = (async () => {
    let result = null;
    try {
      const res = await fetch(API(key));
      const data = res.ok ? await res.json() : null;
      const hit = data?.results?.[0];
      if (hit && Number.isFinite(hit.latitude) && Number.isFinite(hit.longitude)) {
        result = { lat: hit.latitude, lng: hit.longitude, country: hit.country || '' };
      }
    } catch {
      // Network failure is not a miss — a later render should retry rather
      // than cache "this city does not exist".
      inFlight.delete(key);
      return null;
    }
    memory.set(key, result);
    writeStore(key, result);
    inFlight.delete(key);
    return result;
  })();

  inFlight.set(key, request);
  return request;
}

/** Resolve several cities at once, preserving order; unresolved come back null. */
export const resolveMany = (cities = []) => Promise.all(cities.map(resolveCoords));

/** Synchronous best-effort, for code paths that cannot await (already-cached only). */
export const peekCoords = (city) => {
  const curated = getCoords(city);
  if (curated) return curated;
  const key = normalize(city);
  if (memory.has(key)) return memory.get(key);
  const stored = readStore();
  return Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : null;
};
