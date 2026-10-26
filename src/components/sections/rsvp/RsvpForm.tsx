'use client';

import {
  Fragment,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type FormEvent,
  type MouseEvent,
  type Ref,
} from 'react';
import { flushSync } from 'react-dom';
import { unstable_rethrow } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { OliveBranch, Rings } from '@/components/illustrations';
import { useMinuteClock } from '@/components/layout/clock';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import type { IconName, RsvpOption } from '@/content/site';
import { startNewRsvp, submitRsvp } from '@/lib/rsvp/actions';
import { rsvpClosedAt } from '@/lib/rsvp/config';
import {
  DRAFT_KEY,
  DRAFT_VERSION,
  emptyPerson,
  emptyValues,
  errorId,
  fieldId,
  HONEYPOT_FIELD,
  INITIAL_FORM_STATE,
  INTENT_FIELD,
  MESSAGE_ANNOUNCE_FROM,
  type PersonFormValues,
  type RsvpFieldErrors,
  type RsvpFormState,
  type RsvpFormValues,
  type RsvpInitial,
  type RsvpIntent,
} from '@/lib/rsvp/form-state';
import { RSVP_LIMITS } from '@/lib/rsvp/types';
import { cleanValues, parseRsvpForm, readFormValues, validateValues } from '@/lib/rsvp/validate';
import { DeadlineBadge } from './DeadlineBadge';
import { PersonCard } from './PersonCard';
import { CheckboxRow, ChoiceCard, FieldError, Group, SelectField, Stepper, SubGroup, TextAreaField, TextField } from './RsvpFields';
import { RsvpResult } from './RsvpResult';
import { useRsvpConfig } from './RsvpConfigContext';
import styles from './RsvpForm.module.css';

const NO_ERRORS: RsvpFieldErrors = {};

/**
 * Server Action mit Netz: Bricht die Verbindung ab (Funkloch, Server weg),
 * bleibt das Formular samt Eingaben stehen und zeigt einen Hinweis – statt
 * der Absturzseite. Weiterleitungen (z. B. zur Anmeldung) gehen durch.
 */
async function submitSafely(previous: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  try {
    return await submitRsvp(previous, formData);
  } catch (error) {
    unstable_rethrow(error);
    return {
      status: 'error',
      kind: 'storage',
      attempt: previous.attempt + 1,
      errors: { form: 'Die Verbindung hat nicht geklappt. Bitte prüft euer Internet und sendet noch einmal.' },
      values: readFormValues(formData),
    };
  }
}
const OVERNIGHT_ICONS: Record<string, IconName> = { hotel: 'bed', self: 'key', home: 'car' };

/* ---------------------------------------------------------------------------
 * Browser-Zustand
 * ------------------------------------------------------------------------- */

interface ClientPerson extends PersonFormValues {
  /** Stabiler React-Schlüssel (Namen der Felder hängen am Index) */
  uid: string;
}

interface ClientValues extends Omit<RsvpFormValues, 'persons'> {
  persons: ClientPerson[];
  /** Person 1 übernimmt „Euer Name“, bis sie selbst geändert wird. */
  p0Linked: boolean;
}

let uidCounter = 0;
const nextUid = () => `neu-${++uidCounter}`;

function toClient(values: RsvpFormValues): ClientValues {
  const persons = (values.persons.length ? values.persons : [emptyPerson(values.name)]).map((p, i) => ({
    ...p,
    uid: `p-${i}`,
  }));
  return { ...values, persons, p0Linked: !persons[0].name || persons[0].name === values.name };
}

function toPlain(v: ClientValues): RsvpFormValues {
  return {
    attendance: v.attendance,
    name: v.name,
    email: v.email,
    persons: v.persons.map((p) => ({
      name: p.name,
      menu: p.menu,
      child: p.child,
      childAge: p.childAge,
      highChair: p.highChair,
      allergyTags: p.allergyTags,
      allergyOther: p.allergyOther,
      allergyNote: p.allergyNote,
    })),
    events: v.events,
    overnight: v.overnight,
    shuttleThere: v.shuttleThere,
    shuttleBack: v.shuttleBack,
    shuttleFrom: v.shuttleFrom,
    shuttleSeats: v.shuttleSeats,
    songWish: v.songWish,
    message: v.message,
    consent: v.consent,
  };
}

