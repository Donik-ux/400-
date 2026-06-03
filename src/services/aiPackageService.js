/**
 * AI Package Studio
 * Given a single user balance + preferences, generates multiple complete
 * tour packages (destinations, prices, day-by-day plans) tailored to fit.
 *
 * Primary AI: Grok (xAI). Fallback: deterministic catalog generator.
 */
import { askGrok, isGrokAvailable, extractJson as extractJsonFromText } from './grokClient';

export const isAiAvailable = () => isGrokAvailable();

/* ── Curated destination catalog (used both as AI hints and as deterministic fallback) ── */
const CATALOG = [
  // Budget Saver (≤ $800 total per person)
  { city: 'Tashkent',      country: 'Uzbekistan',         tier: 1, vibe: ['city','cultural','warm'],          img: 'https://images.unsplash.com/photo-1573108724029-4c46571d6490?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Samarkand',     country: 'Uzbekistan',         tier: 1, vibe: ['cultural'],                        img: 'https://images.unsplash.com/photo-1604608672516-9656d6678f86?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Bishkek',       country: 'Kyrgyzstan',         tier: 1, vibe: ['nature','city'],                   img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Cairo',         country: 'Egypt',              tier: 1, vibe: ['cultural','warm'],                 img: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Istanbul',      country: 'Turkey',             tier: 1, vibe: ['city','cultural'],                 img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80' },

  // Smart Value (≤ $1500)
  { city: 'Bangkok',       country: 'Thailand',           tier: 2, vibe: ['city','warm','food'],              img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Kuala Lumpur',  country: 'Malaysia',           tier: 2, vibe: ['city','warm'],                     img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Marrakech',     country: 'Morocco',            tier: 2, vibe: ['cultural','warm'],                 img: 'https://images.unsplash.com/photo-1539020140153-e479b8c7d486?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Athens',        country: 'Greece',             tier: 2, vibe: ['cultural','warm','city'],          img: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Goa',           country: 'India',              tier: 2, vibe: ['beach','warm'],                    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },

  // Comfort (≤ $3000)
  { city: 'Dubai',         country: 'UAE',                tier: 3, vibe: ['city','warm','luxury'],            img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Bali',          country: 'Indonesia',          tier: 3, vibe: ['beach','nature','warm'],           img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Phuket',        country: 'Thailand',           tier: 3, vibe: ['beach','warm'],                    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Barcelona',     country: 'Spain',              tier: 3, vibe: ['city','cultural','warm'],          img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Lisbon',        country: 'Portugal',           tier: 3, vibe: ['city','warm','cultural'],          img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80' },

  // Premium (≤ $5000)
  { city: 'Tokyo',         country: 'Japan',              tier: 4, vibe: ['city','cultural'],                 img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Paris',         country: 'France',             tier: 4, vibe: ['city','cultural','luxury'],        img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Rome',          country: 'Italy',              tier: 4, vibe: ['cultural','warm','city'],          img: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Singapore',     country: 'Singapore',          tier: 4, vibe: ['city','warm','luxury'],            img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Seoul',         country: 'South Korea',        tier: 4, vibe: ['city','cultural'],                 img: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80' },

  // Luxury Signature (≥ $5000)
  { city: 'Maldives',      country: 'Maldives',           tier: 5, vibe: ['beach','luxury','warm'],           img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Bora Bora',     country: 'French Polynesia',   tier: 5, vibe: ['beach','luxury','warm'],           img: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Reykjavik',     country: 'Iceland',            tier: 5, vibe: ['nature','luxury'],                 img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Zermatt',       country: 'Switzerland',        tier: 5, vibe: ['nature','luxury'],                 img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80' },
  { city: 'Santorini',     country: 'Greece',             tier: 5, vibe: ['beach','luxury','warm'],           img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1200&q=80' },
];

const tierOf = (b) => b <= 800 ? 1 : b <= 1500 ? 2 : b <= 3000 ? 3 : b <= 5000 ? 4 : 5;
const tierLabel = ['Budget Saver','Smart Value','Comfort Class','Premium Escape','Luxury Signature'];

const VALID_VIBES = ['any','warm','beach','city','cultural','nature','luxury','food'];
export const sanitizeVibe = (v) => VALID_VIBES.includes(String(v || '').toLowerCase()) ? String(v).toLowerCase() : 'any';
const clampDays = (d) => Math.max(1, Math.min(21, Number(d) || 5));

const SAMPLE_INCLUDES = {
  1: ['Return flights from Bishkek','3★ hotel stay','Guided city tours','Daily breakfast','Halal restaurant guide'],
  2: ['Return flights','4★ hotel stay','Half-board meals','Local SIM card','Group day-trips'],
  3: ['Return flights','4★ resort with pool','Daily breakfast','Airport transfers','Spa voucher','Curated experiences'],
  4: ['Direct flights','5★ city hotel','Full breakfast','Private transfers','Skip-the-line tickets','Concierge service'],
  5: ['Business-class flights','5★ overwater villa','All-inclusive board','Private speedboat','Spa & wellness','Personal butler'],
};

/* ── Style-based budget split (matches aiPlannerService logic) ── */
const PCT = {
  economy:  { flight: 0.30, hotel: 0.24, food: 0.22, transport: 0.08, activities: 0.08, extra: 0.08 },
  standard: { flight: 0.25, hotel: 0.32, food: 0.18, transport: 0.07, activities: 0.10, extra: 0.08 },
  comfort:  { flight: 0.22, hotel: 0.36, food: 0.16, transport: 0.06, activities: 0.12, extra: 0.08 },
  luxury:   { flight: 0.20, hotel: 0.40, food: 0.14, transport: 0.05, activities: 0.13, extra: 0.08 },
};

const computeBreakdown = (price, style = 'standard') => {
  const p = PCT[style] || PCT.standard;
  return {
    flight:     Math.round(price * p.flight),
    hotel:      Math.round(price * p.hotel),
    food:       Math.round(price * p.food),
    transport:  Math.round(price * p.transport),
    activities: Math.round(price * p.activities),
    extra:      Math.round(price * p.extra),
    total:      price,
  };
};

/* ── Robust JSON extraction (re-exported from Grok client) ── */
const extractJson = extractJsonFromText;

/* ── Deterministic fallback — guarantees the page always works ── */
const fallbackPackages = ({ balance, days, vibe }) => {
  const t = tierOf(balance);
  const v = sanitizeVibe(vibe);
  const d = clampDays(days);
  let pool = CATALOG.filter(c => c.tier === t);

  // Vibe filtering with graceful fallback
  if (v !== 'any') {
    const filtered = pool.filter(c => c.vibe.includes(v));
    if (filtered.length >= 3) pool = filtered;
  }
  if (pool.length < 4) {
    // borrow from adjacent tier when too few options
    pool = pool.concat(CATALOG.filter(c => Math.abs(c.tier - t) <= 1));
  }
  // dedupe by city
  const seen = new Set();
  pool = pool.filter(p => { if (seen.has(p.city)) return false; seen.add(p.city); return true; });

  const seed = Math.floor(Date.now() / 60000) % pool.length;
  const rotated = pool.slice(seed).concat(pool.slice(0, seed));
  const picks = rotated.slice(0, 4);

  const styles = ['economy','standard','comfort','luxury'];
  // Every package honors the EXACT chosen days — no forced minimums.
  // Only the premium option can be one day longer if the trip is short.
  const dayMixes = [d, d, d, d <= 3 ? d + 1 : d];

  return picks.map((p, i) => {
    const tripDays = clampDays(dayMixes[i] || d);
    const priceFactor = [0.72, 0.84, 0.92, 0.99][i] || 0.85;
    const price = Math.round(balance * priceFactor);
    const style = styles[i] || 'standard';
    const includes = SAMPLE_INCLUDES[t] || SAMPLE_INCLUDES[3];
    return {
      destination: p.city,
      country: p.country,
      tier: tierLabel[t - 1],
      style,
      days: tripDays,
      price,
      image: p.img,
      rating: Number((4.6 + (i * 0.07)).toFixed(1)),
      reviews: 80 + ((i * 41 + balance) % 380),
      tagline: i === 0 ? 'Best value' : i === 1 ? 'Crowd favorite' : i === 2 ? 'Most experiences' : 'Top-tier choice',
      includes,
      highlights: tripDays === 1
        ? [`Arrival & full day in ${p.city}, evening departure`]
        : tripDays === 2
        ? [`Day 1 — Arrival, sunset welcome dinner in ${p.city}`,
           `Day 2 — Iconic city tour + departure flight`]
        : [
            `Day 1 — Arrival in ${p.city}, welcome dinner`,
            `Day 2 — Iconic city tour & local market`,
            `Day ${Math.ceil(tripDays / 2)} — Signature ${style} experience`,
            `Day ${tripDays} — Free time & departure`,
          ],
      breakdown: computeBreakdown(price, style),
      saving: Math.max(0, balance - price),
    };
  });
};

/* ── AI generator ────────────────────────────────────────────────── */
const buildPrompt = ({ balance, days, vibe, fromCity }) => {
  const t = tierOf(balance);
  const candidates = CATALOG
    .filter(c => Math.abs(c.tier - t) <= 1)
    .map(c => `${c.city}, ${c.country}`)
    .slice(0, 14)
    .join(' | ');

  return `You are a senior travel package designer for MAFTRAVEL.
The traveler has a total balance of $${balance} (USD) for one person and wants a trip of EXACTLY ${days} day${days === 1 ? '' : 's'}.
Vibe preference: ${vibe}. Departing from: ${fromCity || 'Bishkek, Kyrgyzstan'}.

Design EXACTLY 4 distinct tour packages, each using a DIFFERENT real destination.
Each total price MUST stay under $${balance} (use 70–99% of the balance: $${Math.round(balance * 0.7)}–$${Math.round(balance * 0.99)}).
Vary styles: one economy, one standard, one comfort, one luxury.
All four packages MUST use EXACTLY ${days} day${days === 1 ? '' : 's'} (do not change duration).

Prefer destinations from this list (but you may pick other real cities of similar cost level):
${candidates}

For each package include a realistic money breakdown that sums to the total price.

Return ONLY a JSON array, no markdown, no commentary. Schema:
[
  {
    "destination": "City name",
    "country": "Country",
    "style": "economy" | "standard" | "comfort" | "luxury",
    "days": ${days},
    "price": 1500,
    "tagline": "Short selling line (max 24 chars)",
    "rating": 4.7,
    "reviews": 218,
    "includes": ["Return flights", "4★ hotel", "Daily breakfast", "Airport transfers", "Two guided day-tours"],
    "highlights": [
      "Day 1 — Arrival in CITY, sunset welcome dinner",
      "Day 2 — Iconic neighborhood + local food tasting"
    ],
    "breakdown": {
      "flight": 400,
      "hotel": 600,
      "food": 250,
      "transport": 100,
      "activities": 120,
      "extra": 30
    }
  }
]
Rules:
- Every "destination" + "country" must be a REAL place.
- "highlights" must mention REAL attractions, neighborhoods, or districts of the destination.
- "highlights" must have exactly ${days} entr${days === 1 ? 'y' : 'ies'} (one per day) — never more, never fewer.
- Output exactly 4 objects.
- price MUST be ≤ ${balance}.
- breakdown values must sum to exactly the price.
- Do not duplicate destinations.`;
};

const normalizePackages = ({ balance, days, parsed }) => {
  if (!Array.isArray(parsed)) throw new Error('Bad shape');
  const requestedDays = clampDays(days);
  const t = tierOf(balance);

  return parsed.slice(0, 4).map((p, i) => {
    const style = ['economy','standard','comfort','luxury'].includes(p.style)
      ? p.style
      : ['economy','standard','comfort','luxury'][i] || 'standard';

    const matchImg = CATALOG.find(c =>
      c.city.toLowerCase() === String(p.destination || '').toLowerCase()
    );

    // Force days to user choice — AI sometimes drifts.
    const tripDays = requestedDays;
    const price = Math.min(Number(p.price) || balance, balance);

    // Use AI breakdown when it sums correctly, else recompute from style.
    let breakdown = null;
    if (p.breakdown && typeof p.breakdown === 'object') {
      const sum = ['flight','hotel','food','transport','activities','extra']
        .reduce((acc, k) => acc + (Number(p.breakdown[k]) || 0), 0);
      if (sum > 0 && Math.abs(sum - price) <= price * 0.15) {
        breakdown = {
          flight:     Math.round(Number(p.breakdown.flight)     || 0),
          hotel:      Math.round(Number(p.breakdown.hotel)      || 0),
          food:       Math.round(Number(p.breakdown.food)       || 0),
          transport:  Math.round(Number(p.breakdown.transport)  || 0),
          activities: Math.round(Number(p.breakdown.activities) || 0),
          extra:      Math.round(Number(p.breakdown.extra)      || 0),
          total:      price,
        };
      }
    }
    if (!breakdown) breakdown = computeBreakdown(price, style);

    let highlights = Array.isArray(p.highlights) ? p.highlights.slice(0, tripDays) : [];
    // Pad/truncate to tripDays so UI always shows the full trip.
    while (highlights.length < tripDays) {
      const dn = highlights.length + 1;
      highlights.push(dn === 1
        ? `Day 1 — Arrival in ${p.destination || 'destination'}, welcome dinner`
        : dn === tripDays
        ? `Day ${dn} — Free time & departure`
        : `Day ${dn} — City highlights & local cuisine`);
    }

    return {
      destination: p.destination || 'Mystery Destination',
      country:     p.country     || '',
      tier:        tierLabel[t - 1],
      style,
      days:        tripDays,
      price,
      tagline:     (p.tagline || ['Best value','Crowd favorite','Most experiences','Top-tier choice'][i] || '').slice(0, 32),
      rating:      Number(p.rating) || Number((4.6 + i * 0.07).toFixed(1)),
      reviews:     Number(p.reviews) || 100 + i * 70,
      includes:    Array.isArray(p.includes)   ? p.includes.slice(0, 6)   : SAMPLE_INCLUDES[t],
      highlights,
      image:       matchImg?.img || CATALOG[(i + Math.floor(Date.now()/600000)) % CATALOG.length].img,
      breakdown,
      saving:      Math.max(0, balance - price),
    };
  });
};

export const generateAiPackages = async ({ balance, days = 7, vibe = 'any', fromCity = '', apiKey, model } = {}) => {
  if (!balance) throw new Error('Balance is required');
  const cleanVibe = sanitizeVibe(vibe);
  const cleanDays = clampDays(days);

  if (isGrokAvailable()) {
    try {
      const prompt = buildPrompt({ balance, days: cleanDays, vibe: cleanVibe, fromCity });
      const raw = await askGrok(prompt, { apiKey, model, temperature: 0.85, json: true });
      const parsed = extractJson(raw);
      const packages = normalizePackages({ balance, days: cleanDays, parsed });
      if (packages.length >= 3) {
        return { packages, source: 'grok', tier: tierLabel[tierOf(balance) - 1] };
      }
    } catch (err) {
      console.warn('Grok package gen failed, using fallback:', err?.message);
    }
  }

  return {
    packages: fallbackPackages({ balance, days: cleanDays, vibe: cleanVibe }),
    source: 'fallback',
    tier: tierLabel[tierOf(balance) - 1],
  };
};

export { tierLabel, tierOf, CATALOG };
