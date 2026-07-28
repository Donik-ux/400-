import { askGrok, isGrokAvailable, extractJson as extractJsonFromText } from './grokClient';
import { findCity, hotelPhotoFor } from './cityDatabase';
import { getEmergencyContacts } from './emergencyContacts';
import { getWeatherForDates } from './weatherForecast';
import { LANG_MAP } from '../i18n/languages';

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

/**
 * Small standalone AI call for just the destination info (history + what's
 * on now + nearest real holiday). Used when the full AI plan generation
 * failed or fell back to the template planner — this request is ~10x
 * smaller, so it often still fits under a nearly-exhausted rate limit.
 */
export const fetchCityInfo = async ({ destination, startDate, lang = 'en' } = {}) => {
  if (!isGrokAvailable() || !destination) return null;
  const langName = LANG_MAP[lang]?.target || LANG_MAP[lang]?.name || 'English';
  const startStr = startDate ? new Date(startDate).toDateString() : 'in the near future';
  const prompt = `Return ONLY a JSON object about ${destination} for a trip starting ${startStr}:
{"about": "3-4 real sentences: founding period/age, historical significance, rough number/kind of major attractions", "currentHappenings": "1-2 sentences on what's currently relevant/appealing there right now", "upcomingEvent": {"name": "nearest REAL recurring holiday/festival on or after ${startStr}", "date": "e.g. March 21", "note": "one warm sentence inviting the traveler to arrive a day early for it"}}
Use ONLY real, well-known facts and events with real dates — set "upcomingEvent" to null if you don't know one within ~2 months.${lang !== 'en' ? ` Write ALL text values in ${langName}; keep JSON keys in English.` : ''}`;
  try {
    const raw = await askGrok(prompt, { temperature: 0.4, json: true, maxTokens: 700, timeoutMs: 20000 });
    const parsed = extractJson(raw);
    const rawEvent = parsed?.upcomingEvent;
    const upcomingEvent = (rawEvent && typeof rawEvent === 'object' && rawEvent.name)
      ? { name: rawEvent.name, date: rawEvent.date || '', note: rawEvent.note || '' }
      : null;
    if (!parsed?.about && !parsed?.currentHappenings && !upcomingEvent) return null;
    return { about: parsed?.about || '', currentHappenings: parsed?.currentHappenings || '', upcomingEvent };
  } catch {
    return null;
  }
};

