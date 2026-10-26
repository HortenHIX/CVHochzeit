/** Datenmodell einer Rückmeldung (RSVP). */

export type Attendance = 'yes' | 'no';

export interface RsvpPerson {
  name: string;
  /** `value` aus site.rsvp.menuOptions bzw. site.rsvp.childMenu (leer, wenn keine Auswahl) */
  menu: string;
  child: boolean;
  /** Eintrag aus site.rsvp.childAgeOptions ('' wenn kein Kind) */
  childAge: string;
  highChair: boolean;
  /** Angehakte Schnellauswahl aus site.rsvp.allergyOptions */
  allergyTags: string[];
  /** Weitere Unverträglichkeiten, Freitext */
  allergyNote: string;
}

/** `value` aus site.rsvp.overnightOptions */
export type Overnight = string;

export interface RsvpShuttle {
  there: boolean;
  back: boolean;
  /** Abfahrtsort (Hotelname) */
  from: string;
  seats: number;
}

export interface RsvpEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Wie oft die Antwort geändert wurde (0 = Erstantwort) */
  revision: number;
  /** Ansprechpartner/in der Antwort (Haushalt) */
  name: string;
  email: string;
  attendance: Attendance;
  /** Alle Personen inkl. Ansprechpartner/in – nur bei Zusage befüllt */
  persons: RsvpPerson[];
  /** IDs aus site.rsvp.events – nur bei Zusage befüllt */
  events: string[];
  /** null = nicht gefragt / nicht beantwortet */
  overnight: Overnight | null;
  shuttle: RsvpShuttle | null;
  /** Benötigte Zimmer (nur bei der Zimmer-Option; ältere Einträge ohne Angabe) */
  rooms?: number | null;
  /** Wünsche zur Übernachtung, z. B. Anreise am Freitag (ältere Einträge ohne Angabe) */
  stayNote?: string;
  songWish: string;
  message: string;
}

/** Grenzen für Eingaben (Server-Validierung). */
export const RSVP_LIMITS = {
  name: 120,
  email: 200,
  allergyNote: 300,
  stayNote: 300,
  songWish: 200,
  message: 500,
} as const;

/** Alle Unverträglichkeiten einer Person als lesbarer Text. */
export function allergyText(person: RsvpPerson): string {
  return [...person.allergyTags, person.allergyNote.trim()].filter(Boolean).join(', ');
}
