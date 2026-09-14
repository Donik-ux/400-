/**
 * Official car-rental contacts per country — the reservation / customer-service
 * lines of the major rental companies (Sixt, Hertz, Avis, Europcar, Enterprise…)
 * and, where they matter more, the established national brand.
 *
 * Every number below was read off the company's own country site in
 * September 2026. They are the companies' official desks, not private
 * individuals — a traveler who calls one gets a real contract, insurance and
 * an airport pick-up. `phone` is the international dial string used for the
 * tel: link; `displayPhone` is how the company itself prints it. A `null`
 * phone means the company takes bookings online / by chat only in that
 * country, and the card shows the website instead.
 */
import { resolveCountry, getEmergencyContacts } from './emergencyContacts';

const DB = {
  /* ── Europe ─────────────────────────────────────────────────── */
  Germany: [
    { company: 'Sixt',     phone: '+49 180 5252525',   displayPhone: '0180 5 25 25 25',    site: 'https://www.sixt.de',      note: 'Reservation centre · premium-rate inside Germany (≈€0.14/min)' },
    { company: 'Hertz',    phone: '+49 6196 7008120',  displayPhone: '+49 6196 7008120',   site: 'https://www.hertz.de',     note: 'Reservations, daily 09:00–18:00' },
    { company: 'Europcar', phone: '+49 40 520188000',  displayPhone: '040 52018 8000',     site: 'https://www.europcar.de',  note: 'Service hotline, 24h / 365 days' },
  ],
  France: [
    { company: 'Sixt',     phone: '+33 1 70 97 61 11', displayPhone: '01 70 97 61 11',     site: 'https://www.sixt.fr',      note: 'Reservations, 08:00–20:00' },
    { company: 'Hertz',    phone: '+33 1 41 919 525',  displayPhone: '+33 1 41 919 525',   site: 'https://www.hertz.fr',     note: 'Reservations, 08:00–23:00 (international line)' },
    { company: 'Europcar', phone: '+33 1 80 20 90 00', displayPhone: '+33 1 80 20 90 00',  site: 'https://www.europcar.fr',  note: 'Head office · reservation centre online 07:00–22:00' },
  ],
  Italy: [
    { company: 'Sixt',     phone: '+39 02 94757979',   displayPhone: '02 94 75 7979',      site: 'https://www.sixt.it',      note: 'Reservations & info, weekdays from 08:30' },
    { company: 'Hertz',    phone: '+39 02 69430006',   displayPhone: '+39 02 69430006',    site: 'https://www.hertz.it',     note: 'Reservations, Mon–Sat 08:00–22:00, Sun 09:00–21:00' },
    { company: 'Avis',     phone: '+39 06 452108391',  displayPhone: '+39 06 452108391',   site: 'https://www.avisautonoleggio.it', note: 'Reservation centre' },
  ],
  Spain: [
    { company: 'Europcar', phone: '+34 911 505 000',   displayPhone: '911 505 000',        site: 'https://www.europcar.es',  note: 'Reservations & customer service' },
    { company: 'Hertz',    phone: '+34 91 749 90 69',  displayPhone: '91 749 90 69',       site: 'https://www.hertz.es',     note: 'Reservations, Mon–Sat 08:00–21:00, Sun 09:00–21:00' },
    { company: 'Avis',     phone: '+34 919 332 824',   displayPhone: '919 332 824',        site: 'https://www.avis.es',      note: 'Customer service, Mon–Fri 09:00–17:00' },
    { company: 'Sixt',     phone: null,                displayPhone: null,                 site: 'https://www.sixt.es',      note: 'Book online, chat or WhatsApp' },
  ],
  Portugal: [
    { company: 'Sixt',     phone: '+351 255 788 199',  displayPhone: '+351 255 788 199',   site: 'https://www.sixt.pt',      note: 'Reservations' },
    { company: 'Europcar', phone: '+351 213 800 200',  displayPhone: '+351 213 800 200',   site: 'https://www.europcar.pt',  note: 'Reservations' },
    { company: 'Hertz',    phone: '+351 219 426 385',  displayPhone: '808 202 038',        site: 'https://www.hertz.pt',     note: 'Central reservations (808 = shared-cost inside Portugal)' },
  ],
  Netherlands: [
    { company: 'Sixt',     phone: '+31 23 5698656',    displayPhone: '+31 (0)23 56 986 56', site: 'https://www.sixt.nl',     note: 'Reservations & customer service' },
    { company: 'Hertz',    phone: '+31 20 201 3512',   displayPhone: '+31 (0)20 201 3512', site: 'https://www.hertz.nl',     note: 'Reservations, Mon–Fri 08:00–20:00, Sat 10:00–19:00' },
    { company: 'Europcar', phone: '+31 88 9005555',    displayPhone: '088 9005555',        site: 'https://www.europcar.nl',  note: 'Phone reservations, Mon–Fri 08:00–18:00' },
  ],
  Belgium: [
    { company: 'Hertz',    phone: '+32 2 717 3201',    displayPhone: '+32 2 717 3201',     site: 'https://www.hertz.be',     note: 'Reservations & information' },
    { company: 'Europcar', phone: '+32 2 348 92 12',   displayPhone: '02 348 92 12',       site: 'https://www.europcar.be',  note: 'Reservations, Mon–Fri 08:00–19:00, Sat–Sun 09:30–18:00' },
    { company: 'Avis',     phone: '+32 70 223 002',    displayPhone: '070 223 002',        site: 'https://www.avis.be',      note: 'Reservations (070 = shared-cost inside Belgium)' },
  ],
  Switzerland: [
    { company: 'Sixt',     phone: '+41 61 327 88 24',  displayPhone: '+41 61 327 88 24',   site: 'https://www.sixt.ch',      note: 'Reservations & customer service' },
    { company: 'Hertz',    phone: '+41 848 822 020',   displayPhone: '0848 822 020',       site: 'https://www.hertz.ch',     note: 'Reservations, 08:00–19:00 (0848 = shared-cost)' },
    { company: 'Europcar', phone: '+41 848 80 80 99',  displayPhone: '0848 80 80 99',      site: 'https://www.europcar.ch',  note: 'Reservations, Mon–Fri 08:00–18:00, Sat 09:00–13:00' },
  ],
  Austria: [
    { company: 'Europcar', phone: '+43 1 866 16 1633', displayPhone: '+43 1 866 16-1633',  site: 'https://www.europcar.at',  note: 'Reservation centre' },
    { company: 'Sixt',     phone: null,                displayPhone: null,                 site: 'https://www.sixt.at',      note: 'Book online · breakdown 24/7 +43 1 505 264 018' },
    { company: 'Hertz',    phone: null,                displayPhone: null,                 site: 'https://www.hertz.at',     note: 'Book online or at the airport desk' },
  ],
  Greece: [
    { company: 'Sixt',     phone: '+30 211 9550000',   displayPhone: '+30 211 9550000',    site: 'https://www.sixt.gr',      note: 'Reservations, Mon–Fri 09:00–17:00' },
    { company: 'Hertz (Autohellas)', phone: '+30 210 626 4000', displayPhone: '+30 210 626 4000', site: 'https://www.hertz.gr', note: 'Reservations · 24/7 breakdown +30 210 626 4646' },
    { company: 'Avis',     phone: '+30 210 6879800',   displayPhone: '+30 210 6879800',    site: 'https://www.avis.gr',      note: 'Reservations & booking changes' },
  ],
  Poland: [
    { company: 'Sixt',     phone: '+48 22 5111555',    displayPhone: '+48 22 5 111 555',   site: 'https://www.sixt.pl',      note: 'Reservation centre' },
    { company: 'Hertz',    phone: '+48 22 5001620',    displayPhone: '+48 22 50 01 620',   site: 'https://www.hertz.pl',     note: 'Reservations, Mon–Fri 09:00–17:00' },
    { company: 'Europcar', phone: '+48 222 555 600',   displayPhone: '+48 222 555 600',    site: 'https://www.europcar.com.pl', note: 'Reservations' },
  ],
  Czechia: [
    { company: 'Sixt',     phone: '+420 222 324 995',  displayPhone: '+420 222 324 995',   site: 'https://www.sixt.cz',      note: 'Reservation line, Mon–Fri 08:00–17:30' },
    { company: 'Hertz',    phone: '+420 225 345 000',  displayPhone: '+420 225 345 000',   site: 'https://www.hertz.cz',     note: 'Reservations, Mon–Fri 08:00–17:00' },
    { company: 'Europcar', phone: '+420 725 777 621',  displayPhone: '+420 725 777 621',   site: 'https://www.europcar.cz',  note: 'Reservations' },
  ],
  UK: [
    { company: 'Sixt',     phone: '+44 20 7018 8233',  displayPhone: '020 7018 8233',      site: 'https://www.sixt.co.uk',   note: 'Reservations / support' },
    { company: 'Hertz',    phone: '+44 20 3743 2260',  displayPhone: '020 3743 2260',      site: 'https://www.hertz.co.uk',  note: 'Reservations / customer care, 7 days' },
    { company: 'Enterprise Rent-A-Car', phone: '+44 800 111 4312', displayPhone: '0800 111 4312', site: 'https://www.enterprise.co.uk', note: 'Customer service (freephone inside the UK)' },
    { company: 'Europcar', phone: '+44 371 384 0235',  displayPhone: '0371 384 0235',      site: 'https://www.europcar.co.uk', note: 'Customer services / reservations' },
  ],
  'United Kingdom': { alias: 'UK' },

  /* ── Middle East & Africa ───────────────────────────────────── */
  UAE: [
    { company: 'Hertz',        phone: '+971 4 206 0206',   displayPhone: '800 HERTZ (800 43789)', site: 'https://www.hertz.ae',        note: 'Reservations 24/7 · toll-free inside the UAE' },
    { company: 'Diamondlease', phone: '+971 4 885 2677',   displayPhone: '800 DRIVE (800 37483)', site: 'https://www.diamondlease.com', note: 'Toll-free inside the UAE · 24/7 emergency +971 4 885 2211' },
    { company: 'Fast Rent a Car', phone: null,             displayPhone: null,                    site: 'https://www.fastuae.com',      note: 'Book online · branches across Dubai & Abu Dhabi' },
  ],
  'United Arab Emirates': { alias: 'UAE' },
  Turkey: [
    { company: 'Avis',  phone: '+90 216 444 28 47',  displayPhone: '444 28 47',      site: 'https://www.avis.com.tr',       note: 'Call centre 07:00–22:00 · national-rate inside Turkey' },
    { company: 'Sixt',  phone: '+90 850 222 2000',   displayPhone: '0850 222 2 000', site: 'https://www.sixt.com.tr',       note: 'Reservations 24/7' },
    { company: 'Enterprise / National / Alamo', phone: '+90 216 680 06 90', displayPhone: '444 4 937', site: 'https://www.enterprise.com.tr', note: 'Contact centre 24/7 (Yes Oto Kiralama, official licensee)' },
  ],
  Egypt: [
    { company: 'Hertz', phone: '+20 102 348 8885',   displayPhone: '0102 348 8885',  site: 'https://hertz-eg.com',          note: 'Reservations & customer service' },
    { company: 'Avis',  phone: '+20 15 5555 3581',   displayPhone: '+20 15 5555 3581', site: 'https://www.avis.com/en/locations/af/eg', note: 'Reservations' },
    { company: 'Sixt',  phone: null,                 displayPhone: '17277',          site: 'https://www.sixt.com.eg',       note: 'Short-code hotline inside Egypt only · book online from abroad' },
  ],
  Morocco: [
    { company: 'Hertz',    phone: '+212 802 007 778',  displayPhone: '+212 80 2007778',  site: 'https://en.hertz.ma',       note: 'Reservations · 24/7 assistance +212 5 22 10 64 65' },
    { company: 'Avis',     phone: '+212 522 974 000',  displayPhone: '0522 974 000',     site: 'https://www.avis.ma',       note: 'Bookings & changes, Mon–Fri 08:30–17:00' },
    { company: 'Europcar', phone: '+212 5 22 45 80 80', displayPhone: '+212 5 22 45 80 80', site: 'https://www.europcar.ma', note: 'Reservations, Mon–Fri 08:30–18:00' },
  ],
  Jordan: [
    { company: 'Avis',  phone: '+962 6 445 1133',    displayPhone: '+962 6 445 1133',  site: 'https://avis.com.jo',          note: 'Queen Alia Airport desk, open 24h' },
    { company: 'Hertz', phone: '+962 6 471 1771',    displayPhone: '+962 6 471 1771',  site: 'https://www.hertz.com/us/en/location/jordan', note: 'Amman, 24/7' },
    { company: 'Monte Carlo Rent a Car', phone: '+962 79 601 3636', displayPhone: '+962 79 601 3636', site: 'https://montecar.com', note: 'Local Jordanian company · phone & WhatsApp 24/7' },
  ],
  'Saudi Arabia': [
    { company: 'Budget', phone: '+966 92000 4124',   displayPhone: '92000 4124',      site: 'https://www.budgetsaudi.com', note: 'Reservations Sat–Thu 09:00–22:00, Fri 17:00–22:00' },
    { company: 'Hertz',  phone: '+966 92005561',     displayPhone: '9200 05561',      site: 'https://www.hertz.sa',        note: 'Unified reservations number · WhatsApp +966 12 604 0339' },
    { company: 'Avis',   phone: null,                displayPhone: null,              site: 'https://www.avis.com.sa',     note: 'Book online · branch numbers on the site' },
  ],
  Qatar: [
    { company: 'Hertz', phone: '+974 4010 8886',     displayPhone: '+974 4010 8886',  site: 'https://www.hertz.qa',        note: 'Local reservations 24h · from abroad +974 4448 9944' },
    { company: 'Avis',  phone: '+974 4466 7744',     displayPhone: '4466 7744',       site: 'https://www.avisqatar.com',   note: 'Customer service hotline 24/7' },
    { company: 'Sixt',  phone: null,                 displayPhone: null,              site: 'https://www.sixt.com/car-rental/qatar/', note: 'Book online · desk at Hamad International' },
  ],

  /* ── Asia ────────────────────────────────────────────────────── */
  Japan: [
    { company: 'Toyota Rent a Car',  phone: '+81 92 577 0091',  displayPhone: '0800 7000 815',    site: 'https://rent.toyota.co.jp/eng/', note: 'English reservation centre 08:00–20:00 JST · toll-free inside Japan' },
    { company: 'Nippon Rent-A-Car',  phone: '+81 3 6859 6234',  displayPhone: '+81 3 6859 6234',  site: 'https://www.nipponrentacar.co.jp/en/nrglobal/', note: 'English service desk, Mon–Fri 09:00–17:00 JST' },
    { company: 'Times Car Rental',   phone: null,               displayPhone: null,               site: 'https://www.timescar-rental.com/en/', note: 'Book online · 24h multilingual support' },
  ],
  'South Korea': [
    { company: 'Lotte Rent-a-Car',   phone: '+82 2 2078 2020',  displayPhone: '1588 1230',        site: 'https://www.lotterentacar.net/hp/eng/main/index.do', note: 'International line +82 2 2078 2020 · weekdays 09:00–19:00' },
    { company: 'SK Rent-a-Car',      phone: '+82 1599 9111',    displayPhone: '1599 9111',        site: 'https://homepage.skcarrental.com/en', note: 'Customer centre · national-rate inside Korea' },
  ],
  Thailand: [
    { company: 'Hertz', phone: '+66 2 266 4666',     displayPhone: '+66 2 266 4666',   site: 'https://www.hertzthailand.com', note: 'Reservations' },
    { company: 'Avis',  phone: '+66 2 251 1131',     displayPhone: '+66 2 251 1131',   site: 'https://www.avisthailand.com',  note: 'Reservations & assistance' },
  ],
  Singapore: [
    { company: 'Avis',  phone: '+65 6737 1668',      displayPhone: '1800 737 1668',    site: 'https://www.avis.com.sg',     note: 'Reservations · toll-free inside Singapore' },
    { company: 'Hertz', phone: '+65 6360 9077',      displayPhone: '+65 6360 9077',    site: 'https://www.hertz.com.sg',    note: 'Local reservations, Mon–Fri 09:00–18:00' },
  ],
  Malaysia: [
    { company: 'Hertz (Sime Darby)', phone: '+60 3 7650 8100', displayPhone: '1800 88 3086',  site: 'https://www.hertzmalaysia.com', note: 'Head office Mon–Fri 08:30–17:30 · KLIA counter +60 3 8776 6636' },
    { company: 'Mayflower Car Rental', phone: '+60 3 6253 1888', displayPhone: '+60 3 6253 1888', site: 'https://mayflowercarrental.com', note: 'Mon–Fri 09:00–18:00 · KLIA desk +60 3 8787 3850 daily' },
  ],
  Indonesia: [
    { company: 'Avis',  phone: '+62 812 6000 0363', displayPhone: '+62 812 6000 0363', site: 'https://www.avis.com/en/locations/as/id/bali', note: 'Bali Ngurah Rai Airport desk, 06:00–24:00' },
    { company: 'TRAC (Astra)', phone: '+62 899 9500 009', displayPhone: '1500009',     site: 'https://www.trac.astra.co.id', note: '24/7 customer centre · WhatsApp +62 899 9500 009' },
  ],
  Vietnam: [
    { company: 'Avis',  phone: '+84 96 5555 969',   displayPhone: '096 5555 969',    site: 'https://avis.com.vn',          note: 'Hotline · Hanoi, Da Nang, Ho Chi Minh City' },
    { company: 'Hertz (New City)', phone: '+84 91 169 1100', displayPhone: '+84 91 169 11 00', site: 'https://newcityrentacar.vn', note: 'Official Hertz licensee' },
  ],
  India: [
    { company: 'Avis',    phone: '+91 124 4724 888', displayPhone: '+91 124 4724888', site: 'https://www.avis.co.in',      note: 'Customer care for bookings' },
    { company: 'Zoomcar', phone: '+91 80 6897 2200', displayPhone: '080 6897 2200',   site: 'https://www.zoomcar.com',     note: 'Self-drive app · customer support' },
  ],
  Maldives: {
    notice: 'There is no self-drive car rental in the Maldives — islands are reached by speedboat or seaplane, arranged through your resort. The airport main line can point you to your transfer desk.',
    companies: [
      { company: 'Velana International Airport', phone: '+960 332 5511', displayPhone: '+960 332 5511', site: 'https://velana.macl.aero', note: 'Airport main line · resort transfer desks' },
    ],
  },
  China: {
    notice: 'Foreign driving licences are not accepted in mainland China, so tourists cannot self-drive. Book a car with a driver instead through your hotel or a licensed operator.',
    companies: [
      { company: 'Hertz China', phone: null, displayPhone: null, site: 'https://www.hertz.cn', note: 'Chauffeur-driven cars only for foreign visitors' },
      { company: 'Avis China',  phone: null, displayPhone: null, site: 'https://www.avis.cn',  note: 'Chauffeur-driven cars only for foreign visitors' },
    ],
  },

  /* ── Americas ────────────────────────────────────────────────── */
  USA: [
    { company: 'Hertz',      phone: '+1 800 654 3131', displayPhone: '1-800-654-3131', site: 'https://www.hertz.com',      note: 'Reservations 24/7 · toll-free inside the US' },
    { company: 'Avis',       phone: '+1 800 633 3469', displayPhone: '1-800-633-3469', site: 'https://www.avis.com',       note: 'Rates & reservations · toll-free inside the US' },
    { company: 'Enterprise', phone: '+1 855 266 9289', displayPhone: '1-855-266-9289', site: 'https://www.enterprise.com', note: 'Reservations · toll-free inside the US' },
    { company: 'Budget',     phone: '+1 800 218 7992', displayPhone: '1-800-218-7992', site: 'https://www.budget.com',     note: 'Reservations 24/7 · toll-free inside the US' },
    { company: 'Sixt',       phone: '+1 888 749 8227', displayPhone: '1-888-SIXT-CAR', site: 'https://www.sixt.com',       note: 'Reservations & customer service · toll-free inside the US' },
  ],
  'United States': { alias: 'USA' },
  Canada: [
    { company: 'Hertz',      phone: '+1 800 654 3001', displayPhone: '1-800-654-3001', site: 'https://www.hertz.ca',       note: 'Reservations · toll-free inside Canada' },
    { company: 'Avis',       phone: '+1 800 879 2847', displayPhone: '1-800-879-2847', site: 'https://www.avis.ca',        note: 'Reservations · toll-free inside Canada' },
    { company: 'Enterprise', phone: '+1 844 307 8008', displayPhone: '1-844-307-8008', site: 'https://www.enterprise.ca',  note: 'Reservations · toll-free inside Canada' },
  ],
  Mexico: [
    { company: 'Avis',     phone: '+52 55 5588 8888',  displayPhone: '800 288 8888',   site: 'https://www.avis.mx',          note: 'Reservations · toll-free inside Mexico; +52 55 5588 8888 from abroad' },
    { company: 'Europcar', phone: '+52 998 884 3003',  displayPhone: '800 201 2084',   site: 'https://www.europcar.com.mx',  note: 'Reservations 24/7 · toll-free inside Mexico; +52 998 884 3003 from abroad' },
    { company: 'Sixt',     phone: '+52 55 9225 2281',  displayPhone: '+52 55 9225 2281', site: 'https://www.sixt.com.mx',    note: 'Reservations & customer service' },
  ],
  Brazil: [
    { company: 'Localiza', phone: '+55 800 979 2020',  displayPhone: '0800 979 2020',  site: 'https://www.localiza.com',     note: 'Reservation centre 06:00–22:00 · toll-free inside Brazil' },
    { company: 'Movida',   phone: '+55 11 3488 3346',  displayPhone: '0800 606 8686',  site: 'https://www.movida.com.br',    note: 'Reservations 24h · +55 11 3488 3346 for foreign customers' },
    { company: 'Unidas',   phone: '+55 800 612 1121',  displayPhone: '0800 6 121 121', site: 'https://www.unidas.com.br',    note: 'Reservation centre 24h · toll-free inside Brazil' },
  ],
  Argentina: [
    { company: 'Hertz',    phone: '+54 11 7090 4000',  displayPhone: '+54 11 7090 4000', site: 'https://www.hertz.com.ar',   note: 'Reservations, Buenos Aires' },
    { company: 'Avis',     phone: '+54 11 4378 9640',  displayPhone: '0810 9991 2847',  site: 'https://www.avis.com.ar',     note: 'Reservation centre · +54 11 4378 9640 from abroad' },
    { company: 'Europcar', phone: '+54 11 4316 6570',  displayPhone: '(011) 4316-6570', site: 'https://www.europcar.com.ar', note: 'Reservations, Mon–Fri 09:00–19:00, Sat 09:00–13:00' },
  ],

  /* ── Oceania ─────────────────────────────────────────────────── */
  Australia: [
    { company: 'Hertz',    phone: '+61 13 30 39',       displayPhone: '13 30 39',        site: 'https://www.hertz.com.au',    note: 'Reservations, Mon–Fri 08:00–22:00, Sat–Sun 08:00–19:00 AEST' },
    { company: 'Avis',     phone: '+61 2 8310 8838',    displayPhone: '136 333',         site: 'https://www.avis.com.au',     note: 'Reservations · +61 2 8310 8838 from abroad' },
    { company: 'Budget',   phone: '+61 1300 362 848',   displayPhone: '1300 362 848',    site: 'https://www.budget.com.au',   note: 'Reservations, Mon–Fri 07:00–21:00, Sat–Sun 09:00–19:00 AEST' },
    { company: 'Europcar', phone: '+61 3 9330 6100',    displayPhone: '1300 136 886',    site: 'https://www.europcar.com.au', note: 'Reservations · +61 3 9330 6100 from abroad' },
  ],
  'New Zealand': [
    { company: 'Hertz',  phone: '+64 800 654 321',    displayPhone: '0800 654 321',    site: 'https://www.hertz.co.nz',     note: 'Reservations · toll-free inside NZ' },
    { company: 'Avis',   phone: '+64 4 488 1721',     displayPhone: '0800 655 111',    site: 'https://www.avis.co.nz',      note: 'Reservations · +64 4 488 1721 from abroad' },
    { company: 'Budget', phone: '+64 800 283 438',    displayPhone: '0800 283 438',    site: 'https://www.budget.co.nz',    note: 'Reservations · toll-free inside NZ' },
  ],

  /* ── Central Asia & Caucasus ─────────────────────────────────── */
  Uzbekistan: [
    { company: 'Europcar Uzbekistan', phone: '+998 55 510 09 90', displayPhone: '+998 55 510 09 90', site: 'https://europcar.com.uz', note: 'Tashkent office (Makhtumkuli 122) · airport desk +998 77 705 09 90' },
    { company: 'Sixt Uzbekistan',     phone: null,                displayPhone: null,                site: 'https://www.sixt.com/car-rental/uzbekistan/', note: 'Book online · Tashkent office & airport desk' },
    { company: 'Avis Uzbekistan',     phone: null,                displayPhone: null,                site: 'https://www.avis.com/en/locations/uz', note: 'Book online · Tashkent airport desk' },
  ],
  Kazakhstan: [
    { company: 'Hertz Kazakhstan',    phone: '+7 705 106 00 66',  displayPhone: '+7 705 106 00 66',  site: 'https://hertz.com.kz',    note: 'Reservations & WhatsApp, Almaty' },
    { company: 'Avis Kazakhstan',     phone: '+7 727 262 24 53',  displayPhone: '+7 (727) 262 24 53', site: 'https://www.avis.com.kz', note: 'Almaty city office · airport +7 701 409 0338' },
    { company: 'Europcar Kazakhstan', phone: null,                displayPhone: null,                site: 'https://europcar.kz',     note: 'Book online' },
  ],
  Kyrgyzstan: [
    { company: 'Naniko Rent a Car',   phone: '+995 570 10 49 52', displayPhone: '+995 570 10 49 52', site: 'https://naniko.kg',       note: 'Bishkek & Manas airport · central call centre' },
    { company: 'Sixt',                phone: null,                displayPhone: null,                site: 'https://www.sixt.com/car-rental/kyrgyzstan/', note: 'Book online · desk at Manas airport' },
    { company: 'Europcar',            phone: null,                displayPhone: null,                site: 'https://www.europcar.com/en-us/places/car-rental-kyrgyzstan', note: 'Book online · desk at Manas airport' },
  ],
  Tajikistan: [
    { company: 'Rentacar.tj',         phone: '+992 901 05 75 75', displayPhone: '+992 901 05 75 75', site: 'https://rentacar.tj',     note: 'Dushanbe · phone & WhatsApp' },
    { company: 'Naniko Rent a Car',   phone: '+995 574 28 88 55', displayPhone: '+995 574 28 88 55', site: 'https://naniko.com/car-rental-tajikistan/', note: 'Dushanbe · central call centre' },
    { company: 'Sixt',                phone: null,                displayPhone: null,                site: 'https://www.sixt.com/car-rental/tajikistan/', note: 'Book online · desk at Dushanbe airport' },
  ],
  Georgia: [
    { company: 'Europcar Georgia',    phone: '+995 32 244 80 80', displayPhone: '+995 32 244 80 80', site: 'https://www.europcar.ge',  note: 'Call centre · Tbilisi city & airport' },
    { company: 'Naniko Rent a Car',   phone: '+995 574 28 88 55', displayPhone: '+995 574 28 88 55', site: 'https://naniko.ge',        note: 'Tbilisi, Batumi, Kutaisi' },
    { company: 'Sixt Georgia',        phone: null,                displayPhone: null,                site: 'https://www.sixt.com/car-rental/georgia/', note: 'Book online · Tbilisi office & airport desk' },
  ],
  Azerbaijan: [
    { company: 'Hertz Azerbaijan',    phone: '+994 10 252 32 33', displayPhone: '+994 10 252 32 33', site: 'https://hertz.org.az',     note: 'Reservations & WhatsApp, Baku' },
    { company: 'Sixt Azerbaijan',     phone: null,                displayPhone: null,                site: 'https://www.sixt.com/car-rental/azerbaijan/', note: 'Book online · Baku airport desk' },
    { company: 'Avis Azerbaijan',     phone: null,                displayPhone: null,                site: 'https://www.avis.com/en/locations/az', note: 'Book online · Baku airport desk' },
  ],
  Armenia: [
    { company: 'Hertz Armenia',       phone: '+374 91 480 485',   displayPhone: '+374 91 480 485',   site: 'https://hertz.am',         note: 'Reservations, Yerevan' },
    { company: 'Sixt Armenia',        phone: '+374 60 373 366',   displayPhone: '+374 60 373 366',   site: 'https://www.sixt.am',      note: '24/7 (AM/RU/EN) · international +374 10 202 531' },
    { company: 'Europcar Armenia',    phone: '+374 10 544 905',   displayPhone: '+374 10 54-49-05',  site: 'https://www.europcar.com/en-am', note: 'Yerevan downtown office, 10:00–18:00' },
  ],
  Russia: [
    { company: 'Avis Russia',         phone: '+7 800 250 12 13',  displayPhone: '8 800 250 12 13',   site: 'https://www.avisrussia.ru', note: 'Reservations · toll-free inside Russia' },
    { company: 'Europcar Russia',     phone: '+7 800 777 07 55',  displayPhone: '8 (800) 777-07-55', site: 'https://europcar.ru',      note: 'Reservations 09:00–21:00 · toll-free inside Russia' },
  ],
};

