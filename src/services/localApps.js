/**
 * City-aware recommendations for the apps that actually work best in a
 * given destination: ride-hailing / taxi, maps & navigation, and translators.
 *
 * Reuses resolveCountry() from emergencyContacts so "Berlin", "Berlin, Germany"
 * and "dubai" all resolve to the right country.
 */
import { resolveCountry } from './emergencyContacts';

/* ── App catalogue ── */
const A = {
  /* Taxi / ride-hailing */
  yandexGo: { name: 'Yandex Go',  icon: '🟡', reason: 'Лучшее в СНГ — дешёвые поездки, фикс-цена, оплата картой', link: 'https://go.yandex' },
  inDrive:  { name: 'inDrive',    icon: '🟢', reason: 'Вы сами предлагаете цену поездки — часто дешевле такси',   link: 'https://indrive.com' },
  careem:   { name: 'Careem',     icon: '🟢', reason: '№1 на Ближнем Востоке — такси, англ. интерфейс',          link: 'https://careem.com' },
  uber:     { name: 'Uber',       icon: '⬛', reason: 'Работает по всему миру — фикс-цена, оплата картой',        link: 'https://uber.com' },
  bolt:     { name: 'Bolt',       icon: '⚡', reason: 'Обычно дешевле Uber в Европе — быстрая подача',            link: 'https://bolt.eu' },
  freeNow:  { name: 'FreeNow',    icon: '🚖', reason: 'Официальное такси Европы — цена известна заранее',         link: 'https://free-now.com' },
  grab:     { name: 'Grab',       icon: '🟩', reason: '№1 в Юго-Восточной Азии — такси, еда, оплата',             link: 'https://grab.com' },
  lyft:     { name: 'Lyft',       icon: '🚗', reason: 'Главная альтернатива Uber в США и Канаде',                 link: 'https://lyft.com' },
  app99:    { name: '99',         icon: '🟨', reason: 'Самое популярное такси в Бразилии',                        link: 'https://99app.com' },
  didi:     { name: 'DiDi',       icon: '🧡', reason: 'Главный сервис такси в Китае и Латинской Америке',         link: 'https://didiglobal.com' },
  goJapan:  { name: 'GO',         icon: '🚕', reason: '№1 такси-приложение Японии — вызов обычного такси',        link: 'https://go.goinc.jp' },
  kakaoT:   { name: 'Kakao T',    icon: '🟡', reason: 'Главное такси Кореи — вызов и оплата в приложении',        link: 'https://kakaomobility.com' },
  ola:      { name: 'Ola',        icon: '🛺', reason: 'Популярное такси Индии — авто, мото и рикши',              link: 'https://olacabs.com' },
  biTaksi:  { name: 'BiTaksi',    icon: '🚕', reason: 'Вызов официального такси в Стамбуле и по Турции',          link: 'https://bitaksi.com' },

  /* Maps & navigation */
  googleMaps: { name: 'Google Maps', icon: '📍', reason: 'Лучшие карты мира — маршруты, отзывы, транспорт', link: 'https://maps.google.com' },
  twoGis:     { name: '2GIS',        icon: '🗺️', reason: 'Детальные офлайн-карты СНГ — здания, входы, фирмы', link: 'https://2gis.com' },
  yandexMaps: { name: 'Yandex Maps', icon: '🧭', reason: 'Лучший общественный транспорт в СНГ + пробки',      link: 'https://yandex.com/maps' },
  citymapper: { name: 'Citymapper',  icon: '🚇', reason: 'Идеально для метро и автобусов в крупных городах',  link: 'https://citymapper.com' },
  amap:       { name: 'Amap 高德',    icon: '🧭', reason: 'Главные карты Китая — Google Maps там не работает', link: 'https://amap.com' },
  naverMap:   { name: 'Naver Map',   icon: '🟢', reason: 'Точные карты Кореи — Google Maps там ограничен',     link: 'https://map.naver.com' },
  mapsme:     { name: 'Maps.me',     icon: '📡', reason: 'Офлайн-карты без интернета — выручают в роуминге',   link: 'https://maps.me' },

  /* Translators */
  googleTr:  { name: 'Google Translate',     icon: '🌐', reason: 'Камера, голос и офлайн-режим — 130+ языков',     link: 'https://translate.google.com' },
  deepl:     { name: 'DeepL',                icon: '🔷', reason: 'Самый точный перевод для европейских языков',     link: 'https://deepl.com' },
  microsoft: { name: 'Microsoft Translator', icon: '🟦', reason: 'Живой перевод разговора — работает и в Китае',    link: 'https://translator.microsoft.com' },
  yandexTr:  { name: 'Yandex Translate',     icon: '🟡', reason: 'Отлично переводит на русский и с русского',       link: 'https://translate.yandex.com' },
  papago:    { name: 'Papago',               icon: '🦜', reason: 'Лучший перевод для корейского и азиатских языков', link: 'https://papago.naver.com' },
  baiduTr:   { name: 'Baidu Translate',      icon: '🔵', reason: 'Работает в Китае, где Google недоступен',         link: 'https://fanyi.baidu.com' },
};

