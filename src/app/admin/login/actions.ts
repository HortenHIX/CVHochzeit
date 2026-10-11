'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthSecrets } from '@/lib/auth/config';
import { startSession } from '@/lib/auth/session';
import { roleForCode, safeRedirectPath } from '@/lib/auth/token';
import { hitRateLimit } from '@/lib/storage';

export interface AdminLoginState {
  status: 'idle' | 'error';
  kind?: 'empty' | 'password' | 'rate' | 'config';
  message?: string;
  /** Zähler, damit dieselbe Fehlermeldung erneut angesagt wird */
  attempt: number;
}

/** Höchstens 5 Versuche je IP in 5 Minuten. */
const RATE_LIMIT = { attempts: 5, windowSeconds: 300 } as const;

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip')?.trim() || 'unbekannt';
}

/** Nur Ziele innerhalb der Verwaltung (bzw. die QR-Tischkarte) nach dem Login. */
function adminTarget(next: string): string {
  const path = safeRedirectPath(next, '/admin');
  const allowed =
    (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/admin?') || path === '/fotos/karte') &&
    !path.startsWith('/admin/login');
  return allowed ? path : '/admin';
}

/**
 * Anmeldung mit dem Admin-Passwort. Der Gästecode wird hier bewusst nicht
 * akzeptiert. Erfolg → Admin-Session und Weiterleitung zur Übersicht.
 */
export async function adminLogin(previous: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const attempt = previous.attempt + 1;
  const password = String(formData.get('password') ?? '').slice(0, 200);
  const next = String(formData.get('next') ?? '');

  if (!password.trim()) {
    return { status: 'error', kind: 'empty', message: 'Bitte gebt das Admin-Passwort ein.', attempt };
  }

  const allowed = await hitRateLimit(`admin-login:${await clientIp()}`, RATE_LIMIT.attempts, RATE_LIMIT.windowSeconds);
  if (!allowed) {
    return {
      status: 'error',
      kind: 'rate',
      message: 'Zu viele Versuche. Bitte in fünf Minuten erneut versuchen.',
      attempt,
    };
  }

  const secrets = getAuthSecrets();
  if (!secrets.adminCode) {
    return {
      status: 'error',
      kind: 'config',
      message: 'Für die Verwaltung ist noch kein Passwort eingerichtet (Umgebungsvariable ADMIN_CODE).',
      attempt,
    };
  }

  // roleForCode vergleicht in konstanter Zeit (safeEqual); nur „admin“ zählt.
  if (roleForCode(password, secrets) !== 'admin') {
    return { status: 'error', kind: 'password', message: 'Das Passwort stimmt leider nicht.', attempt };
  }

  const started = await startSession('admin');
  if (!started) {
    return {
      status: 'error',
      kind: 'config',
      message: 'Die Anmeldung ist gerade nicht möglich. Bitte prüft die Einstellungen.',
      attempt,
    };
  }

  redirect(adminTarget(next));
}
