/**
 * ============================================================================
 *  ALLE INHALTE DER HOCHZEITSWEBSITE
 * ============================================================================
 *
 *  Diese Datei ist die einzige Stelle, an der ihr Texte, Zeiten, Orte usw.
 *  anpassen müsst. Alles, was mit "PLATZHALTER" markiert ist, bitte ersetzen.
 *
 *  Tipps:
 *  - Absätze in längeren Texten trennt ihr mit einer Leerzeile ("\n\n").
 *  - Listen (z. B. Hotels, FAQ) könnt ihr beliebig verlängern oder kürzen.
 *  - Ist eine Liste leer (z. B. `items: []`), wird die Sektion ausgeblendet.
 *  - Zeitpunkte immer mit Zeitzone angeben, z. B. "2027-06-19T14:00:00+02:00"
 *    (+02:00 = Sommerzeit, +01:00 = Winterzeit).
 *  - Reine Datumsangaben im Format "JJJJ-MM-TT", z. B. "2027-04-30".
 *
 *  Gästecode und Admin-Passwort stehen NICHT hier, sondern in den
 *  Umgebungsvariablen (siehe README.md).
 * ============================================================================
 */

/** Verfügbare Icons (siehe src/components/icons/Icon.tsx). */
export const ICON_NAMES = [
  'menu',
  'close',
  'arrow-right',
  'chevron-down',
  'external',
  'copy',
  'check',
  'x',
  'alert',
  'info',
  'phone',
  'mail',
  'chat',
  'calendar',
  'calendar-plus',
  'pin',
  'car',
  'parking',
  'train',
  'bus',
  'taxi',
  'accessibility',
  'bed',
  'euro',
  'tag',
  'clock',
  'rings',
  'glasses',
  'utensils',
  'cake',
  'music',
  'moon',
  'coffee',
  'camera',
  'qr',
  'upload',
  'image',
  'link',
  'printer',
  'envelope',
  'gift',
  'plane',
  'shirt',
  'shoe',
  'sun',
  'plus',
  'minus',
  'trash',
  'download',
  'search',
  'filter',
  'user',
  'users',
  'child',
  'leaf',
  'key',
  'heart',
  'church',
  'barn',
  'mountain',
  'wave',
  'city',
  'sparkles',
  'logout',
  'refresh',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Motive für die Foto-Platzhalter in „Unsere Geschichte“ */
export type StoryVignette = 'meet' | 'travel' | 'home' | 'proposal' | 'wedding';

/** Motive für die Orts-Karten */
export type VenueVignette = 'chapel' | 'barn';

export interface StoryItem {
  /** Freitext, z. B. "Sommer 2016" */
  date: string;
  title: string;
  text: string;
  /** Zeichnung, solange kein Foto hinterlegt ist */
  vignette: StoryVignette;
  /** Optional: Pfad zu einem Foto in /public, z. B. "/images/antrag.jpg" */
  image?: string;
  imageAlt?: string;
}

export interface ScheduleItem {
  /** Uhrzeit "HH:MM". Zeiten nach Mitternacht gehören automatisch zum Folgetag. */
  time: string;
  title: string;
  description?: string;
  /** Verweis auf eine Location-ID (siehe locations.items) */
  locationId?: string;
  icon: IconName;
  /** Optionaler Zusatzhinweis als Badge, z. B. "Shuttle ab 13:15 Uhr" */
  badge?: string;
}

export interface Location {
  id: string;
  /** Wofür ist der Ort? z. B. "Freie Trauung" oder "Feier" */
  label: string;
  /** Uhrzeit als Text, z. B. "14:00 Uhr" */
  time?: string;
  name: string;
  street: string;
  zipCity: string;
  description?: string;
  /** Koordinaten für Karte und Navigations-Links */
  lat: number;
  lng: number;
  vignette: VenueVignette;
}

export interface Hotel {
  name: string;
  /** z. B. "3 Sterne" oder "Ferienwohnung" */
  category?: string;
  /** z. B. "2,4 km · 5 Min. Auto" */
  distance: string;
  /** z. B. "ab 95 € / Nacht (DZ inkl. Frühstück)" */
  price?: string;
  description?: string;
  /** Hält der Shuttle hier? */
  shuttleStop?: boolean;
  /** Stichwort für das Zimmerkontingent */
  keyword?: string;
  /** Bis wann das Kontingent reserviert ist (JJJJ-MM-TT) */
  bookingDeadline?: string;
  url?: string;
  phone?: string;
}

export interface ShuttleRide {
  direction: 'hin' | 'zurueck';
  /** Abfahrt "HH:MM" */
  time: string;
  from: string;
  to: string;
  note?: string;
}

export interface Contact {
  name: string;
  /** z. B. "Trauzeugin von Vera" */
  role: string;
  phone?: string;
  email?: string;
  /** WhatsApp-Button anzeigen (nutzt die Telefonnummer) */
  whatsapp?: boolean;
  note?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface RsvpOption {
  value: string;
  label: string;
  description?: string;
}

export interface RsvpEvent {
  id: string;
  label: string;
  /** Kurzname für die Übersicht der Antwort und die Verwaltung (sonst `label`) */
  short?: string;
  /** z. B. "Samstag, 14:00 Uhr" */
  detail?: string;
  icon: IconName;
}

export interface FaqItem {
  question: string;
  answer: string;
  /** Optionaler Link in eine Sektion, z. B. { href: '#kontakt', label: 'Zu den Kontakten' } */
  link?: { href: string; label: string };
}

export const site = {
  /* ------------------------------------------------------------------------
   * Das Brautpaar
   * ---------------------------------------------------------------------- */
  couple: {
    first: 'Christoph',
    second: 'Vera',
    /** Buchstaben für das Monogramm */
    initials: ['C', 'V'] as const,
    /** Optional: Hashtag für Fotos in sozialen Medien (leer lassen = ausblenden) */
    hashtag: '#CVsagenJa',
  },

  /* ------------------------------------------------------------------------
   * Datum & Eckdaten
   * ---------------------------------------------------------------------- */
  wedding: {
    /** Beginn (für Countdown und Kalendereintrag). PLATZHALTER */
    start: '2027-05-22T14:00:00+02:00',
    /** Ende (für Kalendereintrag) */
    end: '2027-05-23T03:00:00+02:00',
    timeZone: 'Europe/Berlin',
    /** Kurzer Ort für Hero, Footer und Kalender. PLATZHALTER */
    place: 'Bergwelt Kandel · Kandel 1',
  },

  /** Titel im Browser-Tab und Beschreibung für Link-Vorschauen */
  meta: {
    title: 'Christoph & Vera – 22. Mai 2027',
    description: 'Alle Infos rund um unsere Hochzeit: Ablauf, Anfahrt, Übernachtung und Zusage.',
  },

  /* ------------------------------------------------------------------------
   * Login-Seite (Gästecode)
   * ---------------------------------------------------------------------- */
  login: {
    eyebrow: 'Herzlich willkommen',
    text: 'Bitte gebt den Gästecode von eurer Einladungskarte ein.',
    /** Wen können Gäste anrufen, wenn sie den Code nicht finden? PLATZHALTER */
    helpName: 'Christoph',
    helpPhone: '+49 771 8965614',
  },

  /* ------------------------------------------------------------------------
   * Startbereich (Hero)
   * ---------------------------------------------------------------------- */
  hero: {
    eyebrow: 'Wir heiraten',
    intro:
      'Wir freuen uns riesig, diesen besonderen Tag mit euch zu feiern! Hier findet ihr alles, was ihr für die Planung wissen müsst.',
    dayOfText: 'Heute ist es so weit!',
    afterText: 'Danke, dass ihr mit uns gefeiert habt!',
  },

  /* ------------------------------------------------------------------------
   * Unsere Geschichte
   * ---------------------------------------------------------------------- */
  story: {
    eyebrow: 'Wie alles begann',
    title: 'Unsere Geschichte',
    intro: 'Wie aus einem zufälligen Hallo ein gemeinsames Leben wurde. PLATZHALTER',
    items: [
      {
        date: 'Sommer 2016',
        title: 'Das erste Hallo',
        text: 'Auf dem Geburtstag einer gemeinsamen Freundin standen wir zufällig nebeneinander am Grill – und haben den Rest des Abends nicht mehr aufgehört zu reden. PLATZHALTER',
        vignette: 'meet',
      },
      {
        date: 'Herbst 2017',
        title: 'Die erste gemeinsame Reise',
        text: 'Mit Zelt und viel zu wenig Regenkleidung ging es in die Berge. Spätestens da war klar: Wir sind ein gutes Team. PLATZHALTER',
        vignette: 'travel',
      },
      {
        date: 'Frühjahr 2020',
        title: 'Die erste gemeinsame Wohnung',
        text: 'Kisten schleppen, Möbel aufbauen, die erste eigene Küche – und ein Basilikum, das erstaunlich lange überlebt hat. PLATZHALTER',
        vignette: 'home',
      },
      {
        date: 'Silvester 2025',
        title: 'Die große Frage',
        text: 'Kurz vor Mitternacht, unter freiem Himmel und mit zitternden Händen: Christoph hat gefragt, Vera hat Ja gesagt. PLATZHALTER',
        vignette: 'proposal',
      },
    ] satisfies StoryItem[],
    /** Abschlusszeile unter der Zeitleiste */
    finale: 'Und jetzt: Ja!',
  },

  /* ------------------------------------------------------------------------
   * Tagesablauf
   * ---------------------------------------------------------------------- */
  schedule: {
    eyebrow: 'Der große Tag',
    title: 'Tagesablauf',
    intro: 'So ungefähr haben wir uns den Tag vorgestellt – kleine Verschiebungen sind erlaubt. PLATZHALTER',
    items: [
      {
        time: '13:30',
        title: 'Ankommen',
        description: 'Ankommen, durchatmen, Plätze suchen.',
        locationId: 'feier',
        icon: 'sun',
        badge: 'Shuttle ab 13:00\u00A0Uhr',
      },
      {
        time: '14:00',
        title: 'Freie Trauung',
        description: 'Unter der alten Linde im Garten – bei Regen in der Scheune.',
        locationId: 'feier',
        icon: 'rings',
      },
      {
        time: '15:00',
        title: 'Sektempfang',
        description: 'Anstoßen, gratulieren, Fotos machen.',
        icon: 'glasses',
      },
      {
        time: '16:30',
        title: 'Kaffee & Kuchen',
        description: 'Selbstgebackenes von unseren Familien.',
        icon: 'cake',
      },
      {
        time: '18:30',
        title: 'Abendessen',
        description: 'Gemeinsames Essen an langen Tafeln.',
        icon: 'utensils',
      },
      {
        time: '21:00',
        title: 'Eröffnungstanz & Party',
        description: 'Danach gehört die Tanzfläche euch.',
        icon: 'music',
      },
      {
        time: '00:00',
        title: 'Mitternachtssnack',
        description: 'Für alle, die noch Kraft zum Tanzen brauchen.',
        icon: 'moon',
      },
    ] satisfies ScheduleItem[],
  },

  /* ------------------------------------------------------------------------
   * Orte & Anfahrt
   * ---------------------------------------------------------------------- */
  locations: {
    eyebrow: 'Wo wir feiern',
    title: 'Orte & Anfahrt',
    intro: 'Vormittags geht es aufs Standesamt, nachmittags feiern wir gemeinsam auf dem Hofgut. PLATZHALTER',
    items: [
      {
        id: 'standesamt',
        label: 'Standesamt',
        time: '11:00\u00A0Uhr',
        name: 'Rathaus Musterstadt',
        street: 'Marktplatz 1',
        zipCity: '12345 Musterstadt',
        description: 'Im engsten Familienkreis – wir freuen uns, euch danach auf dem Hofgut zu sehen. PLATZHALTER',
        lat: 48.137154,
        lng: 11.576124,
        vignette: 'chapel',
      },
      {
        id: 'feier',
        label: 'Freie Trauung & Feier',
        time: '14:00\u00A0Uhr',
        name: 'Bergwelt Kandel',
        street: 'Kandel 1',
        zipCity: '79183 Waldkirch (Südschwarzwald)',
        description: 'Ein alter Gutshof mit großem Garten, Scheune und viel Platz zum Feiern. PLATZHALTER',
        lat: 48.15,
        lng: 11.6,
        vignette: 'barn',
      },
    ] satisfies Location[],
    /** Fahrzeit zwischen den Orten (leer lassen = ausblenden) */
    travelTimeBetween: 'ca. 10 Min. Fahrt',
    travel: {
      parking:
        'Kostenlose Parkplätze direkt am Hofgut (ausgeschildert), ca. 3 Min. Fußweg über Kies. Ihr könnt euer Auto über Nacht stehen lassen. PLATZHALTER',
      train:
        'Nächster Bahnhof ist Musterstadt Hbf. Von dort sind es ca. 15 Minuten mit dem Taxi – oder ihr nutzt unseren Shuttle ab den Hotels. PLATZHALTER',
      accessibility:
        'Die Scheune und die Toiletten sind ebenerdig erreichbar. Zum Garten führt ein befestigter Weg. PLATZHALTER',
    },
  },

  /* ------------------------------------------------------------------------
   * Übernachtung, Shuttle & Taxi
   * ---------------------------------------------------------------------- */
  stay: {
    eyebrow: 'Für Anreisende',
    title: 'Übernachten & Shuttle',
    intro: 'Für alle, die von weiter weg anreisen oder nach der Party nicht mehr fahren möchten. PLATZHALTER',
    hotels: [
      {
        name: 'Landhotel Zur Post',
        category: '3 Sterne',
        distance: '2,4 km · 5 Min. Auto',
        price: 'ab 95 € / Nacht (DZ inkl. Frühstück)',
        description: 'Gemütliches Familienhotel mit großem Frühstücksbuffet.',
        shuttleStop: true,
        keyword: 'Hochzeit C&V',
        bookingDeadline: '2027-04-30',
        url: 'https://example.com',
        phone: '+49 1234 567890',
      },
      {
        name: 'Gasthof Linde',
        category: 'Gasthof',
        distance: '4 km · 8 Min. Auto',
        price: 'ab 79 € / Nacht (DZ)',
        description: 'Einfache, saubere Zimmer im Ortskern.',
        shuttleStop: true,
        url: 'https://example.com',
        phone: '+49 1234 567891',
      },
      {
        name: 'Ferienwohnungen am Hof',
        category: 'Ferienwohnung',
        distance: 'direkt vor Ort',
        price: 'auf Anfrage',
        description: 'Wenige Apartments direkt auf dem Hofgut – bitte frühzeitig bei uns melden.',
      },
    ] satisfies Hotel[],
    shuttle: {
      enabled: true,
      text: 'Ein Shuttlebus pendelt zwischen den Hotels und dem Hofgut. Bitte gebt bei der Zusage an, ob ihr mitfahrt. PLATZHALTER',
      rides: [
        { direction: 'hin', time: '13:00', from: 'Landhotel Zur Post', to: 'Hofgut Lindenhof' },
        { direction: 'hin', time: '13:10', from: 'Gasthof Linde', to: 'Hofgut Lindenhof' },
        { direction: 'zurueck', time: '23:30', from: 'Hofgut Lindenhof', to: 'beide Hotels' },
        { direction: 'zurueck', time: '01:00', from: 'Hofgut Lindenhof', to: 'beide Hotels' },
        { direction: 'zurueck', time: '02:30', from: 'Hofgut Lindenhof', to: 'beide Hotels', note: 'letzte Fahrt' },
      ] satisfies ShuttleRide[],
    },
    taxis: [
      { name: 'Taxi Musterstadt', phone: '+49 1234 111111' },
      { name: 'Funktaxi Müller', phone: '+49 1234 222222' },
    ],
    taxiNote: 'Nachts bitte vorbestellen',
  },

  /* ------------------------------------------------------------------------
   * Dresscode
   * ---------------------------------------------------------------------- */
  dresscode: {
    eyebrow: 'Was ziehe ich an?',
    title: 'Dresscode',
    motto: 'Sommerlich-elegant, gern in natürlichen Farben.',
    text: 'Kommt so, wie ihr euch schick und wohl fühlt. Die Farben unten dienen als Anregung. PLATZHALTER',
    palette: [
      { name: 'Salbei', hex: '#9AAE97' },
      { name: 'Eukalyptus', hex: '#6F8A78' },
      { name: 'Sand', hex: '#E3D3BC' },
      { name: 'Terrakotta', hex: '#C27453' },
      { name: 'Rosenholz', hex: '#C49A8F' },
      { name: 'Olive', hex: '#7D7A4F' },
    ] satisfies ColorSwatch[],
    dos: [
      'Blockabsatz oder flache Schuhe – wir feiern auf der Wiese',
      'Leinen, Anzug gern ohne Krawatte',
      'Jacke oder Stola für den Abend',
    ],
    donts: ['Weiß, Creme oder Elfenbein – das bleibt der Braut vorbehalten', 'Stilettos auf dem Rasen'],
    note: 'Absatzschoner liegen am Eingang bereit.',
  },

  /* ------------------------------------------------------------------------
   * Geschenke
   * ---------------------------------------------------------------------- */
  gifts: {
    eyebrow: 'Von Herzen',
    title: 'Geschenke',
    quote: 'Das schönste Geschenk ist, dass ihr mit uns feiert.',
    text: 'Wer uns darüber hinaus eine Freude machen möchte: Wir träumen von einer Reise durch Portugal und freuen uns über einen Beitrag zu unseren Flitterwochen. PLATZHALTER',
    /** Kleine „Postkarten“ mit Reise-Stationen (leer = ausblenden) */
    stations: [
      { icon: 'city', label: 'Porto' },
      { icon: 'mountain', label: 'Douro-Tal' },
      { icon: 'wave', label: 'Algarve' },
    ] satisfies { icon: IconName; label: string }[],
    note: 'Am Hochzeitstag steht eine Kartenbox für eure Umschläge bereit.',
    /**
     * Optional: Bankverbindung (wird erst nach Klick angezeigt).
     * Beispiel: { holder: 'Christoph & Vera Muster', iban: 'DE00 0000 0000 0000 0000 00', bic: '' }
     */
    bank: null as null | { holder: string; iban: string; bic?: string },
  },

  /* ------------------------------------------------------------------------
   * Fotos
   * ---------------------------------------------------------------------- */
  photos: {
    eyebrow: 'Erinnerungen teilen',
    title: 'Eure Fotos',
    text: 'Ihr habt den perfekten Moment eingefangen? Ladet eure Fotos und Videos in unser gemeinsames Album – wir freuen uns über jeden Schnappschuss!',
    steps: ['Album öffnen', 'Fotos auswählen', 'Hochladen – ohne App und Konto'],
    /** Link zum geteilten Album (Google Fotos, iCloud, Dropbox …). PLATZHALTER */
    albumUrl: 'https://photos.google.com/',
    albumLabel: 'Zum gemeinsamen Album',
    /** Ab wann ist das Album freigeschaltet? (JJJJ-MM-TT, leer = sofort) */
    albumOpensAt: '2027-06-19',
    unpluggedNote:
      'Unplugged-Trauung: Während der Zeremonie bitte keine Handys – unsere Fotografin hält alles für euch fest.',
    /** Texte für die druckbare QR-Code-Tischkarte (Seite /fotos/karte) */
    printCard: {
      title: 'Teilt eure Fotos',
      text: 'Scannt den Code und ladet eure schönsten Momente in unser Album.',
    },
  },

  /* ------------------------------------------------------------------------
   * Zusage (RSVP)
   * ---------------------------------------------------------------------- */
  rsvp: {
    eyebrow: 'Seid ihr dabei?',
    title: 'Zusage',
    intro: 'Bitte gebt uns bis zum Stichtag Bescheid, ob ihr dabei seid. Eure Antwort könnt ihr jederzeit über dieses Formular ändern.',
    /** Rückmeldefrist (JJJJ-MM-TT). PLATZHALTER */
    deadline: '2027-03-20',
    /** Nach der Frist keine Antworten mehr annehmen? */
    closeAfterDeadline: false,
    /** Maximale Anzahl Personen pro Antwort */
    maxPersons: 4,
    /** Sind Kinder eingeladen? (zeigt „Kind (unter 12 Jahren)“ pro Person) */
    allowChildren: true,
    menuOptions: [
      { value: 'fleisch', label: 'Fleisch' },
      { value: 'vegetarisch', label: 'Vegetarisch' },
    ] satisfies RsvpOption[],
    /** Kindermenü bei Kindern als dritte Menüoption anbieten? */
    offerChildMenu: false,
    /** Zusätzliche Menüoption für Kinder (nur mit offerChildMenu) */
    childMenu: { value: 'kinder', label: 'Kindermenü' } satisfies RsvpOption,
    childAgeOptions: ['0–2 Jahre', '3–6 Jahre', '7–11 Jahre'],
    /** Schnellauswahl für Unverträglichkeiten (zusätzlich gibt es ein Freitextfeld) */
    allergyOptions: ['Gluten', 'Laktose', 'Nüsse'],
    /**
     * Optionale Programmpunkte zum Ankreuzen (leer = ausblenden). Standardmäßig nicht
     * angehakt, keine Pflichtauswahl.
     */
    events: [
      {
        id: 'brunch',
        label: 'Wir möchten am Sonntag zum Katerfrühstück dazustoßen.',
        short: 'Katerfrühstück',
        icon: 'coffee',
      },
    ] satisfies RsvpEvent[],
    /** Frage nach der Übernachtung anzeigen? */
    askOvernight: true,
    overnightOptions: [
      { value: 'bergwelt', label: 'In der Bergwelt (Vermittlung über uns)' },
      { value: 'stellplatz', label: 'Auf dem Stellplatz bei der Bergwelt (Strom, kein Wasser)' },
      { value: 'self', label: 'Wir kümmern uns selbst' },
      { value: 'home', label: 'Wir fahren nach Hause' },
    ] satisfies RsvpOption[],
    /** Frage nach dem Shuttle anzeigen? (nur wenn stay.shuttle.enabled) */
    askShuttle: false,
    /** Feld für einen Musikwunsch anzeigen? (nur bei „Ja, wir kommen gern“) */
    askSongWish: true,
    successYes: 'Wir freuen uns riesig auf euch!',
    successNo: 'Schade, dass ihr nicht dabei sein könnt. Danke für eure Rückmeldung!',
    privacyNote:
      'Wir nutzen eure Angaben (inkl. Unverträglichkeiten) ausschließlich für die Planung unserer Hochzeit und löschen sie spätestens drei Monate danach.',
    /** Ansprechpartner für Änderungen nach der Frist. PLATZHALTER */
    changeContactName: 'Anna',
    changeContactPhone: '+49 170 0000001',
  },

  /* ------------------------------------------------------------------------
   * Häufige Fragen
   * ---------------------------------------------------------------------- */
  faq: {
    eyebrow: 'Gut zu wissen',
    title: 'Häufige Fragen',
    intro: 'Eure Frage fehlt? Schreibt uns einfach.',
    items: [
      {
        question: 'Bis wann sollen wir zusagen?',
        answer: 'Bitte bis spätestens 20. März 2027 über das Formular auf dieser Seite. Ändern könnt ihr eure Antwort jederzeit. PLATZHALTER',
        link: { href: '#zusage', label: 'Zur Zusage' },
      },
      {
        question: 'Sind Kinder willkommen?',
        answer: 'Ja, sehr! Für die Kleinen gibt es eine Spielecke und am Abend einen ruhigen Rückzugsort. Bitte gebt Kinder bei der Zusage mit an. PLATZHALTER',
      },
      {
        question: 'Wir möchten eine Rede, ein Spiel oder eine Überraschung beitragen – an wen wenden wir uns?',
        answer: 'Sehr gern! Bitte sprecht alle Beiträge bis 1. Mai 2027 mit unseren Trauzeugen ab, damit alles gut in den Ablauf passt. Uns müsst ihr nichts verraten. PLATZHALTER',
        link: { href: '#kontakt', label: 'Zu den Trauzeugen' },
      },
      {
        question: 'Wo kann ich parken?',
        answer: 'Direkt am Hofgut gibt es ausreichend kostenlose Parkplätze. Ihr könnt euer Auto über Nacht stehen lassen.',
        link: { href: '#anfahrt', label: 'Zur Anfahrt' },
      },
      {
        question: 'Was passiert bei Regen?',
        answer: 'Dann ziehen wir mit der Trauung in die geschmückte Scheune um. Gefeiert wird so oder so!',
      },
      {
        question: 'Darf ich während der Trauung fotografieren?',
        answer: 'Wir wünschen uns eine Unplugged-Trauung: Bitte lasst die Handys während der Zeremonie in der Tasche – unsere Fotografin hält alles fest. Danach dürft ihr nach Herzenslust knipsen.',
        link: { href: '#fotos', label: 'Zum Fotoalbum' },
      },
      {
        question: 'Wie lange geht die Feier – und wie komme ich nachts zurück?',
        answer: 'Open End! Der Shuttle fährt bis 02:30\u00A0Uhr zu den Hotels, Taxis solltet ihr nachts am besten vorbestellen.',
        link: { href: '#uebernachten', label: 'Zu Shuttle & Taxi' },
      },
      {
        question: 'Gibt es Essen für Allergiker, Vegetarier und Veganer?',
        answer: 'Ja. Wählt im Zusageformular einfach euer Menü und gebt Unverträglichkeiten an – unser Caterer kümmert sich darum.',
      },
    ] satisfies FaqItem[],
  },

  /* ------------------------------------------------------------------------
   * Ansprechpartner
   * ---------------------------------------------------------------------- */
  contacts: {
    eyebrow: 'Fragen?',
    title: 'Kontakt',
    intro: 'Für Überraschungen, Reden und alles, was wir (noch) nicht wissen sollen, sind unsere Trauzeugen für euch da.',
    people: [
      {
        name: 'Anna Beispiel',
        role: 'Trauzeugin von Vera',
        phone: '+49 170 0000001',
        email: 'anna@example.com',
        whatsapp: true,
        note: 'Ansprechpartnerin für Reden, Spiele & Überraschungen',
      },
      {
        name: 'Markus Muster',
        role: 'Trauzeuge von Christoph',
        phone: '+49 170 0000002',
        email: 'markus@example.com',
        whatsapp: true,
      },
    ] satisfies Contact[],
    /** Hinweis-Box unter den Kontakten (leer lassen = ausblenden) */
    notice: 'Reden, Spiele und Überraschungen bitte bis 1. Mai 2027 bei Anna & Markus anmelden, damit alles gut in den Ablauf passt. PLATZHALTER',
    /** Kontaktzeile des Brautpaars */
    couple: { email: 'hallo@example.com', phone: '' },
  },

  /* ------------------------------------------------------------------------
   * Fußzeile & Datenschutz
   * ---------------------------------------------------------------------- */
  footer: {
    text: 'Wir freuen uns auf euch.',
  },
  privacy: {
    /** Verantwortlich für die Datenverarbeitung */
    responsibleName: 'Christoph & Vera',
    responsibleAddress: '78183 Hüfingen',
    responsibleEmail: 'chris.koehler13@web.de',
  },
};

export type Site = typeof site;
