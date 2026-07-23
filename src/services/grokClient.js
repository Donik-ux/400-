/**
 * AI client (Groq-backed; function names kept as `askGrok` for history).
 *
 * History: this used to call xAI / Grok directly, then Google Gemini, both
 * directly from the browser with a VITE_-prefixed key. That key gets bundled
 * straight into the public JS by Vite, so anyone could read it out of the
 * built bundle and spend our quota — see api/aiAsk.js, which now holds the
 * real key server-only. This module just proxies to that endpoint.
 *
 * The exported API surface (askGrok, isGrokAvailable, extractJson) is kept
 * identical so the service files importing this module (aiPlannerService,
 * aiPackageService, flightService, travelServicesService) don't need changes.
 */

// A plain feature flag, not a secret — set alongside the real (server-only)
// GEMINI_API_KEY so the client knows whether to bother attempting AI calls.
export const isGrokAvailable = () => {
  const v = import.meta.env?.VITE_AI_ENABLED;
  return v === true || v === 'true' || v === '1';
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

const safeJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

/**
 * High-level call. Sends a prompt to our /api/aiAsk proxy (Gemini underneath),
 * returns the model's text output. Function name kept as `askGrok` so
 * dependents don't need to be touched.
 *
 * @param {string} prompt
 * @param {{ apiKey?: string, model?: string, temperature?: number, json?: boolean,
 *           signal?: AbortSignal, timeoutMs?: number }} opts
 * @returns {Promise<string>} model text output
 */
export const askGrok = async (prompt, opts = {}) => {
  const timeoutMs = opts.timeoutMs ?? 35_000;
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException('AI request timed out', 'TimeoutError')),
    timeoutMs,
  );
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort(opts.signal.reason);
    else opts.signal.addEventListener('abort', () => controller.abort(opts.signal.reason));
  }

  try {
    const base = (import.meta.env?.BASE_URL || '/');
    const res = await fetch(`${base}api/aiAsk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        temperature: opts.temperature ?? 0.7,
        json: !!opts.json,
        model: opts.model,
        // Only ever populated by a caller that explicitly passes its own key
        // (none do today) — the normal path relies on the server's own key.
        apiKey: opts.apiKey,
      }),
      signal: controller.signal,
    });
    const data = await safeJson(res);
    if (!res.ok || !data?.text) {
      const err = new Error(data?.error || `AI proxy ${res.status}`);
      err.status = res.status;
      if (res.status === 429) err.retryAfterMs = 8000;
      throw err;
    }
    return data.text;
  } finally {
    clearTimeout(timer);
  }
};
