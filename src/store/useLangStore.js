import { create } from 'zustand';
import { translations } from '../i18n';

const SUPPORTED = ['en', 'uz'];
const readLang = () => {
  const saved = localStorage.getItem('lang');
  return SUPPORTED.includes(saved) ? saved : 'en';
};

const useLangStore = create((set) => ({
  lang: readLang(),
  setLang: (lang) => {
    const next = SUPPORTED.includes(lang) ? lang : 'en';
    localStorage.setItem('lang', next);
    set({ lang: next });
  },
}));

export const useTranslation = () => {
  const lang = useLangStore((state) => state.lang);
  
  const t = (path) => {
    const dict = translations[lang] || translations['en'];
    const result = path.split('.').reduce((obj, key) => obj?.[key], dict);
    return result ?? path;
  };

  return { t, lang, setLang: useLangStore.getState().setLang };
};

export default useLangStore;
