const COORDS = {
  'Tashkent':     { lat: 41.2995,  lng: 69.2401 },
  'Samarkand':    { lat: 39.6270,  lng: 66.9750 },
  'Bukhara':      { lat: 39.7681,  lng: 64.4556 },
  'Bishkek':      { lat: 42.8746,  lng: 74.5698 },
  'Almaty':       { lat: 43.2565,  lng: 76.9285 },
  'Astana':       { lat: 51.1694,  lng: 71.4491 },
  'Dubai':        { lat: 25.2048,  lng: 55.2708 },
  'Abu Dhabi':    { lat: 24.4539,  lng: 54.3773 },
  'Istanbul':     { lat: 41.0082,  lng: 28.9784 },
  'Ankara':       { lat: 39.9208,  lng: 32.8541 },
  'Moscow':       { lat: 55.7558,  lng: 37.6173 },
  'London':       { lat: 51.5074,  lng: -0.1278 },
  'Paris':        { lat: 48.8566,  lng: 2.3522 },
  'Berlin':       { lat: 52.5200,  lng: 13.4050 },
  'Rome':         { lat: 41.9028,  lng: 12.4964 },
  'Madrid':       { lat: 40.4168,  lng: -3.7038 },
  'Barcelona':    { lat: 41.3874,  lng: 2.1686 },
  'Tokyo':        { lat: 35.6762,  lng: 139.6503 },
  'Seoul':        { lat: 37.5665,  lng: 126.9780 },
  'Beijing':      { lat: 39.9042,  lng: 116.4074 },
  'Bangkok':      { lat: 13.7563,  lng: 100.5018 },
  'Phuket':       { lat: 7.8804,   lng: 98.3923 },
  'Bali':         { lat: -8.3405,  lng: 115.0920 },
  'Singapore':    { lat: 1.3521,   lng: 103.8198 },
  'Kuala Lumpur': { lat: 3.1390,   lng: 101.6869 },
  'Maldives':     { lat: 3.2028,   lng: 73.2207 },
  'New Delhi':    { lat: 28.6139,  lng: 77.2090 },
  'Mumbai':       { lat: 19.0760,  lng: 72.8777 },
  'Cairo':        { lat: 30.0444,  lng: 31.2357 },
  'Casablanca':   { lat: 33.5731,  lng: -7.5898 },
  'Cape Town':    { lat: -33.9249, lng: 18.4241 },
  'New York':     { lat: 40.7128,  lng: -74.0060 },
  'Los Angeles':  { lat: 34.0522,  lng: -118.2437 },
  'Sydney':       { lat: -33.8688, lng: 151.2093 },
  'Antalya':      { lat: 36.8969,  lng: 30.7133 },
  'Baku':         { lat: 40.4093,  lng: 49.8671 },
  'Tbilisi':      { lat: 41.7151,  lng: 44.8271 },
  'Yerevan':      { lat: 40.1792,  lng: 44.4991 },
  'Milan':        { lat: 45.4642,  lng: 9.1900 },
  'Vienna':       { lat: 48.2082,  lng: 16.3738 },
  'Prague':       { lat: 50.0755,  lng: 14.4378 },
  'Budapest':     { lat: 47.4979,  lng: 19.0402 },
  'Warsaw':       { lat: 52.2297,  lng: 21.0122 },
  'Stockholm':    { lat: 59.3293,  lng: 18.0686 },
  'Oslo':         { lat: 59.9139,  lng: 10.7522 },
  'Helsinki':     { lat: 60.1699,  lng: 24.9384 },
  'Zurich':       { lat: 47.3769,  lng: 8.5417 },
  'Amsterdam':    { lat: 52.3676,  lng: 4.9041 },
  'Brussels':     { lat: 50.8503,  lng: 4.3517 },
  'Seychelles':   { lat: -4.6796,  lng: 55.4920 },
  'Mauritius':    { lat: -20.3484, lng: 57.5522 },
  // South Shetland Islands / northern Antarctic Peninsula — where expedition
  // cruises actually land (Half Moon Island area), not the polar plateau.
  'Antarctica':   { lat: -62.60,   lng: -59.92 },
};

// The flight-search autocomplete (src/data/airports.js, neighborhoods.js)
// stores the *airport/area* name in "City (CODE)" — e.g. "Male City (MLE)" —
// which rarely matches the tourism-style destination names above ("Maldives").
// When the plain-name lookup misses, fall back to the IATA code so weather
// still resolves for the airports behind our own popular routes.
const CODE_ALIASES = {
  DXB: 'Dubai', AUH: 'Abu Dhabi', IST: 'Istanbul', SVO: 'Moscow',
  LHR: 'London', CDG: 'Paris', BER: 'Berlin', FCO: 'Rome', MAD: 'Madrid',
  BCN: 'Barcelona', HND: 'Tokyo', ICN: 'Seoul', PEK: 'Beijing',
  BKK: 'Bangkok', HKT: 'Phuket', DPS: 'Bali', SIN: 'Singapore',
  KUL: 'Kuala Lumpur', MLE: 'Maldives', DEL: 'New Delhi', BOM: 'Mumbai',
  CAI: 'Cairo', CMN: 'Casablanca', CPT: 'Cape Town', JFK: 'New York',
  LAX: 'Los Angeles', SYD: 'Sydney', AYT: 'Antalya', GYD: 'Baku',
  TBS: 'Tbilisi', EVN: 'Yerevan', MXP: 'Milan', VIE: 'Vienna',
  PRG: 'Prague', BUD: 'Budapest', WAW: 'Warsaw', ARN: 'Stockholm',
  OSL: 'Oslo', HEL: 'Helsinki', ZRH: 'Zurich', AMS: 'Amsterdam',
  BRU: 'Brussels', SEZ: 'Seychelles', MRU: 'Mauritius', USH: 'Antarctica',
  TAS: 'Tashkent', SKD: 'Samarkand', BHK: 'Bukhara', FRU: 'Bishkek',
  ALA: 'Almaty', NQZ: 'Astana',
};

export function getCoords(city) {
  if (!city) return null;
  const clean = city.split('(')[0].trim();
  if (COORDS[clean]) return COORDS[clean];

  const codeMatch = /\(([A-Z]{3})\)/.exec(city);
  const alias = codeMatch && CODE_ALIASES[codeMatch[1]];
  return alias ? COORDS[alias] : null;
}

export { COORDS };
