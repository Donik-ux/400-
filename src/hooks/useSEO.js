import { useEffect } from 'react';

/**
 * useSEO — Har bir sahifa uchun <title>, meta description,
 * Open Graph, Twitter Card va canonical URL ni dinamik o'rnatadi.
 *
 * @param {object} options
 * @param {string} options.title        — Brauzer va axtaruvchi tab sarlavhasi
 * @param {string} options.description  — Meta description (max ~160 belgi)
 * @param {string} [options.image]      — OG image URL
 * @param {string} [options.url]        — Canonical URL (window.location.href bo'yicha default)
 * @param {string} [options.type]       — OG type: 'website' | 'article' (default: 'website')
 * @param {string[]} [options.keywords] — Meta keywords massivi
 */
export default function useSEO({ title, description, image, url, type = 'website', keywords = [] }) {
  useEffect(() => {
    const siteTitle = 'MAFTRAVEL';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const canonical = url || window.location.href;
    const ogImage   = image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80';

    // ── Basic ──────────────────────────────────
    document.title = fullTitle;
    setMeta('description',               description);
    setMeta('keywords',                  keywords.join(', '));
    setMeta('robots',                    'index, follow');
    setMeta('author',                    'MAFTRAVEL');

    // ── Canonical ──────────────────────────────
    setLink('canonical', canonical);

    // ── Open Graph ────────────────────────────
    setOG('og:title',       fullTitle);
    setOG('og:description', description);
    setOG('og:type',        type);
    setOG('og:url',         canonical);
    setOG('og:image',       ogImage);
    setOG('og:image:width', '1200');
    setOG('og:image:height','630');
    setOG('og:site_name',   siteTitle);
    setOG('og:locale',      'en_US');

    // ── Twitter Card ──────────────────────────
    setOG('twitter:card',        'summary_large_image');
    setOG('twitter:title',       fullTitle);
    setOG('twitter:description', description);
    setOG('twitter:image',       ogImage);

    // ── Schema.org JSON-LD ────────────────────
    setJSONLD({
      '@context': 'https://schema.org',
      '@type':    'TravelAgency',
      name:       siteTitle,
      url:        canonical,
      description,
      image:      ogImage,
      telephone:  '+996700000000',
      email:      'support@maftravel.com',
      address: {
        '@type':           'PostalAddress',
        addressCountry:    'KG',
        addressLocality:   'Bishkek',
      },
      sameAs: [],
    });
  }, [title, description, image, url, type, keywords.join(',')]);
}

/* ── helpers ── */
function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setOG(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

function setJSONLD(data) {
  let el = document.getElementById('jsonld-schema');
  if (!el) { el = document.createElement('script'); el.id = 'jsonld-schema'; el.type = 'application/ld+json'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data, null, 2);
}
