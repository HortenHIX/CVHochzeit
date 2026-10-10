import 'server-only';
import { cookies } from 'next/headers';
import { getAuthSecrets } from '@/lib/auth/config';
import { RSVP_COOKIE, signValue, verifySignedValue } from '@/lib/auth/token';
import { getRsvp, storageKind } from '@/lib/storage';
import type { RsvpEntry } from './types';

/**
 * Die eigene Antwort eines Geräts: Nach dem Absenden merken wir uns die
 * RSVP-ID in einem signierten Cookie. So kann der Haushalt seine Antwort
 * später ändern, und der Header zeigt „Zugesagt“ statt „Zusagen“.
 *
 * Hinweis (Cache Components): liest Cookies → nur innerhalb von <Suspense>
 * bzw. in Server Actions verwenden.
 */

const PURPOSE = 'rsvp';
const MAX_AGE = 60 * 60 * 24 * 365;

export async function getOwnRsvpId(): Promise<string | null> {
  const raw = (await cookies()).get(RSVP_COOKIE)?.value;
  return verifySignedValue(raw, PURPOSE, getAuthSecrets());
}

/** Lädt die eigene Antwort (oder null, z. B. wenn sie im Admin gelöscht wurde). */
export async function getOwnRsvp(): Promise<RsvpEntry | null> {
  const id = await getOwnRsvpId();
  if (!id || storageKind() === 'none') return null;
  try {
    return await getRsvp(id);
  } catch (error) {
    console.error('[rsvp] Eigene Antwort konnte nicht geladen werden', error);
    return null;
  }
}

/** Nur in Server Actions / Route Handlern aufrufen. */
export async function rememberOwnRsvp(id: string): Promise<void> {
  const value = await signValue(id, PURPOSE, getAuthSecrets());
  (await cookies()).set(RSVP_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

/** „Für jemand anderen antworten“: Verknüpfung zum Gerät lösen. */
export async function forgetOwnRsvp(): Promise<void> {
  (await cookies()).delete(RSVP_COOKIE);
}
