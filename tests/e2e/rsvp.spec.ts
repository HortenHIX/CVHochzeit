import { expect, test, type Locator, type Page } from '@playwright/test';
import { TEST_ENV } from '../../playwright.config';

/**
 * Zusage-Formular (RSVP). Jeder Test läuft in einem eigenen Browser-Kontext
 * (eigene Cookies, eigener Entwurf) und nutzt eindeutige Namen, weil beide
 * Projekte (mobile/desktop) nacheinander gegen denselben Server laufen.
 *
 * Lokal gegen `next dev`: E2E_GUEST_CODE=hochzeit setzen.
 */
const GUEST_CODE = process.env.E2E_GUEST_CODE || TEST_ENV.GUEST_CODE;
/** Wartezeit auf die Antwort der Server Action */
const SERVER = { timeout: 15_000 };

function uniqueSuffix(testInfo: { project: { name: string } }): string {
  return `${testInfo.project.name.slice(0, 1).toUpperCase()}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Anmelden, zur Zusage scrollen und warten, bis das Formular bedienbar ist. */
async function openRsvp(page: Page): Promise<Locator> {
  await page.goto(`/?code=${encodeURIComponent(GUEST_CODE)}`);
  await expect(page).toHaveURL(/\/$/);
  await page.waitForLoadState('networkidle');
  const section = page.locator('#zusage');
  await section.scrollIntoViewIfNeeded();
  return section;
}

/** Wartet auf das hydrierte Formular (data-ready wird erst im Browser gesetzt). */
async function readyForm(section: Locator): Promise<Locator> {
  const form = section.locator('form[data-ready]');
  await expect(form).toBeVisible();
  return form;
}

function person(section: Locator, n: number): Locator {
  return section.getByRole('group', { name: `Person ${n}`, exact: true });
}

async function submit(section: Locator) {
  await section.getByRole('button', { name: 'Antwort senden' }).click();
}

/** Füllt eine Zusage für zwei Personen aus (ohne Absenden). */
async function fillTwoPersonYes(section: Locator, household: string, first: string, second: string) {
  await readyForm(section);
  await section.getByRole('radio', { name: /Ja, wir kommen gern/ }).check();
  await section.getByLabel('Euer Name').fill(household);

  const p1 = person(section, 1);
  await expect(p1).toBeVisible();
  // Person 1 übernimmt den Namen aus Gruppe 1 als Vorschlag.
  await expect(p1.getByLabel('Name', { exact: true })).toHaveValue(household);
  await p1.getByLabel('Name', { exact: true }).fill(first);
  await p1.getByRole('radio', { name: 'Vegetarisch' }).check();
  await p1.getByRole('checkbox', { name: 'Laktose' }).check();

  await section.getByRole('button', { name: 'Weitere Person hinzufügen' }).click();
  const p2 = person(section, 2);
  await expect(p2.getByLabel('Name', { exact: true })).toBeFocused();
  await p2.getByLabel('Name', { exact: true }).fill(second);
  await p2.getByRole('radio', { name: 'Fisch' }).check();
  await p2.getByRole('checkbox', { name: 'Nüsse' }).check();
  await expect(section.getByText('2 von max. 6 Personen')).toBeVisible();

  await section.getByRole('checkbox', { name: /Ich bin einverstanden/ }).check();
}

test.describe('Zusage', () => {
  test('Zusage mit zwei Personen inkl. Menü und Unverträglichkeit wird bestätigt', async ({ page }, testInfo) => {
    const id = uniqueSuffix(testInfo);
    const section = await openRsvp(page);
    await fillTwoPersonYes(section, `Anna & Ben ${id}`, `Anna ${id}`, `Ben ${id}`);
    await submit(section);

    const heading = section.getByRole('heading', { name: 'Danke, Anna & Ben!' });
    await expect(heading).toBeVisible(SERVER);
    await expect(heading).toBeFocused();
    await expect(section.getByText('Wir haben eure Zusage für 2 Personen erhalten.')).toBeVisible();

    const summary = section.locator('dl');
    await expect(summary).toContainText(`Anna ${id}`);
    await expect(summary).toContainText(`Ben ${id}`);
    await expect(summary).toContainText('Vegetarisch');
    await expect(summary).toContainText('Unverträglichkeiten: Laktose');
    await expect(summary).toContainText('Fisch');
    await expect(summary).toContainText('Unverträglichkeiten: Nüsse');
    await expect(section.getByRole('button', { name: 'Antwort ändern' })).toBeVisible();
    await expect(section.getByRole('link', { name: 'Zum Kalender hinzufügen' })).toHaveAttribute('href', '/kalender.ics');
  });

  test('nach dem Neuladen erscheint die Zusammenfassung, „Antwort ändern“ füllt vor und Absage wird bestätigt', async ({
    page,
  }, testInfo) => {
    const id = uniqueSuffix(testInfo);
    const household = `Clara & Dirk ${id}`;
    let section = await openRsvp(page);
    await fillTwoPersonYes(section, household, `Clara ${id}`, `Dirk ${id}`);
    await submit(section);
    await expect(section.getByRole('heading', { name: 'Danke, Clara & Dirk!' })).toBeVisible(SERVER);

    // Bereits geantwortet: Zusammenfassung zuerst
    await page.reload();
    await page.waitForLoadState('networkidle');
    section = page.locator('#zusage');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Ihr habt schon zugesagt' })).toBeVisible();
    await expect(section.locator('dl')).toContainText(household);

    // Antwort ändern: Formular vorausgefüllt
    await section.getByRole('button', { name: 'Antwort ändern' }).click();
    await readyForm(section);
    await expect(section.getByRole('heading', { name: 'Antwort ändern' })).toBeFocused();
    await expect(section.getByLabel('Euer Name')).toHaveValue(household);
    await expect(section.getByRole('radio', { name: /Ja, wir kommen gern/ })).toBeChecked();
    await expect(person(section, 1).getByRole('radio', { name: 'Vegetarisch' })).toBeChecked();
    await expect(person(section, 2).getByLabel('Name', { exact: true })).toHaveValue(`Dirk ${id}`);
    await expect(section.getByRole('checkbox', { name: /Ich bin einverstanden/ })).toBeChecked();

    // Auf Absage ändern
    await section.getByRole('radio', { name: /Leider nicht/ }).check();
    await expect(person(section, 1)).toBeHidden();
    await submit(section);
    await expect(section.getByText('Schade, dass ihr nicht dabei sein könnt.')).toBeVisible(SERVER);
    await expect(section.locator('dl')).toContainText('Leider nicht');
    await expect(section.getByRole('link', { name: 'Zum Kalender hinzufügen' })).toHaveCount(0);

    // Die Änderung ist gespeichert (dieselbe Antwort, jetzt Absage)
    await page.reload();
    await page.waitForLoadState('networkidle');
    section = page.locator('#zusage');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Ihr habt schon geantwortet' })).toBeVisible();
    await expect(section.locator('dl')).toContainText(household);
  });

  test('Absenden ohne Name und Menü zeigt die Fehlerbox mit Links und setzt den Fokus', async ({ page }) => {
    const section = await openRsvp(page);
    await readyForm(section);

    await submit(section);
    const alert = section.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toBeFocused();
    await expect(alert).toContainText('Bitte prüft noch:');
    await expect(alert.getByRole('link', { name: 'Bitte wählt aus, ob ihr kommt.' })).toBeVisible();
    await expect(alert.getByRole('link', { name: 'Bitte gebt euren Namen an.' })).toBeVisible();
    await expect(alert.getByRole('link', { name: /Bitte bestätigt die Einwilligung/ })).toBeVisible();
    await expect(section.getByLabel('Euer Name')).toHaveAttribute('aria-invalid', 'true');

    // Zusage ohne Menü: der eingegebene Name bleibt erhalten
    await section.getByRole('radio', { name: /Ja, wir kommen gern/ }).check();
    await section.getByLabel('Euer Name').fill('Erika Fehlerfall');
    await section.getByRole('checkbox', { name: /Ich bin einverstanden/ }).check();
    await submit(section);
    await expect(alert).toBeFocused();
    const menuLink = alert.getByRole('link', { name: 'Bitte wählt ein Menü für Person 1.' });
    await expect(menuLink).toBeVisible();
    await expect(alert.getByRole('link', { name: 'Bitte gebt euren Namen an.' })).toHaveCount(0);
    await expect(section.getByLabel('Euer Name')).toHaveValue('Erika Fehlerfall');

    // Ankerlink führt direkt ins Feld
    await menuLink.click();
    await expect(person(section, 1).getByRole('radio', { name: 'Fleisch' })).toBeFocused();
    await expect(person(section, 1).getByText('Bitte wählt ein Menü für Person 1.')).toBeVisible();

    // Fehler verschwindet, sobald er behoben ist
    await person(section, 1).getByRole('radio', { name: 'Fleisch' }).check();
    await expect(alert).toBeHidden();
  });

  test('„Für eine andere Person/Familie antworten“ startet ein leeres Formular', async ({ page }, testInfo) => {
    const id = uniqueSuffix(testInfo);
    let section = await openRsvp(page);
    await readyForm(section);
    await section.getByRole('radio', { name: /Leider nicht/ }).check();
    await section.getByLabel('Euer Name').fill(`Familie Gast ${id}`);
    await section.getByRole('checkbox', { name: /Ich bin einverstanden/ }).check();
    await submit(section);
    await expect(section.getByRole('heading', { name: `Danke, Familie Gast ${id}!` })).toBeVisible(SERVER);

    // Die Server Action löst die Verknüpfung (Cookie) – auf ihre Antwort warten.
    const forgotten = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === '/');
    await section.getByRole('button', { name: 'Für eine andere Person/Familie antworten' }).click();
    await expect(section.getByRole('heading', { name: 'Eure Antwort' })).toBeFocused();
    await expect(section.getByLabel('Euer Name')).toHaveValue('');
    await expect(section.getByRole('radio', { name: /Leider nicht/ })).not.toBeChecked();

    // Das Gerät ist nicht mehr mit der alten Antwort verknüpft.
    await forgotten;
    await page.reload();
    await page.waitForLoadState('networkidle');
    section = page.locator('#zusage');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Eure Antwort' })).toBeVisible();
    await expect(section.getByRole('heading', { name: /Ihr habt schon/ })).toHaveCount(0);
  });

  test('ausgefülltes Honeypot-Feld zeigt Erfolg, speichert aber nichts für dieses Gerät', async ({ page }, testInfo) => {
    const id = uniqueSuffix(testInfo);
    let section = await openRsvp(page);
    await readyForm(section);
    await section.getByRole('radio', { name: /Leider nicht/ }).check();
    await section.getByLabel('Euer Name').fill(`Bot ${id}`);
    await section.getByRole('checkbox', { name: /Ich bin einverstanden/ }).check();
    await section.locator('input[name="website"]').evaluate((input: HTMLInputElement) => {
      input.value = 'https://spam.example';
    });
    await submit(section);
    await expect(section.getByRole('heading', { name: 'Danke, Bot!' })).toBeVisible(SERVER);

    // Kein Antwort-Cookie gesetzt → nach dem Neuladen wieder das leere Formular
    await page.reload();
    await page.waitForLoadState('networkidle');
    section = page.locator('#zusage');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Eure Antwort' })).toBeVisible();
    await expect(section.getByRole('heading', { name: /Ihr habt schon/ })).toHaveCount(0);
  });

  test('abgelaufene Anmeldung beim Absenden führt zur Anmeldung, der Entwurf bleibt erhalten', async ({
    page,
    context,
  }, testInfo) => {
    const section = await openRsvp(page);
    await readyForm(section);
    const household = `Abgelaufen ${uniqueSuffix(testInfo)}`;
    await section.getByRole('radio', { name: /Leider nicht/ }).check();
    await section.getByLabel('Euer Name').fill(household);
    await section.getByRole('checkbox', { name: /Ich bin einverstanden/ }).check();
    // Entwurf wird kurz nach der letzten Änderung gespeichert.
    await expect(section.getByText('Entwurf auf diesem Gerät gespeichert')).toBeVisible();

    await context.clearCookies();
    await submit(section);

    await expect(page).toHaveURL(/\/login\?(.*&)?fehler=sitzung/, SERVER);
    await expect(page.getByText('Eure Anmeldung ist abgelaufen.')).toBeVisible();
    await expect(page.getByText(/couldn.t load/i)).toHaveCount(0);
    const draft = await page.evaluate(() => window.localStorage.getItem('cv-hochzeit:zusage-entwurf'));
    expect(draft).toContain(household);
  });
});
