/**
 * Detect the user's current city from the browser's Geolocation API and
 * reverse-geocode it with BigDataCloud's free client endpoint (no API key,
 * CORS-enabled). Returns a clean "City, Country" label suitable for the
 * "From" field of the trip planner.
 */
export async function detectCurrentLocation({ timeoutMs = 10000 } = {}) {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    const e = new Error('GEO_UNSUPPORTED'); e.code = 'GEO_UNSUPPORTED'; throw e;
  }

  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 10 * 60 * 1000, // accept a cached fix up to 10 min old
    });
  }).catch((err) => {
    const e = new Error('GEO_FAILED');
    // 1 = permission denied, 2 = position unavailable, 3 = timeout
    e.code = err?.code === 1 ? 'GEO_DENIED' : 'GEO_FAILED';
    throw e;
  });

  const { latitude, longitude } = pos.coords;

  let data = {};
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    data = await res.json();
  } catch {
    // Reverse geocode failed — still return coordinates so callers can fall back.
    return { city: '', region: '', country: '', label: '', latitude, longitude };
  }

  const city    = data.city || data.locality || '';
  const region  = data.principalSubdivision || '';
  const country = cleanCountry(data.countryName || '');
  const label   = [city || region, country].filter(Boolean).join(', ');

  return { city, region, country, label, latitude, longitude };
}

/* Tidy verbose country names from the geocoder for use in a compact field. */
const COUNTRY_ALIASES = {
  'United States of America': 'USA',
  'United States': 'USA',
  'United Arab Emirates': 'UAE',
  'United Kingdom of Great Britain and Northern Ireland': 'UK',
  'United Kingdom': 'UK',
  'Russian Federation': 'Russia',
  'Republic of Korea': 'South Korea',
};
function cleanCountry(name) {
  const stripped = name.replace(/\s*\(the\)\s*$/i, '').trim();
  return COUNTRY_ALIASES[stripped] || stripped;
}
