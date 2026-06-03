/**
 * Build a Google Maps URL for an address. Prefer coordinates when available.
 * Returns null when there's nothing useful to point at.
 */
export const mapsUrlFor = (event) => {
  if (!event) return null;
  if (Number.isFinite(event.lat) && Number.isFinite(event.lng)) {
    return `https://www.google.com/maps?q=${event.lat},${event.lng}`;
  }
  const q = [event.name, event.address].filter(Boolean).join(', ').trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
};

/** Maps URL from a plain address string. */
export const mapsUrlFromAddress = (address) => {
  const q = String(address || '').trim();
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
};

/** Directions URL from one event to another (or any address strings). */
export const directionsUrl = (from, to) => {
  const a = typeof from === 'string' ? from : [from?.name, from?.address].filter(Boolean).join(', ');
  const b = typeof to   === 'string' ? to   : [to?.name,   to?.address  ].filter(Boolean).join(', ');
  if (!a || !b) return null;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a)}&destination=${encodeURIComponent(b)}`;
};

/** Build a "multi-stop" Google Maps URL for a single day. */
export const dayMapsUrl = (day) => {
  const stops = (day?.events || [])
    .map(e => [e.name, e.address].filter(Boolean).join(', '))
    .filter(Boolean);
  if (stops.length === 0) return null;
  if (stops.length === 1) return mapsUrlFromAddress(stops[0]);
  const origin = encodeURIComponent(stops[0]);
  const destination = encodeURIComponent(stops[stops.length - 1]);
  const waypoints = stops.slice(1, -1).map(encodeURIComponent).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=walking`;
};
