// Server-side proxy for Gemini (askGrok in src/services/grokClient.js).
//
// Previously the browser called Gemini directly with a VITE_-prefixed key,
// which Vite bundles straight into the public JS — anyone could read it out
// of the built bundle and spend our quota. This endpoint keeps the real key
// server-only; the client only ever talks to /api/ai-ask.
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const GEMINI_URL = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

// GEMINI_API_KEY is the canonical server-only name going forward. The
// VITE_-prefixed one is read too so existing Vercel env vars keep working
// during migration — but it should be renamed (dropping VITE_) and removed
// from anywhere client code could read it.
const getApiKey = (override) =>
  override || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const getModel = (override) => override || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

const extractText = (json) => {
  if (!json) return '';
  const parts = json?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map((p) => p?.text || '').join('').trim() : '';
};

export async function askGeminiServer({ prompt, temperature = 0.7, json = false, model, apiKey } = {}) {
  const key = getApiKey(apiKey);
  if (!key) { const e = new Error('NO_GEMINI_KEY'); e.status = 501; throw e; }
  if (!prompt || typeof prompt !== 'string') { const e = new Error('prompt is required'); e.status = 400; throw e; }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(GEMINI_URL(getModel(model), key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const msg = data?.error?.message || data?.raw || res.statusText;
    const e = new Error(`Gemini ${res.status}: ${String(msg).slice(0, 200)}`);
    e.status = res.status >= 400 && res.status < 500 ? 502 : 502;
    throw e;
  }
  const text = extractText(data);
  if (!text) { const e = new Error('Gemini returned an empty response'); e.status = 502; throw e; }
  return text;
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  if (req.method !== 'POST') return send(405, { error: 'POST only' });

  // AI calls are the most expensive/quota-limited resource we proxy — keep
  // the cap tight.
  const rl = checkRateLimit(req, { limit: 20, windowMs: 5 * 60_000, bucket: 'ai-ask' });
  if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body && req.method === 'POST') {
      let raw = ''; for await (const c of req) raw += c;
      body = raw ? JSON.parse(raw) : {};
    }
    const text = await askGeminiServer(body || {});
    return send(200, { text });
  } catch (e) {
    return send(e.status || 500, { error: String(e?.message || e) });
  }
}
