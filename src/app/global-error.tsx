'use client';

import { useEffect } from 'react';
import { Button, buttonClassName } from '@/components/ui/Button';
import { display, sans, script } from './fonts';
import './globals.css';
import styles from './not-found.module.css';

/**
 * Fehler im Wurzel-Layout selbst. Ersetzt das ganze Dokument, deshalb mit
 * eigenem <html lang="de"> sowie eigenen Schriften und Grundstilen.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="de" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body>
        <title>Da ist etwas schiefgelaufen</title>
        <main className={styles.page}>
          <div className={styles.card}>
            <p className={styles.eyebrow}>Fehler</p>
            <h1 className={styles.title}>Da ist etwas schiefgelaufen</h1>
            <p className={styles.text}>
              Die Seite konnte gerade nicht geladen werden. Prüft bitte eure Internetverbindung und versucht es noch
              einmal.
            </p>
            <Button type="button" size="lg" icon="refresh" onClick={() => retry()} className={styles.button}>
              Erneut versuchen
            </Button>
            <div style={{ marginTop: 'var(--space-3)' }}>
              {/* Bewusst ein normaler Link: Das Wurzel-Layout ist kaputt, also neu laden. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={buttonClassName({ variant: 'ghost', size: 'lg' })}>
                <span>Zur Startseite</span>
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
