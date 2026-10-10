import { expect, test } from '@playwright/test';
import { TEST_ENV } from '../../playwright.config';

test.describe('Zugangsschutz', () => {
  test('ohne Anmeldung wird auf den Login umgeleitet', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Gästecode')).toBeVisible();
  });

  test('Unterseiten merken sich das Ziel', async ({ page }) => {
    await page.goto('/fotos/karte');
    await expect(page).toHaveURL(/\/login\?next=%2Ffotos%2Fkarte$/);
  });

  test('falscher Code zeigt eine Fehlermeldung', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Gästecode').fill('falsch');
    await page.getByRole('button', { name: /eintreten/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('richtiger Code (tolerant geschrieben) öffnet die Seite', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Gästecode').fill('  sonnenblume2027 ');
    await page.getByRole('button', { name: /eintreten/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Christoph');
  });

  test('Direkt-Link mit ?code= meldet an und entfernt den Code aus der Adresse', async ({ page }) => {
    await page.goto(`/?code=${encodeURIComponent(TEST_ENV.GUEST_CODE)}`);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vera');
  });

  test('Direkt-Link mit falschem Code führt zum Login mit Hinweis', async ({ page }) => {
    await page.goto('/?code=falsch');
    await expect(page).toHaveURL(/\/login\?fehler=code$/);
  });

  test('Gäste kommen nicht in den Admin-Bereich', async ({ page }) => {
    await page.goto(`/?code=${encodeURIComponent(TEST_ENV.GUEST_CODE)}`);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Kalender-Download nur mit Anmeldung', async ({ request, page }) => {
    const anonymous = await request.get('/kalender.ics', { maxRedirects: 0 });
    expect(anonymous.status()).toBe(307);

    await page.goto(`/?code=${encodeURIComponent(TEST_ENV.GUEST_CODE)}`);
    const response = await page.request.get('/kalender.ics');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/calendar');
    const body = await response.text();
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('DTSTART:20270619T120000Z');
  });

  test('robots.txt und Datenschutz sind öffentlich, alles ist noindex', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Disallow: /');

    const privacy = await request.get('/datenschutz', { maxRedirects: 0 });
    expect(privacy.status()).toBe(200);
    expect(privacy.headers()['x-robots-tag']).toContain('noindex');
  });

  test('gefälschtes Admin-Cookie wird abgelehnt', async ({ page, context, baseURL }) => {
    const url = new URL(baseURL!);
    await context.addCookies([
      { name: 'cv_session', value: `admin.${Math.floor(Date.now() / 1000)}.gefaelscht`, domain: url.hostname, path: '/' },
    ]);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
