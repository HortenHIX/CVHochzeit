'use client';

import type { NavItem } from '@/lib/navigation';
import { useActiveSection } from './useActiveSection';
import styles from './Header.module.css';

/** Navigation ab 75em mit Scrollspy (aktiver Link: aria-current + Unterstrich). */
export function DesktopNav({ items, spyIds }: { items: NavItem[]; spyIds: readonly string[] }) {
  const active = useActiveSection(spyIds);
  return (
    <nav aria-label="Hauptnavigation" className={styles.nav}>
      <ul role="list" className={styles.navList}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={styles.navLink}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
