/**
 * Umfang der Seite, gesteuert über die Umgebungsvariable `SITE_MODE`:
 *
 * - `savethedate` – nur Titelbereich und Zusage-Formular (für die Save-the-Date-Karten).
 * - alles andere (Standard) – die komplette Seite.
 *
 * Zum Freischalten der vollen Seite in Vercel `SITE_MODE=full` setzen (oder die Variable
 * löschen) und neu deployen.
 */
export function isSaveTheDate(): boolean {
  return process.env.SITE_MODE?.trim().toLowerCase() === 'savethedate';
}

/** Pfade, die im Save-the-Date-Modus nicht erreichbar sind (Weiterleitung auf die Startseite). */
export function isHiddenInSaveTheDate(pathname: string): boolean {
  return pathname === '/fotos' || pathname.startsWith('/fotos/');
}
