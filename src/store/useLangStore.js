import { create } from 'zustand';
import { translations } from '../i18n';
import { LANG_CODES, LANG_MAP, isStaticLang, isRTL } from '../i18n/languages';
import {
  subscribe as subscribeAuto,
  subscribeProgress,
  getTranslation,
  translateAll,
  getProgress,
} from '../i18n/autoTranslate';

const readLang = () => {
  const saved = localStorage.getItem('lang');
  if (LANG_CODES.includes(saved)) return saved;
  // Fall back to the browser language if we support it, else English.
  const nav = (navigator?.language || '').toLowerCase();
  const match = LANG_CODES.find(
    (c) => c.toLowerCase() === nav || nav.startsWith(c.toLowerCase().split('-')[0]),
  );
  return match || 'en';
};

const applyDir = (lang) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
};

const initialLang = readLang();

const useLangStore = create((set) => ({
  lang: initialLang,
  // Bumped whenever a background AI translation batch lands, forcing re-render.
  version: 0,
  // Whole-site translation progress: { lang, done, total, running }.
  progress: getProgress(),
  setLang: (lang) => {
    const next = LANG_CODES.includes(lang) ? lang : 'en';
    localStorage.setItem('lang', next);
    applyDir(next);
    set({ lang: next });
    // Kick off the whole-site background translation (non-blocking).
    translateAll(next);
  },
}));

// Apply direction/lang on first load + pre-translate the whole site if needed.
applyDir(initialLang);
translateAll(initialLang);

// When the AI engine fills in new strings, nudge React to re-render.
subscribeAuto(() => useLangStore.setState((s) => ({ version: s.version + 1 })));
// Mirror whole-site translation progress into the store for the progress bar.
subscribeProgress((p) => useLangStore.setState({ progress: { ...p } }));

/* ── Resolve a dotted path against a dictionary ── */
const resolve = (path, dict) =>
  path.split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), dict);

export const useTranslation = () => {
  const lang = useLangStore((state) => state.lang);
  // Subscribe to `version` so components update as translations stream in.
  useLangStore((state) => state.version);

  const t = (path) => {
    const enVal = resolve(path, translations.en);

    if (lang === 'en') return enVal ?? path;

    // Languages with a hand-written dictionary (uz, es, fr, …): prefer it. For
    // any key the static dict is missing (e.g. newer features), gap-fill via the
    // AI translator instead of dropping back to raw English. Falls back to
    // English automatically when AI is disabled or a string isn't cached yet.
    if (isStaticLang(lang)) {
      const v = resolve(path, translations[lang]);
      if (v != null) return v;
      if (typeof enVal === 'string') return getTranslation(lang, enVal);
      return enVal ?? path;
    }

    // AI languages: only string leaves get translated; everything else
    // (arrays, objects, missing) falls back to the English source.
    if (typeof enVal !== 'string') return enVal ?? path;
    return getTranslation(lang, enVal);
  };

  return { t, lang, setLang: useLangStore.getState().setLang, langMeta: LANG_MAP[lang] };
};

export default useLangStore;
