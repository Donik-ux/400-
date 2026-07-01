// ── World airports dataset for the flight search autocomplete ───────────────
// Each entry: { city, country, code (IATA), label: "City (CODE)" }
// `label` is what gets stored in the form — flightService extracts the IATA
// code from the parentheses, so keep the "City (CODE)" shape.

import { NEIGHBORHOODS } from './neighborhoods';

const RAW = [
  // ── CIS / Central Asia ──────────────────────────────────────────────
  ['Tashkent', 'Uzbekistan', 'TAS'],
  ['Samarkand', 'Uzbekistan', 'SKD'],
  ['Bukhara', 'Uzbekistan', 'BHK'],
  ['Urgench', 'Uzbekistan', 'UGC'],
  ['Namangan', 'Uzbekistan', 'NMA'],
  ['Fergana', 'Uzbekistan', 'FEG'],
  ['Almaty', 'Kazakhstan', 'ALA'],
  ['Astana', 'Kazakhstan', 'NQZ'],
  ['Shymkent', 'Kazakhstan', 'CIT'],
  ['Bishkek', 'Kyrgyzstan', 'FRU'],
  ['Osh', 'Kyrgyzstan', 'OSS'],
  ['Dushanbe', 'Tajikistan', 'DYU'],
  ['Ashgabat', 'Turkmenistan', 'ASB'],
  ['Baku', 'Azerbaijan', 'GYD'],
  ['Tbilisi', 'Georgia', 'TBS'],
  ['Batumi', 'Georgia', 'BUS'],
  ['Yerevan', 'Armenia', 'EVN'],
  ['Moscow', 'Russia', 'MOW'],
  ['Saint Petersburg', 'Russia', 'LED'],
  ['Sochi', 'Russia', 'AER'],
  ['Kazan', 'Russia', 'KZN'],
  ['Novosibirsk', 'Russia', 'OVB'],
  ['Yekaterinburg', 'Russia', 'SVX'],
  ['Kyiv', 'Ukraine', 'IEV'],
  ['Minsk', 'Belarus', 'MSQ'],

  // ── Middle East ─────────────────────────────────────────────────────
  ['Dubai', 'United Arab Emirates', 'DXB'],
  ['Abu Dhabi', 'United Arab Emirates', 'AUH'],
  ['Sharjah', 'United Arab Emirates', 'SHJ'],
  ['Doha', 'Qatar', 'DOH'],
  ['Riyadh', 'Saudi Arabia', 'RUH'],
  ['Jeddah', 'Saudi Arabia', 'JED'],
  ['Medina', 'Saudi Arabia', 'MED'],
  ['Kuwait City', 'Kuwait', 'KWI'],
  ['Manama', 'Bahrain', 'BAH'],
  ['Muscat', 'Oman', 'MCT'],
  ['Amman', 'Jordan', 'AMM'],
  ['Beirut', 'Lebanon', 'BEY'],
  ['Tehran', 'Iran', 'IKA'],
  ['Baghdad', 'Iraq', 'BGW'],
  ['Tel Aviv', 'Israel', 'TLV'],

  // ── Turkey ──────────────────────────────────────────────────────────
  ['Istanbul', 'Turkey', 'IST'],
  ['Istanbul Sabiha', 'Turkey', 'SAW'],
  ['Antalya', 'Turkey', 'AYT'],
  ['Ankara', 'Turkey', 'ESB'],
  ['Izmir', 'Turkey', 'ADB'],
  ['Bodrum', 'Turkey', 'BJV'],
  ['Dalaman', 'Turkey', 'DLM'],
  ['Trabzon', 'Turkey', 'TZX'],

  // ── Europe ──────────────────────────────────────────────────────────
  ['London', 'United Kingdom', 'LON'],
  ['London Heathrow', 'United Kingdom', 'LHR'],
  ['London Gatwick', 'United Kingdom', 'LGW'],
  ['Manchester', 'United Kingdom', 'MAN'],
  ['Edinburgh', 'United Kingdom', 'EDI'],
  ['Paris', 'France', 'CDG'],
  ['Paris Orly', 'France', 'ORY'],
  ['Nice', 'France', 'NCE'],
  ['Lyon', 'France', 'LYS'],
  ['Marseille', 'France', 'MRS'],
  ['Frankfurt', 'Germany', 'FRA'],
  ['Munich', 'Germany', 'MUC'],
  ['Berlin', 'Germany', 'BER'],
  ['Hamburg', 'Germany', 'HAM'],
  ['Dusseldorf', 'Germany', 'DUS'],
  ['Amsterdam', 'Netherlands', 'AMS'],
  ['Brussels', 'Belgium', 'BRU'],
  ['Madrid', 'Spain', 'MAD'],
  ['Barcelona', 'Spain', 'BCN'],
  ['Malaga', 'Spain', 'AGP'],
  ['Palma de Mallorca', 'Spain', 'PMI'],
  ['Valencia', 'Spain', 'VLC'],
  ['Lisbon', 'Portugal', 'LIS'],
  ['Porto', 'Portugal', 'OPO'],
  ['Rome', 'Italy', 'FCO'],
  ['Milan', 'Italy', 'MXP'],
  ['Venice', 'Italy', 'VCE'],
  ['Naples', 'Italy', 'NAP'],
  ['Vienna', 'Austria', 'VIE'],
  ['Zurich', 'Switzerland', 'ZRH'],
  ['Geneva', 'Switzerland', 'GVA'],
  ['Athens', 'Greece', 'ATH'],
  ['Thessaloniki', 'Greece', 'SKG'],
  ['Mykonos', 'Greece', 'JMK'],
  ['Santorini', 'Greece', 'JTR'],
  ['Prague', 'Czechia', 'PRG'],
  ['Budapest', 'Hungary', 'BUD'],
  ['Warsaw', 'Poland', 'WAW'],
  ['Krakow', 'Poland', 'KRK'],
  ['Copenhagen', 'Denmark', 'CPH'],
  ['Stockholm', 'Sweden', 'ARN'],
  ['Oslo', 'Norway', 'OSL'],
  ['Helsinki', 'Finland', 'HEL'],
  ['Dublin', 'Ireland', 'DUB'],
  ['Reykjavik', 'Iceland', 'KEF'],
  ['Bucharest', 'Romania', 'OTP'],
  ['Sofia', 'Bulgaria', 'SOF'],
  ['Belgrade', 'Serbia', 'BEG'],
  ['Zagreb', 'Croatia', 'ZAG'],
  ['Split', 'Croatia', 'SPU'],

  // ── Asia ────────────────────────────────────────────────────────────
  ['Bangkok', 'Thailand', 'BKK'],
  ['Phuket', 'Thailand', 'HKT'],
  ['Chiang Mai', 'Thailand', 'CNX'],
  ['Krabi', 'Thailand', 'KBV'],
  ['Koh Samui', 'Thailand', 'USM'],
  ['Singapore', 'Singapore', 'SIN'],
  ['Kuala Lumpur', 'Malaysia', 'KUL'],
  ['Langkawi', 'Malaysia', 'LGK'],
  ['Bali', 'Indonesia', 'DPS'],
  ['Jakarta', 'Indonesia', 'CGK'],
  ['Manila', 'Philippines', 'MNL'],
  ['Cebu', 'Philippines', 'CEB'],
  ['Hanoi', 'Vietnam', 'HAN'],
  ['Ho Chi Minh City', 'Vietnam', 'SGN'],
  ['Da Nang', 'Vietnam', 'DAD'],
  ['Phnom Penh', 'Cambodia', 'PNH'],
  ['Tokyo', 'Japan', 'NRT'],
  ['Tokyo Haneda', 'Japan', 'HND'],
  ['Osaka', 'Japan', 'KIX'],
  ['Seoul', 'South Korea', 'ICN'],
  ['Beijing', 'China', 'PEK'],
  ['Shanghai', 'China', 'PVG'],
  ['Guangzhou', 'China', 'CAN'],
  ['Hong Kong', 'Hong Kong', 'HKG'],
  ['Taipei', 'Taiwan', 'TPE'],
  ['Delhi', 'India', 'DEL'],
  ['Mumbai', 'India', 'BOM'],
  ['Bengaluru', 'India', 'BLR'],
  ['Goa', 'India', 'GOI'],
  ['Chennai', 'India', 'MAA'],
  ['Hyderabad', 'India', 'HYD'],
  ['Colombo', 'Sri Lanka', 'CMB'],
  ['Male', 'Maldives', 'MLE'],
  ['Kathmandu', 'Nepal', 'KTM'],
  ['Dhaka', 'Bangladesh', 'DAC'],
  ['Karachi', 'Pakistan', 'KHI'],
  ['Lahore', 'Pakistan', 'LHE'],
  ['Islamabad', 'Pakistan', 'ISB'],
  ['Kabul', 'Afghanistan', 'KBL'],

  // ── Africa ──────────────────────────────────────────────────────────
  ['Cairo', 'Egypt', 'CAI'],
  ['Hurghada', 'Egypt', 'HRG'],
  ['Sharm El Sheikh', 'Egypt', 'SSH'],
  ['Casablanca', 'Morocco', 'CMN'],
  ['Marrakech', 'Morocco', 'RAK'],
  ['Tunis', 'Tunisia', 'TUN'],
  ['Nairobi', 'Kenya', 'NBO'],
  ['Zanzibar', 'Tanzania', 'ZNZ'],
  ['Cape Town', 'South Africa', 'CPT'],
  ['Johannesburg', 'South Africa', 'JNB'],
  ['Addis Ababa', 'Ethiopia', 'ADD'],
  ['Lagos', 'Nigeria', 'LOS'],
  ['Mauritius', 'Mauritius', 'MRU'],
  ['Seychelles', 'Seychelles', 'SEZ'],

  // ── Americas ────────────────────────────────────────────────────────
  ['New York', 'United States', 'NYC'],
  ['New York JFK', 'United States', 'JFK'],
  ['Los Angeles', 'United States', 'LAX'],
  ['Miami', 'United States', 'MIA'],
  ['Chicago', 'United States', 'ORD'],
  ['San Francisco', 'United States', 'SFO'],
  ['Las Vegas', 'United States', 'LAS'],
  ['Washington', 'United States', 'IAD'],
  ['Boston', 'United States', 'BOS'],
  ['Toronto', 'Canada', 'YYZ'],
  ['Vancouver', 'Canada', 'YVR'],
  ['Montreal', 'Canada', 'YUL'],
  ['Mexico City', 'Mexico', 'MEX'],
  ['Cancun', 'Mexico', 'CUN'],
  ['Sao Paulo', 'Brazil', 'GRU'],
  ['Rio de Janeiro', 'Brazil', 'GIG'],
  ['Buenos Aires', 'Argentina', 'EZE'],
  ['Lima', 'Peru', 'LIM'],
  ['Bogota', 'Colombia', 'BOG'],
  ['Santiago', 'Chile', 'SCL'],
  ['Havana', 'Cuba', 'HAV'],
  ['Punta Cana', 'Dominican Republic', 'PUJ'],
  ['Ushuaia', 'Argentina', 'USH'],
  ['Antarctica', 'White Continent · via Ushuaia', 'USH'],

  // ── Oceania ─────────────────────────────────────────────────────────
  ['Sydney', 'Australia', 'SYD'],
  ['Melbourne', 'Australia', 'MEL'],
  ['Brisbane', 'Australia', 'BNE'],
  ['Perth', 'Australia', 'PER'],
  ['Auckland', 'New Zealand', 'AKL'],
  ['Nadi', 'Fiji', 'NAN'],
];

