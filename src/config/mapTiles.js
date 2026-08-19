/**
 * Where the map's raster tiles come from, and in which language.
 *
 * OpenStreetMap's own tiles only ever carry local-language labels — Cyrillic
 * across Russia, Arabic across Egypt — so a visitor reading the site in Spanish
 * still gets a map they cannot read. MapTiler serves the same OSM data with a
 * `language` parameter, which is the only part of the map we can actually
 * translate; everything else on it is drawn into the image.
 *
 * The key is unavoidably public: tile URLs are fetched by the browser, so no
 * server can hold it. That is why it is VITE_-prefixed here while every other
 * key in this project is server-side. Restrict it to your domains in the
 * MapTiler dashboard (Keys → allowed origins) — that, not secrecy, is what
 * stops someone else spending your quota.
 *
 * With no key configured the maps fall back to OpenStreetMap and simply keep
 * their local-language labels, exactly as before.
 */

const KEY = import.meta.env.VITE_MAPTILER_KEY || '';

/** MapTiler style id. `streets-v2` is the general-purpose OSM-derived map. */
const STYLE = 'streets-v2';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/** True when tiles can follow the interface language. */
export const localizedTiles = Boolean(KEY);

/**
 * The site speaks 126 languages, including regional codes like `zh-TW` and
 * `de-CH`; MapTiler wants a plain ISO 639-1 code. Take the base tag and let
 * MapTiler fall back to the local name when it has no label in that language.
 */
export const mapLanguage = (lang) => String(lang || 'en').split('-')[0].toLowerCase();

/** Tile URL template for Leaflet, in the given interface language. */
export const tileUrl = (lang) => (
  KEY
    ? `https://api.maptiler.com/maps/${STYLE}/{z}/{x}/{y}.png?key=${KEY}&language=${mapLanguage(lang)}`
    : OSM_URL
);
