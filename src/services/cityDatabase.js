// ── Per-city travel data (real landmarks, streets, restaurants) ────────────────
export const cityDatabase = {

  // ── EUROPE ────────────────────────────────────────────────────────────────────
  berlin: {
    name: 'Berlin', country: 'Germany', currency: 'EUR', budgetFactor: 1.0,
    hero: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private Mercedes S-Class transfers + BVG First Class day pass.',
      standard: 'U-Bahn & S-Bahn with a Berlin Welcome Card — unlimited rides + museum discounts.',
      economy:  'BVG day ticket (€9.80) covers all U-Bahn, S-Bahn, tram & bus lines.',
    },
    hotels: {
      luxury:   'Hotel Adlon Kempinski (Unter den Linden)',
      standard: 'nhow Berlin (East Side Gallery area)',
      economy:  'Meininger Hotel Berlin Hauptbahnhof',
    },
    tips: [
      'Buy a Berlin Welcome Card — unlimited public transport + 25 % off museums.',
      'Reichstag dome: register online (free) at least 2 days ahead.',
      'Museum Island day pass (~€24) covers all 5 museums.',
      'Most supermarkets close on Sunday — stock up Saturday.',
      'Tap water is safe and excellent quality everywhere in Berlin.',
    ],
    places: [
      'Mitte — Historic Centre', 'Prenzlauer Berg', 'Kreuzberg',
      'Charlottenburg', 'Friedrichshain', 'Museum Island (Museumsinsel)',
      'Alexanderplatz', 'Potsdamer Platz', 'Hackescher Markt',
    ],
    activities: {
      history: {
        morning:   ['Brandenburg Gate sunrise walk (Pariser Platz, free)', 'Reichstag Building glass dome tour (pre-registration required, free)', 'Berlin Wall Memorial on Bernauer Straße (free)', 'Topography of Terror exhibition (free)'],
        afternoon: ['Checkpoint Charlie & Cold War Museum (~€15)', 'Jewish Museum Berlin — Libeskind building (~€8)', 'Pergamon Museum on Museum Island (~€24 day pass)', 'Sachsenhausen Memorial Day Tour (~€20 with guide)'],
        evening:   ['East Side Gallery — 1.3 km painted Wall section at dusk (free)', 'Memorial to the Murdered Jews of Europe at night (free)', 'Historic Nikolaiviertel quarter evening walk', 'DDR Museum evening visit (~€12.50)'],
      },
      culture: {
        morning:   ['Hamburger Bahnhof Museum of Contemporary Art (~€14)', 'Turkish Market on Maybachufer (Tue & Fri, free)', 'Hackescher Markt courtyard complex morning stroll', 'KW Institute for Contemporary Art (~€8)'],
        afternoon: ['Berlinische Galerie photography & design museum (~€12)', 'Kurfürstendamm boulevard shopping & architecture', 'Charlottenburg Palace & gardens (~€12)', 'Tempodrom or Philharmonie concert matinée'],
        evening:   ['Berliner Philharmoniker concert at the Philharmonie', 'Komische Oper Berlin performance', 'Berghain / Kulturbrauerei nightlife area', 'Street food and cocktails at Markthalle Neun'],
      },
      food: {
        morning:   ['Breakfast at Rosenthaler Platz café scene (Mitte)', 'Currywurst tasting at Curry 36, Kreuzberg (from €3)', 'Sunday brunch at Klunkerkranich rooftop, Neukölln', 'Local bakery Brot & Butter for German bread culture'],
        afternoon: ['Döner Kebab at Mustafa\'s Gemüse Kebap, Kreuzberg (≈€5)', 'Lunch at Markthalle Neun food hall, Kreuzberg', 'Street food tour of Prenzlauer Berg', 'Augustiner am Gendarmenmarkt — Bavarian beer hall lunch'],
        evening:   ['Dinner at Nobelhart & Schmutzig (local German haute cuisine, book ahead)', 'Rooftop dinner at Deck 5 shopping mall, Prenzlauer Berg', 'Night food market at RAW Gelände, Friedrichshain', 'Traditional Berliner Weisse at a Kreuzberg Biergarten'],
      },
      nature: {
        morning:   ['Tiergarten park sunrise jog (Straße des 17. Juni, 210 ha, free)', 'Tempelhofer Feld — former airfield park cycling (free)', 'Grunewald forest hike (SW Berlin, free)', 'Viktoriapark & Kreuzberg hill morning walk (free)'],
        afternoon: ['Botanical Garden Berlin (~€7) — 43 ha, 22 000 plants', 'Britzer Garten park visit (~€3)', 'Müggelsee lake boat rental, SE Berlin', 'Wannsee beach & lake, SW Berlin'],
        evening:   ['Sunset at Teufelsberg hill overlooking the city', 'Klunkerkranich rooftop garden bar, Neukölln', 'Dusk walk along the Landwehrkanal, Kreuzberg', 'Stargazing at Archenhold Observatory, Treptow (~€4)'],
      },
    },
  },

  paris: {
    name: 'Paris', country: 'France', currency: 'EUR', budgetFactor: 1.2,
    hero: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur in Citroën DS or Mercedes; skip queues with VIP entry passes.',
      standard: 'Navigo week pass (~€30) — unlimited Métro, RER, bus across all zones.',
      economy:  'Carnet of 10 Métro tickets (~€17.35); walk between nearby arrondissements.',
    },
    hotels: {
      luxury:   'Le Meurice (1 Rue de Rivoli, 1st arr.) — 5-star palace hotel',
      standard: 'Hôtel du Louvre (1st arr.) — 4-star near all major sights',
      economy:  'Generator Paris Hostel (10th arr.) — stylish budget stay',
    },
    tips: [
      'Book Eiffel Tower summit tickets 60+ days ahead — they sell out fast.',
      'Most national museums are free on the first Sunday of every month.',
      'The Louvre is less crowded on Wednesday and Friday evenings (open until 21:45).',
      'Boulangeries open at 07:00 — grab a fresh croissant for under €1.50.',
      'Paris Visite pass covers airport RER + all zones for day-trippers.',
    ],
    places: [
      'Le Marais (3rd & 4th arr.)', 'Saint-Germain-des-Prés (6th arr.)', 'Montmartre (18th arr.)',
      'Champs-Élysées (8th arr.)', 'Latin Quarter (5th arr.)', 'Île de la Cité',
      'Canal Saint-Martin (10th arr.)', 'Oberkampf (11th arr.)', 'Bastille area',
    ],
    activities: {
      history: {
        morning:   ['Louvre Museum — Mona Lisa & antiquities (~€17, book online)', 'Notre-Dame de Paris reconstruction viewing from outside', 'Sainte-Chapelle stained glass chapel (~€11.50)', 'Musée de Cluny — National Museum of the Middle Ages (~€12)'],
        afternoon: ['Palace of Versailles day trip — 1 h by RER C (~€20)', 'Napoleon\'s tomb at Les Invalides (~€14)', 'Musée d\'Orsay Impressionist masterpieces (~€16)', 'Conciergerie — Marie Antoinette\'s prison (~€9)'],
        evening:   ['Sunset at Arc de Triomphe rooftop (~€13)', 'Eiffel Tower light show at 21:00 (every hour, free to watch)', 'Evening Seine river cruise with Bateaux Mouches (~€17)', 'Palais Royal gardens evening stroll (free)'],
      },
      culture: {
        morning:   ['Centre Pompidou modern art (~€14)', 'Musée Picasso in Le Marais (~€14)', 'Fondation Louis Vuitton contemporary art (~€16)', 'Atelier des Lumières — immersive art installations (~€16)'],
        afternoon: ['Galeries Lafayette department store & free rooftop view', 'Opéra Garnier guided tour (~€14)', 'Shakespeare and Company bookshop browse (free)', 'Sainte-Chapelle stained glass (afternoon light is best)'],
        evening:   ['Moulin Rouge dinner & cabaret show (~€115)', 'Jazz concert at Caveau de la Huchette, Latin Quarter', 'Canal Saint-Martin evening walk & apéro', 'Le Marais LGBTQ+ & art bar scene'],
      },
      food: {
        morning:   ['Croissant & café crème at Café de Flore, Saint-Germain', 'Breakfast pastries at Du Pain et des Idées bakery, 10th arr.', 'Marché d\'Aligre fresh produce market (Tue–Sun, free entry)', 'Pain au chocolat tour of Montmartre boulangeries'],
        afternoon: ['Lunch at bistro on Rue de Bretagne, Le Marais (~€18)', 'Steak frites at Café de l\'Industrie, 11th arr.', 'Fromagerie & charcuterie tasting in the Latin Quarter', 'Crêpes at a Breton creperie near Montparnasse'],
        evening:   ['Dinner at Septime (1 Rue de Charonne, book weeks ahead)', 'Fondue & raclette evening in the Latin Quarter', 'Wine bar apéro at Le Baron Rouge, Bastille', 'Night market dinner at Marché des Enfants Rouges'],
      },
      nature: {
        morning:   ['Tuileries Garden sunrise stroll (free, 07:30 open)', 'Jardin du Luxembourg morning jog — fountains & tennis (free)', 'Bois de Vincennes lake cycling (free, bikes €4/h)', 'Parc des Buttes-Chaumont — hilly park with island temple (free)'],
        afternoon: ['Versailles palace gardens (garden only ~€9.50)', 'Jardins des Plantes botanical garden (~€7)', 'Île Saint-Louis waterfront walk & Berthillon ice cream', 'Promenade Plantée — elevated green walkway (free)'],
        evening:   ['Sunset at Sacré-Cœur steps, Montmartre (free)', 'Parc André Citroën hot-air balloon ride (~€13)', 'Dusk walk along the Seine from Pont Neuf to Notre-Dame', 'Coulée Verte René-Dumont evening stroll (free)'],
      },
    },
  },

  london: {
    name: 'London', country: 'United Kingdom', currency: 'GBP', budgetFactor: 1.3,
    hero: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private black cab service + Heathrow Express (15 min, £37 each way).',
      standard: 'Oyster card (pay-as-you-go) or contactless — daily cap ~£8.10 inner zones.',
      economy:  'Santander Cycles (Boris bikes) £2/day + bus day-tapper cap £5.25.',
    },
    hotels: {
      luxury:   'The Savoy (Strand, WC2) — iconic 5-star Thames hotel',
      standard: 'Premier Inn London City (Tower Bridge area)',
      economy:  'YHA London Central Hostel (Oxford Street area)',
    },
    tips: [
      'Most major museums (British Museum, V&A, National Gallery) are FREE.',
      'Get an Oyster card — much cheaper than buying paper tickets.',
      'Avoid black cabs late night — use the official Uber or Bolt apps.',
      'Sunday roast is a British institution — book a pub for 13:00–14:00.',
      'Heathrow Express to Paddington in 15 min (book online for ~£22).',
    ],
    places: [
      'South Bank (SE1)', 'Shoreditch & Brick Lane (E1)', 'Covent Garden (WC2)',
      'Notting Hill (W11)', 'Camden Town (NW1)', 'The City of London (EC2)',
      'Greenwich (SE10)', 'Kensington (W8)', 'Borough Market area (SE1)',
    ],
    activities: {
      history: {
        morning:   ['Tower of London & Crown Jewels (~£34, book online)', 'British Museum — Rosetta Stone, Elgin Marbles (FREE)', 'Westminster Abbey morning visit (~£29)', 'Museum of London — city history (FREE, closes 2026)'],
        afternoon: ['Hampton Court Palace day trip (~£28, 35 min from Waterloo)', 'Churchill War Rooms underground bunker (~£28)', 'National Maritime Museum, Greenwich (FREE)', 'Victoria & Albert Museum — decorative arts (FREE)'],
        evening:   ['Tower Bridge glass walkway at night (~£10.60)', 'Jack the Ripper evening walking tour, Whitechapel (~£15)', 'Shakespeare\'s Globe Theatre performance (~£20–60)', 'Dinner at Ye Olde Cheshire Cheese pub, Fleet Street'],
      },
      culture: {
        morning:   ['National Gallery — Van Gogh, Turner, da Vinci (FREE)', 'Tate Modern on the South Bank (FREE)', 'Saatchi Gallery, Chelsea (FREE)', 'Courtauld Gallery — Impressionist masterpieces (~£9)'],
        afternoon: ['Brick Lane street art & vintage markets, Shoreditch', 'Columbia Road Flower Market (Sunday 08:00–15:00, free)', 'Portobello Road antiques market, Notting Hill (Sat)', 'Covent Garden street performers & piazza (free)'],
        evening:   ['West End musical — Hamilton, Les Misérables, Phantom (~£30–120)', 'Royal Opera House Covent Garden performance', 'Comedy night at The Comedy Store, Leicester Square', 'Live jazz at Ronnie Scott\'s, Soho (~£35+)'],
      },
      food: {
        morning:   ['Full English breakfast at E. Pellicci, Bethnal Green (since 1900)', 'Borough Market food stalls — cheese, bread, pastries (FREE to browse)', 'Flat white & avocado toast in Shoreditch coffee scene', 'Cereal Killer Café cereal bar experience, Brick Lane'],
        afternoon: ['Fish & chips at The Golden Hind, Marylebone (~£14)', 'Lunch at Dishoom (Indian, Covent Garden) — book ahead', 'Street food at Maltby Street Market, Bermondsey (Sat–Sun)', 'Afternoon tea at Fortnum & Mason (~£60, book ahead)'],
        evening:   ['Dinner at The Ivy, Covent Garden (classic British, book ahead)', 'Chinatown Gerrard Street dinner (~£12–18)', 'Rooftop bar at Sky Garden, 20 Fenchurch St (FREE, book online)', 'Pub dinner at The Lamb & Flag, Covent Garden'],
      },
      nature: {
        morning:   ['Hyde Park morning walk — Serpentine Lake (free)', 'Kensington Gardens sunrise & Albert Memorial (free)', 'Hampstead Heath early morning swim at the ponds (free)', 'Richmond Park deer watching at sunrise (~45 min from centre)'],
        afternoon: ['Kew Royal Botanic Gardens (~£22)', 'Greenwich Park & Prime Meridian Line (free)', 'Regent\'s Park & Queen Mary\'s Rose Garden (free)', 'Primrose Hill panoramic London view (free)'],
        evening:   ['Sunset at Primrose Hill — best free London viewpoint', 'Thames foreshore walk from Southwark to Tower Bridge', 'Battersea Park evening stroll & Peace Pagoda (free)', 'Sky Garden sunset views (free, must book online)'],
      },
    },
  },

  tokyo: {
    name: 'Tokyo', country: 'Japan', currency: 'JPY', budgetFactor: 1.1,
    hero: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car with English-speaking driver; Shinkansen Green Car for day trips.',
      standard: 'IC card (Suica / Pasmo) — tap-in/out on all metro, JR, and buses seamlessly.',
      economy:  '24/48/72 h Tokyo Metro pass (¥600/¥1 200/¥1 500) for unlimited metro rides.',
    },
    hotels: {
      luxury:   'Park Hyatt Tokyo (Shinjuku) — Lost in Translation hotel',
      standard: 'Dormy Inn Shibuya (Shibuya-ku)',
      economy:  'Khaosan Tokyo Origami Hostel (Asakusa)',
    },
    tips: [
      'Get a Suica/Pasmo IC card at the airport — works on every train and bus.',
      'Buy a JR Pass before arriving if doing day trips (Nikko, Kamakura, Hakone).',
      'Convenience stores (7-Eleven, FamilyMart) sell excellent hot food 24/7.',
      'Tipping is considered rude in Japan — do not tip at restaurants.',
      'Last train is around midnight — check schedules or budget for a taxi home.',
    ],
    places: [
      'Shinjuku (新宿)', 'Shibuya (渋谷)', 'Asakusa (浅草)',
      'Harajuku & Omotesando', 'Akihabara (秋葉原)', 'Ginza (銀座)',
      'Ueno (上野)', 'Roppongi (六本木)', 'Yanaka (谷中) old town',
    ],
    activities: {
      history: {
        morning:   ['Senso-ji Temple, Asakusa — 07:00 before crowds (free)', 'Meiji Jingu Shrine, Harajuku (free, open sunrise)', 'Imperial Palace East Gardens (free, closed Mon/Fri)', 'Yanaka Ginza historic old-town neighbourhood walk (free)'],
        afternoon: ['Edo-Tokyo Museum (~¥600, check reopening 2025)', 'Tokyo National Museum, Ueno (~¥1 000)', 'Samurai Museum, Shinjuku (~¥1 900)', 'Zojo-ji Temple & Tokyo Tower view (free)'],
        evening:   ['Asakusa Nakamise shopping street at dusk (free)', 'Tokyo Skytree evening ascent (~¥2 100)', 'Roppongi Hills Mori Art Museum night visit (~¥2 000)', 'Sumida River evening walk near Asakusa (free)'],
      },
      culture: {
        morning:   ['Harajuku Takeshita Street — fashion subculture (free, opens 10:00)', 'TeamLab Borderless/Planets digital art immersion (~¥3 200)', 'Ghibli Museum, Mitaka (advance ticket required, ~¥1 000)', 'Kabukiza Theatre morning culture show, Ginza (~¥1 000+)'],
        afternoon: ['Shibuya 109 fashion shopping & crossing spectacle', 'Akihabara electronics & anime district explore (free)', 'Omotesando luxury boutiques & architecture walk (free)', 'Cat café visit in Shinjuku (~¥1 200/h)'],
        evening:   ['Shinjuku Golden Gai — 200+ tiny bars (drinks from ¥700)', 'Kabuki or Noh theatre evening performance', 'Robot Restaurant dinner show, Shinjuku (~¥8 000)', 'Omoide Yokocho (Memory Lane) yakitori alley, Shinjuku'],
      },
      food: {
        morning:   ['Tsukiji Outer Market breakfast — sushi & tamagoyaki (~¥1 500)', 'Kaiseki morning set at a Ginza teahouse', 'Convenience store onigiri & green tea (¥200 total)', 'Ramen breakfast at Fuunji (Shinjuku) — tsukemen style (¥950)'],
        afternoon: ['Sushi lunch at Sushi Saito or conveyor belt Kura Sushi', 'Tempura lunch at Tsunahachi, Shinjuku (from ¥2 000)', 'Lunch at Ichiran Ramen (solo booth concept, ¥980)', 'Street food in Asakusa — ningyo-yaki & ningyo-gashi'],
        evening:   ['Omakase sushi dinner in Ginza (from ¥15 000, book weeks ahead)', 'Yakiniku (Korean BBQ) dinner in Shibuya (~¥4 000)', 'Izakaya dinner in Shinjuku — yakitori, edamame, sake (~¥3 000)', 'Tempura kappo dinner at Mikawa, Roppongi (~¥12 000)'],
      },
      nature: {
        morning:   ['Shinjuku Gyoen National Garden (~¥500, opens 09:00)', 'Yoyogi Park morning tai chi & picnic area (free)', 'Ueno Park & Shinobazu Pond morning walk (free)', 'Mount Takao day hike (40 min from Shinjuku, ¥630 return)'],
        afternoon: ['Hamarikyu Gardens tidal park (~¥300)', 'Inokashira Park & rowboats, Kichijoji (~¥700/30 min)', 'Nikko National Park day trip — waterfalls & Tosho-gu shrine', 'Tokyo Bay cruise from Odaiba (~¥1 020)'],
        evening:   ['Sunset from Tokyo Metropolitan Government Building observation deck (FREE)', 'Odaiba Rainbow Bridge & waterfront walk (free)', 'Shibuya Sky rooftop at sunset (~¥2 000)', 'Fireworks cruise on Sumida River (summer events)'],
      },
    },
  },

  istanbul: {
    name: 'Istanbul', country: 'Turkey', currency: 'TRY', budgetFactor: 0.65,
    hero: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car with driver; Bosphorus private yacht charter (~$200/h).',
      standard: 'Istanbulkart (rechargeable, ¥50 card fee) — metro, tram, bus, ferry discounts.',
      economy:  'Istanbulkart shared — single ride ~₺5; ferry across Bosphorus ~₺7.',
    },
    hotels: {
      luxury:   'Four Seasons Hotel Sultanahmet (in a converted prison!)',
      standard: 'Witt Istanbul Suites (Cihangir, Beyoğlu)',
      economy:  'Agora Guesthouse (Sultanahmet, near Hagia Sophia)',
    },
    tips: [
      'Get the Museum Pass Istanbul (~₺2 500) — covers Hagia Sophia, Topkapi, and more.',
      'Haggling is expected in the Grand Bazaar — start at 40 % of asking price.',
      'Friday noon prayers: Hagia Sophia & Blue Mosque close 30 min for namaz.',
      'The Bosphorus ferry (Üsküdar–Eminönü) costs ₺7 and beats any cruise.',
      'Turkish coffee is served very thick — wait for grounds to settle before drinking.',
    ],
    places: [
      'Sultanahmet (Old City)', 'Beyoğlu & İstiklal Caddesi', 'Karaköy',
      'Beşiktaş', 'Balat (old Jewish & Greek quarter)', 'Kadıköy (Asian side)',
      'Ortaköy', 'Üsküdar (Asian shore)', 'Grand Bazaar area (Kapalıçarşı)',
    ],
    activities: {
      history: {
        morning:   ['Hagia Sophia (Ayasofya) at opening 09:00 — beat the queues (free for mosque)', 'Topkapı Palace & Harem (~₺800 total, book online)', 'Istanbul Archaeology Museums (~₺350)', 'Church of St. Saviour in Chora (Kariye) mosaics (~₺200)'],
        afternoon: ['Blue Mosque (Sultanahmet Camii) — free, close Fri noon prayer', 'Grand Bazaar (Kapalıçarşı) — 4 000 shops (free to enter)', 'Basilica Cistern underground (~₺250)', 'Dolmabahçe Palace (~₺600)'],
        evening:   ['Galata Tower sunset views (~₺350)', 'Rumeli Fortress on the Bosphorus at dusk (₺50)', 'Evening İstiklal Caddesi walk — 3 km pedestrian avenue (free)', 'Spice Bazaar (Mısır Çarşısı) closing-hour atmosphere (free)'],
      },
      culture: {
        morning:   ['Balat neighbourhood colourful houses walk (free)', 'Pera Museum (~₺250) — Orientalist paintings', 'Istanbul Modern art museum, Galataport (~₺300)', 'Whirling Dervish ceremony at Galata Mevlevi Lodge (~₺350)'],
        afternoon: ['Kadıköy Asian side market & street food tour', 'İstiklal Caddesi art galleries & music shops browse (free)', 'Çukurcuma antique dealers quarter, Cihangir (free)', 'Turkish bath (hamam) at Çemberlitaş Hamamı (~₺900)'],
        evening:   ['Sema whirling dervish evening show (~₺350)', 'Bosphorus dinner cruise (~₺1 500 incl. food)', 'Hodjapasha Culture Center — belly dance & folklore show (~₺600)', 'Nevizade Sokak — outdoor raki & meze bars, Beyoğlu'],
      },
      food: {
        morning:   ['Turkish breakfast (kahvaltı) at Van Kahvaltı Evi, Cihangir (~₺350)', 'Simit (sesame bread ring) from a street cart (₺10)', 'Karaköy Güllüoğlu — best börek & baklava bakery', 'Fish sandwich (balık ekmek) on the Galata Bridge (₺120)'],
        afternoon: ['Lunch at Çiya Sofrası, Kadıköy — 100+ regional dishes (~₺400)', 'Kebab lunch at Develi Restaurant, Samatya (~₺500)', 'Meze spread at Meyhane in Balıkpazarı fish market area', 'Street food: midye dolma (stuffed mussels) on İstiklal (₺5 each)'],
        evening:   ['Rooftop dinner at Nar Restaurant, Armaggan, Nuruosmaniye', 'Beyoğlu meyhane (tavern) — raki, meze, live fasıl music (~₺800)', 'Dinner at 360 Istanbul rooftop restaurant, Beyoğlu', 'Traditional Ottoman dinner at Matbah Restaurant, Sultanahmet'],
      },
      nature: {
        morning:   ['Bosphorus ferry Eminönü → Anadolu Kavağı and back (₺50, 2 h)', 'Belgrade Forest morning hike, NW Istanbul (free)', 'Emirgan Park tulip garden (Apr–May, ₺20)', 'Princes\' Islands (Büyükada) ferry + bicycle ride (₺200 return)'],
        afternoon: ['Bosphorus bridge viewpoint at Ortaköy (free)', 'Gülhane Park stroll below Topkapı (free)', 'Asian side Bağlarbaşı Park, Üsküdar (free)', 'Pierre Loti Hill & cable car, Eyüp (~₺10)'],
        evening:   ['Sunset on the Galata Bridge fishing pier (free)', 'Çamlıca Hill — panoramic city & Bosphorus view at dusk (free)', 'Ortaköy waterfront & mosque illuminated at night (free)', 'Evening ferry crossing — city skyline from the water (₺7)'],
      },
    },
  },

  dubai: {
    name: 'Dubai', country: 'UAE', currency: 'AED', budgetFactor: 1.4,
    hero: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private limousine from DXB; helicopter city tours (AED 800/30 min).',
      standard: 'NOL card for Dubai Metro + bus; Careem/Uber app for taxis.',
      economy:  'Dubai Metro Red & Green lines (AED 3–8.50 per trip); free air-conditioned stations.',
    },
    hotels: {
      luxury:   'Burj Al Arab Jumeirah (sail-shaped 7-star icon)',
      standard: 'Rove Downtown Dubai (near Burj Khalifa)',
      economy:  'Zabeel House by Jumeirah (Al Seef, Old Dubai)',
    },
    tips: [
      'Burj Khalifa At the Top: book tickets online (AED 149 vs AED 400 at the door).',
      'Dress modestly in Old Dubai and mosques — covered shoulders and knees.',
      'Dubai Mall is connected to Burj Khalifa Metro station by a covered walkway.',
      'Tap water is technically drinkable but bottled is preferred by locals.',
      'Friday is the weekly holiday — many businesses close Friday morning.',
    ],
    places: [
      'Downtown Dubai (Burj Khalifa area)', 'Old Dubai — Deira & Bur Dubai', 'Dubai Marina',
      'Jumeirah Beach', 'Al Fahidi Historic District', 'Dubai Creek',
      'City Walk (Al Wasl)', 'Palm Jumeirah', 'Gold Souk & Spice Souk (Deira)',
    ],
    activities: {
      history: {
        morning:   ['Al Fahidi Historical Neighbourhood — wind tower architecture (free)', 'Dubai Museum in Al Fahidi Fort (~AED 3)', 'Gold Souk, Deira — 300+ gold jewellery shops (free to browse)', 'Spice Souk, Deira — saffron, frankincense (free to browse)'],
        afternoon: ['Sheikh Mohammed Centre for Cultural Understanding — cultural lunch (~AED 100)', 'Jumeirah Mosque guided tour (non-Muslims welcome, AED 35)', 'Dubai Creek dhow water taxi (abra) crossing (~AED 2)', 'Bastakiya Quarter art galleries & traditional houses'],
        evening:   ['Dubai Creek dhow dinner cruise (~AED 150 incl. food)', 'Old Dubai night walk — Textile Souk & neon signs (free)', 'Al Seef Heritage District evening stroll (free)', 'Meena Bazaar Indian bazaar atmosphere at dusk (free)'],
      },
      culture: {
        morning:   ['Etihad Museum, Jumeirah (~AED 25)', 'Al Quoz galleries district — contemporary art (free most)', 'Coffee Museum, Al Fahidi (free)', 'Alserkal Avenue creative hub, Al Quoz (free)'],
        afternoon: ['Dubai Opera matinée or tour (~AED 75 for tour)', 'Dubai Frame — 150 m picture frame skyscraper (~AED 50)', 'La Mer beachfront cultural events (free)', 'Sikka Art Fair (annual event, March, free)'],
        evening:   ['Dubai Opera evening performance (from AED 200)', 'Burj Khalifa Dubai Fountain show — 18:00 & every 30 min after (free)', 'Dubai Design District (d3) nightlife (free)', 'Global Village cultural entertainment (~AED 20 entry, Oct–Apr)'],
      },
      food: {
        morning:   ['Breakfast at Tom & Serg, Al Quoz (~AED 75)', 'Emirati breakfast — balaleet & khameer at Al Ustad Special Kabab', 'Ravi Restaurant Pakistani — legendary cheap breakfast (AED 30)', 'Logma Emirati brunch, Jumeirah (~AED 80)'],
        afternoon: ['Lunch at Bu Qtair — fresh grilled fish shack, Jumeirah (~AED 60)', 'Mall of the Emirates food court — Lebanese, Indian, Filipino', 'Zaroob Lebanese street food, Sheikh Zayed Rd (~AED 50)', 'Afternoon tea at Burj Al Arab Sky & Sea Lounge (AED 395)'],
        evening:   ['Dinner at Nobu, Atlantis The Palm (AED 500+)', 'BBQ street food at Al Dhiyafa Rd, Satwa (~AED 40)', 'At.mosphere dinner, Burj Khalifa floor 122 (AED 700+)', 'Seafood dinner at Pierchic, Jumeirah overwater (~AED 400)'],
      },
      nature: {
        morning:   ['Sunrise over Burj Khalifa from Burj Park (free)', 'Al Mamzar Beach Park (~AED 5) — calm & uncrowded', 'Dubai Creek kayaking tour (AED 150)', 'Desert safari sunrise drive (~AED 200)'],
        afternoon: ['Jumeirah Public Beach — free & well-maintained', 'Dubai Miracle Garden (~AED 55, Oct–Apr) — 150M flowers', 'Dubai Water Canal walk (free)', 'Ras Al Khor Wildlife Sanctuary — flamingos (free)'],
        evening:   ['Desert safari dune bashing + BBQ dinner (~AED 250)', 'Sunset on Palm Jumeirah frond (free)', 'Dubai Marina sunset walk & yacht views (free)', 'Burj Khalifa rooftop sunset — Level 124 (~AED 149)'],
      },
    },
  },

  rome: {
    name: 'Rome', country: 'Italy', currency: 'EUR', budgetFactor: 1.0,
    hero: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car service; skip-the-line Vatican & Colosseum VIP tours.',
      standard: '48/72 h transit pass (~€9/€12) — metro, buses, trams all included.',
      economy:  'Walk everywhere in the historic centre (15 min between major sights); bus €1.50/ride.',
    },
    hotels: {
      luxury:   'Hotel de Russie (Via del Babuino) — 5-star near Piazza del Popolo',
      standard: 'Hotel Artemide (Via Nazionale) — 4-star, central location',
      economy:  'The Yellow Hostel (Via Palestro) — lively, near Termini station',
    },
    tips: [
      'Book Colosseum + Roman Forum combo online (€18) — no same-day walk-in usually.',
      'Vatican Museums: buy skip-the-line tickets online (€20) — queues can be 2+ hours.',
      'Trevi Fountain is best before 07:00 or after 22:00 to avoid crowds.',
      'Aperitivo hour (18:00–20:00): buy a drink (~€8) and often get free snacks.',
      'Tap water (nasone street fountains) is excellent and completely free in Rome.',
    ],
    places: [
      'Ancient Rome (Colosseo / Foro Romano)', 'Vatican & Prati', 'Trastevere',
      'Campo de\' Fiori & Ghetto', 'Piazza Navona area', 'Spanish Steps (Trinità dei Monti)',
      'Monti neighbourhood', 'Testaccio (local food district)', 'Pigneto (creative quarter)',
    ],
    activities: {
      history: {
        morning:   ['Colosseum (Anfiteatro Flavio) + Roman Forum + Palatine Hill (€18 combo, book online)', 'Pantheon — 2 000-year-old dome temple (~€5)', 'Roman Forum early morning before crowds (~€18 combo)', 'Ostia Antica day trip — better preserved than Pompeii (€12)'],
        afternoon: ['Vatican Museums & Sistine Chapel (~€20, book online)', 'St Peter\'s Basilica & dome (~€8 for dome)', 'Borghese Gallery (€15, mandatory reservation)', 'Capitoline Museums — oldest public museum in the world (~€15)'],
        evening:   ['Trevi Fountain illuminated at night (free, best after 22:00)', 'Palatine Hill sunset views over the Roman Forum (~€18 combo)', 'Piazza Venezia & Altare della Patria at night (free)', 'Appian Way evening walk — ancient cobblestones & tombs (free)'],
      },
      culture: {
        morning:   ['MAXXI Museum of contemporary art (~€12)', 'Galleria Borghese masterpieces (€15, must reserve)', 'Piazza del Popolo twin churches & obelisk (free)', 'Trastevere morning walk — medieval lanes & piazzas (free)'],
        afternoon: ['Piazza Navona street artists & baroque fountains (free)', 'Campo de\' Fiori market (closes 14:00, free)', 'Galleria Doria Pamphilj — private palace gallery (~€14)', 'Spanish Steps & Via Condotti luxury shops'],
        evening:   ['Opera or ballet at Teatro dell\'Opera di Roma (~€30–150)', 'Jazz at Big Mama, Trastevere', 'Free classical concert at a church (common in summer)', 'Aperitivo in Monti neighbourhood — free snacks with drinks'],
      },
      food: {
        morning:   ['Cornetto & cappuccino standing at Sant\'Eustachio il Caffè (€2.50 total)', 'Supplì Roma fried rice balls at Supplì Roma, Trastevere (€3 each)', 'Mercato Testaccio — local food market (free to browse, opens 07:00)', 'Forno Campo de\' Fiori — pizza bianca fresh from the oven (€3)'],
        afternoon: ['Lunch: cacio e pepe at Tonnarello, Trastevere (~€15)', 'Pizza al taglio (by the slice) at Pizzarium, Prati (~€5)', 'Gelato at Fatamorgana or Giolitti (artisanal, €3)', 'Pasta lunch at Trattoria Monti, Monti (~€18)'],
        evening:   ['Dinner at La Pergola (3 Michelin stars, book months ahead, €300+)', 'Trastevere osteria dinner — carbonara, amatriciana (~€25)', 'Aperitivo + dinner at Freni e Frizioni, Trastevere', 'Pizza Napoletana dinner at Seu Pizza Illuminati (~€15)'],
      },
      nature: {
        morning:   ['Villa Borghese gardens morning jog (free)', 'Pincio Hill overlook — best free view of Rome (free)', 'Janiculum Hill & Fontanone terrace view (free)', 'Orto Botanico di Roma botanical garden (~€8)'],
        afternoon: ['Villa Pamphilj park — largest park in Rome (free)', 'Tivoli & Hadrian\'s Villa day trip (~€8, 1 h by bus)', 'Cascate delle Marmore waterfall day trip (~€7, 2 h)', 'Appian Way cycling tour (~€15 bike rental)'],
        evening:   ['Gianicolo Hill sunset — panoramic city view (free)', 'Sunset at Pincio Terrace, Villa Borghese (free)', 'Parco degli Acquedotti — ancient aqueducts at dusk (free)', 'Testaccio riverbank evening walk (free)'],
      },
    },
  },

  barcelona: {
    name: 'Barcelona', country: 'Spain', currency: 'EUR', budgetFactor: 1.0,
    hero: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car; helicopter transfers to/from El Prat airport (~€350).',
      standard: 'T-Casual 10-trip card (~€12.15) valid on metro, bus, FGC, tram.',
      economy:  'Walk the Gothic Quarter & Eixample; T-Casual for outer trips.',
    },
    hotels: {
      luxury:   'Hotel Arts Barcelona (Port Olímpic, 44-floor tower)',
      standard: 'Hotel 1898 (La Rambla, 4-star)',
      economy:  'Generator Barcelona Hostel (Gràcia neighbourhood)',
    },
    tips: [
      'Book Sagrada Família + tower access at least 2 months in advance.',
      'La Barceloneta beach is best on weekday mornings — weekends get very crowded.',
      'Lunch is the main meal in Spain (14:00–16:00) — most places offer cheap menú del día (~€12).',
      'Pickpockets are very active on La Rambla — use a money belt.',
      'Park Güell ticketed area requires advance booking; outer park is free.',
    ],
    places: [
      'Barri Gòtic (Gothic Quarter)', 'Eixample (Gaudí grid)', 'El Born & La Ribera',
      'Gràcia neighbourhood', 'La Barceloneta beach', 'Montjuïc',
      'Poblenou (design district)', 'Sant Pere & Santa Caterina', 'La Rambla',
    ],
    activities: {
      history: {
        morning:   ['Barcelona Cathedral — Gothic cloister & geese (free before 12:30)', 'Barri Gòtic labyrinth walk — Roman walls & medieval lanes (free)', 'Museu d\'Història de Barcelona — underground Roman city (~€12)', 'Palau Reial Major & Plaça del Rei (free area)'],
        afternoon: ['Museu Nacional d\'Art de Catalunya (MNAC) (~€12)', 'Picasso Museum, El Born (~€14, book online)', 'Fundació Joan Miró, Montjuïc (~€14)', 'Camp Nou stadium tour (~€32)'],
        evening:   ['Montjuïc castle at sunset (~€5)', 'Font Màgica light & music show (Thu–Sun evenings, free)', 'El Born neighbourhood evening tapas crawl (free to explore)', 'Gothic Quarter night walk with guided ghost tour (~€15)'],
      },
      culture: {
        morning:   ['Sagrada Família — Gaudí\'s masterpiece (~€26–36, book online)', 'Casa Batlló or Casa Milà (La Pedrera) (~€25–29)', 'Mercat de Santa Caterina — colourful mosaic roof (free to enter)', 'Fundació Antoni Tàpies (~€7)'],
        afternoon: ['Park Güell ticketed area (~€10, book online)', 'Palau de la Música Catalana guided tour (~€18)', 'Poble Espanyol outdoor architecture museum (~€14)', 'Centre de Cultura Contemporània de Barcelona (~€6)'],
        evening:   ['Flamenco show at Tablao Flamenco Cordobés (~€45 incl. drink)', 'Barcelona Philharmonic at Palau de la Música', 'El Born bar scene — craft cocktails & natural wine', 'Gràcia neighbourhood terraces — local Barcelona nightlife'],
      },
      food: {
        morning:   ['Breakfast: pa amb tomàquet (bread with tomato) at a local bar (~€3)', 'La Boqueria market walk — fresh fruit, jamón (free to enter)', 'Croissant & coffee at Federal Café, Sant Antoni (~€6)', 'Churros con chocolate at Granja Viader (since 1870, ~€5)'],
        afternoon: ['Menú del día at a local restaurant — 3 courses + wine (~€12)', 'Pintxos crawl in El Born (~€2–4 per pintxo)', 'Seafood paella at La Mar Salada, Barceloneta (~€20)', 'Bocadillo de jamón ibérico from a colmado (~€5)'],
        evening:   ['Tapas dinner at Bar Brutal or Bodega Sepúlveda', 'Cal Pep — legendary no-reservation seafood bar counter', 'Disfrutar (3 Michelin stars, avant-garde, ~€300, book months ahead)', 'Late dinner & cocktails in Eixample Esquerra (22:00+)'],
      },
      nature: {
        morning:   ['Barceloneta beach sunrise swim (free)', 'Park Güell outer free zone morning stroll', 'Collserola Natural Park mountain hiking (free, 15 min from centre)', 'Ciutadella Park — palm lake & waterfall (free)'],
        afternoon: ['Montjuïc gardens & cable car (~€12.70 return)', 'Tibidabo funicular & amusement park (~€28)', 'El Masnou beach day trip — 20 min by Rodalies train', 'Jardins de Laribal terraced gardens, Montjuïc (free)'],
        evening:   ['Sunset at Bunkers del Carmel — best free panorama in Barcelona', 'Barceloneta waterfront sunset walk (free)', 'Parc de la Ciutadella dusk — rowboats on the lake (~€6)', 'Montjuïc Font Màgica free fountain show at 21:30'],
      },
    },
  },

  amsterdam: {
    name: 'Amsterdam', country: 'Netherlands', currency: 'EUR', budgetFactor: 1.1,
    hero: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private canal boat hire (~€150/h) + chauffeured car between districts.',
      standard: 'GVB 24/48/72 h pass (€9/€15/€21) — tram, metro, bus, night bus.',
      economy:  'OV-chipkaart + rental bike (€14/day at MacBike) — best way to see Amsterdam.',
    },
    hotels: {
      luxury:   'Pulitzer Amsterdam (17 canal houses, Prinsengracht)',
      standard: 'INK Hotel Amsterdam (Nieuwezijds Voorburgwal)',
      economy:  'Stayokay Amsterdam Vondelpark Hostel',
    },
    tips: [
      'Rent a bicycle — Amsterdam is totally flat and has 800 km of dedicated bike lanes.',
      'Book Anne Frank House at least 2 months ahead — it sells out entirely.',
      'Rijksmuseum is less crowded Wednesday and Thursday mornings.',
      'The I amsterdam card covers 70+ museums + public transport for 24–120 h.',
      'Coffee shops: consumption of cannabis is tolerated in licensed shops only.',
    ],
    places: [
      'Jordaan (canal & market quarter)', 'De Pijp (multicultural, lively)', 'Museum Quarter (Museumplein)',
      'Centrum (Old Town & Red Light District)', 'NDSM Werf (creative north)', 'Grachtengordel (canal ring)',
      'Oud-West', 'Westerpark & Westergasfabriek', 'Plantage neighbourhood',
    ],
    activities: {
      history: {
        morning:   ['Anne Frank House (Prinsengracht 263, ~€16 — book months ahead!)', 'Amsterdam Museum (closed for renovation, check status)', 'Jewish Historical Museum (~€17)', 'Dutch Resistance Museum (~€14)'],
        afternoon: ['Rijksmuseum — Rembrandt, Vermeer, Delft (~€22.50)', 'Royal Palace on Dam Square (~€12)', 'Amsterdam Dungeon medieval history show (~€22)', 'Westerkerk church & Anne Frank\'s view (free)'],
        evening:   ['Canal Ring (Grachtengordel) evening boat tour (~€18)', 'Begijnhof historic courtyard — open until 18:00 (free)', 'Scheepvaarthuis (Shipping House) art nouveau exterior (free)', 'Mint Tower & Bloemenmarkt float market at dusk (free)'],
      },
      culture: {
        morning:   ['Van Gogh Museum (~€22, book online)', 'Stedelijk Museum contemporary art (~€22.50)', 'Eye Filmmuseum, Amsterdam Noord (free building, films €11)', 'Foam Photography Museum, Keizersgracht (~€14)'],
        afternoon: ['Heineken Experience brewery tour (~€23)', 'Moco Museum — Banksy & Warhol (~€20)', 'EYE cinematheque & architecture (free to enter)', 'Tropenmuseum world culture museum (~€17)'],
        evening:   ['Concert at Concertgebouw (free Wednesday lunch concerts at 12:30)', 'Paradiso or Melkweg music venues in Leidseplein', 'Comedy at Boom Chicago theatre (~€25)', 'Jordaan bar scene — traditional brown cafés (bruin cafés)'],
      },
      food: {
        morning:   ['Breakfast at Café de Jaren — canal-view terrace (€12)', 'Stroopwafel from Albert Cuyp Market — fresh & warm (€2)', 'Dutch pancakes (pannenkoeken) at Pancakes Amsterdam (~€13)', 'Croissant & coffee at Scandinavian Embassy, De Pijp (~€7)'],
        afternoon: ['Lunch at De Hallen food hall, Oud-West — 20 stalls', 'Herring (haring) sandwich from a Hollandse Nieuwe cart (~€4)', 'Albert Cuyp Market lunch snacks — biggest street market in NL (free)', 'Indonesian rijsttafel (rice table feast) at Kantjil & de Tijger (~€25)'],
        evening:   ['Dinner at Rijsel, Watergraafsmeer — neighbourhood bistro (~€35)', 'Dutch bitterballen & Heineken at a traditional bruin café (~€15)', 'Dinner at Ron Gastrobar (~€55, Michelin Bib Gourmand)', 'Night market at NDSM Wharf (seasonal events)'],
      },
      nature: {
        morning:   ['Vondelpark sunrise cycling — 47 ha, free & lively', 'Keukenhof tulip gardens (~€22, Mar–May 40 min from city)', 'Amsterdamse Bos (city forest) cycling (free, 20 min by tram)', 'Hortus Botanicus botanical garden (~€12.50)'],
        afternoon: ['Canal ring cycling tour — 4 concentric canal rings (free)', 'Zaanse Schans windmill village day trip (~€6, 20 min by train)', 'Marken & Volendam fishing villages tour (free to walk)', 'Westerpark & Westergasfabriek cultural park (free)'],
        evening:   ['Sunset at A\'DAM Lookout rooftop swing (~€17.50)', 'Canal houseboats area evening walk, Prinsengracht (free)', 'Keizergracht reflection — best canal photo at dusk (free)', 'NDSM Werf harbour evening — street art & food trucks (free)'],
      },
    },
  },

  newyork: {
    name: 'New York', country: 'USA', currency: 'USD', budgetFactor: 1.5,
    hero: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car service (Blade, Blacklane); helicopter to/from JFK (~$250).',
      standard: 'OMNY contactless MetroCard — subway + bus, unlimited 7-day pass ($34).',
      economy:  'OMNY pay-as-you-go ($2.90/ride); CitiBike (€21/day) for short hops.',
    },
    hotels: {
      luxury:   'The Plaza Hotel (Fifth Ave & Central Park South)',
      standard: 'Arlo NoMad (East 30s, great rooftop bar)',
      economy:  'HI NYC Hostel (Upper West Side, near Central Park)',
    },
    tips: [
      'Buy a 7-day MetroCard ($34) — unlimited subway rides is the best NYC value.',
      'Most world-class museums (MoMA, The Met) suggest a donation (any amount accepted).',
      'Pizza slices: fold it lengthwise, tip forward — it\'s the New York method.',
      'Duane Reade / Walgreens / CVS pharmacies are on every corner — essentials cheap.',
      'NYC bagels with cream cheese from a deli ($3) beat almost any breakfast elsewhere.',
    ],
    places: [
      'Midtown Manhattan (Times Square, Empire State)', 'Lower Manhattan (Wall St, 9/11 Memorial)',
      'Brooklyn (Dumbo, Williamsburg)', 'Upper West Side (Central Park West)', 'Harlem',
      'Greenwich Village & SoHo', 'Chelsea & High Line', 'The Bronx (Yankee Stadium)', 'Queens (Flushing)',
    ],
    activities: {
      history: {
        morning:   ['9/11 Memorial & Museum (~$30, book online)', 'Statue of Liberty & Ellis Island ferry (~$24, book ahead)', 'Tenement Museum, Lower East Side (~$30)', 'New York Historical Society museum (~$22)'],
        afternoon: ['Brooklyn Bridge walk — Manhattan side to DUMBO (~1.5 h, free)', 'Federal Hall National Memorial (free)', 'Intrepid Sea, Air & Space Museum (~$36)', 'American Museum of Natural History (~$28)'],
        evening:   ['Top of the Rock, Rockefeller Center at sunset (~$40)', 'Brooklyn Bridge illuminated at night — DUMBO view (free)', 'Grand Central Terminal evening architecture walk (free)', 'One World Observatory, 1 WTC sunset views (~$46)'],
      },
      culture: {
        morning:   ['The Metropolitan Museum of Art (suggested donation: any amount)', 'MoMA — Picasso, Warhol, Pollock (~$30)', 'Guggenheim Museum spiral architecture (~$30)', 'Whitney Museum of American Art, Meatpacking (~$28)'],
        afternoon: ['High Line elevated park walk, Chelsea (free)', 'Brooklyn Museum + beautiful Beaux-Arts building (~$16)', 'New York Public Library main branch — free, stunning (free)', 'Chelsea art gallery district (Fri night openings: free)'],
        evening:   ['Broadway show — Hamilton, Chicago, Moulin Rouge (~$80–300)', 'Comedy at Upright Citizens Brigade or Comedy Cellar (~$20)', 'Jazz at the Village Vanguard, Greenwich Village (~$40)', 'Apollo Theater Harlem show (~$25+)'],
      },
      food: {
        morning:   ['NYC bagel + lox cream cheese at Ess-a-Bagel, Midtown (~$8)', 'Brunch at Balthazar, SoHo (~$30, book 2 weeks ahead)', 'Egg sandwich at a deli cart (the real NYC breakfast, $4)', 'Levain Bakery walnut chocolate chip cookie (the size of a softball, $5)'],
        afternoon: ['Pizza slice at Joe\'s Pizza, Greenwich Village (~$4)', 'Lunch at Katz\'s Delicatessen — pastrami on rye (~$28)', 'Halal cart chicken & rice over 6th Ave (~$7)', 'Shake Shack burger at Madison Square Park (the original, ~$12)'],
        evening:   ['Dinner at Per Se, Columbus Circle (4 Michelin stars, ~$360)', 'Peter Luger Steak House, Brooklyn (cash only, ~$80)', 'Dinner at Xi\'an Famous Foods — hand-ripped noodles (~$15)', 'Rooftop cocktails at The 230 Fifth, Midtown (~$20/drink)'],
      },
      nature: {
        morning:   ['Central Park sunrise walk or jog — Bethesda Fountain (free)', 'The High Line 2.33-km elevated rail park (free)', 'Prospect Park, Brooklyn — designed by Olmsted & Vaux (free)', 'Brooklyn Botanic Garden (~$20, free Fri mornings)'],
        afternoon: ['Staten Island Ferry — Statue of Liberty views, free round trip (FREE)', 'Governors Island — car-free island, bikes & arts (ferry $4 Apr–Oct)', 'The Ramble birdwatching in Central Park (free)', 'Hudson River Greenway cycling — 11 miles along the river (free)'],
        evening:   ['Sunset from the High Line looking west over the Hudson (free)', 'Pier 17 rooftop, South Street Seaport — Hudson views (free + events)', 'Brooklyn Bridge Park at dusk — Manhattan skyline (free)', 'Roosevelt Island Tramway sunset ride ($2.90 each way)'],
      },
    },
  },

  tashkent: {
    name: 'Tashkent', country: 'Uzbekistan', currency: 'UZS', budgetFactor: 0.35,
    hero: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car with driver (~$30/day); domestic flights to Samarkand (~$40).',
      standard: 'Tashkent Metro (clean, fast, beautiful stations) + Yandex Taxi (~$2–5).',
      economy:  'Metro ticket ~5 000 UZS (₽0.40); shared minibus (marshrutka) ~2 000 UZS.',
    },
    hotels: {
      luxury:   'Hyatt Regency Tashkent (Buyuk Ipak Yuli)',
      standard: 'Wyndham Tashkent (Amir Timur Ave)',
      economy:  'Art Hostel Tashkent (Old City area)',
    },
    tips: [
      'Exchange USD/EUR to Uzbek Som at official exchange booths — much better than hotels.',
      'Tashkent metro stations are beautiful architectural monuments — worth exploring.',
      'National dishes: plov (rice & lamb), lagman noodles, samsa pastries — all excellent.',
      'Bargain at Chorsu Bazaar — start at 50 % of asking price.',
      'Ramadan affects restaurant hours (Apr–May) — check opening times.',
    ],
    places: [
      'Eski Shahar (Old City)', 'Chorsu Bazaar area', 'Amir Timur Square',
      'Broadway Street (Sayilgoh)', 'Yunusabad', 'Minor Mosque area',
      'Tashkent City (modern district)', 'Chilanzar', 'Mirabad',
    ],
    activities: {
      history: {
        morning:   ['Khast Imam (Hazrati Imam) complex — Uthman Quran manuscript (free)', 'Barak Khan Madrasa & Tilla Sheikh Mosque (free)', 'State Museum of History of Uzbekistan (~15 000 UZS)', 'Dzhuma Mosque in Old City (~5 000 UZS)'],
        afternoon: ['Alisher Navoi National Library & Amir Timur Museum (~20 000 UZS)', 'Museum of Applied Arts — traditional Uzbek crafts (~10 000 UZS)', 'State Fine Arts Museum (~20 000 UZS)', 'Independence Square (Mustakillik Maydoni) — free, open air'],
        evening:   ['Amir Timur Square fountain show at night (free)', 'Old City evening walk — lantern-lit lanes (free)', 'Tashkent TV Tower observation deck (~50 000 UZS)', 'Broadway Street (Sayilgoh) evening stroll — artists & food (free)'],
      },
      culture: {
        morning:   ['Chorsu Bazaar — the largest covered bazaar in Central Asia (free entry)', 'Kukeldash Madrasa 16th-century exterior (free)', 'Crafts bazaar — silk, ceramics, suzani embroidery', 'National Museum of Uzbekistan (~20 000 UZS)'],
        afternoon: ['Alisher Navoi Opera and Ballet Theatre tour or show', 'Minor Mosque (new white marble mosque, free)', 'Kartaboshi Bazaar — local food & spices market (free)', 'State Museum of Temurids History (~15 000 UZS)'],
        evening:   ['Navoi Opera — ballet or opera performance (~100 000–300 000 UZS)', 'Traditional Uzbek music concert at a teahouse (chaikhana)', 'Broadway Street craft & art fair (free)', 'Tashkent Land entertainment complex'],
      },
      food: {
        morning:   ['Plov (palov) breakfast at Besh Qozon plov centre (opens 07:00, ~30 000 UZS)', 'Somsa (baked pastry) from a local tandyr oven (~5 000 UZS)', 'Shurpa lamb soup at Chorsu Bazaar food court (~15 000 UZS)', 'Uzbek non flatbread & tea at a chaikhana (teahouse, ~10 000 UZS)'],
        afternoon: ['Lagman noodles at a local oshxona (~20 000 UZS)', 'Shashlik (skewered lamb) at Caravan restaurant (~40 000 UZS)', 'Dimlama (lamb & vegetable stew) at Besh Qozon', 'Central Asian manti (dumplings) at Milliy Taomlar (~25 000 UZS)'],
        evening:   ['Dinner at Caravan Restaurant — full Uzbek set menu (~150 000 UZS)', 'Rooftop dinner at Registan Restaurant, Tashkent City', 'Traditional chaikhana dinner under mulberry trees', 'Plov + salads dinner party at a local family-run place (~50 000 UZS)'],
      },
      nature: {
        morning:   ['Tashkent Botanical Garden — 65 ha, 4 500 plant species (~15 000 UZS)', 'Amir Timur Park morning walk (free)', 'Anhor Canal riverside walk, Mirabad (free)', 'Chimgan Mountains day trip (1.5 h, great hiking)'],
        afternoon: ['Charvak Reservoir & reservoir beach (1.5 h from city, ~$10 transport)', 'Yangiabad nature reserve hike', 'Independence Square & fountains (free)', 'Akhangaran River canyon day trip'],
        evening:   ['Tashkent TV Tower lit up at night (~50 000 UZS for observation)', 'Anhor Canal evening walk (free)', 'Tashkent City park & fountain show (free)', 'Sunset at Kukeldash Madrasa terrace (free)'],
      },
    },
  },

  samarkand: {
    name: 'Samarkand', country: 'Uzbekistan', currency: 'UZS', budgetFactor: 0.3,
    hero: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car from Tashkent (4 h) or Afrosiyob high-speed train (2 h, ~$15).',
      standard: 'Afrosiyob bullet train from Tashkent (~$12–20) + local taxis (~$2–5).',
      economy:  'Regular train from Tashkent (~$8) + shared taxis & buses (~$0.50–1).',
    },
    hotels: {
      luxury:   'Registan Plaza Hotel (panoramic Registan views)',
      standard: 'Malika Samarkand Hotel (near Registan)',
      economy:  'Bibi Khanum Guesthouse (Old City)',
    },
    tips: [
      'Buy a Samarkand combo ticket (~$15) for Registan, Gur-e-Amir and Shah-i-Zinda.',
      'Registan is most beautiful at sunrise (07:00) and during the Sound & Light Show at night.',
      'Local drivers will offer day tours for ~$30–40 — good value for outlying sites.',
      'Paper from Samarkand (handmade mulberry paper) is the best souvenir.',
      'The city is compact — most major sights are within 2 km on foot.',
    ],
    places: [
      'Registan Square', 'Shah-i-Zinda necropolis', 'Afrasiab (ancient Samarkand)',
      'Bibi-Khanym Mosque area', 'Siab Bazaar', 'Ulugh Beg Observatory hill',
      'Gur-e-Amir mausoleum', 'Old City (Mahalla)', 'Konigil Paper Mill village',
    ],
    activities: {
      history: {
        morning:   ['Registan Square at sunrise — three 15th–17th c. madrasas (opens 08:00)', 'Shah-i-Zinda necropolis — 11th–15th c. tombs, cobalt tiles (~25 000 UZS)', 'Afrasiab Museum & ancient city ruins (~20 000 UZS)', 'Gur-e-Amir — Tamerlane\'s mausoleum (~25 000 UZS)'],
        afternoon: ['Bibi-Khanym Mosque — once the largest mosque in the Islamic world (~20 000 UZS)', 'Ulugh Beg Observatory — 15th-century astronomical site (~15 000 UZS)', 'Siab Bazaar — local fruit, spices, non bread (free to browse)', 'Hazrat Khizr Mosque — hilltop views over the city (free)'],
        evening:   ['Registan Sound & Light Show — nightly at 21:00 (~50 000 UZS)', 'Gur-e-Amir mausoleum illuminated at night (exterior free)', 'Old City evening walk — lantern-lit lanes (free)', 'Siab Bazaar at closing hour — atmospheric (free)'],
      },
      culture: {
        morning:   ['Konigil Meros Paper Mill — handmade mulberry paper demo (~20 000 UZS)', 'Samarkand silk carpet workshop visit (~15 000 UZS)', 'Samarkand Regional Museum of History and Culture (~15 000 UZS)', 'Chupan-Ata hill — panoramic city view (free)'],
        afternoon: ['Blue Ceramics Workshop, Gijduvan school style (~20 000 UZS)', 'Samarkand wine tasting — Central Asia\'s oldest winery (Khovrenko Winery, ~$10)', 'Ikat silk weaving workshop visit', 'Tashkentskaya Bazaar craft shopping'],
        evening:   ['Traditional Uzbek dinner with live music at Platan Restaurant', 'Folklore show at Registan — Lazgi dance', 'Samarkand Bread Museum evening visit (~10 000 UZS)', 'Registan square selfies with tiled madrasas at blue hour (free)'],
      },
      food: {
        morning:   ['Samarkand plov (palov) at Platan Restaurant (opens 07:00, ~30 000 UZS)', 'Samsa from Siab Bazaar tandyr oven (~5 000 UZS each)', 'Non flatbread & goat cheese breakfast at a local chaikhana (~15 000 UZS)', 'Katyk (yogurt) & dried fruit from bazaar (~10 000 UZS)'],
        afternoon: ['Shashlik kebab near Registan (~25 000 UZS)', 'Mastava rice soup at Bibi-Khanym Bazaar eatery (~15 000 UZS)', 'Samsa + green tea at Siab tea house (~15 000 UZS)', 'Fried fish (baliq) at a local chaikhana (~20 000 UZS)'],
        evening:   ['Dinner at Samarkand Restaurant — traditional live music & dancing', 'Registan Cafe terrace — view of the illuminated square', 'Home-style Uzbek dinner at a family guesthouse (~50 000 UZS)', 'Samarkand wine + meze dinner at Khovrenko Winery'],
      },
      nature: {
        morning:   ['Chupan-Ata hill sunrise walk — panoramic Samarkand view (free)', 'Navoi Park morning stroll (free)', 'Zerafshan River valley cycling or walk', 'Afrasiab ruins hill — ancient city mound views (free)'],
        afternoon: ['Urgut mountain village day trip — market & nature (1 h drive)', 'Zarafshan reservoir area picnic', 'Bagishmal Park — mulberry orchard walk (free)', 'Hazrat Khizr hill garden (~10 000 UZS)'],
        evening:   ['Sunset from Chupan-Ata hill — full Registan skyline view (free)', 'Evening walk along Tashkentskaya street (free)', 'Registan blue hour photography (free)', 'Navruz Park fountain evening (free)'],
      },
    },
  },

  prague: {
    name: 'Prague', country: 'Czech Republic', currency: 'CZK', budgetFactor: 0.75,
    hero: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car service; Prague Castle private evening tour.',
      standard: '24/72 h transit pass (110/310 CZK) — metro, tram, bus all included.',
      economy:  'Walk Old Town + Malá Strana; buy 30-min tram tickets (30 CZK) as needed.',
    },
    hotels: {
      luxury:   'Four Seasons Hotel Prague (Veleslavínova, riverfront)',
      standard: 'Hotel Josef (Rybná, near Old Town Square)',
      economy:  'Czech Inn Hostel (Vinohrady neighbourhood)',
    },
    tips: [
      'Prague Castle: buy combined ticket (620 CZK) online — separate queues for ticket holders.',
      'The Old Town Astronomical Clock shows every hour on the hour — watch at 12:00.',
      'Czech beer (pivo) is cheaper than water — Pilsner Urquell fresh from the tap ~70 CZK.',
      'Avoid tourist restaurants on Old Town Square — walk 2 streets for half the price.',
      'Tram 22 is the best cheap sightseeing route — goes past castle & through Malá Strana.',
    ],
    places: [
      'Staré Město (Old Town)', 'Malá Strana (Lesser Town)', 'Hradčany (Castle District)',
      'Josefov (Jewish Quarter)', 'Vinohrady', 'Žižkov (bohemian, hilly)',
      'Holešovice (art & design)', 'Nové Město (New Town)', 'Wenceslas Square area',
    ],
    activities: {
      history: {
        morning:   ['Prague Castle complex (~620 CZK combined ticket, opens 09:00)', 'St. Vitus Cathedral inside the castle (free with ticket)', 'Old Jewish Cemetery, Josefov — one of the oldest in Europe (~420 CZK)', 'Old Town Hall & Astronomical Clock tower (~250 CZK)'],
        afternoon: ['Charles Bridge & its 30 Baroque statues (free, best 14:00–15:00)', 'Vyšehrad fortress — founding myths & city views (free)', 'Prague City Museum (Na Příkopě, ~120 CZK)', 'Kafka Museum, Malá Strana (~280 CZK)'],
        evening:   ['Charles Bridge at sunset — golden hour (free)', 'Vyšehrad evening walk — city panorama (free)', 'Old Town Square Astronomical Clock at 21:00 (free)', 'Prague Castle southern gardens at dusk (~free)'],
      },
      culture: {
        morning:   ['National Gallery at Veletržní Palác — modern & contemporary art (~350 CZK)', 'DOX Centre for Contemporary Art, Holešovice (~220 CZK)', 'Mucha Museum — Art Nouveau master (~360 CZK)', 'Kampa Museum — Central European modern art (~350 CZK)'],
        afternoon: ['Josefov Jewish Quarter synagogues (~420 CZK combined)', 'Municipal House (Obecní dům) — Art Nouveau interior (free to enter lobby)', 'Náplavka riverbank market (Sat & Sun, free)', 'Letná Park & Metronome — panoramic Vltava view (free)'],
        evening:   ['Prague National Theatre — opera or ballet (~350–1 200 CZK)', 'Black Light Theatre performance (~500 CZK)', 'Jazz at Jazz Dock, Smíchov (~200 CZK entrance)', 'Žižkov TV Tower bar at 66 m (~200 CZK)'],
      },
      food: {
        morning:   ['Breakfast at Café Louvre (Národní třída, since 1902, ~200 CZK)', 'Trdelník (spiral pastry) from Old Town Square cart (~80 CZK)', 'Czech open-faced sandwich (chlebíček) from a deli (~50 CZK)', 'Coffee & croissant at EMA espresso bar (~120 CZK)'],
        afternoon: ['Svíčková (beef sirloin in cream sauce) at Lokál (~300 CZK)', 'Goulash + knedlíky dumplings at Hospůdka na Hradě (~250 CZK)', 'Nakládaný hermelín (marinated cheese) at a pivnice with beer', 'Lunch at Manifesto Market street food containers, Žižkov (~200 CZK)'],
        evening:   ['Dinner at Field (1 Michelin star, ~2 000 CZK, book ahead)', 'Traditional Czech dinner at Čestr, Vinohrady (~500 CZK)', 'Beer & sausage evening at Lokál pivnice (~400 CZK)', 'Prague ham (pečené koleno — roast pork knee) at Kolkovna (~350 CZK)'],
      },
      nature: {
        morning:   ['Petřín Hill morning walk & funicular (~60 CZK up)', 'Divoká Šárka nature reserve hike (NW Prague, free)', 'Stromovka park morning jog (free)', 'Vítkov hill & equestrian monument (free)'],
        afternoon: ['Průhonice Park & UNESCO château (~200 CZK, 20 min SE)', 'Botanical Garden Prague (~100 CZK)', 'Vltava River kayak rental (~300 CZK/h)', 'Císařský ostrov bird sanctuary island (free, tram 17)'],
        evening:   ['Sunset from Letná Park beer garden — Vltava panorama (free)', 'Vltava riverbank Náplavka evening walk (free)', 'Vyšehrad park & Church of SS Peter & Paul at dusk (free)', 'Petřín Observation Tower sunset (~200 CZK)'],
      },
    },
  },

  singapore: {
    name: 'Singapore', country: 'Singapore', currency: 'SGD', budgetFactor: 1.25,
    hero: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car; rooftop Skypark cocktails at Marina Bay Sands.',
      standard: 'EZ-Link card — MRT + bus, about SGD 1.50–2.50 per trip.',
      economy:  'Tourist Day Ticket SGD 22 for unlimited MRT + bus for 3 days.',
    },
    hotels: {
      luxury:   'Marina Bay Sands (infinity pool + SkyPark, from SGD 600)',
      standard: 'Hotel Mono (Chinatown, boutique 4-star)',
      economy:  'The Pod @ Beach Road capsule hotel (City Hall area)',
    },
    tips: [
      'Gardens by the Bay Supertree light show is FREE every night at 19:45 & 20:45.',
      'Hawker centre meals from SGD 3–5 — same quality as many restaurants.',
      'MRT is the fastest & cheapest way around; Grab (ride-hail) is also affordable.',
      'Chewing gum is illegal to sell but not to chew personally.',
      'Singapore tap water is perfectly safe and drinkable.',
    ],
    places: [
      'Marina Bay & Bayfront', 'Chinatown (Tanjong Pagar)', 'Little India (Tekka)',
      'Kampong Glam (Arab Street)', 'Orchard Road (shopping)', 'Sentosa Island',
      'Clarke Quay & Boat Quay', 'Tiong Bahru (hipster neighbourhood)', 'East Coast Park',
    ],
    activities: {
      history: {
        morning:   ['National Museum of Singapore (~SGD 15)', 'Asian Civilisations Museum, Empress Place (~SGD 20)', 'Fort Canning Park — 14th-century Malay Fort (free)', 'Singapore City Gallery urban planning museum (free)'],
        afternoon: ['Raffles Hotel Grand Lobby tour & museum (free)', 'The Arts House at The Old Parliament (free)', 'Battlebox underground WWII bunker, Fort Canning (~SGD 18)', 'Chinatown Heritage Centre (~SGD 18)'],
        evening:   ['Boat Quay evening drinks by the Singapore River (free to walk)', 'Kampong Glam — Sultan Mosque illuminated at night (free)', 'Marina Bay Sands light show reflection (free)', 'Clarke Quay riverfront bar walk'],
      },
      culture: {
        morning:   ['Gardens by the Bay — Cloud Forest & Flower Dome (~SGD 53 combined)', 'National Gallery Singapore — Southeast Asian art (~SGD 20)', 'Sri Veeramakaliamman Temple, Little India (free)', 'Peranakan Museum, Armenian Street (~SGD 15)'],
        afternoon: ['Universal Studios Singapore, Sentosa (~SGD 82)', 'Sentosa — beaches, cable car, Fort Siloso', 'Haw Par Villa mythology park (free)', 'Orchard Road luxury shopping mall-hop (free)'],
        evening:   ['Marina Bay Sands Skypark observation at sunset (~SGD 26)', 'Gardens by the Bay Supertree Grove light show at 19:45 (FREE)', 'Clarke Quay nightlife — Zouk, Attica', 'Night Safari (Mandai Wildlife Reserve) (~SGD 55)'],
      },
      food: {
        morning:   ['Kaya toast + soft-boiled eggs + kopi at Ya Kun Kaya Toast (~SGD 7)', 'Roti prata at Casuarina Curry, Thomson (~SGD 5)', 'Dim sum breakfast at Tim Ho Wan, Plaza Singapura (~SGD 15)', 'Chicken rice from Tian Tian Hainanese Chicken Rice, Maxwell (~SGD 6)'],
        afternoon: ['Hawker lunch at Maxwell Food Centre — Tian Tian chicken rice (~SGD 5)', 'Laksa at 328 Katong Laksa, East Coast (~SGD 8)', 'Crab bee hoon at Beach Road Scissors Cut Curry Rice (~SGD 8)', 'Chili crab lunch at Jumbo Seafood (~SGD 50–80)'],
        evening:   ['Dinner at Odette (3 Michelin stars, ~SGD 350 omakase, book far ahead)', 'Satay & Tiger beer at Newton Food Centre (~SGD 20)', 'Peranakan dinner at Candlenut (~SGD 80)', 'Chili crab dinner at Long Beach Seafood (~SGD 80)'],
      },
      nature: {
        morning:   ['MacRitchie Reservoir park & TreeTop Walk (~SGD 12)', 'East Coast Park beach cycling (bike rental SGD 10)', 'Botanic Gardens UNESCO World Heritage site (free)', 'Southern Ridges 9-km forest trail (free)'],
        afternoon: ['Sentosa Siloso Beach & cable car (~SGD 35 return)', 'Pulau Ubin island by bumboat (~SGD 4) — off-grid nature', 'Sungei Buloh Wetland Reserve (free except weekends ~SGD 1)', 'Singapore Zoo afternoon visit (~SGD 50)'],
        evening:   ['Sunset at Marina Barrage rooftop lawn (free)', 'Night Safari Mandai (~SGD 55)', 'East Coast Park sea breeze evening walk (free)', 'Supertree Grove light show at 20:45 (FREE)'],
      },
    },
  },

  // ── AFRICA & MIDDLE EAST ────────────────────────────────────────────────────
  cairo: {
    name: 'Cairo', country: 'Egypt', currency: 'EGP', budgetFactor: 0.55,
    hero: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private air-conditioned car with English-speaking driver (~EGP 1500/day).',
      standard: 'Uber & Careem ride-hail + Cairo Metro (EGP 5–10/trip).',
      economy:  'Cairo Metro EGP 5–10 + microbuses; very cheap but crowded.',
    },
    hotels: {
      luxury:   'Four Seasons Hotel Cairo at Nile Plaza (Garden City)',
      standard: 'Steigenberger Hotel El Tahrir (Downtown)',
      economy:  'Cairo Downtown Hostel (Tahrir Square area)',
    },
    tips: [
      'Buy pyramids tickets at the gate or online — no need for tours.',
      'Carry small EGP bills — tipping (baksheesh) is expected everywhere.',
      'Friday is the quietest day at Egyptian Museum; avoid Tuesday when it is busiest.',
      'Drink bottled water only; tap water is not safe for tourists.',
      'Use Uber or Careem for fair taxi pricing — street cabs often overcharge.',
    ],
    places: ['Giza Plateau', 'Downtown Cairo (Tahrir)', 'Islamic Cairo / Khan el-Khalili', 'Coptic Cairo', 'Zamalek', 'Al-Azhar Park'],
  },

  marrakech: {
    name: 'Marrakech', country: 'Morocco', currency: 'MAD', budgetFactor: 0.7,
    hero: 'https://images.unsplash.com/photo-1597212720291-e8d5c5e9cc1b?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur + riad concierge for spa & desert excursions.',
      standard: 'Taxis (negotiate fare before boarding) + walking inside Medina.',
      economy:  'Walk everywhere in Medina; petit taxis ~20–40 MAD per ride.',
    },
    hotels: {
      luxury:   'La Mamounia (iconic palace hotel, Medina)',
      standard: 'Riad Kheirredine (traditional riad near Bahia Palace)',
      economy:  'Equity Point Hostel Marrakech (Medina)',
    },
    tips: [
      'Bargain hard in souks — start at 30% of asking price.',
      'Carry cash (MAD); cards accepted only at upscale riads & malls.',
      'Women should dress modestly; shoulders and knees covered in Medina.',
      'Sunday is busiest at Jardin Majorelle — book tickets online in advance.',
      'Halal food is the default — no special requests needed.',
    ],
    places: ['Jemaa el-Fnaa', 'Medina Souks', 'Gueliz (New City)', 'Palmeraie', 'Kasbah quarter'],
  },

  doha: {
    name: 'Doha', country: 'Qatar', currency: 'QAR', budgetFactor: 1.2,
    hero: 'https://images.unsplash.com/photo-1562258482-1c31e7b78a4f?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur; Doha Metro Gold-class cars available.',
      standard: 'Doha Metro (QR 2/ride) + Karwa taxis & Uber.',
      economy:  'Doha Metro + buses; cheap and air-conditioned.',
    },
    hotels: {
      luxury:   'Mandarin Oriental Doha (Msheireb)',
      standard: 'Souq Waqif Boutique Hotels (heart of the souq)',
      economy:  'La Villa Hotel (Bin Mahmoud)',
    },
    tips: [
      'Friday mornings = everything closed until ~13:30 (prayer + brunch).',
      'Museum of Islamic Art is FREE and world-class — don\'t skip it.',
      'Desert safari to Inland Sea is best booked a day ahead.',
      'Alcohol only served in licensed hotel bars; dress modestly in public.',
      'Summer (Jun–Sep) is extremely hot — plan outdoor activity for evenings.',
    ],
    places: ['Souq Waqif', 'The Pearl-Qatar', 'Katara Cultural Village', 'Msheireb Downtown', 'Corniche'],
  },

  // ── ASIA ─────────────────────────────────────────────────────────────────────
  bangkok: {
    name: 'Bangkok', country: 'Thailand', currency: 'THB', budgetFactor: 0.55,
    hero: 'https://images.unsplash.com/photo-1563492065-1a3d9ab4b1b4?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur + longtail boat charters on the Chao Phraya.',
      standard: 'BTS Skytrain + MRT Metro Rabbit Card; Grab ride-hail when needed.',
      economy:  'BTS/MRT (฿17–60) + tuk-tuks (negotiate); ferries on the river (฿15).',
    },
    hotels: {
      luxury:   'Mandarin Oriental Bangkok (Chao Phraya riverside, legendary)',
      standard: 'Shangri-La Bangkok or Pullman Bangkok King Power',
      economy:  'Lub d Bangkok Silom (stylish hostel/hotel mix)',
    },
    tips: [
      'Grand Palace dress code is strict — no shorts, no sleeveless tops.',
      'Weekend Chatuchak Market is Saturday & Sunday only.',
      'Use Grab app instead of street tuk-tuks for fair pricing.',
      'Muslim-friendly restaurants are marked with "Halal" signs — plenty around Ratchathewi.',
      'Ignore touts saying Grand Palace is closed — it\'s a scam.',
    ],
    places: ['Rattanakosin (Old Town)', 'Sukhumvit', 'Silom', 'Chinatown (Yaowarat)', 'Siam & Ratchaprasong', 'Thonburi (across the river)'],
  },

  kualalumpur: {
    name: 'Kuala Lumpur', country: 'Malaysia', currency: 'MYR', budgetFactor: 0.65,
    hero: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private car + KLIA Ekspres first class (~RM 55 one-way).',
      standard: 'Touch \'n Go card — LRT, MRT, Monorail + Rapid KL buses.',
      economy:  'MyRapid bus (RM 1–3) + walking via covered pedestrian bridges.',
    },
    hotels: {
      luxury:   'Mandarin Oriental KL (KLCC, pool overlooks Petronas Towers)',
      standard: 'Traders Hotel KL (Sky Bar has best Petronas view)',
      economy:  'Paper Plane Hostel (Bukit Bintang)',
    },
    tips: [
      'Petronas Towers Skybridge tickets release at 08:30 — get there early or book online.',
      'Halal food is the default — Malaysia is majority Muslim.',
      'KL is much cheaper than Singapore — excellent value for money.',
      'Grab is cheap (~RM 10–15 across the centre) and widely used.',
      'Jalan Alor is the best late-night food street — open till 02:00.',
    ],
    places: ['KLCC & Bukit Bintang', 'Chinatown (Petaling Street)', 'Little India (Brickfields)', 'Bangsar', 'Batu Caves (north)'],
  },

  seoul: {
    name: 'Seoul', country: 'South Korea', currency: 'KRW', budgetFactor: 1.1,
    hero: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur; AREX First Class (~₩17 000) from Incheon.',
      standard: 'T-money card — Seoul Metro + buses; trips ~₩1 400–1 700.',
      economy:  'Seoul Metro (superb coverage) + intra-city buses; very cheap.',
    },
    hotels: {
      luxury:   'Signiel Seoul (Lotte World Tower, 123rd floor)',
      standard: 'L7 Myeongdong by Lotte (central shopping district)',
      economy:  'Ewha Guest House Hongdae',
    },
    tips: [
      'Halal food concentrated in Itaewon (near Seoul Central Mosque).',
      'Get a T-money card at any 7-Eleven for seamless transit.',
      'Most palaces close on Tuesdays — plan accordingly.',
      'Cherry blossoms peak early April; autumn foliage late October.',
      'Korean BBQ restaurants often have halal versions in Itaewon.',
    ],
    places: ['Myeongdong', 'Jongno-gu (palaces)', 'Itaewon (halal hub)', 'Hongdae', 'Gangnam', 'Bukchon Hanok Village'],
  },

  // ── CAUCASUS & CENTRAL ASIA ────────────────────────────────────────────────
  tbilisi: {
    name: 'Tbilisi', country: 'Georgia', currency: 'GEL', budgetFactor: 0.5,
    hero: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private driver for Kakheti wine country & Kazbegi day trips.',
      standard: 'Bolt ride-hail (extremely cheap, ~₾5–10 across the city) + metro.',
      economy:  'Tbilisi Metro (₾1) + marshrutka minibuses (₾1).',
    },
    hotels: {
      luxury:   'Stamba Hotel (former printing house, design hotel)',
      standard: 'Rooms Hotel Tbilisi (boutique, Vera district)',
      economy:  'Fabrika Tbilisi (hostel in converted Soviet factory)',
    },
    tips: [
      'Georgian wine is legendary — try qvevri-made in a wine bar or cellar.',
      'Bolt is dirt-cheap — use it for everything instead of walking long distances.',
      'Khachapuri Acharuli (cheese boat) is a must-try — Machakhela chain is reliable.',
      'Kazbegi day trip is doable but long (10+ hrs) — consider an overnight instead.',
      'Cash (GEL) preferred at bazaars; cards work at cafés & restaurants.',
    ],
    places: ['Old Tbilisi (Dzveli)', 'Sololaki', 'Vera', 'Vake', 'Rustaveli Avenue', 'Fabrika district'],
  },

  baku: {
    name: 'Baku', country: 'Azerbaijan', currency: 'AZN', budgetFactor: 0.75,
    hero: 'https://images.unsplash.com/photo-1599499678707-16b9d6e3ba9e?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private chauffeur for Gobustan + Absheron Peninsula trips.',
      standard: 'Bolt / Uber + Baku Metro (AZN 0.40 per ride with BakiKart).',
      economy:  'Baku Metro & buses; very cheap & reliable.',
    },
    hotels: {
      luxury:   'Four Seasons Hotel Baku (Neftçilər Avenue)',
      standard: 'Sapphire City Hotel (near Fountain Square)',
      economy:  'Sahil Hostel & Hotel (Old City)',
    },
    tips: [
      'Walk the Old City (Icherisheher) — it\'s UNESCO World Heritage & compact.',
      'Heydar Aliyev Center by Zaha Hadid is a must-see for architecture fans.',
      'Combine Gobustan petroglyphs + mud volcanoes in one day trip.',
      'Cash preferred at bazaars & mud-volcano 4x4 rides.',
      'Halal food is default — Azerbaijan is majority Muslim.',
    ],
    places: ['Icherisheher (Old City)', 'Fountain Square', 'Baku Boulevard', 'Yasamal', 'Flame Towers area'],
  },

  almaty: {
    name: 'Almaty', country: 'Kazakhstan', currency: 'KZT', budgetFactor: 0.6,
    hero: 'https://images.unsplash.com/photo-1627894487585-a8a34a2e6b5b?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private driver for Charyn Canyon & Big Almaty Lake excursions.',
      standard: 'Yandex Go / InDriver ride-hail + Almaty Metro (₸80/ride).',
      economy:  'Buses & trolleybuses (₸150 with Onay card) + metro.',
    },
    hotels: {
      luxury:   'The Ritz-Carlton Almaty (Esentai Tower)',
      standard: 'Rixos Almaty (Seifullin Avenue)',
      economy:  'Zhaksha Hostel (Panfilov area)',
    },
    tips: [
      'Medeu & Shymbulak are accessible by bus + cable car — half-day trip.',
      'Big Almaty Lake requires a permit ~₸650 (border zone) — bring passport.',
      'Yandex Go is much cheaper than street taxis.',
      'Green Bazaar is the best spot for dried fruits, nuts & local sweets.',
      'Cash is still common — ATMs widely available (Kaspi, Halyk).',
    ],
    places: ['Central Almaty (Panfilov)', 'Dostyk Avenue', 'Medeu & Shymbulak', 'Kok-Tobe', 'Esentai area'],
  },

  bishkek: {
    name: 'Bishkek', country: 'Kyrgyzstan', currency: 'KGS', budgetFactor: 0.4,
    hero: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=80',
    transport: {
      luxury:   'Private 4x4 + driver for Ala-Archa, Issyk-Kul & Song-Kol trips.',
      standard: 'Yandex Go / Namba Taxi (~150–300 som across the city).',
      economy:  'Marshrutka minibuses (10–15 som) — very cheap but crowded.',
    },
    hotels: {
      luxury:   'Hyatt Regency Bishkek (near Ala-Too Square)',
      standard: 'Jannat Regency (Toktogul Street)',
      economy:  'Apple Hostel Bishkek',
    },
    tips: [
      '60-day visa-free for most nationalities — easy entry.',
      'Ala Archa National Park is only 40 min from the city — half-day trip.',
      'Osh Bazaar is chaotic but unmissable — try plov & samsa.',
      'Cash-first culture — ATMs work but smaller shops prefer som.',
      'Halal food is default — Kyrgyzstan is majority Muslim.',
    ],
    places: ['Ala-Too Square', 'Panfilov Park', 'Osh Bazaar', 'Dzerzhinka', 'Vefa neighbourhood'],
  },
};

