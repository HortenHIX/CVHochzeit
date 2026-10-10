import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-End-Tests gegen einen Produktions-Build (`next build` + `next start`).
 * Zusagen werden in eine temporäre Datei geschrieben, nicht in Redis.
 */
const PORT = 3100;

export const TEST_ENV = {
  GUEST_CODE: 'Sonnenblume 2027',
  ADMIN_CODE: 'test-admin-passwort',
  SESSION_SECRET: 'test-secret-nur-fuer-e2e-tests',
  RSVP_STORAGE: 'file',
  RSVP_FILE: '.data/e2e-rsvps.json',
};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `rm -f ${TEST_ENV.RSVP_FILE} && npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: TEST_ENV,
  },
});
