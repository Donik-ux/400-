/**
 * MAFTRAVEL global language registry — 100+ languages.
 *
 * `en` and `uz` ship with hand-written static dictionaries (see
 * src/utils/translations.js + the modules in src/i18n). Every other language is
 * filled in by the AI translation engine (src/i18n/autoTranslate.js), which
 * translates the English source strings and caches the result in localStorage.
 * When a language is selected the engine pre-translates the WHOLE site in the
 * background (batched, non-blocking) so page navigation is instant.
 *
 * Fields:
 *   code   – the language key used everywhere (localStorage, store, t()).
 *   name   – English name (for search / accessibility).
 *   native – endonym shown in the picker.
 *   flag   – emoji flag.
 *   rtl    – true for right-to-left scripts (sets <html dir="rtl">).
 *   static – true when a hand-written dictionary exists (no AI needed).
 *   target – how the language is described to the AI translator.
 */
export const LANGUAGES = [
  // ── Core / widely spoken ──────────────────────────────────────────────
  { code: 'en',    name: 'English',              native: 'English',            flag: '🇺🇸', static: true, target: 'English' },
  { code: 'es',    name: 'Spanish',              native: 'Español',            flag: '🇪🇸', static: true, target: 'Spanish (Castilian)' },
  { code: 'fr',    name: 'French',               native: 'Français',           flag: '🇫🇷', static: true, target: 'French' },
  { code: 'de',    name: 'German',               native: 'Deutsch',            flag: '🇩🇪', static: true, target: 'German' },
  { code: 'it',    name: 'Italian',              native: 'Italiano',           flag: '🇮🇹', static: true, target: 'Italian' },
  { code: 'pt',    name: 'Portuguese',           native: 'Português',          flag: '🇵🇹', static: true, target: 'Portuguese' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)',  native: 'Português (Brasil)', flag: '🇧🇷', target: 'Brazilian Portuguese' },
  { code: 'ru',    name: 'Russian',              native: 'Русский',            flag: '🇷🇺', static: true, target: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文',            flag: '🇨🇳', target: 'Simplified Chinese' },
  { code: 'zh-TW', name: 'Chinese (Traditional)',native: '繁體中文',            flag: '🇹🇼', target: 'Traditional Chinese' },
  { code: 'yue',   name: 'Cantonese',            native: '粵語',                flag: '🇭🇰', target: 'Cantonese (Traditional Chinese script)' },
  { code: 'ja',    name: 'Japanese',             native: '日本語',              flag: '🇯🇵', static: true, target: 'Japanese' },
  { code: 'ko',    name: 'Korean',               native: '한국어',              flag: '🇰🇷', static: true, target: 'Korean' },
  { code: 'ar',    name: 'Arabic',               native: 'العربية',            flag: '🇸🇦', rtl: true, static: true, target: 'Modern Standard Arabic' },
  { code: 'tr',    name: 'Turkish',              native: 'Türkçe',             flag: '🇹🇷', static: true, target: 'Turkish' },
  { code: 'uz',    name: 'Uzbek',                native: 'Oʻzbekcha',          flag: '🇺🇿', static: true, target: 'Uzbek (Latin script)' },

  // ── South & Central Asia ──────────────────────────────────────────────
  { code: 'hi',    name: 'Hindi',                native: 'हिन्दी',              flag: '🇮🇳', static: true, target: 'Hindi' },
  { code: 'bn',    name: 'Bengali',              native: 'বাংলা',              flag: '🇧🇩', static: true, target: 'Bengali' },
  { code: 'ur',    name: 'Urdu',                 native: 'اردو',               flag: '🇵🇰', rtl: true, target: 'Urdu' },
  { code: 'pa',    name: 'Punjabi',              native: 'ਪੰਜਾਬੀ',             flag: '🇮🇳', target: 'Punjabi (Gurmukhi)' },
  { code: 'ta',    name: 'Tamil',                native: 'தமிழ்',              flag: '🇮🇳', target: 'Tamil' },
  { code: 'te',    name: 'Telugu',               native: 'తెలుగు',             flag: '🇮🇳', target: 'Telugu' },
  { code: 'mr',    name: 'Marathi',              native: 'मराठी',              flag: '🇮🇳', target: 'Marathi' },
  { code: 'gu',    name: 'Gujarati',             native: 'ગુજરાતી',            flag: '🇮🇳', target: 'Gujarati' },
  { code: 'kn',    name: 'Kannada',              native: 'ಕನ್ನಡ',              flag: '🇮🇳', target: 'Kannada' },
  { code: 'ml',    name: 'Malayalam',            native: 'മലയാളം',             flag: '🇮🇳', target: 'Malayalam' },
  { code: 'or',    name: 'Odia',                 native: 'ଓଡ଼ିଆ',              flag: '🇮🇳', target: 'Odia' },
  { code: 'as',    name: 'Assamese',             native: 'অসমীয়া',            flag: '🇮🇳', target: 'Assamese' },
  { code: 'sa',    name: 'Sanskrit',             native: 'संस्कृतम्',           flag: '🇮🇳', target: 'Sanskrit' },
  { code: 'ne',    name: 'Nepali',               native: 'नेपाली',             flag: '🇳🇵', target: 'Nepali' },
  { code: 'si',    name: 'Sinhala',              native: 'සිංහල',              flag: '🇱🇰', target: 'Sinhala' },
  { code: 'fa',    name: 'Persian',              native: 'فارسی',              flag: '🇮🇷', rtl: true, static: true, target: 'Persian (Farsi)' },
  { code: 'ps',    name: 'Pashto',               native: 'پښتو',               flag: '🇦🇫', rtl: true, target: 'Pashto' },
  { code: 'sd',    name: 'Sindhi',               native: 'سنڌي',               flag: '🇵🇰', rtl: true, target: 'Sindhi' },
  { code: 'dv',    name: 'Dhivehi',              native: 'ދިވެހި',             flag: '🇲🇻', rtl: true, target: 'Dhivehi (Maldivian)' },
  { code: 'ku',    name: 'Kurdish (Kurmanji)',   native: 'Kurdî',              flag: '🇹🇷', target: 'Kurdish (Kurmanji, Latin script)' },
  { code: 'ckb',   name: 'Kurdish (Sorani)',     native: 'کوردیی ناوەندی',     flag: '🇮🇶', rtl: true, target: 'Central Kurdish (Sorani)' },

  // ── Southeast & East Asia ─────────────────────────────────────────────
  { code: 'id',    name: 'Indonesian',           native: 'Bahasa Indonesia',   flag: '🇮🇩', static: true, target: 'Indonesian' },
  { code: 'ms',    name: 'Malay',                native: 'Bahasa Melayu',      flag: '🇲🇾', static: true, target: 'Malay' },
  { code: 'jv',    name: 'Javanese',             native: 'Basa Jawa',          flag: '🇮🇩', target: 'Javanese' },
  { code: 'su',    name: 'Sundanese',            native: 'Basa Sunda',         flag: '🇮🇩', target: 'Sundanese' },
  { code: 'fil',   name: 'Filipino',             native: 'Filipino',           flag: '🇵🇭', target: 'Filipino (Tagalog)' },
  { code: 'ceb',   name: 'Cebuano',              native: 'Cebuano',            flag: '🇵🇭', target: 'Cebuano' },
  { code: 'th',    name: 'Thai',                 native: 'ไทย',                flag: '🇹🇭', static: true, target: 'Thai' },
  { code: 'vi',    name: 'Vietnamese',           native: 'Tiếng Việt',         flag: '🇻🇳', static: true, target: 'Vietnamese' },
  { code: 'my',    name: 'Burmese',              native: 'မြန်မာ',             flag: '🇲🇲', target: 'Burmese' },
  { code: 'km',    name: 'Khmer',                native: 'ខ្មែរ',              flag: '🇰🇭', target: 'Khmer' },
  { code: 'lo',    name: 'Lao',                  native: 'ລາວ',                flag: '🇱🇦', target: 'Lao' },
  { code: 'mn',    name: 'Mongolian',            native: 'Монгол',             flag: '🇲🇳', target: 'Mongolian (Cyrillic)' },

  // ── Europe ────────────────────────────────────────────────────────────
  { code: 'nl',    name: 'Dutch',                native: 'Nederlands',         flag: '🇳🇱', static: true, target: 'Dutch' },
  { code: 'pl',    name: 'Polish',               native: 'Polski',             flag: '🇵🇱', static: true, target: 'Polish' },
  { code: 'uk',    name: 'Ukrainian',            native: 'Українська',         flag: '🇺🇦', static: true, target: 'Ukrainian' },
  { code: 'cs',    name: 'Czech',                native: 'Čeština',            flag: '🇨🇿', static: true, target: 'Czech' },
  { code: 'sk',    name: 'Slovak',               native: 'Slovenčina',         flag: '🇸🇰', static: true, target: 'Slovak' },
  { code: 'ro',    name: 'Romanian',             native: 'Română',             flag: '🇷🇴', static: true, target: 'Romanian' },
  { code: 'hu',    name: 'Hungarian',            native: 'Magyar',             flag: '🇭🇺', static: true, target: 'Hungarian' },
  { code: 'el',    name: 'Greek',                native: 'Ελληνικά',           flag: '🇬🇷', static: true, target: 'Greek' },
  { code: 'bg',    name: 'Bulgarian',            native: 'Български',           flag: '🇧🇬', static: true, target: 'Bulgarian' },
  { code: 'sr',    name: 'Serbian',              native: 'Српски',             flag: '🇷🇸', static: true, target: 'Serbian (Cyrillic)' },
  { code: 'hr',    name: 'Croatian',             native: 'Hrvatski',           flag: '🇭🇷', static: true, target: 'Croatian' },
  { code: 'bs',    name: 'Bosnian',              native: 'Bosanski',           flag: '🇧🇦', target: 'Bosnian' },
  { code: 'sl',    name: 'Slovenian',            native: 'Slovenščina',        flag: '🇸🇮', static: true, target: 'Slovenian' },
  { code: 'mk',    name: 'Macedonian',           native: 'Македонски',         flag: '🇲🇰', target: 'Macedonian' },
  { code: 'sq',    name: 'Albanian',             native: 'Shqip',              flag: '🇦🇱', target: 'Albanian' },
  { code: 'be',    name: 'Belarusian',           native: 'Беларуская',         flag: '🇧🇾', target: 'Belarusian' },
  { code: 'sv',    name: 'Swedish',              native: 'Svenska',            flag: '🇸🇪', static: true, target: 'Swedish' },
  { code: 'da',    name: 'Danish',               native: 'Dansk',              flag: '🇩🇰', static: true, target: 'Danish' },
  { code: 'no',    name: 'Norwegian',            native: 'Norsk',              flag: '🇳🇴', static: true, target: 'Norwegian (Bokmål)' },
  { code: 'fi',    name: 'Finnish',              native: 'Suomi',              flag: '🇫🇮', static: true, target: 'Finnish' },
  { code: 'is',    name: 'Icelandic',            native: 'Íslenska',           flag: '🇮🇸', target: 'Icelandic' },
  { code: 'fo',    name: 'Faroese',              native: 'Føroyskt',           flag: '🇫🇴', target: 'Faroese' },
  { code: 'et',    name: 'Estonian',             native: 'Eesti',              flag: '🇪🇪', target: 'Estonian' },
  { code: 'lv',    name: 'Latvian',              native: 'Latviešu',           flag: '🇱🇻', target: 'Latvian' },
  { code: 'lt',    name: 'Lithuanian',           native: 'Lietuvių',           flag: '🇱🇹', static: true, target: 'Lithuanian' },
  { code: 'ga',    name: 'Irish',                native: 'Gaeilge',            flag: '🇮🇪', target: 'Irish (Gaeilge)' },
  { code: 'gd',    name: 'Scottish Gaelic',      native: 'Gàidhlig',           flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', target: 'Scottish Gaelic' },
  { code: 'cy',    name: 'Welsh',                native: 'Cymraeg',            flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', target: 'Welsh' },
  { code: 'mt',    name: 'Maltese',              native: 'Malti',              flag: '🇲🇹', target: 'Maltese' },
  { code: 'eu',    name: 'Basque',               native: 'Euskara',            flag: '🇪🇸', target: 'Basque' },
  { code: 'ca',    name: 'Catalan',              native: 'Català',             flag: '🇪🇸', target: 'Catalan' },
  { code: 'gl',    name: 'Galician',             native: 'Galego',             flag: '🇪🇸', target: 'Galician' },
  { code: 'lb',    name: 'Luxembourgish',        native: 'Lëtzebuergesch',     flag: '🇱🇺', target: 'Luxembourgish' },
  { code: 'co',    name: 'Corsican',             native: 'Corsu',              flag: '🇫🇷', target: 'Corsican' },
  { code: 'la',    name: 'Latin',                native: 'Latina',             flag: '🏛️', target: 'Latin' },
  { code: 'eo',    name: 'Esperanto',            native: 'Esperanto',          flag: '🌐', target: 'Esperanto' },
  { code: 'yi',    name: 'Yiddish',              native: 'ייִדיש',             flag: '🇮🇱', rtl: true, target: 'Yiddish' },

  // ── Switzerland ───────────────────────────────────────────────────────
  { code: 'gsw',   name: 'Swiss German',         native: 'Schwiizerdütsch',    flag: '🇨🇭', target: 'Swiss German (Alemannic)' },
  { code: 'fr-CH', name: 'Swiss French',         native: 'Français (Suisse)',  flag: '🇨🇭', target: 'Swiss French' },
  { code: 'it-CH', name: 'Swiss Italian',        native: 'Italiano (Svizzera)',flag: '🇨🇭', target: 'Swiss Italian' },
  { code: 'rm',    name: 'Romansh',              native: 'Rumantsch',          flag: '🇨🇭', target: 'Romansh (Rumantsch Grischun)' },

  // ── Caucasus & Turkic ─────────────────────────────────────────────────
  { code: 'he',    name: 'Hebrew',               native: 'עברית',              flag: '🇮🇱', rtl: true, static: true, target: 'Hebrew' },
  { code: 'ka',    name: 'Georgian',             native: 'ქართული',            flag: '🇬🇪', target: 'Georgian' },
  { code: 'hy',    name: 'Armenian',             native: 'Հայերեն',            flag: '🇦🇲', target: 'Armenian' },
  { code: 'az',    name: 'Azerbaijani',          native: 'Azərbaycanca',       flag: '🇦🇿', static: true, target: 'Azerbaijani' },
  { code: 'kk',    name: 'Kazakh',               native: 'Қазақша',            flag: '🇰🇿', target: 'Kazakh' },
  { code: 'ky',    name: 'Kyrgyz',               native: 'Кыргызча',           flag: '🇰🇬', target: 'Kyrgyz' },
  { code: 'tg',    name: 'Tajik',                native: 'Тоҷикӣ',             flag: '🇹🇯', target: 'Tajik' },
  { code: 'tk',    name: 'Turkmen',              native: 'Türkmençe',          flag: '🇹🇲', target: 'Turkmen' },
  { code: 'tt',    name: 'Tatar',                native: 'Татарча',            flag: '🇷🇺', target: 'Tatar' },
  { code: 'ug',    name: 'Uyghur',               native: 'ئۇيغۇرچە',           flag: '🇨🇳', rtl: true, target: 'Uyghur' },

  // ── Africa ────────────────────────────────────────────────────────────
  { code: 'sw',    name: 'Swahili',              native: 'Kiswahili',          flag: '🇰🇪', target: 'Swahili' },
  { code: 'am',    name: 'Amharic',              native: 'አማርኛ',              flag: '🇪🇹', target: 'Amharic' },
  { code: 'ti',    name: 'Tigrinya',             native: 'ትግርኛ',              flag: '🇪🇷', target: 'Tigrinya' },
  { code: 'so',    name: 'Somali',               native: 'Soomaali',           flag: '🇸🇴', target: 'Somali' },
  { code: 'ha',    name: 'Hausa',                native: 'Hausa',              flag: '🇳🇬', target: 'Hausa' },
  { code: 'yo',    name: 'Yoruba',               native: 'Yorùbá',             flag: '🇳🇬', target: 'Yoruba' },
  { code: 'ig',    name: 'Igbo',                 native: 'Igbo',               flag: '🇳🇬', target: 'Igbo' },
  { code: 'zu',    name: 'Zulu',                 native: 'isiZulu',            flag: '🇿🇦', target: 'Zulu' },
  { code: 'xh',    name: 'Xhosa',                native: 'isiXhosa',           flag: '🇿🇦', target: 'Xhosa' },
  { code: 'af',    name: 'Afrikaans',            native: 'Afrikaans',          flag: '🇿🇦', target: 'Afrikaans' },
  { code: 'st',    name: 'Sesotho',              native: 'Sesotho',            flag: '🇱🇸', target: 'Sesotho (Southern Sotho)' },
  { code: 'sn',    name: 'Shona',                native: 'chiShona',           flag: '🇿🇼', target: 'Shona' },
  { code: 'ny',    name: 'Chichewa',             native: 'Chichewa',           flag: '🇲🇼', target: 'Chichewa (Nyanja)' },
  { code: 'rw',    name: 'Kinyarwanda',          native: 'Kinyarwanda',        flag: '🇷🇼', target: 'Kinyarwanda' },
  { code: 'lg',    name: 'Luganda',              native: 'Luganda',            flag: '🇺🇬', target: 'Luganda' },
  { code: 'mg',    name: 'Malagasy',             native: 'Malagasy',           flag: '🇲🇬', target: 'Malagasy' },
  { code: 'wo',    name: 'Wolof',                native: 'Wolof',              flag: '🇸🇳', target: 'Wolof' },
  { code: 'ak',    name: 'Akan',                 native: 'Akan',               flag: '🇬🇭', target: 'Akan (Twi)' },

  // ── Americas & Pacific ────────────────────────────────────────────────
  { code: 'ht',    name: 'Haitian Creole',       native: 'Kreyòl Ayisyen',     flag: '🇭🇹', target: 'Haitian Creole' },
  { code: 'qu',    name: 'Quechua',              native: 'Runa Simi',          flag: '🇵🇪', target: 'Quechua' },
  { code: 'gn',    name: 'Guarani',              native: 'Avañeʼẽ',            flag: '🇵🇾', target: 'Guarani' },
  { code: 'mi',    name: 'Maori',                native: 'Te Reo Māori',       flag: '🇳🇿', target: 'Maori' },
  { code: 'sm',    name: 'Samoan',               native: 'Gagana Sāmoa',       flag: '🇼🇸', target: 'Samoan' },
  { code: 'to',    name: 'Tongan',               native: 'Lea fakatonga',      flag: '🇹🇴', target: 'Tongan' },
  { code: 'fj',    name: 'Fijian',               native: 'Na Vosa Vakaviti',   flag: '🇫🇯', target: 'Fijian' },
  { code: 'haw',   name: 'Hawaiian',             native: 'ʻŌlelo Hawaiʻi',     flag: '🌺', target: 'Hawaiian' },
];

export const LANG_CODES = LANGUAGES.map((l) => l.code);

export const LANG_MAP = LANGUAGES.reduce((acc, l) => {
  acc[l.code] = l;
  return acc;
}, {});

export const isRTL = (code) => Boolean(LANG_MAP[code]?.rtl);
export const isStaticLang = (code) => Boolean(LANG_MAP[code]?.static);

export default LANGUAGES;
