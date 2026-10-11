'use client';

import { Icon } from '@/components/icons/Icon';
import styles from '../admin.module.css';
import { useAdminFilters } from './FilterContext';

/**
 * Macht die Kachel „Unverträglichkeiten“ klickbar (Trefferfläche über die
 * ganze Kachel): setzt den Filter „Mit Allergien“ und springt zur Tabelle.
 */
export function AllergyTileButton() {
  const { showAllergies } = useAdminFilters();
  return (
    <button type="button" className={styles.tileButton} onClick={showAllergies}>
      <span className="visually-hidden">Antworten mit Unverträglichkeiten </span>
      <span>in der Liste zeigen</span>
      <Icon name="arrow-right" size={16} className={styles.tileButtonIcon} />
    </button>
  );
}
