
/**
 * On-demand + whole-site AI translation engine.
 *
 * For any language WITHOUT a hand-written dictionary, the UI renders the English
 * source string first. Two things then happen:
 *   1. getTranslation() queues any single string that is rendered but not yet
 *      cached (covers dynamic / runtime content).
 *   2. translateAll() pre-translates the ENTIRE site dictionary in the
 *      background as soon as a language is selected, so navigating between pages
 *      is instant and never blocks the UI.
 *
 * Everything is batched and runs with a small concurrency cap, results are
 * cached in localStorage keyed by the ENGLISH source text, and it degrades
 * gracefully — no API key / offline / quota simply keeps showing English.
 */
import { translations } from './index';
import { LANG_MAP, isStaticLang } from './languages';

const STORAGE_PREFIX = 'maf_i18n_';
// Free-tier Gemini allows very few requests/day, so the #1 priority is sending
// as FEW requests as possible: huge batches, one at a time.
const BATCH_SIZE = 120;       // strings per Gemini request — whole site ≈ a handful of calls
const CONCURRENCY = 1;        // strictly sequential — never burst the rate limit
const FLUSH_DELAY = 200;      // ms to coalesce on-demand t() calls into one batch
const REQUEST_GAP = 1200;     // ms minimum spacing between request starts
const MAX_RETRIES = 5;        // network/429/5xx retries per batch before giving up
const MAX_ATTEMPTS = 3;       // total times a single string may be (re)queued before we keep English
const BREAKER_THRESHOLD = 4;  // consecutive 429s before we stop hammering and cool down
const COOLDOWN_MS = 90_000;   // how long to pause the engine once the breaker trips

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runtime translation now goes through the FREE Google Translate proxy
// (/api/translate), so there is no API key and no quota to worry about. Static
// languages (en, uz + manual.js) and any committed public/i18n/<lang>.json files
// are still used first (instant); the proxy only fills whatever's left.
const AI_ENABLED = true;

/** lang -> { [englishText]: translatedText } */
const cache = {};
/** lang -> Set(englishText) queued (on-demand) but not yet translated */
const pending = {};
/** lang -> Set(englishText) currently in-flight (avoid duplicate requests) */
const inflight = {};
const flushTimers = {};
const fullRuns = new Set();   // langs with an active whole-site pass
let currentTarget = null;     // the language we are actively pre-translating
/** lang -> Map(englishText -> attempt count) — bounds retries so we never loop forever */
const attempts = {};

/* ── Request throttle + circuit breaker ──────────────────────────────────
 * Serialises the START of every Gemini request with a minimum gap, so a
 * whole-site pass never bursts. When the API keeps returning 429 (free-tier
 * daily quota exhausted) the breaker trips and pauses the engine, instead of
 * spamming hundreds of doomed requests. */
let gateChain = Promise.resolve();
let lastRequestAt = 0;
let consecutive429 = 0;
let cooldownUntil = 0;          // epoch ms until which we make no requests
let breakerTrips = 0;           // consecutive cooldowns without a success between them

const inCooldown = () => Date.now() < cooldownUntil;

const rateGate = () => {
  gateChain = gateChain.then(async () => {
    const wait = Math.max(0, REQUEST_GAP - (Date.now() - lastRequestAt));
    if (wait) await sleep(wait);
    lastRequestAt = Date.now();
  });
  return gateChain;
};

const tripBreaker = (lang) => {
  consecutive429 = 0;
  breakerTrips += 1;
  // Back off progressively: 90s, 3m, 6m, … capped at 30m. A persistently 429ing
  // key means the daily quota is gone, so there's no point retrying often.
  const wait = Math.min(30 * 60_000, COOLDOWN_MS * 2 ** (breakerTrips - 1));
  cooldownUntil = Date.now() + wait;
  reportError(lang, new Error(
    `Gemini rate limit reached (HTTP 429). Pausing ${Math.round(wait / 1000)}s. ` +
    'The free tier has a small daily request quota — see the message below.',
  ));
  // Auto-resume the whole-site pass once the cooldown elapses (if still on it).
  setTimeout(() => {
    if (currentTarget === lang) { errorLogged = false; translateAll(lang); }
  }, wait + 1000);
};

