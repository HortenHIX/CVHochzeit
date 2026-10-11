'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import styles from './not-found.module.css';

/**
 * Unerwarteter Fehler (z. B. Verbindung weg beim Absenden). Statt der
 * englischen Standardseite ein ruhiger deutscher Hinweis mit zwei Auswegen.
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Fehler</p>
        <h1 className={styles.title}>Da ist etwas schiefgelaufen</h1>
        <p className={styles.text}>
          Die Seite konnte gerade nicht geladen werden. Prüft bitte eure Internetverbindung und versucht es noch
          einmal.
        </p>
        {error.digest || error.message ? (
          <p className={styles.text} style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
            Fehlercode: <code className="break-anywhere">{error.digest ?? error.message}</code>
          </p>
        ) : null}
        <Button type="button" size="lg" icon="refresh" onClick={() => retry()} className={styles.button}>
          Erneut versuchen
        </Button>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <ButtonLink href="/" variant="ghost" size="lg">
            Zur Startseite
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
