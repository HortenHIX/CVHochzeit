'use client';

import type { ReactNode } from 'react';
import { useMinuteClock } from '@/components/layout/clock';
import styles from './Hero.module.css';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Phase = 'before' | 'day' | 'after';

function dayKey(ms: number, timeZone: string): string {
  // en-CA liefert JJJJ-MM-TT
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(ms),
  );
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/**
 * Zeitabhängiger Teil des Hero: Countdown (vorher), „Heute ist es so weit!“
 * (am Tag) oder Dank (danach). Vor dem Mount wird der neutrale Countdown
 * ohne Zahlen gezeigt – dadurch keine Hydration-Unterschiede.
 */
export function Countdown({
  start,
  end,
  timeZone,
  deadline,
  fallbackText,
  actions,
  deadlineNote,
  dayOf,
  after,
}: {
  /** Beginn (ISO) */
  start: string;
  /** Ende der Feier (ISO) */
  end: string;
  timeZone: string;
  /** Rückmeldefrist (ISO) – danach entfällt der Hinweis */
  deadline: string;
  /** Satz für Screenreader und ohne JavaScript */
  fallbackText: string;
  /** Buttons unter dem Countdown */
  actions: ReactNode;
  deadlineNote: ReactNode;
  dayOf: ReactNode;
  after: ReactNode;
}) {
  const now = useMinuteClock();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  let phase: Phase = 'before';
  if (now !== null) {
    if (now >= endMs) phase = 'after';
    else if (now >= startMs || dayKey(now, timeZone) === dayKey(startMs, timeZone)) phase = 'day';
  }

  if (phase === 'day') return <div className={styles.timeline}>{dayOf}</div>;
  if (phase === 'after') return <div className={styles.timeline}>{after}</div>;

  const diff = now === null ? null : Math.max(0, startMs - now);
  const days = diff === null ? null : Math.floor(diff / DAY);
  const hours = diff === null ? null : Math.floor((diff % DAY) / HOUR);
  const minutes = diff === null ? null : Math.floor((diff % HOUR) / MINUTE);
  const showDeadline = now === null || now <= new Date(deadline).getTime();

  const cells: { value: number | null; label: string }[] = [
    { value: days, label: plural(days ?? 0, 'Tag', 'Tage') },
    { value: hours, label: plural(hours ?? 0, 'Stunde', 'Stunden') },
    { value: minutes, label: plural(minutes ?? 0, 'Minute', 'Minuten') },
  ];

  return (
    <div className={styles.timeline}>
      <div className={styles.countdown} aria-live="off">
        <div className={styles.cells} aria-hidden="true">
          {cells.map((cell) => (
            <div key={cell.label.slice(0, 3)} className={styles.cell}>
              <span className={styles.cellValue} data-pending={cell.value === null ? 'true' : undefined}>
                {cell.value === null ? '–' : cell.value}
              </span>
              <span className={styles.cellLabel}>{cell.label}</span>
            </div>
          ))}
        </div>
        <p className="visually-hidden">
          {days === null || hours === null || minutes === null ? (
            fallbackText
          ) : (
            <>
              <time dateTime={`P${days}DT${hours}H${minutes}M`}>
                Noch {days} {plural(days, 'Tag', 'Tage')}, {hours} {plural(hours, 'Stunde', 'Stunden')} und {minutes}{' '}
                {plural(minutes, 'Minute', 'Minuten')}
              </time>{' '}
              bis zur Hochzeit.
            </>
          )}
        </p>
      </div>
      {actions}
      {showDeadline ? deadlineNote : null}
    </div>
  );
}
