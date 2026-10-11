'use server';

import { revalidatePath } from 'next/cache';
import { hasRole } from '@/lib/auth/session';
import { deleteRsvp, getRsvp, StorageNotConfiguredError } from '@/lib/storage';

export interface DeleteRsvpResult {
  ok: boolean;
  message?: string;
}

const ID_PATTERN = /^[\w-]{1,100}$/;

/**
 * Löscht eine Rückmeldung. Die Admin-Rolle wird hier selbst geprüft – eine
 * Server Action ist ein öffentlicher Endpunkt und darf sich nicht auf die
 * Seite oder den Proxy verlassen.
 */
export async function deleteRsvpAction(id: string): Promise<DeleteRsvpResult> {
  if (!(await hasRole('admin'))) {
    return { ok: false, message: 'Bitte meldet euch erneut in der Verwaltung an.' };
  }
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    return { ok: false, message: 'Diese Antwort gibt es nicht.' };
  }

  try {
    const existing = await getRsvp(id);
    if (existing) await deleteRsvp(id);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return { ok: false, message: 'Es ist noch kein Speicher eingerichtet.' };
    }
    console.error('[admin] Antwort konnte nicht gelöscht werden', error);
    return { ok: false, message: 'Das Löschen hat nicht geklappt. Bitte versucht es noch einmal.' };
  }

  revalidatePath('/admin');
  return { ok: true };
}
