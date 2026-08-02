/**
 * Pick the real hotel that sits closest to the attractions the plan schedules.
 *
 * The AI names a plausible hotel and a plausible nightly rate; neither is
 * checked against anything. This asks Google Hotels (via SerpApi) for actual
 * properties in the district where the itinerary spends its time, then ranks
 * them on distance measured from the plan's own attraction coordinates — the
 * same haversine math the hotel card already shows walking times with.
 *
 * Degrades quietly: no SerpApi key, no coordinates in the plan, or nothing
 * returned for the city all leave the AI's hotel in place.
 */
import { collectStops, haversineKm, computeHotelProximity, WALKABLE_KM } from './hotelProximity';

const validCoord = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng)
  && !(p.lat === 0 && p.lng === 0);

const isoDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
};

/**
 * The district the itinerary actually spends its days in — searching
 * "hotels in Sultanahmet, Istanbul" returns a very different set from
 * "hotels in Istanbul", and it is the first set we want.
 */
export const dominantDistrict = (stops) => {
  const tally = new Map();
  for (const s of stops) {
    const d = String(s.district || '').trim();
    if (!d) continue;
    tally.set(d, (tally.get(d) || 0) + 1);
  }
  if (!tally.size) return '';
  const [best] = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  // One stop in a district is not a centre of gravity.
  return best[1] >= 2 ? best[0] : '';
};

/**
 * Rank candidates against the itinerary. More stops within walking distance
 * wins; ties break on the mean distance, so a hotel in the middle of the
 * cluster beats one on its edge with the same walkable count.
 */
export const rankByProximity = (hotels, stops) => {
  const points = stops.filter(validCoord);
  if (points.length < 2) return [];

  return hotels
    .filter(validCoord)
    .map((h) => {
      const dists = points.map((s) => haversineKm(h, s)).sort((a, b) => a - b);
      // A day trip 30 km out would swamp the mean and punish every city-centre
      // hotel equally — score on the stops the hotel can realistically serve.
      const near = dists.filter((km) => km <= 15);
      const scored = near.length ? near : dists.slice(0, 3);
      return {
        ...h,
        walkableCount: dists.filter((km) => km <= WALKABLE_KM).length,
        meanKm: scored.reduce((sum, km) => sum + km, 0) / scored.length,
        nearestKm: dists[0],
      };
    })
    .sort((a, b) => (b.walkableCount - a.walkableCount) || (a.meanKm - b.meanKm));
};

/**
 * @returns {Promise<null | object>} the best-placed real hotel, carrying the
 *          fields the hotel card renders plus `proximity`.
 */
