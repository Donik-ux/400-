/* Display metadata for any ISO 4217 currency code — no hand-maintained lists.
   Names come from the browser's Intl.DisplayNames (localized), flags are
   derived from the country prefix of the code (UZS→UZ→🇺🇿). */

// The first two letters of most currency codes are the ISO country code.
// Supranational X-codes (XOF, XCD…) get a globe.
export const currencyFlag = (code) => {
  if (code === 'EUR') return '🇪🇺';
  if (code === 'ANG') return '🇨🇼';
  if (code.startsWith('X')) return '🌐';
  const cc = code.slice(0, 2);
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

// Returns a `(code) => localized name` lookup for the given UI language.
export const currencyNamer = (lang = 'en') => {
  let dn = null;
  try { dn = new Intl.DisplayNames([lang, 'en'], { type: 'currency' }); } catch { /* very old browser */ }
  return (code) => {
    try { return (dn && dn.of(code)) || code; } catch { return code; }
  };
};
