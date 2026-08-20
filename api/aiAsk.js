// Server-side proxy for Groq (askGrok in src/services/grokClient.js).
//
// Previously the browser called Gemini directly with a VITE_-prefixed key,
// which Vite bundles straight into the public JS — anyone could read it out
// of the built bundle and spend our quota. This endpoint keeps the real key
// server-only; the client only ever talks to /api/ai-ask.
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getApiKey = (override) => override || process.env.GROQ_API_KEY || '';
// llama-3.3-70b-versatile was decommissioned by Groq and every call 404'd, so
// the AI planner silently fell back to the offline template for every trip.
// gpt-oss-120b returns clean JSON; the qwen models on this account wrap their
// answers in <think> blocks, which the JSON parser cannot survive.
const getModel = (override) => override || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

const extractText = (json) => (json?.choices?.[0]?.message?.content || '').trim();

export async function askGroqServer({ prompt, temperature = 0.7, json = false, model, apiKey, maxTokens } = {}) {
  const key = getApiKey(apiKey);
  if (!key) { const e = new Error('NO_GROQ_KEY'); e.status = 501; throw e; }
  if (!prompt || typeof prompt !== 'string') { const e = new Error('prompt is required'); e.status = 400; throw e; }

  // Groq's default completion cap (4096 tokens) truncates a full multi-day
  // itinerary mid-JSON. Callers with large/variable output (day-by-day plans)
  // should pass their own `maxTokens` sized to what they're asking for — but
  // the ceiling here is the ACCOUNT's tokens-per-minute limit, counted as
  // prompt + max_tokens together. Asking for more than a minute's budget makes
  // the request fail outright instead of returning a shorter answer, so 6000
  // leaves room for a long itinerary prompt underneath an 8k/min cap.
  const cappedMaxTokens = Math.max(256, Math.min(6000, Number(maxTokens) || (json ? 4000 : 2000)));

  const chosenModel = getModel(model);

  const body = {
    model: chosenModel,
    temperature,
    max_tokens: cappedMaxTokens,
    messages: json
      ? [{ role: 'system', content: 'Respond with a single valid JSON object only — no markdown, no commentary.' }, { role: 'user', content: prompt }]
      : [{ role: 'user', content: prompt }],
    ...(json ? { response_format: { type: 'json_object' } } : {}),
    // gpt-oss spends completion tokens on reasoning before it writes anything.
    // At the default effort a day-by-day itinerary burns the budget thinking
    // and the JSON arrives truncated, which Groq rejects outright with
    // "Failed to validate JSON" — no partial answer, no plan. The structure is
    // already fully specified in the prompt, so there is little for it to
    // reason about; low effort spends the tokens on the answer instead.
    ...(/gpt-oss/.test(chosenModel) ? { reasoning_effort: 'low' } : {}),
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    const msg = data?.error?.message || data?.raw || res.statusText;
    const e = new Error(`Groq ${res.status}: ${String(msg).slice(0, 200)}`);
    e.status = res.status === 429 ? 429 : 502;
    throw e;
  }
  const text = extractText(data);
  if (!text) { const e = new Error('Groq returned an empty response'); e.status = 502; throw e; }
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

  if (typeof body?.prompt !== 'string' || body.prompt.length > 16000) {
    return send(400, { error: 'prompt is required and must be under 16000 characters' });
  }

  try {
    // model/apiKey are never taken from the client — always use server env config,
    // so a caller can't force a pricier model or spend the key on a foreign quota.
    const { prompt, temperature, json, maxTokens } = body;
    const text = await askGroqServer({ prompt, temperature, json, maxTokens });
    return send(200, { text });
  } catch (e) {
    return send(e.status || 500, { error: String(e?.message || e) });
  }
}
