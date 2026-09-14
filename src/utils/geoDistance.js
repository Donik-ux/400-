/**
 * Sanity-checking AI-supplied coordinates against a known city centre.
 *
 * A "Map" link built from lat/lng (see mapsUrl.js) pins the exact spot with
 * no further lookup, so a hallucinated coordinate — a plausible-looking
 * number for the wrong city, a transposed digit — sends the traveler to the
 * wrong building while the address text right next to it is correct. This
 * gives every AI-generated place a cheap, offline check before its
 * coordinate is trusted for a pin.
 */

const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance between two points, in kilometres. */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * @param {number} lat
 * @param {number} lng
 * @param {{lat:number,lng:number}|null|undefined} center known centre of the
 *   destination city, when one is available (curated table or geocoder).
 * @param {number} maxKm generous enough for a legitimate day-trip excursion,
 *   tight enough to catch a coordinate for the wrong city entirely.
 * @returns {boolean} whether the coordinate is safe to pin on a map
 */
export const plausibleCoord = (lat, lng, center, maxKm = 120) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // (0, 0) is "null island" — the textbook sign of a missing value that got
  // coerced to zero rather than a real place.
  if (lat === 0 && lng === 0) return false;
  // No known centre to check against (a city outside the curated table) —
  // trust the value rather than discard a good pin for lack of a reference.
  if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng)) return true;
  return haversineKm(lat, lng, center.lat, center.lng) <= maxKm;
};
