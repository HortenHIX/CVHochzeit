import { promises as fs } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { TEST_ENV } from '../../playwright.config';
import type { RsvpEntry, RsvpPerson } from '../../src/lib/rsvp/types';

/**
 * Verwaltung (/admin): Zugang, Übersicht, Filter, CSV-Export und Löschen.
 *
 * Vor jedem Test werden die Testdaten direkt in die Speicherdatei
 * (TEST_ENV.RSVP_FILE) geschrieben – der Server liest sie bei jeder Anfrage
 * neu. So laufen beide Projekte (mobile, desktop) nacheinander mit demselben
 * Ausgangszustand, auch nachdem ein Test einen Eintrag gelöscht hat.
 *
 * Lokal gegen `next dev`: E2E_GUEST_CODE=hochzeit E2E_ADMIN_CODE=admin
 * E2E_RSVP_FILE=.data/rsvps.json setzen. Dann werden die Testdaten nur
 * ergänzt (vorhandene Einträge bleiben) und die Kennzahlen nicht exakt geprüft.
 */

const GUEST_CODE = process.env.E2E_GUEST_CODE || TEST_ENV.GUEST_CODE;
const ADMIN_CODE = process.env.E2E_ADMIN_CODE || TEST_ENV.ADMIN_CODE;
const MERGE = Boolean(process.env.E2E_RSVP_FILE);
const RSVP_FILE = path.resolve(__dirname, '..', '..', process.env.E2E_RSVP_FILE || TEST_ENV.RSVP_FILE);
const ID_PREFIX = 'e2e-admin-';
/** Wartezeit auf Server Actions und Weiterleitungen */
const SERVER = { timeout: 15_000 };

/* ---------------------------------------------------------------------------
 * Testdaten
 * ------------------------------------------------------------------------- */

function person(name: string, menu: string, extra: Partial<RsvpPerson> = {}): RsvpPerson {
  return { name, menu, child: false, childAge: '', highChair: false, allergyTags: [], allergyNote: '', ...extra };
}

function entry(id: string, data: Partial<RsvpEntry> & Pick<RsvpEntry, 'name' | 'attendance'>): RsvpEntry {
  return {
    id: `${ID_PREFIX}${id}`,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    revision: 0,
    email: '',
    persons: [],
    events: [],
    overnight: null,
    shuttle: null,
    songWish: '',
    message: '',
    ...data,
  };
}

const INJECTION_MESSAGE = '=HYPERLINK("http://example.com";"Klick")';

const TEST_ENTRIES: RsvpEntry[] = [
  entry('testmann', {
    name: 'Familie Testmann',
    email: 'testmann@example.com',
    attendance: 'yes',
    persons: [
      person('Tina Testmann', 'vegetarisch', { allergyTags: ['Laktose'] }),
      person('Tom Testmann', 'fleisch'),
      person('Toni Testmann', 'kinder', { child: true, childAge: '3–6 Jahre', highChair: true }),
    ],
    events: ['brunch'],
    overnight: 'bergwelt',
    rooms: 2,
    stayNote: 'Anreise schon Freitag',
    shuttle: { there: true, back: true, from: 'Landhotel Zur Post', seats: 3 },
    songWish: 'Dancing Queen – ABBA',
    message: 'Wir freuen uns sehr!',
    updatedAt: '2026-09-20T08:30:00.000Z',
    revision: 1,
  }),
  entry('absage', {
    name: 'Erika Absagewitz',
    email: 'erika@example.com',
    attendance: 'no',
    message: 'Leider sind wir verreist.',
    updatedAt: '2026-09-10T12:00:00.000Z',
  }),
  entry('injektion', {
    name: 'Ingo Injektion',
    attendance: 'yes',
    persons: [person('Ingo Injektion', 'fleisch')],
    events: ['brunch'],
    overnight: 'home',
    shuttle: { there: false, back: false, from: '', seats: 0 },
    songWish: '-2+3',
    message: INJECTION_MESSAGE,
    updatedAt: '2026-09-15T18:00:00.000Z',
  }),
  entry('loeschen', {
    name: 'Lotte Löschmich',
    attendance: 'no',
    updatedAt: '2026-09-05T09:00:00.000Z',
  }),
];

