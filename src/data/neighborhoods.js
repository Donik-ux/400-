// ── Neighborhood/area-level suggestions for the top searched destinations ───
// Hand-curated (not a live Places API) — deep enough for the cities travelers
// actually search most, e.g. typing "Dubai" surfaces "Dubai Marina", "Downtown
// Dubai", etc. Each area reuses its city's nearest airport IATA code so the
// "(CODE)" contract that flightService.js relies on still holds — selecting an
// area for a flight search resolves to the same real airport as the city.

const RAW = [
  // ── Dubai ───────────────────────────────────────────────────────────
  ['Dubai Marina',       'Dubai', 'United Arab Emirates', 'DXB'],
  ['Downtown Dubai',     'Dubai', 'United Arab Emirates', 'DXB'],
  ['Jumeirah Beach',     'Dubai', 'United Arab Emirates', 'DXB'],
  ['Palm Jumeirah',      'Dubai', 'United Arab Emirates', 'DXB'],
  ['Business Bay',       'Dubai', 'United Arab Emirates', 'DXB'],
  ['Deira',              'Dubai', 'United Arab Emirates', 'DXB'],

  // ── Bali ────────────────────────────────────────────────────────────
  ['Seminyak',   'Bali', 'Indonesia', 'DPS'],
  ['Ubud',       'Bali', 'Indonesia', 'DPS'],
  ['Canggu',     'Bali', 'Indonesia', 'DPS'],
  ['Kuta',       'Bali', 'Indonesia', 'DPS'],
  ['Nusa Dua',   'Bali', 'Indonesia', 'DPS'],
  ['Uluwatu',    'Bali', 'Indonesia', 'DPS'],

  // ── Istanbul ────────────────────────────────────────────────────────
  ['Sultanahmet', 'Istanbul', 'Turkey', 'IST'],
  ['Taksim',      'Istanbul', 'Turkey', 'IST'],
  ['Besiktas',    'Istanbul', 'Turkey', 'IST'],
  ['Kadikoy',     'Istanbul', 'Turkey', 'IST'],
  ['Sisli',       'Istanbul', 'Turkey', 'IST'],

  // ── Tokyo ───────────────────────────────────────────────────────────
  ['Shinjuku',  'Tokyo', 'Japan', 'NRT'],
  ['Shibuya',   'Tokyo', 'Japan', 'NRT'],
  ['Ginza',     'Tokyo', 'Japan', 'NRT'],
  ['Asakusa',   'Tokyo', 'Japan', 'NRT'],
  ['Akihabara', 'Tokyo', 'Japan', 'NRT'],

  // ── Paris ───────────────────────────────────────────────────────────
  ['Le Marais',           'Paris', 'France', 'CDG'],
  ['Champs-Elysees',      'Paris', 'France', 'CDG'],
  ['Montmartre',          'Paris', 'France', 'CDG'],
  ['Saint-Germain-des-Pres', 'Paris', 'France', 'CDG'],
  ['Latin Quarter',       'Paris', 'France', 'CDG'],

  // ── Bangkok ─────────────────────────────────────────────────────────
  ['Sukhumvit',    'Bangkok', 'Thailand', 'BKK'],
  ['Sathorn',      'Bangkok', 'Thailand', 'BKK'],
  ['Khao San Road', 'Bangkok', 'Thailand', 'BKK'],
  ['Siam',         'Bangkok', 'Thailand', 'BKK'],
  ['Thonglor',     'Bangkok', 'Thailand', 'BKK'],

  // ── Barcelona ───────────────────────────────────────────────────────
  ['Gothic Quarter',  'Barcelona', 'Spain', 'BCN'],
  ['Eixample',        'Barcelona', 'Spain', 'BCN'],
  ['El Born',         'Barcelona', 'Spain', 'BCN'],
  ['Barceloneta',     'Barcelona', 'Spain', 'BCN'],
  ['Gracia',          'Barcelona', 'Spain', 'BCN'],

  // ── Maldives ────────────────────────────────────────────────────────
  ['Male City',     'Maldives', 'Maldives', 'MLE'],
  ['North Male Atoll', 'Maldives', 'Maldives', 'MLE'],
  ['South Male Atoll', 'Maldives', 'Maldives', 'MLE'],

  // ── London ──────────────────────────────────────────────────────────
  ['Westminster',    'London', 'United Kingdom', 'LHR'],
  ['Camden',         'London', 'United Kingdom', 'LHR'],
  ['Shoreditch',     'London', 'United Kingdom', 'LHR'],
  ['Kensington',     'London', 'United Kingdom', 'LHR'],
  ['Notting Hill',   'London', 'United Kingdom', 'LHR'],

  // ── Rome ────────────────────────────────────────────────────────────
  ['Trastevere',    'Rome', 'Italy', 'FCO'],
  ['Vatican City',  'Rome', 'Italy', 'FCO'],
  ['Trevi',         'Rome', 'Italy', 'FCO'],
  ['Monti',         'Rome', 'Italy', 'FCO'],

  // ── New York ────────────────────────────────────────────────────────
  ['Manhattan',    'New York', 'United States', 'JFK'],
  ['Brooklyn',     'New York', 'United States', 'JFK'],
  ['Times Square', 'New York', 'United States', 'JFK'],
  ['SoHo',         'New York', 'United States', 'JFK'],

  // ── Singapore ───────────────────────────────────────────────────────
  ['Marina Bay',    'Singapore', 'Singapore', 'SIN'],
  ['Orchard Road',  'Singapore', 'Singapore', 'SIN'],
  ['Sentosa',       'Singapore', 'Singapore', 'SIN'],

  // ── Bishkek (home market) ──────────────────────────────────────────
  ['Ala-Too Square',  'Bishkek', 'Kyrgyzstan', 'FRU'],
  ['Osh Bazaar',      'Bishkek', 'Kyrgyzstan', 'FRU'],
];

export const NEIGHBORHOODS = RAW.map(([name, city, country, code]) => ({
  name,
  city,
  country,
  code,
  isArea: true,
  label: `${name} (${code})`,
}));
