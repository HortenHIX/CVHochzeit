import { expect, test } from '@playwright/test';
import { clockText, rsvpClosedAt, shuttleTimesText, type RsvpConfig } from '../../src/lib/rsvp/config';
import { personRows } from '../../src/lib/rsvp/csv';
import { greetingName } from '../../src/lib/rsvp/form-state';
import type { RsvpLabels } from '../../src/lib/rsvp/stats';
import type { RsvpEntry } from '../../src/lib/rsvp/types';

test.describe('Anrede in der Bestätigung (greetingName)', () => {
  const cases: [string, string][] = [
    ['Herr und Frau Müller', 'Herr und Frau Müller'],
    ['Herr Schmidt', 'Herr Schmidt'],
    ['Frau Dr. Weber', 'Frau Dr. Weber'],
    ['Dr. Anna Muster', 'Anna'],
    ['Anna & Ben', 'Anna & Ben'],
    ['Anna & Ben Müller', 'Anna & Ben'],
    ['Clara und Dirk Beispiel', 'Clara und Dirk'],
    ['Familie Gast', 'Familie Gast'],
    ['  Anna   Müller ', 'Anna'],
    // „Herrmann“ ist keine Anrede
    ['Herrmann Fischer', 'Herrmann'],
  ];
  for (const [input, expected] of cases) {
    test(`„${input}“ → „${expected}“`, () => {
      expect(greetingName(input)).toBe(expected);
    });
  }
});

test.describe('Uhrzeiten', () => {
  test('immer zweistellig wie im Fahrplan', () => {
    expect(clockText('2:30')).toBe('02:30 Uhr');
    expect(clockText('02:30')).toBe('02:30 Uhr');
    expect(clockText('23:30')).toBe('23:30 Uhr');
  });

  test('Rückfahrten über Mitternacht', () => {
    const rides = [
      { direction: 'zurueck' as const, time: '02:30' },
      { direction: 'zurueck' as const, time: '23:30' },
      { direction: 'hin' as const, time: '13:15' },
    ];
    expect(shuttleTimesText(rides, 'zurueck')).toBe('ab 23:30 Uhr, letzte Fahrt 02:30 Uhr');
    expect(shuttleTimesText(rides, 'hin')).toBe('13:15 Uhr');
  });
});

test.describe('Formular geschlossen (rsvpClosedAt)', () => {
  const base = {
    deadlineIso: '2027-04-30T23:59:59+02:00',
    weddingEndIso: '2027-06-20T02:00:00+02:00',
  };
  const config = (closeAfterDeadline: boolean) =>
    ({ ...base, rsvp: { closeAfterDeadline } }) as unknown as RsvpConfig;
  const at = (iso: string) => Date.parse(iso);

  test('vor der Frist offen', () => {
    expect(rsvpClosedAt(config(true), at('2027-04-01T12:00:00+02:00'))).toBe(false);
    expect(rsvpClosedAt(config(false), at('2027-04-01T12:00:00+02:00'))).toBe(false);
  });

  test('nach der Frist nur geschlossen, wenn so eingestellt', () => {
    expect(rsvpClosedAt(config(true), at('2027-05-02T12:00:00+02:00'))).toBe(true);
    expect(rsvpClosedAt(config(false), at('2027-05-02T12:00:00+02:00'))).toBe(false);
  });

  test('nach der Feier immer geschlossen', () => {
    expect(rsvpClosedAt(config(false), at('2027-07-01T12:00:00+02:00'))).toBe(true);
  });
});

test.describe('CSV „Gäste pro Person“', () => {
  const labels: RsvpLabels = {
    menuOptions: [{ value: 'fleisch', label: 'Fleisch' }],
    childMenu: { value: 'kind', label: 'Kindermenü' },
    events: [],
    overnightOptions: [],
    allergyOptions: [],
  };
  const person = (name: string) => ({
    name,
    menu: 'fleisch',
    child: false,
    childAge: '',
    highChair: false,
    allergyTags: [],
    allergyNote: '',
  });
  const entry = (shuttle: RsvpEntry['shuttle']): RsvpEntry => ({
    id: 'a',
    createdAt: '2027-01-01T10:00:00Z',
    updatedAt: '2027-01-01T10:00:00Z',
    revision: 0,
    name: 'Familie Test',
    email: '',
    attendance: 'yes',
    persons: [person('Anna'), person('Ben'), person('Cleo')],
    events: [],
    overnight: null,
    shuttle,
    songWish: '',
    message: '',
  });

  test('Shuttle als Haushaltsangabe mit Platzzahl', () => {
    const [header, ...rows] = personRows([entry({ there: true, back: false, from: 'Hotel Linde', seats: 2 })], labels);
    expect(header.slice(0, 7)).toEqual(['Name', 'Haushalt', 'Kind', 'Alter', 'Hochstuhl', 'Menü', 'Unverträglichkeiten']);
    const col = (title: string) => header.indexOf(title);
    expect(col('Shuttle hin (Haushalt)')).toBeGreaterThan(-1);
    expect(col('Shuttle zurück (Haushalt)')).toBeGreaterThan(-1);
    expect(col('Shuttle-Plätze (Haushalt)')).toBe(col('Shuttle ab') + 1);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row[col('Shuttle ab')]).toBe('Hotel Linde');
      expect(row[col('Shuttle-Plätze (Haushalt)')]).toBe(2);
    }
  });

  test('ohne Shuttle bleibt die Platzzahl leer', () => {
    const [header, ...rows] = personRows([entry({ there: false, back: false, from: '', seats: 0 })], labels);
    expect(rows[0][header.indexOf('Shuttle-Plätze (Haushalt)')]).toBe('');
  });
});