async function writeTestData() {
  let store: Record<string, RsvpEntry> = {};
  if (MERGE) {
    try {
      store = JSON.parse(await fs.readFile(RSVP_FILE, 'utf8')) as Record<string, RsvpEntry>;
    } catch {
      store = {};
    }
    for (const id of Object.keys(store)) if (id.startsWith(ID_PREFIX)) delete store[id];
  }
  for (const item of TEST_ENTRIES) store[item.id] = item;
  await fs.mkdir(path.dirname(RSVP_FILE), { recursive: true });
  await fs.writeFile(RSVP_FILE, JSON.stringify(store, null, 2), 'utf8');
}

/** Im Ergänzungs-Modus die eigenen Testeinträge am Ende wieder entfernen. */
async function removeTestData() {
  if (!MERGE) return;
  const store = JSON.parse(await fs.readFile(RSVP_FILE, 'utf8')) as Record<string, RsvpEntry>;
  for (const id of Object.keys(store)) if (id.startsWith(ID_PREFIX)) delete store[id];
  await fs.writeFile(RSVP_FILE, JSON.stringify(store, null, 2), 'utf8');
}

async function readStoredIds(): Promise<string[]> {
  return Object.keys(JSON.parse(await fs.readFile(RSVP_FILE, 'utf8')) as Record<string, RsvpEntry>);
}

/* ---------------------------------------------------------------------------
 * Helfer
 * ------------------------------------------------------------------------- */

test.beforeEach(async ({ page }) => {
  await writeTestData();
  // Jeder Test kommt von einer eigenen (Test-)Adresse, damit sich die Tests
  // nicht gegenseitig in das Rate-Limit des Logins (5 Versuche/5 Min.) bringen.
  // Auf Vercel überschreibt die Plattform diesen Header.
  const ip = `10.${rand()}.${rand()}.${rand()}`;
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip });
});

test.afterAll(async () => {
  await removeTestData();
});

function rand(): number {
  return Math.floor(Math.random() * 250) + 1;
}

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Admin-Passwort', { exact: true }).fill(ADMIN_CODE);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page).toHaveURL(/\/admin$/, SERVER);
  await expect(page.getByRole('heading', { level: 1, name: 'Übersicht' })).toBeVisible();
  // Tabelle/Karten sind bedienbar, sobald die Seite hydriert ist.
  await expect(page.locator('#antworten[data-ready]')).toBeVisible(SERVER);
}

/** Antwort-Zeile (Tabelle) bzw. Karte (mobil) eines Testeintrags. */
function responseRow(page: Page, id: string) {
  return page.locator(`#antworten tbody[data-entry="${ID_PREFIX}${id}"]`);
}

function tile(page: Page, id: string) {
  return page.locator(`[data-tile="${id}"]`);
}

/** Die große Zahl einer Kachel */
function tileValue(page: Page, id: string) {
  return tile(page, id).locator('dd').first();
}

