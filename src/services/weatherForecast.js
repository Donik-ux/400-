/**
 * Real weather signal for date recommendations (Antarctica builder, Flights
 * "smarter dates" strip). Near-term dates (next 16 days) use Open-Meteo's
 * live forecast; farther-out dates use a 3-year average for the same
 * month/day from Open-Meteo's free historical archive, since no forecast
 * reaches that far — both branches return real measured/predicted data,
 * never an invented number.
 */
import { getCoords } from '../data/coords';

const FORECAST_URL = (lat, lng) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&forecast_days=16`;

const ARCHIVE_URL = (lat, lng, date) =>
  `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto`;

// Module-level so repeated builder re-renders and other pages share one
// in-flight/settled request per city+date instead of re-fetching.
const cache = new Map();

const dayIndex = (isoDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target - today) / 86400000);
};

const pickDay = (daily, i) => {
  if (!daily || i == null || i < 0 || i >= (daily.time?.length ?? 0)) return null;
  const tempMax = daily.temperature_2m_max?.[i];
  if (tempMax == null) return null;
  return {
    tempMax,
    tempMin: daily.temperature_2m_min?.[i],
    precipitation: daily.precipitation_sum?.[i] ?? 0,
    windSpeed: daily.windspeed_10m_max?.[i] ?? 0,
    code: daily.weathercode?.[i],
  };
};

function fetchForecastDaily(lat, lng) {
  const key = `f:${lat},${lng}`;
  if (!cache.has(key)) {
    cache.set(key, fetch(FORECAST_URL(lat, lng))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.daily || null)
      .catch(() => null));
  }
  return cache.get(key);
}

function fetchArchiveDay(lat, lng, isoDate) {
  const key = `a:${lat},${lng},${isoDate}`;
  if (!cache.has(key)) {
    cache.set(key, fetch(ARCHIVE_URL(lat, lng, isoDate))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => pickDay(d?.daily, 0))
      .catch(() => null));
  }
  return cache.get(key);
}

// Average of the same month/day over the last 3 years — a real climatological
// normal, used whenever the date falls beyond the live forecast horizon.
async function climateNormal(lat, lng, isoDate) {
  const [, mm, dd] = isoDate.split('-');
  const thisYear = new Date().getFullYear();
  const days = await Promise.all(
    [1, 2, 3].map((back) => fetchArchiveDay(lat, lng, `${thisYear - back}-${mm}-${dd}`)),
  );
  const valid = days.filter(Boolean);
  if (!valid.length) return null;
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  return {
    tempMax: avg(valid.map((d) => d.tempMax)),
    tempMin: avg(valid.map((d) => d.tempMin).filter((v) => v != null)),
    precipitation: avg(valid.map((d) => d.precipitation ?? 0)),
    windSpeed: avg(valid.map((d) => d.windSpeed ?? 0)),
    code: valid[0].code,
    source: 'climate',
  };
}

/**
 * Resolve weather for a batch of ISO (YYYY-MM-DD) dates against one
 * destination city. Returns a map keyed by date; entries are `null` when
 * coordinates are unknown or a fetch fails, so callers can fall back to a
 * price-only comparison instead of guessing.
 */
export async function getWeatherForDates(city, isoDates) {
  const coords = getCoords(city);
  const out = {};
  if (!coords) { isoDates.forEach((d) => { out[d] = null; }); return out; }

  const near = isoDates.filter((d) => { const i = dayIndex(d); return i >= 0 && i <= 15; });
  const far  = isoDates.filter((d) => !near.includes(d));

  const forecastDaily = near.length ? await fetchForecastDaily(coords.lat, coords.lng) : null;
  near.forEach((d) => {
    const w = pickDay(forecastDaily, dayIndex(d));
    out[d] = w ? { ...w, source: 'forecast' } : null;
  });

  await Promise.all(far.map(async (d) => { out[d] = await climateNormal(coords.lat, coords.lng, d); }));

  return out;
}
