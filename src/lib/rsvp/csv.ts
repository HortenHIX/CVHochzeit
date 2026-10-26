import { attendingPersons, menuLabel, menuSummary, overnightLabel, type RsvpLabels } from './stats';
import { allergyText, type RsvpEntry } from './types';

/**
 * CSV-Export der Rückmeldungen – für deutsches Excel:
 * Semikolon als Trenner, CRLF als Zeilenende, UTF-8 mit BOM.
 *
 * Reine Funktionen ohne Next.js-Abhängigkeiten (gut testbar).
 */

export const CSV_SEPARATOR = ';';
export const CSV_NEWLINE = '\r\n';
export const CSV_BOM = '﻿';

export type CsvValue = string | number | boolean | null | undefined;

export type ExportKind = 'haushalte' | 'personen';

export const EXPORT_KINDS: readonly ExportKind[] = ['haushalte', 'personen'];

export function isExportKind(value: unknown): value is ExportKind {
  return typeof value === 'string' && (EXPORT_KINDS as readonly string[]).includes(value);
}

export interface CsvOptions {
  /** Zeitzone für Datumsangaben (Standard: Europe/Berlin) */
  timeZone?: string;
}

/** Zeichen, mit denen Tabellenprogramme eine Formel erkennen (CSV-Injection). */
const FORMULA_START = /^[=+\-@\t\r\n]/;

/**
 * Eine Zelle sicher ausgeben:
 * - Texte, die mit = + - @ Tab oder Zeilenumbruch beginnen, bekommen ein `'`
 *   vorangestellt, damit Excel & Co. sie nicht als Formel ausführen.
 * - Zellen mit Trenner, Anführungszeichen, Zeilenumbruch oder Rand-Leerzeichen
 *   werden in "…" gesetzt, innere Anführungszeichen verdoppelt.
 * - Zahlen bleiben Zahlen, true/false wird „ja“/„nein“, null/undefined leer.
 */
export function escapeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'ja' : 'nein';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  let text = value;
  if (FORMULA_START.test(text)) text = `'${text}`;
  if (/[";\r\n]/.test(text) || text !== text.trim()) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Zeilen → CSV-Text mit BOM und CRLF (auch nach der letzten Zeile). */
export function toCsv(rows: readonly (readonly CsvValue[])[]): string {
  return CSV_BOM + rows.map((row) => row.map(escapeCsvCell).join(CSV_SEPARATOR)).join(CSV_NEWLINE) + CSV_NEWLINE;
}

/** „11.10.2026 14:32“ – ohne Komma, damit Excel das Datum erkennt. */
export function csvDateTime(iso: string, timeZone = 'Europe/Berlin'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  })
    .format(date)
    .replace(', ', ' ');
}

function yesNo(answer: boolean | null | undefined, applicable: boolean): CsvValue {
  return applicable ? Boolean(answer) : '';
}

/* ---------------------------------------------------------------------------
 * Export „Haushalte“: eine Zeile pro Antwort
 * ------------------------------------------------------------------------- */

