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
 *  - Zeiten immer mit Zeitzone angeben, z. B. "2027-06-19T14:00:00+02:00"
 *    (+02:00 = Sommerzeit, +01:00 = Winterzeit).
 *
 *  Gästecode und Admin-Passwort stehen NICHT hier, sondern in den
 *  Umgebungsvariablen (siehe README.md).
 * ============================================================================
 */

/** Verfügbare Icons (siehe src/components/icons). */
export type IconName =
  | 'rings'
  | 'church'
  | 'glass'
  | 'dinner'
  | 'cake'
  | 'music'
  | 'moon'
  | 'camera'
  | 'car'
  | 'train'
  | 'bus'
  | 'hotel'
  | 'heart'
  | 'sun'
  | 'gift'
  | 'mail'
  | 'phone'
  | 'leaf'
  | 'map'
  | 'clock'
  | 'coffee'
  | 'sparkles'
  | 'calendar'
  | 'parking'
  | 'shirt'
  | 'question'
  | 'plane'
  | 'key'
  | 'taxi'
  | 'users'
  | 'check'
  | 'external'
  | 'download'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'arrow-right';

export interface StoryItem {
  /** Freitext, z. B. "Sommer 2016" */
  date: string;
  title: string;
  text: string;
  /** Optional: Pfad zu einem Foto in /public, z. B. "/images/antrag.jpg" */
  image?: string;
  imageAlt?: string;
}

export interface ScheduleItem {
  /** Uhrzeit als Text, z. B. "14:00" */
  time: string;
  title: string;
  description?: string;
  /** Verweis auf eine Location-ID (siehe locations.items) */
  locationId?: string;
  icon: IconName;
}

export interface Location {
  id: string;
  /** Wofür ist der Ort? z. B. "Freie Trauung" oder "Feier" */
  label: string;
  name: string;
  street: string;
  zipCity: string;
  description?: string;
  /** Koordinaten für Karte und Navigations-Links */
  lat: number;
  lng: number;
  parking?: string;
  icon: IconName;
}

export interface Hotel {
  name: string;
  /** z. B. "5 Min. mit dem Auto" */
  distance: string;
  /** z. B. "ab 89 € / Nacht (DZ)" */
  price?: string;
  description?: string;
  /** Stichwort für das Zimmerkontingent */
  keyword?: string;
  /** Bis wann das Kontingent reserviert ist, z. B. "30. April 2027" */
  bookingDeadline?: string;
  url?: string;
  phone?: string;
}

export interface ShuttleRide {
  time: string;
  from: string;
  to: string;
}

export interface Contact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  note?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface RsvpMenuOption {
  value: string;
  label: string;
  description?: string;
}

