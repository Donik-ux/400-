// Shared Amadeus Self-Service OAuth2 client — used by both api/flights.js
// (flight-offers) and api/hotels.js (hotel-offers), same AMADEUS_CLIENT_ID /
// AMADEUS_CLIENT_SECRET credentials cover both APIs on the free tier.

export const AMADEUS_HOSTS = {
  test: 'https://test.api.amadeus.com',
  production: 'https://api.amadeus.com',
};

export function amadeusHost() {
  return AMADEUS_HOSTS[process.env.AMADEUS_ENV === 'production' ? 'production' : 'test'];
}

let _token = { value: null, exp: 0 };
export async function getAmadeusToken(host, id, secret) {
  if (_token.value && Date.now() < _token.exp - 30_000) return _token.value;
  const res = await fetch(`${host}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const json = await res.json();
  _token = { value: json.access_token, exp: Date.now() + (json.expires_in || 1799) * 1000 };
  return _token.value;
}
