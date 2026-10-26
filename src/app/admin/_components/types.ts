import type { DuplicateHint } from '@/lib/rsvp/stats';

/** Eine aufbereitete Antwort für Tabelle und Karten (serialisierbar). */
export interface AdminRow {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  personsCount: number;
  childrenCount: number;
  /** z. B. „2× Veg., 1× Fisch“ */
  menuSummary: string;
  /** z. B. „2× Vegetarisch, 1× Fisch“ */
  menuSummaryLong: string;
  /** „alle“, Liste der Programmpunkte oder leer */
  eventsShort: string;
  eventLabels: string[];
  overnight: string;
  /** Benötigte Zimmer (nur bei Zusage mit Zimmer-Option) */
  rooms: number | null;
  stayNote: string;
  /** z. B. „hin & zurück · 2 Plätze“ */
  shuttle: string;
  shuttleFrom: string;
  /** Personen mit Unverträglichkeiten */
  allergyCount: number;
  /** z. B. „Laktose, Nüsse“ */
  allergySummary: string;
  message: string;
  songWish: string;
  createdAt: string;
  createdLabel: string;
  updatedAt: string;
  updatedLabel: string;
  revision: number;
  duplicates: DuplicateHint[];
  persons: AdminPerson[];
  /** Vorbereiteter Suchtext (Haushalt, Personen, E-Mail) */
  search: string;
}

export interface AdminPerson {
  name: string;
  menu: string;
  child: boolean;
  childAge: string;
  highChair: boolean;
  allergies: string;
}

export type Segment = 'alle' | 'zusagen' | 'absagen';

export interface AdminFilters {
  query: string;
  segment: Segment;
  allergyOnly: boolean;
}
