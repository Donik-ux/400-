/**
 * Curated attraction DB for cities not covered by full citySchedules.
 * Each entry is a REAL place a traveler can actually visit, with
 * a real street address and a realistic local-currency price.
 *
 * Used by the template fallback to give every day useful, address-rich events
 * even when Grok is unavailable.
 */

export const CITY_ATTRACTIONS = {
  /* ── Europe ───────────────────────────────────────────────── */
  prague: [
    { name: 'Charles Bridge',         address: 'Karlův most, 110 00 Praha 1, Czechia',          price: 'Free',     type: 'attraction', district: 'Old Town' },
    { name: 'Prague Castle',          address: 'Hradčany, 119 08 Praha 1, Czechia',             price: 'CZK 250',  type: 'museum',     district: 'Hradčany' },
    { name: 'Old Town Square & Astronomical Clock', address: 'Staroměstské náměstí, 110 00 Praha 1', price: 'Free', type: 'attraction', district: 'Old Town' },
    { name: 'St. Vitus Cathedral',    address: 'III. nádvoří 48/2, 119 01 Praha 1, Czechia',    price: 'CZK 250',  type: 'museum',     district: 'Hradčany' },
    { name: 'Jewish Quarter (Josefov)', address: 'Maiselova, 110 00 Praha 1, Czechia',          price: 'CZK 350',  type: 'museum',     district: 'Josefov' },
    { name: 'Wenceslas Square',       address: 'Václavské náměstí, 110 00 Praha 1, Czechia',    price: 'Free',     type: 'attraction', district: 'New Town' },
    { name: 'Vyšehrad Fortress',      address: 'V Pevnosti 5/159, 128 00 Praha 2, Czechia',     price: 'Free',     type: 'attraction', district: 'Vyšehrad' },
    { name: 'Letná Park viewpoint',   address: 'Letenské sady, 170 00 Praha 7, Czechia',        price: 'Free',     type: 'nature',     district: 'Letná' },
  ],
  vienna: [
    { name: "Schönbrunn Palace",      address: 'Schönbrunner Schloßstraße 47, 1130 Wien, Austria', price: '€26',  type: 'museum',     district: 'Hietzing' },
    { name: 'Stephansdom (St. Stephen\'s)', address: 'Stephansplatz 3, 1010 Wien, Austria',     price: 'Free / €6 tower', type: 'museum', district: 'Innere Stadt' },
    { name: 'Hofburg Palace',         address: 'Michaelerkuppel, 1010 Wien, Austria',           price: '€17.50',   type: 'museum',     district: 'Innere Stadt' },
    { name: 'Belvedere Palace & Klimt', address: 'Prinz-Eugen-Straße 27, 1030 Wien, Austria',   price: '€16',      type: 'museum',     district: 'Landstraße' },
    { name: 'Naschmarkt',             address: 'Naschmarkt 1, 1060 Wien, Austria',              price: 'Free',     type: 'shopping',   district: 'Wieden' },
    { name: 'Prater & Riesenrad',     address: 'Riesenradplatz 1, 1020 Wien, Austria',          price: '€13',      type: 'attraction', district: 'Leopoldstadt' },
  ],
  athens: [
    { name: 'Acropolis & Parthenon',  address: 'Athens 105 58, Greece',                          price: '€20',      type: 'museum',     district: 'Plaka' },
    { name: 'Acropolis Museum',       address: 'Dionysiou Areopagitou 15, Athens 117 42',       price: '€10',      type: 'museum',     district: 'Makrygianni' },
    { name: 'Plaka Old Town walk',    address: 'Plaka, Athens 105 58, Greece',                  price: 'Free',     type: 'leisure',    district: 'Plaka' },
    { name: 'Ancient Agora',          address: 'Adrianou 24, Athens 105 55, Greece',            price: '€10',      type: 'museum',     district: 'Monastiraki' },
    { name: 'Mount Lycabettus',       address: 'Lycabettus Hill, Athens 114 71, Greece',        price: 'Free',     type: 'nature',     district: 'Kolonaki' },
    { name: 'Monastiraki Flea Market',address: 'Monastiraki Square, Athens 105 55, Greece',     price: 'Free',     type: 'shopping',   district: 'Monastiraki' },
  ],
  lisbon: [
    { name: 'Belém Tower',            address: 'Av. Brasília, 1400-038 Lisboa, Portugal',       price: '€8',       type: 'museum',     district: 'Belém' },
    { name: 'Jerónimos Monastery',    address: 'Praça do Império 1400-206, Lisboa, Portugal',   price: '€12',      type: 'museum',     district: 'Belém' },
    { name: 'Tram 28 ride',           address: 'Praça do Comércio, 1100-148 Lisboa, Portugal',  price: '€3',       type: 'transport',  district: 'Baixa' },
    { name: 'Castelo de São Jorge',   address: 'R. de Santa Cruz, 1100-129 Lisboa, Portugal',   price: '€15',      type: 'museum',     district: 'Castelo' },
    { name: 'Time Out Market',        address: 'Av. 24 de Julho 49, 1200-479 Lisboa',           price: '€10–20',   type: 'food',       district: 'Cais do Sodré' },
    { name: 'Pastéis de Belém',       address: 'R. de Belém 84–92, 1300-085 Lisboa',            price: '€1.30 each', type: 'food',     district: 'Belém' },
  ],
  budapest: [
    { name: 'Fisherman\'s Bastion',   address: 'Szentháromság tér, 1014 Budapest, Hungary',     price: 'HUF 1,200',type: 'attraction', district: 'Buda Castle' },
    { name: 'Hungarian Parliament',   address: 'Kossuth Lajos tér 1-3, 1055 Budapest',          price: 'HUF 3,500',type: 'museum',     district: 'Lipótváros' },
    { name: 'Széchenyi Thermal Bath', address: 'Állatkerti krt. 9-11, 1146 Budapest',           price: 'HUF 7,500',type: 'leisure',    district: 'City Park' },
    { name: 'Chain Bridge walk',      address: 'Széchenyi Lánchíd, 1051 Budapest',              price: 'Free',     type: 'attraction', district: 'Belváros' },
    { name: 'Great Market Hall',      address: 'Vámház krt. 1-3, 1093 Budapest',                price: 'Free entry', type: 'shopping', district: 'Ferencváros' },
  ],
  warsaw: [
    { name: 'Old Town Market Square', address: 'Rynek Starego Miasta, 00-272 Warszawa, Poland', price: 'Free',     type: 'attraction', district: 'Stare Miasto' },
    { name: 'Royal Castle',           address: 'Plac Zamkowy 4, 00-277 Warszawa',               price: 'PLN 30',   type: 'museum',     district: 'Stare Miasto' },
    { name: 'Łazienki Park & Palace', address: 'Agrykola 1, 00-460 Warszawa',                   price: 'Free park',type: 'nature',     district: 'Śródmieście' },
    { name: 'POLIN Museum',           address: 'Anielewicza 6, 00-157 Warszawa',                price: 'PLN 45',   type: 'museum',     district: 'Muranów' },
    { name: 'Palace of Culture viewpoint', address: 'Plac Defilad 1, 00-901 Warszawa',          price: 'PLN 25',   type: 'attraction', district: 'Śródmieście' },
  ],
  zurich: [
    { name: 'Bahnhofstrasse',         address: 'Bahnhofstrasse, 8001 Zürich, Switzerland',      price: 'Free',     type: 'shopping',   district: 'Altstadt' },
    { name: 'Lake Zurich promenade',  address: 'Bürkliplatz, 8001 Zürich, Switzerland',         price: 'Free',     type: 'nature',     district: 'Lakeside' },
    { name: 'Grossmünster',           address: 'Grossmünsterplatz, 8001 Zürich',                price: 'CHF 5',    type: 'museum',     district: 'Altstadt' },
    { name: 'Old Town (Niederdorf)',  address: 'Niederdorfstrasse, 8001 Zürich',                price: 'Free',     type: 'leisure',    district: 'Altstadt' },
    { name: 'Uetliberg viewpoint',    address: 'Gratstrasse 50, 8143 Zürich',                   price: 'CHF 10 (train)', type: 'nature', district: 'Uetliberg' },
  ],

  /* ── Middle East ─────────────────────────────────────────── */
  doha: [
    { name: 'Museum of Islamic Art',  address: 'Corniche Rd, Doha, Qatar',                      price: 'Free',     type: 'museum',     district: 'Corniche' },
    { name: 'Souq Waqif',             address: 'Souq Waqif, Doha, Qatar',                       price: 'Free',     type: 'shopping',   district: 'Old Doha' },
    { name: 'Katara Cultural Village',address: 'Katara, Doha, Qatar',                           price: 'Free',     type: 'attraction', district: 'Katara' },
    { name: 'The Pearl-Qatar',        address: 'The Pearl, Doha, Qatar',                        price: 'Free',     type: 'leisure',    district: 'West Bay Lagoon' },
    { name: 'Corniche promenade',     address: 'Corniche St, Doha, Qatar',                      price: 'Free',     type: 'nature',     district: 'Doha Bay' },
  ],
  amman: [
    { name: 'Amman Citadel',          address: 'K. Ali Bin Al Hussein St 146, Amman, Jordan',  price: 'JOD 3',    type: 'museum',     district: 'Jabal al-Qal\'a' },
    { name: 'Roman Theatre',          address: 'Hashemi St, Amman, Jordan',                     price: 'JOD 2',    type: 'museum',     district: 'Downtown' },
    { name: 'Rainbow Street',         address: 'Rainbow Street, Amman, Jordan',                 price: 'Free',     type: 'leisure',    district: 'Jabal Amman' },
    { name: 'King Abdullah I Mosque', address: 'Suleiman Al Nabulsi St, Amman',                 price: 'JOD 2',    type: 'museum',     district: 'Abdali' },
  ],
  petra: [
    { name: 'Petra Visitor Centre',   address: 'Tourism St, Wadi Musa, Jordan',                 price: 'JOD 50 day-pass', type: 'museum', district: 'Wadi Musa' },
    { name: 'Al-Khazneh (The Treasury)', address: 'Petra Archaeological Park, Wadi Musa',       price: 'Included', type: 'attraction', district: 'Petra' },
    { name: 'Monastery (Ad Deir)',    address: 'Petra trail, Wadi Musa, Jordan',                price: 'Included', type: 'attraction', district: 'Petra' },
  ],

  /* ── Asia ────────────────────────────────────────────────── */
  goa: [
    { name: 'Baga Beach',             address: 'Baga, Bardez, Goa 403516, India',               price: 'Free',     type: 'nature',     district: 'North Goa' },
    { name: 'Basilica of Bom Jesus',  address: 'Old Goa Rd, Bainguinim, Goa 403402',            price: 'Free',     type: 'museum',     district: 'Old Goa' },
    { name: 'Fort Aguada',            address: 'Aguada Fort Area, Sinquerim, Goa 403515',       price: 'Free',     type: 'attraction', district: 'Sinquerim' },
    { name: 'Anjuna Flea Market',     address: 'Anjuna, Goa 403509, India',                     price: 'Free entry', type: 'shopping', district: 'Anjuna' },
    { name: 'Dudhsagar Falls',        address: 'Dudhsagar, Goa 403410, India',                  price: '₹400',     type: 'nature',     district: 'Sanguem' },
  ],
  hanoi: [
    { name: 'Hoan Kiem Lake',         address: 'Hoàn Kiếm, Hà Nội, Vietnam',                    price: 'Free',     type: 'nature',     district: 'Hoàn Kiếm' },
    { name: 'Temple of Literature',   address: '58 P. Quốc Tử Giám, Đống Đa, Hà Nội',           price: '₫30,000',  type: 'museum',     district: 'Đống Đa' },
    { name: 'Old Quarter walk',       address: 'Old Quarter, Hoàn Kiếm, Hà Nội',                price: 'Free',     type: 'leisure',    district: 'Old Quarter' },
    { name: 'Hoa Lo Prison',          address: '1 P. Hỏa Lò, Hoàn Kiếm, Hà Nội',                price: '₫30,000',  type: 'museum',     district: 'Hoàn Kiếm' },
  ],
  delhi: [
    { name: 'Red Fort',               address: 'Netaji Subhash Marg, Lal Qila, New Delhi 110006', price: '₹50',    type: 'museum',     district: 'Old Delhi' },
    { name: 'India Gate',             address: 'Rajpath, India Gate, New Delhi 110001',         price: 'Free',     type: 'attraction', district: 'Central Delhi' },
    { name: 'Qutub Minar',            address: 'Mehrauli, New Delhi 110030',                    price: '₹40',      type: 'museum',     district: 'Mehrauli' },
    { name: 'Humayun\'s Tomb',        address: 'Mathura Rd, Nizamuddin, New Delhi 110013',      price: '₹40',      type: 'museum',     district: 'Nizamuddin' },
    { name: 'Chandni Chowk market',   address: 'Chandni Chowk, Old Delhi 110006',               price: 'Free',     type: 'shopping',   district: 'Old Delhi' },
  ],
  bali: [
    { name: 'Tanah Lot Temple',       address: 'Beraban, Kediri, Tabanan Regency, Bali 82121', price: 'IDR 60,000', type: 'museum',   district: 'Tabanan' },
    { name: 'Tegallalang Rice Terraces', address: 'Jl. Raya Tegallalang, Ubud, Bali 80561',    price: 'IDR 25,000', type: 'nature',   district: 'Tegallalang' },
    { name: 'Ubud Monkey Forest',     address: 'Jl. Monkey Forest, Ubud, Bali 80571',           price: 'IDR 80,000', type: 'nature',   district: 'Ubud' },
    { name: 'Uluwatu Temple',         address: 'Pecatu, Kuta Selatan, Bali 80361',              price: 'IDR 50,000', type: 'museum',   district: 'Uluwatu' },
    { name: 'Seminyak Beach',         address: 'Seminyak, Kuta, Bali 80361',                    price: 'Free',     type: 'nature',     district: 'Seminyak' },
  ],
  phuket: [
    { name: 'Big Buddha Phuket',      address: 'Karon, Mueang Phuket District, Phuket 83100',   price: 'Free',     type: 'museum',     district: 'Karon' },
    { name: 'Patong Beach',           address: 'Patong, Kathu District, Phuket 83150',          price: 'Free',     type: 'nature',     district: 'Patong' },
    { name: 'Phi Phi Islands day trip', address: 'Departures from Rassada Pier, Phuket',       price: 'THB 1,500',type: 'leisure',    district: 'Day trip' },
    { name: 'Old Phuket Town walk',   address: 'Thalang Rd, Talat Yai, Phuket 83000',           price: 'Free',     type: 'attraction', district: 'Phuket Town' },
    { name: 'Phang Nga Bay (James Bond Island)', address: 'Phang Nga Bay, Phang Nga 82130',     price: 'THB 1,800',type: 'leisure',    district: 'Day trip' },
  ],
  jakarta: [
    { name: 'National Monument (Monas)', address: 'Gambir, Central Jakarta 10110',              price: 'IDR 15,000', type: 'museum',   district: 'Gambir' },
    { name: 'Kota Tua (Old Town)',    address: 'Pinangsia, Tamansari, West Jakarta',            price: 'Free',     type: 'attraction', district: 'Old Town' },
    { name: 'Istiqlal Mosque',        address: 'Jl. Taman Wijaya Kusuma, Jakarta 10710',        price: 'Free',     type: 'museum',     district: 'Pasar Baru' },
  ],
  manila: [
    { name: 'Intramuros',             address: 'Intramuros, Manila 1002, Philippines',          price: 'Free',     type: 'attraction', district: 'Intramuros' },
    { name: 'Rizal Park',             address: 'Roxas Blvd, Ermita, Manila',                    price: 'Free',     type: 'nature',     district: 'Ermita' },
    { name: 'Fort Santiago',          address: 'General Luna St, Intramuros, Manila',           price: '₱75',      type: 'museum',     district: 'Intramuros' },
  ],
  hochiminh: [
    { name: 'War Remnants Museum',    address: '28 Võ Văn Tần, P.6, Q.3, TP. HCM, Vietnam',     price: '₫40,000',  type: 'museum',     district: 'District 3' },
    { name: 'Notre-Dame Cathedral Basilica', address: '01 Công xã Paris, Bến Nghé, Quận 1, TP HCM', price: 'Free', type: 'museum',  district: 'District 1' },
    { name: 'Ben Thanh Market',       address: 'Chợ Bến Thành, Quận 1, TP. HCM',                price: 'Free',     type: 'shopping',   district: 'District 1' },
  ],

  /* ── Africa ──────────────────────────────────────────────── */
  capetown: [
    { name: 'Table Mountain',         address: 'Tafelberg Rd, Gardens, Cape Town 8001',         price: 'ZAR 420',  type: 'nature',     district: 'Gardens' },
    { name: 'Cape Point',             address: 'Cape Point Rd, Cape Town 8001',                 price: 'ZAR 360',  type: 'nature',     district: 'Cape Peninsula' },
    { name: 'V&A Waterfront',         address: 'Dock Rd, V&A Waterfront, Cape Town 8002',       price: 'Free',     type: 'leisure',    district: 'Waterfront' },
    { name: 'Robben Island',          address: 'Robben Island, Cape Town 7400',                 price: 'ZAR 600',  type: 'museum',     district: 'Robben Island' },
  ],

  /* ── Americas ────────────────────────────────────────────── */
  miami: [
    { name: 'South Beach',            address: 'Ocean Dr, Miami Beach, FL 33139, USA',          price: 'Free',     type: 'nature',     district: 'South Beach' },
    { name: 'Art Deco Historic District', address: '1001 Ocean Dr, Miami Beach, FL 33139',      price: 'Free',     type: 'attraction', district: 'South Beach' },
    { name: 'Wynwood Walls',          address: '2516 NW 2nd Ave, Miami, FL 33127',              price: '$12',      type: 'museum',     district: 'Wynwood' },
    { name: 'Vizcaya Museum & Gardens', address: '3251 S Miami Ave, Miami, FL 33129',           price: '$25',      type: 'museum',     district: 'Coconut Grove' },
  ],
  lasvegas: [
    { name: 'The Strip',              address: 'Las Vegas Blvd S, Las Vegas, NV 89109',         price: 'Free',     type: 'attraction', district: 'The Strip' },
    { name: 'Bellagio Fountains',     address: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',    price: 'Free',     type: 'attraction', district: 'The Strip' },
    { name: 'Fremont Street Experience', address: 'Fremont St, Las Vegas, NV 89101',            price: 'Free',     type: 'attraction', district: 'Downtown' },
    { name: 'Red Rock Canyon',        address: '1000 Scenic Loop Dr, Las Vegas, NV 89161',      price: '$20/car',  type: 'nature',     district: 'Red Rock' },
  ],
  riodejaneiro: [
    { name: 'Christ the Redeemer',    address: 'Parque Nacional da Tijuca, Alto da Boa Vista, Rio', price: 'R$83', type: 'attraction', district: 'Corcovado' },
    { name: 'Sugarloaf Mountain',     address: 'Av. Pasteur 520, Urca, Rio de Janeiro',         price: 'R$165',    type: 'attraction', district: 'Urca' },
    { name: 'Copacabana Beach',       address: 'Av. Atlântica, Copacabana, Rio de Janeiro',     price: 'Free',     type: 'nature',     district: 'Copacabana' },
    { name: 'Selarón Steps',          address: 'Escadaria Selarón, Lapa, Rio de Janeiro',       price: 'Free',     type: 'attraction', district: 'Lapa' },
  ],

  /* ── Oceania ─────────────────────────────────────────────── */
  sydney: [
    { name: 'Sydney Opera House',     address: 'Bennelong Point, Sydney NSW 2000, Australia',   price: 'A$43 tour',type: 'museum',     district: 'CBD' },
    { name: 'Sydney Harbour Bridge',  address: 'Sydney Harbour Bridge, Sydney NSW 2060',        price: 'Free walk',type: 'attraction', district: 'The Rocks' },
    { name: 'Bondi Beach',            address: 'Campbell Pde, Bondi Beach NSW 2026',            price: 'Free',     type: 'nature',     district: 'Bondi' },
    { name: 'Royal Botanic Garden',   address: 'Mrs Macquaries Rd, Sydney NSW 2000',            price: 'Free',     type: 'nature',     district: 'CBD' },
  ],

  /* ── CIS / Central Asia ──────────────────────────────────── */
  osh: [
    { name: 'Sulaiman-Too Sacred Mountain', address: 'Kurmandzhan Datka St, Osh, Kyrgyzstan', price: 'KGS 80',     type: 'museum',     district: 'Central Osh' },
    { name: 'Osh Bazaar',             address: 'Lenin Ave, Osh, Kyrgyzstan',                    price: 'Free',     type: 'shopping',   district: 'Central Osh' },
    { name: 'Alay Mountains day trip',address: 'Sary-Tash, Alay District, Osh Region',          price: 'KGS 2,500',type: 'nature',     district: 'Alay' },
  ],
  yerevan: [
    { name: 'Republic Square',        address: 'Hraparak Square, Yerevan 0010, Armenia',        price: 'Free',     type: 'attraction', district: 'Kentron' },
    { name: 'Cascade Complex',        address: '10 Tamanyan St, Yerevan 0009',                  price: 'Free',     type: 'attraction', district: 'Kentron' },
    { name: 'Matenadaran Manuscripts', address: '53 Mashtots Ave, Yerevan 0009',                price: 'AMD 1,000',type: 'museum',     district: 'Kentron' },
  ],
  batumi: [
    { name: 'Batumi Boulevard',       address: 'Sherif Khimshiashvili Ave, Batumi 6000',        price: 'Free',     type: 'leisure',    district: 'Old Boulevard' },
    { name: 'Alphabet Tower',         address: '13 Ninoshvili St, Batumi 6010',                 price: '₾10',      type: 'attraction', district: 'Seaside' },
    { name: 'Botanical Garden',       address: 'Adlia Subdistrict, Batumi 6004',                price: '₾15',      type: 'nature',     district: 'Adlia' },
  ],
};

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');

/** Find a city by destination string (city or "city, country"). */
export const findCityAttractions = (destination = '') => {
  const key = norm(destination);
  if (!key) return null;
  for (const [city, attractions] of Object.entries(CITY_ATTRACTIONS)) {
    if (key.includes(city) || city.includes(key)) return attractions;
  }
  return null;
};

/** Build an arrival-day event list anchored at the destination. */
export const buildArrivalEvents = (destination, fromCity = '', tier = 'standard') => {
  const price = tier === 'luxury' ? '~$50' : tier === 'economy' ? '~$15' : '~$25';
  return [
    { time: '06:00', name: `Departure from ${fromCity || 'home airport'}`,                     address: `${fromCity || 'Home'} International Airport`, price: 'Pre-booked', type: 'flight'    },
    { time: '08:00', name: `Flight to ${destination}`,                                          address: 'In transit',                                  price: 'Pre-booked', type: 'flight'    },
    { time: '14:00', name: `Arrival at ${destination} International Airport`,                   address: `${destination} International Airport`,        price: 'Free',       type: 'flight'    },
    { time: '15:00', name: 'Airport transfer to hotel',                                         address: `${destination} city centre`,                  price,                type: 'transport' },
    { time: '16:30', name: 'Hotel check-in & freshen up',                                       address: `${destination} hotel district`,               price: 'Included',   type: 'hotel'     },
    { time: '18:00', name: `Light orientation walk around the hotel neighbourhood`,            address: `${destination} centre`,                       price: 'Free',       type: 'leisure'   },
    { time: '20:00', name: 'Welcome dinner — local cuisine',                                    address: `Restaurant near hotel, ${destination}`,       price: '$15–25',     type: 'food'      },
  ];
};

/** Build a departure-day event list. */
export const buildDepartureEvents = (destination, fromCity = '') => ([
  { time: '07:30', name: 'Breakfast & packing',                       address: `Hotel in ${destination}`,                      price: 'Included',  type: 'food' },
  { time: '09:30', name: 'Last-minute souvenir shopping',             address: `${destination} main shopping street`,          price: '$20–40',    type: 'shopping' },
  { time: '12:00', name: 'Hotel check-out',                           address: `Hotel in ${destination}`,                      price: 'Free',      type: 'hotel' },
  { time: '13:00', name: `Airport transfer`,                          address: `${destination} International Airport`,         price: '$25',       type: 'transport' },
  { time: '15:00', name: `Departure flight to ${fromCity || 'home'}`, address: `${destination} International Airport`,         price: 'Pre-booked',type: 'flight' },
]);

/** Pick a single attraction-day theme for middle days. */
export const buildMiddleDayEvents = (destination, attractions, themeIdx, tier = 'standard') => {
  if (!attractions || attractions.length === 0) {
    // Generic but always addressed
    return [
      { time: '08:00', name: 'Breakfast at hotel',                       address: `Hotel in ${destination}`,                price: 'Included', type: 'food' },
      { time: '09:30', name: `${destination} main square & historic centre walk`, address: `City centre, ${destination}`,    price: 'Free',     type: 'attraction' },
      { time: '11:30', name: `${destination} National Museum`,           address: `Museum district, ${destination}`,        price: '$10–15',   type: 'museum' },
      { time: '13:00', name: 'Lunch at a local restaurant',              address: `Near city centre, ${destination}`,       price: '$10–18',   type: 'food' },
      { time: '15:00', name: `${destination} local market walk`,         address: `Bazaar / market district, ${destination}`, price: 'Free',   type: 'shopping' },
      { time: '17:30', name: `${destination} viewpoint or rooftop bar`,  address: `Best viewpoint, ${destination}`,         price: '$8',       type: 'attraction' },
      { time: '20:00', name: 'Dinner with local specialities',           address: `Recommended restaurant, ${destination}`, price: '$18–30',   type: 'food' },
    ];
  }

  // Rotate through curated attractions so each middle day uses different real places
  const idx = themeIdx % attractions.length;
  const chunk = [
    attractions[idx],
    attractions[(idx + 1) % attractions.length],
    attractions[(idx + 2) % attractions.length],
    attractions[(idx + 3) % attractions.length],
  ];

  return [
    { time: '08:00', name: 'Breakfast at hotel', address: `Hotel in ${destination}`, price: 'Included', type: 'food' },
    { time: '09:30', name: chunk[0].name,          address: chunk[0].address, price: chunk[0].price, type: chunk[0].type, district: chunk[0].district },
    { time: '11:30', name: chunk[1].name,          address: chunk[1].address, price: chunk[1].price, type: chunk[1].type, district: chunk[1].district },
    { time: '13:00', name: `Lunch near ${chunk[1].district || destination}`, address: `Restaurant near ${chunk[1].name}, ${destination}`, price: '$12–20', type: 'food' },
    { time: '15:00', name: chunk[2].name,          address: chunk[2].address, price: chunk[2].price, type: chunk[2].type, district: chunk[2].district },
    { time: '17:30', name: chunk[3].name,          address: chunk[3].address, price: chunk[3].price, type: chunk[3].type, district: chunk[3].district },
    { time: '20:00', name: 'Dinner with local cuisine', address: `Recommended restaurant in ${destination}`, price: tier === 'luxury' ? '$40–60' : '$18–28', type: 'food' },
  ];
};
