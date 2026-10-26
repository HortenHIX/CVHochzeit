import { allergyText, type RsvpEntry, type RsvpPerson } from './types';

/**
 * Kennzahlen und Auswertungen für den Admin-Bereich.
 *
 * Reine Funktionen ohne Next.js-Abhängigkeiten: Die Beschriftungen (Menüs,
 * Programmpunkte, Übernachtung) werden als Parameter übergeben – im Projekt
 * ist das `site.rsvp`, in Tests ein eigenes Objekt.
 */

export interface LabeledOption {
  value: string;
  label: string;
}

export interface RsvpLabels {
  menuOptions: readonly LabeledOption[];
  childMenu: LabeledOption;
  events: readonly { id: string; label: string; detail?: string }[];
  overnightOptions: readonly LabeledOption[];
  allergyOptions: readonly string[];
}

export interface CountRow {
  /** value/id der Option */
  key: string;
  label: string;
  /** Personen */
  persons: number;
  /** Haushalte (Antworten) */
  households: number;
  detail?: string;
}

export interface MenuCount {
  key: string;
  label: string;
  count: number;
}

export interface RsvpStats {
  /** Antworten insgesamt */
  total: number;
  /** Haushalte mit Zusage */
  yes: number;
  /** Haushalte mit Absage */
  no: number;
  /** Personen mit Zusage (inkl. Kinder) */
  persons: number;
  adults: number;
  children: number;
  highChairs: number;
  /** Shuttle-Plätze hin bzw. zurück */
  shuttleThere: number;
  shuttleBack: number;
  /** Haushalte, die den Shuttle nutzen */
  shuttleHouseholds: number;
  /** Insgesamt angefragte Zimmer (Zimmer-Option) */
  roomsRequested: number;
  overnight: CountRow[];
  events: CountRow[];
  menus: MenuCount[];
  /** Personen mit mindestens einer Unverträglichkeit */
  allergyPersons: number;
  /** Häufigkeit je Schnellauswahl, „Sonstiges“ für reine Freitext-Angaben */
  allergyTags: MenuCount[];
  /** Jüngste Änderung (ISO) oder null */
  lastUpdatedAt: string | null;
}

/** Personen einer Antwort, die tatsächlich kommen (bei Absage leer). */
export function attendingPersons(entry: RsvpEntry): RsvpPerson[] {
  return entry.attendance === 'yes' ? entry.persons : [];
}

export function hasAllergy(person: RsvpPerson): boolean {
  return allergyText(person) !== '';
}

