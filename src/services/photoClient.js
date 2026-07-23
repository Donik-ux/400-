/**
 * Client for the live destination-photo proxy (/api/photo, Unsplash-backed).
 * Used by SmartImage to upgrade a static/placeholder photo to a real, current
 * photo of the actual place — and to self-heal when a hard-coded photo ID
 * has been taken down from Unsplash (404).
 */
const STORAGE_PREFIX = 'maf_photo_';
const CACHE_TTL_MS = 24 * 60 * 60_000;

const inflight = new Map(); // normalized query -> Promise<string|null>

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return undefined;
    const { url, expiresAt } = JSON.parse(raw);
    if (!url || expiresAt < Date.now()) return undefined;
    return url;
  } catch { return undefined; }
};

const writeCache = (key, url) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ url, expiresAt: Date.now() + CACHE_TTL_MS }));
  } catch { /* storage full/unavailable — cache is best-effort */ }
};

/** Resolves to a live photo URL for `query`, or null if unavailable (no key, offline, no match). */
export const fetchLivePhoto = async (query) => {
  const q = String(query || '').trim();
  if (!q) return null;

  const key = q.toLowerCase();
  const cached = readCache(key);
  if (cached) return cached;

  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const base = (import.meta.env?.BASE_URL || '/');
      const res = await fetch(`${base}api/photo?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) return null;
      writeCache(key, data.url);
      return data.url;
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
};
