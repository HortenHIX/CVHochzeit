'use client';

import { Icon } from '@/components/icons/Icon';
import { buttonClassName } from '@/components/ui/Button';
import { useMinuteClock } from './clock';
import styles from './Header.module.css';

export type RsvpState = 'none' | 'yes' | 'no';

/**
 * Zusage-Button im Header.
 * - ohne Antwort: Primär „Zusagen“ (nach der Feier bzw. Frist ausgeblendet)
 * - nach Zusage: Badge-Stil „Zugesagt“ mit Häkchen
 * - nach Absage: „Eure Antwort“
 */
export function HeaderRsvpCta({ state, hideAfter, href }: { state: RsvpState; hideAfter: string; href: string }) {
  const now = useMinuteClock();

  if (state === 'yes') {
    return (
      <a href={href} className={styles.ctaDone}>
        <Icon name="check" size={18} className={styles.ctaDoneIcon} />
        <span>Zugesagt</span>
        <span className="visually-hidden"> – eure Antwort ansehen</span>
      </a>
    );
  }

  if (state === 'no') {
    return (
      <a href={href} className={buttonClassName({ variant: 'secondary', className: styles.cta })}>
        <span>Eure Antwort</span>
      </a>
    );
  }

  if (now !== null && now > new Date(hideAfter).getTime()) return null;

  return (
    <a href={href} className={buttonClassName({ variant: 'primary', className: styles.cta })}>
      <span>Zusagen</span>
    </a>
  );
}
