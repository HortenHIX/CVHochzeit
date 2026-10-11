'use client';

import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { adminLogin, type AdminLoginState } from './actions';
import styles from './admin-login.module.css';

const INITIAL: AdminLoginState = { status: 'idle', attempt: 0 };

/**
 * Passwort-Formular der Verwaltung. Fehler werden als role="alert"
 * angesagt; das Feld bekommt aria-invalid und den Fokus zurück.
 */
export function AdminLoginForm({ next = '' }: { next?: string }) {
  const [state, formAction, pending] = useActionState(adminLogin, INITIAL);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = state.status === 'error';
  const fieldInvalid = hasError && (state.kind === 'password' || state.kind === 'empty');

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

  return (
    <form action={formAction} onSubmit={onSubmit} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />
      {/* Hilft Passwort-Managern, das Passwort der Verwaltung zuzuordnen */}
      <input type="text" name="username" autoComplete="username" value="verwaltung" readOnly hidden />

      <div className={styles.field}>
        <label htmlFor="admin-passwort" className={styles.label}>
          Admin-Passwort
        </label>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            id="admin-passwort"
            name="password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={200}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
            aria-invalid={fieldInvalid ? true : undefined}
            aria-describedby={hasError ? 'admin-passwort-fehler' : undefined}
          />
          <button
            type="button"
            className={styles.reveal}
            aria-pressed={visible}
            aria-controls="admin-passwort"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? 'Verbergen' : 'Anzeigen'}
            <span className="visually-hidden"> (Passwort)</span>
          </button>
        </div>
        {hasError ? (
          <p key={state.attempt} id="admin-passwort-fehler" role="alert" className={styles.error}>
            <Icon name="alert" size={16} className={styles.errorIcon} />
            <span>{state.message}</span>
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        block
        iconAfter={pending ? undefined : 'arrow-right'}
        aria-busy={pending ? true : undefined}
      >
        {pending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Einen Moment …
          </>
        ) : (
          'Anmelden'
        )}
      </Button>
    </form>
  );
}
