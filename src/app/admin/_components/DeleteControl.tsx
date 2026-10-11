'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/icons/Icon';
import { deleteRsvpAction } from '../actions';
import styles from './responses.module.css';

/**
 * Zweistufiges Löschen: „Antwort löschen“ → Rückfrage mit
 * „Ja, endgültig löschen“ / „Abbrechen“ (Fokus startet auf „Abbrechen“).
 */
export function DeleteControl({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted: (id: string, name: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  const confirm = () => {
    if (pending) return;
    setError('');
    startTransition(async () => {
      try {
        const result = await deleteRsvpAction(id);
        if (result.ok) onDeleted(id, name);
        else setError(result.message ?? 'Das Löschen hat nicht geklappt.');
      } catch {
        setError('Das Löschen hat nicht geklappt. Bitte prüft die Verbindung und versucht es noch einmal.');
      }
    });
  };

  if (!confirming) {
    return (
      <div className={styles.deleteBar}>
        <button ref={triggerRef} type="button" className={styles.deleteButton} onClick={() => setConfirming(true)}>
          <Icon name="trash" size={20} />
          <span>
            Antwort löschen<span className="visually-hidden">: {name}</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.confirm} role="group" aria-labelledby={`loeschen-${id}`}>
      <p id={`loeschen-${id}`} className={styles.confirmText}>
        <Icon name="alert" size={20} className={styles.confirmIcon} />
        <span>
          Die Antwort von <strong>„{name}“</strong> endgültig löschen? Das lässt sich nicht rückgängig machen.
        </span>
      </p>
      <div className={styles.confirmActions}>
        <button
          type="button"
          className={styles.confirmDelete}
          onClick={confirm}
          aria-busy={pending ? true : undefined}
        >
          {pending ? <span className={styles.spinner} aria-hidden="true" /> : <Icon name="trash" size={20} />}
          <span>{pending ? 'Wird gelöscht …' : 'Ja, endgültig löschen'}</span>
        </button>
        <button
          ref={cancelRef}
          type="button"
          className={styles.confirmCancel}
          onClick={() => {
            setError('');
            setConfirming(false);
          }}
        >
          Abbrechen
        </button>
      </div>
      {error ? (
        <p role="alert" className={styles.confirmError}>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