/* ---------------------------------------------------------------------------
 * Entwurf (localStorage, nur Komfort – darf jederzeit fehlen)
 * ------------------------------------------------------------------------- */

function sanitizeDraft(raw: unknown, maxPersons: number, allEventIds: readonly string[]): RsvpFormValues | null {
  if (!raw || typeof raw !== 'object') return null;
  const stored = raw as { v?: unknown; values?: unknown };
  if (stored.v !== DRAFT_VERSION || !stored.values || typeof stored.values !== 'object') return null;
  const r = stored.values as Record<string, unknown>;
  const base = emptyValues(allEventIds);
  const s = (v: unknown) => (typeof v === 'string' ? v : '');
  const b = (v: unknown) => v === true;
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const persons = Array.isArray(r.persons)
    ? r.persons.slice(0, maxPersons).map((raw): PersonFormValues => {
        const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        return {
          name: s(p.name),
          menu: s(p.menu),
          child: b(p.child),
          childAge: s(p.childAge),
          highChair: b(p.highChair),
          allergyTags: list(p.allergyTags),
          allergyOther: b(p.allergyOther),
          allergyNote: s(p.allergyNote),
        };
      })
    : base.persons;
  return {
    attendance: r.attendance === 'yes' || r.attendance === 'no' ? r.attendance : '',
    name: s(r.name),
    email: s(r.email),
    persons: persons.length ? persons : base.persons,
    events: Array.isArray(r.events) ? list(r.events) : base.events,
    overnight: s(r.overnight),
    shuttleThere: b(r.shuttleThere),
    shuttleBack: b(r.shuttleBack),
    shuttleFrom: s(r.shuttleFrom),
    shuttleSeats: typeof r.shuttleSeats === 'number' ? r.shuttleSeats : base.shuttleSeats,
    songWish: s(r.songWish),
    message: s(r.message),
    // Die Einwilligung wird bewusst nicht gespeichert.
    consent: false,
  };
}

function readDraft(maxPersons: number, allEventIds: readonly string[]): RsvpFormValues | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? sanitizeDraft(JSON.parse(raw), maxPersons, allEventIds) : null;
  } catch {
    return null;
  }
}

function writeDraft(values: RsvpFormValues): boolean {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: DRAFT_VERSION, values: { ...values, consent: false } }));
    return true;
  } catch {
    return false;
  }
}

function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ohne Speicherzugriff gibt es auch keinen Entwurf.
  }
}

// Einmal pro Seitenaufruf lesen; danach stabil (useSyncExternalStore braucht stabile Werte).
let draftSnapshot: { value: RsvpFormValues | null } | null = null;
const getDraftSnapshot = (maxPersons: number, allEventIds: readonly string[]) =>
  (draftSnapshot ??= { value: readDraft(maxPersons, allEventIds) });
const getServerDraftSnapshot = () => null;
const noopSubscribe = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/* ---------------------------------------------------------------------------
 * Formular
 * ------------------------------------------------------------------------- */

/**
 * Zusage-Formular (design.md F10). Ein lokaler Entwurf wird erst nach dem
 * Laden im Browser gelesen; ist einer da, startet das Formular damit neu.
 */
export function RsvpForm({ initial }: { initial: RsvpInitial | null }) {
  const { rsvp, allEventIds } = useRsvpConfig();
  const draft = useSyncExternalStore(
    noopSubscribe,
    () => getDraftSnapshot(rsvp.maxPersons, allEventIds),
    getServerDraftSnapshot,
  );
  const draftValues = draft?.value ?? null;
  return <RsvpFormInner key={draftValues ? 'entwurf' : 'neu'} initial={initial} draft={draftValues} />;
}

type View = 'form' | 'summary';