const WEEKDAY_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_LONG   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatDateLong  = (d) => `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// Local-timezone ISO date (toISOString would shift the day near midnight).
const toIsoDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Real Open-Meteo weather for each trip day, keyed by ISO date. Near dates use
 * the live 16-day forecast; farther dates a 3-year climate normal — never an
 * invented number. Returns null when coords are unknown or everything failed.
 */
export const fetchTripWeather = async (destination, startDate, numDays) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (isNaN(start)) return null;
  const isoDates = Array.from({ length: Math.min(numDays, 21) }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return toIsoDate(d);
  });
  try {
    const byDate = await getWeatherForDates(destination, isoDates);
    return Object.values(byDate || {}).some(Boolean) ? byDate : null;
  } catch {
    return null;
  }
};

// Compact real-forecast block for the plan prompt, e.g.
// "2026-08-02: max 24°C, min 15°C, rain 6mm".
const weatherPromptBlock = (weatherByDate) => {
  if (!weatherByDate) return '';
  const lines = Object.entries(weatherByDate)
    .filter(([, w]) => w)
    .map(([date, w]) =>
      `${date}: max ${Math.round(w.tempMax)}°C, min ${Math.round(w.tempMin ?? w.tempMax)}°C, rain ${Math.round(w.precipitation ?? 0)}mm`);
  if (!lines.length) return '';
  return `\nREAL WEATHER FOR THE TRIP DATES (Open-Meteo forecast/climate data — do not contradict it):\n${lines.join('\n')}\nSchedule OUTDOOR sightseeing (parks, viewpoints, walking tours) on the driest and mildest days, and INDOOR activities (museums, galleries, food halls, bazaars under cover) on rainy or extreme-heat (35°C+) days. Mention the adjustment in the day title or transportNote only when it matters.\n`;
};

/* ── Validate & patch AI response so the UI never breaks ── */
const normalizeAiPlan = (parsed, { numDays, dailyBudget, startDate, destination, fromCity, returnCity, purpose, weatherByDate }) => {
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
    let weather = null;
    if (startD) {
      const d = new Date(startD);
      d.setDate(d.getDate() + i);
      if (!isNaN(d)) {
        weekday   = WEEKDAY_LONG[d.getDay()];
        dateLong  = formatDateLong(d);
        dateShort = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        // Real Open-Meteo values only — the model never invents these.
        weather   = weatherByDate?.[toIsoDate(d)] || null;
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
      weather,
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
  const route = fromCity ? `${fromCity} → ${destination} → ${returnCity || fromCity}` : destination;

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

  const rawEvent = parsed?.cityInfo?.upcomingEvent;
  const upcomingEvent = (rawEvent && typeof rawEvent === 'object' && rawEvent.name)
    ? { name: rawEvent.name, date: rawEvent.date || '', note: rawEvent.note || '' }
    : null;
  const cityInfo = (parsed?.cityInfo?.about || parsed?.cityInfo?.currentHappenings || upcomingEvent)
    ? { about: parsed.cityInfo.about || '', currentHappenings: parsed.cityInfo.currentHappenings || '', upcomingEvent }
    : null;

  return {
    header,
    days,
    hotel:               tripHotel,
    cityInfo,
    transportSuggestion: parsed?.transportSuggestion || '',
    travelTips:          Array.isArray(parsed?.travelTips) ? parsed.travelTips.filter(Boolean).slice(0, 6) : [],
    halalFoodGuide:      parsed?.halalFoodGuide || '',
    emergency,
  };
};

export const generateAiItinerary = async ({
  destination = 'Your Destination',
  fromCity = '',
  returnCity = '',
  days = 5,
  budget = 2000,
  startDate,
  style = 'standard',
  budgetStyle,
  interests = [],
  transportMode = 'walking',
  purpose = 'Tourism and cultural exploration',
  lang = 'en',
  apiKey,
  model,
}) => {
  if (budgetStyle) style = budgetStyle;

  // Language the human-readable plan text should be written in.
  const langName = LANG_MAP[lang]?.target || LANG_MAP[lang]?.name || 'English';
  const langBlock = (lang && lang !== 'en')
    ? `