export function computeStats(entries: readonly RsvpEntry[], labels: RsvpLabels): RsvpStats {
  const yesEntries = entries.filter((e) => e.attendance === 'yes');
  const persons = yesEntries.flatMap((e) => e.persons);

  const menuCounts = new Map<string, number>();
  for (const person of persons) {
    menuCounts.set(person.menu, (menuCounts.get(person.menu) ?? 0) + 1);
  }
  const menuOptions = [...labels.menuOptions, labels.childMenu];
  const menus: MenuCount[] = menuOptions
    .map((option) => ({ key: option.value, label: option.label, count: menuCounts.get(option.value) ?? 0 }))
    // Kindermenü nur zeigen, wenn es gewählt wurde
    .filter((row) => row.key !== labels.childMenu.value || row.count > 0);
  const unknownMenus = persons.filter((p) => !menuOptions.some((o) => o.value === p.menu)).length;
  if (unknownMenus > 0) menus.push({ key: '', label: 'Ohne Angabe', count: unknownMenus });

  const tagCounts = new Map<string, number>();
  let otherCount = 0;
  for (const person of persons) {
    for (const tag of person.allergyTags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    if (person.allergyNote.trim()) otherCount += 1;
  }
  const knownTags = [...labels.allergyOptions, ...[...tagCounts.keys()].filter((t) => !labels.allergyOptions.includes(t))];
  const allergyTags: MenuCount[] = knownTags
    .map((tag) => ({ key: tag, label: tag, count: tagCounts.get(tag) ?? 0 }))
    .filter((row) => row.count > 0);
  if (otherCount > 0) allergyTags.push({ key: 'sonstiges', label: 'Weitere Angaben', count: otherCount });

  const countBy = (match: (entry: RsvpEntry) => boolean) => {
    const matching = yesEntries.filter(match);
    return { households: matching.length, persons: matching.reduce((sum, e) => sum + e.persons.length, 0) };
  };

  let shuttleThere = 0;
  let shuttleBack = 0;
  let shuttleHouseholds = 0;
  for (const entry of yesEntries) {
    const shuttle = entry.shuttle;
    if (!shuttle || (!shuttle.there && !shuttle.back)) continue;
    shuttleHouseholds += 1;
    if (shuttle.there) shuttleThere += shuttle.seats;
    if (shuttle.back) shuttleBack += shuttle.seats;
  }

  const roomsRequested = yesEntries.reduce((sum, e) => sum + (e.rooms ?? 0), 0);

  const children = persons.filter((p) => p.child);
  const lastUpdatedAt = entries.reduce<string | null>(
    (latest, e) => (latest === null || e.updatedAt > latest ? e.updatedAt : latest),
    null,
  );

  return {
    total: entries.length,
    yes: yesEntries.length,
    no: entries.length - yesEntries.length,
    persons: persons.length,
    adults: persons.length - children.length,
    children: children.length,
    highChairs: children.filter((p) => p.highChair).length,
    shuttleThere,
    shuttleBack,
    shuttleHouseholds,
    roomsRequested,
    overnight: labels.overnightOptions.map((option) => ({
      key: option.value,
      label: option.label,
      ...countBy((e) => e.overnight === option.value),
    })),
    events: labels.events.map((event) => ({
      key: event.id,
      label: event.label,
      detail: event.detail,
      ...countBy((e) => e.events.includes(event.id)),
    })),
    menus,
    allergyPersons: persons.filter(hasAllergy).length,
    allergyTags,
    lastUpdatedAt,
  };
}

/* ---------------------------------------------------------------------------
 * Beschriftungen
 * ------------------------------------------------------------------------- */

export function menuLabel(value: string, labels: RsvpLabels): string {
  if (!value) return 'Ohne Angabe';
  if (value === labels.childMenu.value) return labels.childMenu.label;
  return labels.menuOptions.find((o) => o.value === value)?.label ?? value;
}

/** Kurzform für enge Tabellen: „Vegetarisch“ → „Veg.“, „Kindermenü“ → „Kinder“. */
export function shortMenuLabel(label: string): string {
  if (/^vegetarisch$/i.test(label)) return 'Veg.';
  const withoutSuffix = label.replace(/[-\s]?men(ü|ue)$/i, '');
  const base = withoutSuffix || label;
  return base.length > 10 ? `${base.slice(0, 4)}.` : base;
}

/**
 * Menüs einer Personenliste zusammengefasst, z. B. „2× Veg., 1× Fisch“.
 * Reihenfolge wie in den Optionen; `short: false` nutzt die vollen Namen.
 */
export function menuSummary(persons: readonly RsvpPerson[], labels: RsvpLabels, { short = true } = {}): string {
  const counts = new Map<string, number>();
  for (const person of persons) counts.set(person.menu, (counts.get(person.menu) ?? 0) + 1);
  const order = [...labels.menuOptions.map((o) => o.value), labels.childMenu.value];
  const keys = [...counts.keys()].sort((a, b) => rank(order, a) - rank(order, b));
  return keys
    .map((key) => {
      const label = menuLabel(key, labels);
      return `${counts.get(key)}× ${short ? shortMenuLabel(label) : label}`;
    })
    .join(', ');
}

function rank(order: readonly string[], key: string): number {
  const index = order.indexOf(key);
  return index === -1 ? order.length : index;
}

export function eventLabels(ids: readonly string[], labels: RsvpLabels): string[] {
  return labels.events.filter((e) => ids.includes(e.id)).map((e) => e.label);
}

export function overnightLabel(value: string | null, labels: RsvpLabels): string {
  if (!value) return '';
  return labels.overnightOptions.find((o) => o.value === value)?.label ?? value;
}

/** Shuttle als kurzer Text, z. B. „hin & zurück · 2 Plätze“ (leer, wenn nicht gewünscht). */
export function shuttleText(entry: RsvpEntry): string {
  const shuttle = entry.attendance === 'yes' ? entry.shuttle : null;
  if (!shuttle || (!shuttle.there && !shuttle.back)) return '';
  const direction = shuttle.there && shuttle.back ? 'hin & zurück' : shuttle.there ? 'nur hin' : 'nur zurück';
  return `${direction} · ${shuttle.seats} ${shuttle.seats === 1 ? 'Platz' : 'Plätze'}`;
}

/* ---------------------------------------------------------------------------
 * Unverträglichkeiten (für den Caterer)
 * ------------------------------------------------------------------------- */

export interface AllergyItem {
  entryId: string;
  household: string;
  person: string;
  child: boolean;
  menu: string;
  text: string;
}

export function allergyList(entries: readonly RsvpEntry[], labels: RsvpLabels): AllergyItem[] {
  return entries
    .flatMap((entry) =>
      attendingPersons(entry)
        .filter(hasAllergy)
        .map((person) => ({
          entryId: entry.id,
          household: entry.name,
          person: person.name || entry.name,
          child: person.child,
          menu: menuLabel(person.menu, labels),
          text: allergyText(person),
        })),
    )
    .sort((a, b) => a.person.localeCompare(b.person, 'de'));
}

/* ---------------------------------------------------------------------------
 * Nachrichten & Musikwünsche
 * ------------------------------------------------------------------------- */

export interface NoteItem {
  entryId: string;
  name: string;
  text: string;
  updatedAt: string;
}

/** Nachrichten (neueste zuerst). */
export function messageList(entries: readonly RsvpEntry[]): NoteItem[] {
  return notes(entries, (e) => e.message);
}

/** Musikwünsche (neueste zuerst). */
export function songWishList(entries: readonly RsvpEntry[]): NoteItem[] {
  return notes(entries, (e) => e.songWish);
}

function notes(entries: readonly RsvpEntry[], pick: (entry: RsvpEntry) => string): NoteItem[] {
  return entries
    .filter((e) => pick(e).trim() !== '')
    .map((e) => ({ entryId: e.id, name: e.name, text: pick(e).trim(), updatedAt: e.updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/* ---------------------------------------------------------------------------
 * Suche & mögliche Duplikate
 * ------------------------------------------------------------------------- */

/** Für Vergleiche: klein, ohne Akzente, Umlaute ausgeschrieben, nur Buchstaben/Ziffern. */
export function foldText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const NAME_STOP_WORDS = new Set(['und', 'u', 'familie', 'fam', 'family', 'mit']);

/**
 * Normalisierter Haushaltsname: „Ben und Anna Müller“ und „Anna & Ben Mueller“
 * ergeben denselben Schlüssel („anna ben mueller“).
 */
export function normalizeName(name: string): string {
  return foldText(name)
    .split(' ')
    .filter((word) => word && !NAME_STOP_WORDS.has(word))
    .sort()
    .join(' ');
}

export interface DuplicateHint {
  /** ID der anderen Antwort */
  id: string;
  name: string;
  reason: 'email' | 'name';
}

/**
 * Mögliche Doppel-Antworten: gleiche E-Mail-Adresse oder gleicher
 * normalisierter Name. Ergebnis: ID → Hinweise auf die anderen Antworten.
 */
export function findDuplicates(entries: readonly RsvpEntry[]): Map<string, DuplicateHint[]> {
  const groups = new Map<string, RsvpEntry[]>();
  const add = (key: string, entry: RsvpEntry) => {
    const list = groups.get(key);
    if (list) list.push(entry);
    else groups.set(key, [entry]);
  };
  for (const entry of entries) {
    const email = entry.email.trim().toLowerCase();
    if (email) add(`email:${email}`, entry);
    const name = normalizeName(entry.name);
    if (name) add(`name:${name}`, entry);
  }

  const result = new Map<string, DuplicateHint[]>();
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const reason = key.startsWith('email:') ? 'email' : 'name';
    for (const entry of group) {
      const hints = result.get(entry.id) ?? [];
      for (const other of group) {
        if (other.id === entry.id || hints.some((h) => h.id === other.id)) continue;
        hints.push({ id: other.id, name: other.name, reason });
      }
      result.set(entry.id, hints);
    }
  }
  return result;
}
