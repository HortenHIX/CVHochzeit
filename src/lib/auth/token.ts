/**
 * Signierte Session-Tokens (HMAC-SHA256 über Web Crypto).
 *
 * Läuft sowohl im Proxy als auch in Server Components / Server Actions,
 * deshalb hier keine Node-spezifischen APIs und kein `server-only`.
 *
 * Format des Cookies: `<role>.<issuedAtSeconds>.<signature>`
 *
 * Der Signaturschlüssel enthält den jeweils gültigen Code. Wird der Gästecode
 * oder das Admin-Passwort geändert, werden dadurch alle bestehenden Sessions
 * dieser Rolle automatisch ungültig.
 */

export type Role = 'guest' | 'admin';

export const SESSION_COOKIE = 'cv_session';
export const RSVP_COOKIE = 'cv_rsvp';

/** Gültigkeit in Sekunden */
export const SESSION_MAX_AGE: Record<Role, number> = {
  guest: 60 * 60 * 24 * 365, // 1 Jahr – Gäste sollen sich nicht ständig neu anmelden
  admin: 60 * 60 * 24 * 30, // 30 Tage
};

export interface AuthSecrets {
  guestCode: string | null;
  adminCode: string | null;
  sessionSecret: string;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  const view = new Uint8Array(bytes);
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message)));
}

/** Vergleich in konstanter Zeit (bezogen auf die Länge von `a`). */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function codeForRole(role: Role, secrets: AuthSecrets): string | null {
  return role === 'admin' ? secrets.adminCode : secrets.guestCode;
}

function signingKey(role: Role, code: string, secrets: AuthSecrets): string {
  return `${secrets.sessionSecret}|session|${role}|${code}`;
}

export async function createSessionToken(
  role: Role,
  secrets: AuthSecrets,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string | null> {
  const code = codeForRole(role, secrets);
  if (!code) return null;
  const payload = `${role}.${nowSeconds}`;
  const sig = await hmac(signingKey(role, code, secrets), payload);
  return `${payload}.${sig}`;
}

/** Gibt die Rolle zurück, wenn das Token gültig und nicht abgelaufen ist. */
export async function verifySessionToken(
  token: string | undefined | null,
  secrets: AuthSecrets,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<Role | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [role, issuedAtRaw, sig] = parts;
  if (role !== 'guest' && role !== 'admin') return null;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isInteger(issuedAt)) return null;
  if (issuedAt > nowSeconds + 60) return null; // Zeitstempel aus der Zukunft
  if (nowSeconds - issuedAt > SESSION_MAX_AGE[role]) return null;
  const code = codeForRole(role, secrets);
  if (!code) return null;
  const expected = await hmac(signingKey(role, code, secrets), `${role}.${issuedAtRaw}`);
  return safeEqual(sig, expected) ? role : null;
}

/** Signiert einen beliebigen Wert (z. B. die eigene RSVP-ID im Cookie). */
export async function signValue(value: string, purpose: string, secrets: AuthSecrets): Promise<string> {
  const sig = await hmac(`${secrets.sessionSecret}|${purpose}|${secrets.guestCode ?? ''}`, value);
  return `${value}.${sig}`;
}

/** Prüft einen mit `signValue` signierten Wert und gibt den Wert zurück. */
export async function verifySignedValue(
  signed: string | undefined | null,
  purpose: string,
  secrets: AuthSecrets,
): Promise<string | null> {
  if (!signed) return null;
  const idx = signed.lastIndexOf('.');
  if (idx <= 0) return null;
  const value = signed.slice(0, idx);
  const expected = await signValue(value, purpose, secrets);
  return safeEqual(signed, expected) ? value : null;
}

/** Gästecodes werden tolerant verglichen: Groß-/Kleinschreibung, Leerzeichen und Bindestriche egal. */
export function normalizeGuestCode(input: string): string {
  return input.normalize('NFKC').toLowerCase().replace(/[\s\-_–]+/g, '');
}

/** Prüft einen eingegebenen Code und liefert die passende Rolle. */
export function roleForCode(input: string, secrets: AuthSecrets): Role | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (secrets.adminCode && safeEqual(trimmed, secrets.adminCode)) return 'admin';
  if (secrets.guestCode && safeEqual(normalizeGuestCode(trimmed), normalizeGuestCode(secrets.guestCode))) {
    return 'guest';
  }
  return null;
}

/** Nur relative Pfade innerhalb der Seite als Weiterleitungsziel erlauben. */
export function safeRedirectPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || typeof next !== 'string' || next.length > 2000) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  // Steuerzeichen (Tab, Zeilenumbruch …) und Backslashes entfernen Browser bzw.
  // deuten sie als „/“ – damit ließe sich „//fremde-domain“ einschmuggeln.
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return fallback;
  try {
    const base = 'http://intern.invalid';
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
