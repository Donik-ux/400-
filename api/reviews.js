// Public, unmoderated site reviews — backed by Upstash Redis (free REST API,
// no persistent TCP connection needed, works fine from a serverless function).
// GET  -> { reviews: [...] } newest first
// POST -> { review } accepts { name, city, rating, text }
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const REVIEWS_KEY = 'maf:reviews';
const MAX_REVIEWS = 200; // keep the list from growing unbounded

const getRedisUrl   = () => process.env.UPSTASH_REDIS_REST_URL || '';
const getRedisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function redisCommand(...args) {
  const url = getRedisUrl();
  const token = getRedisToken();
  if (!url || !token) { const e = new Error('NO_REDIS_CONFIG'); e.status = 501; throw e; }

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.error) {
    const e = new Error(`Redis error: ${data?.error || res.statusText}`);
    e.status = 502;
    throw e;
  }
  return data.result;
}

export async function listReviews(limit = 50) {
  const raw = await redisCommand('LRANGE', REVIEWS_KEY, 0, Math.max(0, limit - 1));
  return (raw || [])
    .map((s) => { try { return JSON.parse(s); } catch { return null; } })
    .filter(Boolean);
}

export async function addReview({ name, city, destination, rating, text } = {}) {
  const cleanName        = String(name || '').trim().slice(0, 60);
  const cleanCity        = String(city || '').trim().slice(0, 60);
  const cleanDestination = String(destination || '').trim().slice(0, 60);
  const cleanText        = String(text || '').trim().slice(0, 500);
  const cleanRating      = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

  if (!cleanName)                 { const e = new Error('Name is required');                e.status = 400; throw e; }
  if (cleanText.length < 10)      { const e = new Error('Review text is too short');         e.status = 400; throw e; }

  const review = { name: cleanName, city: cleanCity, destination: cleanDestination, rating: cleanRating, text: cleanText, createdAt: new Date().toISOString() };
  await redisCommand('LPUSH', REVIEWS_KEY, JSON.stringify(review));
  await redisCommand('LTRIM', REVIEWS_KEY, 0, MAX_REVIEWS - 1);
  return review;
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  if (req.method === 'GET') {
    const rl = checkRateLimit(req, { limit: 60, windowMs: 5 * 60_000, bucket: 'reviews-read' });
    if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);
    try {
      return send(200, { reviews: await listReviews(50) });
    } catch (e) {
      return send(e.status || 500, { error: String(e?.message || e), reviews: [] });
    }
  }

  if (req.method === 'POST') {
    // Public and unmoderated (by design) — keep submission tightly capped so
    // one visitor can't flood the list.
    const rl = checkRateLimit(req, { limit: 5, windowMs: 60 * 60_000, bucket: 'reviews-write' });
    if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

    let body;
    try {
      body = req.body;
      if (typeof body === 'string') body = JSON.parse(body || '{}');
      if (!body) {
        let raw = ''; for await (const c of req) raw += c;
        body = raw ? JSON.parse(raw) : {};
      }
    } catch {
      return send(400, { error: 'Invalid JSON body' });
    }

    try {
      return send(200, { review: await addReview(body) });
    } catch (e) {
      return send(e.status || 500, { error: String(e?.message || e) });
    }
  }

  return send(405, { error: 'GET or POST only' });
}
