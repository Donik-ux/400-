// City display name → 3-letter Amadeus city code, for the hotel-search
// endpoint (api/hotels.js expects a city code, not a free-text name).
// Amadeus city codes match the main airport code for almost every city
// used across the app (exoticTours.js destinations + aiPackageService.js
// CATALOG) — this is a deliberately small, curated map rather than a full
// geo database, so unmapped cities just hide the hotel-prices section
// instead of guessing wrong.
export const CITY_CODES = {
  Tashkent: 'TAS', Samarkand: 'SKD', Bukhara: 'BHK', Bishkek: 'FRU',
  Almaty: 'ALA', Astana: 'NQZ', Dubai: 'DXB', 'Abu Dhabi': 'AUH',
  Istanbul: 'IST', Ankara: 'ESB', Moscow: 'MOW', London: 'LON',
  Paris: 'PAR', Berlin: 'BER', Rome: 'ROM', Madrid: 'MAD',
  Barcelona: 'BCN', Tokyo: 'TYO', Seoul: 'SEL', Beijing: 'BJS',
  Bangkok: 'BKK', Phuket: 'HKT', Bali: 'DPS', Singapore: 'SIN',
  'Kuala Lumpur': 'KUL', Maldives: 'MLE', 'New Delhi': 'DEL', Mumbai: 'BOM',
  Cairo: 'CAI', Casablanca: 'CMN', Marrakech: 'RAK', 'Cape Town': 'CPT',
  'New York': 'NYC', 'Los Angeles': 'LAX', Miami: 'MIA', Sydney: 'SYD',
  Antalya: 'AYT', Baku: 'GYD', Tbilisi: 'TBS', Yerevan: 'EVN',
  Milan: 'MIL', Vienna: 'VIE', Prague: 'PRG', Budapest: 'BUD',
  Warsaw: 'WAW', Stockholm: 'STO', Oslo: 'OSL', Bergen: 'BGO',
  Helsinki: 'HEL', Reykjavik: 'REK', Zurich: 'ZRH', Amsterdam: 'AMS',
  Brussels: 'BRU', Seychelles: 'SEZ', Mauritius: 'MRU', Athens: 'ATH',
  Santorini: 'JTR', Lisbon: 'LIS', Goa: 'GOI', 'Bora Bora': 'BOB',
  Belgrade: 'BEG',
};

export function getCityCode(city) {
  if (!city) return null;
  const clean = String(city).split('(')[0].trim();
  return CITY_CODES[clean] || null;
}