export interface RsvpEvent {
  id: string;
  label: string;
  /** z. B. "Samstag, 14:00 Uhr" */
  detail?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
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
    start: '2027-06-19T14:00:00+02:00',
    /** Ende (für Kalendereintrag) */
    end: '2027-06-20T02:00:00+02:00',
    timeZone: 'Europe/Berlin',
    /** Kurzer Ort für Hero und Kalender. PLATZHALTER */
    place: 'Hofgut Lindenhof, Musterstadt',
  },

  /** Titel im Browser-Tab und Beschreibung für Link-Vorschauen */
  meta: {
    title: 'Christoph & Vera – 19. Juni 2027',
    description: 'Alle Infos rund um unsere Hochzeit: Ablauf, Anfahrt, Übernachtung und Zusage.',
  },

  /* ------------------------------------------------------------------------
   * Startbereich (Hero)
   * ---------------------------------------------------------------------- */
  hero: {
    eyebrow: 'Wir heiraten',
    intro:
      'Wir freuen uns riesig, diesen besonderen Tag mit euch zu feiern! Hier findet ihr alles, was ihr für die Planung wissen müsst.',
  },

  /* ------------------------------------------------------------------------
   * Login-Seite (Gästecode)
   * ---------------------------------------------------------------------- */
  login: {
    title: 'Schön, dass du da bist!',
    text: 'Bitte gib den Gästecode ein, den du auf deiner Einladungskarte findest.',
    help: 'Code verlegt? Melde dich einfach bei uns oder den Trauzeugen.',
  },

  /* ------------------------------------------------------------------------
   * Unsere Geschichte
   * ---------------------------------------------------------------------- */
  story: {
    title: 'Unsere Geschichte',
    intro: 'Wie aus einem zufälligen Hallo ein gemeinsames Leben wurde. PLATZHALTER',
    items: [
      {
        date: 'Sommer 2016',
        title: 'Das erste Hallo',
        text: 'Auf dem Geburtstag einer gemeinsamen Freundin standen wir zufällig nebeneinander am Grill – und haben den Rest des Abends nicht mehr aufgehört zu reden. PLATZHALTER',
      },
      {
        date: 'Herbst 2017',
        title: 'Die erste gemeinsame Reise',
        text: 'Mit Zelt und viel zu wenig Regenkleidung ging es an die Küste. Spätestens da war klar: Wir sind ein gutes Team. PLATZHALTER',
      },
      {
        date: 'Frühjahr 2020',
        title: 'Die erste gemeinsame Wohnung',
        text: 'Kisten schleppen, Möbel aufbauen, die erste eigene Küche – und ein Basilikum, das erstaunlich lange überlebt hat. PLATZHALTER',
      },
      {
        date: 'Silvester 2025',
        title: 'Die große Frage',
        text: 'Kurz vor Mitternacht, unter freiem Himmel und mit zitternden Händen: Christoph hat gefragt, Vera hat Ja gesagt. PLATZHALTER',
      },
    ] satisfies StoryItem[],
  },

  /* ------------------------------------------------------------------------
   * Tagesablauf
   * ---------------------------------------------------------------------- */
  schedule: {
    title: 'Der Tagesablauf',
    intro: 'So ungefähr haben wir uns den Tag vorgestellt – kleine Verschiebungen sind erlaubt. PLATZHALTER',
    items: [
      {
        time: '13:30',
        title: 'Ankommen',
        description: 'Ankommen, durchatmen, Plätze suchen.',
        locationId: 'feier',
        icon: 'sun',
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
        title: 'Sektempfang & Kuchen',
        description: 'Anstoßen, gratulieren, Fotos machen.',
        icon: 'glass',
      },
      {
        time: '18:30',
        title: 'Abendessen',
        description: 'Gemeinsames Essen an langen Tafeln.',
        icon: 'dinner',
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
    title: 'Orte & Anfahrt',
    intro: 'Trauung und Feier finden am selben Ort statt. PLATZHALTER',
    items: [
      {
        id: 'standesamt',
        label: 'Standesamtliche Trauung',
        name: 'Rathaus Musterstadt',
        street: 'Marktplatz 1',
        zipCity: '12345 Musterstadt',
        description: 'Im engsten Familienkreis am Vormittag – wir freuen uns, euch danach auf dem Hofgut zu sehen. PLATZHALTER',
        lat: 48.137154,
        lng: 11.576124,
        icon: 'church',
      },
      {
        id: 'feier',
        label: 'Freie Trauung & Feier',
        name: 'Hofgut Lindenhof',
        street: 'Am Lindenhof 1',
        zipCity: '12345 Musterstadt',
        description: 'Ein alter Gutshof mit großem Garten, Scheune und viel Platz zum Feiern. PLATZHALTER',
        lat: 48.15,
        lng: 11.6,
        parking: 'Kostenlose Parkplätze direkt am Hof (ausgeschildert). Ihr könnt euer Auto über Nacht stehen lassen.',
        icon: 'heart',
      },
    ] satisfies Location[],
    travel: {
      car: 'Über die A9, Ausfahrt Musterstadt-Nord, dann der Beschilderung „Lindenhof“ folgen (ca. 10 Minuten). PLATZHALTER',
      train: 'Nächster Bahnhof ist Musterstadt Hbf. Von dort sind es ca. 15 Minuten mit dem Taxi. Gebt uns gern Bescheid, dann organisieren wir eine Abholung. PLATZHALTER',
    },
  },

  /* ------------------------------------------------------------------------
   * Übernachtung, Shuttle & Taxi
   * ---------------------------------------------------------------------- */
  stay: {
    title: 'Übernachten & Shuttle',
    intro: 'Für alle, die von weiter weg anreisen oder nach der Party nicht mehr fahren möchten. PLATZHALTER',
    hotels: [
      {
        name: 'Landhotel Zur Post',
        distance: '5 Min. mit dem Auto',
        price: 'ab 95 € / Nacht (DZ inkl. Frühstück)',
        description: 'Gemütliches Familienhotel, Shuttle-Haltestelle direkt vor der Tür.',
        keyword: 'Hochzeit C&V',
        bookingDeadline: '30. April 2027',
        url: 'https://example.com',
        phone: '+49 1234 567890',
      },
      {
        name: 'Gasthof Linde',
        distance: '10 Min. mit dem Auto',
        price: 'ab 79 € / Nacht (DZ)',
        description: 'Einfache, saubere Zimmer im Ortskern.',
        url: 'https://example.com',
        phone: '+49 1234 567891',
      },
      {
        name: 'Ferienwohnungen am Hof',
        distance: 'direkt vor Ort',
        price: 'auf Anfrage',
        description: 'Wenige Apartments direkt auf dem Hofgut – bitte frühzeitig bei uns melden.',
      },
    ] satisfies Hotel[],
    shuttle: {
      enabled: true,
      text: 'Ein Shuttlebus pendelt zwischen den Hotels und dem Hofgut. Gebt bei der Zusage an, ob ihr ihn nutzen möchtet. PLATZHALTER',
      rides: [
        { time: '13:00', from: 'Landhotel Zur Post', to: 'Hofgut Lindenhof' },
        { time: '23:30', from: 'Hofgut Lindenhof', to: 'Landhotel Zur Post' },
        { time: '01:00', from: 'Hofgut Lindenhof', to: 'Landhotel Zur Post' },
        { time: '02:30', from: 'Hofgut Lindenhof', to: 'Landhotel Zur Post' },
      ] satisfies ShuttleRide[],
    },
    taxis: [
      { name: 'Taxi Musterstadt', phone: '+49 1234 111111' },
      { name: 'Funktaxi Müller', phone: '+49 1234 222222' },
    ],
  },

  /* ------------------------------------------------------------------------
   * Dresscode
   * ---------------------------------------------------------------------- */
  dresscode: {
    title: 'Dresscode',
    motto: 'Sommerlich-elegant',
    text: 'Kommt so, wie ihr euch schick und wohl fühlt – gern in sanften, natürlichen Farben. Die Palette unten ist nur eine Inspiration, kein Muss. PLATZHALTER',
    palette: [
      { name: 'Salbei', hex: '#9CAF88' },
      { name: 'Eukalyptus', hex: '#6F8C7A' },
      { name: 'Sand', hex: '#D8C3A5' },
      { name: 'Terrakotta', hex: '#C0785A' },
      { name: 'Altrosa', hex: '#D4A5A0' },
      { name: 'Creme', hex: '#F1E9DA' },
    ] satisfies ColorSwatch[],
    dos: [
      'Leichte Stoffe – wir feiern zum Teil draußen',
      'Bequeme Schuhe zum Tanzen',
      'Eine Jacke oder ein Tuch für den Abend',
    ],
    donts: [
      'Bitte nicht in Weiß oder Creme – das bleibt der Braut vorbehalten',
      'Pfennigabsätze versinken im Rasen – Blockabsätze sind eure Freunde',
    ],
  },

  /* ------------------------------------------------------------------------
   * Geschenke
   * ---------------------------------------------------------------------- */
  gifts: {
    title: 'Geschenke',
    text: 'Das größte Geschenk ist, dass ihr diesen Tag mit uns feiert!\n\nWer uns darüber hinaus eine Freude machen möchte: Wir träumen von einer Reise nach Portugal und freuen uns über einen kleinen Beitrag zu unseren Flitterwochen. PLATZHALTER',
    highlight: {
      title: 'Unsere Flitterwochen',
      text: 'Zwei Wochen Portugal – von Porto bis an die Algarve. PLATZHALTER',
    },
    note: 'Am Hochzeitstag steht eine Kartenbox für eure Umschläge bereit.',
  },

  /* ------------------------------------------------------------------------
   * Fotos
   * ---------------------------------------------------------------------- */
  photos: {
    title: 'Eure Fotos',
    text: 'Ihr habt den perfekten Moment eingefangen? Ladet eure Fotos und Videos in unser gemeinsames Album – wir freuen uns über jeden Schnappschuss!',
    /** Link zum geteilten Album (Google Fotos, iCloud, Dropbox …). PLATZHALTER */
    albumUrl: 'https://photos.google.com/',
    albumLabel: 'Zum gemeinsamen Album',
    hint: 'Das Album ist ab dem Hochzeitstag freigeschaltet. Bitte ladet die Bilder in Originalqualität hoch.',
    /** Text für die druckbare QR-Code-Karte (Seite /fotos/karte) */
    printCard: {
      title: 'Teilt eure schönsten Momente',
      text: 'QR-Code scannen und Fotos direkt in unser Album laden.',
    },
  },

  /* ------------------------------------------------------------------------
   * Zusage (RSVP)
   * ---------------------------------------------------------------------- */
  rsvp: {
    title: 'Zusage',
    intro: 'Bitte gebt uns bis zum Stichtag Bescheid, ob ihr dabei seid. Ihr könnt eure Antwort jederzeit über dieses Formular ändern.',
    /** Rückmeldefrist (Datum im Format JJJJ-MM-TT). PLATZHALTER */
    deadline: '2027-04-30',
    /** Nach der Frist keine Antworten mehr annehmen? */
    closeAfterDeadline: false,
    /** Maximale Anzahl Personen pro Antwort */
    maxPersons: 6,
    /** Sind Kinder eingeladen? (zeigt das Feld "Kind" pro Person) */
    allowChildren: true,
    menuOptions: [
      { value: 'fleisch', label: 'Fleisch', description: 'Rinderbraten mit Kartoffelgratin' },
      { value: 'fisch', label: 'Fisch', description: 'Saibling mit Kräuterkruste' },
      { value: 'vegetarisch', label: 'Vegetarisch', description: 'Gefüllte Pasta mit Salbeibutter' },
      { value: 'vegan', label: 'Vegan', description: 'Gemüse-Curry mit Kokos' },
    ] satisfies RsvpMenuOption[],
    /** Programmpunkte, für die Gäste einzeln zusagen können (leer = ausblenden) */
    events: [
      { id: 'trauung', label: 'Freie Trauung & Feier', detail: 'Samstag, ab 13:30 Uhr' },
      { id: 'brunch', label: 'Katerfrühstück', detail: 'Sonntag, ab 10:30 Uhr' },
    ] satisfies RsvpEvent[],
    /** Frage nach Übernachtungsbedarf anzeigen? */
    askOvernight: true,
    /** Frage nach Shuttle anzeigen? (nur wenn stay.shuttle.enabled) */
    askShuttle: true,
    successYes: 'Juhu, wir freuen uns riesig auf euch!',
    successNo: 'Schade, dass ihr nicht dabei sein könnt – danke für eure Rückmeldung!',
    privacyNote:
      'Wir nutzen eure Angaben (inkl. Unverträglichkeiten) ausschließlich für die Planung unserer Hochzeit und löschen sie spätestens drei Monate danach.',
  },

  /* ------------------------------------------------------------------------
   * Häufige Fragen
   * ---------------------------------------------------------------------- */
  faq: {
    title: 'Häufige Fragen',
    items: [
      {
        question: 'Bis wann sollen wir zusagen?',
        answer: 'Bitte bis spätestens 30. April 2027 über das Formular auf dieser Seite. PLATZHALTER',
      },
      {
        question: 'Sind Kinder willkommen?',
        answer: 'Ja, sehr! Für die Kleinen gibt es eine Spielecke und am Abend einen ruhigen Rückzugsort. Bitte gebt Kinder bei der Zusage mit an. PLATZHALTER',
      },
      {
        question: 'Wir möchten eine Rede halten oder ein Spiel vorbereiten – an wen wenden wir uns?',
        answer: 'Sehr gern! Bitte sprecht alle Beiträge vorab mit unseren Trauzeugen ab, damit der Abend gut getaktet bleibt (Kontakt siehe unten). Uns müsst ihr nichts verraten.',
      },
      {
        question: 'Gibt es Parkplätze?',
        answer: 'Ja, direkt am Hofgut gibt es ausreichend kostenlose Parkplätze. Ihr könnt euer Auto über Nacht stehen lassen.',
      },
      {
        question: 'Was passiert bei Regen?',
        answer: 'Dann ziehen wir mit der Trauung in die geschmückte Scheune um. Gefeiert wird so oder so!',
      },
      {
        question: 'Dürfen wir während der Trauung fotografieren?',
        answer: 'Wir wünschen uns eine „unplugged“ Trauung: Bitte lasst die Handys während der Zeremonie in der Tasche – unsere Fotografin hält alles fest. Danach dürft ihr nach Herzenslust knipsen.',
      },
    ] satisfies FaqItem[],
  },

  /* ------------------------------------------------------------------------
   * Ansprechpartner
   * ---------------------------------------------------------------------- */
  contacts: {
    title: 'Fragen? Meldet euch!',
    intro: 'Für Überraschungen, Reden und alles, was wir (noch) nicht wissen sollen, sind unsere Trauzeugen für euch da.',
    people: [
      {
        name: 'Anna Beispiel',
        role: 'Trauzeugin',
        phone: '+49 170 0000001',
        email: 'anna@example.com',
        note: 'Ansprechpartnerin für Beiträge & Überraschungen',
      },
      {
        name: 'Markus Muster',
        role: 'Trauzeuge',
        phone: '+49 170 0000002',
        email: 'markus@example.com',
      },
      {
        name: 'Christoph & Vera',
        role: 'Das Brautpaar',
        email: 'hallo@example.com',
        note: 'Für alle anderen Fragen',
      },
    ] satisfies Contact[],
  },

  /* ------------------------------------------------------------------------
   * Fußzeile & Datenschutz
   * ---------------------------------------------------------------------- */
  footer: {
    text: 'Wir können es kaum erwarten, mit euch zu feiern.',
  },
  privacy: {
    /** Verantwortlich für die Datenverarbeitung. PLATZHALTER */
    responsibleName: 'Christoph Mustermann & Vera Musterfrau',
    responsibleAddress: 'Musterstraße 1, 12345 Musterstadt',
    responsibleEmail: 'hallo@example.com',
  },
};

export type Site = typeof site;