// ── Country / region aliases (handles transliterations & alternate names) ──────
const ALIASES = {
  // USA
  'usa':            'newyork',
  'america':        'newyork',
  'amerika':        'newyork',
  'америка':        'newyork',
  'сша':            'newyork',
  'united states':  'newyork',
  // France
  'france':         'paris',
  'франция':        'paris',
  // Germany
  'germany':        'berlin',
  'германия':       'berlin',
  // Turkey
  'turkey':         'istanbul',
  'турция':         'istanbul',
  // UAE
  'uae':            'dubai',
  'эмираты':        'dubai',
  'emiraty':        'dubai',
  // Japan
  'japan':          'tokyo',
  'япония':         'tokyo',
  // Italy
  'italy':          'rome',
  'италия':         'rome',
  // Spain
  'spain':          'barcelona',
  'испания':        'barcelona',
  // UK
  'england':        'london',
  'uk':             'london',
  'britain':        'london',
  'великобритания': 'london',
  'англия':         'london',
  // Egypt
  'egypt':          'cairo',
  'египет':         'cairo',
  'каир':           'cairo',
  // Thailand
  'thailand':       'bangkok',
  'таиланд':        'bangkok',
  'тайланд':        'bangkok',
  'бангкок':        'bangkok',
  // Malaysia
  'malaysia':       'kualalumpur',
  'kuala lumpur':   'kualalumpur',
  'малайзия':       'kualalumpur',
  'куалалумпур':    'kualalumpur',
  'куала лумпур':   'kualalumpur',
  // Georgia
  'georgia':        'tbilisi',
  'грузия':         'tbilisi',
  'тбилиси':        'tbilisi',
  // Azerbaijan
  'azerbaijan':     'baku',
  'азербайджан':    'baku',
  'баку':           'baku',
  // Kazakhstan
  'kazakhstan':     'almaty',
  'казахстан':      'almaty',
  'алматы':         'almaty',
  'алмата':         'almaty',
  // Kyrgyzstan
  'kyrgyzstan':     'bishkek',
  'киргизия':       'bishkek',
  'кыргызстан':     'bishkek',
  'бишкек':         'bishkek',
  // Morocco
  'morocco':        'marrakech',
  'марокко':        'marrakech',
  'марракеш':       'marrakech',
  'маракеш':        'marrakech',
  // South Korea
  'korea':          'seoul',
  'south korea':    'seoul',
  'корея':          'seoul',
  'южная корея':    'seoul',
  'сеул':           'seoul',
  // Qatar
  'qatar':          'doha',
  'катар':          'doha',
  'доха':           'doha',
};

// ── Fuzzy city lookup ──────────────────────────────────────────────────────────
export const findCity = (input = '') => {
  const q = input.toLowerCase().trim();
  if (!q) return null;

  // Direct key match
  if (cityDatabase[q]) return cityDatabase[q];

  // Alias match (country/region name → representative city)
  for (const [alias, cityKey] of Object.entries(ALIASES)) {
    if (q === alias || q.includes(alias) || alias.includes(q)) {
      if (cityDatabase[cityKey]) return cityDatabase[cityKey];
    }
  }

  // Match by city name or country name inside the database
  for (const [, data] of Object.entries(cityDatabase)) {
    if (
      data.name.toLowerCase().includes(q) ||
      q.includes(data.name.toLowerCase()) ||
      data.country.toLowerCase().includes(q) ||
      q.includes(data.country.toLowerCase())
    ) {
      return data;
    }
  }
  return null;
};