export const AIRPORTS = RAW.map(([city, country, code]) => ({
  city,
  country,
  code,
  label: `${city} (${code})`,
}));

// Normalize for accent-insensitive, case-insensitive matching.
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Filter airports by a free-text query (city, country or IATA code).
 * Prefix matches rank above mid-string matches; capped at `limit` results.
 * An empty query returns the first `limit` airports (popular hubs first).
 */
export function searchAirports(query, limit = 8) {
  const q = norm(query).trim();
  if (!q) return AIRPORTS.slice(0, limit);

  const scored = [];
  for (const a of AIRPORTS) {
    const city = norm(a.city);
    const country = norm(a.country);
    const code = norm(a.code);

    let score = -1;
    if (code === q) score = 0;                       // exact code
    else if (city.startsWith(q)) score = 1;          // city prefix
    else if (code.startsWith(q)) score = 2;          // code prefix
    else if (country.startsWith(q)) score = 3;       // country prefix
    else if (city.includes(q)) score = 4;            // city substring
    else if (country.includes(q)) score = 5;         // country substring

    if (score >= 0) scored.push({ a, score });
  }

  scored.sort((x, y) => x.score - y.score || x.a.city.localeCompare(y.a.city));
  return scored.slice(0, limit).map((s) => s.a);
}

