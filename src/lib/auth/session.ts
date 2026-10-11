import 'server-only';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getAuthSecrets } from './config';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySessionToken,
  type Role,
} from './token';

/**
 * Data-Access-Layer für die Anmeldung. Der Proxy (src/proxy.ts) leitet nicht
 * angemeldete Besucher schon vorher um – trotzdem prüfen Server Actions,
 * Route Handler und der Admin-Bereich die Session hier noch einmal selbst.
 *
 * Hinweis (Cache Components): `cookies()` ist eine Request-Abfrage. Komponenten,
 * die diese Funktionen aufrufen, müssen innerhalb einer <Suspense>-Grenze liegen.
 */

export async function getRole(): Promise<Role | null> {
  // Die Prüfung vergleicht mit der aktuellen Uhrzeit → nur zur Request-Zeit ausführen.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getAuthSecrets());
}

/** Gast oder Admin – sonst Weiterleitung zum Login. */
export async function requireGuest(): Promise<Role> {
  const role = await getRole();
  if (!role) redirect('/login');
  return role;
}

/** Nur Admin – sonst Weiterleitung zum Admin-Login. */
export async function requireAdmin(): Promise<'admin'> {
  const role = await getRole();
  if (role !== 'admin') redirect('/admin/login');
  return role;
}

/** Für Server Actions / Route Handler, die nicht umleiten, sondern ablehnen sollen. */
export async function hasRole(required: Role): Promise<boolean> {
  const role = await getRole();
  if (!role) return false;
  return required === 'guest' ? true : role === 'admin';
}

/**
 * Meldet an. `persistent = false` setzt ein Sitzungs-Cookie, das beim
 * Schließen des Browsers verfällt („Auf diesem Gerät angemeldet bleiben“).
 */
export async function startSession(role: Role, persistent = true): Promise<boolean> {
  const token = await createSessionToken(role, getAuthSecrets());
  if (!token) return false;
  const options = sessionCookieOptions(role);
  (await cookies()).set(SESSION_COOKIE, token, persistent ? options : { ...options, maxAge: undefined });
  return true;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export function sessionCookieOptions(role: Role) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE[role],
  };
}