export function householdRows(entries: readonly RsvpEntry[], labels: RsvpLabels, options: CsvOptions = {}): CsvValue[][] {
  const header: CsvValue[] = [
    'Haushalt',
    'E-Mail',
    'Antwort',
    'Personen',
    'Erwachsene',
    'Kinder',
    'Namen',
    'Menüs',
    ...labels.events.map((e) => `Programm: ${e.label}`),
    'Übernachtung',
    'Zimmer',
    'Übernachtungswünsche',
    'Shuttle hin',
    'Shuttle zurück',
    'Shuttle ab',
    'Shuttle-Plätze',
    'Unverträglichkeiten',
    'Musikwunsch',
    'Nachricht',
    'Eingegangen am',
    'Zuletzt geändert',
    'Anzahl Änderungen',
  ];

  const rows = entries.map((entry): CsvValue[] => {
    const yes = entry.attendance === 'yes';
    const persons = attendingPersons(entry);
    const children = persons.filter((p) => p.child).length;
    const shuttle = yes ? entry.shuttle : null;
    const wantsShuttle = Boolean(shuttle && (shuttle.there || shuttle.back));
    const allergies = persons
      .map((p) => {
        const text = allergyText(p);
        return text ? `${p.name || entry.name}: ${text}` : '';
      })
      .filter(Boolean)
      .join(' | ');
    return [
      entry.name,
      entry.email,
      yes ? 'Zusage' : 'Absage',
      persons.length,
      yes ? persons.length - children : '',
      yes ? children : '',
      persons.map((p) => p.name).join(', '),
      menuSummary(persons, labels, { short: false }),
      ...labels.events.map((e) => yesNo(entry.events.includes(e.id), yes)),
      overnightLabel(yes ? entry.overnight : null, labels),
      yes ? (entry.rooms ?? '') : '',
      yes ? (entry.stayNote ?? '') : '',
      yesNo(shuttle?.there, yes && shuttle !== null),
      yesNo(shuttle?.back, yes && shuttle !== null),
      wantsShuttle ? shuttle?.from : '',
      wantsShuttle ? shuttle?.seats : '',
      allergies,
      entry.songWish,
      entry.message,
      csvDateTime(entry.createdAt, options.timeZone),
      csvDateTime(entry.updatedAt, options.timeZone),
      entry.revision,
    ];
  });

  return [header, ...rows];
}

/* ---------------------------------------------------------------------------
 * Export „Gäste pro Person“: eine Zeile pro zugesagter Person (Catering, Sitzplan)
 * ------------------------------------------------------------------------- */

export function personRows(entries: readonly RsvpEntry[], labels: RsvpLabels): CsvValue[][] {
  const header: CsvValue[] = [
    'Name',
    'Haushalt',
    'Kind',
    'Alter',
    'Hochstuhl',
    'Menü',
    'Unverträglichkeiten',
    ...labels.events.map((e) => `Programm: ${e.label}`),
    'Übernachtung',
    'Shuttle hin (Haushalt)',
    'Shuttle zurück (Haushalt)',
    'Shuttle ab',
    'Shuttle-Plätze (Haushalt)',
    'E-Mail (Haushalt)',
  ];

  const rows = entries.flatMap((entry) =>
    attendingPersons(entry).map((person): CsvValue[] => {
      const shuttle = entry.shuttle;
      const wantsShuttle = Boolean(shuttle && (shuttle.there || shuttle.back));
      return [
        person.name || entry.name,
        entry.name,
        person.child,
        person.child ? person.childAge : '',
        person.child ? person.highChair : '',
        menuLabel(person.menu, labels),
        allergyText(person),
        ...labels.events.map((e) => entry.events.includes(e.id)),
        overnightLabel(entry.overnight, labels),
        yesNo(shuttle?.there, shuttle !== null),
        yesNo(shuttle?.back, shuttle !== null),
        wantsShuttle ? shuttle?.from : '',
        wantsShuttle ? (shuttle?.seats ?? '') : '',
        entry.email,
      ];
    }),
  );

  return [header, ...rows];
}

/* ---------------------------------------------------------------------------
 * Gesamter Export
 * ------------------------------------------------------------------------- */

/** Sortierung für den Export: nach Haushaltsname (de), dann Eingang. */
function sortedForExport(entries: readonly RsvpEntry[]): RsvpEntry[] {
  return [...entries].sort(
    (a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }) || a.createdAt.localeCompare(b.createdAt),
  );
}

export function exportCsv(
  kind: ExportKind,
  entries: readonly RsvpEntry[],
  labels: RsvpLabels,
  options: CsvOptions = {},
): string {
  const sorted = sortedForExport(entries);
  return toCsv(kind === 'personen' ? personRows(sorted, labels) : householdRows(sorted, labels, options));
}

/** Dateiname, z. B. `cv-zusagen-2027-05-01.csv` bzw. `cv-gaeste-2027-05-01.csv`. */
export function exportFileName(kind: ExportKind, now: Date, timeZone = 'Europe/Berlin'): string {
  // en-CA formatiert als JJJJ-MM-TT
  const day = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(now);
  return `cv-${kind === 'personen' ? 'gaeste' : 'zusagen'}-${day}.csv`;
}