/* ── Subscribers ─────────────────────────────────────────────────────── */
const listeners = new Set();          // fired when new strings get cached
const progressListeners = new Set();  // fired when the full-site pass advances
const notify = () => listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
const emitProgress = () => progressListeners.forEach((fn) => { try { fn(progress); } catch { /* ignore */ } });

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const subscribeProgress = (fn) => { progressListeners.add(fn); return () => progressListeners.delete(fn); };

let progress = { lang: null, done: 0, total: 0, running: false, error: null };
export const getProgress = () => progress;

let errorLogged = false;
const reportError = (lang, err) => {
  const msg = (err && err.message) || String(err);
  // Surface the *first* failure loudly so a bad key / quota is obvious, instead
  // of the UI silently staying English.
  if (!errorLogged) {
    errorLogged = true;
    console.error(
      `[MAFTRAVEL i18n] Translation request failed (${lang}): ${msg}\n` +
      'The site will keep showing English. Most common cause: an invalid or ' +
      'missing VITE_GEMINI_API_KEY. Get a key at https://aistudio.google.com/apikey',
    );
  }
  if (progress.lang === lang) {
    progress = { ...progress, error: msg };
    emitProgress();
  }
};

/* ── Cache persistence ───────────────────────────────────────────────── */
const loadCache = (lang) => {
  if (cache[lang]) return cache[lang];
  let parsed = {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + lang);
    if (raw) parsed = JSON.parse(raw) || {};
  } catch { /* corrupt cache — start fresh */ }
  cache[lang] = parsed;
  return parsed;
};

let persistTimers = {};
const persist = (lang) => {
  // Debounce writes — a full-site pass finishes dozens of batches quickly.
  clearTimeout(persistTimers[lang]);
  persistTimers[lang] = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + lang, JSON.stringify(cache[lang] || {}));
    } catch { /* quota / private mode — keep in memory only */ }
  }, 400);
};

/* ── Collect every English string in the merged dictionary ───────────── */
let allStringsCache = null;
const collectStrings = (node, out) => {
  if (typeof node === 'string') { const s = node.trim(); if (s) out.add(node); return; }
  if (Array.isArray(node)) { node.forEach((v) => collectStrings(v, out)); return; }
  if (node && typeof node === 'object') { for (const k in node) collectStrings(node[k], out); }
};
const getAllEnglishStrings = () => {
  if (allStringsCache) return allStringsCache;
  const set = new Set();
  collectStrings(translations.en, set);
  allStringsCache = [...set];
  return allStringsCache;
};

/* ── Gemini batch translation ────────────────────────────────────────── */
const isRetryable = (err) => {
  const s = err?.status;
  if (s === 429 || s === 408 || (s >= 500 && s <= 599)) return true;
  return /timed out|timeout|network|fetch|empty response/i.test(String(err?.message || ''));
};