/* ── Regional presets ── */
const REGIONS = {
  cis:     { taxi: [A.yandexGo, A.inDrive],     maps: [A.twoGis, A.yandexMaps, A.googleMaps], translator: [A.googleTr, A.yandexTr]   },
  gulf:    { taxi: [A.careem, A.uber],          maps: [A.googleMaps, A.mapsme],               translator: [A.googleTr, A.microsoft]  },
  sea:     { taxi: [A.grab, A.uber],            maps: [A.googleMaps, A.mapsme],               translator: [A.googleTr, A.microsoft]  },
  europe:  { taxi: [A.bolt, A.uber, A.freeNow], maps: [A.googleMaps, A.citymapper],           translator: [A.deepl, A.googleTr]      },
  northAm: { taxi: [A.uber, A.lyft],            maps: [A.googleMaps, A.citymapper],           translator: [A.googleTr, A.microsoft]  },
  latam:   { taxi: [A.uber, A.didi],            maps: [A.googleMaps, A.mapsme],               translator: [A.googleTr, A.deepl]      },
  default: { taxi: [A.uber, A.bolt],            maps: [A.googleMaps, A.mapsme],               translator: [A.googleTr, A.microsoft]  },
};

/* ── Country → region ── */
const COUNTRY_REGION = {
  Kyrgyzstan: 'cis', Kazakhstan: 'cis', Uzbekistan: 'cis', Tajikistan: 'cis',
  Russia: 'cis', Azerbaijan: 'cis', Georgia: 'cis', Armenia: 'cis',
  UAE: 'gulf', Qatar: 'gulf', 'Saudi Arabia': 'gulf', Egypt: 'gulf',
  Jordan: 'gulf', Morocco: 'gulf', Israel: 'gulf',
  Thailand: 'sea', Vietnam: 'sea', Indonesia: 'sea', Malaysia: 'sea',
  Singapore: 'sea', Maldives: 'sea',
  Germany: 'europe', France: 'europe', Italy: 'europe', Spain: 'europe',
  Portugal: 'europe', Netherlands: 'europe', Belgium: 'europe', Switzerland: 'europe',
  Austria: 'europe', Greece: 'europe', Poland: 'europe', Czechia: 'europe', UK: 'europe',
  USA: 'northAm', Canada: 'northAm',
  Mexico: 'latam', Brazil: 'latam', Argentina: 'latam',
};

/* ── Country-specific overrides (replace the regional preset entirely) ── */
const COUNTRY_OVERRIDE = {
  China:         { taxi: [A.didi],            maps: [A.amap, A.googleMaps],     translator: [A.baiduTr, A.microsoft] },
  Japan:         { taxi: [A.goJapan, A.uber], maps: [A.googleMaps],             translator: [A.googleTr, A.deepl]    },
  'South Korea': { taxi: [A.kakaoT, A.uber],  maps: [A.naverMap, A.googleMaps], translator: [A.papago, A.googleTr]   },
  India:         { taxi: [A.ola, A.uber],     maps: [A.googleMaps],             translator: [A.googleTr]             },
  Turkey:        { taxi: [A.biTaksi, A.uber], maps: [A.googleMaps],             translator: [A.googleTr, A.deepl]    },
  Brazil:        { taxi: [A.app99, A.uber],   maps: [A.googleMaps],             translator: [A.googleTr, A.deepl]    },
};

/**
 * Get the taxi / maps / translator apps recommended for a destination.
 * Always returns a usable object (falls back to global defaults).
 * @param {string} destination - city or "City, Country" string
 */
export function getLocalApps(destination = '') {
  const country = resolveCountry(destination);
  const preset =
    (country && COUNTRY_OVERRIDE[country]) ||
    (country && REGIONS[COUNTRY_REGION[country]]) ||
    REGIONS.default;

  return {
    country: country || destination || 'this destination',
    taxi:       preset.taxi,
    maps:       preset.maps,
    translator: preset.translator,
  };
}
