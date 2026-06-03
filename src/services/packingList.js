/**
 * Generate a smart packing checklist for a trip.
 * Adapts to the season (derived from the start date) and trip length.
 * Pure / deterministic — no network, no keys.
 */

const HOT_DESTINATIONS = [
  'dubai', 'maldives', 'bali', 'thailand', 'bangkok', 'phuket', 'egypt', 'cairo',
  'qatar', 'doha', 'singapore', 'malaysia', 'goa', 'cancun', 'marrakech', 'abu dhabi',
];

const seasonFromMonth = (month) => {
  // Northern-hemisphere seasons
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month))  return 'spring';
  if ([5, 6, 7].includes(month))  return 'summer';
  return 'autumn';
};

const SEASON_LABEL = {
  winter: '❄️ Winter',
  spring: '🌸 Spring',
  summer: '☀️ Summer',
  autumn: '🍂 Autumn',
};

const clothingForSeason = (season, isHot, outfits) => {
  if (isHot || season === 'summer') {
    return [
      `${outfits} light outfits (breathable fabrics)`,
      'Shorts & t-shirts',
      'Swimwear',
      'Sandals + 1 pair of sneakers',
      'Sun hat / cap',
      'Light cardigan for AC indoors',
    ];
  }
  if (season === 'winter') {
    return [
      `${outfits} warm outfits (layerable)`,
      'Insulated winter coat',
      'Thermal base layers',
      'Gloves, scarf & warm hat',
      'Waterproof boots',
      'Wool socks',
    ];
  }
  // spring / autumn
  return [
    `${outfits} mixed outfits (layerable)`,
    'Light jacket + 1 warmer layer',
    'Long & short sleeve mix',
    'Comfortable walking shoes',
    'Compact umbrella / rain jacket',
  ];
};

/**
 * @param {{ destination?: string, startDate?: string, days?: number }} trip
 * @returns {{ season: string, seasonLabel: string, categories: {title:string,emoji:string,items:string[]}[] }}
 */
export function generatePackingList({ destination = '', startDate = '', days = 5 } = {}) {
  const d = startDate ? new Date(startDate) : new Date();
  const month  = Number.isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
  const season = seasonFromMonth(month);
  const isHot  = HOT_DESTINATIONS.some(c => destination.toLowerCase().includes(c));
  const nights = Math.max(1, Number(days) || 1);
  const outfits = Math.min(nights, 10); // cap — laundry beyond ~10 days

  const categories = [
    {
      title: 'Documents & Money',
      emoji: '📄',
      items: [
        'Passport (valid 6+ months)',
        'Printed flight tickets / boarding passes',
        'Hotel & booking confirmations',
        'Travel insurance policy',
        'Visa (if required)',
        '2 photocopies of passport (keep separate)',
        'Bank cards + some local cash',
        'Emergency contact list',
      ],
    },
    {
      title: `Clothing — ${SEASON_LABEL[season]}`,
      emoji: '👕',
      items: clothingForSeason(season, isHot, outfits),
    },
    {
      title: 'Electronics',
      emoji: '🔌',
      items: [
        'Phone + charger',
        'Universal travel adapter',
        'Power bank',
        'Headphones',
        ...(nights >= 5 ? ['Spare charging cable'] : []),
      ],
    },
    {
      title: 'Toiletries & Health',
      emoji: '🧴',
      items: [
        'Toothbrush & toothpaste',
        'Travel-size shampoo & soap',
        'Deodorant',
        'Personal medications + small first-aid kit',
        ...(isHot || season === 'summer' ? ['Sunscreen SPF 50', 'Insect repellent', 'Aloe vera gel'] : []),
        ...(season === 'winter' ? ['Lip balm & moisturizer'] : []),
      ],
    },
    {
      title: 'Smart Extras',
      emoji: '🎒',
      items: [
        'Reusable water bottle',
        'Day backpack',
        'Offline maps downloaded',
        'eSIM / local SIM plan',
        ...(nights >= 7 ? ['Laundry bag', 'Compression packing cubes'] : []),
      ],
    },
  ];

  return { season, seasonLabel: SEASON_LABEL[season], categories };
}
