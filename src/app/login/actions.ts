'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthSecrets } from '@/lib/auth/config';
import { startSession } from '@/lib/auth/session';
import { roleForCode, safeRedirectPath } from '@/lib/auth/token';
import { clientIpFrom, hitRateLimit, LIMITS, refundRateLimit } from '@/lib/rate-limit';

export interface LoginState {
  status: 'idle' | 'error';
  /** Art des Fehlers – steuert Feld-Markierung */
  kind?: 'empty' | 'code' | 'rate' | 'config';
  message?: string;
  /** Zähler, damit dieselbe Fehlermeldung erneut angesagt wird */
  attempt: number;
}

const CODE_ERROR = 'Dieser Code passt leider nicht. Schaut noch einmal auf eure Karte, oder meldet euch bei uns.';

async function clientIp(): Promise<string> {
  return clientIpFrom(await headers());
}

/**
 * Anmeldung mit dem Gästecode. Das Admin-Passwort gilt nur unter /admin/login
 * (eigenes, strengeres Limit) – hier wird es wie ein falscher Code behandelt.
 * Erfolg → Session-Cookie setzen und weiterleiten; sonst Fehlermeldung.
 */
export async function login(previous: LoginState, formData: FormData): Promise<LoginState> {
  const attempt = previous.attempt + 1;
  const code = String(formData.get('code') ?? '').slice(0, 200);
  const next = String(formData.get('next') ?? '');
  const persistent = formData.get('remember') === 'on';

  if (!code.trim()) {
    return { status: 'error', kind: 'empty', message: 'Bitte gebt den Gästecode von eurer Karte ein.', attempt };
  }

  const { key, limit, window } = LIMITS.guestLogin;
  const limitKey = key(await clientIp());
  const allowed = await hitRateLimit(limitKey, limit, window);
  if (!allowed) {
    return { status: 'error', kind: 'rate', message: 'Bitte in einer Minute erneut versuchen.', attempt };
  }

  const secrets = getAuthSecrets();
  const role = roleForCode(code, secrets);
  if (role !== 'guest') {
    return { status: 'error', kind: 'code', message: CODE_ERROR, attempt };
  }

  await refundRateLimit(limitKey); // Erfolg zählt nicht gegen das Kontingent
  const started = await startSession(role, persistent);
  if (!started) {
    return {
      status: 'error',
      kind: 'config',
      message: 'Die Anmeldung ist gerade nicht möglich. Bitte meldet euch kurz bei uns.',
      attempt,
    };
  }

  redirect(safeRedirectPath(next));
}
