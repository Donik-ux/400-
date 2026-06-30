/**
 * Translate a generated trip plan into the selected language using the FREE
 * Google Translate proxy (/api/translate). Used for plans produced by the
 * offline planner (English) so they show in the user's language without Gemini.
 *
 * Only descriptive text is translated. Addresses, coordinates, times, prices,
 * phone numbers and type enums are kept intact so maps/links keep working.
 */

// Object keys whose string values are human-readable and safe to translate.
const TRANSLATE_KEYS = new Set([
  'title', 'label', 'transportNote', 'place', 'name', 'transportToNext',
  'halalNote', 'cuisine', 'note', 'transportSuggestion', 'halalFoodGuide',
  'purpose', 'dates', 'duration', 'summary', 'areaTip', 'advice', 'area',
  'weekday', 'travelTips',
]);

const isTranslatable = (s) => typeof s === 'string' && s.trim() && /[A-Za-z]/.test(s);

const collect = (node, key, out) => {
  if (typeof node === 'string') {
    if (key && TRANSLATE_KEYS.has(key) && isTranslatable(node)) out.add(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((el) => {
      if (typeof el === 'string') { if (key && TRANSLATE_KEYS.has(key) && isTranslatable(el)) out.add(el); }
      else collect(el, null, out);
    });
    return;
  }
  if (node && typeof node === 'object') { for (const k in node) collect(node[k], k, out); }
};

const apply = (node, key, map) => {
  if (typeof node === 'string') return (key && TRANSLATE_KEYS.has(key) && map[node]) ? map[node] : node;
  if (Array.isArray(node)) {
    return node.map((el) => (typeof el === 'string'
      ? ((key && TRANSLATE_KEYS.has(key) && map[el]) ? map[el] : el)
      : apply(el, null, map)));
  }
  if (node && typeof node === 'object') {
    const o = {};
    for (const k in node) o[k] = apply(node[k], k, map);
    return o;
  }
  return node;
};

export async function localizePlan(plan, lang) {
  if (!plan || !lang || lang === 'en') return plan;
  const set = new Set();
  collect(plan, null, set);
  const list = [...set];
  if (!list.length) return plan;
  try {
    const base = (import.meta.env?.BASE_URL || '/');
    const res = await fetch(`${base}api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: list, target: lang, source: 'en' }),
    });
    if (!res.ok) return plan;
    const data = await res.json();
    const tr = data?.translations;
    if (!Array.isArray(tr) || tr.length !== list.length) return plan;
    const map = {};
    list.forEach((s, i) => { if (typeof tr[i] === 'string' && tr[i]) map[s] = tr[i]; });
    return apply(plan, null, map);
  } catch {
    return plan;
  }
}
