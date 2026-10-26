'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth/session';
import { getRsvpConfig } from '@/lib/rsvp/config-server';
import { parseRsvpForm } from '@/lib/rsvp/validate';
import { deleteRsvp, getRsvp, saveRsvp, StorageNotConfiguredError } from '@/lib/storage';

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

export interface UpdateRsvpState {
  status: 'idle' | 'error';
  attempt: number;
  /** Fehlermeldungen in Formular-Reihenfolge */
  messages: string[];
}

/**
 * Ändert eine Rückmeldung aus der Verwaltung. Geprüft wird wie beim Gästeformular
 * (gleiche Regeln, gleiche Bereinigung) – nur ohne Frist und ohne Einwilligung, die der
 * Gast bei seiner Antwort bereits gegeben hat. Danach geht es zurück zur Übersicht.
 */
export async function updateRsvpAction(
  id: string,
  previous: UpdateRsvpState,
  formData: FormData,
): Promise<UpdateRsvpState> {
  const attempt = previous.attempt + 1;
  const fail = (...messages: string[]): UpdateRsvpState => ({ status: 'error', attempt, messages });

  if (!(await hasRole('admin'))) return fail('Bitte meldet euch erneut in der Verwaltung an.');
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return fail('Diese Antwort gibt es nicht.');

  const config = getRsvpConfig();
  formData.set('consent', 'on');
  const parsed = parseRsvpForm(formData, config);
  if (!parsed.ok) return fail(...Object.values(parsed.errors));

  try {
    const existing = await getRsvp(id);
    if (!existing) return fail('Diese Antwort gibt es nicht mehr.');
    const attending = parsed.entryData.attendance === 'yes';
    await saveRsvp({
      ...existing,
      ...parsed.entryData,
      // Ältere Shuttle-Angaben bleiben erhalten, wenn das Formular sie nicht mehr abfragt.
      shuttle: config.shuttleEnabled || !attending ? parsed.entryData.shuttle : existing.shuttle,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      revision: (existing.revision ?? 0) + 1,
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return fail('Es ist noch kein Speicher eingerichtet.');
    console.error('[admin] Antwort konnte nicht gespeichert werden', error);
    return fail('Das Speichern hat nicht geklappt. Bitte versucht es noch einmal.');
  }

  revalidatePath('/admin');
  redirect('/admin');
}