OUTPUT LANGUAGE — VERY IMPORTANT:
Write ALL human-readable text VALUES in ${langName}: every "title", "label", "transportNote", "transportToNext", "halalNote", restaurant "cuisine"/"note", "transportSuggestion", each item of "travelTips", "halalFoodGuide", and "header.purpose".
- Keep ALL JSON keys in English exactly as specified below.
- Keep "type" values in English (flight, transport, hotel, attraction, museum, food, nature, shopping, leisure, rest).
- Keep real place names, hotel names and street addresses in their official local form so map links keep working (you MAY add a ${langName} translation in parentheses after the name).
- Keep prices, currency symbols and times unchanged.
`
    : '';

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
    ? `Route: ${fromCity} → ${destination} → ${returnCity || fromCity}. Day 1 must include departure from ${fromCity} with realistic flight/train duration and cost.${returnCity && returnCity !== fromCity ? ` The trip ends in ${returnCity}: the final day's departure flight goes to ${returnCity}, not back to ${fromCity}.` : ''}`
    : '';

  const startStr = startDate ? new Date(startDate).toDateString() : 'as soon as practical';

  // Real forecast/climate data for the trip dates — rides inside the one plan
  // call (zero extra AI quota) and is re-attached per day after normalization.
  const weatherByDate = await fetchTripWeather(destination, startDate, numDays);
  const weatherBlock = weatherPromptBlock(weatherByDate);

  // Real, verified local spots (see cityDatabase.js `mustInclude`) that the
  // AI must feature rather than inventing its own — e.g. a specific
  // traveller-vetted restaurant we want every itinerary to surface.
  const mustIncludeBlock = (cityData?.mustInclude?.length)
    ? `\nMUST-INCLUDE REAL PLACES — feature EVERY one of these at least once, using the exact name and address given (they are verified, not suggestions to replace):\n${cityData.mustInclude.map(p => `- ${p.name} (${p.type}), ${p.address}${p.note ? ` — ${p.note}` : ''}`).join('\n')}\n`
    : '';

  // Force the top-level "hotel" object onto a specific verified partner
  // property (with its own real photo — see cityDatabase.js `hotelPhoto`)
  // instead of letting the model invent a plausible-but-different one.
  const hotelOverrideBlock = (cityData?.hotelPhoto && cityData.hotels?.[style])
    ? `\nHOTEL OVERRIDE — the top-level "hotel" object MUST use exactly this real hotel (do not invent or substitute a different one): name "${cityData.hotels[style].replace(/\s*\([^)]*\)\s*$/, '')}", address "${cityData.hotelAddress || ''}".\n`
    : '';

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
${langBlock}
Purpose: ${purpose}
Style: ${style} | Total budget: $${totalBdg} (~$${dailyBudget}/day) | Transport mode: ${transportMode}
Budget tier note: ${tierHint}
Start date: ${startStr}
${routeNote}
${transportNote}
Interests: ${interests.join(', ') || 'sightseeing, culture, food, history'}
${mustIncludeBlock}${hotelOverrideBlock}${weatherBlock}
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
5. Include a top-level "hotel" object with: name (real hotel), address (full street + postal), area (district), pricePerNight (local currency — NEVER empty, give a realistic nightly rate or range like "$40–60/night"), stars. The traveler must know exactly where they sleep.
6. EVERY single event MUST include its own price — never omit it. Fields per event: time (HH:MM 24-hour), duration ("1.5 hours"), price in LOCAL currency ("€15", "₺200", "AED 50", "Free"), and type (one of: flight, transport, hotel, attraction, museum, food, nature, shopping, leisure, rest). When the exact price varies, give a realistic range ("$300–500" for flights, "€10–15" for a meal). Only genuinely free things (parks, walks, viewpoints) may say "Free" — flights, hotels, taxis and meals are NEVER "Free".
7. Day 1 = arrival flight from ${fromCity || 'home city'} with a realistic round-trip ticket price range (e.g. "$300–500"), airport transfer to hotel (with real airport name + hotel name + transport cost), hotel check-in (price = the nightly rate), light dinner. Day ${numDays} = packing + transfer to airport + departure flight to ${returnCity || fromCity || 'home city'}.
8. Middle days = 6–8 events each (more places to visit). If special day, add label like "(Shopping Day)", "(Day Trip to X)", "(Free Day)".
9. Respect budget: daily ~$${dailyBudget}, food ~$${mealBudget}/day. Choose ${style}-tier experiences. Every individual event price MUST fit the tier above. Sum of all event prices for a day SHOULD NOT exceed daily budget.
10. Return ONLY a single valid JSON object — no markdown, no code fences, no commentary.
11. Include a top-level "cityInfo" object: "about" is 3-4 sentences of real history — founding period/age (e.g. "founded in the 8th century", "over 2,000 years old"), what the city/place is historically known for, and roughly how many/what kind of major attractions it has. "currentHappenings" is 1-2 sentences on what's currently relevant there right now — the current season's appeal, any recurring festival/event around ${startStr}, or what the city is known for today. Use real, factual information — do not invent fake events or statistics.
12. In "cityInfo" also include "upcomingEvent": the nearest REAL recurring holiday/festival in ${destination} on or after ${startStr} (national holiday, city festival, religious celebration — e.g. Navruz on March 21, a city's annual festival, Independence Day). Fields: "name", "date" (e.g. "March 21" or "late May"), "note" — one warm sentence inviting the traveler to arrive a day early to celebrate it in the city. ONLY use real, well-known recurring events with their real dates; if you don't know any within ~2 months of ${startStr}, set "upcomingEvent" to null instead of inventing one.

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
    "route":   "${fromCity || 'Home'} → ${destination} → ${returnCity || fromCity || 'Home'}",
    "purpose": "${purpose}"
  },
  "cityInfo": {
    "about": "3-4 real sentences: founding period/age, historical significance, rough number/kind of major attractions",
    "currentHappenings": "1-2 sentences on what's currently relevant/appealing there right now",
    "upcomingEvent": { "name": "Real recurring holiday/festival", "date": "March 21", "note": "One sentence inviting the traveler to arrive a day early for it" }
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
          "price": "Local-currency amount or range ('€15', '$300–500'); 'Free' ONLY for genuinely free places",
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

  // Size the completion budget to the trip length — a flat cap either
  // truncates long itineraries mid-JSON or reserves more of the shared
  // 12,000 tokens/minute pool than a short trip actually needs.
  const maxTokens = Math.min(10000, 1200 + numDays * 800);

  let parseErr;
  try {
    const rawText = await askGrok(prompt, { apiKey, model, temperature: 0.7, json: true, maxTokens });
    const parsed = extractJson(rawText);
    const normalized = normalizeAiPlan(parsed, { numDays, dailyBudget, startDate, destination, fromCity, returnCity, purpose, weatherByDate });

    const finalHotel = normalized.hotel || { name: hotelLabel, address: '', area: destination };
    const hotelImage = hotelPhotoFor(cityData, finalHotel.name);
    if (hotelImage) {
      finalHotel.image = hotelImage;
      finalHotel.recommended = true;
      if (cityData?.hotelMapUrl) finalHotel.mapUrl = cityData.hotelMapUrl;
    }
    // The hotel card and PDF read `pricePerNight`; the AI may return `price`
    // or nothing — fall back to the budgeted nightly rate so a price always shows.
    if (!finalHotel.pricePerNight) {
      finalHotel.pricePerNight = finalHotel.price
        || (bd.accommodation ? `~$${Math.round(bd.accommodation / nights)}/night` : '');
    }
    // Flights and hotel check-ins are never free — when the model left them
    // priceless (normalize defaults to "Free"), fill a realistic budget-derived figure.
    const flightRange = bd.flight
      ? `~$${Math.round(bd.flight * 0.8)}–$${Math.round(bd.flight * 1.2)}`
      : '';
    for (const d of normalized.days) {
      for (const ev of d.events || []) {
        if (ev.price && ev.price !== 'Free') continue;
        if (ev.type === 'flight' && flightRange) ev.price = flightRange;
        else if (ev.type === 'hotel' && finalHotel.pricePerNight) ev.price = finalHotel.pricePerNight;
      }
    }

    return {
      header:              normalized.header,
      days:                normalized.days,
      hotel:               finalHotel,
      cityInfo:            normalized.cityInfo,
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

/**
 * Conversational plan refinement: apply one natural-language instruction
 * ("make day 3 cheaper", "swap the museum for a park") to an existing plan.
 * The model returns the full edited plan, which is re-hardened through
 * normalizeAiPlan; curated data (city info, emergency contacts, budget tiles,
 * per-day dates/weather, hotel photo) is re-attached from the original so a
 * refinement can never regress it.
 */
export const refinePlan = async (currentPlan, instruction, { destination = '', lang = 'en' } = {}) => {
  if (!isGrokAvailable()) throw new Error('NO_API_KEY');
  const text = String(instruction || '').trim();
  if (!currentPlan || !Array.isArray(currentPlan.days) || !currentPlan.days.length || !text) {
    throw new Error('BAD_INPUT');
  }

  const langName = LANG_MAP[lang]?.target || LANG_MAP[lang]?.name || 'English';

  // Compact copy — strip images/derived data so the prompt stays under the
  // 16,000-char /api/ai-ask cap even for long trips.
  const compact = {
    header: currentPlan.header || null,
    hotel: currentPlan.hotel ? {
      name:          currentPlan.hotel.name,
      address:       currentPlan.hotel.address,
      area:          currentPlan.hotel.area,
      pricePerNight: currentPlan.hotel.pricePerNight || currentPlan.hotel.price || '',
      stars:         currentPlan.hotel.stars || '',
    } : null,
    days: currentPlan.days.map((d) => ({
      day: d.day, title: d.title, label: d.label || '', place: d.place, cost: d.cost,
      transportNote: d.transportNote || '',
      halalRestaurant: d.halalRestaurant || null,
      events: (d.events || []).map((ev) => ({
        time: ev.time, duration: ev.duration, name: ev.name, address: ev.address,
        district: ev.district || '', price: ev.price, type: ev.type,
        transportToNext: ev.transportToNext || '',
      })),
    })),
  };
  let planJson = JSON.stringify(compact);
  if (planJson.length > 13000) {
    compact.days.forEach((d) => d.events.forEach((ev) => { delete ev.transportToNext; delete ev.district; }));
    planJson = JSON.stringify(compact);
  }

  const prompt = `You are editing a traveler's EXISTING trip plan. Current plan JSON:
