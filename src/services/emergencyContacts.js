/**
 * Curated emergency-contact directory.
 * Sources: gov.uk Foreign Travel Advice, US State Dept, WHO, country tourist boards.
 * Updated for the 2026 travel season. Verify before relying on critical situations.
 */

/* ── Universal fallback numbers — added to any country entry that has fewer than 4 ── */
const UNIVERSAL_BACKUP = [
  { service: 'International SOS',      number: '+44 20 8762 8008', icon: '🆘', note: 'Worldwide medical assistance' },
  { service: 'Your Embassy Hotline',   number: '—', icon: '🏛️', note: 'Save before you travel' },
  { service: 'Visa / MC Lost Card',    number: '+1 410 581 9994', icon: '💳', note: 'Reverse-charge from anywhere' },
];

const SAFE_BLANK = (country, flag) => ({
  country, flag,
  numbers: [
    { service: 'General Emergency (EU)', number: '112',  icon: '🚨', note: 'Pan-European emergency line' },
    { service: 'International SOS',      number: '+44 20 8762 8008', icon: '🆘', note: 'Worldwide medical hotline' },
    { service: 'Visa / MC Lost Card',    number: '+1 410 581 9994', icon: '💳', note: 'Reverse-charge from anywhere' },
    { service: 'Your Embassy Hotline',   number: '—', icon: '🏛️', note: 'Save before you travel' },
  ],
  tips: ['Save your country\'s embassy hotline before departure.', 'Most countries accept 112 from mobiles even without a SIM.'],
});

