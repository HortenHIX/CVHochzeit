import { normalizeGuestCode, type AuthSecrets } from './token';

/**
 * Liest Gästecode, Admin-Passwort und Session-Secret aus den
 * Umgebungsvariablen. Für die lokale Entwicklung (`npm run dev`) gibt es
 * Standardwerte, damit die Seite ohne Konfiguration startet.
 */
export function getAuthSecrets(): AuthSecrets {
  const isDev = process.env.NODE_ENV === 'development';
  const guestCode = clean(process.env.GUEST_CODE) ?? (isDev ? 'hochzeit' : null);
  const adminCode = clean(process.env.ADMIN_CODE) ?? (isDev ? 'admin' : null);
  // Gleicher Code für Gäste und Admin wäre ein Sicherheitsloch: dann Admin deaktivieren.
  const sameCode =
    guestCode !== null && adminCode !== null && normalizeGuestCode(guestCode) === normalizeGuestCode(adminCode);
  if (sameCode) {
    console.warn('[auth] ADMIN_CODE darf nicht dem GUEST_CODE entsprechen – Admin-Bereich ist deaktiviert.');
  }
  return {
    guestCode,
    adminCode: sameCode ? null : adminCode,
    sessionSecret: clean(process.env.SESSION_SECRET) ?? '',
  };
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