/* ---------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

test.describe('Verwaltung', () => {
  test('Gäste kommen weder in die Übersicht noch an den Export', async ({ page }) => {
    await page.goto(`/?code=${encodeURIComponent(GUEST_CODE)}`);
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByLabel('Admin-Passwort', { exact: true })).toBeVisible();

    const exportResponse = await page.request.get('/admin/export?art=haushalte', { maxRedirects: 0 });
    expect([307, 401]).toContain(exportResponse.status());
    expect(exportResponse.headers()['content-type'] ?? '').not.toContain('text/csv');
  });

  test('anonymer CSV-Export wird abgelehnt', async ({ request }) => {
    const response = await request.get('/admin/export?art=haushalte', { maxRedirects: 0 });
    expect([307, 401]).toContain(response.status());
    if (response.status() === 307) expect(response.headers()['location']).toContain('/admin/login');
    expect(await response.text()).not.toContain('Familie Testmann');
  });

  test('falsches Admin-Passwort zeigt eine Fehlermeldung', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('Verwaltung', { exact: true })).toBeVisible();
    const field = page.getByLabel('Admin-Passwort', { exact: true });
    await expect(field).toHaveAttribute('type', 'password');
    await expect(field).toHaveAttribute('autocomplete', 'current-password');

    await field.fill('falsches-passwort');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    // (Next.js hat zusätzlich einen leeren Routen-Ansager mit role="alert")
    await expect(page.getByRole('alert').filter({ hasText: 'Das Passwort stimmt leider nicht.' })).toBeVisible(SERVER);
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  });

  test('der Gästecode öffnet die Verwaltung nicht', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Admin-Passwort', { exact: true }).fill(GUEST_CODE);
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Das Passwort stimmt leider nicht.' })).toBeVisible(SERVER);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Login mit dem Admin-Passwort zeigt Kennzahlen und Antworten', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText(/^Stand: /)).toBeVisible();
    await expect(page.getByRole('button', { name: 'CSV exportieren' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Aktualisieren' })).toHaveAttribute('href', '/admin');
    await expect(page.getByRole('link', { name: 'QR-Tischkarte drucken' })).toHaveAttribute('href', '/fotos/karte');

    if (!MERGE) {
      await expect(tileValue(page, 'personen')).toHaveText('4');
      await expect(tile(page, 'personen')).toContainText('aus 2 Haushalten');
      await expect(tileValue(page, 'absagen')).toHaveText('2');
      await expect(tileValue(page, 'antworten')).toHaveText('4');
      await expect(tileValue(page, 'kinder')).toHaveText('1');
      await expect(tile(page, 'shuttle')).toContainText('3 hin, 3 zurück');
      await expect(tileValue(page, 'uebernachtung-bergwelt')).toHaveText('3');
      await expect(tileValue(page, 'zimmer')).toHaveText('2');
      await expect(tile(page, 'zimmer')).toContainText('von 6 reservierten');
      await expect(tileValue(page, 'programm-brunch')).toHaveText('4');
      await expect(tileValue(page, 'allergien')).toHaveText('1');
    }

    const responses = page.locator('#antworten');
    for (const name of ['Familie Testmann', 'Erika Absagewitz', 'Ingo Injektion', 'Lotte Löschmich']) {
      await expect(responses.getByRole('rowheader', { name })).toBeVisible();
    }
    await expect(responseRow(page, 'testmann').getByText('Zusage', { exact: true })).toBeVisible();
    await expect(responseRow(page, 'absage').getByText('Absage', { exact: true })).toBeVisible();

    // Unverträglichkeiten mit Personennamen (für den Caterer)
    const allergies = page.getByRole('region', { name: 'Unverträglichkeiten' });
    await expect(allergies).toContainText('Tina Testmann');
    await expect(allergies).toContainText('Laktose');

    // Details: alle Personen mit ihren Angaben, E-Mail als mailto-Link
    const row = responseRow(page, 'testmann');
    const toggle = row.getByRole('button', { name: /Details/ });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(row.getByText('Toni Testmann')).toBeVisible();
    await expect(row.getByText('Kind · 3–6 Jahre')).toBeVisible();
    await expect(row.getByRole('link', { name: 'testmann@example.com' })).toHaveAttribute(
      'href',
      'mailto:testmann@example.com',
    );
  });

  test('Filter „Absagen“, Suche und „Mit Allergien“', async ({ page }) => {
    await loginAsAdmin(page);
    const rows = page.locator(`#antworten tbody[data-entry^="${ID_PREFIX}"]`);
    await expect(rows).toHaveCount(4);

    const segments = page.getByRole('group', { name: 'Antworten anzeigen' });
    await segments.getByText('Absagen', { exact: true }).click();
    await expect(page.getByRole('radio', { name: /Absagen/ })).toBeChecked();
    await expect(rows).toHaveCount(2);
    await expect(responseRow(page, 'absage')).toBeVisible();
    await expect(responseRow(page, 'loeschen')).toBeVisible();
    await expect(responseRow(page, 'testmann')).toHaveCount(0);

    await segments.getByText('Alle', { exact: true }).click();
    await page.getByLabel('Name suchen').fill('testmann');
    await expect(rows).toHaveCount(1);
    await expect(responseRow(page, 'testmann')).toBeVisible();

    await page.getByRole('button', { name: 'Suche leeren' }).click();
    await expect(page.getByLabel('Name suchen')).toHaveValue('');
    await page.getByText('Mit Allergien', { exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Mit Allergien' })).toBeChecked();
    await expect(rows).toHaveCount(1);
    await expect(responseRow(page, 'testmann')).toBeVisible();
  });

  test('CSV-Export: Haushalte und Gäste pro Person', async ({ page }) => {
    await loginAsAdmin(page);

    // Popover mit beiden Exporten
    await page.getByRole('button', { name: 'CSV exportieren' }).click();
    const households = page.getByRole('link', { name: /Haushalte/ });
    await expect(households).toBeVisible();
    await expect(households).toHaveAttribute('href', '/admin/export?art=haushalte');
    await expect(page.getByRole('link', { name: /Gäste pro Person/ })).toHaveAttribute(
      'href',
      '/admin/export?art=personen',
    );
    await page.keyboard.press('Escape');
    await expect(households).toBeHidden();

    const response = await page.request.get('/admin/export?art=haushalte');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/csv');
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(response.headers()['content-disposition']).toMatch(/filename="cv-zusagen-\d{4}-\d{2}-\d{2}\.csv"/);

    const bytes = await response.body();
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const csv = bytes.toString('utf8');
    const lines = csv.split('\r\n');
    expect(lines[0]).toContain('Haushalt;E-Mail;Antwort;Personen');
    expect(csv).toContain('Familie Testmann;testmann@example.com;Zusage;3;2;1;');
    expect(csv).toContain('1× Fleisch, 1× Vegetarisch, 1× Kindermenü');
    expect(csv).toContain(';2;Anreise schon Freitag;');
    expect(csv).toContain('Erika Absagewitz');
    // CSV-Injection: Formel-Zellen beginnen mit einem Apostroph (und sind korrekt gequotet).
    expect(csv).toContain(`"'=HYPERLINK(""http://example.com"";""Klick"")"`);
    expect(csv).toContain(";'-2+3;");
    expect(csv).not.toMatch(/;=HYPERLINK/);

    const persons = await page.request.get('/admin/export?art=personen');
    expect(persons.status()).toBe(200);
    expect(persons.headers()['content-disposition']).toMatch(/filename="cv-gaeste-\d{4}-\d{2}-\d{2}\.csv"/);
    const personsCsv = (await persons.body()).toString('utf8');
    expect(personsCsv.charCodeAt(0)).toBe(0xfeff);
    expect(personsCsv).toContain('Name;Haushalt;Kind;Alter;Hochstuhl;Menü;Unverträglichkeiten');
    expect(personsCsv).toContain('Tina Testmann;Familie Testmann;nein;;;Vegetarisch;Laktose;');
    expect(personsCsv).toContain('Toni Testmann;Familie Testmann;ja;3–6 Jahre;ja;Kindermenü;');
    // Absagen haben keine Personenzeilen
    expect(personsCsv).not.toContain('Erika Absagewitz');

    const unknown = await page.request.get('/admin/export?art=unbekannt');
    expect(unknown.status()).toBe(400);
  });

  test('Bearbeiten ändert eine Antwort, prüft die Eingaben und speichert', async ({ page }) => {
    await loginAsAdmin(page);
    const row = responseRow(page, 'injektion');
    await row.getByRole('button', { name: /Details/ }).click();
    await row.getByRole('link', { name: /Antwort bearbeiten/ }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/antwort/${ID_PREFIX}injektion$`), SERVER);
    await expect(page.getByRole('heading', { level: 1, name: 'Antwort bearbeiten' })).toBeVisible(SERVER);

    // Fehlende Angaben werden wie im Gästeformular abgelehnt, nichts geht verloren
    const person = page.getByRole('group', { name: 'Personen' });
    await person.getByLabel('Name', { exact: true }).fill('');
    await page.getByRole('button', { name: 'Änderungen speichern' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Bitte prüft noch' });
    await expect(alert).toContainText('Bitte gebt den Namen von Person 1 an.', SERVER);
    await expect(page).toHaveURL(/\/admin\/antwort\//);

    // Korrigieren: neuer Name, anderes Menü, Zimmer-Option mit Wunsch
    await person.getByLabel('Name', { exact: true }).fill('Ingo Geändert');
    await person.getByRole('radio', { name: 'Vegetarisch' }).check();
    await page.getByRole('radio', { name: 'In der Bergwelt (Vermittlung über uns)' }).check();
    await page.getByLabel('Zimmer', { exact: true }).fill('1');
    await page.getByLabel(/Wünsche zur Übernachtung/).fill('Anreise Freitag');
    await page.getByRole('button', { name: 'Änderungen speichern' }).click();

    await expect(page).toHaveURL(/\/admin$/, SERVER);
    const stored = JSON.parse(await fs.readFile(RSVP_FILE, 'utf8')) as Record<string, RsvpEntry>;
    const saved = stored[`${ID_PREFIX}injektion`];
    expect(saved.persons[0]).toMatchObject({ name: 'Ingo Geändert', menu: 'vegetarisch' });
    expect(saved).toMatchObject({ overnight: 'bergwelt', rooms: 1, stayNote: 'Anreise Freitag', revision: 1 });
    expect(saved.createdAt).toBe('2026-09-01T10:00:00.000Z');
    expect(saved.updatedAt).not.toBe('2026-09-01T10:00:00.000Z');
  });

  test('Bearbeiten: ohne Anmeldung gesperrt, unbekannte Antwort wird gemeldet', async ({ page, request }) => {
    const anonymous = await request.get(`/admin/antwort/${ID_PREFIX}testmann`, { maxRedirects: 0 });
    expect(anonymous.status()).toBe(307);
    expect(anonymous.headers()['location']).toContain('/admin/login');

    await loginAsAdmin(page);
    await page.goto('/admin/antwort/gibt-es-nicht');
    await expect(page.getByText('Diese Antwort gibt es nicht (mehr).')).toBeVisible(SERVER);
  });

  test('Löschen entfernt eine Antwort nach Rückfrage', async ({ page }) => {
    await loginAsAdmin(page);
    const row = responseRow(page, 'loeschen');
    await row.getByRole('button', { name: /Details/ }).click();

    await row.getByRole('button', { name: /Antwort löschen/ }).click();
    const cancel = row.getByRole('button', { name: 'Abbrechen' });
    await expect(cancel).toBeFocused();
    await cancel.click();
    await expect(row.getByRole('button', { name: 'Ja, endgültig löschen' })).toHaveCount(0);

    await row.getByRole('button', { name: /Antwort löschen/ }).click();
    await row.getByRole('button', { name: 'Ja, endgültig löschen' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Die Antwort von „Lotte Löschmich“ wurde gelöscht.' })).toBeVisible(
      SERVER,
    );
    await expect(row).toHaveCount(0);
    expect(await readStoredIds()).not.toContain(`${ID_PREFIX}loeschen`);

    // Nach dem Neuladen bleibt sie weg, die Kennzahlen stimmen.
    await page.reload();
    await expect(page.locator('#antworten[data-ready]')).toBeVisible(SERVER);
    await expect(page.locator('#antworten').getByRole('rowheader', { name: 'Lotte Löschmich' })).toHaveCount(0);
    await expect(responseRow(page, 'absage')).toBeVisible();
    if (!MERGE) await expect(tileValue(page, 'antworten')).toHaveText('3');
  });
});
