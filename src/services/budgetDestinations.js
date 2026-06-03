/**
 * Reverse budget search — "where can I fly for $X".
 * Curated destinations with an estimated round-trip flight price from Bishkek (FRU)
 * and an average mid-range daily on-ground cost per person (hotel share + food +
 * local transport + light activities). Estimates only — verify before booking.
 */

export const ORIGIN = { city: 'Bishkek', code: 'FRU' };

const DESTINATIONS = [
  // Central Asia & near
  { city: 'Almaty',    country: 'Казахстан',   flag: '🇰🇿', region: 'Центральная Азия', flight: 90,  daily: 45,  tags: ['город', 'горы', 'рядом'],     blurb: 'Горы прямо у города, кофейни и катки. Близко и недорого.' },
  { city: 'Tashkent',  country: 'Узбекистан',  flag: '🇺🇿', region: 'Центральная Азия', flight: 120, daily: 40,  tags: ['история', 'еда', 'бюджетно'], blurb: 'Восточные базары, плов и древняя архитектура.' },
  { city: 'Samarkand', country: 'Узбекистан',  flag: '🇺🇿', region: 'Центральная Азия', flight: 130, daily: 38,  tags: ['история', 'культура'],        blurb: 'Бирюзовые купола Регистана — Шёлковый путь вживую.' },

  // Caucasus
  { city: 'Tbilisi',   country: 'Грузия',      flag: '🇬🇪', region: 'Кавказ', flight: 260, daily: 50,  tags: ['еда', 'вино', 'город'],   blurb: 'Старый город, серные бани и лучшее вино региона.' },
  { city: 'Baku',      country: 'Азербайджан', flag: '🇦🇿', region: 'Кавказ', flight: 210, daily: 55,  tags: ['город', 'море'],          blurb: 'Огни Каспия, модерн и средневековая крепость.' },
  { city: 'Yerevan',   country: 'Армения',     flag: '🇦🇲', region: 'Кавказ', flight: 240, daily: 45,  tags: ['история', 'бюджетно'],    blurb: 'Древние монастыри, бренди и вид на Арарат.' },

  // Middle East
  { city: 'Dubai',     country: 'ОАЭ',     flag: '🇦🇪', region: 'Ближний Восток', flight: 240, daily: 130, tags: ['люкс', 'шопинг', 'пляж'], blurb: 'Небоскрёбы, пустынное сафари и пляжи.' },
  { city: 'Doha',      country: 'Катар',   flag: '🇶🇦', region: 'Ближний Восток', flight: 320, daily: 120, tags: ['люкс', 'культура'],       blurb: 'Музеи, сук Вакиф и футуристичная архитектура.' },
  { city: 'Istanbul',  country: 'Турция',  flag: '🇹🇷', region: 'Ближний Восток', flight: 280, daily: 60,  tags: ['история', 'еда', 'город'],blurb: 'Два континента, базары и босфорские закаты.' },
  { city: 'Antalya',   country: 'Турция',  flag: '🇹🇷', region: 'Ближний Восток', flight: 340, daily: 55,  tags: ['пляж', 'отдых', 'семья'], blurb: 'Тёплое Средиземное море и отели «всё включено».' },

  // Asia
  { city: 'Bangkok',      country: 'Таиланд',   flag: '🇹🇭', region: 'Азия', flight: 420, daily: 50,  tags: ['еда', 'город', 'бюджетно'], blurb: 'Уличная еда, храмы и бурная ночная жизнь.' },
  { city: 'Phuket',       country: 'Таиланд',   flag: '🇹🇭', region: 'Азия', flight: 470, daily: 60,  tags: ['пляж', 'отдых'],            blurb: 'Острова, лазурные бухты и дайвинг.' },
  { city: 'Bali',         country: 'Индонезия', flag: '🇮🇩', region: 'Азия', flight: 520, daily: 55,  tags: ['пляж', 'природа'],          blurb: 'Рисовые террасы, сёрф и храмы у океана.' },
  { city: 'Kuala Lumpur', country: 'Малайзия',  flag: '🇲🇾', region: 'Азия', flight: 460, daily: 50,  tags: ['город', 'еда'],             blurb: 'Башни Петронас, фуд-корты и зелёные парки.' },
  { city: 'Delhi',        country: 'Индия',     flag: '🇮🇳', region: 'Азия', flight: 300, daily: 40,  tags: ['история', 'бюджетно'],      blurb: 'Форты Великих Моголов, специи и хаос красок.' },
  { city: 'Beijing',      country: 'Китай',     flag: '🇨🇳', region: 'Азия', flight: 380, daily: 70,  tags: ['история', 'город'],         blurb: 'Великая стена, Запретный город и утка по-пекински.' },
  { city: 'Singapore',    country: 'Сингапур',  flag: '🇸🇬', region: 'Азия', flight: 520, daily: 120, tags: ['город', 'семья', 'люкс'],   blurb: 'Сады будущего, чистота и кухня со всей Азии.' },
  { city: 'Seoul',        country: 'Корея',     flag: '🇰🇷', region: 'Азия', flight: 620, daily: 110, tags: ['город', 'еда'],             blurb: 'K-pop, дворцы и круглосуточные кварталы.' },
  { city: 'Tokyo',        country: 'Япония',    flag: '🇯🇵', region: 'Азия', flight: 700, daily: 130, tags: ['город', 'еда', 'люкс'],     blurb: 'Неон, храмы и лучшая в мире кухня.' },
  { city: 'Maldives',     country: 'Мальдивы',  flag: '🇲🇻', region: 'Азия', flight: 560, daily: 280, tags: ['люкс', 'пляж'],             blurb: 'Бунгало над водой и райские лагуны.' },

  // Africa
  { city: 'Sharm El-Sheikh', country: 'Египет', flag: '🇪🇬', region: 'Африка', flight: 420, daily: 55, tags: ['пляж', 'дайвинг', 'семья'], blurb: 'Коралловые рифы Красного моря и тёплое солнце.' },
  { city: 'Cairo',           country: 'Египет', flag: '🇪🇬', region: 'Африка', flight: 400, daily: 45, tags: ['история', 'бюджетно'],      blurb: 'Пирамиды Гизы и сокровища фараонов.' },

  // Europe
  { city: 'Moscow', country: 'Россия',  flag: '🇷🇺', region: 'Европа', flight: 200, daily: 80,  tags: ['город', 'история'], blurb: 'Красная площадь, метро-дворцы и музеи.' },
  { city: 'Prague', country: 'Чехия',   flag: '🇨🇿', region: 'Европа', flight: 500, daily: 95,  tags: ['история', 'город'], blurb: 'Сказочный старый город и лучшее пиво Европы.' },
  { city: 'Berlin', country: 'Германия',flag: '🇩🇪', region: 'Европа', flight: 520, daily: 110, tags: ['город', 'история'], blurb: 'Музейный остров, искусство и история XX века.' },
  { city: 'Rome',   country: 'Италия',  flag: '🇮🇹', region: 'Европа', flight: 540, daily: 120, tags: ['история', 'еда'],   blurb: 'Колизей, паста и фонтаны на каждом углу.' },
  { city: 'Paris',  country: 'Франция', flag: '🇫🇷', region: 'Европа', flight: 540, daily: 140, tags: ['город', 'люкс'],    blurb: 'Эйфелева башня, Лувр и круассаны.' },
  { city: 'London', country: 'Великобритания', flag: '🇬🇧', region: 'Европа', flight: 560, daily: 150, tags: ['город', 'история'], blurb: 'Дворцы, музеи бесплатно и двухэтажные автобусы.' },

  // Americas
  { city: 'New York', country: 'США', flag: '🇺🇸', region: 'Америка', flight: 850, daily: 180, tags: ['город', 'люкс'], blurb: 'Небоскрёбы, Бродвей и энергия мегаполиса.' },
];

/**
 * @param {{ budget:number, days:number }} params
 * @returns {Array} destinations with computed cost, sorted: affordable first
 */
export function findDestinations({ budget = 0, days = 7 } = {}) {
  const d = Math.max(1, Number(days) || 1);
  const b = Math.max(0, Number(budget) || 0);

  return DESTINATIONS.map(dest => {
    const flight = dest.flight;
    const ground = dest.daily * d;
    const total  = flight + ground;
    return {
      ...dest,
      flight, ground, total,
      fits:  b > 0 && total <= b,
      spare: b - total,
    };
  }).sort((a, c) => {
    if (a.fits !== c.fits) return a.fits ? -1 : 1;
    // affordable: priciest-affordable first (best trip for the money); rest: cheapest first
    return a.fits ? c.total - a.total : a.total - c.total;
  });
}
