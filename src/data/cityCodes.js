// City display name → 3-letter Amadeus city code, for the hotel-search
// endpoint (api/hotels.js expects a city code, not a free-text name).
//
// This map is no longer the whole answer — getCityCode falls through to the
// flight dataset, which covers 244 cities, so hotel prices are not limited to
// what someone remembered to list here. What the map is FOR is the cities
// where the city code differs from the airport code: London is LON, not LHR,
// and answering LHR would search hotels around one airport instead of the
// city. Those cases have to be written down; the rest are derivable.
import { searchAirports } from './airports';

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

/**
 * @param {string} city  "Istanbul", "Istanbul (IST)", "Accra"
 * @returns {string|null} an Amadeus city code, or null when the city is not
 *          one the flight search knows either.
 */
export function getCityCode(city) {
  if (!city) return null;
  const clean = String(city).split('(')[0].trim();

  // The curated map wins: it holds the METROPOLITAN codes — LON, NYC, PAR,
  // TYO, MOW, MIL — which cover every airport in a city. Falling through to
  // the airport table would answer LHR or JFK instead and quietly narrow the
  // hotel search to one corner of the city.
  if (CITY_CODES[clean]) return CITY_CODES[clean];

  // Everything else comes from the flight dataset, which carries 244 cities.
  // A code written into the search box directly is honoured as-is.
  const inParens = /\(([A-Za-z]{3})\)/.exec(String(city));
  if (inParens) return inParens[1].toUpperCase();

  const hit = searchAirports(clean, 1)[0];
  return hit && hit.city.toLowerCase() === clean.toLowerCase() ? hit.code : null;
}