/* ── Main directory ── */
const DB = {
  /* Europe */
  Germany: {
    flag: '🇩🇪',
    numbers: [
      { service: 'Police',          number: '110', icon: '🚓' },
      { service: 'Ambulance / Fire',number: '112', icon: '🚑' },
      { service: 'Tourist Helpline',number: '+49 30 25 00 25', icon: 'ℹ️', note: 'Visit Berlin info' },
      { service: 'Lost Card Hotline',number: '+49 116 116', icon: '💳' },
    ],
    tips: ['"Notruf" means emergency. Operators speak English.'],
  },
  France: {
    flag: '🇫🇷',
    numbers: [
      { service: 'Police',           number: '17',   icon: '🚓' },
      { service: 'Ambulance (SAMU)', number: '15',   icon: '🚑' },
      { service: 'Fire',             number: '18',   icon: '🚒' },
      { service: 'EU Emergency',     number: '112',  icon: '🚨' },
      { service: 'Tourist Police (Paris)', number: '+33 1 53 71 53 71', icon: 'ℹ️' },
    ],
    tips: ['Pickpockets active near Eiffel Tower & Louvre — stay alert.'],
  },
  Italy: {
    flag: '🇮🇹',
    numbers: [
      { service: 'Police',     number: '113', icon: '🚓' },
      { service: 'Carabinieri',number: '112', icon: '🚓' },
      { service: 'Ambulance', number: '118', icon: '🚑' },
      { service: 'Fire',      number: '115', icon: '🚒' },
    ],
    tips: ['Many ER (Pronto Soccorso) units do not bill EU/UK tourists.'],
  },
  Spain: {
    flag: '🇪🇸',
    numbers: [
      { service: 'EU Emergency',   number: '112', icon: '🚨' },
      { service: 'National Police',number: '091', icon: '🚓' },
      { service: 'Local Police',   number: '092', icon: '🚓' },
      { service: 'Ambulance',      number: '061', icon: '🚑' },
    ],
    tips: ['Pickpockets on Madrid & Barcelona metros — keep bag zipped.'],
  },
  Portugal: {
    flag: '🇵🇹',
    numbers: [
      { service: 'EU Emergency',        number: '112',  icon: '🚨' },
      { service: 'Tourist Police (Lisbon)', number: '+351 21 342 16 34', icon: 'ℹ️' },
      { service: 'SOS Saúde 24',        number: '808 24 24 24', icon: '🩺', note: 'Free medical advice 24/7' },
      { service: 'Maritime Rescue',     number: '214 401 919',  icon: '⛵' },
    ],
    tips: ['Dial 112 for police, fire, medical.'],
  },
  Netherlands: {
    flag: '🇳🇱',
    numbers: [
      { service: 'EU Emergency',         number: '112', icon: '🚨' },
      { service: 'Non-emergency Police', number: '0900-8844', icon: '🚓' },
      { service: 'GGD Health Hotline',   number: '0800 1100',  icon: '🩺' },
      { service: 'Lost Bank Card',       number: '0800 0313',  icon: '💳' },
    ],
    tips: ['Bike thefts very common — lock both wheels.'],
  },
  Belgium: {
    flag: '🇧🇪',
    numbers: [
      { service: 'EU Emergency',     number: '112', icon: '🚨' },
      { service: 'Police',           number: '101', icon: '🚓' },
      { service: 'Anti-poison',      number: '070 245 245', icon: '☠️' },
      { service: 'Card Stop (lost card)', number: '+32 70 344 344', icon: '💳' },
    ],
    tips: ['Brussels operators speak English & French.'],
  },
  Switzerland: { flag: '🇨🇭', numbers: [{ service: 'Police', number: '117', icon: '🚓' }, { service: 'Ambulance', number: '144', icon: '🚑' }, { service: 'Fire', number: '118', icon: '🚒' }, { service: 'EU Emergency', number: '112', icon: '🚨' }], tips: ['REGA mountain rescue: 1414.'] },
  Austria:     { flag: '🇦🇹', numbers: [{ service: 'EU Emergency', number: '112', icon: '🚨' }, { service: 'Police', number: '133', icon: '🚓' }, { service: 'Ambulance', number: '144', icon: '🚑' }, { service: 'Mountain Rescue', number: '140', icon: '⛰️' }], tips: ['Mountain rescue line works nationwide.'] },
  Greece:      { flag: '🇬🇷', numbers: [{ service: 'EU Emergency', number: '112', icon: '🚨' }, { service: 'Tourist Police', number: '1571', icon: 'ℹ️' }, { service: 'Coast Guard', number: '108', icon: '⛵' }], tips: ['Tourist Police speak English, German, French.'] },
  Poland:      { flag: '🇵🇱', numbers: [{ service: 'EU Emergency', number: '112', icon: '🚨' }, { service: 'Police', number: '997', icon: '🚓' }, { service: 'Ambulance', number: '999', icon: '🚑' }], tips: ['Dial 112 from any mobile, even with no SIM.'] },
  Czechia:     { flag: '🇨🇿', numbers: [{ service: 'EU Emergency', number: '112', icon: '🚨' }, { service: 'Police', number: '158', icon: '🚓' }, { service: 'Ambulance', number: '155', icon: '🚑' }], tips: ['Beware fake taxis in Prague — use Liftago or Bolt.'] },
  UK: {
    flag: '🇬🇧',
    numbers: [
      { service: 'Emergency (Police/Fire/Ambulance)', number: '999', icon: '🚨' },
      { service: 'EU Emergency',         number: '112', icon: '🚨' },
      { service: 'Non-emergency Police', number: '101', icon: '🚓' },
      { service: 'NHS Non-emergency',    number: '111', icon: '🩺' },
    ],
    tips: ['111 is free 24/7 medical advice.'],
  },
  'United Kingdom': { alias: 'UK' },

  /* Middle East */
  UAE: {
    flag: '🇦🇪',
    numbers: [
      { service: 'Police',     number: '999', icon: '🚓' },
      { service: 'Ambulance', number: '998', icon: '🚑' },
      { service: 'Fire',      number: '997', icon: '🚒' },
      { service: 'Coast Guard',number: '996', icon: '⛵' },
      { service: 'Tourist Police (Dubai)', number: '901', icon: 'ℹ️' },
    ],
    tips: ['Dress modestly in malls. Public alcohol is banned outside licensed venues.'],
  },
  'United Arab Emirates': { alias: 'UAE' },
  Turkey: {
    flag: '🇹🇷',
    numbers: [
      { service: 'Emergency', number: '112',   icon: '🚨' },
      { service: 'Police',    number: '155',   icon: '🚓' },
      { service: 'Tourist Police (Istanbul)', number: '+90 212 527 45 03', icon: 'ℹ️' },
    ],
    tips: ['All emergency calls are free from any phone.'],
  },
  Egypt: {
    flag: '🇪🇬',
    numbers: [
      { service: 'Police',     number: '122', icon: '🚓' },
      { service: 'Tourist Police', number: '126', icon: 'ℹ️' },
      { service: 'Ambulance', number: '123', icon: '🚑' },
      { service: 'Fire',      number: '180', icon: '🚒' },
    ],
    tips: ['Tourist Police speak English and patrol all major sites.'],
  },
  Morocco: { flag: '🇲🇦', numbers: [{ service: 'Police (city)', number: '19', icon: '🚓' }, { service: 'Gendarmerie (rural)', number: '177', icon: '🚓' }, { service: 'Ambulance', number: '15', icon: '🚑' }, { service: 'Tourist Brigade', number: '+212 537 70 75 75', icon: 'ℹ️' }], tips: ['Negotiate every taxi fare BEFORE getting in.'] },
  Israel:  { flag: '🇮🇱', numbers: [{ service: 'Police', number: '100', icon: '🚓' }, { service: 'Ambulance (MDA)', number: '101', icon: '🚑' }, { service: 'Fire', number: '102', icon: '🚒' }], tips: ['Home Front Command app gives rocket-attack alerts.'] },
  Jordan: {
    flag: '🇯🇴',
    numbers: [
      { service: 'Unified Emergency', number: '911', icon: '🚨' },
      { service: 'Tourist Police',    number: '+962 6 5603251', icon: 'ℹ️' },
      { service: 'Ambulance (Civil Defense)', number: '199', icon: '🚑' },
      { service: 'Fire',              number: '193', icon: '🚒' },
    ],
    tips: ['Police booths at Petra, Wadi Rum, Jerash.'],
  },
  'Saudi Arabia': { flag: '🇸🇦', numbers: [{ service: 'Unified Emergency', number: '911', icon: '🚨' }, { service: 'Tourist Hotline', number: '930', icon: 'ℹ️' }, { service: 'Traffic Accidents', number: '993', icon: '🚓' }], tips: ['930 tourist hotline supports English, French, Spanish, Chinese.'] },
  Qatar: {
    flag: '🇶🇦',
    numbers: [
      { service: 'Unified Emergency', number: '999', icon: '🚨' },
      { service: 'Police Hotline',    number: '+974 2347 222', icon: '🚓' },
      { service: 'Hamad Medical',     number: '+974 4439 5777', icon: '🩺' },
      { service: 'Tourist Hotline',   number: '+974 4499 0000', icon: 'ℹ️' },
    ],
    tips: ['Dress code: knees and shoulders covered.'],
  },

  /* Asia */
  Japan: {
    flag: '🇯🇵',
    numbers: [
      { service: 'Police',     number: '110', icon: '🚓' },
      { service: 'Ambulance / Fire', number: '119', icon: '🚑' },
      { service: 'Japan Helpline (24/7 English)', number: '0570-000-911', icon: 'ℹ️' },
    ],
    tips: ['English-speaking 24/7 line is free from any phone.'],
  },
  China: { flag: '🇨🇳', numbers: [{ service: 'Police', number: '110', icon: '🚓' }, { service: 'Ambulance', number: '120', icon: '🚑' }, { service: 'Fire', number: '119', icon: '🚒' }, { service: 'Traffic Police', number: '122', icon: '🚦' }], tips: ['Operators may need Mandarin — keep address in Chinese ready.'] },
  'South Korea': { flag: '🇰🇷', numbers: [{ service: 'Police', number: '112', icon: '🚓' }, { service: 'Ambulance / Fire', number: '119', icon: '🚑' }, { service: 'Tourist Hotline', number: '1330', icon: 'ℹ️' }], tips: ['1330 KTO line: 24/7 English/Japanese/Chinese.'] },
  Thailand: {
    flag: '🇹🇭',
    numbers: [
      { service: 'Tourist Police', number: '1155', icon: 'ℹ️' },
      { service: 'Police',         number: '191',  icon: '🚓' },
      { service: 'Ambulance',      number: '1669', icon: '🚑' },
      { service: 'Fire',           number: '199',  icon: '🚒' },
    ],
    tips: ['1155 Tourist Police speak English 24/7.'],
  },
  Singapore: { flag: '🇸🇬', numbers: [{ service: 'Police', number: '999', icon: '🚓' }, { service: 'Ambulance / Fire', number: '995', icon: '🚑' }, { service: 'Non-emergency Police', number: '1800 255 0000', icon: '☎️' }], tips: ['One of the safest cities — but penalties are harsh.'] },
  Malaysia: {
    flag: '🇲🇾',
    numbers: [
      { service: 'Police / Ambulance', number: '999', icon: '🚨' },
      { service: 'Fire Department',    number: '994', icon: '🚒' },
      { service: 'Tourist Police (KL)',number: '+603 2149 6593', icon: 'ℹ️' },
      { service: 'Civil Defence Force',number: '991', icon: '🚑' },
    ],
    tips: ['Some areas of Sabah have travel advisories.'],
  },
  Indonesia: { flag: '🇮🇩', numbers: [{ service: 'Police', number: '110', icon: '🚓' }, { service: 'Ambulance', number: '118', icon: '🚑' }, { service: 'Fire', number: '113', icon: '🚒' }, { service: 'Search & Rescue', number: '115', icon: '🌊' }], tips: ['Bali tourist hotline: 0361-754599.'] },
  Vietnam:   { flag: '🇻🇳', numbers: [{ service: 'Police', number: '113', icon: '🚓' }, { service: 'Ambulance', number: '115', icon: '🚑' }, { service: 'Fire', number: '114', icon: '🚒' }], tips: ['Tourist hotline (English): 1900 9095.'] },
  India:     { flag: '🇮🇳', numbers: [{ service: 'All-in-one Emergency', number: '112', icon: '🚨' }, { service: 'Police', number: '100', icon: '🚓' }, { service: 'Ambulance', number: '102', icon: '🚑' }, { service: 'Tourist Helpline', number: '1363', icon: 'ℹ️' }], tips: ['1363 multilingual tourist line works 24/7.'] },
  Maldives:  { flag: '🇲🇻', numbers: [{ service: 'Police', number: '119', icon: '🚓' }, { service: 'Ambulance', number: '102', icon: '🚑' }, { service: 'Coast Guard', number: '191', icon: '⛵' }], tips: ['Most resort islands have private clinics & speedboat ambulance.'] },

  /* Americas */
  USA: {
    flag: '🇺🇸',
    numbers: [
      { service: 'Emergency (Police/Fire/Ambulance)', number: '911', icon: '🚨' },
      { service: 'Non-emergency Info',  number: '311', icon: 'ℹ️' },
      { service: 'Poison Control',      number: '1-800-222-1222', icon: '☠️' },
    ],
    tips: ['Ambulance rides can cost $1000+ — get travel insurance.'],
  },
  'United States': { alias: 'USA' },
  Canada: {
    flag: '🇨🇦',
    numbers: [
      { service: 'Emergency',            number: '911', icon: '🚨' },
      { service: 'Non-emergency Police', number: '311', icon: '🚓' },
      { service: 'Telehealth (free 24/7)', number: '811', icon: '🩺' },
      { service: 'Poison Control',       number: '1-844-764-7669', icon: '☠️' },
    ],
    tips: ['Healthcare for tourists is expensive — insurance is mandatory.'],
  },
  Mexico: { flag: '🇲🇽', numbers: [{ service: 'Emergency', number: '911', icon: '🚨' }, { service: 'Tourist Police (CDMX)', number: '+52 55 5207 9956', icon: 'ℹ️' }, { service: 'Green Angels (roadside)', number: '078', icon: '🚙' }], tips: ['Use authorized taxi stands (sitios) at airports.'] },
  Brazil: { flag: '🇧🇷', numbers: [{ service: 'Police', number: '190', icon: '🚓' }, { service: 'Ambulance', number: '192', icon: '🚑' }, { service: 'Fire', number: '193', icon: '🚒' }, { service: 'Tourist Police (Rio)', number: '+55 21 2334 6802', icon: 'ℹ️' }], tips: ['Carry photocopies of passport; leave original in hotel safe.'] },
  Argentina: {
    flag: '🇦🇷',
    numbers: [
      { service: 'Unified Emergency',  number: '911', icon: '🚨' },
      { service: 'Tourist Police (BA)',number: '+54 11 4346 5748', icon: 'ℹ️' },
      { service: 'Ambulance (SAME)',   number: '107', icon: '🚑' },
      { service: 'Fire',               number: '100', icon: '🚒' },
    ],
    tips: ['Cuevas (illegal exchange) offer better USD rates — but risky.'],
  },

  /* Oceania */
  Australia: { flag: '🇦🇺', numbers: [{ service: 'Emergency', number: '000', icon: '🚨' }, { service: 'Non-emergency', number: '131 444', icon: '🚓' }, { service: 'Smartraveller', number: '1300 555 135', icon: 'ℹ️' }], tips: ['000 from any phone; 112 from mobile also works.'] },
  'New Zealand': {
    flag: '🇳🇿',
    numbers: [
      { service: 'Emergency',            number: '111',           icon: '🚨' },
      { service: 'Non-emergency Police', number: '105',           icon: '🚓' },
      { service: 'Healthline (24/7)',    number: '0800 611 116',  icon: '🩺' },
      { service: 'Maritime Rescue',      number: '0508 472 269',  icon: '⛵' },
    ],
    tips: ['Healthline gives free 24/7 medical advice.'],
  },

  /* CIS & home region */
  Kyrgyzstan: { flag: '🇰🇬', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }, { service: 'Unified Emergency', number: '112', icon: '🚨' }, { service: 'Tourist Help', number: '+996 312 660 920', icon: 'ℹ️' }], tips: ['MoF Tourist Police support English/Russian.'] },
  Uzbekistan: { flag: '🇺🇿', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }, { service: 'Rescue', number: '112', icon: '🚨' }], tips: ['Carry passport at all times — random checks possible.'] },
  Kazakhstan: { flag: '🇰🇿', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }, { service: 'Rescue', number: '112', icon: '🚨' }], tips: ['Astana/Almaty operators understand basic English.'] },
  Tajikistan: { flag: '🇹🇯', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }], tips: ['Mountainous areas have limited cell coverage.'] },
  Russia:     { flag: '🇷🇺', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }, { service: 'Unified', number: '112', icon: '🚨' }], tips: ['112 works without SIM card and is free.'] },
  Azerbaijan: { flag: '🇦🇿', numbers: [{ service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }, { service: 'Fire', number: '101', icon: '🚒' }], tips: ['Tourist hotline ASAN: 108.'] },
  Georgia: {
    flag: '🇬🇪',
    numbers: [
      { service: 'Unified Emergency', number: '112', icon: '🚨' },
      { service: 'Tourist Police',    number: '+995 32 222 26 26', icon: 'ℹ️' },
      { service: 'Ambulance',         number: '113', icon: '🚑' },
      { service: 'Fire',              number: '111', icon: '🚒' },
    ],
    tips: ['112 is the single all-in-one number; operators speak English.'],
  },
  Armenia:    { flag: '🇦🇲', numbers: [{ service: 'Unified Rescue', number: '911', icon: '🚨' }, { service: 'Police', number: '102', icon: '🚓' }, { service: 'Ambulance', number: '103', icon: '🚑' }], tips: ['Operators speak Armenian/Russian; English limited.'] },
};

