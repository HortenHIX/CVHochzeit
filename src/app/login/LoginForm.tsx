'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { useSearchParam } from '@/lib/use-search-param';
import { login, type LoginState } from './actions';
import styles from './login.module.css';

const INITIAL: LoginState = { status: 'idle', attempt: 0 };

/**
 * Gästecode-Formular. Fehler werden als role="alert" angesagt, das Feld
 * bekommt aria-invalid und der Fokus bleibt bzw. kommt zurück ins Feld.
 *
 * Steht bewusst im statischen Seitengerüst (nicht hinter <Suspense>), damit
 * nichts verloren geht, was vor dem vollständigen Laden eingetippt wurde.
 * `?next=` und `?fehler=code` liest es deshalb selbst aus der Adresse.
 */
export function LoginForm() {
  const next = useSearchParam('next');
  const linkCodeInvalid = useSearchParam('fehler') === 'code';
  const [state, formAction, pending] = useActionState(login, INITIAL);
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = state.status === 'error';
  const fieldInvalid = hasError && (state.kind === 'code' || state.kind === 'empty');

  // Nach einer Fehlermeldung zurück ins Feld (Text markiert, zum Überschreiben).
  useEffect(() => {
    if (state.status !== 'error') return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Doppeltes Absenden verhindern, ohne den Button zu deaktivieren.
    if (pending) event.preventDefault();
  };

  const describedBy = [linkCodeInvalid && !hasError ? 'code-link-hint' : '', hasError ? 'code-error' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <form action={formAction} onSubmit={onSubmit} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />

      {linkCodeInvalid && !hasError ? (
        <p id="code-link-hint" className={styles.linkHint}>
          <Icon name="info" size={20} className={styles.linkHintIcon} />
          <span>Der Code aus eurem Link hat leider nicht gepasst. Gebt ihn hier einfach von Hand ein.</span>
        </p>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="gaestecode" className={styles.label}>
          Gästecode
        </label>
        <input
          ref={inputRef}
          id="gaestecode"
          name="code"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={64}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className={styles.input}
          aria-invalid={fieldInvalid ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        {hasError ? (
          <p key={state.attempt} id="code-error" role="alert" className={styles.error}>
            <Icon name="alert" size={16} className={styles.errorIcon} />
            <span>{state.message}</span>
          </p>
        ) : null}
      </div>

      <label className={styles.remember}>
        <input
          type="checkbox"
          name="remember"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className={styles.checkbox}
        />
        <span>Auf diesem Gerät angemeldet bleiben</span>
      </label>

      <Button
        type="submit"
        size="lg"
        block
        iconAfter={pending ? undefined : 'arrow-right'}
        aria-busy={pending ? true : undefined}
        className={styles.submit}
      >
        {pending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Einen Moment …
          </>
        ) : (
          'Weiter'
        )}
      </Button>
    </form>
  );
}
