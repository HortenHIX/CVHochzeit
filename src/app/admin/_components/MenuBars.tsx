import type { CSSProperties } from 'react';
import type { MenuCount } from '@/lib/rsvp/stats';
import styles from '../admin.module.css';

/**
 * Menüwahl als horizontale Balkenliste (design.md F „Admin“): eine Farbe,
 * alle Werte direkt beschriftet, keine Legende.
 */
export function MenuBars({ menus, persons }: { menus: MenuCount[]; persons: number }) {
  const max = Math.max(1, ...menus.map((m) => m.count));

  return (
    <section aria-labelledby="menues-titel" className={styles.card}>
      <div className={styles.cardHead}>
        <h2 id="menues-titel" className={styles.cardTitle}>
          Menüwahl
        </h2>
        <p className={styles.cardMeta}>
          {persons} {persons === 1 ? 'Person' : 'Personen'} insgesamt
        </p>
      </div>
      {persons === 0 ? (
        <p className={styles.empty}>Sobald Zusagen eingehen, seht ihr hier die Menüwahl.</p>
      ) : (
        <ul role="list" className={styles.bars}>
          {menus.map((menu) => (
            <li key={menu.key || 'ohne'} className={styles.barRow}>
              <span className={styles.barLabel}>{menu.label}</span>
              <span className={styles.barTrack}>
                <span
                  className={styles.bar}
                  style={{ '--bar': menu.count / max } as CSSProperties}
                  data-empty={menu.count === 0 || undefined}
                  aria-hidden="true"
                />
                <span className={styles.barValue}>
                  <span className="visually-hidden">: </span>
                  {menu.count}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
