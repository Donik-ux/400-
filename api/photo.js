// Server-side proxy for Unsplash's Search API — used to fetch a real photo
// for any destination name (city, country, landmark) instead of relying on
// a hand-picked photo ID that can 404 once Unsplash removes the source photo,
// and instead of a generic stock fallback for destinations nobody curated.
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const UNSPLASH_URL = 'https://api.unsplash.com/search/photos';
const getApiKey = () => process.env.UNSPLASH_ACCESS_KEY || '';

// Best-effort in-memory cache (per warm lambda instance) — the same
// destination is requested by many visitors, so this cuts real Unsplash
// calls dramatically within the free tier's tight hourly quota.
const cache = new Map(); // normalized query -> { url, expiresAt }
const CACHE_TTL_MS = 24 * 60 * 60_000;

export async function searchPhoto(query) {
  const key = getApiKey();
  if (!key) { const e = new Error('NO_UNSPLASH_KEY'); e.status = 501; throw e; }

  const q = String(query || '').trim().slice(0, 100);
  if (!q) { const e = new Error('query is required'); e.status = 400; throw e; }

  const cacheKey = q.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.url;

  const url = `${UNSPLASH_URL}?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.errors?.join('; ') || res.statusText;
    const e = new Error(`Unsplash ${res.status}: ${msg}`);
    // Unsplash returns 403 for both a bad key and an exhausted rate limit.
    e.status = res.status === 403 ? 429 : 502;
    throw e;
  }

  const photo = data?.results?.[0];
  if (!photo?.urls?.raw) { const e = new Error('No photo found'); e.status = 404; throw e; }
  const photoUrl = `${photo.urls.raw}&auto=format&fit=crop&w=1400&q=80`;

  cache.set(cacheKey, { url: photoUrl, expiresAt: Date.now() + CACHE_TTL_MS });
  return photoUrl;
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  if (req.method !== 'GET') return send(405, { error: 'GET only' });

  const rl = checkRateLimit(req, { limit: 60, windowMs: 5 * 60_000, bucket: 'photo' });
  if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

  const q = new URL(req.url, 'http://internal').searchParams.get('q');
  try {
    const url = await searchPhoto(q);
    return send(200, { url });
  } catch (e) {
    return send(e.status || 500, { error: String(e?.message || e) });
  }
}