/* Aliases & loose matching */
const COUNTRY_FALLBACK_KEYS = Object.keys(DB);

const norm = (s) => String(s || '').toLowerCase().trim();

/* Map common city → country so the user can pass "Berlin" or "Berlin, Germany" */
const CITY_TO_COUNTRY = {
  berlin: 'Germany', munich: 'Germany', hamburg: 'Germany', cologne: 'Germany', frankfurt: 'Germany', dusseldorf: 'Germany',
  paris: 'France', nice: 'France', lyon: 'France', marseille: 'France',
  rome: 'Italy', milan: 'Italy', florence: 'Italy', venice: 'Italy', naples: 'Italy',
  madrid: 'Spain', barcelona: 'Spain', seville: 'Spain', valencia: 'Spain',
  lisbon: 'Portugal', porto: 'Portugal',
  amsterdam: 'Netherlands', rotterdam: 'Netherlands',
  brussels: 'Belgium', antwerp: 'Belgium',
  zurich: 'Switzerland', geneva: 'Switzerland', zermatt: 'Switzerland',
  vienna: 'Austria', salzburg: 'Austria', innsbruck: 'Austria',
  athens: 'Greece', santorini: 'Greece', mykonos: 'Greece',
  warsaw: 'Poland', krakow: 'Poland',
  prague: 'Czechia',
  london: 'UK', manchester: 'UK', edinburgh: 'UK',
  dubai: 'UAE', 'abu dhabi': 'UAE', sharjah: 'UAE',
  istanbul: 'Turkey', ankara: 'Turkey', antalya: 'Turkey', cappadocia: 'Turkey',
  cairo: 'Egypt', alexandria: 'Egypt', luxor: 'Egypt', 'sharm el sheikh': 'Egypt', hurghada: 'Egypt',
  marrakech: 'Morocco', casablanca: 'Morocco', fez: 'Morocco',
  'tel aviv': 'Israel', jerusalem: 'Israel',
  amman: 'Jordan', petra: 'Jordan',
  riyadh: 'Saudi Arabia', jeddah: 'Saudi Arabia',
  doha: 'Qatar',
  tokyo: 'Japan', kyoto: 'Japan', osaka: 'Japan',
  beijing: 'China', shanghai: 'China', xian: 'China', chengdu: 'China',
  seoul: 'South Korea', busan: 'South Korea',
  bangkok: 'Thailand', phuket: 'Thailand', 'chiang mai': 'Thailand', pattaya: 'Thailand',
  singapore: 'Singapore',
  'kuala lumpur': 'Malaysia', penang: 'Malaysia',
  bali: 'Indonesia', jakarta: 'Indonesia', ubud: 'Indonesia',
  hanoi: 'Vietnam', 'ho chi minh': 'Vietnam',
  delhi: 'India', mumbai: 'India', goa: 'India', agra: 'India', jaipur: 'India',
  male: 'Maldives', maldives: 'Maldives',
  'new york': 'USA', nyc: 'USA', 'los angeles': 'USA', miami: 'USA', 'san francisco': 'USA', 'las vegas': 'USA',
  toronto: 'Canada', montreal: 'Canada', vancouver: 'Canada',
  'mexico city': 'Mexico', cancun: 'Mexico', tulum: 'Mexico',
  'rio de janeiro': 'Brazil', 'sao paulo': 'Brazil',
  'buenos aires': 'Argentina',
  sydney: 'Australia', melbourne: 'Australia',
  auckland: 'New Zealand', wellington: 'New Zealand', 'bora bora': 'New Zealand',
  bishkek: 'Kyrgyzstan', osh: 'Kyrgyzstan',
  tashkent: 'Uzbekistan', samarkand: 'Uzbekistan', bukhara: 'Uzbekistan',
  almaty: 'Kazakhstan', astana: 'Kazakhstan', nursultan: 'Kazakhstan',
  dushanbe: 'Tajikistan',
  moscow: 'Russia', 'st petersburg': 'Russia', sochi: 'Russia',
  baku: 'Azerbaijan',
  tbilisi: 'Georgia', batumi: 'Georgia',
  yerevan: 'Armenia',
};