/* Worldwide brands for a country we have no verified desk for: the booking
   sites still work everywhere, and each has a desk at the arrival airport. */
const GLOBAL = [
  { company: 'Sixt',     phone: null, displayPhone: null, site: 'https://www.sixt.com',     note: 'Book online · desk at the arrival airport' },
  { company: 'Hertz',    phone: null, displayPhone: null, site: 'https://www.hertz.com',    note: 'Book online · desk at the arrival airport' },
  { company: 'Avis',     phone: null, displayPhone: null, site: 'https://www.avis.com',     note: 'Book online · desk at the arrival airport' },
  { company: 'Europcar', phone: null, displayPhone: null, site: 'https://www.europcar.com', note: 'Book online · desk at the arrival airport' },
];

/**
 * Car-rental contacts for a destination. Always returns an object: a
 * destination we cannot place gets the worldwide brands, never nothing.
 * @returns {{ country: string, flag: string, verified: boolean, companies: Array }}
 */
export const getCarRentals = (destination = '') => {
  const country = resolveCountry(destination);
  let entry = country ? DB[country] : null;
  if (entry && !Array.isArray(entry) && entry.alias) entry = DB[entry.alias];
  const flag = country ? (getEmergencyContacts(destination).flag || '🌍') : '🌍';
  if (Array.isArray(entry) && entry.length) {
    return { country, flag, verified: true, notice: '', companies: entry };
  }
  if (entry && Array.isArray(entry.companies)) {
    return { country, flag, verified: true, notice: entry.notice || '', companies: entry.companies };
  }
  return { country: country || destination || '', flag, verified: false, notice: '', companies: GLOBAL };
};
