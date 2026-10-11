'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthSecrets } from '@/lib/auth/config';
import { startSession } from '@/lib/auth/session';
import { roleForCode, safeRedirectPath } from '@/lib/auth/token';
import { hitRateLimit } from '@/lib/storage';

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
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip')?.trim() || 'unbekannt';
}

/**
 * Anmeldung mit dem Gästecode (oder dem Admin-Passwort).
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

  const allowed = await hitRateLimit(`login:${await clientIp()}`, 5, 60);
  if (!allowed) {
    return { status: 'error', kind: 'rate', message: 'Bitte in einer Minute erneut versuchen.', attempt };
  }

  const secrets = getAuthSecrets();
  const role = roleForCode(code, secrets);
  if (!role) {
    return { status: 'error', kind: 'code', message: CODE_ERROR, attempt };
  }

  const started = await startSession(role, persistent);
  if (!started) {
    return {
      status: 'error',
      kind: 'config',
      message: 'Die Anmeldung ist gerade nicht möglich. Bitte meldet euch kurz bei uns.',
      attempt,
    };
  }

  const target = role === 'admin' && !next ? '/admin' : safeRedirectPath(next);
  redirect(target);
}
