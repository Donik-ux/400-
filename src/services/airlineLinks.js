/**
 * Per-airline directory of official booking URLs.
 * Each `build(flight)` returns a deep-link to the airline's own booking flow
 * pre-filled with route + date + pax when the airline supports it.
 *
 * Falls back to the airline's homepage when the booking URL pattern is unknown.
 */

const isoDate = (d) => d ? new Date(d).toISOString().slice(0,10) : '';
const ddmmyyyy = (d) => {
  if (!d) return '';
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2,'0')}/${String(x.getMonth()+1).padStart(2,'0')}/${x.getFullYear()}`;
};
const yyyymmdd = (d) => d ? new Date(d).toISOString().slice(0,10).replace(/-/g,'') : '';
const codeOf = (s) => {
  const m = String(s || '').match(/\(([A-Z]{3,4})\)/);
  return m ? m[1].slice(0,3) : String(s || '').toUpperCase().slice(0,3);
};

export const AIRLINE_LINKS = {
  'Emirates': {
    name: 'Emirates',
    flag: '🇦🇪',
    domain: 'emirates.com',
    homepage: 'https://www.emirates.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return d
        ? `https://www.emirates.com/english/book/ibe-result/?cabin=Y&origin=${from}&destination=${to}&depart=${d}&pax=A1`
        : `https://www.emirates.com`;
    },
  },
  'Turkish Airlines': {
    name: 'Turkish Airlines',
    flag: '🇹🇷',
    domain: 'turkishairlines.com',
    homepage: 'https://www.turkishairlines.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.turkishairlines.com/en-int/flights/booking/?origin=${from}&destination=${to}&departureDate=${d || ''}&passengerType=adult&numberOfAdults=1&triptype=ONEWAY&cabin=ECONOMY`;
    },
  },
  'Fly Dubai': {
    name: 'Fly Dubai',
    flag: '🇦🇪',
    domain: 'flydubai.com',
    homepage: 'https://www.flydubai.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = ddmmyyyy(f.date);
      return d
        ? `https://www.flydubai.com/en/booking/flight/?fromcity=${from}&tocity=${to}&departuredate=${encodeURIComponent(d)}&adt=1`
        : `https://www.flydubai.com`;
    },
  },
  'Qatar Airways': {
    name: 'Qatar Airways',
    flag: '🇶🇦',
    domain: 'qatarairways.com',
    homepage: 'https://www.qatarairways.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.qatarairways.com/en/homepage.html?fromStation=${from}&toStation=${to}&date=${d}`;
    },
  },
  'Aeroflot': {
    name: 'Aeroflot',
    flag: '🇷🇺',
    domain: 'aeroflot.ru',
    homepage: 'https://www.aeroflot.ru',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.aeroflot.ru/ru-ru/?from=${from}&to=${to}&dateStart=${d}&adults=1`;
    },
  },
  'Air Astana': {
    name: 'Air Astana',
    flag: '🇰🇿',
    domain: 'airastana.com',
    homepage: 'https://www.airastana.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.airastana.com/global/en-us?fromCity=${from}&toCity=${to}&departureDate=${d}`;
    },
  },
  'Uzbekistan Airways': {
    name: 'Uzbekistan Airways',
    flag: '🇺🇿',
    domain: 'uzairways.com',
    homepage: 'https://www.uzairways.com',
    build: (f) => `https://www.uzairways.com/en?from=${codeOf(f.from)}&to=${codeOf(f.to)}&date=${isoDate(f.date)}`,
  },
  'Pegasus Airlines': {
    name: 'Pegasus Airlines',
    flag: '🇹🇷',
    domain: 'flypgs.com',
    homepage: 'https://www.flypgs.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.flypgs.com/en/cheap-flight-tickets/${from}-${to}?date=${d}`;
    },
  },
  'Air Arabia': {
    name: 'Air Arabia',
    flag: '🇦🇪',
    domain: 'airarabia.com',
    homepage: 'https://www.airarabia.com',
    build: (f) => `https://www.airarabia.com/en/${codeOf(f.from).toLowerCase()}-to-${codeOf(f.to).toLowerCase()}-flights?dep=${isoDate(f.date)}`,
  },
  'British Airways': {
    name: 'British Airways',
    flag: '🇬🇧',
    domain: 'britishairways.com',
    homepage: 'https://www.britishairways.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.britishairways.com/travel/booktrip/public/en_gb?fromCode=${from}&toCode=${to}&depart=${d}&adultCount=1`;
    },
  },
  'Lufthansa': {
    name: 'Lufthansa',
    flag: '🇩🇪',
    domain: 'lufthansa.com',
    homepage: 'https://www.lufthansa.com',
    build: (f) => {
      const from = codeOf(f.from), to = codeOf(f.to);
      const d = isoDate(f.date);
      return `https://www.lufthansa.com/en/en/flight-search?travelers=ADT-1&originDestinations=ORIG-${from},DEST-${to},DATE-${d}`;
    },
  },
  'Singapore Airlines': {
    name: 'Singapore Airlines',
    flag: '🇸🇬',
    domain: 'singaporeair.com',
    homepage: 'https://www.singaporeair.com',
    build: (f) => `https://www.singaporeair.com/en_UK/sg/home?orig=${codeOf(f.from)}&dest=${codeOf(f.to)}&date=${isoDate(f.date)}`,
  },
};

/** Resolve a Flight object to its airline's deep-link booking URL. */
export const officialUrlFor = (flight) => {
  if (!flight?.airline) return null;
  const entry = AIRLINE_LINKS[flight.airline];
  if (!entry) return null;
  try { return entry.build(flight); } catch { return entry.homepage; }
};

/** Get the airline meta (flag, domain). */
export const airlineMetaOf = (flight) => {
  if (!flight?.airline) return null;
  return AIRLINE_LINKS[flight.airline] || null;
};
