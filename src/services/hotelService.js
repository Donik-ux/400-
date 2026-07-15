// Client wrapper around /api/hotels — real Amadeus hotel offers for a city.
import { getCityCode } from '../data/cityCodes';

/**
 * @param {{ city: string, checkInDate: string, checkOutDate: string, adults?: number }} params
 * @returns {Promise<{ status: number, hotels: object[], source?: string, error?: string, unsupportedCity?: boolean }>}
 */
export async function searchHotels({ city, checkInDate, checkOutDate, adults = 1 }) {
  const cityCode = getCityCode(city);
  if (!cityCode) return { status: 200, hotels: [], unsupportedCity: true };

  const qs = new URLSearchParams({ cityCode, checkInDate, checkOutDate, adults: String(adults) });
  const res = await fetch(`/api/hotels?${qs}`);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, hotels: json.hotels || [], source: json.source, error: json.error };
}