${planJson}

Apply ONLY this change requested by the traveler, keeping everything else as close to the original as possible:
"${text}"

Return the FULL updated plan as a single valid JSON object with EXACTLY the same structure and keys ("header", "hotel", "days" — same day and event fields). Every event keeps time (HH:MM), duration, name (real place), address (real street address), price (never empty — realistic local price, range, or "Free" only for genuinely free places) and type. Keep the same number of days.${lang !== 'en' ? ` Write ALL human-readable text values in ${langName}; keep JSON keys and "type" values in English; keep real place names/addresses in their official local form.` : ''} No markdown, no commentary.`;

  const raw = await askGrok(prompt, { json: true, temperature: 0.4, maxTokens: 6000, timeoutMs: 45000 });
  const parsed = extractJson(raw);
  // normalizeAiPlan fabricates placeholder days for any input, so validate the
  // model actually returned an itinerary BEFORE normalizing — otherwise a
  // malformed response would silently wipe the user's plan.
  if (!Array.isArray(parsed?.days) || !parsed.days.length) throw new Error('AI_FAILED');

  const numDays     = currentPlan.days.length;
  const dailyBudget = Math.round((currentPlan.budgetBreakdown?.total || 0) / numDays)
    || Math.round(currentPlan.days.reduce((s, d) => s + (Number(d.cost) || 0), 0) / numDays)
    || 100;
  const normalized = normalizeAiPlan(parsed, {
    numDays, dailyBudget, destination,
    purpose: currentPlan.header?.purpose || 'Tourism and cultural exploration',
  });

  // Re-attach per-day dates and real weather from the original by index —
  // the model must never touch these.
  normalized.days.forEach((d, i) => {
    const orig = currentPlan.days[i];
    if (!orig) return;
    d.weekday  = orig.weekday;
    d.dateLong = orig.dateLong;
    d.date     = orig.date;
    d.weather  = orig.weather ?? null;
  });

  // Hotel: keep curated photo/map/nightly rate whenever the partner hotel is
  // still the stay (or the model dropped fields).
  const cityData = findCity(destination);
  let hotel = normalized.hotel || currentPlan.hotel || null;
  if (hotel) {
    hotel = { ...hotel };
    const img = hotelPhotoFor(cityData, hotel.name);
    if (img) {
      hotel.image = img;
      hotel.recommended = true;
      if (cityData?.hotelMapUrl) hotel.mapUrl = cityData.hotelMapUrl;
    } else if (currentPlan.hotel && hotel.name === currentPlan.hotel.name) {
      hotel = { ...currentPlan.hotel, ...hotel };
    }
    if (!hotel.pricePerNight) {
      hotel.pricePerNight = hotel.price || currentPlan.hotel?.pricePerNight || '';
    }
  }

  return {
    ...currentPlan,               // cityInfo, emergency, budgetBreakdown, source, navApps…
    header: normalized.header || currentPlan.header,
    days:   normalized.days,
    hotel,
    transportSuggestion: normalized.transportSuggestion || currentPlan.transportSuggestion,
    travelTips: normalized.travelTips.length ? normalized.travelTips : currentPlan.travelTips,
    halalFoodGuide: normalized.halalFoodGuide || currentPlan.halalFoodGuide,
  };
};
