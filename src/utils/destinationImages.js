/**
 * Deterministic hero image for any destination string.
 * Used when the trip plan has no explicit image (direct-mode entry from search widget).
 */

const HEROES = {
  // Europe
  berlin:      'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1400&q=80',
  paris:       'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80',
  rome:        'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1400&q=80',
  florence:    'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1400&q=80',
  venice:      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80',
  milan:       'https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=1400&q=80',
  barcelona:   'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=80',
  madrid:      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1400&q=80',
  lisbon:      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=80',
  amsterdam:   'https://images.unsplash.com/photo-1534351590666-13e3e96c5017?auto=format&fit=crop&w=1400&q=80',
  vienna:      'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1400&q=80',
  prague:      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1400&q=80',
  budapest:    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1400&q=80',
  warsaw:      'https://images.unsplash.com/photo-1607427293702-036933bbf746?auto=format&fit=crop&w=1400&q=80',
  zurich:      'https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?auto=format&fit=crop&w=1400&q=80',
  athens:      'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1400&q=80',
  santorini:   'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1400&q=80',
  zermatt:     'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=80',
  reykjavik:   'https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1400&q=80',
  london:      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',

  // Middle East
  dubai:       'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
  'abu dhabi': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=80',
  istanbul:    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
  cairo:       'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1400&q=80',
  marrakech:   'https://images.unsplash.com/photo-1539020140153-e479b8c7d486?auto=format&fit=crop&w=1400&q=80',
  doha:        'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1400&q=80',
  amman:       'https://images.unsplash.com/photo-1568384917999-1f0c0c41bdf2?auto=format&fit=crop&w=1400&q=80',
  petra:       'https://images.unsplash.com/photo-1563177978-4c5d8d5e0a51?auto=format&fit=crop&w=1400&q=80',
  riyadh:      'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1400&q=80',

  // Asia
  tokyo:       'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80',
  kyoto:       'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80',
  osaka:       'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1400&q=80',
  beijing:     'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=80',
  shanghai:    'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1400&q=80',
  seoul:       'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1400&q=80',
  bangkok:     'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
  phuket:      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1400&q=80',
  singapore:   'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
  'kuala lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=80',
  bali:        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
  jakarta:     'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1400&q=80',
  hanoi:       'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1400&q=80',
  delhi:       'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=80',
  mumbai:      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1400&q=80',
  goa:         'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=80',
  maldives:    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80',
  seychelles:  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80',
  mauritius:   'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=1400&q=80',

  // Americas
  'new york':  'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=80',
  nyc:         'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1400&q=80',
  miami:       'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1400&q=80',
  'las vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1400&q=80',
  toronto:     'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1400&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1400&q=80',
  cancun:      'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=1400&q=80',
  'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80',
  rio:         'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80',
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1400&q=80',

  // Oceania
  sydney:      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=80',
  melbourne:   'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=1400&q=80',
  auckland:    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1400&q=80',
  'bora bora': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80',

  // CIS / Central Asia
  bishkek:     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
  osh:         'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  tashkent:    'https://images.unsplash.com/photo-1573108724029-4c46571d6490?auto=format&fit=crop&w=1400&q=80',
  samarkand:   'https://images.unsplash.com/photo-1604608672516-9656d6678f86?auto=format&fit=crop&w=1400&q=80',
  bukhara:     'https://images.unsplash.com/photo-1567606404787-b54fab06f5e0?auto=format&fit=crop&w=1400&q=80',
  almaty:      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80',
  moscow:      'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?auto=format&fit=crop&w=1400&q=80',
  baku:        'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=1400&q=80',
  tbilisi:     'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1400&q=80',
  batumi:      'https://images.unsplash.com/photo-1611521648571-4f8ad5b30b0c?auto=format&fit=crop&w=1400&q=80',
  yerevan:     'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1400&q=80',
};

const GENERIC_FALLBACKS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80',
];

/** Find a hero image for any destination string. Always returns something. */
export const heroFor = (destination = '') => {
  const k = String(destination).toLowerCase().trim();
  if (!k) return GENERIC_FALLBACKS[0];

  // direct hit
  if (HEROES[k]) return HEROES[k];

  // "city, country" → try city part
  if (k.includes(',')) {
    const city = k.split(',')[0].trim();
    if (HEROES[city]) return HEROES[city];
  }

  // partial match
  for (const key of Object.keys(HEROES)) {
    if (k.includes(key) || key.includes(k)) return HEROES[key];
  }

  // deterministic fallback by hash
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0;
  return GENERIC_FALLBACKS[Math.abs(h) % GENERIC_FALLBACKS.length];
};
