import { askGrok, isGrokAvailable, extractJson as extractJsonFromText } from './grokClient';
import { findCity } from './cityDatabase';
import { getEmergencyContacts } from './emergencyContacts';

/* ── Budget distribution ── */
const getBudgetBreakdown = (budget, style) => {
  const pct = {
    luxury:      { flight: 0.18, accommodation: 0.36, food: 0.20, transport: 0.10, activities: 0.07, shopping: 0.09 },
    comfort:     { flight: 0.20, accommodation: 0.34, food: 0.18, transport: 0.09, activities: 0.08, shopping: 0.11 },
    standard:    { flight: 0.22, accommodation: 0.33, food: 0.16, transport: 0.07, activities: 0.08, shopping: 0.14 },
    economy:     { flight: 0.28, accommodation: 0.24, food: 0.20, transport: 0.08, activities: 0.06, shopping: 0.14 },
    budget:      { flight: 0.32, accommodation: 0.20, food: 0.22, transport: 0.10, activities: 0.05, shopping: 0.11 },
    hostel:      { flight: 0.38, accommodation: 0.14, food: 0.24, transport: 0.12, activities: 0.04, shopping: 0.08 },
    minimalist:  { flight: 0.42, accommodation: 0.10, food: 0.26, transport: 0.12, activities: 0.04, shopping: 0.06 },
  }[style] || { flight: 0.22, accommodation: 0.33, food: 0.16, transport: 0.07, activities: 0.08, shopping: 0.14 };

  return {
    flight:        Math.round(budget * pct.flight),
    accommodation: Math.round(budget * pct.accommodation),
    food:          Math.round(budget * pct.food),
    transport:     Math.round(budget * pct.transport),
    dayTrip:       Math.round(budget * 0.02),
    activities:    Math.round(budget * pct.activities),
    shopping:      Math.round(budget * pct.shopping),
    total:         budget,
  };
};

/* ── Nav apps by transport type ── */
export const NAV_APPS = {
  car: [
    { name: 'Yandex Navigator', icon: '🧭', reason: 'Best for CIS countries — real-time traffic, offline maps', link: 'https://yandex.com/maps-app' },
    { name: '2GIS',             icon: '🗺️', reason: 'Excellent offline maps for Central Asia & Russia',      link: 'https://2gis.com' },
    { name: 'Google Maps',      icon: '📍', reason: 'Works worldwide with live traffic & street view',        link: 'https://maps.google.com' },
    { name: 'Waze',             icon: '🚗', reason: 'Community-based traffic alerts & speed cameras',         link: 'https://waze.com' },
  ],
  walking: [
    { name: 'Google Maps',  icon: '📍', reason: 'Step-by-step walking navigation & POI info'   },
    { name: 'Maps.me',      icon: '🗺️', reason: 'Offline walking maps — works without internet' },
    { name: 'Citymapper',   icon: '🚶', reason: 'Best for public transport + walking combo'     },
  ],
  public: [
    { name: 'Google Maps',    icon: '📍', reason: 'Public transit routes & schedules'           },
    { name: 'Citymapper',     icon: '🚌', reason: 'Real-time bus, metro and tram information'   },
    { name: 'Yandex Maps',    icon: '🧭', reason: 'Public transit in CIS cities'                },
  ],
};

export const isAiAvailable = () => isGrokAvailable();
const extractJson = extractJsonFromText;

