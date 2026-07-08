// Best-effort per-IP rate limiting for public serverless endpoints.
//
// Vercel functions are stateless across cold starts, so this in-memory map
// only holds for the lifetime of one warm lambda instance — it won't stop a
// determined, distributed attacker, but it does close the easy case (a
// script hammering /api/flights or /api/translate from a single machine and
// silently burning our Amadeus/Translate quota for every real visitor).
// For a stronger guarantee, swap this for a shared store (Upstash/Vercel KV).

const buckets = new Map();

// Periodic sweep so `buckets` doesn't grow unbounded on a long-lived instance.
let lastSweep = Date.now();
function sweep(windowMs) {
  const now = Date.now();
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length) buckets.set(key, fresh); else buckets.delete(key);
  }
}

function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {{ limit?: number, windowMs?: number, bucket?: string }} opts
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
export function checkRateLimit(req, { limit = 30, windowMs = 5 * 60_000, bucket = 'default' } = {}) {
  sweep(windowMs);
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterSec: 0 };
}

/** Sends a 429 with a Retry-After header. Returns nothing — caller should `return` right after. */
export function sendRateLimited(res, retryAfterSec) {
  res.setHeader?.('Retry-After', String(retryAfterSec));
  res.statusCode = 429;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Too many requests — please slow down.' }));
}