export const findHotelNearAttractions = async ({
  destination, days = [], startDate, nights = 1, travelers = 2,
  style = 'standard', maxNightly, signal,
} = {}) => {
  const stops = collectStops(days);
  if (stops.filter(validCoord).length < 2) return null;      // nothing to rank against

  const checkInDate = startDate ? isoDate(startDate) : '';
  if (!checkInDate) return null;
  const outDt = new Date(startDate);
  outDt.setDate(outDt.getDate() + Math.max(1, Number(nights) || 1));
  const checkOutDate = isoDate(outDt);

  const district = dominantDistrict(stops);
  const q = district ? `hotels in ${district}, ${destination}` : `hotels in ${destination}`;

  // The budget cap is applied here rather than as SerpApi's `max_price`: that
  // parameter's unit (per night vs per stay) is not documented unambiguously,
  // and guessing wrong would silently return almost nothing. Filtering our own
  // results is predictable, and we can fall back to the full set.
  const params = new URLSearchParams({
    q, checkInDate, checkOutDate,
    adults: String(Math.max(1, Number(travelers) || 2)),
    currency: 'USD',
    style,
  });

  let json;
  try {
    const res = await fetch(`/api/hotelsSerp?${params}`, { signal });
    if (!res.ok) return null;        // 501 = no key, 429 = search quota spent
    json = await res.json();
  } catch {
    return null;
  }

  const all = rankByProximity(json?.hotels || [], stops);
  if (!all.length) return null;

  // Prefer what the trip can afford; if nothing in the district fits, rank the
  // full set anyway and let the price on the card speak for itself — a hotel
  // we hide is worse than one the traveler can see is too expensive.
  const cap = Number(maxNightly) > 0 ? Number(maxNightly) : 0;
  const affordable = cap ? all.filter((h) => !h.nightly || h.nightly <= cap) : all;
  const ranked = affordable.length ? affordable : all;
  const best = ranked[0];

  // Google Hotels gives no street address, so the neighbourhood is derived
  // from the nearest planned stop rather than from the search query — the
  // query district is where we LOOKED, not necessarily where the winner is.
  // A hotel the budget forced out to Taksim must not be labelled Sultanahmet.
  const nearestStop = stops
    .filter(validCoord)
    .map((s) => ({ district: s.district || '', km: haversineKm(best, s) }))
    .sort((a, b) => a.km - b.km)[0];
  const area = (nearestStop && nearestStop.km <= 2 && nearestStop.district)
    ? nearestStop.district
    : destination;

  const hotel = {
    name:          best.name,
    address:       area !== destination ? `${area}, ${destination}` : destination,
    area,
    lat:           best.lat,
    lng:           best.lng,
    stars:         best.hotelClass ? String(best.hotelClass) : '',
    pricePerNight: best.nightlyText || (best.nightly ? `$${best.nightly}/night` : ''),
    nightlyUsd:    best.nightly ?? null,
    rating:        best.rating,
    reviews:       best.reviews,
    image:         best.image || undefined,
    bookLink:      best.link || '',
    nearbyPlaces:  best.nearbyPlaces,
    source:        'serpapi',
    // Recomputed against the full itinerary so the card's badge and the
    // ranking cannot disagree.
    proximity:     computeHotelProximity({ lat: best.lat, lng: best.lng, area }, days, { city: destination }),
    // Drawn from the UNFILTERED ranking: when the budget cap pushed a closer
    // hotel out of contention, the traveler should still see that it exists
    // and what it costs, rather than be quietly handed the affordable one.
    alternatives:  all.filter((h) => h.name !== best.name).slice(0, 3).map((h) => ({
      name: h.name,
      nightly: h.nightlyText || (h.nightly ? `$${h.nightly}/night` : ''),
      walkableCount: h.walkableCount,
      link: h.link || '',
    })),
  };

  return hotel;
};

/**
 * Swap a resolved hotel into a plan, keeping the itinerary coherent: the
 * hotel-typed events name the place the traveler actually sleeps, so leaving
 * them pointing at the model's invented hotel would contradict the card.
 */
export const applyHotelChoice = (plan, hotel) => {
  if (!plan || !hotel || !Array.isArray(plan.days)) return plan;
  const previous = plan.hotel || {};

  // Only the property changes — an event called "Check-in & freshen up" stays
  // exactly that, while "Check-in at Hotel Amira" follows the swap.
  const rename = (name) => {
    const n = String(name || '');
    return (previous.name && n.includes(previous.name)) ? n.replace(previous.name, hotel.name) : n;
  };

  const days = plan.days.map((d) => ({
    ...d,
    events: (d.events || []).map((ev) => (ev.type === 'hotel'
      ? {
          ...ev,
          name:     rename(ev.name),
          address:  hotel.address,
          district: hotel.area,
          lat:      hotel.lat,
          lng:      hotel.lng,
          // Check-out costs nothing; only the check-in row carries the rate.
          price:    /out/i.test(ev.name || '') ? ev.price : (hotel.pricePerNight || ev.price),
        }
      : ev)),
  }));

  return {
    ...plan,
    days,
    hotel: {
      ...hotel,
      // A curated partner photo/map outranks the generic one when the property
      // happens to be the same.
      image:  previous.name === hotel.name ? (previous.image || hotel.image) : hotel.image,
      mapUrl: previous.name === hotel.name ? previous.mapUrl : undefined,
      whyHere: previous.name === hotel.name ? previous.whyHere : '',
    },
  };
};