/**
 * Like `searchAirports`, but also surfaces curated neighborhood/area results
 * (e.g. typing "Dubai" also matches "Dubai Marina", "Downtown Dubai") for
 * destination-style fields. Cities rank above their own areas; areas from a
 * matching city are capped so they don't crowd out other cities' airports.
 */
export function searchPlaces(query, limit = 8) {
  const q = norm(query).trim();
  if (!q) return AIRPORTS.slice(0, limit);

  const scored = [];
  for (const a of AIRPORTS) {
    const city = norm(a.city);
    const country = norm(a.country);
    const code = norm(a.code);

    let score = -1;
    if (code === q) score = 0;
    else if (city.startsWith(q)) score = 1;
    else if (code.startsWith(q)) score = 2;
    else if (country.startsWith(q)) score = 3;
    else if (city.includes(q)) score = 4;
    else if (country.includes(q)) score = 5;

    if (score >= 0) scored.push({ item: a, score, sort: a.city });
  }

  let areaCount = 0;
  for (const n of NEIGHBORHOODS) {
    if (areaCount >= 4) break; // don't let areas crowd out other cities
    const name = norm(n.name);
    const city = norm(n.city);
    const country = norm(n.country);

    let score = -1;
    if (name.startsWith(q)) score = 1.5;             // area name prefix
    else if (city.startsWith(q)) score = 1.8;         // parent city prefix
    else if (name.includes(q)) score = 4.5;           // area name substring
    else if (city.includes(q)) score = 4.8;
    else if (country.startsWith(q)) score = 3.5;

    if (score >= 0) { scored.push({ item: n, score, sort: n.name }); areaCount += 1; }
  }

  scored.sort((x, y) => x.score - y.score || x.sort.localeCompare(y.sort));
  return scored.slice(0, limit).map((s) => s.item);
}