// One batch → array of translations, with throttling, circuit breaker, and
// backoff retries that honour Gemini's own RetryInfo delay.
const callGeminiArray = async (lang, strings) => {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (currentTarget !== lang && fullRuns.has(lang)) return null; // user switched away
    if (inCooldown()) return null; // breaker tripped — stop hammering the API
    await rateGate();
    try {
      const base = (import.meta.env?.BASE_URL || '/');
      const res = await fetch(`${base}api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: strings, target: lang, source: 'en' }),
      });
      if (!res.ok) { const e = new Error(`translate ${res.status}`); e.status = res.status; throw e; }
      const data = await res.json();
      const arr = Array.isArray(data?.translations) ? data.translations : null;
      if (!arr) throw new Error('Unexpected response shape');
      consecutive429 = 0; // healthy response — reset the breaker
      breakerTrips = 0;
      return arr;
    } catch (err) {
      lastErr = err;
      if (err?.status === 429) {
        consecutive429 += 1;
        if (consecutive429 >= BREAKER_THRESHOLD) { tripBreaker(lang); return null; }
      } else {
        consecutive429 = 0;
      }
      if (attempt >= MAX_RETRIES || !isRetryable(err)) break;
      // Prefer the delay the API explicitly asked for; otherwise exponential.
      const base = err?.status === 429 ? 8000 : 1500;
      const backoff = Math.min(60_000, base * 2 ** attempt) + Math.floor(Math.random() * 600);
      const apiDelay = err?.retryAfterMs ? Math.min(60_000, Math.max(err.retryAfterMs, 1000)) : 0;
      await sleep(apiDelay || backoff);
    }
  }
  throw lastErr || new Error('Translation failed');
};

const translateBatch = async (lang, strings, { requeue = true } = {}) => {
  const meta = LANG_MAP[lang];
  if (!meta) { strings.forEach((s) => inflight[lang]?.delete(s)); return; }
  let leftovers = [];
  try {
    const arr = await callGeminiArray(lang, strings);
    if (arr) {
      const store = loadCache(lang);
      strings.forEach((src, i) => {
        const tr = arr[i];
        if (typeof tr === 'string' && tr.trim()) store[src] = tr;
        else leftovers.push(src); // model skipped / returned a short array
      });
      if (progress.lang === lang && progress.error) progress = { ...progress, error: null };
      persist(lang);
      notify();
    }
  } catch (err) {
    reportError(lang, err);
    leftovers = strings.slice(); // whole batch failed after retries
  } finally {
    strings.forEach((s) => inflight[lang]?.delete(s));
  }
  // On-demand path: re-queue leftovers (bounded by the attempt cap). The
  // whole-site pass passes requeue:false and re-sweeps them itself.
  if (requeue && leftovers.length && currentTarget === lang) {
    leftovers.forEach((s) => queueForTranslation(lang, s));
  }
};

/* ── On-demand path (single rendered strings) ────────────────────────── */
const flush = (lang) => {
  flushTimers[lang] = null;
  const queue = pending[lang];
  if (!queue || queue.size === 0) return;
  if (!AI_ENABLED) { queue.clear(); return; }
  inflight[lang] = inflight[lang] || new Set();
  const items = [...queue];
  queue.clear();
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE).filter((s) => !inflight[lang].has(s));
    if (chunk.length === 0) continue;
    chunk.forEach((s) => inflight[lang].add(s));
    translateBatch(lang, chunk);
  }
};

const queueForTranslation = (lang, text) => {
  if (!AI_ENABLED) return;
  if (loadCache(lang)[text]) return;          // already translated
  if (inflight[lang]?.has(text)) return;      // already being translated
  // Give up on a string that keeps failing, so we never loop forever.
  attempts[lang] = attempts[lang] || new Map();
  const n = (attempts[lang].get(text) || 0) + 1;
  if (n > MAX_ATTEMPTS) return;
  attempts[lang].set(text, n);
  pending[lang] = pending[lang] || new Set();
  pending[lang].add(text);
  if (!flushTimers[lang]) flushTimers[lang] = setTimeout(() => flush(lang), FLUSH_DELAY);
};

/**
 * Synchronously return the best string we have for `enText` in `lang`.
 * If it isn't translated yet, queue it and return the English source so the UI
 * never shows a blank or a raw key.
 */
export const getTranslation = (lang, enText) => {
  if (!enText || typeof enText !== 'string') return enText;
  const store = loadCache(lang);
  const hit = store[enText];
  if (hit) return hit;
  queueForTranslation(lang, enText);
  return enText;
};

/* ── Prebuilt (committed) dictionaries ───────────────────────────────────
 * Languages without a hand-written static dict can still load INSTANTLY and
 * with ZERO API calls if a committed translation file exists at
 * public/i18n/<lang>.json (a flat { englishText: translation } map — the same
 * shape as our cache). Generated offline by scripts/genTranslations.mjs.
 * We fetch it once per session and merge it straight into the cache; the normal
 * getTranslation() path then returns those strings immediately. Anything the
 * file is missing falls through to live AI (if enabled) or English. */
const prebuiltTried = new Set();
export const loadPrebuilt = async (lang) => {
  if (!lang || lang === 'en' || isStaticLang(lang) || prebuiltTried.has(lang)) return;
  prebuiltTried.add(lang);
  try {
    const base = (import.meta.env?.BASE_URL || '/');
    const res = await fetch(`${base}i18n/${lang}.json`, { cache: 'force-cache' });
    if (!res.ok) return;                       // no committed file for this language
    const data = await res.json();
    if (!data || typeof data !== 'object') return;
    const store = loadCache(lang);
    let added = 0;
    for (const k in data) {
      if (typeof data[k] === 'string' && data[k] && !store[k]) { store[k] = data[k]; added += 1; }
    }
    if (added) notify();                       // re-render with the freshly loaded strings
  } catch { /* offline / parse error — fall back to AI or English */ }
};

/* ── Whole-site pass ─────────────────────────────────────────────────── */
/**
 * Pre-translate the entire site dictionary into `lang` in the background.
 * Non-blocking: runs CONCURRENCY batches at a time, updates a progress object,
 * and stops early if the user switches to another language.
 */
export const translateAll = async (lang) => {
  currentTarget = lang;
  // Load committed translations first (instant, no API). If complete, the AI
  // pass below finds nothing left to do.
  await loadPrebuilt(lang);
  // Static languages (en, uz + manual.js) need no translation; with AI disabled
  // every other language simply falls back to English. Either way: no requests.
  if (lang === 'en' || isStaticLang(lang) || !AI_ENABLED) {
    progress = { lang, done: 0, total: 0, running: false, error: null };
    emitProgress();
    return;
  }
  if (fullRuns.has(lang)) return;
  fullRuns.add(lang);

  const all = getAllEnglishStrings();
  inflight[lang] = inflight[lang] || new Set();
  // Fresh retry budget on every explicit pass, so picking a language again
  // re-attempts anything that failed last time (e.g. transient rate limits).
  attempts[lang] = new Map();

  const covered = () => all.reduce((n, s) => (loadCache(lang)[s] ? n + 1 : n), 0);
  const remaining = () =>
    all.filter((s) => !loadCache(lang)[s] && !inflight[lang].has(s) && (attempts[lang].get(s) || 0) < MAX_ATTEMPTS);

  progress = { lang, total: all.length, done: covered(), running: true, error: null };
  emitProgress();

  // Sweep repeatedly: each leftover gets retried until it's cached or hits the
  // attempt cap. callGeminiArray already does network/429 backoff inside a
  // batch, so most rate-limit hits resolve without ever reaching a new sweep.
  for (let sweep = 0; sweep <= MAX_ATTEMPTS; sweep++) {
    if (currentTarget !== lang || inCooldown()) break;
    const todo = remaining();
    if (todo.length === 0) break;
    todo.forEach((s) => attempts[lang].set(s, (attempts[lang].get(s) || 0) + 1));

    const chunks = [];
    for (let i = 0; i < todo.length; i += BATCH_SIZE) chunks.push(todo.slice(i, i + BATCH_SIZE));

    let idx = 0;
    const worker = async () => {
      while (idx < chunks.length && currentTarget === lang) {
        const chunk = chunks[idx++].filter((s) => !inflight[lang].has(s) && !loadCache(lang)[s]);
        if (chunk.length === 0) continue;
        chunk.forEach((s) => inflight[lang].add(s));
        await translateBatch(lang, chunk, { requeue: false });
        if (progress.lang === lang) {
          progress = { ...progress, done: covered() };
          emitProgress();
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker));
  }

  fullRuns.delete(lang);
  if (progress.lang === lang) {
    const done = covered();
    // Only surface an error if literally nothing translated; partial coverage
    // (e.g. a few capped strings) is fine and shouldn't alarm the user.
    progress = { ...progress, running: false, done, error: done > 0 ? null : progress.error };
    emitProgress();
  }
};

/** Wipe a cached language and reset its retry budget (for "re-translate"). */
export const clearLangCache = (lang) => {
  delete cache[lang];
  delete attempts[lang];
  delete pending[lang];
  errorLogged = false;
  try { localStorage.removeItem(STORAGE_PREFIX + lang); } catch { /* ignore */ }
};

/** Force a full re-translation of a language from scratch. */
export const retranslate = (lang) => {
  clearLangCache(lang);
  return translateAll(lang);
};
