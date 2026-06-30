/**
 * Modular i18n index.
 *
 * The monolithic dictionary in src/utils/translations.js is the BASE (en + uz).
 * Per-domain modules (home, flights, …) add namespaced keys, and src/i18n/manual.js
 * adds hand-written STATIC dictionaries for additional languages (ru, es, fr, …)
 * with NO API dependency. Everything is deep-merged per language.
 *
 * Any language that has at least one key anywhere is built here; missing keys for
 * a language fall back to English at lookup time (see useLangStore `t()`), and
 * languages with a static dictionary are marked `static:true` in languages.js.
 */
import { translations as base } from '../utils/translations';
import home from './home';
import flights from './flights';
import tours from './tours';
import discovery from './discovery';
import trip from './trip';
import account from './account';
import chrome from './chrome';
import manual from './manual';
import services from './services';

const modules = [home, flights, tours, discovery, trip, account, chrome, manual, services];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

const deepMerge = (a, b) => {
  const out = { ...a };
  for (const k in b) {
    out[k] = isObj(a[k]) && isObj(b[k]) ? deepMerge(a[k], b[k]) : b[k];
  }
  return out;
};

const mergeLang = (lang) =>
  modules.reduce((acc, m) => deepMerge(acc, m[lang] || {}), { ...(base[lang] || {}) });

// Collect every language code that appears in the base or any module.
const langCodes = new Set();
[base, ...modules].forEach((m) => Object.keys(m).forEach((code) => langCodes.add(code)));

export const translations = Object.fromEntries(
  [...langCodes].map((code) => [code, mergeLang(code)]),
);

export default translations;
