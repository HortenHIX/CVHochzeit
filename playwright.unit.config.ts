import { defineConfig } from '@playwright/test';

/** Unit-Tests für reine Logik (ohne Browser und ohne Server). */
export default defineConfig({
  testDir: './tests/unit',
  reporter: [['list']],
});
