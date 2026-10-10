/** Datenmodell einer Rückmeldung (RSVP). */

export type Attendance = 'yes' | 'no';

export interface RsvpPerson {
  name: string;
  /** `value` aus site.rsvp.menuOptions (leer, wenn keine Auswahl) */
  menu: string;
  child: boolean;
  /** Unverträglichkeiten / Allergien, Freitext */
  allergies: string;
}

export interface RsvpEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Wie oft die Antwort geändert wurde (0 = Erstantwort) */
  revision: number;
  /** Ansprechpartner/in der Antwort */
  name: string;
  email: string;
  phone: string;
  attendance: Attendance;
  /** Alle Personen inkl. Ansprechpartner/in – nur bei Zusage befüllt */
  persons: RsvpPerson[];
  /** IDs aus site.rsvp.events – nur bei Zusage befüllt */
  events: string[];
  /** null = Frage nicht gestellt / nicht beantwortet */
  overnight: boolean | null;
  shuttle: boolean | null;
  message: string;
}

/** Grenzen für Eingaben (Server-Validierung). */
export const RSVP_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  allergies: 300,
  message: 2000,
} as const;
