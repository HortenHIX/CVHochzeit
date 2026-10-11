'use server';

import { site } from '@/content/site';
import { hasRole } from '@/lib/auth/session';
import { rsvpDeadlineIso } from '@/lib/format';
import { getRsvp, saveRsvp, StorageNotConfiguredError } from '@/lib/storage';
import {
  HONEYPOT_FIELD,
  INTENT_FIELD,
  toSummary,
  type RsvpFormState,
  type RsvpFormValues,
  type RsvpSummary,
} from './form-state';
import { forgetOwnRsvp, getOwnRsvpId, rememberOwnRsvp } from './own';
import type { RsvpEntry } from './types';
import { parseRsvpForm, readFormValues } from './validate';

const STORAGE_MESSAGE = 'Das Speichern klappt gerade nicht – bitte meldet euch direkt bei uns.';

/** Zusammenfassung aus den (ggf. ungeprüften) Werten – nur für die Honeypot-Antwort. */
function summaryFromValues(values: RsvpFormValues): RsvpSummary {
  const attending = values.attendance === 'yes';
  return {
    name: values.name,
    email: values.email,
    attendance: attending ? 'yes' : 'no',
    persons: attending
      ? values.persons.map((p) => ({
          name: p.name,
          menu: p.menu,
          child: p.child,
          childAge: p.childAge,
          highChair: p.highChair,
          allergyTags: p.allergyTags,
          allergyNote: p.allergyNote,
        }))
      : [],
    events: attending ? values.events : [],
    overnight: null,
    shuttle: null,
    songWish: values.songWish,
    message: values.message,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Zusage absenden oder ändern (useActionState).
 * Ablauf: Anmeldung prüfen → Honeypot → Prüfung → Frist → bestehende
 * Antwort dieses Geräts laden → speichern → Gerät merken → Zusammenfassung.
 */
export async function submitRsvp(previous: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  const attempt = (previous?.attempt ?? 0) + 1;

  if (!(await hasRole('guest'))) {
    return {
      status: 'error',
      attempt,
      kind: 'auth',
      errors: { form: 'Bitte meldet euch erneut an.' },
      values: readFormValues(formData),
    };
  }

  const parsed = parseRsvpForm(formData);

  // Spam-Bot: so tun, als hätte alles geklappt – aber nichts speichern.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { status: 'success', attempt, summary: summaryFromValues(parsed.values), values: parsed.values };
  }

  if (!parsed.ok) {
    return { status: 'error', attempt, kind: 'validation', errors: parsed.errors, values: parsed.values };
  }

  if (site.rsvp.closeAfterDeadline && Date.now() > new Date(rsvpDeadlineIso()).getTime()) {
    return {
      status: 'error',
      attempt,
      kind: 'closed',
      errors: {
        form: `Die Rückmeldefrist ist leider vorbei. Für Änderungen meldet euch bitte direkt bei ${site.rsvp.changeContactName}.`,
      },
      values: parsed.values,
    };
  }

  try {
    const now = new Date().toISOString();
    // Nur „Antwort ändern“ überschreibt die eigene Antwort; sonst entsteht eine neue.
    const ownId = formData.get(INTENT_FIELD) === 'update' ? await getOwnRsvpId() : null;
    const existing = ownId ? await getRsvp(ownId) : null;
    const entry: RsvpEntry = existing
      ? {
          ...parsed.entryData,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: now,
          revision: (existing.revision ?? 0) + 1,
        }
      : { ...parsed.entryData, id: crypto.randomUUID(), createdAt: now, updatedAt: now, revision: 0 };

    await saveRsvp(entry);
    await rememberOwnRsvp(entry.id);
    return { status: 'success', attempt, summary: toSummary(entry), values: parsed.values };
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      console.error('[rsvp] Kein Speicher konfiguriert – Antwort wurde nicht gespeichert.', error);
    } else {
      console.error('[rsvp] Antwort konnte nicht gespeichert werden.', error);
    }
    return { status: 'error', attempt, kind: 'storage', errors: { form: STORAGE_MESSAGE }, values: parsed.values };
  }
}

/** „Für eine andere Person/Familie antworten“: Verknüpfung dieses Geräts lösen. */
export async function startNewRsvp(): Promise<void> {
  if (!(await hasRole('guest'))) return;
  await forgetOwnRsvp();
}