/**
 * Resolve a destination string ("Berlin", "Berlin, Germany", "tokyo") into the
 * canonical country key used in DB. Returns null if unknown.
 */
export const resolveCountry = (destination = '') => {
  const lower = norm(destination);
  if (!lower) return null;

  // Direct country hit
  for (const k of COUNTRY_FALLBACK_KEYS) {
    if (lower === norm(k)) return k;
  }

  // "City, Country" pattern → try the part after the comma first
  if (lower.includes(',')) {
    const parts = lower.split(',').map(s => s.trim());
    const tail = parts[parts.length - 1];
    for (const k of COUNTRY_FALLBACK_KEYS) {
      if (norm(k) === tail) return k;
    }
  }

  // City lookup
  for (const [city, country] of Object.entries(CITY_TO_COUNTRY)) {
    if (lower.includes(city)) return country;
  }

  // Country name appears anywhere in string
  for (const k of COUNTRY_FALLBACK_KEYS) {
    if (lower.includes(norm(k))) return k;
  }

  return null;
};

/**
 * Get emergency contacts for a destination.
 * Always returns a useful object — falls back to "112" advice if unknown.
 */
export const getEmergencyContacts = (destination = '') => {
  const country = resolveCountry(destination);
  if (!country) return SAFE_BLANK(destination || 'Unknown', '🌍');

  let entry = DB[country];
  if (entry?.alias) entry = DB[entry.alias];
  if (!entry) return SAFE_BLANK(country, '🌍');

  // Guarantee at least 4 numbers per country by topping up with universal fallbacks.
  const seenNumbers = new Set((entry.numbers || []).map(n => n.number));
  const padded = [...(entry.numbers || [])];
  for (const u of UNIVERSAL_BACKUP) {
    if (padded.length >= 4) break;
    if (!seenNumbers.has(u.number)) padded.push(u);
  }

  return {
    country,
    flag: entry.flag || '🌍',
    numbers: padded,
    tips: entry.tips || [],
  };
};

export const knownCountries = COUNTRY_FALLBACK_KEYS;
