/**
 * AI client (Gemini-backed, Grok-compatible shim).
 *
 * History: this used to call xAI / Grok directly. We switched to Google Gemini
 * because (a) Gemini has a generous free tier, (b) the xAI account had no
 * credits, (c) Gemini handles Russian / Uzbek noticeably better.
 *
 * The exported API surface (askGrok, isGrokAvailable, extractJson) is kept
 * identical so the three service files importing this module (aiPlannerService,
 * aiPackageService, flightService) don't need any changes.
 */

const GEMINI_URL = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

const getApiKey = (override) =>
  override ||
  import.meta.env?.VITE_GEMINI_API_KEY ||
  import.meta.env?.VITE_GOOGLE_API_KEY ||
  // Legacy fallback — old code paths may still pass the Grok key explicitly.
  import.meta.env?.VITE_GROK_API_KEY ||
  '';

const getModel = (override) =>
  override ||
  import.meta.env?.VITE_GEMINI_MODEL ||
  'gemini-2.5-flash';

export const isGrokAvailable = () => Boolean(getApiKey());

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

// Pull plain text out of Gemini's response shape:
// { candidates: [ { content: { parts: [ { text: '...' } ] } } ] }
const extractText = (json) => {
  if (!json) return '';
  if (typeof json === 'string') return json;
  const parts = json?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts.map((p) => p?.text || '').join('').trim();
  }
  return '';
};

/**
 * High-level call. Sends a prompt to Gemini, returns the model's text output.
 * Function name kept as `askGrok` so dependents don't need to be touched.
 *
 * @param {string} prompt
 * @param {{ apiKey?: string, model?: string, temperature?: number, json?: boolean,
 *           signal?: AbortSignal, timeoutMs?: number }} opts
 * @returns {Promise<string>} model text output
 */
export const askGrok = async (prompt, opts = {}) => {
  const key = getApiKey(opts.apiKey);
  if (!key) throw new Error('NO_GEMINI_KEY');
  const model = getModel(opts.model);

  const timeoutMs = opts.timeoutMs ?? 35_000;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException('Gemini request timed out', 'TimeoutError')),
    timeoutMs,
  );
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort(opts.signal.reason);
    else opts.signal.addEventListener('abort', () => controller.abort(opts.signal.reason));
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  try {
    const res = await fetch(GEMINI_URL(model, key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await safeJson(res);
    if (!res.ok) {
      const msg = data?.error?.message || data?.raw || res.statusText;
      const err = new Error(`Gemini ${res.status}: ${String(msg).slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    const text = extractText(data);
    if (!text) throw new Error('Gemini returned an empty response');
    return text;
  } finally {
    clearTimeout(timer);
  }
};

/* ── Robust JSON extraction from a model's text answer ── */
export const extractJson = (text) => {
  if (!text) throw new Error('Empty model response');
  let s = String(text).trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const idxObj = s.indexOf('{');
  const idxArr = s.indexOf('[');
  const startCh = idxArr === -1 ? '{' : idxObj === -1 ? '[' : (idxArr < idxObj ? '[' : '{');
  const endCh   = startCh === '{' ? '}' : ']';
  const first = s.indexOf(startCh);
  const last  = s.lastIndexOf(endCh);
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);

  return JSON.parse(s);
};
