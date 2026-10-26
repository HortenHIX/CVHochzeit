import type { RsvpConfig } from './config';
import {
  emptyPerson,
  emptyValues,
  type PersonFormValues,
  type RsvpFieldErrors,
  type RsvpFormValues,
} from './form-state';
import { RSVP_LIMITS, type RsvpEntry, type RsvpPerson, type RsvpShuttle } from './types';

/**
 * Prüfung des Zusage-Formulars. Läuft identisch im Browser (Vorab-Prüfung
 * beim Absenden) und in der Server Action (verbindlich).
 *
 * Meldungen sind als Lösung formuliert („Bitte wählt ein Menü für Person 2.“)
 * und in Formular-Reihenfolge sortiert.
 */

export type RsvpEntryData = Omit<RsvpEntry, 'id' | 'createdAt' | 'updatedAt' | 'revision'>;

export type RsvpParseResult =
  | { ok: true; entryData: RsvpEntryData; values: RsvpFormValues }
  | { ok: false; errors: RsvpFieldErrors; values: RsvpFormValues };

/** Höchstens so viele Personen-Blöcke werden überhaupt gelesen (Schutz vor Unsinn). */
const PERSON_SCAN_LIMIT = 30;

/* ---------------------------------------------------------------------------
 * Bereinigen
 * ------------------------------------------------------------------------- */

/** Steuer- und unsichtbare Richtungszeichen entfernen (Zeilenumbrüche optional behalten). */
function stripControl(input: string, keepNewlines: boolean): string {
  let out = '';
  for (const ch of input) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 10 && keepNewlines) {
      out += '\n';
      continue;
    }
    const isControl = c < 32 || (c >= 127 && c < 160);
    const isInvisible = c === 0x200b || c === 0x200e || c === 0x200f || (c >= 0x202a && c <= 0x202e) || (c >= 0x2066 && c <= 0x2069) || c === 0xfeff;
    if (isControl || isInvisible) {
      // Tabs und Umbrüche werden zu Leerzeichen, alles andere fällt weg.
      if (c === 9 || c === 10 || c === 13) out += ' ';
      continue;
    }
    out += ch;
  }
  return out;
}

/** Einzeiliger Text: getrimmt, ohne Steuerzeichen, Mehrfach-Leerzeichen zusammengefasst. */
export function cleanLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return stripControl(value.normalize('NFC'), false).replace(/ {2,}/g, ' ').trim();
}

/** Mehrzeiliger Text: Umbrüche bleiben (höchstens eine Leerzeile am Stück). */
export function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return stripControl(value.normalize('NFC').replace(/\r\n?/g, '\n'), true)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function flag(formData: FormData, key: string): boolean {
  return formData.get(key) === 'on';
}

function all(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === 'string');
}

/* ---------------------------------------------------------------------------
 * FormData → Formularwerte
 * ------------------------------------------------------------------------- */

export function readFormValues(formData: FormData): RsvpFormValues {
  const base = emptyValues();
  const rawAttendance = str(formData, 'attendance');
  const attendance = rawAttendance === 'yes' || rawAttendance === 'no' ? rawAttendance : '';

  const persons: PersonFormValues[] = [];
  for (let i = 0; i < PERSON_SCAN_LIMIT && formData.has(`p${i}.name`); i++) {
    const child = flag(formData, `p${i}.child`);
    const allergyOther = flag(formData, `p${i}.allergyOther`);
    persons.push({
      name: cleanLine(str(formData, `p${i}.name`)),
      menu: cleanLine(str(formData, `p${i}.menu`)),
      child,
      childAge: child ? cleanLine(str(formData, `p${i}.childAge`)) : '',
      highChair: child && flag(formData, `p${i}.highChair`),
      allergyTags: [...new Set(all(formData, `p${i}.allergy`).map(cleanLine).filter(Boolean))],
      allergyOther,
      allergyNote: allergyOther ? cleanLine(str(formData, `p${i}.allergyNote`)) : '',
    });
  }

  const name = cleanLine(str(formData, 'name'));
  const events = all(formData, 'events').map(cleanLine);
  const seats = Number.parseInt(str(formData, 'shuttleSeats'), 10);

  return {
    attendance,
    name,
    email: cleanLine(str(formData, 'email')),
    persons: persons.length ? persons : [emptyPerson(name)],
    // Bei Absage sind die Programmpunkte nicht im Formular – Standard behalten.
    events: attendance === 'yes' || events.length ? events : base.events,
    overnight: cleanLine(str(formData, 'overnight')),
    shuttleThere: flag(formData, 'shuttleThere'),
    shuttleBack: flag(formData, 'shuttleBack'),
    shuttleFrom: cleanLine(str(formData, 'shuttleFrom')),
    shuttleSeats: Number.isFinite(seats) ? seats : 0,
    songWish: cleanLine(str(formData, 'songWish')),
    message: cleanText(str(formData, 'message')),
    consent: flag(formData, 'consent'),
  };
}

