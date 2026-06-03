/**
 * Modular i18n index.
 *
 * The existing monolithic dictionary in src/utils/translations.js is the BASE.
 * Each per-domain module (home, flights, tours, …) contributes its own
 * namespaced keys for `en` and `uz` (Uzbek, Latin script). They are deep-merged
 * here so pages can keep using the same useTranslation()/t('namespace.key') API.
 *
 * Rule for modules: use a UNIQUE top-level namespace (e.g. `homePage`,
 * `flightsPage`) so nothing in the base dictionary gets clobbered.
 */
import { translations as base } from '../utils/translations';
import home from './home';
import flights from './flights';
import tours from './tours';
import discovery from './discovery';
import trip from './trip';
import account from './account';
import chrome from './chrome';

const modules = [home, flights, tours, discovery, trip, account, chrome];

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

export const translations = {
  en: mergeLang('en'),
  uz: mergeLang('uz'),
};

export default translations;
