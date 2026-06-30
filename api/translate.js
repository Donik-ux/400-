// Free translation proxy → Google Translate (no API key).
//
// Runs server-side so the browser never hits Google directly (which would be
// blocked by CORS). Used by the runtime i18n engine and the trip-plan localizer
// so translation no longer depends on the rate-limited Gemini quota.
//
// Works on Vercel (default export handler) and under `npm run dev`
// (named `translateStrings` is used by the Vite middleware in vite.config.js).

// Map our language codes → Google Translate codes where they differ.
const GCODE = {
  'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', yue: 'zh-TW', fil: 'tl', he: 'iw',
  gsw: 'de', 'fr-CH': 'fr', 'it-CH': 'it', jv: 'jw', 'pt-BR': 'pt', nb: 'no', nn: 'no',
};
const gcode = (c) => GCODE[c] || String(c || 'en').split('-')[0];

async function gtranslate(text, target, source = 'en') {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(gcode(target))}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) { const e = new Error(`google ${res.status}`); e.status = res.status; throw e; }
  const data = await res.json();
  return (data?.[0] || []).map((s) => s?.[0] ?? '').join('');
}

// Group strings into requests under a character budget; isolate multi-line ones
// (newline-join batching relies on 1 line == 1 string).
function chunkByChars(list, maxChars = 1400) {
  const chunks = [];
  let cur = [], len = 0;
  for (const s of list) {
    if (typeof s !== 'string' || s.includes('\n')) {
      if (cur.length) { chunks.push(cur); cur = []; len = 0; }
      chunks.push([s]);
      continue;
    }
    if (len + s.length > maxChars && cur.length) { chunks.push(cur); cur = []; len = 0; }
    cur.push(s); len += s.length + 1;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

/** Translate an array of strings, preserving order. Returns the same length. */
export async function translateStrings({ q, target, source = 'en' }) {
  const list = Array.isArray(q) ? q : [q];
  if (!target || target === 'en') return list.slice();
  const out = new Array(list.length);
  // index map so we can write results back in original order
  const indexOf = new Map();
  list.forEach((s, i) => { if (!indexOf.has(s)) indexOf.set(s, []); indexOf.get(s).push(i); });
  const unique = [...indexOf.keys()];

  const chunks = chunkByChars(unique);
  const results = {};
  for (const chunk of chunks) {
    if (chunk.length === 1) {
      const s = chunk[0];
      try { results[s] = (typeof s === 'string' && s.trim()) ? await gtranslate(s, target, source) : s; }
      catch { results[s] = s; }
      continue;
    }
    let ok = false;
    try {
      const full = await gtranslate(chunk.join('\n'), target, source);
      const parts = full.split('\n');
      if (parts.length === chunk.length) { chunk.forEach((s, j) => { results[s] = parts[j] || s; }); ok = true; }
    } catch { /* fall through to per-string */ }
    if (!ok) {
      for (const s of chunk) { try { results[s] = await gtranslate(s, target, source); } catch { results[s] = s; } }
    }
  }
  unique.forEach((s) => { indexOf.get(s).forEach((i) => { out[i] = results[s] ?? s; }); });
  return out;
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body && req.method === 'POST') {
      let raw = ''; for await (const c of req) raw += c;
      body = raw ? JSON.parse(raw) : {};
    }
    if (!body || !body.q) return send(400, { error: 'missing q' });
    const translations = await translateStrings(body);
    return send(200, { translations });
  } catch (e) {
    return send(500, { error: String(e?.message || e) });
  }
}
