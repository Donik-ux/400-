/**
 * destinationLookup.js
 * Large static lookup: country / city keyword → Unsplash hero image + visa requirement
 * Used by Planner page and PlannerForm.
 */

/* ─────────────────────────────────────────────────────────────────────────────
   DESTINATION MAP
   key: lowercase keyword(s) that identify this entry
   hero: Unsplash direct image URL
   visa: true = most CIS/post-Soviet citizens NEED a visa
   visaText: human-readable visa info (Russian)
   country: display name
──────────────────────────────────────────────────────────────────────────────*/
export const DESTINATION_MAP = [

  // ── USA / North America ───────────────────────────────────────────────────
  {
    keys: ['usa','america','amerika','америка','сша','united states','нью-йорк','new york','лос-анджелес','los angeles','miami','майами','chicago','чикаго','las vegas','лас-вегас','san francisco','вашингтон','washington','boston','seattle','houston','dallas','orlando','atlanta'],
    hero: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=80',
    country: 'США 🇺🇸',
    visa: true,
    visaText: 'Для въезда в США необходима виза B-1/B-2 (туристическая). Оформление занимает 2–8 недель, требуется собеседование в посольстве.',
  },

  // ── Canada ────────────────────────────────────────────────────────────────
  {
    keys: ['canada','канада','toronto','торонто','vancouver','ванкувер','montreal','монреаль','calgary','ottawa','оттава'],
    hero: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=1400&q=80',
    country: 'Канада 🇨🇦',
    visa: true,
    visaText: 'Для въезда в Канаду необходима виза TRV или eTA. Подавать заявку онлайн минимум за 4 недели до поездки.',
  },

  // ── UK ────────────────────────────────────────────────────────────────────
  {
    keys: ['uk','united kingdom','britain','england','великобритания','англия','london','лондон','manchester','манчестер','birmingham','edinburgh','эдинбург','liverpool'],
    hero: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
    country: 'Великобритания 🇬🇧',
    visa: true,
    visaText: 'Для въезда в Великобританию необходима виза Standard Visitor Visa. Оформляется онлайн через GOV.UK.',
  },

  // ── Germany ───────────────────────────────────────────────────────────────
  {
    keys: ['germany','deutschland','германия','berlin','берлин','munich','мюнхен','frankfurt','франкфурт','hamburg','гамбург','cologne','кёльн'],
    hero: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=1400&q=80',
    country: 'Германия 🇩🇪',
    visa: true,
    visaText: 'Для въезда в Германию (Шенген) гражданам ряда стран необходима шенгенская виза. Оформляется в консульстве Германии.',
  },

  // ── France ────────────────────────────────────────────────────────────────
  {
    keys: ['france','франция','paris','париж','nice','ницца','marseille','марсель','lyon','лион','strasbourg','bordeaux'],
    hero: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=80',
    country: 'Франция 🇫🇷',
    visa: true,
    visaText: 'Для въезда во Францию (Шенген) необходима шенгенская виза. Оформляется во французском консульстве.',
  },

  // ── Italy ─────────────────────────────────────────────────────────────────
  {
    keys: ['italy','италия','rome','рим','milan','милан','venice','венеция','florence','флоренция','naples','неаполь','sicily','сицилия'],
    hero: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=80',
    country: 'Италия 🇮🇹',
    visa: true,
    visaText: 'Для въезда в Италию (Шенген) необходима шенгенская виза. Оформляется в итальянском консульстве.',
  },

  // ── Spain ─────────────────────────────────────────────────────────────────
  {
    keys: ['spain','испания','barcelona','барселона','madrid','мадрид','seville','севилья','valencia','валенсия','malaga','málaga','ibiza','ибица','tenerife','тенерифе'],
    hero: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=80',
    country: 'Испания 🇪🇸',
    visa: true,
    visaText: 'Для въезда в Испанию (Шенген) необходима шенгенская виза. Оформляется в испанском консульстве.',
  },

  // ── Netherlands ──────────────────────────────────────────────────────────
  {
    keys: ['netherlands','holland','нидерланды','голландия','amsterdam','амстердам','rotterdam','роттердам','hague','гаага'],
    hero: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1400&q=80',
    country: 'Нидерланды 🇳🇱',
    visa: true,
    visaText: 'Для въезда в Нидерланды (Шенген) необходима шенгенская виза.',
  },

  // ── Czech Republic ────────────────────────────────────────────────────────
  {
    keys: ['czech','czechia','чехия','prague','прага','brno','брно','ostrava'],
    hero: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1400&q=80',
    country: 'Чехия 🇨🇿',
    visa: true,
    visaText: 'Для въезда в Чехию (Шенген) необходима шенгенская виза.',
  },

  // ── Austria ───────────────────────────────────────────────────────────────
  {
    keys: ['austria','австрия','vienna','вена','salzburg','зальцбург','innsbruck','инсбрук'],
    hero: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1400&q=80',
    country: 'Австрия 🇦🇹',
    visa: true,
    visaText: 'Для въезда в Австрию (Шенген) необходима шенгенская виза.',
  },

  // ── Switzerland ──────────────────────────────────────────────────────────
  {
    keys: ['switzerland','швейцария','swiss','zurich','цюрих','geneva','женева','bern','берн','lausanne','interlaken','интерлакен'],
    hero: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    country: 'Швейцария 🇨🇭',
    visa: true,
    visaText: 'Для въезда в Швейцарию (Шенген) необходима шенгенская виза.',
  },

  // ── Greece ────────────────────────────────────────────────────────────────
  {
    keys: ['greece','греция','athens','афины','santorini','санторини','mykonos','миконос','thessaloniki','thessalonica','крит','crete'],
    hero: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80',
    country: 'Греция 🇬🇷',
    visa: true,
    visaText: 'Для въезда в Грецию (Шенген) необходима шенгенская виза.',
  },

  // ── Portugal ──────────────────────────────────────────────────────────────
  {
    keys: ['portugal','португалия','lisbon','лиссабон','porto','порто','algarve','алгарве','madeira','мадейра'],
    hero: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=80',
    country: 'Португалия 🇵🇹',
    visa: true,
    visaText: 'Для въезда в Португалию (Шенген) необходима шенгенская виза.',
  },

  // ── Turkey ────────────────────────────────────────────────────────────────
  {
    keys: ['turkey','turk','türkiye','турция','istanbul','стамбул','ankara','анкара','antalya','анталья','cappadocia','каппадокия','bodrum','бодрум','izmir','измир'],
    hero: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
    country: 'Турция 🇹🇷',
    visa: false,
    visaText: '',
  },

  // ── UAE / Dubai ───────────────────────────────────────────────────────────
  {
    keys: ['uae','эмираты','dubai','дубай','abu dhabi','абу-даби','sharjah','шарджа'],
    hero: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    country: 'ОАЭ 🇦🇪',
    visa: false,
    visaText: '',
  },

  // ── Japan ─────────────────────────────────────────────────────────────────
  {
    keys: ['japan','япония','tokyo','токио','osaka','осака','kyoto','киото','hiroshima','хиросима','nara','нара','sapporo','саппоро'],
    hero: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80',
    country: 'Япония 🇯🇵',
    visa: true,
    visaText: 'Для въезда в Японию гражданам ряда стран (в т.ч. Кыргызстан, Узбекистан) необходима виза. Оформляется через посольство Японии.',
  },

  // ── South Korea ───────────────────────────────────────────────────────────
  {
    keys: ['south korea','korea','корея','южная корея','seoul','сеул','busan','пусан','jeju','чеджу'],
    hero: 'https://images.unsplash.com/photo-1543470373-e055b73a8f29?auto=format&fit=crop&w=1400&q=80',
    country: 'Южная Корея 🇰🇷',
    visa: true,
    visaText: 'Для въезда в Южную Корею необходима виза C-3. Оформляется через посольство Кореи.',
  },

  // ── China ─────────────────────────────────────────────────────────────────
  {
    keys: ['china','китай','beijing','пекин','shanghai','шанхай','shenzhen','шэньчжэнь','guangzhou','гуанчжоу','chengdu','чэнду','xian','сиань'],
    hero: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1400&q=80',
    country: 'Китай 🇨🇳',
    visa: true,
    visaText: 'Для въезда в Китай необходима виза типа L (туристическая). Оформляется в посольстве или визовом центре.',
  },

  // ── India ─────────────────────────────────────────────────────────────────
  {
    keys: ['india','индия','delhi','дели','mumbai','мумбай','bangalore','бангалор','goa','гоа','jaipur','джайпур','agra','агра','kolkata','kerala'],
    hero: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80',
    country: 'Индия 🇮🇳',
    visa: true,
    visaText: 'Для въезда в Индию необходима e-Visa (оформляется онлайн за 4 дня) или обычная виза через посольство.',
  },

  // ── Thailand ──────────────────────────────────────────────────────────────
  {
    keys: ['thailand','таиланд','тайланд','bangkok','бангкок','phuket','пхукет','pattaya','паттайя','chiang mai','чиангмай','koh samui','ко самуи'],
    hero: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1400&q=80',
    country: 'Таиланд 🇹🇭',
    visa: false,
    visaText: '',
  },

  // ── Bali / Indonesia ──────────────────────────────────────────────────────
  {
    keys: ['indonesia','индонезия','bali','бали','jakarta','джакарта','lombok','лломбок','yogyakarta','джокьякарта'],
    hero: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
    country: 'Индонезия 🇮🇩',
    visa: false,
    visaText: '',
  },

  // ── Malaysia ──────────────────────────────────────────────────────────────
  {
    keys: ['malaysia','малайзия','kuala lumpur','куала-лумпур','penang','пинанг','langkawi','лангкави'],
    hero: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f11?auto=format&fit=crop&w=1400&q=80',
    country: 'Малайзия 🇲🇾',
    visa: false,
    visaText: '',
  },

  // ── Singapore ─────────────────────────────────────────────────────────────
  {
    keys: ['singapore','сингапур'],
    hero: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
    country: 'Сингапур 🇸🇬',
    visa: false,
    visaText: '',
  },

  // ── Vietnam ───────────────────────────────────────────────────────────────
  {
    keys: ['vietnam','вьетнам','hanoi','ханой','ho chi minh','saigon','сайгон','da nang','дананг','hoi an','хойан','halong','халонг'],
    hero: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1400&q=80',
    country: 'Вьетнам 🇻🇳',
    visa: true,
    visaText: 'Для въезда во Вьетнам гражданам ряда стран необходима e-Visa (оформляется онлайн). Уточните актуальные требования.',
  },

  // ── Maldives ──────────────────────────────────────────────────────────────
  {
    keys: ['maldives','мальдивы','male','мале'],
    hero: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80',
    country: 'Мальдивы 🇲🇻',
    visa: false,
    visaText: '',
  },

  // ── Egypt ─────────────────────────────────────────────────────────────────
  {
    keys: ['egypt','египет','cairo','каир','hurghada','хургада','sharm','шарм','luxor','луксор','aswan','асуан','alexandria','александрия'],
    hero: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=80',
    country: 'Египет 🇪🇬',
    visa: false,
    visaText: '',
  },

  // ── Morocco ───────────────────────────────────────────────────────────────
  {
    keys: ['morocco','марокко','marrakech','марракеш','casablanca','касабланка','rabat','рабат','fez','фес','agadir','агадир'],
    hero: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1400&q=80',
    country: 'Марокко 🇲🇦',
    visa: false,
    visaText: '',
  },

  // ── South Africa ──────────────────────────────────────────────────────────
  {
    keys: ['south africa','южная африка','cape town','кейптаун','johannesburg','йоханнесбург','durban','дурбан','safari','сафари'],
    hero: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=80',
    country: 'ЮАР 🇿🇦',
    visa: true,
    visaText: 'Для въезда в ЮАР гражданам ряда стран необходима виза. Уточните в посольстве.',
  },

  // ── Australia ─────────────────────────────────────────────────────────────
  {
    keys: ['australia','австралия','sydney','сидней','melbourne','мельбурн','brisbane','брисбен','perth','перт','gold coast'],
    hero: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=80',
    country: 'Австралия 🇦🇺',
    visa: true,
    visaText: 'Для въезда в Австралию необходима туристическая виза ETA (subclass 601) или eVisitor. Оформляется онлайн.',
  },

  // ── New Zealand ───────────────────────────────────────────────────────────
  {
    keys: ['new zealand','новая зеландия','auckland','окленд','wellington','веллингтон','queenstown','квинстаун'],
    hero: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1400&q=80',
    country: 'Новая Зеландия 🇳🇿',
    visa: true,
    visaText: 'Для въезда в Новую Зеландию необходима виза или NZeTA (электронное разрешение).',
  },

  // ── Brazil ────────────────────────────────────────────────────────────────
  {
    keys: ['brazil','бразилия','rio','рио','sao paulo','сан-паулу','brasilia','бразилиа','amazon','амазония','iguazu','игуасу'],
    hero: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80',
    country: 'Бразилия 🇧🇷',
    visa: true,
    visaText: 'Для въезда в Бразилию гражданам ряда стран необходима туристическая виза. Уточните в посольстве.',
  },

  // ── Argentina ─────────────────────────────────────────────────────────────
  {
    keys: ['argentina','аргентина','buenos aires','буэнос-айрес','patagonia','патагония','mendoza','мендоса'],
    hero: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1400&q=80',
    country: 'Аргентина 🇦🇷',
    visa: false,
    visaText: '',
  },

  // ── Mexico ────────────────────────────────────────────────────────────────
  {
    keys: ['mexico','мексика','cancun','канкун','mexico city','мехико','playa del carmen','tulum','тулум','guadalajara'],
    hero: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1400&q=80',
    country: 'Мексика 🇲🇽',
    visa: false,
    visaText: '',
  },

  // ── Saudi Arabia ──────────────────────────────────────────────────────────
  {
    keys: ['saudi','саудовская аравия','саудия','riyadh','эр-рияд','jeddah','джидда','mecca','мекка','medina','медина','neom'],
    hero: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1400&q=80',
    country: 'Саудовская Аравия 🇸🇦',
    visa: true,
    visaText: 'Для въезда в Саудовскую Аравию необходима туристическая eVisa. Оформляется онлайн на visitsaudi.com.',
  },

  // ── Iran ─────────────────────────────────────────────────────────────────
  {
    keys: ['iran','иран','tehran','тегеран','isfahan','исфахан','shiraz','шираз','yazd','язд'],
    hero: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1400&q=80',
    country: 'Иран 🇮🇷',
    visa: true,
    visaText: 'Для въезда в Иран необходима виза. Оформляется через посольство или по прилёту (не для всех стран).',
  },

  // ── Jordan ────────────────────────────────────────────────────────────────
  {
    keys: ['jordan','иордания','amman','амман','petra','петра','aqaba','акаба','dead sea','мёртвое море'],
    hero: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?auto=format&fit=crop&w=1400&q=80',
    country: 'Иордания 🇯🇴',
    visa: false,
    visaText: '',
  },

  // ── Israel ────────────────────────────────────────────────────────────────
  {
    keys: ['israel','израиль','tel aviv','тель-авив','jerusalem','иерусалим','haifa','хайфа','eilat','эйлат'],
    hero: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1400&q=80',
    country: 'Израиль 🇮🇱',
    visa: false,
    visaText: '',
  },

  // ── Georgia (country) ─────────────────────────────────────────────────────
  {
    keys: ['georgia','грузия','tbilisi','тбилиси','batumi','батуми','kutaisi','кутаиси','kazbegi','казбеги'],
    hero: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=1400&q=80',
    country: 'Грузия 🇬🇪',
    visa: false,
    visaText: '',
  },

  // ── Armenia ───────────────────────────────────────────────────────────────
  {
    keys: ['armenia','армения','yerevan','ереван','gyumri','гюмри'],
    hero: 'https://images.unsplash.com/photo-1558642891-54be180ea339?auto=format&fit=crop&w=1400&q=80',
    country: 'Армения 🇦🇲',
    visa: false,
    visaText: '',
  },

  // ── Azerbaijan ────────────────────────────────────────────────────────────
  {
    keys: ['azerbaijan','азербайджан','baku','баку','gabala','габала','sheki','шеки'],
    hero: 'https://images.unsplash.com/photo-1580133318324-f2f76d987dd8?auto=format&fit=crop&w=1400&q=80',
    country: 'Азербайджан 🇦🇿',
    visa: false,
    visaText: '',
  },

  // ── Kazakhstan ────────────────────────────────────────────────────────────
  {
    keys: ['kazakhstan','казахстан','almaty','алматы','astana','астана','nursultan','nur-sultan','shymkent','шымкент'],
    hero: 'https://images.unsplash.com/photo-1596700698823-51e6a55bb73d?auto=format&fit=crop&w=1400&q=80',
    country: 'Казахстан 🇰🇿',
    visa: false,
    visaText: '',
  },

  // ── Kyrgyzstan ────────────────────────────────────────────────────────────
  {
    keys: ['kyrgyzstan','кыргызстан','киргизия','bishkek','бишкек','osh','ош','issyk-kul','иссык-куль','karakol','каракол'],
    hero: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=1400&q=80',
    country: 'Кыргызстан 🇰🇬',
    visa: false,
    visaText: '',
  },

  // ── Uzbekistan ────────────────────────────────────────────────────────────
  {
    keys: ['uzbekistan','узбекистан','tashkent','ташкент','samarkand','самарканд','bukhara','бухара','khiva','хива','fergana','фергана'],
    hero: 'https://images.unsplash.com/photo-1596265371388-43edbaadab94?auto=format&fit=crop&w=1400&q=80',
    country: 'Узбекистан 🇺🇿',
    visa: false,
    visaText: '',
  },

  // ── Tajikistan ────────────────────────────────────────────────────────────
  {
    keys: ['tajikistan','таджикистан','dushanbe','душанбе','pamir','памир','khujand','худжанд'],
    hero: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=80',
    country: 'Таджикистан 🇹🇯',
    visa: false,
    visaText: '',
  },

  // ── Russia ────────────────────────────────────────────────────────────────
  {
    keys: ['russia','россия','moscow','москва','saint petersburg','санкт-петербург','питер','spb','novosibirsk','новосибирск','sochi','сочи','kazan','казань'],
    hero: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=1400&q=80',
    country: 'Россия 🇷🇺',
    visa: true,
    visaText: 'Для въезда в Россию гражданам ряда стран необходима виза. Уточните актуальные требования в посольстве России.',
  },

  // ── Belarus ───────────────────────────────────────────────────────────────
  {
    keys: ['belarus','беларусь','minsk','минск','brest','брест','grodno','гродно'],
    hero: 'https://images.unsplash.com/photo-1597638046743-7e4d1027a3e5?auto=format&fit=crop&w=1400&q=80',
    country: 'Беларусь 🇧🇾',
    visa: false,
    visaText: '',
  },

  // ── Ukraine ───────────────────────────────────────────────────────────────
  {
    keys: ['ukraine','украина','kyiv','киев','lviv','львов','odessa','одесса'],
    hero: 'https://images.unsplash.com/photo-1580743090610-e6b7879b48f2?auto=format&fit=crop&w=1400&q=80',
    country: 'Украина 🇺🇦',
    visa: false,
    visaText: '',
  },

  // ── Hungary ───────────────────────────────────────────────────────────────
  {
    keys: ['hungary','венгрия','budapest','будапешт'],
    hero: 'https://images.unsplash.com/photo-1551867633-194f125bddfa?auto=format&fit=crop&w=1400&q=80',
    country: 'Венгрия 🇭🇺',
    visa: true,
    visaText: 'Для въезда в Венгрию (Шенген) необходима шенгенская виза.',
  },

  // ── Poland ────────────────────────────────────────────────────────────────
  {
    keys: ['poland','польша','warsaw','варшава','krakow','краков','gdansk','гданьск','wroclaw','вроцлав'],
    hero: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=1400&q=80',
    country: 'Польша 🇵🇱',
    visa: true,
    visaText: 'Для въезда в Польшу (Шенген) необходима шенгенская виза.',
  },

  // ── Sweden / Scandinavia ──────────────────────────────────────────────────
  {
    keys: ['sweden','швеция','stockholm','стокгольм','gothenburg','гётеборг','norway','норвегия','oslo','осло','denmark','дания','copenhagen','копенгаген','finland','финляндия','helsinki','хельсинки'],
    hero: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1400&q=80',
    country: 'Скандинавия 🇸🇪🇳🇴🇩🇰',
    visa: true,
    visaText: 'Для въезда в страны Скандинавии (Шенген) необходима шенгенская виза.',
  },

  // ── Cuba ──────────────────────────────────────────────────────────────────
  {
    keys: ['cuba','куба','havana','гавана','varadero','варадеро','trinidad'],
    hero: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1400&q=80',
    country: 'Куба 🇨🇺',
    visa: true,
    visaText: 'Для въезда на Кубу необходима туристическая карта (Tarjeta del Turista). Оформляется в аэропорту или заранее.',
  },

  // ── Nepal ─────────────────────────────────────────────────────────────────
  {
    keys: ['nepal','непал','kathmandu','катманду','pokhara','покхара','everest','эверест','himalaya','гималаи'],
    hero: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',
    country: 'Непал 🇳🇵',
    visa: true,
    visaText: 'Для въезда в Непал необходима виза по прилёту или e-Visa (оформляется онлайн на nepalimmigration.gov.np).',
  },

  // ── Pakistan ──────────────────────────────────────────────────────────────
  {
    keys: ['pakistan','пакистан','islamabad','исламабад','karachi','карачи','lahore','лахор'],
    hero: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80',
    country: 'Пакистан 🇵🇰',
    visa: true,
    visaText: 'Для въезда в Пакистан необходима виза. Для ряда граждан доступна e-Visa на evisa.pakistan.gov.pk.',
  },

  // ── Sri Lanka ─────────────────────────────────────────────────────────────
  {
    keys: ['sri lanka','шри-ланка','colombo','коломбо','kandy','канди','galle','галле'],
    hero: 'https://images.unsplash.com/photo-1567447629977-571c7741fc2e?auto=format&fit=crop&w=1400&q=80',
    country: 'Шри-Ланка 🇱🇰',
    visa: true,
    visaText: 'Для въезда на Шри-Ланку необходима электронная виза ETA. Оформляется онлайн на eta.gov.lk.',
  },

  // ── Cambodia ──────────────────────────────────────────────────────────────
  {
    keys: ['cambodia','камбоджа','phnom penh','пномпень','siem reap','сием-рип','angkor','ангкор'],
    hero: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=80',
    country: 'Камбоджа 🇰🇭',
    visa: true,
    visaText: 'Для въезда в Камбоджу необходима виза по прилёту или e-Visa (evisa.gov.kh).',
  },

  // ── Kenya / Tanzania / East Africa ───────────────────────────────────────
  {
    keys: ['kenya','кения','nairobi','найроби','tanzania','танзания','zanzibar','занзибар','kilimanjaro','килиманджаро','safari'],
    hero: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=80',
    country: 'Восточная Африка 🇰🇪',
    visa: true,
    visaText: 'Для въезда в Кению/Танзанию необходима виза. Для Кении доступна eVisa на evisa.go.ke.',
  },

  // ── Hong Kong ─────────────────────────────────────────────────────────────
  {
    keys: ['hong kong','гонконг'],
    hero: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1400&q=80',
    country: 'Гонконг 🇭🇰',
    visa: true,
    visaText: 'Для въезда в Гонконг гражданам ряда стран необходима виза. Уточните в посольстве КНР.',
  },

  // ── Oman ─────────────────────────────────────────────────────────────────
  {
    keys: ['oman','оман','muscat','маскат'],
    hero: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1400&q=80',
    country: 'Оман 🇴🇲',
    visa: true,
    visaText: 'Для въезда в Оман необходима виза. Для ряда стран доступна eVisa на evisa.rop.gov.om.',
  },

  // ── Qatar ─────────────────────────────────────────────────────────────────
  {
    keys: ['qatar','катар','doha','доха'],
    hero: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1400&q=80',
    country: 'Катар 🇶🇦',
    visa: false,
    visaText: '',
  },

  // ── Myanmar ───────────────────────────────────────────────────────────────
  {
    keys: ['myanmar','мьянма','burma','бирма','yangon','янгон','mandalay','мандалай','bagan','баган'],
    hero: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1400&q=80',
    country: 'Мьянма 🇲🇲',
    visa: true,
    visaText: 'Для въезда в Мьянму необходима e-Visa (evisa.moip.gov.mm).',
  },

  // ── Philippines ───────────────────────────────────────────────────────────
  {
    keys: ['philippines','филиппины','manila','манила','boracay','бораккай','cebu','себу','palawan','палаван'],
    hero: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=80',
    country: 'Филиппины 🇵🇭',
    visa: false,
    visaText: '',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Lookup helpers
──────────────────────────────────────────────────────────────────────────────*/

/**
 * Find destination entry by any keyword match
 */
export function lookupDestination(input = '') {
  if (!input || input.trim().length < 2) return null;
  const q = input.toLowerCase().trim();
  for (const entry of DESTINATION_MAP) {
    if (entry.keys.some(k => q.includes(k) || k.includes(q))) {
      return entry;
    }
  }
  return null;
}

/**
 * Get hero image URL for a destination string
 */
export function getDestinationHero(input = '') {
  return lookupDestination(input)?.hero || null;
}

/**
 * Get visa info for a destination string
 * Returns { required: bool, country: string, text: string } or null
 */
export function getVisaInfo(input = '') {
  const entry = lookupDestination(input);
  if (!entry || !entry.visa) return null;
  return { required: true, country: entry.country, text: entry.visaText };
}
