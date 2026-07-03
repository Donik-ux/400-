/**
 * Hand-written static translations (NO API, no network) for the core UI that
 * appears on every page: navigation, footer links, the entry agreement modal,
 * and shared chrome (search / notify / toast).
 *
 * These languages are marked `static: true` in languages.js, so the store reads
 * straight from here — instant, offline, zero rate limits. Any key not present
 * here falls back to English automatically (see useLangStore `t()`).
 *
 * Adding a language = add a `<code>: { ... }` block below and flip `static:true`
 * for that code in languages.js. Adding more strings = mirror the English keys
 * from utils/translations.js + the other i18n modules.
 *
 * Wave 1 languages: ru es fr de it pt tr ar zh-CN ja ko hi
 */

export default {
  /* ─────────────────────────── Russian ─────────────────────────── */
  ru: {
    nav: {
      home: 'Главная', planner: 'Планировщик', flights: 'Авиабилеты', packages: 'Пакеты',
      book: 'Забронировать', adminPanel: 'Админ-панель', myProfile: 'Мой профиль',
      myBookings: 'Мои брони', signOut: 'Выйти', signIn: 'Войти', register: 'Регистрация',
      registerFree: 'Бесплатная регистрация', berlin: 'Поездка в Берлин', exotic: '🌍 Экзотика',
    },
    nav2: {
      whereToGo: '🧭 Куда поехать', hotTours: '🔥 Горящие', myDashboard: 'Мой кабинет',
      myTripPlans: 'Мои маршруты', myWishlist: 'Избранное', whereToGoFooter: 'Куда поехать',
      tools: 'Инструменты', termsOfUse: 'Условия использования', privacyPolicy: 'Политика конфиденциальности',
      cookiePolicy: 'Политика cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Пользовательское соглашение',
        warning: 'Пожалуйста, внимательно прочитайте перед использованием сервиса',
        s1Title: '1. Ограничение ответственности по бюджету.',
        s1Body: 'Все оценки бюджета, предоставляемые платформой MAFTRAVEL, носят исключительно справочный и информационный характер. Мы не гарантируем, что ваши фактические расходы совпадут с оценками. Цены на авиабилеты, отели, питание и развлечения могут измениться в любой момент без уведомления.',
        s2Title: '2. Отсутствие финансовых гарантий.',
        s2Body: 'MAFTRAVEL и его сотрудники не несут ответственности за любые финансовые потери, превышение бюджета, незапланированные траты или иные денежные убытки, возникшие в результате использования предоставленных оценок.',
        s3Title: '3. Визовые требования.',
        s3Body: 'Информация о визах приведена только для справки. Настоятельно рекомендуем самостоятельно уточнять актуальные визовые требования в посольстве или консульстве страны назначения. MAFTRAVEL не несёт ответственности за отказ в визе или во въезде.',
        s4Title: '4. Изменение условий.',
        s4Body: 'Все маршруты, цены и рекомендации формируются автоматически на основе ИИ и открытых источников данных. Сервис не является туристическим агентством и не продаёт туристические услуги напрямую.',
        s5Title: '5. Авторские права.',
        s5Body: 'Все материалы сайта (тексты, дизайн, исходный код) защищены авторским правом © 2025 MAFTRAVEL. Копирование без разрешения запрещено.',
        s6Title: '6. Использование сервиса.',
        s6Body: 'Нажимая кнопку «Продолжить», вы подтверждаете, что прочитали, поняли и согласны со всеми условиями данного соглашения. Вы также подтверждаете, что не будете предъявлять MAFTRAVEL претензий относительно расхождения фактических и оценочных расходов.',
        checkbox: 'Я прочитал(а) все условия соглашения и принимаю их полностью',
        accept: 'Продолжить',
        footnote: 'Продолжая пользоваться сайтом, вы соглашаетесь с нашими условиями',
      },
      search: {
        trigger: 'Поиск авиабилетов…', placeholder: 'Поиск рейсов, авиакомпаний, маршрутов…',
        hint: 'Введите минимум 2 символа для поиска', noResults: 'Ничего не найдено по запросу',
        navigate: 'Навигация', openHint: 'Открыть', closeHint: 'Закрыть', resultsLabel: 'результатов',
      },
      notify: {
        title: 'Получайте уведомления о скидках 🎯', body: 'Узнавайте первыми о распродажах и эксклюзивных предложениях.',
        allow: 'Разрешить', notNow: 'Не сейчас',
      },
      toast: { dismiss: 'Закрыть' },
    },
    /* Hand-tuned display copy — the auto-translation stumbles on grammar in
       the biggest headlines, which undercuts the editorial look. */
    homePage: {
      hero: {
        titleLead: 'Ваше следующее незабываемое',
        titleHighlight: 'путешествие',
        titleTail: 'которое спланирует MAFTRAVEL AI.',
        subtitle: 'Сравнивайте авиабилеты и туры — или доверьте маршрут нашему ИИ: от Дубая до Антарктиды в два клика.',
      },
    },
    homeStats: {
      ai: 'Работает на ИИ',
      prices: 'Честные цены',
    },
    footer: {
      join: 'Подписка',
    },
    antarctica: {
      hero: {
        badge: '7-й континент · Экспедиции 2026–2027',
        titleLead: 'Ступите на землю',
        titleHighlight: 'Антарктиды',
        titleTail: 'самое редкое путешествие на Земле.',
        ctaPlan: 'Собрать мой план',
        ctaExpert: 'Поговорить с полярным экспертом',
      },
      routes: {
        fromLabel: 'от',
        daysLabel: 'дней',
      },
      cta: {
        btnPlan: 'Собрать бесплатный AI-план',
        btnWhatsApp: 'Спросить эксперта в WhatsApp',
      },
    },
  },

  /* ─────────────────────────── Spanish ─────────────────────────── */
  es: {
    nav: {
      home: 'Inicio', planner: 'Planificador', flights: 'Vuelos', packages: 'Paquetes',
      book: 'Reservar', adminPanel: 'Panel de admin', myProfile: 'Mi perfil',
      myBookings: 'Mis reservas', signOut: 'Cerrar sesión', signIn: 'Iniciar sesión', register: 'Registrarse',
      registerFree: 'Registro gratis', berlin: 'Viaje a Berlín', exotic: '🌍 Tours exóticos',
    },
    nav2: {
      whereToGo: '🧭 A dónde ir', hotTours: '🔥 Ofertas de tours', myDashboard: 'Mi panel',
      myTripPlans: 'Mis itinerarios', myWishlist: 'Favoritos', whereToGoFooter: 'A dónde ir',
      tools: 'Herramientas', termsOfUse: 'Términos de uso', privacyPolicy: 'Política de privacidad',
      cookiePolicy: 'Política de cookies',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Acuerdo de usuario',
        warning: 'Por favor, lea atentamente antes de usar el servicio',
        s1Title: '1. Limitación de responsabilidad sobre el presupuesto.',
        s1Body: 'Todas las estimaciones de presupuesto proporcionadas por la plataforma MAFTRAVEL son únicamente orientativas e informativas. No garantizamos que sus gastos reales coincidan con las estimaciones. Los precios de vuelos, hoteles, comida y ocio pueden cambiar en cualquier momento sin previo aviso.',
        s2Title: '2. Sin garantías financieras.',
        s2Body: 'MAFTRAVEL y su personal no se hacen responsables de pérdidas financieras, excesos de presupuesto, gastos no planificados u otras pérdidas económicas derivadas del uso de las estimaciones proporcionadas.',
        s3Title: '3. Requisitos de visado.',
        s3Body: 'La información sobre visados es solo de referencia. Recomendamos encarecidamente verificar usted mismo los requisitos de visado vigentes en la embajada o consulado del país de destino. MAFTRAVEL no se responsabiliza de denegaciones de visado o de entrada.',
        s4Title: '4. Cambios en los términos.',
        s4Body: 'Todas las rutas, precios y recomendaciones se generan automáticamente a partir de IA y fuentes de datos abiertas. El servicio no es una agencia de viajes y no vende servicios de viaje directamente.',
        s5Title: '5. Derechos de autor.',
        s5Body: 'Todo el material del sitio (textos, diseño, código fuente) está protegido por derechos de autor © 2025 MAFTRAVEL. Queda prohibida la copia sin permiso.',
        s6Title: '6. Uso del servicio.',
        s6Body: 'Al hacer clic en «Continuar», confirma que ha leído, entendido y acepta todos los términos de este acuerdo. También confirma que no presentará ninguna reclamación a MAFTRAVEL por cualquier discrepancia entre los gastos reales y los estimados.',
        checkbox: 'He leído todos los términos del acuerdo y los acepto en su totalidad',
        accept: 'Continuar',
        footnote: 'Al seguir usando el sitio, acepta nuestros términos',
      },
      search: {
        trigger: 'Buscar vuelos…', placeholder: 'Buscar vuelos, aerolíneas, rutas…',
        hint: 'Escriba al menos 2 caracteres para buscar', noResults: 'Sin resultados para',
        navigate: 'Navegar', openHint: 'Abrir', closeHint: 'Cerrar', resultsLabel: 'resultados',
      },
      notify: {
        title: 'Recibe avisos de ofertas 🎯', body: 'Sé el primero en conocer ventas flash y ofertas exclusivas.',
        allow: 'Permitir', notNow: 'Ahora no',
      },
      toast: { dismiss: 'Cerrar' },
    },
  },

  /* ─────────────────────────── French ─────────────────────────── */
  fr: {
    nav: {
      home: 'Accueil', planner: 'Planificateur', flights: 'Vols', packages: 'Forfaits',
      book: 'Réserver', adminPanel: 'Panneau admin', myProfile: 'Mon profil',
      myBookings: 'Mes réservations', signOut: 'Se déconnecter', signIn: 'Se connecter', register: "S'inscrire",
      registerFree: 'Inscription gratuite', berlin: 'Voyage à Berlin', exotic: '🌍 Circuits exotiques',
    },
    nav2: {
      whereToGo: '🧭 Où aller', hotTours: '🔥 Offres de circuits', myDashboard: 'Mon tableau de bord',
      myTripPlans: 'Mes itinéraires', myWishlist: 'Favoris', whereToGoFooter: 'Où aller',
      tools: 'Outils', termsOfUse: "Conditions d'utilisation", privacyPolicy: 'Politique de confidentialité',
      cookiePolicy: 'Politique de cookies',
    },
    ui: {
      disclaimer: {
        eyebrow: "Accord d'utilisateur",
        warning: 'Veuillez lire attentivement avant d’utiliser le service',
        s1Title: '1. Limitation de responsabilité budgétaire.',
        s1Body: 'Toutes les estimations de budget fournies par la plateforme MAFTRAVEL sont uniquement indicatives et informatives. Nous ne garantissons pas que vos dépenses réelles correspondront aux estimations. Les prix des vols, hôtels, repas et loisirs peuvent changer à tout moment sans préavis.',
        s2Title: '2. Aucune garantie financière.',
        s2Body: 'MAFTRAVEL et son personnel ne sont pas responsables des pertes financières, dépassements de budget, dépenses imprévues ou autres pertes monétaires résultant de l’utilisation des estimations fournies.',
        s3Title: '3. Exigences de visa.',
        s3Body: 'Les informations sur les visas sont fournies à titre indicatif uniquement. Nous vous recommandons vivement de vérifier vous-même les exigences de visa en vigueur auprès de l’ambassade ou du consulat du pays de destination. MAFTRAVEL n’est pas responsable des refus de visa ou d’entrée.',
        s4Title: '4. Modifications des conditions.',
        s4Body: 'Tous les itinéraires, prix et recommandations sont générés automatiquement à partir de l’IA et de sources de données ouvertes. Le service n’est pas une agence de voyages et ne vend pas de services de voyage directement.',
        s5Title: '5. Droits d’auteur.',
        s5Body: 'Tout le contenu du site (textes, design, code source) est protégé par le droit d’auteur © 2025 MAFTRAVEL. Toute copie sans autorisation est interdite.',
        s6Title: '6. Utilisation du service.',
        s6Body: 'En cliquant sur « Continuer », vous confirmez avoir lu, compris et accepté toutes les conditions du présent accord. Vous confirmez également que vous ne formulerez aucune réclamation auprès de MAFTRAVEL concernant tout écart entre les dépenses réelles et estimées.',
        checkbox: 'J’ai lu toutes les conditions de l’accord et je les accepte intégralement',
        accept: 'Continuer',
        footnote: 'En continuant à utiliser le site, vous acceptez nos conditions',
      },
      search: {
        trigger: 'Rechercher des vols…', placeholder: 'Rechercher vols, compagnies, itinéraires…',
        hint: 'Saisissez au moins 2 caractères pour rechercher', noResults: 'Aucun résultat pour',
        navigate: 'Naviguer', openHint: 'Ouvrir', closeHint: 'Fermer', resultsLabel: 'résultats',
      },
      notify: {
        title: 'Soyez averti des offres 🎯', body: 'Soyez le premier informé des ventes flash et offres exclusives.',
        allow: 'Autoriser', notNow: 'Pas maintenant',
      },
      toast: { dismiss: 'Fermer' },
    },
  },

  /* ─────────────────────────── German ─────────────────────────── */
  de: {
    nav: {
      home: 'Startseite', planner: 'Planer', flights: 'Flüge', packages: 'Pakete',
      book: 'Buchen', adminPanel: 'Admin-Panel', myProfile: 'Mein Profil',
      myBookings: 'Meine Buchungen', signOut: 'Abmelden', signIn: 'Anmelden', register: 'Registrieren',
      registerFree: 'Kostenlos registrieren', berlin: 'Berlin-Reise', exotic: '🌍 Exotische Reisen',
    },
    nav2: {
      whereToGo: '🧭 Wohin reisen', hotTours: '🔥 Top-Angebote', myDashboard: 'Mein Dashboard',
      myTripPlans: 'Meine Reisepläne', myWishlist: 'Merkliste', whereToGoFooter: 'Wohin reisen',
      tools: 'Tools', termsOfUse: 'Nutzungsbedingungen', privacyPolicy: 'Datenschutzerklärung',
      cookiePolicy: 'Cookie-Richtlinie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Nutzungsvereinbarung',
        warning: 'Bitte sorgfältig lesen, bevor Sie den Dienst nutzen',
        s1Title: '1. Haftungsbeschränkung beim Budget.',
        s1Body: 'Alle von der MAFTRAVEL-Plattform bereitgestellten Budgetschätzungen dienen ausschließlich der Orientierung und Information. Wir garantieren nicht, dass Ihre tatsächlichen Ausgaben den Schätzungen entsprechen. Preise für Flüge, Hotels, Essen und Unterhaltung können sich jederzeit ohne Vorankündigung ändern.',
        s2Title: '2. Keine finanziellen Garantien.',
        s2Body: 'MAFTRAVEL und seine Mitarbeiter haften nicht für finanzielle Verluste, Budgetüberschreitungen, ungeplante Ausgaben oder sonstige Geldverluste, die aus der Nutzung der bereitgestellten Schätzungen entstehen.',
        s3Title: '3. Visabestimmungen.',
        s3Body: 'Visa-Informationen dienen nur als Referenz. Wir empfehlen dringend, die aktuellen Visabestimmungen selbst bei der Botschaft oder dem Konsulat des Ziellandes zu prüfen. MAFTRAVEL haftet nicht für Visa-Ablehnungen oder verweigerte Einreise.',
        s4Title: '4. Änderungen der Bedingungen.',
        s4Body: 'Alle Routen, Preise und Empfehlungen werden automatisch auf Basis von KI und offenen Datenquellen erstellt. Der Dienst ist kein Reisebüro und verkauft keine Reiseleistungen direkt.',
        s5Title: '5. Urheberrecht.',
        s5Body: 'Alle Inhalte der Website (Texte, Design, Quellcode) sind urheberrechtlich geschützt © 2025 MAFTRAVEL. Das Kopieren ohne Genehmigung ist untersagt.',
        s6Title: '6. Nutzung des Dienstes.',
        s6Body: 'Mit dem Klick auf „Weiter" bestätigen Sie, dass Sie alle Bedingungen dieser Vereinbarung gelesen, verstanden und akzeptiert haben. Sie bestätigen außerdem, dass Sie gegenüber MAFTRAVEL keine Ansprüche bezüglich Abweichungen zwischen tatsächlichen und geschätzten Ausgaben geltend machen.',
        checkbox: 'Ich habe alle Bedingungen der Vereinbarung gelesen und akzeptiere sie vollständig',
        accept: 'Weiter',
        footnote: 'Durch die weitere Nutzung der Website stimmen Sie unseren Bedingungen zu',
      },
      search: {
        trigger: 'Flüge suchen…', placeholder: 'Flüge, Airlines, Routen suchen…',
        hint: 'Geben Sie mindestens 2 Zeichen ein', noResults: 'Keine Ergebnisse für',
        navigate: 'Navigieren', openHint: 'Öffnen', closeHint: 'Schließen', resultsLabel: 'Ergebnisse',
      },
      notify: {
        title: 'Angebote nicht verpassen 🎯', body: 'Erfahren Sie als Erster von Blitzangeboten und exklusiven Deals.',
        allow: 'Erlauben', notNow: 'Nicht jetzt',
      },
      toast: { dismiss: 'Schließen' },
    },
  },

  /* ─────────────────────────── Italian ─────────────────────────── */
  it: {
    nav: {
      home: 'Home', planner: 'Pianificatore', flights: 'Voli', packages: 'Pacchetti',
      book: 'Prenota', adminPanel: 'Pannello admin', myProfile: 'Il mio profilo',
      myBookings: 'Le mie prenotazioni', signOut: 'Esci', signIn: 'Accedi', register: 'Registrati',
      registerFree: 'Registrazione gratuita', berlin: 'Viaggio a Berlino', exotic: '🌍 Tour esotici',
    },
    nav2: {
      whereToGo: '🧭 Dove andare', hotTours: '🔥 Offerte tour', myDashboard: 'La mia dashboard',
      myTripPlans: 'I miei itinerari', myWishlist: 'Preferiti', whereToGoFooter: 'Dove andare',
      tools: 'Strumenti', termsOfUse: 'Termini di utilizzo', privacyPolicy: 'Informativa sulla privacy',
      cookiePolicy: 'Politica sui cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Accordo utente',
        warning: 'Si prega di leggere attentamente prima di usare il servizio',
        s1Title: '1. Limitazione di responsabilità sul budget.',
        s1Body: 'Tutte le stime di budget fornite dalla piattaforma MAFTRAVEL hanno scopo puramente orientativo e informativo. Non garantiamo che le spese effettive corrispondano alle stime. I prezzi di voli, hotel, cibo e intrattenimento possono cambiare in qualsiasi momento senza preavviso.',
        s2Title: '2. Nessuna garanzia finanziaria.',
        s2Body: 'MAFTRAVEL e il suo personale non sono responsabili di perdite finanziarie, sforamenti di budget, spese impreviste o altre perdite economiche derivanti dall’uso delle stime fornite.',
        s3Title: '3. Requisiti per il visto.',
        s3Body: 'Le informazioni sui visti sono solo a titolo di riferimento. Raccomandiamo vivamente di verificare personalmente i requisiti di visto aggiornati presso l’ambasciata o il consolato del paese di destinazione. MAFTRAVEL non è responsabile per il rifiuto del visto o dell’ingresso.',
        s4Title: '4. Modifiche ai termini.',
        s4Body: 'Tutti gli itinerari, i prezzi e i consigli sono generati automaticamente sulla base dell’IA e di fonti di dati aperte. Il servizio non è un’agenzia di viaggi e non vende servizi di viaggio direttamente.',
        s5Title: '5. Diritti d’autore.',
        s5Body: 'Tutti i materiali del sito (testi, design, codice sorgente) sono protetti da copyright © 2025 MAFTRAVEL. La copia senza autorizzazione è vietata.',
        s6Title: '6. Uso del servizio.',
        s6Body: 'Cliccando sul pulsante «Continua», confermi di aver letto, compreso e accettato tutti i termini del presente accordo. Confermi inoltre che non avanzerai alcuna richiesta nei confronti di MAFTRAVEL riguardo a eventuali discrepanze tra spese effettive e stimate.',
        checkbox: 'Ho letto tutti i termini dell’accordo e li accetto integralmente',
        accept: 'Continua',
        footnote: 'Continuando a usare il sito, accetti i nostri termini',
      },
      search: {
        trigger: 'Cerca voli…', placeholder: 'Cerca voli, compagnie, rotte…',
        hint: 'Inserisci almeno 2 caratteri per cercare', noResults: 'Nessun risultato per',
        navigate: 'Naviga', openHint: 'Apri', closeHint: 'Chiudi', resultsLabel: 'risultati',
      },
      notify: {
        title: 'Ricevi avvisi sulle offerte 🎯', body: 'Sii il primo a sapere di vendite lampo e offerte esclusive.',
        allow: 'Consenti', notNow: 'Non ora',
      },
      toast: { dismiss: 'Chiudi' },
    },
  },

  /* ─────────────────────────── Portuguese ─────────────────────────── */
  pt: {
    nav: {
      home: 'Início', planner: 'Planejador', flights: 'Voos', packages: 'Pacotes',
      book: 'Reservar', adminPanel: 'Painel admin', myProfile: 'Meu perfil',
      myBookings: 'Minhas reservas', signOut: 'Sair', signIn: 'Entrar', register: 'Registrar-se',
      registerFree: 'Registro grátis', berlin: 'Viagem a Berlim', exotic: '🌍 Tours exóticos',
    },
    nav2: {
      whereToGo: '🧭 Para onde ir', hotTours: '🔥 Ofertas de tours', myDashboard: 'Meu painel',
      myTripPlans: 'Meus roteiros', myWishlist: 'Favoritos', whereToGoFooter: 'Para onde ir',
      tools: 'Ferramentas', termsOfUse: 'Termos de uso', privacyPolicy: 'Política de privacidade',
      cookiePolicy: 'Política de cookies',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Acordo do usuário',
        warning: 'Por favor, leia com atenção antes de usar o serviço',
        s1Title: '1. Limitação de responsabilidade sobre o orçamento.',
        s1Body: 'Todas as estimativas de orçamento fornecidas pela plataforma MAFTRAVEL são apenas para orientação e informação. Não garantimos que suas despesas reais coincidam com as estimativas. Os preços de voos, hotéis, alimentação e lazer podem mudar a qualquer momento sem aviso.',
        s2Title: '2. Sem garantias financeiras.',
        s2Body: 'A MAFTRAVEL e sua equipe não se responsabilizam por perdas financeiras, estouros de orçamento, gastos não planejados ou outras perdas monetárias decorrentes do uso das estimativas fornecidas.',
        s3Title: '3. Exigências de visto.',
        s3Body: 'As informações sobre vistos são apenas para referência. Recomendamos fortemente que você verifique pessoalmente os requisitos de visto vigentes na embaixada ou consulado do país de destino. A MAFTRAVEL não se responsabiliza por recusas de visto ou de entrada.',
        s4Title: '4. Alterações nos termos.',
        s4Body: 'Todos os roteiros, preços e recomendações são gerados automaticamente com base em IA e fontes de dados abertas. O serviço não é uma agência de viagens e não vende serviços de viagem diretamente.',
        s5Title: '5. Direitos autorais.',
        s5Body: 'Todo o conteúdo do site (textos, design, código-fonte) é protegido por direitos autorais © 2025 MAFTRAVEL. A cópia sem permissão é proibida.',
        s6Title: '6. Uso do serviço.',
        s6Body: 'Ao clicar no botão «Continuar», você confirma que leu, entendeu e concorda com todos os termos deste acordo. Você também confirma que não fará nenhuma reclamação à MAFTRAVEL quanto a qualquer divergência entre despesas reais e estimadas.',
        checkbox: 'Li todos os termos do acordo e os aceito integralmente',
        accept: 'Continuar',
        footnote: 'Ao continuar a usar o site, você concorda com nossos termos',
      },
      search: {
        trigger: 'Buscar voos…', placeholder: 'Buscar voos, companhias, rotas…',
        hint: 'Digite pelo menos 2 caracteres para buscar', noResults: 'Nenhum resultado para',
        navigate: 'Navegar', openHint: 'Abrir', closeHint: 'Fechar', resultsLabel: 'resultados',
      },
      notify: {
        title: 'Receba avisos de ofertas 🎯', body: 'Seja o primeiro a saber de promoções relâmpago e ofertas exclusivas.',
        allow: 'Permitir', notNow: 'Agora não',
      },
      toast: { dismiss: 'Fechar' },
    },
  },

  /* ─────────────────────────── Turkish ─────────────────────────── */
  tr: {
    nav: {
      home: 'Ana sayfa', planner: 'Planlayıcı', flights: 'Uçuşlar', packages: 'Paketler',
      book: 'Rezervasyon', adminPanel: 'Yönetim paneli', myProfile: 'Profilim',
      myBookings: 'Rezervasyonlarım', signOut: 'Çıkış yap', signIn: 'Giriş yap', register: 'Kayıt ol',
      registerFree: 'Ücretsiz kayıt', berlin: 'Berlin gezisi', exotic: '🌍 Egzotik turlar',
    },
    nav2: {
      whereToGo: '🧭 Nereye gidilir', hotTours: '🔥 Sıcak turlar', myDashboard: 'Panelim',
      myTripPlans: 'Gezi planlarım', myWishlist: 'Favorilerim', whereToGoFooter: 'Nereye gidilir',
      tools: 'Araçlar', termsOfUse: 'Kullanım koşulları', privacyPolicy: 'Gizlilik politikası',
      cookiePolicy: 'Çerez politikası',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Kullanıcı sözleşmesi',
        warning: 'Lütfen hizmeti kullanmadan önce dikkatlice okuyun',
        s1Title: '1. Bütçe sorumluluğunun sınırlandırılması.',
        s1Body: 'MAFTRAVEL platformu tarafından sağlanan tüm bütçe tahminleri yalnızca yönlendirme ve bilgilendirme amaçlıdır. Gerçek harcamalarınızın tahminlerle örtüşeceğini garanti etmiyoruz. Uçuş, otel, yemek ve eğlence fiyatları herhangi bir anda haber verilmeksizin değişebilir.',
        s2Title: '2. Finansal garanti yoktur.',
        s2Body: 'MAFTRAVEL ve çalışanları, sağlanan tahminlerin kullanımından doğan finansal kayıplardan, bütçe aşımlarından, planlanmamış harcamalardan veya diğer parasal kayıplardan sorumlu değildir.',
        s3Title: '3. Vize gereklilikleri.',
        s3Body: 'Vize bilgileri yalnızca referans amaçlıdır. Güncel vize gerekliliklerini hedef ülkenin büyükelçiliği veya konsolosluğundan bizzat doğrulamanızı önemle tavsiye ederiz. MAFTRAVEL vize veya giriş reddinden sorumlu değildir.',
        s4Title: '4. Koşulların değişmesi.',
        s4Body: 'Tüm rotalar, fiyatlar ve öneriler yapay zeka ve açık veri kaynaklarına dayanarak otomatik olarak oluşturulur. Hizmet bir seyahat acentesi değildir ve seyahat hizmetlerini doğrudan satmaz.',
        s5Title: '5. Telif hakkı.',
        s5Body: 'Sitedeki tüm materyaller (metinler, tasarım, kaynak kodu) telif hakkıyla korunmaktadır © 2025 MAFTRAVEL. İzinsiz kopyalama yasaktır.',
        s6Title: '6. Hizmetin kullanımı.',
        s6Body: '«Devam et» düğmesine tıklayarak bu sözleşmenin tüm koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylarsınız. Ayrıca gerçek ve tahmini harcamalar arasındaki herhangi bir fark konusunda MAFTRAVEL’e karşı talepte bulunmayacağınızı da onaylarsınız.',
        checkbox: 'Sözleşmenin tüm koşullarını okudum ve tamamen kabul ediyorum',
        accept: 'Devam et',
        footnote: 'Siteyi kullanmaya devam ederek koşullarımızı kabul etmiş olursunuz',
      },
      search: {
        trigger: 'Uçuş ara…', placeholder: 'Uçuş, havayolu, rota ara…',
        hint: 'Aramak için en az 2 karakter girin', noResults: 'Sonuç bulunamadı:',
        navigate: 'Gezin', openHint: 'Aç', closeHint: 'Kapat', resultsLabel: 'sonuç',
      },
      notify: {
        title: 'Fırsatlardan haberdar olun 🎯', body: 'Flaş indirimleri ve özel teklifleri ilk siz öğrenin.',
        allow: 'İzin ver', notNow: 'Şimdi değil',
      },
      toast: { dismiss: 'Kapat' },
    },
  },

  /* ─────────────────────────── Arabic (RTL) ─────────────────────────── */
  ar: {
    nav: {
      home: 'الرئيسية', planner: 'المخطط', flights: 'الرحلات', packages: 'الباقات',
      book: 'احجز', adminPanel: 'لوحة الإدارة', myProfile: 'ملفي الشخصي',
      myBookings: 'حجوزاتي', signOut: 'تسجيل الخروج', signIn: 'تسجيل الدخول', register: 'إنشاء حساب',
      registerFree: 'تسجيل مجاني', berlin: 'رحلة برلين', exotic: '🌍 جولات استثنائية',
    },
    nav2: {
      whereToGo: '🧭 إلى أين تسافر', hotTours: '🔥 عروض الجولات', myDashboard: 'لوحتي',
      myTripPlans: 'خطط رحلاتي', myWishlist: 'المفضلة', whereToGoFooter: 'إلى أين تسافر',
      tools: 'الأدوات', termsOfUse: 'شروط الاستخدام', privacyPolicy: 'سياسة الخصوصية',
      cookiePolicy: 'سياسة ملفات تعريف الارتباط',
    },
    ui: {
      disclaimer: {
        eyebrow: 'اتفاقية المستخدم',
        warning: 'يرجى القراءة بعناية قبل استخدام الخدمة',
        s1Title: '1. حدود المسؤولية عن الميزانية.',
        s1Body: 'جميع تقديرات الميزانية التي تقدمها منصة MAFTRAVEL هي لأغراض الإرشاد والمعلومات فقط. نحن لا نضمن أن تتطابق نفقاتك الفعلية مع التقديرات. قد تتغير أسعار الرحلات والفنادق والطعام والترفيه في أي وقت دون إشعار.',
        s2Title: '2. لا توجد ضمانات مالية.',
        s2Body: 'لا تتحمل MAFTRAVEL وموظفوها المسؤولية عن أي خسائر مالية أو تجاوز للميزانية أو نفقات غير مخطط لها أو خسائر نقدية أخرى ناتجة عن استخدام التقديرات المقدمة.',
        s3Title: '3. متطلبات التأشيرة.',
        s3Body: 'معلومات التأشيرة للاسترشاد فقط. نوصي بشدة بالتحقق بنفسك من متطلبات التأشيرة الحالية لدى سفارة أو قنصلية بلد الوجهة. لا تتحمل MAFTRAVEL مسؤولية رفض التأشيرة أو الدخول.',
        s4Title: '4. تغييرات الشروط.',
        s4Body: 'يتم إنشاء جميع المسارات والأسعار والتوصيات تلقائيًا بناءً على الذكاء الاصطناعي ومصادر البيانات المفتوحة. الخدمة ليست وكالة سفر ولا تبيع خدمات السفر مباشرة.',
        s5Title: '5. حقوق النشر.',
        s5Body: 'جميع مواد الموقع (النصوص والتصميم والشيفرة المصدرية) محمية بحقوق النشر © 2025 MAFTRAVEL. يُحظر النسخ دون إذن.',
        s6Title: '6. استخدام الخدمة.',
        s6Body: 'بالنقر على زر «متابعة»، فإنك تؤكد أنك قرأت وفهمت ووافقت على جميع شروط هذه الاتفاقية. كما تؤكد أنك لن تقدم أي مطالبات ضد MAFTRAVEL بشأن أي تباين بين النفقات الفعلية والمقدّرة.',
        checkbox: 'لقد قرأت جميع شروط الاتفاقية وأقبلها بالكامل',
        accept: 'متابعة',
        footnote: 'بمواصلة استخدام الموقع، فإنك توافق على شروطنا',
      },
      search: {
        trigger: 'البحث عن رحلات…', placeholder: 'ابحث عن رحلات وشركات طيران ومسارات…',
        hint: 'أدخل حرفين على الأقل للبحث', noResults: 'لا توجد نتائج لـ',
        navigate: 'تنقل', openHint: 'فتح', closeHint: 'إغلاق', resultsLabel: 'نتائج',
      },
      notify: {
        title: 'احصل على إشعارات العروض 🎯', body: 'كن أول من يعرف عن التخفيضات السريعة والعروض الحصرية.',
        allow: 'السماح', notNow: 'ليس الآن',
      },
      toast: { dismiss: 'إغلاق' },
    },
  },

  /* ─────────────────────────── Chinese (Simplified) ─────────────────────────── */
  'zh-CN': {
    nav: {
      home: '首页', planner: '行程规划', flights: '航班', packages: '套餐',
      book: '预订', adminPanel: '管理面板', myProfile: '我的资料',
      myBookings: '我的预订', signOut: '退出登录', signIn: '登录', register: '注册',
      registerFree: '免费注册', berlin: '柏林之旅', exotic: '🌍 异国之旅',
    },
    nav2: {
      whereToGo: '🧭 去哪里', hotTours: '🔥 热门线路', myDashboard: '我的面板',
      myTripPlans: '我的行程', myWishlist: '收藏夹', whereToGoFooter: '去哪里',
      tools: '工具', termsOfUse: '使用条款', privacyPolicy: '隐私政策',
      cookiePolicy: 'Cookie 政策',
    },
    ui: {
      disclaimer: {
        eyebrow: '用户协议',
        warning: '使用本服务前请仔细阅读',
        s1Title: '1. 预算责任限制。',
        s1Body: 'MAFTRAVEL 平台提供的所有预算估算仅供参考和信息之用。我们不保证您的实际支出与估算一致。机票、酒店、餐饮和娱乐价格可能随时变动，恕不另行通知。',
        s2Title: '2. 不提供财务保证。',
        s2Body: 'MAFTRAVEL 及其员工不对因使用所提供估算而产生的任何财务损失、预算超支、计划外支出或其他金钱损失负责。',
        s3Title: '3. 签证要求。',
        s3Body: '签证信息仅供参考。我们强烈建议您自行向目的地国家的大使馆或领事馆核实当前的签证要求。MAFTRAVEL 不对签证或入境被拒承担责任。',
        s4Title: '4. 条款变更。',
        s4Body: '所有路线、价格和建议均基于人工智能和公开数据源自动生成。本服务并非旅行社，也不直接销售旅游服务。',
        s5Title: '5. 版权。',
        s5Body: '本网站的所有内容（文字、设计、源代码）均受版权保护 © 2025 MAFTRAVEL。未经许可禁止复制。',
        s6Title: '6. 服务使用。',
        s6Body: '点击「继续」按钮，即表示您确认已阅读、理解并同意本协议的所有条款。您还确认不会就实际支出与估算之间的任何差异向 MAFTRAVEL 提出索赔。',
        checkbox: '我已阅读协议的所有条款并完全接受',
        accept: '继续',
        footnote: '继续使用本网站即表示您同意我们的条款',
      },
      search: {
        trigger: '搜索航班…', placeholder: '搜索航班、航空公司、航线…',
        hint: '请输入至少 2 个字符进行搜索', noResults: '未找到结果：',
        navigate: '导航', openHint: '打开', closeHint: '关闭', resultsLabel: '条结果',
      },
      notify: {
        title: '获取优惠通知 🎯', body: '第一时间了解限时特卖和专属优惠。',
        allow: '允许', notNow: '暂不',
      },
      toast: { dismiss: '关闭' },
    },
  },

  /* ─────────────────────────── Japanese ─────────────────────────── */
  ja: {
    nav: {
      home: 'ホーム', planner: 'プランナー', flights: '航空券', packages: 'パッケージ',
      book: '予約', adminPanel: '管理パネル', myProfile: 'マイプロフィール',
      myBookings: '予約一覧', signOut: 'ログアウト', signIn: 'ログイン', register: '登録',
      registerFree: '無料登録', berlin: 'ベルリン旅行', exotic: '🌍 エキゾチックツアー',
    },
    nav2: {
      whereToGo: '🧭 どこへ行く', hotTours: '🔥 人気ツアー', myDashboard: 'マイダッシュボード',
      myTripPlans: '旅行プラン', myWishlist: 'お気に入り', whereToGoFooter: 'どこへ行く',
      tools: 'ツール', termsOfUse: '利用規約', privacyPolicy: 'プライバシーポリシー',
      cookiePolicy: 'Cookie ポリシー',
    },
    ui: {
      disclaimer: {
        eyebrow: '利用規約',
        warning: 'サービスをご利用になる前に、よくお読みください',
        s1Title: '1. 予算に関する責任の制限。',
        s1Body: 'MAFTRAVEL プラットフォームが提供するすべての予算見積もりは、参考および情報提供のみを目的としています。実際の費用が見積もりと一致することを保証するものではありません。航空券、ホテル、食事、娯楽の価格は、予告なくいつでも変更される場合があります。',
        s2Title: '2. 財務上の保証はありません。',
        s2Body: 'MAFTRAVEL およびそのスタッフは、提供された見積もりの使用に起因する金銭的損失、予算超過、計画外の支出、その他の金銭的損失について一切責任を負いません。',
        s3Title: '3. ビザ要件。',
        s3Body: 'ビザ情報は参考用です。渡航先国の大使館または領事館で、現在のビザ要件をご自身で確認されることを強くお勧めします。MAFTRAVEL はビザや入国の拒否について責任を負いません。',
        s4Title: '4. 規約の変更。',
        s4Body: 'すべてのルート、価格、推奨事項は、AI とオープンデータソースに基づいて自動的に生成されます。本サービスは旅行代理店ではなく、旅行サービスを直接販売するものではありません。',
        s5Title: '5. 著作権。',
        s5Body: '本サイトのすべての素材（テキスト、デザイン、ソースコード）は著作権で保護されています © 2025 MAFTRAVEL。無断複製は禁止されています。',
        s6Title: '6. サービスの利用。',
        s6Body: '「続行」ボタンをクリックすることにより、本規約のすべての条項を読み、理解し、同意したことを確認します。また、実際の費用と見積もりの差異について MAFTRAVEL に一切の請求を行わないことを確認します。',
        checkbox: '規約のすべての条項を読み、全面的に同意します',
        accept: '続行',
        footnote: 'サイトの利用を続けることで、当社の規約に同意したものとみなされます',
      },
      search: {
        trigger: '航空券を検索…', placeholder: '航空券、航空会社、ルートを検索…',
        hint: '検索するには 2 文字以上入力してください', noResults: '結果が見つかりません：',
        navigate: '移動', openHint: '開く', closeHint: '閉じる', resultsLabel: '件',
      },
      notify: {
        title: 'お得情報を受け取る 🎯', body: 'タイムセールや限定オファーをいち早くお知らせします。',
        allow: '許可', notNow: '後で',
      },
      toast: { dismiss: '閉じる' },
    },
  },

  /* ─────────────────────────── Korean ─────────────────────────── */
  ko: {
    nav: {
      home: '홈', planner: '플래너', flights: '항공권', packages: '패키지',
      book: '예약', adminPanel: '관리자 패널', myProfile: '내 프로필',
      myBookings: '내 예약', signOut: '로그아웃', signIn: '로그인', register: '회원가입',
      registerFree: '무료 가입', berlin: '베를린 여행', exotic: '🌍 이국적인 투어',
    },
    nav2: {
      whereToGo: '🧭 어디로 갈까', hotTours: '🔥 인기 투어', myDashboard: '내 대시보드',
      myTripPlans: '내 여행 계획', myWishlist: '위시리스트', whereToGoFooter: '어디로 갈까',
      tools: '도구', termsOfUse: '이용약관', privacyPolicy: '개인정보 처리방침',
      cookiePolicy: '쿠키 정책',
    },
    ui: {
      disclaimer: {
        eyebrow: '사용자 동의',
        warning: '서비스를 이용하기 전에 주의 깊게 읽어 주세요',
        s1Title: '1. 예산 책임의 제한.',
        s1Body: 'MAFTRAVEL 플랫폼이 제공하는 모든 예산 추정치는 참고 및 정보 제공용입니다. 실제 지출이 추정치와 일치함을 보장하지 않습니다. 항공편, 호텔, 식사, 엔터테인먼트 가격은 예고 없이 언제든지 변경될 수 있습니다.',
        s2Title: '2. 재정적 보증 없음.',
        s2Body: 'MAFTRAVEL와 그 직원은 제공된 추정치 사용으로 인해 발생하는 재정적 손실, 예산 초과, 계획되지 않은 지출 또는 기타 금전적 손실에 대해 책임지지 않습니다.',
        s3Title: '3. 비자 요건.',
        s3Body: '비자 정보는 참고용일 뿐입니다. 목적지 국가의 대사관 또는 영사관에서 현재 비자 요건을 직접 확인하실 것을 강력히 권장합니다. MAFTRAVEL는 비자 또는 입국 거부에 대해 책임지지 않습니다.',
        s4Title: '4. 약관 변경.',
        s4Body: '모든 경로, 가격, 추천은 AI와 공개 데이터 소스를 기반으로 자동 생성됩니다. 본 서비스는 여행사가 아니며 여행 서비스를 직접 판매하지 않습니다.',
        s5Title: '5. 저작권.',
        s5Body: '본 사이트의 모든 자료(텍스트, 디자인, 소스 코드)는 저작권으로 보호됩니다 © 2025 MAFTRAVEL. 무단 복제를 금지합니다.',
        s6Title: '6. 서비스 이용.',
        s6Body: '«계속» 버튼을 클릭하면 본 약관의 모든 조항을 읽고 이해하고 동의한 것으로 간주됩니다. 또한 실제 지출과 추정치 간의 차이에 대해 MAFTRAVEL에 어떠한 청구도 하지 않을 것을 확인합니다.',
        checkbox: '약관의 모든 조항을 읽었으며 전적으로 동의합니다',
        accept: '계속',
        footnote: '사이트를 계속 이용하면 당사 약관에 동의하는 것입니다',
      },
      search: {
        trigger: '항공권 검색…', placeholder: '항공편, 항공사, 노선 검색…',
        hint: '검색하려면 2자 이상 입력하세요', noResults: '검색 결과 없음:',
        navigate: '이동', openHint: '열기', closeHint: '닫기', resultsLabel: '개 결과',
      },
      notify: {
        title: '특가 알림 받기 🎯', body: '플래시 세일과 독점 혜택을 가장 먼저 알아보세요.',
        allow: '허용', notNow: '나중에',
      },
      toast: { dismiss: '닫기' },
    },
  },

  /* ─────────────────────────── Hindi ─────────────────────────── */
  hi: {
    nav: {
      home: 'होम', planner: 'प्लानर', flights: 'उड़ानें', packages: 'पैकेज',
      book: 'बुक करें', adminPanel: 'एडमिन पैनल', myProfile: 'मेरी प्रोफ़ाइल',
      myBookings: 'मेरी बुकिंग', signOut: 'साइन आउट', signIn: 'साइन इन', register: 'रजिस्टर करें',
      registerFree: 'मुफ़्त रजिस्टर करें', berlin: 'बर्लिन यात्रा', exotic: '🌍 विदेशी टूर',
    },
    nav2: {
      whereToGo: '🧭 कहाँ जाएँ', hotTours: '🔥 लोकप्रिय टूर', myDashboard: 'मेरा डैशबोर्ड',
      myTripPlans: 'मेरी यात्रा योजनाएँ', myWishlist: 'पसंदीदा', whereToGoFooter: 'कहाँ जाएँ',
      tools: 'उपकरण', termsOfUse: 'उपयोग की शर्तें', privacyPolicy: 'गोपनीयता नीति',
      cookiePolicy: 'कुकी नीति',
    },
    ui: {
      disclaimer: {
        eyebrow: 'उपयोगकर्ता समझौता',
        warning: 'सेवा का उपयोग करने से पहले कृपया ध्यान से पढ़ें',
        s1Title: '1. बजट दायित्व की सीमा।',
        s1Body: 'MAFTRAVEL प्लेटफ़ॉर्म द्वारा दिए गए सभी बजट अनुमान केवल मार्गदर्शन और जानकारी के लिए हैं। हम गारंटी नहीं देते कि आपके वास्तविक खर्च अनुमानों से मेल खाएँगे। उड़ानों, होटलों, भोजन और मनोरंजन की कीमतें किसी भी समय बिना सूचना के बदल सकती हैं।',
        s2Title: '2. कोई वित्तीय गारंटी नहीं।',
        s2Body: 'MAFTRAVEL और उसके कर्मचारी दिए गए अनुमानों के उपयोग से होने वाले किसी भी वित्तीय नुकसान, बजट से अधिक खर्च, अनियोजित व्यय या अन्य धन हानि के लिए जिम्मेदार नहीं हैं।',
        s3Title: '3. वीज़ा आवश्यकताएँ।',
        s3Body: 'वीज़ा जानकारी केवल संदर्भ के लिए है। हम दृढ़ता से अनुशंसा करते हैं कि आप गंतव्य देश के दूतावास या वाणिज्य दूतावास से वर्तमान वीज़ा आवश्यकताओं की स्वयं पुष्टि करें। वीज़ा या प्रवेश अस्वीकृति के लिए MAFTRAVEL जिम्मेदार नहीं है।',
        s4Title: '4. शर्तों में बदलाव।',
        s4Body: 'सभी मार्ग, कीमतें और सिफ़ारिशें AI और खुले डेटा स्रोतों के आधार पर स्वचालित रूप से तैयार की जाती हैं। यह सेवा कोई ट्रैवल एजेंसी नहीं है और यात्रा सेवाएँ सीधे नहीं बेचती।',
        s5Title: '5. कॉपीराइट।',
        s5Body: 'साइट की सभी सामग्री (पाठ, डिज़ाइन, स्रोत कोड) कॉपीराइट द्वारा संरक्षित है © 2025 MAFTRAVEL। बिना अनुमति के नकल करना प्रतिबंधित है।',
        s6Title: '6. सेवा का उपयोग।',
        s6Body: '«जारी रखें» बटन पर क्लिक करके, आप पुष्टि करते हैं कि आपने इस समझौते की सभी शर्तें पढ़ ली हैं, समझ ली हैं और उनसे सहमत हैं। आप यह भी पुष्टि करते हैं कि वास्तविक और अनुमानित खर्चों के बीच किसी भी अंतर के संबंध में आप MAFTRAVEL के विरुद्ध कोई दावा नहीं करेंगे।',
        checkbox: 'मैंने समझौते की सभी शर्तें पढ़ ली हैं और उन्हें पूरी तरह स्वीकार करता/करती हूँ',
        accept: 'जारी रखें',
        footnote: 'साइट का उपयोग जारी रखकर, आप हमारी शर्तों से सहमत होते हैं',
      },
      search: {
        trigger: 'उड़ानें खोजें…', placeholder: 'उड़ानें, एयरलाइंस, मार्ग खोजें…',
        hint: 'खोजने के लिए कम से कम 2 अक्षर दर्ज करें', noResults: 'इसके लिए कोई परिणाम नहीं:',
        navigate: 'नेविगेट करें', openHint: 'खोलें', closeHint: 'बंद करें', resultsLabel: 'परिणाम',
      },
      notify: {
        title: 'ऑफ़र की सूचना पाएँ 🎯', body: 'फ़्लैश सेल और विशेष ऑफ़र के बारे में सबसे पहले जानें।',
        allow: 'अनुमति दें', notNow: 'अभी नहीं',
      },
      toast: { dismiss: 'बंद करें' },
    },
  },

  /* ─────────────────────────── Polish ─────────────────────────── */
  pl: {
    nav: {
      home: 'Główna', planner: 'Planer', flights: 'Loty', packages: 'Pakiety',
      book: 'Zarezerwuj', adminPanel: 'Panel admina', myProfile: 'Mój profil',
      myBookings: 'Moje rezerwacje', signOut: 'Wyloguj się', signIn: 'Zaloguj się', register: 'Zarejestruj się',
      registerFree: 'Darmowa rejestracja', berlin: 'Wyjazd do Berlina', exotic: '🌍 Wycieczki egzotyczne',
    },
    nav2: {
      whereToGo: '🧭 Dokąd jechać', hotTours: '🔥 Gorące oferty', myDashboard: 'Mój panel',
      myTripPlans: 'Moje plany podróży', myWishlist: 'Ulubione', whereToGoFooter: 'Dokąd jechać',
      tools: 'Narzędzia', termsOfUse: 'Warunki korzystania', privacyPolicy: 'Polityka prywatności',
      cookiePolicy: 'Polityka plików cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Umowa użytkownika',
        warning: 'Prosimy o uważne przeczytanie przed skorzystaniem z usługi',
        s1Title: '1. Ograniczenie odpowiedzialności za budżet.',
        s1Body: 'Wszystkie szacunki budżetu dostarczane przez platformę MAFTRAVEL mają charakter wyłącznie orientacyjny i informacyjny. Nie gwarantujemy, że Twoje rzeczywiste wydatki będą zgodne z szacunkami. Ceny lotów, hoteli, jedzenia i rozrywki mogą się zmienić w dowolnym momencie bez powiadomienia.',
        s2Title: '2. Brak gwarancji finansowych.',
        s2Body: 'MAFTRAVEL i jego pracownicy nie ponoszą odpowiedzialności za jakiekolwiek straty finansowe, przekroczenia budżetu, nieplanowane wydatki lub inne straty pieniężne wynikające z korzystania z dostarczonych szacunków.',
        s3Title: '3. Wymagania wizowe.',
        s3Body: 'Informacje o wizach mają charakter wyłącznie orientacyjny. Zdecydowanie zalecamy samodzielne sprawdzenie aktualnych wymagań wizowych w ambasadzie lub konsulacie kraju docelowego. MAFTRAVEL nie ponosi odpowiedzialności za odmowę wizy lub wjazdu.',
        s4Title: '4. Zmiany warunków.',
        s4Body: 'Wszystkie trasy, ceny i rekomendacje są generowane automatycznie na podstawie SI i otwartych źródeł danych. Usługa nie jest biurem podróży i nie sprzedaje usług turystycznych bezpośrednio.',
        s5Title: '5. Prawa autorskie.',
        s5Body: 'Wszystkie materiały serwisu (teksty, projekt, kod źródłowy) są chronione prawem autorskim © 2025 MAFTRAVEL. Kopiowanie bez zezwolenia jest zabronione.',
        s6Title: '6. Korzystanie z usługi.',
        s6Body: 'Klikając przycisk „Kontynuuj", potwierdzasz, że przeczytałeś, zrozumiałeś i akceptujesz wszystkie warunki niniejszej umowy. Potwierdzasz również, że nie będziesz zgłaszać żadnych roszczeń wobec MAFTRAVEL w związku z jakąkolwiek rozbieżnością między rzeczywistymi a szacowanymi wydatkami.',
        checkbox: 'Przeczytałem wszystkie warunki umowy i w pełni je akceptuję',
        accept: 'Kontynuuj',
        footnote: 'Kontynuując korzystanie z serwisu, akceptujesz nasze warunki',
      },
      search: {
        trigger: 'Szukaj lotów…', placeholder: 'Szukaj lotów, linii lotniczych, tras…',
        hint: 'Wpisz co najmniej 2 znaki, aby wyszukać', noResults: 'Brak wyników dla',
        navigate: 'Nawiguj', openHint: 'Otwórz', closeHint: 'Zamknij', resultsLabel: 'wyników',
      },
      notify: {
        title: 'Otrzymuj powiadomienia o ofertach 🎯', body: 'Dowiedz się pierwszy o wyprzedażach błyskawicznych i ofertach ekskluzywnych.',
        allow: 'Zezwól', notNow: 'Nie teraz',
      },
      toast: { dismiss: 'Zamknij' },
    },
  },

  /* ─────────────────────────── Ukrainian ─────────────────────────── */
  uk: {
    nav: {
      home: 'Головна', planner: 'Планувальник', flights: 'Авіаквитки', packages: 'Пакети',
      book: 'Забронювати', adminPanel: 'Адмін-панель', myProfile: 'Мій профіль',
      myBookings: 'Мої бронювання', signOut: 'Вийти', signIn: 'Увійти', register: 'Реєстрація',
      registerFree: 'Безкоштовна реєстрація', berlin: 'Поїздка до Берліна', exotic: '🌍 Екзотичні тури',
    },
    nav2: {
      whereToGo: '🧭 Куди поїхати', hotTours: '🔥 Гарячі тури', myDashboard: 'Мій кабінет',
      myTripPlans: 'Мої маршрути', myWishlist: 'Обране', whereToGoFooter: 'Куди поїхати',
      tools: 'Інструменти', termsOfUse: 'Умови використання', privacyPolicy: 'Політика конфіденційності',
      cookiePolicy: 'Політика cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Угода користувача',
        warning: 'Будь ласка, уважно прочитайте перед використанням сервісу',
        s1Title: '1. Обмеження відповідальності щодо бюджету.',
        s1Body: 'Усі оцінки бюджету, надані платформою MAFTRAVEL, мають виключно довідковий та інформаційний характер. Ми не гарантуємо, що ваші фактичні витрати збігатимуться з оцінками. Ціни на авіаквитки, готелі, харчування та розваги можуть змінюватися будь-якої миті без попередження.',
        s2Title: '2. Відсутність фінансових гарантій.',
        s2Body: 'MAFTRAVEL та його співробітники не несуть відповідальності за будь-які фінансові втрати, перевищення бюджету, незаплановані витрати чи інші грошові збитки, що виникли внаслідок використання наданих оцінок.',
        s3Title: '3. Візові вимоги.',
        s3Body: 'Інформація про візи наведена лише для довідки. Наполегливо рекомендуємо самостійно уточнювати актуальні візові вимоги в посольстві або консульстві країни призначення. MAFTRAVEL не несе відповідальності за відмову у візі чи у в’їзді.',
        s4Title: '4. Зміна умов.',
        s4Body: 'Усі маршрути, ціни та рекомендації формуються автоматично на основі ШІ та відкритих джерел даних. Сервіс не є туристичною агенцією і не продає туристичні послуги напряму.',
        s5Title: '5. Авторські права.',
        s5Body: 'Усі матеріали сайту (тексти, дизайн, вихідний код) захищені авторським правом © 2025 MAFTRAVEL. Копіювання без дозволу заборонено.',
        s6Title: '6. Використання сервісу.',
        s6Body: 'Натискаючи кнопку «Продовжити», ви підтверджуєте, що прочитали, зрозуміли та погоджуєтесь з усіма умовами цієї угоди. Ви також підтверджуєте, що не висуватимете MAFTRAVEL жодних претензій щодо розбіжності між фактичними та оціночними витратами.',
        checkbox: 'Я прочитав(ла) всі умови угоди та повністю їх приймаю',
        accept: 'Продовжити',
        footnote: 'Продовжуючи користуватися сайтом, ви погоджуєтесь з нашими умовами',
      },
      search: {
        trigger: 'Пошук авіаквитків…', placeholder: 'Пошук рейсів, авіакомпаній, маршрутів…',
        hint: 'Введіть щонайменше 2 символи для пошуку', noResults: 'Нічого не знайдено за запитом',
        navigate: 'Навігація', openHint: 'Відкрити', closeHint: 'Закрити', resultsLabel: 'результатів',
      },
      notify: {
        title: 'Отримуйте сповіщення про знижки 🎯', body: 'Дізнавайтеся першими про розпродажі та ексклюзивні пропозиції.',
        allow: 'Дозволити', notNow: 'Не зараз',
      },
      toast: { dismiss: 'Закрити' },
    },
  },

  /* ─────────────────────────── Dutch ─────────────────────────── */
  nl: {
    nav: {
      home: 'Home', planner: 'Planner', flights: 'Vluchten', packages: 'Pakketten',
      book: 'Boeken', adminPanel: 'Adminpaneel', myProfile: 'Mijn profiel',
      myBookings: 'Mijn boekingen', signOut: 'Uitloggen', signIn: 'Inloggen', register: 'Registreren',
      registerFree: 'Gratis registreren', berlin: 'Reis naar Berlijn', exotic: '🌍 Exotische reizen',
    },
    nav2: {
      whereToGo: '🧭 Waarheen', hotTours: '🔥 Topaanbiedingen', myDashboard: 'Mijn dashboard',
      myTripPlans: 'Mijn reisplannen', myWishlist: 'Favorieten', whereToGoFooter: 'Waarheen',
      tools: 'Hulpmiddelen', termsOfUse: 'Gebruiksvoorwaarden', privacyPolicy: 'Privacybeleid',
      cookiePolicy: 'Cookiebeleid',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Gebruikersovereenkomst',
        warning: 'Lees aandachtig voordat u de dienst gebruikt',
        s1Title: '1. Beperking van budgetaansprakelijkheid.',
        s1Body: 'Alle budgetschattingen van het MAFTRAVEL-platform zijn uitsluitend bedoeld als richtlijn en ter informatie. Wij garanderen niet dat uw werkelijke uitgaven overeenkomen met de schattingen. Prijzen voor vluchten, hotels, eten en entertainment kunnen op elk moment zonder kennisgeving veranderen.',
        s2Title: '2. Geen financiële garanties.',
        s2Body: 'MAFTRAVEL en zijn medewerkers zijn niet aansprakelijk voor financiële verliezen, budgetoverschrijdingen, ongeplande uitgaven of andere geldelijke verliezen die voortvloeien uit het gebruik van de verstrekte schattingen.',
        s3Title: '3. Visumvereisten.',
        s3Body: 'Visuminformatie is uitsluitend ter referentie. Wij raden u ten zeerste aan de huidige visumvereisten zelf te verifiëren bij de ambassade of het consulaat van het land van bestemming. MAFTRAVEL is niet verantwoordelijk voor visum- of toegangsweigeringen.',
        s4Title: '4. Wijzigingen in de voorwaarden.',
        s4Body: 'Alle routes, prijzen en aanbevelingen worden automatisch gegenereerd op basis van AI en open databronnen. De dienst is geen reisbureau en verkoopt geen reisdiensten rechtstreeks.',
        s5Title: '5. Auteursrecht.',
        s5Body: 'Al het materiaal op de site (teksten, ontwerp, broncode) is beschermd door auteursrecht © 2025 MAFTRAVEL. Kopiëren zonder toestemming is verboden.',
        s6Title: '6. Gebruik van de dienst.',
        s6Body: 'Door op de knop „Doorgaan" te klikken, bevestigt u dat u alle voorwaarden van deze overeenkomst hebt gelezen, begrepen en aanvaard. U bevestigt tevens dat u geen claims indient bij MAFTRAVEL over enig verschil tussen werkelijke en geschatte uitgaven.',
        checkbox: 'Ik heb alle voorwaarden van de overeenkomst gelezen en aanvaard ze volledig',
        accept: 'Doorgaan',
        footnote: 'Door de site te blijven gebruiken, gaat u akkoord met onze voorwaarden',
      },
      search: {
        trigger: 'Vluchten zoeken…', placeholder: 'Zoek vluchten, luchtvaartmaatschappijen, routes…',
        hint: 'Typ minstens 2 tekens om te zoeken', noResults: 'Geen resultaten voor',
        navigate: 'Navigeren', openHint: 'Openen', closeHint: 'Sluiten', resultsLabel: 'resultaten',
      },
      notify: {
        title: 'Ontvang meldingen over aanbiedingen 🎯', body: 'Wees als eerste op de hoogte van flashsales en exclusieve aanbiedingen.',
        allow: 'Toestaan', notNow: 'Niet nu',
      },
      toast: { dismiss: 'Sluiten' },
    },
  },

  /* ─────────────────────────── Vietnamese ─────────────────────────── */
  vi: {
    nav: {
      home: 'Trang chủ', planner: 'Lập kế hoạch', flights: 'Chuyến bay', packages: 'Gói',
      book: 'Đặt chỗ', adminPanel: 'Bảng quản trị', myProfile: 'Hồ sơ của tôi',
      myBookings: 'Đặt chỗ của tôi', signOut: 'Đăng xuất', signIn: 'Đăng nhập', register: 'Đăng ký',
      registerFree: 'Đăng ký miễn phí', berlin: 'Chuyến đi Berlin', exotic: '🌍 Tour ngoại lai',
    },
    nav2: {
      whereToGo: '🧭 Đi đâu', hotTours: '🔥 Tour hot', myDashboard: 'Bảng điều khiển',
      myTripPlans: 'Kế hoạch chuyến đi', myWishlist: 'Yêu thích', whereToGoFooter: 'Đi đâu',
      tools: 'Công cụ', termsOfUse: 'Điều khoản sử dụng', privacyPolicy: 'Chính sách bảo mật',
      cookiePolicy: 'Chính sách cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Thỏa thuận người dùng',
        warning: 'Vui lòng đọc kỹ trước khi sử dụng dịch vụ',
        s1Title: '1. Giới hạn trách nhiệm về ngân sách.',
        s1Body: 'Tất cả ước tính ngân sách do nền tảng MAFTRAVEL cung cấp chỉ mang tính chất tham khảo và thông tin. Chúng tôi không đảm bảo rằng chi phí thực tế của bạn sẽ khớp với ước tính. Giá vé máy bay, khách sạn, ăn uống và giải trí có thể thay đổi bất cứ lúc nào mà không cần báo trước.',
        s2Title: '2. Không có bảo đảm tài chính.',
        s2Body: 'MAFTRAVEL và nhân viên của mình không chịu trách nhiệm về bất kỳ tổn thất tài chính, vượt ngân sách, chi tiêu ngoài kế hoạch hoặc các tổn thất tiền tệ khác phát sinh từ việc sử dụng các ước tính được cung cấp.',
        s3Title: '3. Yêu cầu thị thực.',
        s3Body: 'Thông tin thị thực chỉ mang tính tham khảo. Chúng tôi đặc biệt khuyến nghị bạn tự xác minh các yêu cầu thị thực hiện hành tại đại sứ quán hoặc lãnh sự quán của quốc gia điểm đến. MAFTRAVEL không chịu trách nhiệm về việc từ chối thị thực hoặc nhập cảnh.',
        s4Title: '4. Thay đổi điều khoản.',
        s4Body: 'Tất cả lộ trình, giá cả và đề xuất được tạo tự động dựa trên AI và các nguồn dữ liệu mở. Dịch vụ không phải là đại lý du lịch và không bán dịch vụ du lịch trực tiếp.',
        s5Title: '5. Bản quyền.',
        s5Body: 'Tất cả tài liệu trên trang web (văn bản, thiết kế, mã nguồn) đều được bảo vệ bản quyền © 2025 MAFTRAVEL. Nghiêm cấm sao chép khi chưa được phép.',
        s6Title: '6. Sử dụng dịch vụ.',
        s6Body: 'Bằng cách nhấp vào nút «Tiếp tục», bạn xác nhận rằng đã đọc, hiểu và đồng ý với tất cả các điều khoản của thỏa thuận này. Bạn cũng xác nhận sẽ không khiếu nại MAFTRAVEL về bất kỳ sự chênh lệch nào giữa chi phí thực tế và ước tính.',
        checkbox: 'Tôi đã đọc tất cả các điều khoản của thỏa thuận và hoàn toàn chấp nhận',
        accept: 'Tiếp tục',
        footnote: 'Bằng cách tiếp tục sử dụng trang web, bạn đồng ý với các điều khoản của chúng tôi',
      },
      search: {
        trigger: 'Tìm chuyến bay…', placeholder: 'Tìm chuyến bay, hãng hàng không, tuyến đường…',
        hint: 'Nhập ít nhất 2 ký tự để tìm kiếm', noResults: 'Không có kết quả cho',
        navigate: 'Điều hướng', openHint: 'Mở', closeHint: 'Đóng', resultsLabel: 'kết quả',
      },
      notify: {
        title: 'Nhận thông báo về ưu đãi 🎯', body: 'Là người đầu tiên biết về khuyến mãi chớp nhoáng và ưu đãi độc quyền.',
        allow: 'Cho phép', notNow: 'Để sau',
      },
      toast: { dismiss: 'Đóng' },
    },
  },

  /* ─────────────────────────── Thai ─────────────────────────── */
  th: {
    nav: {
      home: 'หน้าแรก', planner: 'วางแผน', flights: 'เที่ยวบิน', packages: 'แพ็กเกจ',
      book: 'จอง', adminPanel: 'แผงผู้ดูแล', myProfile: 'โปรไฟล์ของฉัน',
      myBookings: 'การจองของฉัน', signOut: 'ออกจากระบบ', signIn: 'เข้าสู่ระบบ', register: 'สมัครสมาชิก',
      registerFree: 'สมัครฟรี', berlin: 'ทริปเบอร์ลิน', exotic: '🌍 ทัวร์แปลกใหม่',
    },
    nav2: {
      whereToGo: '🧭 ไปที่ไหนดี', hotTours: '🔥 ทัวร์ยอดนิยม', myDashboard: 'แดชบอร์ดของฉัน',
      myTripPlans: 'แผนการเดินทางของฉัน', myWishlist: 'รายการโปรด', whereToGoFooter: 'ไปที่ไหนดี',
      tools: 'เครื่องมือ', termsOfUse: 'เงื่อนไขการใช้งาน', privacyPolicy: 'นโยบายความเป็นส่วนตัว',
      cookiePolicy: 'นโยบายคุกกี้',
    },
    ui: {
      disclaimer: {
        eyebrow: 'ข้อตกลงผู้ใช้',
        warning: 'โปรดอ่านอย่างละเอียดก่อนใช้บริการ',
        s1Title: '1. การจำกัดความรับผิดด้านงบประมาณ',
        s1Body: 'การประเมินงบประมาณทั้งหมดที่แพลตฟอร์ม MAFTRAVEL จัดทำขึ้นมีไว้เพื่อเป็นแนวทางและข้อมูลเท่านั้น เราไม่รับประกันว่าค่าใช้จ่ายจริงของคุณจะตรงกับการประเมิน ราคาเที่ยวบิน โรงแรม อาหาร และความบันเทิงอาจเปลี่ยนแปลงได้ตลอดเวลาโดยไม่แจ้งให้ทราบล่วงหน้า',
        s2Title: '2. ไม่มีการรับประกันทางการเงิน',
        s2Body: 'MAFTRAVEL และพนักงานจะไม่รับผิดชอบต่อความสูญเสียทางการเงิน การใช้จ่ายเกินงบประมาณ ค่าใช้จ่ายที่ไม่ได้วางแผน หรือความสูญเสียทางการเงินอื่น ๆ ที่เกิดจากการใช้การประเมินที่จัดให้',
        s3Title: '3. ข้อกำหนดด้านวีซ่า',
        s3Body: 'ข้อมูลวีซ่ามีไว้เพื่อการอ้างอิงเท่านั้น เราขอแนะนำอย่างยิ่งให้คุณตรวจสอบข้อกำหนดวีซ่าปัจจุบันด้วยตนเองที่สถานทูตหรือสถานกงสุลของประเทศปลายทาง MAFTRAVEL ไม่รับผิดชอบต่อการปฏิเสธวีซ่าหรือการเข้าเมือง',
        s4Title: '4. การเปลี่ยนแปลงเงื่อนไข',
        s4Body: 'เส้นทาง ราคา และคำแนะนำทั้งหมดถูกสร้างขึ้นโดยอัตโนมัติบนพื้นฐานของ AI และแหล่งข้อมูลแบบเปิด บริการนี้ไม่ใช่บริษัทท่องเที่ยวและไม่ได้ขายบริการท่องเที่ยวโดยตรง',
        s5Title: '5. ลิขสิทธิ์',
        s5Body: 'เนื้อหาทั้งหมดของเว็บไซต์ (ข้อความ การออกแบบ ซอร์สโค้ด) ได้รับการคุ้มครองลิขสิทธิ์ © 2025 MAFTRAVEL ห้ามคัดลอกโดยไม่ได้รับอนุญาต',
        s6Title: '6. การใช้บริการ',
        s6Body: 'การคลิกปุ่ม «ดำเนินการต่อ» แสดงว่าคุณยืนยันว่าได้อ่าน เข้าใจ และยอมรับเงื่อนไขทั้งหมดของข้อตกลงนี้แล้ว คุณยังยืนยันว่าจะไม่เรียกร้องใด ๆ ต่อ MAFTRAVEL เกี่ยวกับความแตกต่างระหว่างค่าใช้จ่ายจริงและที่ประเมินไว้',
        checkbox: 'ฉันได้อ่านเงื่อนไขทั้งหมดของข้อตกลงและยอมรับโดยสมบูรณ์',
        accept: 'ดำเนินการต่อ',
        footnote: 'การใช้เว็บไซต์ต่อไปถือว่าคุณยอมรับเงื่อนไขของเรา',
      },
      search: {
        trigger: 'ค้นหาเที่ยวบิน…', placeholder: 'ค้นหาเที่ยวบิน สายการบิน เส้นทาง…',
        hint: 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา', noResults: 'ไม่พบผลลัพธ์สำหรับ',
        navigate: 'นำทาง', openHint: 'เปิด', closeHint: 'ปิด', resultsLabel: 'ผลลัพธ์',
      },
      notify: {
        title: 'รับการแจ้งเตือนดีล 🎯', body: 'เป็นคนแรกที่รู้เกี่ยวกับการลดราคาแบบแฟลชและข้อเสนอพิเศษ',
        allow: 'อนุญาต', notNow: 'ไว้ทีหลัง',
      },
      toast: { dismiss: 'ปิด' },
    },
  },

  /* ─────────────────────────── Indonesian ─────────────────────────── */
  id: {
    nav: {
      home: 'Beranda', planner: 'Perencana', flights: 'Penerbangan', packages: 'Paket',
      book: 'Pesan', adminPanel: 'Panel admin', myProfile: 'Profil saya',
      myBookings: 'Pesanan saya', signOut: 'Keluar', signIn: 'Masuk', register: 'Daftar',
      registerFree: 'Daftar gratis', berlin: 'Perjalanan Berlin', exotic: '🌍 Tur eksotis',
    },
    nav2: {
      whereToGo: '🧭 Ke mana', hotTours: '🔥 Tur populer', myDashboard: 'Dasbor saya',
      myTripPlans: 'Rencana perjalanan saya', myWishlist: 'Favorit', whereToGoFooter: 'Ke mana',
      tools: 'Alat', termsOfUse: 'Ketentuan penggunaan', privacyPolicy: 'Kebijakan privasi',
      cookiePolicy: 'Kebijakan cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Perjanjian pengguna',
        warning: 'Harap baca dengan saksama sebelum menggunakan layanan',
        s1Title: '1. Pembatasan tanggung jawab anggaran.',
        s1Body: 'Semua perkiraan anggaran yang disediakan oleh platform MAFTRAVEL hanya bersifat panduan dan informasi. Kami tidak menjamin bahwa pengeluaran aktual Anda akan sesuai dengan perkiraan. Harga penerbangan, hotel, makanan, dan hiburan dapat berubah kapan saja tanpa pemberitahuan.',
        s2Title: '2. Tidak ada jaminan finansial.',
        s2Body: 'MAFTRAVEL dan stafnya tidak bertanggung jawab atas kerugian finansial, pembengkakan anggaran, pengeluaran tak terduga, atau kerugian uang lainnya yang timbul dari penggunaan perkiraan yang disediakan.',
        s3Title: '3. Persyaratan visa.',
        s3Body: 'Informasi visa hanya untuk referensi. Kami sangat menyarankan agar Anda memverifikasi sendiri persyaratan visa terkini di kedutaan atau konsulat negara tujuan. MAFTRAVEL tidak bertanggung jawab atas penolakan visa atau masuk.',
        s4Title: '4. Perubahan ketentuan.',
        s4Body: 'Semua rute, harga, dan rekomendasi dibuat secara otomatis berdasarkan AI dan sumber data terbuka. Layanan ini bukan agen perjalanan dan tidak menjual layanan perjalanan secara langsung.',
        s5Title: '5. Hak cipta.',
        s5Body: 'Semua materi situs (teks, desain, kode sumber) dilindungi hak cipta © 2025 MAFTRAVEL. Penyalinan tanpa izin dilarang.',
        s6Title: '6. Penggunaan layanan.',
        s6Body: 'Dengan mengklik tombol «Lanjutkan», Anda mengonfirmasi bahwa Anda telah membaca, memahami, dan menyetujui semua ketentuan perjanjian ini. Anda juga mengonfirmasi tidak akan mengajukan klaim apa pun kepada MAFTRAVEL terkait perbedaan antara pengeluaran aktual dan perkiraan.',
        checkbox: 'Saya telah membaca semua ketentuan perjanjian dan menerimanya sepenuhnya',
        accept: 'Lanjutkan',
        footnote: 'Dengan terus menggunakan situs ini, Anda menyetujui ketentuan kami',
      },
      search: {
        trigger: 'Cari penerbangan…', placeholder: 'Cari penerbangan, maskapai, rute…',
        hint: 'Ketik minimal 2 karakter untuk mencari', noResults: 'Tidak ada hasil untuk',
        navigate: 'Navigasi', openHint: 'Buka', closeHint: 'Tutup', resultsLabel: 'hasil',
      },
      notify: {
        title: 'Dapatkan notifikasi penawaran 🎯', body: 'Jadilah yang pertama tahu tentang flash sale dan penawaran eksklusif.',
        allow: 'Izinkan', notNow: 'Nanti saja',
      },
      toast: { dismiss: 'Tutup' },
    },
  },

  /* ─────────────────────────── Greek ─────────────────────────── */
  el: {
    nav: {
      home: 'Αρχική', planner: 'Σχεδιαστής', flights: 'Πτήσεις', packages: 'Πακέτα',
      book: 'Κράτηση', adminPanel: 'Πίνακας διαχείρισης', myProfile: 'Το προφίλ μου',
      myBookings: 'Οι κρατήσεις μου', signOut: 'Αποσύνδεση', signIn: 'Σύνδεση', register: 'Εγγραφή',
      registerFree: 'Δωρεάν εγγραφή', berlin: 'Ταξίδι στο Βερολίνο', exotic: '🌍 Εξωτικές εκδρομές',
    },
    nav2: {
      whereToGo: '🧭 Πού να πάτε', hotTours: '🔥 Δημοφιλείς εκδρομές', myDashboard: 'Ο πίνακάς μου',
      myTripPlans: 'Τα ταξίδια μου', myWishlist: 'Αγαπημένα', whereToGoFooter: 'Πού να πάτε',
      tools: 'Εργαλεία', termsOfUse: 'Όροι χρήσης', privacyPolicy: 'Πολιτική απορρήτου',
      cookiePolicy: 'Πολιτική cookies',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Συμφωνία χρήστη',
        warning: 'Παρακαλούμε διαβάστε προσεκτικά πριν χρησιμοποιήσετε την υπηρεσία',
        s1Title: '1. Περιορισμός ευθύνης προϋπολογισμού.',
        s1Body: 'Όλες οι εκτιμήσεις προϋπολογισμού που παρέχει η πλατφόρμα MAFTRAVEL προορίζονται αποκλειστικά για καθοδήγηση και ενημέρωση. Δεν εγγυόμαστε ότι τα πραγματικά σας έξοδα θα συμπίπτουν με τις εκτιμήσεις. Οι τιμές για πτήσεις, ξενοδοχεία, φαγητό και διασκέδαση μπορούν να αλλάξουν ανά πάσα στιγμή χωρίς προειδοποίηση.',
        s2Title: '2. Καμία οικονομική εγγύηση.',
        s2Body: 'Η MAFTRAVEL και το προσωπικό της δεν ευθύνονται για οικονομικές απώλειες, υπερβάσεις προϋπολογισμού, μη προγραμματισμένα έξοδα ή άλλες χρηματικές απώλειες που προκύπτουν από τη χρήση των παρεχόμενων εκτιμήσεων.',
        s3Title: '3. Απαιτήσεις βίζας.',
        s3Body: 'Οι πληροφορίες για τη βίζα είναι μόνο ενδεικτικές. Συνιστούμε ανεπιφύλακτα να επαληθεύσετε μόνοι σας τις τρέχουσες απαιτήσεις βίζας στην πρεσβεία ή το προξενείο της χώρας προορισμού. Η MAFTRAVEL δεν ευθύνεται για άρνηση βίζας ή εισόδου.',
        s4Title: '4. Αλλαγές στους όρους.',
        s4Body: 'Όλες οι διαδρομές, οι τιμές και οι συστάσεις δημιουργούνται αυτόματα με βάση την Τεχνητή Νοημοσύνη και ανοιχτές πηγές δεδομένων. Η υπηρεσία δεν είναι ταξιδιωτικό γραφείο και δεν πουλά ταξιδιωτικές υπηρεσίες απευθείας.',
        s5Title: '5. Πνευματικά δικαιώματα.',
        s5Body: 'Όλο το υλικό του ιστότοπου (κείμενα, σχεδιασμός, πηγαίος κώδικας) προστατεύεται από πνευματικά δικαιώματα © 2025 MAFTRAVEL. Η αντιγραφή χωρίς άδεια απαγορεύεται.',
        s6Title: '6. Χρήση της υπηρεσίας.',
        s6Body: 'Κάνοντας κλικ στο κουμπί «Συνέχεια», επιβεβαιώνετε ότι έχετε διαβάσει, κατανοήσει και αποδεχτεί όλους τους όρους της παρούσας συμφωνίας. Επιβεβαιώνετε επίσης ότι δεν θα εγείρετε καμία αξίωση κατά της MAFTRAVEL σχετικά με οποιαδήποτε απόκλιση μεταξύ πραγματικών και εκτιμώμενων εξόδων.',
        checkbox: 'Έχω διαβάσει όλους τους όρους της συμφωνίας και τους αποδέχομαι πλήρως',
        accept: 'Συνέχεια',
        footnote: 'Συνεχίζοντας να χρησιμοποιείτε τον ιστότοπο, αποδέχεστε τους όρους μας',
      },
      search: {
        trigger: 'Αναζήτηση πτήσεων…', placeholder: 'Αναζήτηση πτήσεων, αεροπορικών εταιρειών, διαδρομών…',
        hint: 'Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες για αναζήτηση', noResults: 'Κανένα αποτέλεσμα για',
        navigate: 'Πλοήγηση', openHint: 'Άνοιγμα', closeHint: 'Κλείσιμο', resultsLabel: 'αποτελέσματα',
      },
      notify: {
        title: 'Λάβετε ειδοποιήσεις για προσφορές 🎯', body: 'Μάθετε πρώτοι για flash εκπτώσεις και αποκλειστικές προσφορές.',
        allow: 'Να επιτρέπεται', notNow: 'Όχι τώρα',
      },
      toast: { dismiss: 'Κλείσιμο' },
    },
  },

  /* ─────────────────────────── Czech ─────────────────────────── */
  cs: {
    nav: {
      home: 'Domů', planner: 'Plánovač', flights: 'Lety', packages: 'Balíčky',
      book: 'Rezervovat', adminPanel: 'Panel administrátora', myProfile: 'Můj profil',
      myBookings: 'Moje rezervace', signOut: 'Odhlásit se', signIn: 'Přihlásit se', register: 'Registrovat se',
      registerFree: 'Registrace zdarma', berlin: 'Výlet do Berlína', exotic: '🌍 Exotické zájezdy',
    },
    nav2: {
      whereToGo: '🧭 Kam jet', hotTours: '🔥 Žhavé zájezdy', myDashboard: 'Můj přehled',
      myTripPlans: 'Moje cestovní plány', myWishlist: 'Oblíbené', whereToGoFooter: 'Kam jet',
      tools: 'Nástroje', termsOfUse: 'Podmínky použití', privacyPolicy: 'Zásady ochrany osobních údajů',
      cookiePolicy: 'Zásady cookies',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Uživatelská smlouva',
        warning: 'Před použitím služby si prosím pozorně přečtěte',
        s1Title: '1. Omezení odpovědnosti za rozpočet.',
        s1Body: 'Veškeré odhady rozpočtu poskytované platformou MAFTRAVEL slouží pouze pro orientaci a informaci. Nezaručujeme, že vaše skutečné výdaje budou odpovídat odhadům. Ceny letenek, hotelů, jídla a zábavy se mohou kdykoli změnit bez upozornění.',
        s2Title: '2. Žádné finanční záruky.',
        s2Body: 'MAFTRAVEL a jeho zaměstnanci nenesou odpovědnost za jakékoli finanční ztráty, překročení rozpočtu, neplánované výdaje nebo jiné peněžní ztráty vyplývající z použití poskytnutých odhadů.',
        s3Title: '3. Vízové požadavky.',
        s3Body: 'Informace o vízech jsou pouze orientační. Důrazně doporučujeme, abyste si aktuální vízové požadavky sami ověřili na velvyslanectví nebo konzulátu cílové země. MAFTRAVEL nenese odpovědnost za zamítnutí víza nebo vstupu.',
        s4Title: '4. Změny podmínek.',
        s4Body: 'Všechny trasy, ceny a doporučení jsou generovány automaticky na základě umělé inteligence a otevřených zdrojů dat. Služba není cestovní kanceláří a neprodává cestovní služby přímo.',
        s5Title: '5. Autorská práva.',
        s5Body: 'Veškerý obsah webu (texty, design, zdrojový kód) je chráněn autorským právem © 2025 MAFTRAVEL. Kopírování bez povolení je zakázáno.',
        s6Title: '6. Použití služby.',
        s6Body: 'Kliknutím na tlačítko «Pokračovat» potvrzujete, že jste si přečetli, pochopili a souhlasíte se všemi podmínkami této smlouvy. Rovněž potvrzujete, že nebudete vůči MAFTRAVEL vznášet žádné nároky ohledně jakéhokoli rozdílu mezi skutečnými a odhadovanými výdaji.',
        checkbox: 'Přečetl jsem si všechny podmínky smlouvy a plně je přijímám',
        accept: 'Pokračovat',
        footnote: 'Pokračováním v používání webu souhlasíte s našimi podmínkami',
      },
      search: {
        trigger: 'Hledat lety…', placeholder: 'Hledat lety, letecké společnosti, trasy…',
        hint: 'Pro vyhledávání zadejte alespoň 2 znaky', noResults: 'Žádné výsledky pro',
        navigate: 'Navigovat', openHint: 'Otevřít', closeHint: 'Zavřít', resultsLabel: 'výsledků',
      },
      notify: {
        title: 'Dostávejte upozornění na nabídky 🎯', body: 'Buďte první, kdo se dozví o bleskových výprodejích a exkluzivních nabídkách.',
        allow: 'Povolit', notNow: 'Teď ne',
      },
      toast: { dismiss: 'Zavřít' },
    },
  },

  /* ─────────────────────────── Swedish ─────────────────────────── */
  sv: {
    nav: {
      home: 'Hem', planner: 'Planerare', flights: 'Flyg', packages: 'Paket',
      book: 'Boka', adminPanel: 'Adminpanel', myProfile: 'Min profil',
      myBookings: 'Mina bokningar', signOut: 'Logga ut', signIn: 'Logga in', register: 'Registrera',
      registerFree: 'Registrera gratis', berlin: 'Berlinresa', exotic: '🌍 Exotiska resor',
    },
    nav2: {
      whereToGo: '🧭 Vart ska man åka', hotTours: '🔥 Heta resor', myDashboard: 'Min panel',
      myTripPlans: 'Mina reseplaner', myWishlist: 'Favoriter', whereToGoFooter: 'Vart ska man åka',
      tools: 'Verktyg', termsOfUse: 'Användarvillkor', privacyPolicy: 'Integritetspolicy',
      cookiePolicy: 'Cookiepolicy',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Användaravtal',
        warning: 'Läs noggrant innan du använder tjänsten',
        s1Title: '1. Begränsning av budgetansvar.',
        s1Body: 'Alla budgetuppskattningar som tillhandahålls av MAFTRAVEL-plattformen är endast avsedda som vägledning och information. Vi garanterar inte att dina faktiska utgifter kommer att stämma med uppskattningarna. Priser för flyg, hotell, mat och nöjen kan ändras när som helst utan förvarning.',
        s2Title: '2. Inga finansiella garantier.',
        s2Body: 'MAFTRAVEL och dess personal ansvarar inte för några ekonomiska förluster, budgetöverskridanden, oplanerade utgifter eller andra penningförluster som uppstår vid användning av de tillhandahållna uppskattningarna.',
        s3Title: '3. Visumkrav.',
        s3Body: 'Visuminformation är endast för referens. Vi rekommenderar starkt att du själv verifierar de aktuella visumkraven hos ambassaden eller konsulatet i destinationslandet. MAFTRAVEL ansvarar inte för nekade visum eller inresa.',
        s4Title: '4. Ändringar av villkor.',
        s4Body: 'Alla rutter, priser och rekommendationer genereras automatiskt baserat på AI och öppna datakällor. Tjänsten är inte en resebyrå och säljer inte resetjänster direkt.',
        s5Title: '5. Upphovsrätt.',
        s5Body: 'Allt material på webbplatsen (texter, design, källkod) skyddas av upphovsrätt © 2025 MAFTRAVEL. Kopiering utan tillstånd är förbjuden.',
        s6Title: '6. Användning av tjänsten.',
        s6Body: 'Genom att klicka på knappen «Fortsätt» bekräftar du att du har läst, förstått och godkänt alla villkor i detta avtal. Du bekräftar även att du inte kommer att rikta några anspråk mot MAFTRAVEL gällande någon avvikelse mellan faktiska och uppskattade utgifter.',
        checkbox: 'Jag har läst alla villkor i avtalet och accepterar dem fullständigt',
        accept: 'Fortsätt',
        footnote: 'Genom att fortsätta använda webbplatsen godkänner du våra villkor',
      },
      search: {
        trigger: 'Sök flyg…', placeholder: 'Sök flyg, flygbolag, rutter…',
        hint: 'Skriv minst 2 tecken för att söka', noResults: 'Inga resultat för',
        navigate: 'Navigera', openHint: 'Öppna', closeHint: 'Stäng', resultsLabel: 'resultat',
      },
      notify: {
        title: 'Få aviseringar om erbjudanden 🎯', body: 'Var först med att få veta om blixtreor och exklusiva erbjudanden.',
        allow: 'Tillåt', notNow: 'Inte nu',
      },
      toast: { dismiss: 'Stäng' },
    },
  },

  /* ─────────────────────────── Romanian ─────────────────────────── */
  ro: {
    nav: {
      home: 'Acasă', planner: 'Planificator', flights: 'Zboruri', packages: 'Pachete',
      book: 'Rezervă', adminPanel: 'Panou admin', myProfile: 'Profilul meu',
      myBookings: 'Rezervările mele', signOut: 'Deconectare', signIn: 'Conectare', register: 'Înregistrare',
      registerFree: 'Înregistrare gratuită', berlin: 'Călătorie la Berlin', exotic: '🌍 Tururi exotice',
    },
    nav2: {
      whereToGo: '🧭 Unde să mergi', hotTours: '🔥 Tururi populare', myDashboard: 'Panoul meu',
      myTripPlans: 'Planurile mele de călătorie', myWishlist: 'Favorite', whereToGoFooter: 'Unde să mergi',
      tools: 'Instrumente', termsOfUse: 'Termeni de utilizare', privacyPolicy: 'Politica de confidențialitate',
      cookiePolicy: 'Politica de cookie-uri',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Acord de utilizare',
        warning: 'Vă rugăm să citiți cu atenție înainte de a folosi serviciul',
        s1Title: '1. Limitarea răspunderii privind bugetul.',
        s1Body: 'Toate estimările de buget furnizate de platforma MAFTRAVEL au scop exclusiv orientativ și informativ. Nu garantăm că cheltuielile dvs. reale vor corespunde estimărilor. Prețurile pentru zboruri, hoteluri, mâncare și divertisment se pot schimba în orice moment fără notificare.',
        s2Title: '2. Fără garanții financiare.',
        s2Body: 'MAFTRAVEL și personalul său nu sunt răspunzători pentru pierderi financiare, depășiri de buget, cheltuieli neplanificate sau alte pierderi bănești rezultate din utilizarea estimărilor furnizate.',
        s3Title: '3. Cerințe de viză.',
        s3Body: 'Informațiile despre viză sunt doar orientative. Vă recomandăm cu insistență să verificați personal cerințele actuale de viză la ambasada sau consulatul țării de destinație. MAFTRAVEL nu este responsabilă pentru refuzul vizei sau al intrării.',
        s4Title: '4. Modificări ale termenilor.',
        s4Body: 'Toate rutele, prețurile și recomandările sunt generate automat pe baza IA și a surselor de date deschise. Serviciul nu este o agenție de turism și nu vinde servicii de călătorie în mod direct.',
        s5Title: '5. Drepturi de autor.',
        s5Body: 'Toate materialele site-ului (texte, design, cod sursă) sunt protejate de drepturi de autor © 2025 MAFTRAVEL. Copierea fără permisiune este interzisă.',
        s6Title: '6. Utilizarea serviciului.',
        s6Body: 'Făcând clic pe butonul «Continuă», confirmați că ați citit, ați înțeles și sunteți de acord cu toți termenii acestui acord. De asemenea, confirmați că nu veți formula nicio pretenție către MAFTRAVEL privind orice discrepanță între cheltuielile reale și cele estimate.',
        checkbox: 'Am citit toți termenii acordului și îi accept integral',
        accept: 'Continuă',
        footnote: 'Continuând să utilizați site-ul, sunteți de acord cu termenii noștri',
      },
      search: {
        trigger: 'Caută zboruri…', placeholder: 'Caută zboruri, companii aeriene, rute…',
        hint: 'Introduceți cel puțin 2 caractere pentru căutare', noResults: 'Niciun rezultat pentru',
        navigate: 'Navighează', openHint: 'Deschide', closeHint: 'Închide', resultsLabel: 'rezultate',
      },
      notify: {
        title: 'Primește notificări despre oferte 🎯', body: 'Află primul despre reducerile fulger și ofertele exclusive.',
        allow: 'Permite', notNow: 'Nu acum',
      },
      toast: { dismiss: 'Închide' },
    },
  },

  /* ─────────────────────────── Hebrew (RTL) ─────────────────────────── */
  he: {
    nav: {
      home: 'בית', planner: 'מתכנן', flights: 'טיסות', packages: 'חבילות',
      book: 'הזמנה', adminPanel: 'פאנל ניהול', myProfile: 'הפרופיל שלי',
      myBookings: 'ההזמנות שלי', signOut: 'התנתקות', signIn: 'התחברות', register: 'הרשמה',
      registerFree: 'הרשמה חינם', berlin: 'טיול לברלין', exotic: '🌍 טיולים אקזוטיים',
    },
    nav2: {
      whereToGo: '🧭 לאן לנסוע', hotTours: '🔥 טיולים חמים', myDashboard: 'לוח הבקרה שלי',
      myTripPlans: 'תוכניות הטיול שלי', myWishlist: 'מועדפים', whereToGoFooter: 'לאן לנסוע',
      tools: 'כלים', termsOfUse: 'תנאי שימוש', privacyPolicy: 'מדיניות פרטיות',
      cookiePolicy: 'מדיניות עוגיות',
    },
    ui: {
      disclaimer: {
        eyebrow: 'הסכם משתמש',
        warning: 'אנא קראו בעיון לפני השימוש בשירות',
        s1Title: '1. הגבלת אחריות לתקציב.',
        s1Body: 'כל אומדני התקציב שמספקת פלטפורמת MAFTRAVEL נועדו להכוונה ולמידע בלבד. איננו מתחייבים שההוצאות בפועל יתאימו לאומדנים. מחירי טיסות, מלונות, אוכל ובידור עשויים להשתנות בכל עת ללא הודעה מוקדמת.',
        s2Title: '2. ללא ערבויות כספיות.',
        s2Body: 'MAFTRAVEL ועובדיה אינם אחראים לכל הפסד כספי, חריגה מהתקציב, הוצאות בלתי מתוכננות או הפסדים כספיים אחרים הנובעים מהשימוש באומדנים שסופקו.',
        s3Title: '3. דרישות ויזה.',
        s3Body: 'מידע על ויזות נועד לעיון בלבד. אנו ממליצים בחום לבדוק בעצמכם את דרישות הוויזה העדכניות בשגרירות או בקונסוליה של מדינת היעד. MAFTRAVEL אינה אחראית לסירוב ויזה או כניסה.',
        s4Title: '4. שינויים בתנאים.',
        s4Body: 'כל המסלולים, המחירים וההמלצות נוצרים אוטומטית על בסיס בינה מלאכותית ומקורות מידע פתוחים. השירות אינו סוכנות נסיעות ואינו מוכר שירותי נסיעה ישירות.',
        s5Title: '5. זכויות יוצרים.',
        s5Body: 'כל חומרי האתר (טקסטים, עיצוב, קוד מקור) מוגנים בזכויות יוצרים © 2025 MAFTRAVEL. העתקה ללא רשות אסורה.',
        s6Title: '6. שימוש בשירות.',
        s6Body: 'בלחיצה על הכפתור «המשך», אתם מאשרים שקראתם, הבנתם ומסכימים לכל תנאי הסכם זה. כמו כן, אתם מאשרים שלא תגישו כל תביעה נגד MAFTRAVEL בנוגע לכל פער בין ההוצאות בפועל לאומדנים.',
        checkbox: 'קראתי את כל תנאי ההסכם ואני מקבל אותם במלואם',
        accept: 'המשך',
        footnote: 'בהמשך השימוש באתר, אתם מסכימים לתנאים שלנו',
      },
      search: {
        trigger: 'חיפוש טיסות…', placeholder: 'חפשו טיסות, חברות תעופה, מסלולים…',
        hint: 'הקלידו לפחות 2 תווים כדי לחפש', noResults: 'אין תוצאות עבור',
        navigate: 'ניווט', openHint: 'פתיחה', closeHint: 'סגירה', resultsLabel: 'תוצאות',
      },
      notify: {
        title: 'קבלו התראות על מבצעים 🎯', body: 'היו הראשונים לדעת על מבצעי בזק והצעות בלעדיות.',
        allow: 'אישור', notNow: 'לא עכשיו',
      },
      toast: { dismiss: 'סגירה' },
    },
  },

  /* ─────────────────────────── Persian / Farsi (RTL) ─────────────────────────── */
  fa: {
    nav: {
      home: 'خانه', planner: 'برنامه‌ریز', flights: 'پروازها', packages: 'بسته‌ها',
      book: 'رزرو', adminPanel: 'پنل مدیریت', myProfile: 'پروفایل من',
      myBookings: 'رزروهای من', signOut: 'خروج', signIn: 'ورود', register: 'ثبت‌نام',
      registerFree: 'ثبت‌نام رایگان', berlin: 'سفر به برلین', exotic: '🌍 تورهای عجیب',
    },
    nav2: {
      whereToGo: '🧭 کجا برویم', hotTours: '🔥 تورهای داغ', myDashboard: 'داشبورد من',
      myTripPlans: 'برنامه‌های سفر من', myWishlist: 'علاقه‌مندی‌ها', whereToGoFooter: 'کجا برویم',
      tools: 'ابزارها', termsOfUse: 'شرایط استفاده', privacyPolicy: 'سیاست حفظ حریم خصوصی',
      cookiePolicy: 'سیاست کوکی',
    },
    ui: {
      disclaimer: {
        eyebrow: 'توافق‌نامه کاربر',
        warning: 'لطفاً قبل از استفاده از سرویس با دقت مطالعه کنید',
        s1Title: '۱. محدودیت مسئولیت بودجه.',
        s1Body: 'تمام برآوردهای بودجه ارائه‌شده توسط پلتفرم MAFTRAVEL صرفاً جنبه راهنمایی و اطلاع‌رسانی دارند. ما تضمین نمی‌کنیم که هزینه‌های واقعی شما با برآوردها مطابقت داشته باشد. قیمت پروازها، هتل‌ها، غذا و سرگرمی ممکن است در هر زمان بدون اطلاع قبلی تغییر کند.',
        s2Title: '۲. بدون تضمین مالی.',
        s2Body: 'MAFTRAVEL و کارکنان آن مسئول هیچ‌گونه ضرر مالی، تجاوز از بودجه، هزینه‌های پیش‌بینی‌نشده یا سایر زیان‌های پولی ناشی از استفاده از برآوردهای ارائه‌شده نیستند.',
        s3Title: '۳. الزامات ویزا.',
        s3Body: 'اطلاعات ویزا فقط برای مرجع است. اکیداً توصیه می‌کنیم که الزامات فعلی ویزا را خودتان از سفارت یا کنسولگری کشور مقصد بررسی کنید. MAFTRAVEL مسئول رد ویزا یا ورود نیست.',
        s4Title: '۴. تغییرات شرایط.',
        s4Body: 'تمام مسیرها، قیمت‌ها و توصیه‌ها به‌طور خودکار بر اساس هوش مصنوعی و منابع داده باز تولید می‌شوند. این سرویس آژانس مسافرتی نیست و خدمات سفر را مستقیماً نمی‌فروشد.',
        s5Title: '۵. حق نشر.',
        s5Body: 'تمام مطالب سایت (متن‌ها، طراحی، کد منبع) تحت حمایت حق نشر است © 2025 MAFTRAVEL. کپی بدون اجازه ممنوع است.',
        s6Title: '۶. استفاده از سرویس.',
        s6Body: 'با کلیک روی دکمه «ادامه»، تأیید می‌کنید که تمام شرایط این توافق‌نامه را خوانده، درک کرده و با آن موافق هستید. همچنین تأیید می‌کنید که هیچ ادعایی علیه MAFTRAVEL در مورد هرگونه مغایرت بین هزینه‌های واقعی و برآوردی مطرح نخواهید کرد.',
        checkbox: 'من تمام شرایط توافق‌نامه را خوانده‌ام و آن را به‌طور کامل می‌پذیرم',
        accept: 'ادامه',
        footnote: 'با ادامه استفاده از سایت، با شرایط ما موافقت می‌کنید',
      },
      search: {
        trigger: 'جستجوی پرواز…', placeholder: 'جستجوی پروازها، خطوط هوایی، مسیرها…',
        hint: 'برای جستجو حداقل ۲ کاراکتر وارد کنید', noResults: 'نتیجه‌ای یافت نشد برای',
        navigate: 'پیمایش', openHint: 'باز کردن', closeHint: 'بستن', resultsLabel: 'نتیجه',
      },
      notify: {
        title: 'اعلان پیشنهادها را دریافت کنید 🎯', body: 'اولین نفری باشید که از فروش‌های فوری و پیشنهادهای ویژه باخبر می‌شوید.',
        allow: 'اجازه دادن', notNow: 'الان نه',
      },
      toast: { dismiss: 'بستن' },
    },
  },

  /* ─────────────────────────── Bengali ─────────────────────────── */
  bn: {
    nav: {
      home: 'হোম', planner: 'পরিকল্পক', flights: 'ফ্লাইট', packages: 'প্যাকেজ',
      book: 'বুক করুন', adminPanel: 'অ্যাডমিন প্যানেল', myProfile: 'আমার প্রোফাইল',
      myBookings: 'আমার বুকিং', signOut: 'সাইন আউট', signIn: 'সাইন ইন', register: 'নিবন্ধন',
      registerFree: 'বিনামূল্যে নিবন্ধন', berlin: 'বার্লিন ভ্রমণ', exotic: '🌍 বিদেশি ট্যুর',
    },
    nav2: {
      whereToGo: '🧭 কোথায় যাবেন', hotTours: '🔥 জনপ্রিয় ট্যুর', myDashboard: 'আমার ড্যাশবোর্ড',
      myTripPlans: 'আমার ভ্রমণ পরিকল্পনা', myWishlist: 'পছন্দের তালিকা', whereToGoFooter: 'কোথায় যাবেন',
      tools: 'টুলস', termsOfUse: 'ব্যবহারের শর্তাবলী', privacyPolicy: 'গোপনীয়তা নীতি',
      cookiePolicy: 'কুকি নীতি',
    },
    ui: {
      disclaimer: {
        eyebrow: 'ব্যবহারকারী চুক্তি',
        warning: 'পরিষেবা ব্যবহারের আগে অনুগ্রহ করে মনোযোগ সহকারে পড়ুন',
        s1Title: '১. বাজেট দায়বদ্ধতার সীমাবদ্ধতা।',
        s1Body: 'MAFTRAVEL প্ল্যাটফর্ম প্রদত্ত সমস্ত বাজেট অনুমান কেবলমাত্র নির্দেশনা ও তথ্যের জন্য। আমরা গ্যারান্টি দিই না যে আপনার প্রকৃত খরচ অনুমানের সাথে মিলবে। ফ্লাইট, হোটেল, খাবার ও বিনোদনের দাম যেকোনো সময় বিনা নোটিশে পরিবর্তিত হতে পারে।',
        s2Title: '২. কোনো আর্থিক গ্যারান্টি নেই।',
        s2Body: 'MAFTRAVEL এবং এর কর্মীরা প্রদত্ত অনুমান ব্যবহারের ফলে সৃষ্ট কোনো আর্থিক ক্ষতি, বাজেট অতিক্রম, অপরিকল্পিত ব্যয় বা অন্যান্য আর্থিক ক্ষতির জন্য দায়ী নয়।',
        s3Title: '৩. ভিসার প্রয়োজনীয়তা।',
        s3Body: 'ভিসা সংক্রান্ত তথ্য কেবল রেফারেন্সের জন্য। আমরা দৃঢ়ভাবে সুপারিশ করি যে আপনি নিজে গন্তব্য দেশের দূতাবাস বা কনস্যুলেটে বর্তমান ভিসার প্রয়োজনীয়তা যাচাই করুন। ভিসা বা প্রবেশ প্রত্যাখ্যানের জন্য MAFTRAVEL দায়ী নয়।',
        s4Title: '৪. শর্তাবলীর পরিবর্তন।',
        s4Body: 'সমস্ত রুট, মূল্য ও সুপারিশ AI এবং উন্মুক্ত তথ্যসূত্রের ভিত্তিতে স্বয়ংক্রিয়ভাবে তৈরি হয়। পরিষেবাটি কোনো ট্রাভেল এজেন্সি নয় এবং সরাসরি ভ্রমণ সেবা বিক্রি করে না।',
        s5Title: '৫. কপিরাইট।',
        s5Body: 'সাইটের সমস্ত উপাদান (লেখা, ডিজাইন, সোর্স কোড) কপিরাইট দ্বারা সুরক্ষিত © 2025 MAFTRAVEL। অনুমতি ছাড়া অনুলিপি নিষিদ্ধ।',
        s6Title: '৬. পরিষেবার ব্যবহার।',
        s6Body: '«চালিয়ে যান» বোতামে ক্লিক করে আপনি নিশ্চিত করছেন যে আপনি এই চুক্তির সমস্ত শর্তাবলী পড়েছেন, বুঝেছেন এবং সম্মত হয়েছেন। আপনি আরও নিশ্চিত করছেন যে প্রকৃত ও অনুমানকৃত খরচের মধ্যে কোনো পার্থক্যের বিষয়ে আপনি MAFTRAVEL-এর বিরুদ্ধে কোনো দাবি করবেন না।',
        checkbox: 'আমি চুক্তির সমস্ত শর্তাবলী পড়েছি এবং সম্পূর্ণরূপে গ্রহণ করছি',
        accept: 'চালিয়ে যান',
        footnote: 'সাইট ব্যবহার চালিয়ে গেলে, আপনি আমাদের শর্তাবলীতে সম্মত হন',
      },
      search: {
        trigger: 'ফ্লাইট খুঁজুন…', placeholder: 'ফ্লাইট, এয়ারলাইন, রুট খুঁজুন…',
        hint: 'অনুসন্ধানের জন্য কমপক্ষে ২টি অক্ষর লিখুন', noResults: 'কোনো ফলাফল নেই:',
        navigate: 'নেভিগেট', openHint: 'খুলুন', closeHint: 'বন্ধ করুন', resultsLabel: 'ফলাফল',
      },
      notify: {
        title: 'অফারের বিজ্ঞপ্তি পান 🎯', body: 'ফ্ল্যাশ সেল ও এক্সক্লুসিভ অফার সম্পর্কে প্রথমে জানুন।',
        allow: 'অনুমতি দিন', notNow: 'এখন নয়',
      },
      toast: { dismiss: 'বন্ধ করুন' },
    },
  },

  /* ─────────────────────────── Hungarian ─────────────────────────── */
  hu: {
    nav: {
      home: 'Főoldal', planner: 'Tervező', flights: 'Repülőjáratok', packages: 'Csomagok',
      book: 'Foglalás', adminPanel: 'Admin panel', myProfile: 'Profilom',
      myBookings: 'Foglalásaim', signOut: 'Kijelentkezés', signIn: 'Bejelentkezés', register: 'Regisztráció',
      registerFree: 'Ingyenes regisztráció', berlin: 'Berlini utazás', exotic: '🌍 Egzotikus túrák',
    },
    nav2: {
      whereToGo: '🧭 Hová menjünk', hotTours: '🔥 Népszerű túrák', myDashboard: 'Irányítópultom',
      myTripPlans: 'Utazási terveim', myWishlist: 'Kedvencek', whereToGoFooter: 'Hová menjünk',
      tools: 'Eszközök', termsOfUse: 'Felhasználási feltételek', privacyPolicy: 'Adatvédelmi szabályzat',
      cookiePolicy: 'Cookie-szabályzat',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Felhasználói megállapodás',
        warning: 'Kérjük, figyelmesen olvassa el a szolgáltatás használata előtt',
        s1Title: '1. A költségvetési felelősség korlátozása.',
        s1Body: 'A MAFTRAVEL platform által biztosított összes költségvetési becslés kizárólag tájékoztató és információs célt szolgál. Nem garantáljuk, hogy tényleges kiadásai megegyeznek a becslésekkel. A repülőjegyek, szállodák, étkezés és szórakozás árai bármikor, előzetes értesítés nélkül változhatnak.',
        s2Title: '2. Nincsenek pénzügyi garanciák.',
        s2Body: 'A MAFTRAVEL és munkatársai nem felelősek semmilyen pénzügyi veszteségért, költségvetés-túllépésért, nem tervezett kiadásért vagy egyéb pénzbeli veszteségért, amely a biztosított becslések használatából ered.',
        s3Title: '3. Vízumkövetelmények.',
        s3Body: 'A vízuminformációk csak tájékoztató jellegűek. Erősen ajánljuk, hogy az aktuális vízumkövetelményeket saját maga ellenőrizze a célország nagykövetségén vagy konzulátusán. A MAFTRAVEL nem felelős a vízum vagy belépés elutasításáért.',
        s4Title: '4. A feltételek módosítása.',
        s4Body: 'Az összes útvonal, ár és ajánlás automatikusan, MI és nyílt adatforrások alapján jön létre. A szolgáltatás nem utazási iroda, és nem értékesít utazási szolgáltatásokat közvetlenül.',
        s5Title: '5. Szerzői jog.',
        s5Body: 'Az oldal minden anyaga (szövegek, dizájn, forráskód) szerzői jogvédelem alatt áll © 2025 MAFTRAVEL. Az engedély nélküli másolás tilos.',
        s6Title: '6. A szolgáltatás használata.',
        s6Body: 'A «Folytatás» gombra kattintva megerősíti, hogy elolvasta, megértette és elfogadja a jelen megállapodás összes feltételét. Azt is megerősíti, hogy nem támaszt semmilyen igényt a MAFTRAVEL felé a tényleges és a becsült kiadások közötti eltérés miatt.',
        checkbox: 'Elolvastam a megállapodás összes feltételét, és teljes mértékben elfogadom azokat',
        accept: 'Folytatás',
        footnote: 'Az oldal további használatával elfogadja feltételeinket',
      },
      search: {
        trigger: 'Járatok keresése…', placeholder: 'Járatok, légitársaságok, útvonalak keresése…',
        hint: 'A kereséshez írjon be legalább 2 karaktert', noResults: 'Nincs találat erre:',
        navigate: 'Navigálás', openHint: 'Megnyitás', closeHint: 'Bezárás', resultsLabel: 'találat',
      },
      notify: {
        title: 'Kapjon értesítéseket az ajánlatokról 🎯', body: 'Elsőként értesüljön a villámakciókról és exkluzív ajánlatokról.',
        allow: 'Engedélyezés', notNow: 'Most nem',
      },
      toast: { dismiss: 'Bezárás' },
    },
  },

  /* ─────────────────────────── Danish ─────────────────────────── */
  da: {
    nav: {
      home: 'Hjem', planner: 'Planlægger', flights: 'Flyrejser', packages: 'Pakker',
      book: 'Book', adminPanel: 'Adminpanel', myProfile: 'Min profil',
      myBookings: 'Mine bookinger', signOut: 'Log ud', signIn: 'Log ind', register: 'Tilmeld',
      registerFree: 'Tilmeld gratis', berlin: 'Berlin-rejse', exotic: '🌍 Eksotiske rejser',
    },
    nav2: {
      whereToGo: '🧭 Hvor skal man tage hen', hotTours: '🔥 Populære rejser', myDashboard: 'Mit dashboard',
      myTripPlans: 'Mine rejseplaner', myWishlist: 'Favoritter', whereToGoFooter: 'Hvor skal man tage hen',
      tools: 'Værktøjer', termsOfUse: 'Brugsvilkår', privacyPolicy: 'Privatlivspolitik',
      cookiePolicy: 'Cookiepolitik',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Brugeraftale',
        warning: 'Læs venligst grundigt, inden du bruger tjenesten',
        s1Title: '1. Begrænsning af budgetansvar.',
        s1Body: 'Alle budgetestimater fra MAFTRAVEL-platformen er udelukkende vejledende og til information. Vi garanterer ikke, at dine faktiske udgifter vil svare til estimaterne. Priser på fly, hoteller, mad og underholdning kan ændre sig når som helst uden varsel.',
        s2Title: '2. Ingen finansielle garantier.',
        s2Body: 'MAFTRAVEL og dets personale er ikke ansvarlige for økonomiske tab, budgetoverskridelser, uplanlagte udgifter eller andre pengetab, der opstår ved brug af de leverede estimater.',
        s3Title: '3. Visumkrav.',
        s3Body: 'Visuminformation er kun vejledende. Vi anbefaler kraftigt, at du selv verificerer de aktuelle visumkrav hos ambassaden eller konsulatet i destinationslandet. MAFTRAVEL er ikke ansvarlig for afslag på visum eller indrejse.',
        s4Title: '4. Ændringer af vilkår.',
        s4Body: 'Alle ruter, priser og anbefalinger genereres automatisk baseret på AI og åbne datakilder. Tjenesten er ikke et rejsebureau og sælger ikke rejsetjenester direkte.',
        s5Title: '5. Ophavsret.',
        s5Body: 'Alt materiale på siden (tekster, design, kildekode) er beskyttet af ophavsret © 2025 MAFTRAVEL. Kopiering uden tilladelse er forbudt.',
        s6Title: '6. Brug af tjenesten.',
        s6Body: 'Ved at klikke på knappen «Fortsæt» bekræfter du, at du har læst, forstået og accepteret alle vilkår i denne aftale. Du bekræfter også, at du ikke vil rejse krav mod MAFTRAVEL vedrørende nogen forskel mellem faktiske og estimerede udgifter.',
        checkbox: 'Jeg har læst alle aftalens vilkår og accepterer dem fuldt ud',
        accept: 'Fortsæt',
        footnote: 'Ved fortsat brug af siden accepterer du vores vilkår',
      },
      search: {
        trigger: 'Søg flyrejser…', placeholder: 'Søg fly, flyselskaber, ruter…',
        hint: 'Skriv mindst 2 tegn for at søge', noResults: 'Ingen resultater for',
        navigate: 'Naviger', openHint: 'Åbn', closeHint: 'Luk', resultsLabel: 'resultater',
      },
      notify: {
        title: 'Få besked om tilbud 🎯', body: 'Vær den første til at høre om lynudsalg og eksklusive tilbud.',
        allow: 'Tillad', notNow: 'Ikke nu',
      },
      toast: { dismiss: 'Luk' },
    },
  },

  /* ─────────────────────────── Finnish ─────────────────────────── */
  fi: {
    nav: {
      home: 'Etusivu', planner: 'Suunnittelija', flights: 'Lennot', packages: 'Paketit',
      book: 'Varaa', adminPanel: 'Hallintapaneeli', myProfile: 'Profiilini',
      myBookings: 'Varaukseni', signOut: 'Kirjaudu ulos', signIn: 'Kirjaudu sisään', register: 'Rekisteröidy',
      registerFree: 'Rekisteröidy ilmaiseksi', berlin: 'Berliinin matka', exotic: '🌍 Eksoottiset matkat',
    },
    nav2: {
      whereToGo: '🧭 Minne mennä', hotTours: '🔥 Suositut matkat', myDashboard: 'Oma kojelautani',
      myTripPlans: 'Matkasuunnitelmani', myWishlist: 'Suosikit', whereToGoFooter: 'Minne mennä',
      tools: 'Työkalut', termsOfUse: 'Käyttöehdot', privacyPolicy: 'Tietosuojakäytäntö',
      cookiePolicy: 'Evästekäytäntö',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Käyttäjäsopimus',
        warning: 'Lue huolellisesti ennen palvelun käyttöä',
        s1Title: '1. Budjettivastuun rajoitus.',
        s1Body: 'Kaikki MAFTRAVEL-alustan tarjoamat budjettiarviot ovat ainoastaan ohjeellisia ja tiedoksi. Emme takaa, että todelliset kulusi vastaavat arvioita. Lentojen, hotellien, ruoan ja viihteen hinnat voivat muuttua milloin tahansa ilman ennakkoilmoitusta.',
        s2Title: '2. Ei taloudellisia takuita.',
        s2Body: 'MAFTRAVEL ja sen henkilökunta eivät ole vastuussa taloudellisista menetyksistä, budjetin ylityksistä, suunnittelemattomista kuluista tai muista rahallisista menetyksistä, jotka aiheutuvat tarjottujen arvioiden käytöstä.',
        s3Title: '3. Viisumivaatimukset.',
        s3Body: 'Viisumitiedot ovat vain viitteellisiä. Suosittelemme vahvasti, että tarkistat itse ajantasaiset viisumivaatimukset kohdemaan suurlähetystöstä tai konsulaatista. MAFTRAVEL ei ole vastuussa viisumin tai maahantulon epäämisestä.',
        s4Title: '4. Ehtojen muutokset.',
        s4Body: 'Kaikki reitit, hinnat ja suositukset luodaan automaattisesti tekoälyn ja avoimien tietolähteiden perusteella. Palvelu ei ole matkatoimisto eikä myy matkapalveluja suoraan.',
        s5Title: '5. Tekijänoikeus.',
        s5Body: 'Kaikki sivuston materiaali (tekstit, suunnittelu, lähdekoodi) on suojattu tekijänoikeudella © 2025 MAFTRAVEL. Kopiointi ilman lupaa on kielletty.',
        s6Title: '6. Palvelun käyttö.',
        s6Body: 'Napsauttamalla «Jatka»-painiketta vahvistat lukeneesi, ymmärtäneesi ja hyväksyväsi kaikki tämän sopimuksen ehdot. Vahvistat myös, ettet esitä MAFTRAVELille mitään vaatimuksia todellisten ja arvioitujen kulujen välisistä eroista.',
        checkbox: 'Olen lukenut kaikki sopimuksen ehdot ja hyväksyn ne täysin',
        accept: 'Jatka',
        footnote: 'Jatkamalla sivuston käyttöä hyväksyt ehtomme',
      },
      search: {
        trigger: 'Etsi lentoja…', placeholder: 'Etsi lentoja, lentoyhtiöitä, reittejä…',
        hint: 'Kirjoita vähintään 2 merkkiä hakeaksesi', noResults: 'Ei tuloksia haulle',
        navigate: 'Siirry', openHint: 'Avaa', closeHint: 'Sulje', resultsLabel: 'tulosta',
      },
      notify: {
        title: 'Saa ilmoituksia tarjouksista 🎯', body: 'Ole ensimmäinen, joka kuulee pikamyynneistä ja eksklusiivisista tarjouksista.',
        allow: 'Salli', notNow: 'Ei nyt',
      },
      toast: { dismiss: 'Sulje' },
    },
  },

  /* ─────────────────────────── Slovak ─────────────────────────── */
  sk: {
    nav: {
      home: 'Domov', planner: 'Plánovač', flights: 'Lety', packages: 'Balíky',
      book: 'Rezervovať', adminPanel: 'Panel administrátora', myProfile: 'Môj profil',
      myBookings: 'Moje rezervácie', signOut: 'Odhlásiť sa', signIn: 'Prihlásiť sa', register: 'Registrovať sa',
      registerFree: 'Registrácia zdarma', berlin: 'Výlet do Berlína', exotic: '🌍 Exotické zájazdy',
    },
    nav2: {
      whereToGo: '🧭 Kam ísť', hotTours: '🔥 Žhavé zájazdy', myDashboard: 'Môj prehľad',
      myTripPlans: 'Moje cestovné plány', myWishlist: 'Obľúbené', whereToGoFooter: 'Kam ísť',
      tools: 'Nástroje', termsOfUse: 'Podmienky používania', privacyPolicy: 'Zásady ochrany osobných údajov',
      cookiePolicy: 'Zásady súborov cookie',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Používateľská zmluva',
        warning: 'Pred použitím služby si prosím pozorne prečítajte',
        s1Title: '1. Obmedzenie zodpovednosti za rozpočet.',
        s1Body: 'Všetky odhady rozpočtu poskytované platformou MAFTRAVEL slúžia len na orientáciu a informáciu. Nezaručujeme, že vaše skutočné výdavky budú zodpovedať odhadom. Ceny letov, hotelov, jedla a zábavy sa môžu kedykoľvek zmeniť bez upozornenia.',
        s2Title: '2. Žiadne finančné záruky.',
        s2Body: 'MAFTRAVEL a jeho zamestnanci nenesú zodpovednosť za žiadne finančné straty, prekročenie rozpočtu, neplánované výdavky alebo iné peňažné straty vyplývajúce z použitia poskytnutých odhadov.',
        s3Title: '3. Vízové požiadavky.',
        s3Body: 'Informácie o vízach sú len orientačné. Dôrazne odporúčame, aby ste si aktuálne vízové požiadavky sami overili na veľvyslanectve alebo konzuláte cieľovej krajiny. MAFTRAVEL nenesie zodpovednosť za zamietnutie víza alebo vstupu.',
        s4Title: '4. Zmeny podmienok.',
        s4Body: 'Všetky trasy, ceny a odporúčania sú generované automaticky na základe umelej inteligencie a otvorených zdrojov údajov. Služba nie je cestovná kancelária a nepredáva cestovné služby priamo.',
        s5Title: '5. Autorské práva.',
        s5Body: 'Všetok obsah stránky (texty, dizajn, zdrojový kód) je chránený autorským právom © 2025 MAFTRAVEL. Kopírovanie bez povolenia je zakázané.',
        s6Title: '6. Používanie služby.',
        s6Body: 'Kliknutím na tlačidlo «Pokračovať» potvrdzujete, že ste si prečítali, pochopili a súhlasíte so všetkými podmienkami tejto zmluvy. Tiež potvrdzujete, že nebudete voči MAFTRAVEL vznášať žiadne nároky týkajúce sa akéhokoľvek rozdielu medzi skutočnými a odhadovanými výdavkami.',
        checkbox: 'Prečítal som si všetky podmienky zmluvy a plne ich prijímam',
        accept: 'Pokračovať',
        footnote: 'Pokračovaním v používaní stránky súhlasíte s našimi podmienkami',
      },
      search: {
        trigger: 'Hľadať lety…', placeholder: 'Hľadať lety, letecké spoločnosti, trasy…',
        hint: 'Pre vyhľadávanie zadajte aspoň 2 znaky', noResults: 'Žiadne výsledky pre',
        navigate: 'Navigovať', openHint: 'Otvoriť', closeHint: 'Zavrieť', resultsLabel: 'výsledkov',
      },
      notify: {
        title: 'Dostávajte upozornenia na ponuky 🎯', body: 'Buďte prví, kto sa dozvie o bleskových výpredajoch a exkluzívnych ponukách.',
        allow: 'Povoliť', notNow: 'Teraz nie',
      },
      toast: { dismiss: 'Zavrieť' },
    },
  },

  /* ─────────────────────────── Croatian ─────────────────────────── */
  hr: {
    nav: {
      home: 'Početna', planner: 'Planer', flights: 'Letovi', packages: 'Paketi',
      book: 'Rezerviraj', adminPanel: 'Admin ploča', myProfile: 'Moj profil',
      myBookings: 'Moje rezervacije', signOut: 'Odjava', signIn: 'Prijava', register: 'Registracija',
      registerFree: 'Besplatna registracija', berlin: 'Putovanje u Berlin', exotic: '🌍 Egzotični aranžmani',
    },
    nav2: {
      whereToGo: '🧭 Kamo ići', hotTours: '🔥 Popularni aranžmani', myDashboard: 'Moja nadzorna ploča',
      myTripPlans: 'Moji planovi putovanja', myWishlist: 'Favoriti', whereToGoFooter: 'Kamo ići',
      tools: 'Alati', termsOfUse: 'Uvjeti korištenja', privacyPolicy: 'Pravila privatnosti',
      cookiePolicy: 'Pravila o kolačićima',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Korisnički ugovor',
        warning: 'Molimo pažljivo pročitajte prije korištenja usluge',
        s1Title: '1. Ograničenje odgovornosti za proračun.',
        s1Body: 'Sve procjene proračuna koje pruža platforma MAFTRAVEL služe isključivo kao smjernica i informacija. Ne jamčimo da će vaši stvarni troškovi odgovarati procjenama. Cijene letova, hotela, hrane i zabave mogu se promijeniti u bilo kojem trenutku bez najave.',
        s2Title: '2. Bez financijskih jamstava.',
        s2Body: 'MAFTRAVEL i njegovo osoblje nisu odgovorni za bilo kakve financijske gubitke, prekoračenja proračuna, neplanirane troškove ili druge novčane gubitke koji proizlaze iz korištenja pruženih procjena.',
        s3Title: '3. Zahtjevi za vizu.',
        s3Body: 'Informacije o vizama služe samo kao referenca. Snažno preporučujemo da sami provjerite aktualne zahtjeve za vizu u veleposlanstvu ili konzulatu odredišne zemlje. MAFTRAVEL nije odgovoran za odbijanje vize ili ulaska.',
        s4Title: '4. Izmjene uvjeta.',
        s4Body: 'Sve rute, cijene i preporuke generiraju se automatski na temelju umjetne inteligencije i otvorenih izvora podataka. Usluga nije putnička agencija i ne prodaje putničke usluge izravno.',
        s5Title: '5. Autorska prava.',
        s5Body: 'Sav materijal stranice (tekstovi, dizajn, izvorni kod) zaštićen je autorskim pravima © 2025 MAFTRAVEL. Kopiranje bez dopuštenja je zabranjeno.',
        s6Title: '6. Korištenje usluge.',
        s6Body: 'Klikom na gumb «Nastavi» potvrđujete da ste pročitali, razumjeli i prihvatili sve uvjete ovog ugovora. Također potvrđujete da nećete podnositi nikakve zahtjeve prema MAFTRAVEL-u u vezi s bilo kakvim odstupanjem između stvarnih i procijenjenih troškova.',
        checkbox: 'Pročitao sam sve uvjete ugovora i u potpunosti ih prihvaćam',
        accept: 'Nastavi',
        footnote: 'Nastavljanjem korištenja stranice prihvaćate naše uvjete',
      },
      search: {
        trigger: 'Traži letove…', placeholder: 'Traži letove, zrakoplovne kompanije, rute…',
        hint: 'Unesite najmanje 2 znaka za pretraživanje', noResults: 'Nema rezultata za',
        navigate: 'Navigiraj', openHint: 'Otvori', closeHint: 'Zatvori', resultsLabel: 'rezultata',
      },
      notify: {
        title: 'Primajte obavijesti o ponudama 🎯', body: 'Budite prvi koji će saznati za brze rasprodaje i ekskluzivne ponude.',
        allow: 'Dopusti', notNow: 'Ne sada',
      },
      toast: { dismiss: 'Zatvori' },
    },
  },

  /* ─────────────────────────── Serbian ─────────────────────────── */
  sr: {
    nav: {
      home: 'Почетна', planner: 'Планер', flights: 'Летови', packages: 'Пакети',
      book: 'Резервиши', adminPanel: 'Админ панел', myProfile: 'Мој профил',
      myBookings: 'Моје резервације', signOut: 'Одјава', signIn: 'Пријава', register: 'Регистрација',
      registerFree: 'Бесплатна регистрација', berlin: 'Путовање у Берлин', exotic: '🌍 Егзотични аранжмани',
    },
    nav2: {
      whereToGo: '🧭 Куда ићи', hotTours: '🔥 Популарни аранжмани', myDashboard: 'Моја контролна табла',
      myTripPlans: 'Моји планови путовања', myWishlist: 'Омиљено', whereToGoFooter: 'Куда ићи',
      tools: 'Алати', termsOfUse: 'Услови коришћења', privacyPolicy: 'Политика приватности',
      cookiePolicy: 'Политика колачића',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Кориснички уговор',
        warning: 'Молимо вас да пажљиво прочитате пре коришћења услуге',
        s1Title: '1. Ограничење одговорности за буџет.',
        s1Body: 'Све процене буџета које пружа платформа MAFTRAVEL служе искључиво као смерница и информација. Не гарантујемо да ће ваши стварни трошкови одговарати проценама. Цене летова, хотела, хране и забаве могу се променити у било ком тренутку без најаве.',
        s2Title: '2. Без финансијских гаранција.',
        s2Body: 'MAFTRAVEL и његово особље нису одговорни за било какве финансијске губитке, прекорачења буџета, непланиране трошкове или друге новчане губитке који проистичу из коришћења пружених процена.',
        s3Title: '3. Захтеви за визу.',
        s3Body: 'Информације о визама служе само као референца. Снажно препоручујемо да сами проверите актуелне захтеве за визу у амбасади или конзулату одредишне земље. MAFTRAVEL није одговоран за одбијање визе или уласка.',
        s4Title: '4. Измене услова.',
        s4Body: 'Све руте, цене и препоруке генеришу се аутоматски на основу вештачке интелигенције и отворених извора података. Услуга није туристичка агенција и не продаје туристичке услуге директно.',
        s5Title: '5. Ауторска права.',
        s5Body: 'Сав материјал сајта (текстови, дизајн, изворни код) заштићен је ауторским правима © 2025 MAFTRAVEL. Копирање без дозволе је забрањено.',
        s6Title: '6. Коришћење услуге.',
        s6Body: 'Кликом на дугме «Настави» потврђујете да сте прочитали, разумели и прихватили све услове овог уговора. Такође потврђујете да нећете подносити никакве захтеве према MAFTRAVEL-у у вези са било каквим одступањем између стварних и процењених трошкова.',
        checkbox: 'Прочитао сам све услове уговора и у потпуности их прихватам',
        accept: 'Настави',
        footnote: 'Настављањем коришћења сајта прихватате наше услове',
      },
      search: {
        trigger: 'Претражи летове…', placeholder: 'Претражи летове, авио-компаније, руте…',
        hint: 'Унесите најмање 2 знака за претрагу', noResults: 'Нема резултата за',
        navigate: 'Навигација', openHint: 'Отвори', closeHint: 'Затвори', resultsLabel: 'резултата',
      },
      notify: {
        title: 'Примајте обавештења о понудама 🎯', body: 'Будите први који ће сазнати за брзе распродаје и ексклузивне понуде.',
        allow: 'Дозволи', notNow: 'Не сада',
      },
      toast: { dismiss: 'Затвори' },
    },
  },

  /* ─────────────────────────── Norwegian ─────────────────────────── */
  no: {
    nav: {
      home: 'Hjem', planner: 'Planlegger', flights: 'Flyreiser', packages: 'Pakker',
      book: 'Bestill', adminPanel: 'Adminpanel', myProfile: 'Min profil',
      myBookings: 'Mine bestillinger', signOut: 'Logg ut', signIn: 'Logg inn', register: 'Registrer',
      registerFree: 'Registrer gratis', berlin: 'Berlin-tur', exotic: '🌍 Eksotiske reiser',
    },
    nav2: {
      whereToGo: '🧭 Hvor skal man dra', hotTours: '🔥 Populære reiser', myDashboard: 'Mitt dashbord',
      myTripPlans: 'Mine reiseplaner', myWishlist: 'Favoritter', whereToGoFooter: 'Hvor skal man dra',
      tools: 'Verktøy', termsOfUse: 'Brukervilkår', privacyPolicy: 'Personvernerklæring',
      cookiePolicy: 'Retningslinjer for informasjonskapsler',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Brukeravtale',
        warning: 'Vennligst les nøye før du bruker tjenesten',
        s1Title: '1. Begrensning av budsjettansvar.',
        s1Body: 'Alle budsjettanslag fra MAFTRAVEL-plattformen er kun ment som veiledning og informasjon. Vi garanterer ikke at dine faktiske utgifter vil samsvare med anslagene. Priser på fly, hoteller, mat og underholdning kan endres når som helst uten varsel.',
        s2Title: '2. Ingen økonomiske garantier.',
        s2Body: 'MAFTRAVEL og deres personale er ikke ansvarlige for økonomiske tap, budsjettoverskridelser, uplanlagte utgifter eller andre pengetap som oppstår ved bruk av de oppgitte anslagene.',
        s3Title: '3. Visumkrav.',
        s3Body: 'Visuminformasjon er kun veiledende. Vi anbefaler sterkt at du selv verifiserer de gjeldende visumkravene hos ambassaden eller konsulatet i destinasjonslandet. MAFTRAVEL er ikke ansvarlig for avslag på visum eller innreise.',
        s4Title: '4. Endringer i vilkår.',
        s4Body: 'Alle ruter, priser og anbefalinger genereres automatisk basert på KI og åpne datakilder. Tjenesten er ikke et reisebyrå og selger ikke reisetjenester direkte.',
        s5Title: '5. Opphavsrett.',
        s5Body: 'Alt materiale på nettstedet (tekster, design, kildekode) er beskyttet av opphavsrett © 2025 MAFTRAVEL. Kopiering uten tillatelse er forbudt.',
        s6Title: '6. Bruk av tjenesten.',
        s6Body: 'Ved å klikke på «Fortsett»-knappen bekrefter du at du har lest, forstått og godtatt alle vilkårene i denne avtalen. Du bekrefter også at du ikke vil fremme krav mot MAFTRAVEL angående eventuelle avvik mellom faktiske og estimerte utgifter.',
        checkbox: 'Jeg har lest alle vilkårene i avtalen og godtar dem fullt ut',
        accept: 'Fortsett',
        footnote: 'Ved å fortsette å bruke nettstedet godtar du våre vilkår',
      },
      search: {
        trigger: 'Søk flyreiser…', placeholder: 'Søk flyreiser, flyselskaper, ruter…',
        hint: 'Skriv minst 2 tegn for å søke', noResults: 'Ingen resultater for',
        navigate: 'Naviger', openHint: 'Åpne', closeHint: 'Lukk', resultsLabel: 'resultater',
      },
      notify: {
        title: 'Få varsler om tilbud 🎯', body: 'Vær først ute med å høre om lynsalg og eksklusive tilbud.',
        allow: 'Tillat', notNow: 'Ikke nå',
      },
      toast: { dismiss: 'Lukk' },
    },
  },

  /* ─────────────────────────── Bulgarian ─────────────────────────── */
  bg: {
    nav: {
      home: 'Начало', planner: 'Планер', flights: 'Полети', packages: 'Пакети',
      book: 'Резервирай', adminPanel: 'Админ панел', myProfile: 'Моят профил',
      myBookings: 'Моите резервации', signOut: 'Изход', signIn: 'Вход', register: 'Регистрация',
      registerFree: 'Безплатна регистрация', berlin: 'Пътуване до Берлин', exotic: '🌍 Екзотични турове',
    },
    nav2: {
      whereToGo: '🧭 Накъде да тръгнете', hotTours: '🔥 Горещи оферти', myDashboard: 'Моето табло',
      myTripPlans: 'Моите планове за пътуване', myWishlist: 'Любими', whereToGoFooter: 'Накъде да тръгнете',
      tools: 'Инструменти', termsOfUse: 'Условия за ползване', privacyPolicy: 'Политика за поверителност',
      cookiePolicy: 'Политика за бисквитки',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Потребителско споразумение',
        warning: 'Моля, прочетете внимателно, преди да използвате услугата',
        s1Title: '1. Ограничаване на отговорността за бюджета.',
        s1Body: 'Всички бюджетни оценки, предоставени от платформата MAFTRAVEL, са единствено с ориентировъчен и информационен характер. Не гарантираме, че реалните ви разходи ще съвпаднат с оценките. Цените на полети, хотели, храна и развлечения могат да се променят по всяко време без предупреждение.',
        s2Title: '2. Без финансови гаранции.',
        s2Body: 'MAFTRAVEL и неговите служители не носят отговорност за каквито и да е финансови загуби, превишаване на бюджета, непланирани разходи или други парични загуби, произтичащи от използването на предоставените оценки.',
        s3Title: '3. Визови изисквания.',
        s3Body: 'Информацията за визите е само за справка. Силно препоръчваме сами да проверите актуалните визови изисквания в посолството или консулството на страната на местоназначение. MAFTRAVEL не носи отговорност за отказ на виза или влизане.',
        s4Title: '4. Промени в условията.',
        s4Body: 'Всички маршрути, цени и препоръки се генерират автоматично въз основа на ИИ и отворени източници на данни. Услугата не е туристическа агенция и не продава туристически услуги директно.',
        s5Title: '5. Авторски права.',
        s5Body: 'Всички материали на сайта (текстове, дизайн, изходен код) са защитени с авторски права © 2025 MAFTRAVEL. Копирането без разрешение е забранено.',
        s6Title: '6. Използване на услугата.',
        s6Body: 'С натискане на бутона «Продължи» потвърждавате, че сте прочели, разбрали и приели всички условия на това споразумение. Също така потвърждавате, че няма да предявявате претенции към MAFTRAVEL относно каквото и да е разминаване между реалните и прогнозните разходи.',
        checkbox: 'Прочетох всички условия на споразумението и ги приемам изцяло',
        accept: 'Продължи',
        footnote: 'Продължавайки да използвате сайта, вие приемате нашите условия',
      },
      search: {
        trigger: 'Търсене на полети…', placeholder: 'Търсене на полети, авиокомпании, маршрути…',
        hint: 'Въведете поне 2 символа за търсене', noResults: 'Няма резултати за',
        navigate: 'Навигация', openHint: 'Отвори', closeHint: 'Затвори', resultsLabel: 'резултата',
      },
      notify: {
        title: 'Получавайте известия за оферти 🎯', body: 'Бъдете първите, които научават за светкавични разпродажби и ексклузивни оферти.',
        allow: 'Разреши', notNow: 'Не сега',
      },
      toast: { dismiss: 'Затвори' },
    },
  },

  /* ─────────────────────────── Malay ─────────────────────────── */
  ms: {
    nav: {
      home: 'Utama', planner: 'Perancang', flights: 'Penerbangan', packages: 'Pakej',
      book: 'Tempah', adminPanel: 'Panel admin', myProfile: 'Profil saya',
      myBookings: 'Tempahan saya', signOut: 'Log keluar', signIn: 'Log masuk', register: 'Daftar',
      registerFree: 'Daftar percuma', berlin: 'Perjalanan Berlin', exotic: '🌍 Pelancongan eksotik',
    },
    nav2: {
      whereToGo: '🧭 Ke mana', hotTours: '🔥 Pakej popular', myDashboard: 'Papan pemuka saya',
      myTripPlans: 'Rancangan perjalanan saya', myWishlist: 'Kegemaran', whereToGoFooter: 'Ke mana',
      tools: 'Alat', termsOfUse: 'Terma penggunaan', privacyPolicy: 'Dasar privasi',
      cookiePolicy: 'Dasar kuki',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Perjanjian pengguna',
        warning: 'Sila baca dengan teliti sebelum menggunakan perkhidmatan',
        s1Title: '1. Had liabiliti bajet.',
        s1Body: 'Semua anggaran bajet yang disediakan oleh platform MAFTRAVEL adalah untuk panduan dan maklumat sahaja. Kami tidak menjamin bahawa perbelanjaan sebenar anda akan sepadan dengan anggaran. Harga penerbangan, hotel, makanan dan hiburan boleh berubah pada bila-bila masa tanpa notis.',
        s2Title: '2. Tiada jaminan kewangan.',
        s2Body: 'MAFTRAVEL dan kakitangannya tidak bertanggungjawab atas sebarang kerugian kewangan, lebihan bajet, perbelanjaan tidak dirancang atau kerugian wang lain yang timbul daripada penggunaan anggaran yang disediakan.',
        s3Title: '3. Keperluan visa.',
        s3Body: 'Maklumat visa adalah untuk rujukan sahaja. Kami amat menggalakkan anda mengesahkan sendiri keperluan visa semasa di kedutaan atau konsulat negara destinasi. MAFTRAVEL tidak bertanggungjawab atas penolakan visa atau kemasukan.',
        s4Title: '4. Perubahan terma.',
        s4Body: 'Semua laluan, harga dan cadangan dijana secara automatik berdasarkan AI dan sumber data terbuka. Perkhidmatan ini bukan agensi pelancongan dan tidak menjual perkhidmatan perjalanan secara langsung.',
        s5Title: '5. Hak cipta.',
        s5Body: 'Semua bahan tapak (teks, reka bentuk, kod sumber) dilindungi oleh hak cipta © 2025 MAFTRAVEL. Penyalinan tanpa kebenaran adalah dilarang.',
        s6Title: '6. Penggunaan perkhidmatan.',
        s6Body: 'Dengan mengklik butang «Teruskan», anda mengesahkan bahawa anda telah membaca, memahami dan bersetuju dengan semua terma perjanjian ini. Anda juga mengesahkan bahawa anda tidak akan membuat sebarang tuntutan terhadap MAFTRAVEL berkenaan sebarang perbezaan antara perbelanjaan sebenar dan anggaran.',
        checkbox: 'Saya telah membaca semua terma perjanjian dan menerimanya sepenuhnya',
        accept: 'Teruskan',
        footnote: 'Dengan terus menggunakan tapak ini, anda bersetuju dengan terma kami',
      },
      search: {
        trigger: 'Cari penerbangan…', placeholder: 'Cari penerbangan, syarikat penerbangan, laluan…',
        hint: 'Taip sekurang-kurangnya 2 aksara untuk mencari', noResults: 'Tiada hasil untuk',
        navigate: 'Navigasi', openHint: 'Buka', closeHint: 'Tutup', resultsLabel: 'hasil',
      },
      notify: {
        title: 'Dapatkan pemberitahuan tawaran 🎯', body: 'Jadilah yang pertama mengetahui tentang jualan kilat dan tawaran eksklusif.',
        allow: 'Benarkan', notNow: 'Bukan sekarang',
      },
      toast: { dismiss: 'Tutup' },
    },
  },

  /* ─────────────────────────── Lithuanian ─────────────────────────── */
  lt: {
    nav: {
      home: 'Pradžia', planner: 'Planuoklis', flights: 'Skrydžiai', packages: 'Paketai',
      book: 'Rezervuoti', adminPanel: 'Administratoriaus skydelis', myProfile: 'Mano profilis',
      myBookings: 'Mano rezervacijos', signOut: 'Atsijungti', signIn: 'Prisijungti', register: 'Registruotis',
      registerFree: 'Nemokama registracija', berlin: 'Kelionė į Berlyną', exotic: '🌍 Egzotiškos kelionės',
    },
    nav2: {
      whereToGo: '🧭 Kur vykti', hotTours: '🔥 Populiarios kelionės', myDashboard: 'Mano skydelis',
      myTripPlans: 'Mano kelionių planai', myWishlist: 'Mėgstami', whereToGoFooter: 'Kur vykti',
      tools: 'Įrankiai', termsOfUse: 'Naudojimo sąlygos', privacyPolicy: 'Privatumo politika',
      cookiePolicy: 'Slapukų politika',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Naudotojo sutartis',
        warning: 'Prieš naudodamiesi paslauga, atidžiai perskaitykite',
        s1Title: '1. Biudžeto atsakomybės apribojimas.',
        s1Body: 'Visi MAFTRAVEL platformos pateikti biudžeto įverčiai skirti tik orientavimui ir informacijai. Negarantuojame, kad jūsų faktinės išlaidos atitiks įverčius. Skrydžių, viešbučių, maisto ir pramogų kainos gali keistis bet kuriuo metu be įspėjimo.',
        s2Title: '2. Jokių finansinių garantijų.',
        s2Body: 'MAFTRAVEL ir jos darbuotojai neatsako už jokius finansinius nuostolius, biudžeto viršijimą, neplanuotas išlaidas ar kitus piniginius nuostolius, atsiradusius dėl pateiktų įverčių naudojimo.',
        s3Title: '3. Vizos reikalavimai.',
        s3Body: 'Informacija apie vizas pateikiama tik kaip nuoroda. Primygtinai rekomenduojame patiems pasitikrinti dabartinius vizos reikalavimus paskirties šalies ambasadoje arba konsulate. MAFTRAVEL neatsako už atsisakymą išduoti vizą ar įleisti.',
        s4Title: '4. Sąlygų pakeitimai.',
        s4Body: 'Visi maršrutai, kainos ir rekomendacijos generuojami automatiškai remiantis DI ir atvirais duomenų šaltiniais. Paslauga nėra kelionių agentūra ir neparduoda kelionių paslaugų tiesiogiai.',
        s5Title: '5. Autorių teisės.',
        s5Body: 'Visa svetainės medžiaga (tekstai, dizainas, šaltinio kodas) saugoma autorių teisių © 2025 MAFTRAVEL. Kopijuoti be leidimo draudžiama.',
        s6Title: '6. Paslaugos naudojimas.',
        s6Body: 'Spustelėdami mygtuką «Tęsti», patvirtinate, kad perskaitėte, supratote ir sutinkate su visomis šios sutarties sąlygomis. Taip pat patvirtinate, kad nereikšite jokių pretenzijų MAFTRAVEL dėl bet kokio skirtumo tarp faktinių ir numatytų išlaidų.',
        checkbox: 'Perskaičiau visas sutarties sąlygas ir visiškai jas priimu',
        accept: 'Tęsti',
        footnote: 'Toliau naudodamiesi svetaine sutinkate su mūsų sąlygomis',
      },
      search: {
        trigger: 'Ieškoti skrydžių…', placeholder: 'Ieškoti skrydžių, oro linijų, maršrutų…',
        hint: 'Norėdami ieškoti, įveskite bent 2 simbolius', noResults: 'Nėra rezultatų pagal',
        navigate: 'Naršyti', openHint: 'Atidaryti', closeHint: 'Uždaryti', resultsLabel: 'rezultatų',
      },
      notify: {
        title: 'Gaukite pranešimus apie pasiūlymus 🎯', body: 'Pirmieji sužinokite apie žaibiškus išpardavimus ir išskirtinius pasiūlymus.',
        allow: 'Leisti', notNow: 'Ne dabar',
      },
      toast: { dismiss: 'Uždaryti' },
    },
  },

  /* ─────────────────────────── Slovenian ─────────────────────────── */
  sl: {
    nav: {
      home: 'Domov', planner: 'Načrtovalnik', flights: 'Leti', packages: 'Paketi',
      book: 'Rezerviraj', adminPanel: 'Skrbniška plošča', myProfile: 'Moj profil',
      myBookings: 'Moje rezervacije', signOut: 'Odjava', signIn: 'Prijava', register: 'Registracija',
      registerFree: 'Brezplačna registracija', berlin: 'Potovanje v Berlin', exotic: '🌍 Eksotična potovanja',
    },
    nav2: {
      whereToGo: '🧭 Kam iti', hotTours: '🔥 Priljubljena potovanja', myDashboard: 'Moja nadzorna plošča',
      myTripPlans: 'Moji načrti potovanj', myWishlist: 'Priljubljene', whereToGoFooter: 'Kam iti',
      tools: 'Orodja', termsOfUse: 'Pogoji uporabe', privacyPolicy: 'Pravilnik o zasebnosti',
      cookiePolicy: 'Pravilnik o piškotkih',
    },
    ui: {
      disclaimer: {
        eyebrow: 'Uporabniška pogodba',
        warning: 'Pred uporabo storitve natančno preberite',
        s1Title: '1. Omejitev odgovornosti za proračun.',
        s1Body: 'Vse proračunske ocene, ki jih ponuja platforma MAFTRAVEL, so namenjene zgolj usmerjanju in obveščanju. Ne jamčimo, da bodo vaši dejanski stroški ustrezali ocenam. Cene letov, hotelov, hrane in zabave se lahko kadar koli spremenijo brez predhodnega obvestila.',
        s2Title: '2. Brez finančnih jamstev.',
        s2Body: 'MAFTRAVEL in njegovo osebje niso odgovorni za kakršne koli finančne izgube, prekoračitve proračuna, nenačrtovane stroške ali druge denarne izgube, ki nastanejo zaradi uporabe ponujenih ocen.',
        s3Title: '3. Vizumske zahteve.',
        s3Body: 'Informacije o vizumih so zgolj informativne narave. Močno priporočamo, da sami preverite trenutne vizumske zahteve na veleposlaništvu ali konzulatu ciljne države. MAFTRAVEL ni odgovoren za zavrnitev vizuma ali vstopa.',
        s4Title: '4. Spremembe pogojev.',
        s4Body: 'Vse poti, cene in priporočila se ustvarijo samodejno na podlagi umetne inteligence in odprtih virov podatkov. Storitev ni potovalna agencija in ne prodaja potovalnih storitev neposredno.',
        s5Title: '5. Avtorske pravice.',
        s5Body: 'Vsa gradiva spletnega mesta (besedila, oblikovanje, izvorna koda) so zaščitena z avtorskimi pravicami © 2025 MAFTRAVEL. Kopiranje brez dovoljenja je prepovedano.',
        s6Title: '6. Uporaba storitve.',
        s6Body: 'S klikom na gumb «Nadaljuj» potrjujete, da ste prebrali, razumeli in se strinjate z vsemi pogoji te pogodbe. Prav tako potrjujete, da do podjetja MAFTRAVEL ne boste vlagali nobenih zahtevkov glede kakršnega koli odstopanja med dejanskimi in ocenjenimi stroški.',
        checkbox: 'Prebral sem vse pogoje pogodbe in jih v celoti sprejemam',
        accept: 'Nadaljuj',
        footnote: 'Z nadaljnjo uporabo spletnega mesta se strinjate z našimi pogoji',
      },
      search: {
        trigger: 'Iskanje letov…', placeholder: 'Iščite lete, letalske družbe, poti…',
        hint: 'Za iskanje vnesite vsaj 2 znaka', noResults: 'Ni rezultatov za',
        navigate: 'Krmari', openHint: 'Odpri', closeHint: 'Zapri', resultsLabel: 'rezultatov',
      },
      notify: {
        title: 'Prejemajte obvestila o ponudbah 🎯', body: 'Bodite prvi, ki boste izvedeli za bliskovite razprodaje in ekskluzivne ponudbe.',
        allow: 'Dovoli', notNow: 'Ne zdaj',
      },
      toast: { dismiss: 'Zapri' },
    },
  },

  /* ─────────────────────────── Azerbaijani ─────────────────────────── */
  az: {
    nav: {
      home: 'Ana səhifə', planner: 'Planlaşdırıcı', flights: 'Uçuşlar', packages: 'Paketlər',
      book: 'Rezerv et', adminPanel: 'Admin paneli', myProfile: 'Profilim',
      myBookings: 'Rezervlərim', signOut: 'Çıxış', signIn: 'Daxil ol', register: 'Qeydiyyat',
      registerFree: 'Pulsuz qeydiyyat', berlin: 'Berlin səyahəti', exotic: '🌍 Ekzotik turlar',
    },
    nav2: {
      whereToGo: '🧭 Hara getmək', hotTours: '🔥 Populyar turlar', myDashboard: 'İdarə panelim',
      myTripPlans: 'Səyahət planlarım', myWishlist: 'Sevimlilər', whereToGoFooter: 'Hara getmək',
      tools: 'Alətlər', termsOfUse: 'İstifadə şərtləri', privacyPolicy: 'Məxfilik siyasəti',
      cookiePolicy: 'Kuki siyasəti',
    },
    ui: {
      disclaimer: {
        eyebrow: 'İstifadəçi müqaviləsi',
        warning: 'Xidmətdən istifadə etməzdən əvvəl diqqətlə oxuyun',
        s1Title: '1. Büdcə üzrə məsuliyyətin məhdudlaşdırılması.',
        s1Body: 'MAFTRAVEL platformasının təqdim etdiyi bütün büdcə təxminləri yalnız istiqamətləndirmə və məlumat xarakteri daşıyır. Faktiki xərclərinizin təxminlərlə uyğunlaşacağına zəmanət vermirik. Uçuş, otel, yemək və əyləncə qiymətləri istənilən vaxt xəbərdarlıq edilmədən dəyişə bilər.',
        s2Title: '2. Maliyyə zəmanəti yoxdur.',
        s2Body: 'MAFTRAVEL və onun əməkdaşları təqdim olunan təxminlərdən istifadə nəticəsində yaranan hər hansı maliyyə itkisi, büdcənin aşılması, planlaşdırılmamış xərclər və ya digər pul itkilərinə görə məsuliyyət daşımır.',
        s3Title: '3. Viza tələbləri.',
        s3Body: 'Viza haqqında məlumat yalnız istinad üçündür. Təyinat ölkəsinin səfirliyi və ya konsulluğunda cari viza tələblərini özünüz yoxlamağı qətiyyətlə tövsiyə edirik. MAFTRAVEL vizadan və ya girişdən imtinaya görə məsuliyyət daşımır.',
        s4Title: '4. Şərtlərin dəyişdirilməsi.',
        s4Body: 'Bütün marşrutlar, qiymətlər və tövsiyələr süni intellekt və açıq məlumat mənbələri əsasında avtomatik yaradılır. Xidmət səyahət agentliyi deyil və səyahət xidmətlərini birbaşa satmır.',
        s5Title: '5. Müəllif hüquqları.',
        s5Body: 'Saytın bütün materialları (mətnlər, dizayn, mənbə kodu) müəllif hüquqları ilə qorunur © 2025 MAFTRAVEL. İcazəsiz kopyalama qadağandır.',
        s6Title: '6. Xidmətdən istifadə.',
        s6Body: '«Davam et» düyməsini klikləməklə siz bu müqavilənin bütün şərtlərini oxuduğunuzu, başa düşdüyünüzü və qəbul etdiyinizi təsdiqləyirsiniz. Həmçinin faktiki və təxmini xərclər arasındakı hər hansı fərqlə bağlı MAFTRAVEL-ə qarşı heç bir iddia irəli sürməyəcəyinizi təsdiqləyirsiniz.',
        checkbox: 'Müqavilənin bütün şərtlərini oxudum və tam qəbul edirəm',
        accept: 'Davam et',
        footnote: 'Saytdan istifadəyə davam etməklə şərtlərimizlə razılaşırsınız',
      },
      search: {
        trigger: 'Uçuş axtar…', placeholder: 'Uçuşlar, aviaşirkətlər, marşrutlar axtarın…',
        hint: 'Axtarış üçün ən azı 2 simvol daxil edin', noResults: 'Nəticə tapılmadı:',
        navigate: 'Naviqasiya', openHint: 'Aç', closeHint: 'Bağla', resultsLabel: 'nəticə',
      },
      notify: {
        title: 'Təkliflər barədə bildiriş alın 🎯', body: 'Sürətli endirimlər və eksklüziv təkliflər barədə ilk öyrənən siz olun.',
        allow: 'İcazə ver', notNow: 'İndi yox',
      },
      toast: { dismiss: 'Bağla' },
    },
  },
};