function RsvpFormInner({ initial, draft }: { initial: RsvpInitial | null; draft: RsvpFormValues | null }) {
  const config = useRsvpConfig();
  const { rsvp, shuttleEnabled, shuttleHotels, shuttleTimes, deadlineText } = config;
  const deadlineMs = new Date(config.deadlineIso).getTime();
  const showStay = rsvp.askOvernight || shuttleEnabled;
  const [state, formAction, pending] = useActionState(submitSafely, INITIAL_FORM_STATE);
  const hydrated = useSyncExternalStore(noopSubscribe, getHydrated, getServerHydrated);
  const now = useMinuteClock();

  const [values, setValues] = useState<ClientValues>(() => {
    if (state.status !== 'idle') return toClient(state.values);
    if (initial) return toClient(initial.values);
    if (draft) return toClient(draft);
    return toClient(emptyValues(config.allEventIds));
  });
  const [view, setView] = useState<View>(() => (initial && state.status === 'idle' ? 'summary' : 'form'));
  const [intent, setIntent] = useState<RsvpIntent>('new');
  /** Ergebnisse bis zu diesem Versuch sind „erledigt“ (z. B. nach „Antwort ändern“). */
  const [ack, setAck] = useState(0);
  /** Felder, deren Fehler angezeigt werden (nach dem Absenden bzw. beim Verlassen). */
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(
    () => new Set(state.status === 'error' ? Object.keys(state.errors) : []),
  );
  const [errorFocus, setErrorFocus] = useState(0);
  const [draftRestored, setDraftRestored] = useState(() => Boolean(!initial && draft && state.status === 'idle'));
  const [dirty, setDirty] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [removed, setRemoved] = useState<{ person: ClientPerson; index: number } | null>(null);
  const [messageAnnouncement, setMessageAnnouncement] = useState('');

  const errorBoxRef = useRef<HTMLDivElement>(null);
  const formHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);

  /* ---------- Abgeleiteter Zustand ---------- */

  const deadlinePassed = now !== null && now > deadlineMs;
  const closed = now !== null && rsvpClosedAt(config, now);
  const fresh = state.attempt > ack;
  const success = fresh && state.status === 'success' ? state : null;
  const serverErrors = fresh && state.status === 'error' ? state.errors : NO_ERRORS;
  const serverKind = fresh && state.status === 'error' ? state.kind : null;
  const mode = success ? 'success' : closed ? 'closed' : view;
  const attending = values.attendance === 'yes';
  const personCount = values.persons.length;
  const atMax = personCount >= rsvp.maxPersons;
  const anyShuttle = values.shuttleThere || values.shuttleBack;
  const seats = Math.min(Math.max(values.shuttleSeats, 1), Math.max(personCount, 1));
  const submittedOnce = errorFocus > 0 || state.attempt > 0;

  const plain = toPlain(values);
  const live = validateValues(cleanValues(plain), config);
  const liveErrors = live.ok ? NO_ERRORS : live.errors;
  const shown: RsvpFieldErrors = {};
  if (serverErrors.form) shown.form = serverErrors.form;
  for (const [key, message] of Object.entries(liveErrors)) {
    if (revealed.has(key) || key in serverErrors) shown[key] = message;
  }
  const errorEntries = Object.entries(shown);

  const deadlineHint = !rsvp.closeAfterDeadline
    ? deadlinePassed
      ? 'Eure Antwort könnt ihr auch jetzt noch ändern.'
      : 'Eure Antwort könnt ihr jederzeit ändern.'
    : `Ihr könnt eure Antwort bis ${deadlineText} jederzeit ändern.`;

  const numbers = (() => {
    let n = 2;
    const persons = n++;
    const events = rsvp.events.length > 0 ? n++ : 0;
    const stay = showStay ? n++ : 0;
    return { persons, events, stay, more: attending ? n : 2 };
  })();

  /* ---------- Effekte ---------- */

  // Nach einer Server-Antwort: Fehlerbox bzw. Bestätigungs-Überschrift fokussieren.
  useEffect(() => {
    if (state.status === 'error') errorBoxRef.current?.focus();
    if (state.status === 'success') {
      clearDraft();
      resultHeadingRef.current?.focus();
    }
  }, [state]);

  // Nach der Vorab-Prüfung im Browser: Fehlerbox fokussieren.
  useEffect(() => {
    if (errorFocus > 0) errorBoxRef.current?.focus();
  }, [errorFocus]);

  // Entwurf speichern (nur für neue Antworten, kurz nach der letzten Änderung).
  useEffect(() => {
    if (!dirty || mode !== 'form' || intent !== 'new') return;
    const timer = window.setTimeout(() => {
      if (writeDraft(toPlain(values))) setDraftSaved(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [values, dirty, mode, intent]);

  // Hinweis „Person entfernt – Rückgängig“ nach einer Weile ausblenden.
  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), 12_000);
    return () => window.clearTimeout(timer);
  }, [removed]);

  // Zeichenzähler: Screenreader erst ab 450 Zeichen und erst nach einer Tipp-Pause informieren.
  const messageLength = values.message.length;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMessageAnnouncement(
        messageLength >= MESSAGE_ANNOUNCE_FROM
          ? `Noch ${Math.max(0, RSVP_LIMITS.message - messageLength)} von ${RSVP_LIMITS.message} Zeichen frei.`
          : '',
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [messageLength]);

  /* ---------- Änderungen ---------- */

  const edit = (updater: (current: ClientValues) => ClientValues) => {
    setValues(updater);
    setDirty(true);
  };

  const set = <K extends keyof ClientValues>(key: K, value: ClientValues[K]) =>
    edit((current) => ({ ...current, [key]: value }));

  const setName = (name: string) =>
    edit((current) => ({
      ...current,
      name,
      persons: current.p0Linked ? current.persons.map((p, i) => (i === 0 ? { ...p, name } : p)) : current.persons,
    }));

  const updatePerson = (index: number, patch: Partial<PersonFormValues>) =>
    edit((current) => {
      const persons = current.persons.map((p, i) => (i === index ? { ...p, ...patch } : p));
      const p0Linked =
        index === 0 && patch.name !== undefined ? patch.name === '' || patch.name === current.name : current.p0Linked;
      return { ...current, persons, p0Linked };
    });

  const setAllergyOther = (index: number, checked: boolean) => {
    flushSync(() => updatePerson(index, { allergyOther: checked }));
    if (checked) document.getElementById(fieldId(`p${index}.allergyNote`))?.focus();
  };

  const addPerson = () => {
    if (atMax) return;
    const index = personCount;
    flushSync(() => {
      edit((current) => ({
        ...current,
        persons: [...current.persons, { ...emptyPerson(), uid: nextUid() }],
        // Plätze wachsen mit, solange sie der Personenzahl entsprachen.
        shuttleSeats: current.shuttleSeats >= current.persons.length ? current.persons.length + 1 : current.shuttleSeats,
      }));
      setRemoved(null);
    });
    document.getElementById(fieldId(`p${index}.name`))?.focus();
  };

  const removePerson = (index: number) => {
    const person = values.persons[index];
    if (!person || index === 0) return;
    flushSync(() => {
      edit((current) => ({
        ...current,
        persons: current.persons.filter((_, i) => i !== index),
        shuttleSeats: Math.min(current.shuttleSeats, current.persons.length - 1),
      }));
      setRemoved({ person, index });
    });
    undoRef.current?.focus();
  };

  const undoRemove = () => {
    if (!removed || atMax) return;
    const at = Math.min(removed.index, personCount);
    const person = removed.person;
    flushSync(() => {
      edit((current) => {
        const persons = [...current.persons];
        persons.splice(at, 0, person);
        return { ...current, persons };
      });
      setRemoved(null);
    });
    document.getElementById(fieldId(`p${at}.name`))?.focus();
  };

  const toggleEvent = (id: string, checked: boolean) =>
    edit((current) => {
      const events = checked ? [...current.events, id] : current.events.filter((e) => e !== id);
      return { ...current, events: rsvp.events.map((e) => e.id).filter((e) => events.includes(e)) };
    });

  const setShuttle = (key: 'shuttleThere' | 'shuttleBack', checked: boolean) =>
    edit((current) => {
      const next = { ...current, [key]: checked };
      // Beim ersten Anhaken: Plätze = Personenzahl
      if (checked && !current.shuttleThere && !current.shuttleBack) next.shuttleSeats = current.persons.length;
      return next;
    });

  /* ---------- Absenden & Fehler ---------- */

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Eigene Übergabe statt automatischer Formular-Aktion: kein Zurücksetzen der Felder.
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const result = parseRsvpForm(formData, config);
    if (!result.ok) {
      setRevealed((current) => new Set([...current, ...Object.keys(result.errors)]));
      setAck(state.attempt);
      setErrorFocus((n) => n + 1);
      return;
    }
    startTransition(() => formAction(formData));
  };

  // Nach dem ersten Absenden: Fehler eines Feldes beim Verlassen prüfen.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!submittedOnce) return;
    const key = (event.target as HTMLElement).dataset?.errorKey;
    if (!key || revealed.has(key)) return;
    setRevealed((current) => new Set([...current, key]));
  };

  const focusField = (event: MouseEvent<HTMLAnchorElement>, key: string) => {
    const container = document.getElementById(fieldId(key));
    if (!container) return;
    event.preventDefault();
    const target = container.matches('input, select, textarea, button')
      ? container
      : container.querySelector<HTMLElement>(
          'input:checked:not([type="hidden"]), input:not([type="hidden"]), select, textarea, button',
        );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = container.id ? document.querySelector(`label[for="${container.id}"]`) : null;
    (label ?? container).scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    target?.focus({ preventScroll: true });
  };

  /* ---------- Ansichtswechsel ---------- */

  const editAnswer = () => {
    const source = success?.values ?? initial?.values;
    flushSync(() => {
      if (source) setValues(toClient(source));
      setAck(state.attempt);
      setView('form');
      setIntent('update');
      setRevealed(new Set());
      setDirty(false);
      setDraftRestored(false);
      setRemoved(null);
    });
    formHeadingRef.current?.focus();
  };

  const resetForm = () => {
    clearDraft();
    setValues(toClient(emptyValues(config.allEventIds)));
    setRevealed(new Set());
    setDirty(false);
    setDraftSaved(false);
    setDraftRestored(false);
    setRemoved(null);
  };

  const startNew = () => {
    flushSync(() => {
      resetForm();
      setAck(state.attempt);
      setView('form');
      setIntent('new');
    });
    formHeadingRef.current?.focus();
    // Verknüpfung dieses Geräts mit der bisherigen Antwort lösen.
    startTransition(async () => {
      try {
        await startNewRsvp();
      } catch (error) {
        // Ohne Verbindung bleibt die alte Verknüpfung bestehen; „Neu“ legt trotzdem eine neue Antwort an.
        unstable_rethrow(error);
      }
    });
  };

  /* ---------- Ergebnis-Ansichten ---------- */

  if (mode === 'success' && success) {
    return (
      <RsvpResult
        variant="success"
        summary={success.summary}
        headingRef={resultHeadingRef}
        deadlineHint={deadlineHint}
        onEdit={editAnswer}
        onNew={startNew}
      />
    );
  }

  if (mode === 'closed') {
    return (
      <RsvpResult
        variant="closed"
        summary={initial?.summary ?? null}
        headingRef={resultHeadingRef}
        deadlineHint={deadlineHint}
      />
    );
  }

  if (mode === 'summary' && initial) {
    return (
      <RsvpResult
        variant="existing"
        summary={initial.summary}
        headingRef={resultHeadingRef}
        deadlineHint={deadlineHint}
        onEdit={editAnswer}
        onNew={startNew}
      />
    );
  }

  /* ---------- Formular ---------- */

  const attendanceError = shown.attendance;

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      onBlur={onBlur}
      noValidate
      className={styles.form}
      data-ready={hydrated || undefined}
      aria-labelledby="rsvp-formular-titel"
    >
      <input type="hidden" name={INTENT_FIELD} value={intent} />

      <header className={styles.head}>
        <h3 id="rsvp-formular-titel" ref={formHeadingRef} tabIndex={-1} className={styles.title}>
          {intent === 'update' ? 'Antwort ändern' : 'Eure Antwort'}
        </h3>
        <p className={styles.deadline}>
          <Badge variant="terra" icon="calendar">
            <span>
              Bitte bis <time dateTime={rsvp.deadline}>{deadlineText}</time>
            </span>
          </Badge>
          <DeadlineBadge now={now} />
        </p>
      </header>

      {draftRestored ? (
        <Notice tone="info" icon="refresh" className={styles.notice}>
          <p>Wir haben euren angefangenen Entwurf von diesem Gerät wiederhergestellt.</p>
          <button type="button" className={styles.inlineAction} onClick={resetForm}>
            Lieber neu beginnen
          </button>
        </Notice>
      ) : null}

      {errorEntries.length > 0 ? (
        <div ref={errorBoxRef} tabIndex={-1} role="alert" className={styles.errorBox}>
          <Notice
            tone="error"
            title={serverKind && serverKind !== 'validation' && errorEntries.length === 1 ? 'Das hat leider nicht geklappt:' : 'Bitte prüft noch:'}
          >
            <ul className={styles.errorList}>
              {errorEntries.map(([key, message]) =>
                key === 'form' ? (
                  <li key={key}>
                    {message}
                    {serverKind === 'auth' ? (
                      <>
                        {' '}
                        <a href="/login?next=%2F%23zusage">Zur Anmeldung</a>
                      </>
                    ) : null}
                    {serverKind === 'storage' && config.fullSite ? (
                      <>
                        {' '}
                        <a href="#kontakt">Zu den Kontakten</a>
                      </>
                    ) : null}
                  </li>
                ) : (
                  <li key={key}>
                    <a href={`#${fieldId(key)}`} onClick={(event) => focusField(event, key)}>
                      {message}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </Notice>
        </div>
      ) : null}

      {/* 1. Kommt ihr? */}
      <Group number={1} title="Kommt ihr?" separated={false}>
        <div className={styles.attendanceWrap}>
          <div id={fieldId('attendance')} className={styles.attendance}>
            <ChoiceCard
              size="lg"
              type="radio"
              name="attendance"
              value="yes"
              checked={values.attendance === 'yes'}
              onChange={() => set('attendance', 'yes')}
              title="Ja, wir kommen gern"
              subtitle="Wir feiern mit euch"
              icon={<Rings size={48} />}
              invalid={Boolean(attendanceError)}
              describedBy={attendanceError ? errorId('attendance') : undefined}
              errorKey="attendance"
            />
            <ChoiceCard
              size="lg"
              type="radio"
              name="attendance"
              value="no"
              checked={values.attendance === 'no'}
              onChange={() => set('attendance', 'no')}
              title="Leider nicht"
              subtitle="Wir sind in Gedanken bei euch"
              icon={<OliveBranch size={64} rotate={-22} />}
              invalid={Boolean(attendanceError)}
              describedBy={attendanceError ? errorId('attendance') : undefined}
              errorKey="attendance"
            />
          </div>
          <FieldError errorKey="attendance" message={attendanceError} />
        </div>

        <TextField
          id={fieldId('name')}
          name="name"
          label="Euer Name"
          hint="Vor- und Nachname, z. B. „Anna & Ben Müller“"
          value={values.name}
          onChange={setName}
          autoComplete="name"
          inputMode="text"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={RSVP_LIMITS.name}
          errorKey="name"
          error={shown.name}
        />
        <TextField
          id={fieldId('email')}
          name="email"
          type="email"
          label="E-Mail"
          optional
          hint="für Rückfragen"
          value={values.email}
          onChange={(email) => set('email', email)}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={RSVP_LIMITS.email}
          errorKey="email"
          error={shown.email}
        />
      </Group>

      {/* 2.–4. nur bei Zusage */}
      <div className={styles.collapse} data-open={attending}>
        <div className={styles.collapseInner}>
          <Group number={numbers.persons} title="Wer kommt?">
            <p className={styles.groupIntro}>Tragt bitte alle ein, die mitkommen – euch selbst eingeschlossen.</p>
            <div className={styles.persons}>
              {values.persons.map((person, index) => (
                <Fragment key={person.uid}>
                  {removed && removed.index === index ? (
                    <UndoBar removed={removed} undoRef={undoRef} onUndo={undoRemove} disabled={atMax} />
                  ) : null}
                  <PersonCard
                    index={index}
                    person={person}
                    linkedName={index === 0 && values.p0Linked}
                    errors={shown}
                    onChange={(patch) => updatePerson(index, patch)}
                    onRemove={index > 0 ? () => removePerson(index) : undefined}
                    onAllergyOther={(checked) => setAllergyOther(index, checked)}
                  />
                </Fragment>
              ))}
              {removed && removed.index >= personCount ? (
                <UndoBar removed={removed} undoRef={undoRef} onUndo={undoRemove} disabled={atMax} />
              ) : null}
            </div>
            <div className={styles.addRow}>
              <Button
                id={fieldId('persons')}
                variant="secondary"
                size="lg"
                block
                icon="plus"
                className={styles.addButton}
                onClick={addPerson}
                aria-disabled={atMax || undefined}
                aria-describedby={['rsvp-personen-zaehler', shown.persons ? errorId('persons') : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                Weitere Person hinzufügen
              </Button>
              <p id="rsvp-personen-zaehler" className={styles.addCount}>
                <span className="nums">
                  {personCount} von max. {rsvp.maxPersons} Personen
                </span>
                {atMax ? (
                  <span className={styles.addLimit}>
                    Mehr passen nicht in eine Antwort – für weitere Gäste schickt bitte eine eigene Antwort.
                  </span>
                ) : null}
              </p>
              <FieldError errorKey="persons" message={shown.persons} />
            </div>
          </Group>

          {rsvp.events.length > 0 ? (
            <Group number={numbers.events} title="Programm" id={fieldId('events')}>
              <p id="rsvp-programm-hinweis" className={styles.groupIntro}>
                Wobei seid ihr dabei? Nehmt einfach den Haken heraus, wo ihr nicht könnt.
              </p>
              <div className={styles.stack}>
                {rsvp.events.map((event) => (
                  <ChoiceCard
                    key={event.id}
                    type="checkbox"
                    name="events"
                    value={event.id}
                    checked={values.events.includes(event.id)}
                    onChange={(checked) => toggleEvent(event.id, checked)}
                    title={event.label}
                    subtitle={event.detail}
                    icon={<Icon name={event.icon} size={24} />}
                    invalid={Boolean(shown.events)}
                    describedBy={['rsvp-programm-hinweis', shown.events ? errorId('events') : ''].filter(Boolean).join(' ')}
                    errorKey="events"
                  />
                ))}
              </div>
              <FieldError errorKey="events" message={shown.events} />
            </Group>
          ) : null}

          {showStay ? (
            <Group number={numbers.stay} title="Übernachtung & Shuttle">
              {rsvp.askOvernight ? (
                <SubGroup legend="Wo übernachtet ihr?" optional id={fieldId('overnight')}>
                  <div className={styles.overnight}>
                    {rsvp.overnightOptions.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        type="radio"
                        name="overnight"
                        value={option.value}
                        checked={values.overnight === option.value}
                        onChange={() => set('overnight', option.value)}
                        title={option.label}
                        subtitle={(option as RsvpOption).description}
                        icon={<Icon name={OVERNIGHT_ICONS[option.value] ?? 'bed'} size={24} />}
                        invalid={Boolean(shown.overnight)}
                        describedBy={shown.overnight ? errorId('overnight') : undefined}
                        errorKey="overnight"
                      />
                    ))}
                  </div>
                  <FieldError errorKey="overnight" message={shown.overnight} />
                </SubGroup>
              ) : null}

              {shuttleEnabled ? (
                <SubGroup
                  legend="Shuttle"
                  optional
                  hintId="rsvp-shuttle-hinweis"
                  hint={
                    config.fullSite ? (
                      <>
                        Fahrplan und Haltestellen findet ihr unter{' '}
                        <a href="#uebernachten" className={styles.inlineLink}>
                          Übernachten & Shuttle
                        </a>
                        .
                      </>
                    ) : undefined
                  }
                >
                  <div className={styles.shuttle}>
                    <ChoiceCard
                      type="checkbox"
                      name="shuttleThere"
                      value="on"
                      checked={values.shuttleThere}
                      onChange={(checked) => setShuttle('shuttleThere', checked)}
                      title="Shuttle Hinfahrt"
                      subtitle={shuttleTimes.there ?? undefined}
                      icon={<Icon name="bus" size={24} />}
                    />
                    <ChoiceCard
                      type="checkbox"
                      name="shuttleBack"
                      value="on"
                      checked={values.shuttleBack}
                      onChange={(checked) => setShuttle('shuttleBack', checked)}
                      title="Shuttle Rückfahrt"
                      subtitle={shuttleTimes.back ?? undefined}
                      icon={<Icon name="bus" size={24} />}
                    />
                  </div>
                  {anyShuttle ? (
                    <div className={styles.shuttleDetails}>
                      {shuttleHotels.length > 0 ? (
                        <SelectField
                          id={fieldId('shuttleFrom')}
                          name="shuttleFrom"
                          label={values.shuttleThere ? 'Ab welchem Hotel?' : 'Zu welchem Hotel?'}
                          value={values.shuttleFrom}
                          onChange={(hotel) => set('shuttleFrom', hotel)}
                          options={shuttleHotels.map((hotel) => ({ value: hotel, label: hotel }))}
                          placeholder="Bitte wählen"
                          errorKey="shuttleFrom"
                          error={shown.shuttleFrom}
                        />
                      ) : null}
                      <Stepper
                        id={fieldId('shuttleSeats')}
                        name="shuttleSeats"
                        label="Plätze"
                        value={seats}
                        min={1}
                        max={Math.max(personCount, 1)}
                        onChange={(value) => set('shuttleSeats', value)}
                        unit={['Platz', 'Plätze']}
                        errorKey="shuttleSeats"
                        error={shown.shuttleSeats}
                      />
                    </div>
                  ) : null}
                </SubGroup>
              ) : null}
            </Group>
          ) : null}
        </div>
      </div>

      {/* 5. Noch etwas? */}
      <Group number={numbers.more} title="Noch etwas?">
        {rsvp.askSongWish ? (
          <TextField
            id={fieldId('songWish')}
            name="songWish"
            label="Musikwunsch"
            optional
            hint="Welcher Song bringt euch auf die Tanzfläche?"
            value={values.songWish}
            onChange={(songWish) => set('songWish', songWish)}
            autoComplete="off"
            inputMode="text"
            maxLength={RSVP_LIMITS.songWish}
            errorKey="songWish"
            error={shown.songWish}
          />
        ) : null}

        <TextAreaField
          id={fieldId('message')}
          name="message"
          label="Nachricht an uns"
          optional
          value={values.message}
          onChange={(message) => set('message', message)}
          maxLength={RSVP_LIMITS.message}
          describedBy="rsvp-nachricht-grenze"
          errorKey="message"
          error={shown.message}
          footer={
            <p className={styles.counter}>
              <span id="rsvp-nachricht-grenze" className="visually-hidden">
                Höchstens {RSVP_LIMITS.message} Zeichen.
              </span>
              <span className="nums" aria-hidden="true">
                {messageLength} / {RSVP_LIMITS.message}
              </span>
              <span className="visually-hidden" aria-live="polite">
                {messageAnnouncement}
              </span>
            </p>
          }
        />

        <div className={styles.consent}>
          <CheckboxRow
            id={fieldId('consent')}
            name="consent"
            checked={values.consent}
            onChange={(consent) => set('consent', consent)}
            describedBy={['rsvp-einwilligung-hinweis', shown.consent ? errorId('consent') : ''].filter(Boolean).join(' ')}
            invalid={Boolean(shown.consent)}
            errorKey="consent"
          >
            Ich bin einverstanden, dass meine Angaben (inkl. Unverträglichkeiten) zur Planung der Hochzeit gespeichert
            werden.
          </CheckboxRow>
          <p id="rsvp-einwilligung-hinweis" className={styles.consentNote}>
            {rsvp.privacyNote}{' '}
            <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
              Datenschutz
              <Icon name="external" size={16} className={styles.inlineLinkIcon} />
              <span className="visually-hidden"> (öffnet in neuem Tab)</span>
            </a>
          </p>
          <FieldError errorKey="consent" message={shown.consent} />
        </div>

        {/* Honeypot: für Menschen unsichtbar, Bots füllen es gern aus. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="rsvp-website">Website (bitte leer lassen)</label>
          <input id="rsvp-website" type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </Group>

      <div className={styles.submitArea}>
        <Button
          type="submit"
          size="lg"
          className={styles.submit}
          iconAfter={pending ? undefined : 'arrow-right'}
          aria-busy={pending || undefined}
        >
          {pending ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Wird gesendet …
            </>
          ) : (
            'Antwort senden'
          )}
        </Button>
        <p className={styles.submitHint}>{deadlineHint}</p>
        {draftSaved ? (
          <p className={styles.draftState}>
            <Icon name="check" size={16} />
            Entwurf auf diesem Gerät gespeichert
          </p>
        ) : null}
      </div>
    </form>
  );
}

function UndoBar({
  removed,
  undoRef,
  onUndo,
  disabled,
}: {
  removed: { person: ClientPerson; index: number };
  undoRef: Ref<HTMLButtonElement>;
  onUndo: () => void;
  disabled: boolean;
}) {
  const who = removed.person.name || `Person ${removed.index + 1}`;
  return (
    <div className={styles.undo} role="status">
      <span className={styles.undoText}>{who} entfernt.</span>
      {!disabled ? (
        <button ref={undoRef} type="button" className={styles.undoButton} onClick={onUndo}>
          Rückgängig<span className="visually-hidden"> – {who} wieder hinzufügen</span>
        </button>
      ) : null}
    </div>
  );
}
