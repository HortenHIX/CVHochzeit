'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { buttonClassName } from '@/components/ui/Button';
import styles from './Hero.module.css';

export interface GoogleCalendarEvent {
  text: string;
  /** YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ */
  dates: string;
  location: string;
  details: string;
}

const noopSubscribe = () => () => {};

function googleUrl(event: GoogleCalendarEvent, origin: string): string {
  const details = origin ? `${event.details}\n\nAlle Infos: ${origin}` : event.details;
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.text });
  const rest = new URLSearchParams({ location: event.location, details });
  // Der Schrägstrich zwischen Beginn und Ende bleibt unkodiert (so erwartet es Google).
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${event.dates}&${rest.toString()}`;
}

/**
 * „Zum Kalender hinzufügen“ mit kleinem Popover: Apple/Outlook (.ics) und
 * Google Kalender. Esc schließt und gibt den Fokus an den Button zurück.
 */
export function CalendarMenu({ icsHref, google }: { icsHref: string; google: GoogleCalendarEvent }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  // Seiten-Adresse erst im Browser bekannt (für die Beschreibung im Google-Termin).
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => '',
  );

  // Beim Öffnen den ersten Eintrag fokussieren; Klick außerhalb schließt.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const closeAndFocus = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocus();
      return;
    }
    if (!open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === 'ArrowDown'
        ? links[(index + 1) % links.length]
        : links[(index - 1 + links.length) % links.length];
    next.focus();
  };

  return (
    <div
      ref={wrapRef}
      className={styles.calendar}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        // Fokus verlässt das Menü (Tab) → schließen
        if (open && wrapRef.current && !wrapRef.current.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName({ variant: 'secondary', size: 'lg', className: styles.actionButton })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="calendar-plus" size={20} />
        <span>Zum Kalender hinzufügen</span>
        <Icon name="chevron-down" size={20} className={styles.chevron} />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        className={styles.popover}
        hidden={!open}
        role="group"
        aria-label="Kalender auswählen"
      >
        <ul role="list" className={styles.popoverList}>
          <li>
            <a href={icsHref} className={styles.popoverItem} onClick={() => setOpen(false)}>
              <Icon name="download" size={20} className={styles.popoverIcon} />
              <span>Apple / Outlook (.ics)</span>
            </a>
          </li>
          <li>
            <a
              href={googleUrl(google, origin)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.popoverItem}
              onClick={() => setOpen(false)}
            >
              <Icon name="external" size={20} className={styles.popoverIcon} />
              <span>Google Kalender</span>
              <span className="visually-hidden"> (öffnet in neuem Tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
