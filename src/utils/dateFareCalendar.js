/**
 * Combine price and (optional) weather into one "best value" pick across a
 * set of candidate dates — shared by the Antarctica builder and the Flights
 * "smarter dates" strip. Scores are relative to the OTHER candidates in the
 * same set, since there's no universal "ideal weather" across destinations —
 * so the pick tracks whatever the live weather/price data actually says
 * instead of always favoring the same fixed offset.
 */
const normalize = (values, value, invert = false) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0.5;
  const n = (value - min) / (max - min);
  return invert ? 1 - n : n;
};

// 0 (worse) – 1 (nicer) per candidate: warmer, drier and calmer relative to
// the other dates in this same batch scores higher.
export function weatherNiceness(candidates) {
  const withWeather = candidates.filter((c) => c.weather);
  if (withWeather.length < 2) return candidates.map(() => 0.5);

  const temps = withWeather.map((c) => c.weather.tempMax ?? 0);
  const precs = withWeather.map((c) => c.weather.precipitation ?? 0);
  const winds = withWeather.map((c) => c.weather.windSpeed ?? 0);

  return candidates.map((c) => {
    if (!c.weather) return 0.5;
    const tempScore = normalize(temps, c.weather.tempMax ?? 0);
    const precScore = normalize(precs, c.weather.precipitation ?? 0, true);
    const windScore = normalize(winds, c.weather.windSpeed ?? 0, true);
    return 0.5 * tempScore + 0.3 * precScore + 0.2 * windScore;
  });
}

/**
 * @param {{price:number, weather?: object|null}[]} candidates
 * @param {{priceWeight?: number}} [opts] priceWeight in [0,1], rest goes to weather
 * @returns {number} index of the best combined price+weather pick
 */
export function pickBestValueIndex(candidates, { priceWeight = 0.55 } = {}) {
  if (!candidates.length) return 0;
  const prices = candidates.map((c) => c.price);
  const priceScores = candidates.map((c) => normalize(prices, c.price, true));
  const weatherScores = weatherNiceness(candidates);
  const combined = candidates.map((_, i) => priceWeight * priceScores[i] + (1 - priceWeight) * weatherScores[i]);
  return combined.reduce((best, v, i) => (v > combined[best] ? i : best), 0);
}
