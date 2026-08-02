/**
 * Hotel ↔ sightseeing proximity for AI trip plans.
 *
 * The planner asks the model for coordinates on the hotel and on every stop,
 * but the ranking is done here with real haversine math — so the "6 min walk"
 * a traveler reads is computed from the plan's own itinerary, not invented by
 * the model. When coordinates are missing (older saved plans, the template
 * fallback, a refined plan) we degrade to a district match, which still
 * answers "is my hotel in the neighbourhood I'll actually spend my days in".
 */

const EARTH_KM = 6371;
const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in km between two { lat, lng } points. */
export const haversineKm = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(s)));
};

// City streets are never straight lines — add a 1.3× detour factor on top of
// the great-circle distance, walked at a 4.5 km/h city pace.
const DETOUR   = 1.3;
const WALK_KMH = 4.5;

export const walkMinutes = (km) => Math.max(1, Math.round(((km * DETOUR) / WALK_KMH) * 60));

/** ≤ this distance from the hotel counts as "walkable" (~15 min on foot). */
export const WALKABLE_KM = 1.2;

/**
 * Below this distance the model's coordinates are not precise enough to justify
 * a minute count — it tends to pin a hotel onto the landmark it wants to be
 * near, which turns a genuine 400 m walk into a confident "1 min". Anything
 * this close is shown as "right by it" instead of a fabricated figure.
 */
export const SAME_BLOCK_KM = 0.15;

/**
 * A stop worth measuring: the places the trip is actually built around.
 * Flights, transfers and check-ins are not destinations, and meals are picked
 * to sit near whatever is on the schedule that day — counting them would
 * flatter the hotel's location without telling the traveler anything.
 */
const SIGHT_TYPES = new Set(['attraction', 'museum', 'nature', 'shopping', 'leisure']);

/**
 * A stop further than this from the hotel is not part of a walkable city plan
 * (it's a day trip — or a coordinate the model got badly wrong). Excluded from
 * the ranking so one bad point can't distort the summary.
 */
const MAX_CITY_KM = 40;

const validCoord = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng)
  && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180
  && !(p.lat === 0 && p.lng === 0);

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Every unique sightseeing stop in the plan, in itinerary order. */
export const collectStops = (days = []) => {
  const seen = new Set();
  const stops = [];
  for (const d of days) {
    for (const ev of d.events || []) {
      if (!SIGHT_TYPES.has(ev.type)) continue;
      const key = norm(ev.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      stops.push(ev);
    }
  }
  return stops;
};

/**
 * Measure how well the chosen hotel sits relative to the plan's attractions.
 *
 * @returns {null | {
 *   basis: 'coords' | 'district',
 *   nearest: Array<{ name: string, district: string, address: string, km?: number, walkMin?: number }>,
 *   walkableCount: number,
 *   totalStops: number,
 * }}
 */
export const computeHotelProximity = (hotel, days = [], { city = '' } = {}) => {
  const stops = collectStops(days);
  if (!hotel || stops.length === 0) return null;

  if (validCoord(hotel)) {
    const measured = stops
      .filter(validCoord)
      .map((s) => {
        const km = haversineKm(hotel, s);
        return {
          name:     s.name,
          district: s.district || '',
          address:  s.address || '',
          km,
          walkMin:  walkMinutes(km),
        };
      })
      .filter((s) => s.km <= MAX_CITY_KM)
      .sort((a, b) => a.km - b.km);

    // One measured stop proves nothing about the hotel's placement — fall
    // through to the district check instead of showing a one-line "ranking".
    if (measured.length >= 2) {
      return {
        basis:         'coords',
        nearest:       measured.slice(0, 5),
        walkableCount: measured.filter((s) => s.km <= WALKABLE_KM).length,
        totalStops:    measured.length,
      };
    }
  }

  const area = norm(hotel.area);
  const cityKey = norm(city);
  // An "area" that is really just the city name says nothing about where in the
  // city the hotel sits — every stop would match and the count would be
  // theatre. Same for a blank one: report nothing rather than something false.
  if (!area || (cityKey && (area === cityKey || area.includes(cityKey) || cityKey.includes(area)))) {
    return null;
  }

  // Matched on the structured district field only. Addresses end with the city
  // name, so a substring test against them matches everything.
  const inArea = stops.filter((s) => {
    const d = norm(s.district);
    return d && (d.includes(area) || area.includes(d));
  });
  // A single hit is as likely to be coincidence as a signal — and "1 of 12
  // stops in this district" reads as a recommendation when it is the opposite.
  if (inArea.length < 2) return null;

  return {
    basis:         'district',
    nearest:       inArea.slice(0, 5).map((s) => ({
      name:     s.name,
      district: s.district || '',
      address:  s.address || '',
    })),
    walkableCount: inArea.length,
    totalStops:    stops.length,
  };
};

/**
 * Copy coordinates from a previous plan onto a regenerated/refined one by
 * matching place names — the refine prompt drops lat/lng to stay under the
 * prompt-size cap, and the same place always has the same coordinates.
 */
export const reuseCoordsFrom = (sourcePlan, targetPlan) => {
  const byName = new Map();
  const remember = (p) => {
    if (validCoord(p) && p?.name) byName.set(norm(p.name), { lat: p.lat, lng: p.lng });
  };
  remember(sourcePlan?.hotel);
  for (const d of sourcePlan?.days || []) for (const ev of d.events || []) remember(ev);
  if (byName.size === 0) return targetPlan;

  const fill = (p) => {
    if (!p || validCoord(p)) return;
    const hit = byName.get(norm(p.name));
    if (hit) { p.lat = hit.lat; p.lng = hit.lng; }
  };
  fill(targetPlan?.hotel);
  for (const d of targetPlan?.days || []) for (const ev of d.events || []) fill(ev);
  return targetPlan;
};
