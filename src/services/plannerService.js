import { findCity } from './cityDatabase';
import { getSchedulesForCity, genericSchedules } from './citySchedules';
import { getEmergencyContacts } from './emergencyContacts';
import { findCityAttractions, buildArrivalEvents, buildDepartureEvents, buildMiddleDayEvents } from './cityAttractions';

const WEEKDAY_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_LONG   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const formatLong   = (d) => `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

/** Guarantee every event has a non-empty address — so Google Maps links always work. */
const ensureAddress = (events, destination) => {
  return (events || []).map(ev => ({
    ...ev,
    address: ev.address && ev.address.trim()
      ? ev.address
      : (ev.name ? `${ev.name}, ${destination}` : destination),
  }));
};

// ── Duration by event type ─────────────────────────────────────────────────
const DURATION_BY_TYPE = {
  attraction: '1.5–2 hrs',
  museum:     '2–3 hrs',
  food:       '1 hr',
  hotel:      '—',
  transport:  '30–60 min',
  flight:     '—',
  train:      '2–4 hrs',
  nature:     '2 hrs',
  shopping:   '1.5–2 hrs',
  leisure:    '1 hr',
  rest:       '—',
};

// ── Halal restaurants per city ─────────────────────────────────────────────
const HALAL_RESTAURANTS = {
  berlin: [
    { name: 'Baraka Restaurant',         address: 'Lausitzer Platz 6, 10997 Berlin',       avgPrice: '~€12–18' },
    { name: 'Dolci Restaurant',          address: 'Potsdamer Str. 182, 10783 Berlin',       avgPrice: '~€10–16' },
    { name: 'Sahara Lounge',             address: 'Hermannstr. 226, 12049 Berlin',          avgPrice: '~€8–14'  },
    { name: 'Maroush',                   address: 'Adalbertstraße 93, 10999 Berlin',        avgPrice: '~€10–16' },
  ],
  dubai: [
    { name: 'Al Fanar Restaurant',       address: 'Festival City Mall, Dubai',             avgPrice: '~AED 80–120' },
    { name: 'Ravi Restaurant',           address: 'Al Satwa Rd, Dubai',                    avgPrice: '~AED 25–40'  },
    { name: 'Operation Falafel',         address: 'Dubai Marina Walk, Dubai',              avgPrice: '~AED 35–55'  },
    { name: 'Mythos Kouzina',            address: 'Festival City Mall, Dubai',             avgPrice: '~AED 90–140' },
  ],
  istanbul: [
    { name: 'Tarihi Sultanahmet Köftecisi', address: 'Divanyolu Cd. No:12, Fatih, Istanbul', avgPrice: '~₺200–350' },
    { name: 'Hamdi Restaurant',          address: 'Tahmis Cad. Kalçın Sk. 17, Eminönü',   avgPrice: '~₺300–500' },
    { name: 'Hafız Mustafa',             address: 'Hamidiye Cad. 84, Fatih, Istanbul',     avgPrice: '~₺150–280' },
  ],
  paris: [
    { name: 'Chez Hanna',                address: '54 Rue des Rosiers, 75004 Paris',        avgPrice: '~€12–20' },
    { name: 'Le Souk',                   address: '1 Rue Keller, 75011 Paris',              avgPrice: '~€15–25' },
    { name: 'Miznon',                    address: '22 Rue des Écouffes, 75004 Paris',       avgPrice: '~€10–18' },
  ],
  london: [
    { name: 'Dishoom',                   address: '12 Upper St Martin\'s Ln, WC2H 9FB',    avgPrice: '~£15–25' },
    { name: 'Tayyabs',                   address: '83 Fieldgate St, Whitechapel, E1 1JU',  avgPrice: '~£12–20' },
    { name: 'Lahore Kebab House',        address: '2-10 Umberston St, E1 1PY',             avgPrice: '~£10–18' },
  ],
  rome: [
    { name: 'Pizza Al Taglio Rossini',   address: 'Via Rossini 34, 00198 Roma',            avgPrice: '~€8–14'  },
    { name: 'Kebab Roma',                address: 'Via della Croce 31, 00187 Roma',         avgPrice: '~€6–12'  },
  ],
  barcelona: [
    { name: 'Al-Mounia',                 address: 'C/ del Rosselló, 240, 08008 Barcelona', avgPrice: '~€14–22' },
    { name: 'Kebab House Barcelona',     address: 'La Rambla 42, 08002 Barcelona',          avgPrice: '~€8–14'  },
  ],
  tokyo: [
    { name: 'Naritaya Halal Ramen',      address: '2-7-9 Asakusa, Taitō-ku, Tokyo',       avgPrice: '~¥900–1400' },
    { name: 'TOKYO HALAL RESTAURANT',    address: '1-17-7 Kabukicho, Shinjuku, Tokyo',     avgPrice: '~¥1200–2000' },
  ],
  bishkek: [
    { name: 'Arzu Restaurant',           address: 'Chui Ave 114, Bishkek',                 avgPrice: '~400–700 som' },
    { name: 'Navat Restaurant',          address: '136 Moskovskaya St, Bishkek',            avgPrice: '~350–600 som' },
    { name: 'Navigator Coffee & Halal',  address: 'Manas Ave 36, Bishkek',                 avgPrice: '~300–500 som' },
  ],
  almaty: [
    { name: 'Navat Almaty',              address: 'ul. Panfilova 36, Almaty',              avgPrice: '~1500–2500 ₸' },
    { name: 'Shanyrak',                  address: 'ul. Dostyk 87, Almaty',                 avgPrice: '~1200–2000 ₸' },
  ],
  tashkent: [
    { name: 'Caravan Restaurant',        address: 'ul. Yunusabad 2, Tashkent',             avgPrice: '~50 000–90 000 sum' },
    { name: 'Milliy Taomlar',            address: 'ul. Navoi 8, Tashkent',                 avgPrice: '~40 000–70 000 sum' },
  ],
  cairo: [
    { name: 'Abou Tarek 🥩',             address: '16 Champollion St, Downtown Cairo',     avgPrice: '~EGP 60–120'  },
    { name: 'Felfela 🥩',                address: '15 Hoda Shaarawy St, Downtown Cairo',   avgPrice: '~EGP 100–200' },
    { name: 'Kazaz 🥩',                  address: '38 Falaki St, Bab al-Louq',             avgPrice: '~EGP 120–250' },
    { name: 'Naguib Mahfouz 🥩',         address: 'Khan el-Khalili, El-Gamaleya',          avgPrice: '~EGP 250–400' },
  ],
  bangkok: [
    { name: 'Home Cuisine Islamic 🥩',   address: '186 Charoen Krung Soi 36, Bang Rak',    avgPrice: '~฿200–400'    },
    { name: 'Al Hussain 🥩',             address: '77 Soi Phetchaburi 7, Ratchathewi',     avgPrice: '~฿150–300'    },
    { name: 'Sinthorn Steakhouse 🥩',    address: 'Soi 3 Sukhumvit Road, Nana',            avgPrice: '~฿300–500'    },
  ],
  kualalumpur: [
    { name: 'Restoran Nelayan 🥩',       address: 'Titiwangsa Lake Gardens, KL',           avgPrice: '~RM 30–60'    },
    { name: 'Al-Amar Express 🥩',        address: 'Pavilion KL, Bukit Bintang',            avgPrice: '~RM 35–70'    },
    { name: 'Restoran Rebung Dato Chef Ismail 🥩', address: 'Bangsar, KL',                 avgPrice: '~RM 50–90'    },
  ],
  tbilisi: [
    { name: 'Pasanauri 🥩 (halal menu)', address: '20 Pekini Ave, Tbilisi',                avgPrice: '~₾25–45'      },
    { name: 'Samikitno Machakhela 🥩',   address: '12 Beliashvili St, Tbilisi',            avgPrice: '~₾30–50'      },
    { name: 'Shemoikhede Genatsvale 🥩', address: '5 Abashidze St, Tbilisi',               avgPrice: '~₾35–60'      },
  ],
  baku: [
    { name: 'Firuze Restaurant 🥩',      address: 'Kichik Qala 12, Icherisheher, Baku',    avgPrice: '~₼25–45'      },
    { name: 'Sumakh 🥩',                 address: '3 Zərifə Əliyeva St, Baku',             avgPrice: '~₼35–60'      },
    { name: 'Chinar Restaurant 🥩',      address: '1 Ahmad Javad St, Baku',                avgPrice: '~₼50–80'      },
    { name: 'Art Garden Restaurant 🥩',  address: 'Fountain Square, Baku',                 avgPrice: '~₼30–55'      },
  ],
  almaty: [
    { name: 'Navat Almaty 🥩',           address: '36 Panfilov St, Almaty',                avgPrice: '~1500–2500 ₸' },
    { name: 'Shanyrak 🥩',               address: '87 Dostyk Ave, Almaty',                 avgPrice: '~1200–2000 ₸' },
    { name: 'Daredzhani 🥩',             address: '96 Tole Bi St, Almaty',                 avgPrice: '~2500–4500 ₸' },
  ],
  bishkek: [
    { name: 'Arzu Restaurant 🥩',        address: 'Chui Ave 114, Bishkek',                 avgPrice: '~400–700 som' },
    { name: 'Navat Restaurant 🥩',       address: '136 Moskovskaya St, Bishkek',           avgPrice: '~350–600 som' },
    { name: 'Navigator Coffee & Halal 🥩', address: 'Manas Ave 36, Bishkek',               avgPrice: '~300–500 som' },
  ],
  marrakech: [
    { name: 'Nomad 🥩',                  address: '1 Derb Aarjane, Rahba Lakdima, Medina', avgPrice: '~180 MAD'     },
    { name: 'Le Jardin 🥩',              address: '32 Souk Jeld Sidi Abdelaziz, Medina',   avgPrice: '~200 MAD'     },
    { name: 'Café Clock 🥩',             address: '224 Derb Chtouka, Kasbah',              avgPrice: '~150 MAD'     },
    { name: 'Dar Yacout 🥩',             address: '79 Sidi Ahmed Soussi, Medina',          avgPrice: '~500 MAD'     },
  ],
  seoul: [
    { name: 'Eid Halal Korean 🥩',       address: '119 Usadan-ro, Itaewon, Yongsan-gu',    avgPrice: '~₩18 000–28 000' },
    { name: 'Yang Good 🥩',              address: '168 Itaewon-ro, Yongsan-gu',            avgPrice: '~₩20 000–30 000' },
    { name: 'Busan Jib (halal-friendly) 🥩', address: '187 Itaewon-ro, Yongsan-gu',        avgPrice: '~₩15 000–25 000' },
  ],
  doha: [
    { name: 'Parisa Souq Waqif 🥩',      address: 'Souq Waqif, Doha (Persian)',            avgPrice: '~QR 100–180'  },
    { name: 'Al Mourjan 🥩',             address: 'Corniche St, Doha (Lebanese)',          avgPrice: '~QR 120–200'  },
    { name: 'Mamig 🥩',                  address: 'The Pearl-Qatar (Armenian-Lebanese)',    avgPrice: '~QR 140–220'  },
  ],
  _default: [
    { name: 'Local Halal Restaurant',    address: 'Ask hotel reception for the nearest halal dining', avgPrice: '~$10–20' },
    { name: 'Halal Street Food Market',  address: 'City center food district',             avgPrice: '~$5–12'  },
  ],
};

// Country / alt-name → halal-key aliases (mirrors citySchedules aliases)
const HALAL_ALIASES = {
  egypt: 'cairo', каир: 'cairo', египет: 'cairo',
  thailand: 'bangkok', бангкок: 'bangkok', таиланд: 'bangkok', тайланд: 'bangkok',
  malaysia: 'kualalumpur', 'kuala lumpur': 'kualalumpur', куалалумпур: 'kualalumpur', малайзия: 'kualalumpur',
  georgia: 'tbilisi', тбилиси: 'tbilisi', грузия: 'tbilisi',
  azerbaijan: 'baku', баку: 'baku', азербайджан: 'baku',
  kazakhstan: 'almaty', алматы: 'almaty', алмата: 'almaty', казахстан: 'almaty',
  kyrgyzstan: 'bishkek', бишкек: 'bishkek', киргизия: 'bishkek', кыргызстан: 'bishkek',
  morocco: 'marrakech', марракеш: 'marrakech', маракеш: 'marrakech', марокко: 'marrakech',
  korea: 'seoul', 'south korea': 'seoul', сеул: 'seoul', корея: 'seoul',
  qatar: 'doha', доха: 'doha', катар: 'doha',
  uae: 'dubai', emirates: 'dubai', дубай: 'dubai', оаэ: 'dubai',
  turkey: 'istanbul', стамбул: 'istanbul', турция: 'istanbul',
  germany: 'berlin', берлин: 'berlin', германия: 'berlin',
  france: 'paris', париж: 'paris', франция: 'paris',
  england: 'london', uk: 'london', лондон: 'london', англия: 'london',
  italy: 'rome', рим: 'rome', италия: 'rome',
  spain: 'barcelona', барселона: 'barcelona', испания: 'barcelona',
  japan: 'tokyo', токио: 'tokyo', япония: 'tokyo',
  uzbekistan: 'tashkent', ташкент: 'tashkent', узбекистан: 'tashkent',
};

function getHalalRestaurants(destination) {
  const key = destination.toLowerCase().trim();
  const normalized = key.replace(/\s+/g, '');

  // Direct city-key match
  for (const city of Object.keys(HALAL_RESTAURANTS)) {
    if (city !== '_default' && (normalized.includes(city) || key.includes(city))) {
      return HALAL_RESTAURANTS[city];
    }
  }

  // Country / alt-name alias match
  for (const [alias, cityKey] of Object.entries(HALAL_ALIASES)) {
    const a = alias.replace(/\s+/g, '');
    if (normalized.includes(a) || a.includes(normalized) || key.includes(alias)) {
      return HALAL_RESTAURANTS[cityKey] || HALAL_RESTAURANTS._default;
    }
  }

  return HALAL_RESTAURANTS._default;
}

function addDurations(events) {
  return events.map((ev, i, arr) => ({
    ...ev,
    duration: ev.duration || DURATION_BY_TYPE[ev.type] || '1 hr',
    // Synthetic transport-to-next hint so the UI shows movement between stops
    transportToNext:
      ev.transportToNext ||
      (i === arr.length - 1
        ? ''
        : ev.type === 'flight'    ? '✈️ Airport transfer to next stop'
        : ev.type === 'transport' ? '➡️ Continue to the next stop'
        : ev.type === 'food'      ? '🚶 5–10 min walk to next stop'
        : ev.type === 'shopping'  ? '🚕 Short taxi (~10 min) to next stop'
        : '🚶 10–15 min walk or local transit to next stop'),
  }));
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const transportFallback = {
  luxury:   'Private chauffeur service with luxury vehicles for all transfers and daily excursions.',
  standard: 'Comfortable mix of taxis, rideshare apps, and local metro for easy city navigation.',
  economy:  'Public transport (metro, tram, bus) and walking routes — authentic and budget-friendly.',
};

const tipsFallback = {
  luxury: [
    'Pre-book airport private transfers to guarantee seamless arrivals.',
    'Request late checkout — concierge can often arrange it at no extra cost.',
    'Secure hard-to-get restaurant reservations via the hotel concierge.',
    'Use a private guide for cultural sites for a crowd-free experience.',
  ],
  standard: [
    'Download offline maps (Google Maps / Maps.me) to save on roaming.',
    'Get a city transport card for discounted metro and bus fares.',
    'Book popular restaurants at least 2 days ahead.',
    'Mix paid attractions with free local experiences for the best value.',
  ],
  economy: [
    'Travel during off-peak hours to dodge tourist premiums.',
    'Use free walking tours available in most major cities — tip-based only.',
    'Eat where locals eat — a few streets from tourist squares means better food & lower prices.',
    'Pack light to avoid excess baggage fees on budget carriers.',
  ],
};

const universalTips = [
  'Keep digital copies of your passport and travel insurance in a cloud folder.',
  'Notify your bank of travel dates to prevent card blocks abroad.',
];

// ── Main export ────────────────────────────────────────────────────────────────
export const generateItinerary = async ({
  destination   = 'Your Destination',
  fromCity      = '',
  days          = 5,
  budget        = 2000,
  startDate,
  style         = 'standard',
  budgetStyle,
  interests     = [],
  transportMode = 'walking',
  purpose       = 'Tourism and cultural exploration',
}) => {
  // budgetStyle overrides style
  if (budgetStyle) style = budgetStyle;

  // Simulate AI-like response delay for a smoother experience
  await new Promise((r) => setTimeout(r, 1200));

  const cityData    = findCity(destination);
  const totalBudget = Number(budget) || 2000;
  const numDays     = Number(days)   || 5;

  // Budget breakdown percentages by style
  const pct = {
    luxury: {
      flight: 0.18, accommodation: 0.36, food: 0.20,
      transport: 0.10, dayTrip: 0.03, activities: 0.07, shopping: 0.06,
    },
    comfort: {
      flight: 0.20, accommodation: 0.34, food: 0.18,
      transport: 0.09, dayTrip: 0.03, activities: 0.05, shopping: 0.11,
    },
    standard: {
      flight: 0.22, accommodation: 0.33, food: 0.16,
      transport: 0.07, dayTrip: 0.03, activities: 0.05, shopping: 0.14,
    },
    economy: {
      flight: 0.28, accommodation: 0.24, food: 0.20,
      transport: 0.08, dayTrip: 0.02, activities: 0.04, shopping: 0.14,
    },
    budget: {
      flight: 0.32, accommodation: 0.20, food: 0.22,
      transport: 0.10, dayTrip: 0.01, activities: 0.04, shopping: 0.11,
    },
    hostel: {
      flight: 0.38, accommodation: 0.14, food: 0.24,
      transport: 0.12, dayTrip: 0.01, activities: 0.03, shopping: 0.08,
    },
    minimalist: {
      flight: 0.42, accommodation: 0.10, food: 0.26,
      transport: 0.12, dayTrip: 0.01, activities: 0.03, shopping: 0.06,
    },
  }[style] ?? {
    flight: 0.22, accommodation: 0.33, food: 0.16,
    transport: 0.07, dayTrip: 0.03, activities: 0.05, shopping: 0.14,
  };

  const nights = Math.max(1, numDays - 1);
  const hotelLabel = cityData
    ? (cityData.hotels?.[style] ?? cityData.hotels?.economy ?? cityData.hotels?.standard ?? 'Budget Hotel')
    : ({
        luxury:     '5-Star Luxury Hotel',
        comfort:    '4-Star Comfort Hotel',
        standard:   '4-Star City Hotel',
        economy:    'Budget Hotel',
        budget:     'Economy Guesthouse',
        hostel:     'Hostel / Dormitory',
        minimalist: 'Capsule Hotel / Couch',
      }[style] || 'Budget Hotel');

  const budgetBreakdown = {
    flight:        Math.round(totalBudget * pct.flight),
    accommodation: Math.round(totalBudget * pct.accommodation),
    food:          Math.round(totalBudget * pct.food),
    transport:     Math.round(totalBudget * pct.transport),
    dayTrip:       Math.round(totalBudget * pct.dayTrip),
    activities:    Math.round(totalBudget * pct.activities),
    shopping:      Math.round(totalBudget * pct.shopping),
    total:         totalBudget,
    nights,
    hotelName: hotelLabel,
  };

  // ── Schedule-based day building ───────────────────────────────────────────
  const schedules = getSchedulesForCity(destination);
  const isGeneric = schedules === genericSchedules;

  // Curated attraction list (used when no full schedule exists for the city)
  const curatedAttractions = isGeneric ? findCityAttractions(destination) : null;

  // When we fall back to generic templates, splice the destination name into
  // place labels so the UI never shows a literal "City Centre" for e.g. Cairo.
  const localize = (template) => {
    if (!isGeneric || !template) return template;
    const replaceCity = (s) =>
      typeof s === 'string'
        ? s
            .replace(/\bCity Centre\b/g, `${destination} — City Centre`)
            .replace(/\bCity Parks & Surroundings\b/g, `${destination} — Parks & Surroundings`)
            .replace(/\bCultural District\b/g, `${destination} — Cultural District`)
            .replace(/\bShopping District\b/g, `${destination} — Shopping District`)
            .replace(/\bCity Neighbourhood Walk\b/g, `${destination} — Neighbourhood Walk`)
            .replace(/\bAirport → City Centre\b/g, `Airport → ${destination} Centre`)
            .replace(/\bCity → Airport\b/g, `${destination} → Airport`)
        : s;
    return {
      ...template,
      place: replaceCity(template.place),
      title: replaceCity(template.title),
      events: (template.events || []).map(ev => ({
        ...ev,
        name: replaceCity(ev.name),
      })),
    };
  };

  const arrivalTemplate   = localize(schedules.find(s => s.tags.includes('arrival'))   || genericSchedules.find(s => s.tags.includes('arrival')));
  const departureTemplate = localize(schedules.find(s => s.tags.includes('departure')) || genericSchedules.find(s => s.tags.includes('departure')));
  const middleTemplates   = schedules.filter(s => !s.tags.includes('arrival') && !s.tags.includes('departure')).map(localize);

  // Interest tag matching — score templates by how many interest tags they match
  const scoreTemplate = (template) => {
    if (!interests || interests.length === 0) return 0;
    return template.tags.filter(tag => interests.includes(tag)).length;
  };

  // Sort middle templates: matched interests first, then others
  const sortedMiddle = [...middleTemplates].sort((a, b) => scoreTemplate(b) - scoreTemplate(a));

  const itineraryDays = Array.from({ length: numDays }, (_, i) => {
    const dayBudget = Math.round((totalBudget / numDays) * (0.8 + Math.random() * 0.4));

    let dateLabel = null;
    let weekday = null;
    let dateLong = null;
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (!isNaN(d)) {
        dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        weekday   = WEEKDAY_LONG[d.getDay()];
        dateLong  = formatLong(d);
      }
    }

    let template;
    let synthesizedEvents = null;
    if (i === 0) {
      template = arrivalTemplate;
      // When we're using the generic fallback, build a properly addressed arrival day instead
      if (isGeneric) synthesizedEvents = buildArrivalEvents(destination, fromCity, style);
    } else if (i === numDays - 1) {
      template = departureTemplate;
      if (isGeneric) synthesizedEvents = buildDepartureEvents(destination, fromCity);
    } else {
      const idx = (i - 1) % (sortedMiddle.length || 1);
      template = sortedMiddle[idx] || middleTemplates[0] || genericSchedules[1];
      if (isGeneric) synthesizedEvents = buildMiddleDayEvents(destination, curatedAttractions, i - 1, style);
    }

    const halalList = getHalalRestaurants(destination);
    const halalRestaurant = halalList[i % halalList.length];

    const events = synthesizedEvents ?? template?.events ?? [];

    return {
      day:             i + 1,
      date:            dateLabel,
      weekday,
      dateLong,
      place:           template?.place  ?? destination,
      title:           template?.title  ?? (synthesizedEvents
                          ? (i === 0 ? `Arrival in ${destination}` :
                             i === numDays - 1 ? `Departure from ${destination}` :
                             `Day ${i + 1} in ${destination}`)
                          : `Day ${i + 1}`),
      label:           '',
      events:          ensureAddress(addDurations(events), destination),
      cost:            dayBudget,
      halalRestaurant,
    };
  });

  const transportSuggestion = cityData?.transport?.[style] ?? transportFallback[style];

  const travelTips = [
    ...(cityData?.tips ?? tipsFallback[style] ?? []),
    ...universalTips,
  ].slice(0, 5);

  /* Berlin-style header */
  const startD = startDate ? new Date(startDate) : null;
  const lastD  = startD ? new Date(startD) : null;
  if (lastD) lastD.setDate(lastD.getDate() + Math.max(0, numDays - 1));
  const dateRange = startD && lastD
    ? `${MONTH_LONG[startD.getMonth()]} ${startD.getDate()} – ${MONTH_LONG[lastD.getMonth()]} ${lastD.getDate()}, ${lastD.getFullYear()}`
    : `${numDays} days`;
  const route = fromCity ? `${fromCity} → ${destination} → ${fromCity}` : destination;
  const header = {
    title:   `Travel Plan – ${destination}`,
    dates:   dateRange,
    route,
    purpose,
  };

  return {
    header,
    days: itineraryDays,
    hotel: {
      name:    hotelLabel,
      address: cityData?.hotelAddress || `${destination} city centre — confirmed at booking`,
      area:    cityData?.area || destination,
      pricePerNight: budgetBreakdown.accommodation && nights ? `~$${Math.round(budgetBreakdown.accommodation / nights)}/night` : '',
      stars:   style === 'luxury' ? '5' : style === 'comfort' ? '4' : style === 'economy' ? '3' : '',
    },
    budgetBreakdown,
    transportSuggestion,
    travelTips,
    transportMode,
    emergency: getEmergencyContacts(destination),
  };
};
