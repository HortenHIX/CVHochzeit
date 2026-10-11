import { expect, test } from '@playwright/test';
import { GET } from '../../src/app/kalender.ics/route';
import { metadataBaseUrl, publicSiteUrl } from '../../src/lib/site-url';

const ENV_KEYS = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'PORT'] as const;

function withEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>, fn: () => void | Promise<void>) {
  const saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, values);
  const restore = () => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  };
  return Promise.resolve(fn()).finally(restore);
}

test.describe('Seiten-Adresse', () => {
  test('ohne Angaben: keine öffentliche Adresse, metadataBase = localhost', () =>
    withEnv({}, () => {
      expect(publicSiteUrl()).toBeNull();
      expect(metadataBaseUrl().href).toBe('http://localhost:3000/');
    }));

  test('Vercel-Produktionsdomain (ohne Protokoll) wird zu https', () =>
    withEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'cv-hochzeit.vercel.app' }, () => {
      expect(publicSiteUrl()?.href).toBe('https://cv-hochzeit.vercel.app/');
      expect(metadataBaseUrl().origin).toBe('https://cv-hochzeit.vercel.app');
    }));

  test('NEXT_PUBLIC_SITE_URL hat Vorrang', () =>
    withEnv(
      { NEXT_PUBLIC_SITE_URL: 'https://christoph-und-vera.de', VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app' },
      () => {
        expect(publicSiteUrl()?.origin).toBe('https://christoph-und-vera.de');
      },
    ));
});

test.describe('Kalendereintrag', () => {
  test('gültiges iCalendar mit Erinnerung, gefalteten Zeilen und Seiten-Adresse', () =>
    withEnv({ NEXT_PUBLIC_SITE_URL: 'https://christoph-und-vera.de' }, async () => {
      const response = GET();
      expect(response.headers.get('content-type')).toContain('text/calendar');
      const body = await response.text();
      const lines = body.split('\r\n');
      expect(lines[0]).toBe('BEGIN:VCALENDAR');
      expect(body).toContain('BEGIN:VALARM');
      expect(body).toContain('TRIGGER:-P1D');
      expect(body).toContain('URL:https://christoph-und-vera.de');
      // Zeilen höchstens 75 Oktette (RFC 5545), Fortsetzungen beginnen mit Leerzeichen
      for (const line of lines) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
      const unfolded = body.replace(/\r\n /g, '');
      expect(unfolded).toContain('Alle Infos: https://christoph-und-vera.de');
      // Sonderzeichen im Text sind maskiert (Komma, Semikolon)
      const description = unfolded.split('\r\n').find((l) => l.startsWith('DESCRIPTION:')) ?? '';
      expect(description).not.toMatch(/[^\\][,;]/);
    }));
});