const WEEKDAY_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_LONG   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatDateLong  = (d) => `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const formatDateShort = (d) => `${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

/* ── Validate & patch AI response so the UI never breaks ── */
const normalizeAiPlan = (parsed, { numDays, dailyBudget, startDate, destination, fromCity, purpose }) => {
  const rawDays = Array.isArray(parsed?.days) ? parsed.days : [];

  const days = [];
  const startD = startDate ? new Date(startDate) : null;
  const lastD  = startD ? new Date(startD) : null;
  if (lastD) lastD.setDate(lastD.getDate() + Math.max(0, numDays - 1));

  for (let i = 0; i < numDays; i++) {
    const src = rawDays[i] || rawDays[rawDays.length - 1] || {};

    let weekday = null;
    let dateLong = null;
    let dateShort = null;
    if (startD) {
      const d = new Date(startD);
      d.setDate(d.getDate() + i);
      if (!isNaN(d)) {
        weekday   = WEEKDAY_LONG[d.getDay()];
        dateLong  = formatDateLong(d);
        dateShort = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
    }

    const events = Array.isArray(src.events) ? src.events.map(ev => {
      const name    = ev.name    || 'Activity';
      // Always guarantee an address so map links work — fall back to "name, destination"
      const rawAddr = (ev.address || '').trim();
      const address = rawAddr || `${name}, ${destination}`;
      return {
        time:      ev.time     || '',
        duration:  ev.duration || '',
        name,
        address,
        district:  ev.district || '',
        price:     ev.price    || 'Free',
        type:      ev.type     || 'attraction',
        halalNote: ev.halalNote || '',
        transportToNext: ev.transportToNext || ev.nextTransport || '',
        lat:       Number(ev.lat) || undefined,
        lng:       Number(ev.lng) || undefined,
      };
    }) : [];

    // Hotel for the day (or trip-wide) — show prominently in UI
    const hotel = src.hotel && typeof src.hotel === 'object'
      ? {
          name:    src.hotel.name    || 'Recommended Hotel',
          address: src.hotel.address || '',
          area:    src.hotel.area    || '',
          price:   src.hotel.price   || src.hotel.pricePerNight || '',
        }
      : null;

    const halal = src.halalRestaurant && typeof src.halalRestaurant === 'object'
      ? {
          name:     src.halalRestaurant.name     || 'Local Halal Restaurant 🥩',
          address:  src.halalRestaurant.address  || 'Ask hotel reception for the nearest halal spot',
          avgPrice: src.halalRestaurant.avgPrice || '~$10–20',
          cuisine:  src.halalRestaurant.cuisine  || 'Local halal',
          note:     src.halalRestaurant.note     || '100% halal, no pork, no alcohol',
        }
      : {
          name:     'Local Halal Restaurant 🥩',
          address:  'Ask hotel reception for the nearest halal spot',
          avgPrice: '~$10–20',
        };

    days.push({
      day:        i + 1,
      weekday,
      dateLong,
      date:       dateShort,
      title:      src.title || `Day ${i + 1} in ${destination}`,
      label:      src.label || src.subtitle || '',
      place:      src.place || destination,
      cost:       Number(src.cost) || dailyBudget,
      transportNote: src.transportNote || '',
      events,
      halalRestaurant: halal,
      hotel,
    });
  }

  // Trip-wide hotel (use the first day's hotel as the canonical stay)
  const tripHotel = parsed?.hotel && typeof parsed.hotel === 'object'
    ? {
        name:    parsed.hotel.name    || 'Recommended Hotel',
        address: parsed.hotel.address || '',
        area:    parsed.hotel.area    || '',
        price:   parsed.hotel.price   || parsed.hotel.pricePerNight || '',
        stars:   parsed.hotel.stars   || '',
      }
    : days.find(d => d.hotel)?.hotel || null;

  /* Header strip — Berlin-style summary */
  const dateRange = startD && lastD
    ? `${MONTH_LONG[startD.getMonth()]} ${startD.getDate()} – ${MONTH_LONG[lastD.getMonth()]} ${lastD.getDate()}, ${lastD.getFullYear()}`
    : `${numDays} days`;
  const route = fromCity ? `${fromCity} → ${destination} → ${fromCity}` : destination;

  const header = parsed?.header && typeof parsed.header === 'object'
    ? {
        title:   parsed.header.title   || `Travel Plan – ${destination}`,
        dates:   parsed.header.dates   || dateRange,
        route:   parsed.header.route   || route,
        purpose: parsed.header.purpose || purpose || 'Tourism and cultural exploration',
      }
    : {
        title:   `Travel Plan – ${destination}`,
        dates:   dateRange,
        route,
        purpose: purpose || 'Tourism and cultural exploration',
      };

  /* Emergency contacts — always populated from our curated DB */
  const emergency = getEmergencyContacts(destination);

  return {
    header,
    days,
    hotel:               tripHotel,
    transportSuggestion: parsed?.transportSuggestion || '',
    travelTips:          Array.isArray(parsed?.travelTips) ? parsed.travelTips.filter(Boolean).slice(0, 6) : [],
    halalFoodGuide:      parsed?.halalFoodGuide || '',
    emergency,
  };
};

export const generateAiItinerary = async ({
  destination = 'Your Destination',
  fromCity = '',
  days = 5,
  budget = 2000,
  startDate,
  style = 'standard',
  budgetStyle,
  interests = [],
  transportMode = 'walking',
  purpose = 'Tourism and cultural exploration',
  apiKey,
  model,
}) => {
  if (budgetStyle) style = budgetStyle;

  if (!isGrokAvailable() && !apiKey) throw new Error('NO_API_KEY');

  const numDays  = Math.max(1, Math.min(21, Number(days) || 5));
  const totalBdg = Number(budget) || 2000;
  const nights   = Math.max(1, numDays - 1);
  const cityData = findCity(destination);

  const hotelLabel = cityData
    ? (cityData.hotels?.[style] ?? cityData.hotels?.standard ?? '4-Star Hotel')
    : (style === 'luxury' ? '5-Star Luxury Hotel' : style === 'economy' ? 'Budget Hotel' : '4-Star Hotel');

  const bd     = getBudgetBreakdown(totalBdg, style);
  bd.nights    = nights;
  bd.hotelName = hotelLabel;

  const dailyBudget    = Math.round(totalBdg / numDays);
  const mealBudget     = Math.round(bd.food / numDays);
  const transportNote  = transportMode === 'car'
    ? 'Traveler has a rental car. Include driving distances/times between places. Note parking where relevant.'
    : transportMode === 'public'
    ? 'Traveler uses public transport (metro, bus, tram). Include transit directions and estimated fares.'
    : 'Traveler is on foot or uses walking + occasional taxi. Keep destinations within walkable clusters.';

  const routeNote = fromCity
    ? `Route: ${fromCity} → ${destination}. Day 1 must include departure from ${fromCity} with realistic flight/train duration and cost.`
    : '';

  const startStr = startDate ? new Date(startDate).toDateString() : 'as soon as practical';

  // Budget tier — drives how expensive entries you suggest
  const tierHint = totalBdg < 800
    ? '⚠️ TIGHT BUDGET. Prefer FREE attractions (parks, viewpoints, plazas, free museums). Street food / canteen meals $3–8. No paid tours over $15.'
    : totalBdg < 1500
    ? 'Medium budget. Mix free attractions with paid museums ($10–18). Local restaurants $10–18 per meal. One paid tour ok.'
    : totalBdg < 3000
    ? 'Comfortable budget. Standard museums $15–25, sit-down restaurants $18–30. Up to 2 paid tours/experiences.'
    : 'Generous budget. Premium museums, fine dining, guided experiences allowed. Day-trips and high-end views fine.';

  const prompt = `
You are an expert halal-conscious travel planner. Generate a realistic, city-specific ${numDays}-day itinerary for ${destination}.
Purpose: ${purpose}
Style: ${style} | Total budget: $${totalBdg} (~$${dailyBudget}/day) | Transport mode: ${transportMode}
Budget tier note: ${tierHint}
Start date: ${startStr}
${routeNote}
${transportNote}
Interests: ${interests.join(', ') || 'sightseeing, culture, food, history'}

CRITICAL RULES — FOLLOW EXACTLY:
1. Every place name MUST be a REAL, named attraction, museum, neighbourhood, market, park, landmark, viewpoint or street in ${destination}. NEVER use placeholders like "City Center" or "Local Restaurant".
2. EVERY event MUST include a real STREET ADDRESS with postal code AND district. Example formats:
   - "Pariser Platz, 10117 Berlin" (district: "Mitte")
   - "Friedrichstraße 43-45, 10117 Berlin" (district: "Kreuzberg")
   - "Sheikh Zayed Rd, Downtown Dubai" (district: "Downtown Dubai")
   Do NOT abbreviate. Do NOT omit postal codes when the country has them.
3. EVERY event MUST include "transportToNext" describing how to reach the NEXT event from THIS one. Examples:
   - "🚶 7 min walk via Unter den Linden"
   - "🚇 U-Bahn U2 from Mohrenstr to Stadtmitte, 4 min"
   - "🚕 Taxi ~12 min, ~€15"
   The LAST event of each day can leave it empty (end of day).
4. ALL food recommendations must be 100% HALAL CERTIFIED real restaurants in ${destination}. Add "🥩 Halal" in the name. Halal restaurant entries also need full address.
5. Include a top-level "hotel" object with: name (real hotel), address (full street + postal), area (district), pricePerNight (local currency), stars. The traveler must know exactly where they sleep.
6. For each event include: time (HH:MM 24-hour), duration ("1.5 hours"), price in LOCAL currency ("€15", "₺200", "AED 50", "Free"), and type (one of: flight, transport, hotel, attraction, museum, food, nature, shopping, leisure, rest).
7. Day 1 = arrival flight from ${fromCity || 'home city'}, airport transfer to hotel (with real airport name + hotel name + transport cost), hotel check-in, light dinner. Day ${numDays} = packing + transfer to airport + departure flight.
8. Middle days = 6–8 events each (more places to visit). If special day, add label like "(Shopping Day)", "(Day Trip to X)", "(Free Day)".
9. Respect budget: daily ~$${dailyBudget}, food ~$${mealBudget}/day. Choose ${style}-tier experiences. Every individual event price MUST fit the tier above. Sum of all event prices for a day SHOULD NOT exceed daily budget.
10. Return ONLY a single valid JSON object — no markdown, no code fences, no commentary.

ADDRESS FORMAT EXAMPLES (use this exact richness):
  - "Pariser Platz, 10117 Berlin" (district: "Mitte")
  - "Friedrichstraße 43-45, 10117 Berlin" (district: "Mitte")
  - "Champ de Mars, 5 Av. Anatole France, 75007 Paris" (district: "7th arrondissement")
  - "Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai" (district: "Downtown")
  - "2-3-1 Asakusa, Taito City, Tokyo 111-0032" (district: "Asakusa")

Return EXACTLY this JSON shape:
{
  "header": {
    "title":   "Travel Plan – ${destination}",
    "dates":   "Month D – Month D, YYYY",
    "route":   "${fromCity || 'Home'} → ${destination} → ${fromCity || 'Home'}",
    "purpose": "${purpose}"
  },
  "hotel": {
    "name":          "Real hotel name in ${destination}",
    "address":       "Full street with postal code",
    "area":          "District / neighbourhood",
    "pricePerNight": "Local-currency amount, e.g. €120",
    "stars":         "3 / 4 / 5"
  },
  "days": [
    {
      "day": 1,
      "title": "Short catchy day title",
      "label": "",
      "place": "Main district of the day",
      "cost": ${dailyBudget},
      "transportNote": "One sentence on the day's transport (e.g. 'BVG day pass €9.50')",
      "events": [
        {
          "time": "09:00",
          "duration": "1.5 hours",
          "name": "Real specific place name",
          "address": "Street name + number, postal code City",
          "district": "Neighbourhood name",
          "price": "Free or local-currency amount",
          "type": "attraction",
          "transportToNext": "🚶 6 min walk via Unter den Linden",
          "halalNote": ""
        }
      ],
      "halalRestaurant": {
        "name": "Real Halal Restaurant 🥩",
        "address": "Street name + number, postal code City",
        "cuisine": "Turkish / Arab / local halal",
        "avgPrice": "~$8–15 per person",
        "note": "100% halal, no pork, no alcohol"
      }
    }
  ],
  "transportSuggestion": "2-3 sentences about getting around ${destination} using ${transportMode}",
  "travelTips": [
    "5 practical tips specific to ${destination}"
  ],
  "halalFoodGuide": "2-3 sentences on finding halal food in ${destination}"
}

Return EXACTLY ${numDays} day objects in "days". Each "events" array should have 5–7 items for middle days, 3–4 for arrival/departure days.
Every event MUST have "address" (real street+postal) and "transportToNext" (except the last event of a day).`;

  let parseErr;
  try {
    const rawText = await askGrok(prompt, { apiKey, model, temperature: 0.7, json: true });
    const parsed = extractJson(rawText);
    const normalized = normalizeAiPlan(parsed, { numDays, dailyBudget, startDate, destination, fromCity, purpose });

    return {
      header:              normalized.header,
      days:                normalized.days,
      hotel:               normalized.hotel || { name: hotelLabel, address: '', area: destination },
      budgetBreakdown:     bd,
      transportSuggestion: normalized.transportSuggestion || (cityData?.transport?.[style] ?? 'Walk where possible; use public transit for longer distances.'),
      travelTips:          normalized.travelTips.length ? normalized.travelTips : (cityData?.tips ?? []),
      halalFoodGuide:      normalized.halalFoodGuide,
      emergency:           normalized.emergency,
      transportMode,
      navApps:             NAV_APPS[transportMode] || NAV_APPS.walking,
      source:              'grok',
    };
  } catch (err) {
    parseErr = err;
  }

  console.error('Grok Planner failed:', parseErr);
  throw new Error('AI_FAILED');
};
