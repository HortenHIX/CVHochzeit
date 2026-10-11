import type { Attendance, RsvpEntry, RsvpPerson, RsvpShuttle } from './types';

/**
 * Gemeinsame Typen und Helfer des Zusage-Formulars – im Browser (Formular,
 * Vorab-Prüfung) und auf dem Server (Server Action) nutzbar. Keine
 * server-only-Importe hier.
 */

/* ---------------------------------------------------------------------------
 * Formularwerte (Rohwerte, so wie sie im Formular stehen)
 * ------------------------------------------------------------------------- */

export type AttendanceValue = '' | Attendance;

export interface PersonFormValues {
  name: string;
  menu: string;
  child: boolean;
  childAge: string;
  highChair: boolean;
  allergyTags: string[];
  /** „Sonstiges“ angehakt (blendet das Textfeld ein) */
  allergyOther: boolean;
  allergyNote: string;
}

export interface RsvpFormValues {
  attendance: AttendanceValue;
  name: string;
  email: string;
  persons: PersonFormValues[];
  events: string[];
  overnight: string;
  shuttleThere: boolean;
  shuttleBack: boolean;
  shuttleFrom: string;
  shuttleSeats: number;
  songWish: string;
  message: string;
  consent: boolean;
}

/** Feldschlüssel → Meldung. `form` = allgemeiner Fehler ohne Feldbezug. */
export type RsvpFieldErrors = Record<string, string>;

/** Was der Browser von einer gespeicherten Antwort sehen darf (ohne ID & Revision). */
export interface RsvpSummary {
  name: string;
  email: string;
  attendance: Attendance;
  persons: RsvpPerson[];
  events: string[];
  overnight: string | null;
  shuttle: RsvpShuttle | null;
  songWish: string;
  message: string;
  updatedAt: string;
}

/** Startwerte für das Formular, wenn dieses Gerät schon geantwortet hat. */
export interface RsvpInitial {
  summary: RsvpSummary;
  values: RsvpFormValues;
}

export type RsvpErrorKind = 'validation' | 'auth' | 'closed' | 'storage';

export type RsvpFormState =
  | { status: 'idle'; attempt: number }
  | {
      status: 'error';
      attempt: number;
      kind: RsvpErrorKind;
      errors: RsvpFieldErrors;
      values: RsvpFormValues;
    }
  | { status: 'success'; attempt: number; summary: RsvpSummary; values: RsvpFormValues };

export const INITIAL_FORM_STATE: RsvpFormState = { status: 'idle', attempt: 0 };

/* ---------------------------------------------------------------------------
 * Konstanten
 * ------------------------------------------------------------------------- */

/** Unsichtbares Feld gegen Spam-Bots – Menschen lassen es leer. */
export const HONEYPOT_FIELD = 'website';
/** „new“ legt eine neue Antwort an, „update“ ändert die eigene (Cookie). */
export const INTENT_FIELD = 'intent';
export type RsvpIntent = 'new' | 'update';
/** Schlüssel des lokalen Entwurfs (localStorage) */
export const DRAFT_KEY = 'cv-hochzeit:zusage-entwurf';
export const DRAFT_VERSION = 1;
/** Ab dieser Länge meldet der Zeichenzähler der Nachricht sich bei Screenreadern. */
export const MESSAGE_ANNOUNCE_FROM = 450;


/* ---------------------------------------------------------------------------
 * Startwerte & Umwandlungen
 * ------------------------------------------------------------------------- */

export function emptyPerson(name = ''): PersonFormValues {
  return {
    name,
    menu: '',
    child: false,
    childAge: '',
    highChair: false,
    allergyTags: [],
    allergyOther: false,
    allergyNote: '',
  };
}

/** Leeres Formular. Programmpunkte (`allEventIds`) sind standardmäßig alle angehakt. */
export function emptyValues(allEventIds: readonly string[] = []): RsvpFormValues {
  return {
    attendance: '',
    name: '',
    email: '',
    persons: [emptyPerson()],
    events: [...allEventIds],
    overnight: '',
    shuttleThere: false,
    shuttleBack: false,
    shuttleFrom: '',
    shuttleSeats: 1,
    songWish: '',
    message: '',
    consent: false,
  };
}

/** Gespeicherte Antwort → Formularwerte („Antwort ändern“). */
export function entryToValues(entry: RsvpSummary): RsvpFormValues {
  const base = emptyValues();
  const persons: PersonFormValues[] = entry.persons.length
    ? entry.persons.map((p) => ({
        name: p.name,
        menu: p.menu,
        child: p.child,
        childAge: p.childAge,
        highChair: p.highChair,
        allergyTags: [...p.allergyTags],
        allergyOther: p.allergyNote.trim() !== '',
        allergyNote: p.allergyNote,
      }))
    : [emptyPerson(entry.name)];
  return {
    ...base,
    attendance: entry.attendance,
    name: entry.name,
    email: entry.email,
    persons,
    events: entry.attendance === 'yes' ? [...entry.events] : base.events,
    overnight: entry.overnight ?? '',
    shuttleThere: entry.shuttle?.there ?? false,
    shuttleBack: entry.shuttle?.back ?? false,
    shuttleFrom: entry.shuttle?.from ?? '',
    shuttleSeats: entry.shuttle && entry.shuttle.seats > 0 ? entry.shuttle.seats : persons.length,
    songWish: entry.songWish,
    message: entry.message,
    // Wer schon gespeichert hat, hat bereits eingewilligt.
    consent: true,
  };
}

/** Interne Felder (ID, Revision, Anlagedatum) bleiben auf dem Server. */
export function toSummary(entry: RsvpEntry): RsvpSummary {
  return {
    name: entry.name,
    email: entry.email,
    attendance: entry.attendance,
    persons: entry.persons,
    events: entry.events,
    overnight: entry.overnight,
    shuttle: entry.shuttle,
    songWish: entry.songWish,
    message: entry.message,
    updatedAt: entry.updatedAt,
  };
}

/* ---------------------------------------------------------------------------
 * Feld-IDs (Anker der Fehlerliste)
 * ------------------------------------------------------------------------- */

/** z. B. `p1.menu` → `rsvp-p1-menu` */
export function fieldId(key: string): string {
  return `rsvp-${key.replace(/\./g, '-')}`;
}

export function errorId(key: string): string {
  return `${fieldId(key)}-fehler`;
}

/* ---------------------------------------------------------------------------
 * Texte
 * ------------------------------------------------------------------------- */

/**
 * Anrede für „Danke, …!“: Vorname(n) aus dem Namen.
 * „Anna Müller“ → „Anna“, „Anna & Ben Müller“ → „Anna & Ben“,
 * „Familie Müller“ bleibt vollständig.
 */
export function greetingName(name: string): string {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  if (/^(familie|fam\.?)\s/i.test(clean)) return clean;
  const joiners = clean.match(/\s(?:&|\+|und)\s/gi) ?? [];
  const parts = clean.split(/\s(?:&|\+|und)\s/i);
  const firsts = parts.map((part) => {
    const words = part.split(' ').filter((w) => !/^(dr|prof|herr|frau)\.?$/i.test(w));
    return words[0] ?? part;
  });
  return firsts.reduce((acc, first, i) => (i === 0 ? first : `${acc}${joiners[i - 1] ?? ' & '}${first}`), '');
}

export function personCountText(count: number): string {
  return count === 1 ? '1 Person' : `${count} Personen`;
}


