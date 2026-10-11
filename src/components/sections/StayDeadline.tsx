'use client';

import type { ReactNode } from 'react';
import { useMinuteClock } from '@/components/layout/clock';
import { Badge } from '@/components/ui/Badge';
import styles from './Stay.module.css';

const DAY = 24 * 60 * 60 * 1000;

/** Kalendertag in der Zeitzone der Hochzeit als UTC-Mitternacht (für Tagesdifferenzen). */
function dayStart(ms: number, timeZone: string): number {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(ms),
  );
  return Date.parse(`${day}T00:00:00Z`);
}

/**
 * Stichwort-Coupon und Frist-Badge eines Hotels. Vor dem Mount (und ohne
 * JavaScript) steht der neutrale Zustand „Kontingent bis …“ mit Coupon.
 * Danach: unter 14 Tagen zusätzlich „· noch X Tage“, nach Ablauf das
 * neutrale Badge „Kontingent abgelaufen …“ und der Coupon verschwindet.
 */
export function StayDeadline({
  deadline,
  deadlineLabel,
  timeZone,
  coupon,
}: {
  /** JJJJ-MM-TT */
  deadline?: string;
  /** z. B. „30. April 2027“ */
  deadlineLabel?: string;
  timeZone: string;
  coupon?: ReactNode;
}) {
  const now = useMinuteClock();
  const days =
    deadline && now !== null ? Math.round((Date.parse(`${deadline}T00:00:00Z`) - dayStart(now, timeZone)) / DAY) : null;
  const expired = days !== null && days < 0;

  let rest: string | null = null;
  if (days !== null && days >= 0 && days < 14) {
    rest = days === 0 ? 'nur noch heute' : days === 1 ? 'noch 1 Tag' : `noch ${days} Tage`;
  }

  return (
    <>
      {coupon && !expired ? coupon : null}
      {deadline ? (
        expired ? (
          <Badge variant="neutral" icon="calendar" className={styles.deadline}>
            <span className={styles.deadlineText}>Kontingent abgelaufen, bitte direkt anfragen</span>
          </Badge>
        ) : (
          <Badge variant="terra" icon="calendar" className={styles.deadline}>
            <span className={styles.deadlineText}>
              Kontingent bis <time dateTime={deadline}>{deadlineLabel ?? deadline}</time>
              {rest ? (
                <>
                  {' '}
                  <strong className={styles.deadlineRest}>· {rest}</strong>
                </>
              ) : null}
            </span>
          </Badge>
        )
      ) : null}
    </>
  );
}