/**
 * Formularwerte aus dem Browser-Zustand so bereinigen, wie es readFormValues
 * mit FormData tut – für die Live-Prüfung ohne Umweg über FormData.
 */
export function cleanValues(values: RsvpFormValues): RsvpFormValues {
  return {
    ...values,
    name: cleanLine(values.name),
    email: cleanLine(values.email),
    persons: values.persons.map((p) => ({
      name: cleanLine(p.name),
      menu: cleanLine(p.menu),
      child: p.child,
      childAge: p.child ? cleanLine(p.childAge) : '',
      highChair: p.child && p.highChair,
      allergyTags: [...p.allergyTags],
      allergyOther: p.allergyOther,
      allergyNote: p.allergyOther ? cleanLine(p.allergyNote) : '',
    })),
    overnight: cleanLine(values.overnight),
    shuttleFrom: cleanLine(values.shuttleFrom),
    songWish: cleanLine(values.songWish),
    message: cleanText(values.message),
  };
}

/* ---------------------------------------------------------------------------
 * Prüfung
 * ------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

function tooLong(value: string, limit: number): boolean {
  return value.length > limit;
}

export function validateValues(values: RsvpFormValues, config: RsvpConfig): RsvpParseResult {
  const errors: RsvpFieldErrors = {};
  const { rsvp } = config;
  const attending = values.attendance === 'yes';

  // 1. Kommt ihr?
  if (values.attendance !== 'yes' && values.attendance !== 'no') {
    errors.attendance = 'Bitte wählt aus, ob ihr kommt.';
  }
  if (!values.name) {
    errors.name = 'Bitte gebt euren Namen an.';
  } else if (tooLong(values.name, RSVP_LIMITS.name)) {
    errors.name = `Bitte kürzt euren Namen auf höchstens ${RSVP_LIMITS.name} Zeichen.`;
  }
  if (values.email && (tooLong(values.email, RSVP_LIMITS.email) || !EMAIL_RE.test(values.email))) {
    errors.email = 'Bitte prüft die E-Mail-Adresse (z. B. name@beispiel.de) – oder lasst das Feld leer.';
  }

  // 2. Wer kommt?
  const persons: RsvpPerson[] = [];
  if (attending) {
    if (values.persons.length < 1 || values.persons.length > rsvp.maxPersons) {
      errors.persons = `Bitte tragt zwischen 1 und ${rsvp.maxPersons} Personen ein.`;
    }
    const menuValues = rsvp.menuOptions.map((o) => o.value);
    values.persons.slice(0, rsvp.maxPersons).forEach((p, i) => {
      const who = `Person ${i + 1}`;
      const key = (field: string) => `p${i}.${field}`;
      const child = rsvp.allowChildren && p.child;

      if (!p.name) errors[key('name')] = `Bitte gebt den Namen von ${who} an.`;
      else if (tooLong(p.name, RSVP_LIMITS.name))
        errors[key('name')] = `Bitte kürzt den Namen von ${who} auf höchstens ${RSVP_LIMITS.name} Zeichen.`;

      const isChildMenu = p.menu === rsvp.childMenu.value;
      if (!p.menu || (!menuValues.includes(p.menu) && !isChildMenu)) {
        errors[key('menu')] = `Bitte wählt ein Menü für ${who}.`;
      } else if (isChildMenu && !child) {
        errors[key('menu')] = `Das Kindermenü gibt es nur für Kinder – bitte wählt ein anderes Menü für ${who}.`;
      }

      if (child && p.childAge && !rsvp.childAgeOptions.includes(p.childAge)) {
        errors[key('childAge')] = `Bitte wählt das Alter von ${who} aus der Liste.`;
      }

      if (p.allergyOther && !p.allergyNote) {
        errors[key('allergyNote')] =
          `Bitte beschreibt die Unverträglichkeit von ${who} – oder entfernt das Häkchen bei „Sonstiges“.`;
      } else if (tooLong(p.allergyNote, RSVP_LIMITS.allergyNote)) {
        errors[key('allergyNote')] =
          `Bitte kürzt die Unverträglichkeiten von ${who} auf höchstens ${RSVP_LIMITS.allergyNote} Zeichen.`;
      }

      persons.push({
        name: p.name,
        menu: p.menu,
        child,
        childAge: child && rsvp.childAgeOptions.includes(p.childAge) ? p.childAge : '',
        highChair: child && p.highChair,
        // Nur bekannte Schnellauswahl-Werte übernehmen.
        allergyTags: rsvp.allergyOptions.filter((tag) => p.allergyTags.includes(tag)),
        allergyNote: p.allergyOther ? p.allergyNote : '',
      });
    });
  }

  // 3. Programm
  const events = attending ? config.allEventIds.filter((id) => values.events.includes(id)) : [];

  // 4. Übernachtung & Shuttle
  let overnight: string | null = null;
  if (attending && rsvp.askOvernight && values.overnight) {
    if (rsvp.overnightOptions.some((o) => o.value === values.overnight)) overnight = values.overnight;
    else errors.overnight = 'Bitte wählt eine der Möglichkeiten zur Übernachtung.';
  }

  let shuttle: RsvpShuttle | null = null;
  if (attending && config.shuttleEnabled) {
    const wanted = values.shuttleThere || values.shuttleBack;
    shuttle = { there: values.shuttleThere, back: values.shuttleBack, from: '', seats: 0 };
    if (wanted) {
      if (config.shuttleHotels.length > 0) {
        if (config.shuttleHotels.includes(values.shuttleFrom)) shuttle.from = values.shuttleFrom;
        else errors.shuttleFrom = 'Bitte wählt das Hotel für den Shuttle.';
      }
      const max = Math.max(1, persons.length);
      if (!Number.isInteger(values.shuttleSeats) || values.shuttleSeats < 1 || values.shuttleSeats > max) {
        errors.shuttleSeats =
          max === 1
            ? 'Bitte gebt 1 Platz für den Shuttle an.'
            : `Bitte gebt zwischen 1 und ${max} Plätze für den Shuttle an.`;
      } else {
        shuttle.seats = values.shuttleSeats;
      }
    }
  }

  // 5. Noch etwas?
  if (rsvp.askSongWish && attending && tooLong(values.songWish, RSVP_LIMITS.songWish)) {
    errors.songWish = `Bitte kürzt den Musikwunsch auf höchstens ${RSVP_LIMITS.songWish} Zeichen.`;
  }
  if (tooLong(values.message, RSVP_LIMITS.message)) {
    errors.message = `Bitte kürzt eure Nachricht auf höchstens ${RSVP_LIMITS.message} Zeichen.`;
  }
  if (!values.consent) {
    errors.consent = 'Bitte bestätigt die Einwilligung, damit wir eure Antwort speichern dürfen.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors, values };

  return {
    ok: true,
    values,
    entryData: {
      name: values.name,
      email: values.email,
      attendance: attending ? 'yes' : 'no',
      persons,
      events,
      overnight,
      shuttle,
      songWish: rsvp.askSongWish && attending ? values.songWish : '',
      message: values.message,
    },
  };
}

/** FormData lesen, bereinigen und prüfen. */
export function parseRsvpForm(formData: FormData, config: RsvpConfig): RsvpParseResult {
  return validateValues(readFormValues(formData), config);
}
