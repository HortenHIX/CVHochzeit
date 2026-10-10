import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { IconName } from '@/content/site';
import styles from './InfoRow.module.css';

/** Info-Zeile: Icon-Kreis (40 px, Sand) mit Titel und Text daneben. */
export function InfoRow({
  icon,
  title,
  children,
  className,
}: {
  icon: IconName;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')}>
      <span className={styles.iconWrap}>
        <Icon name={icon} size={20} />
      </span>
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  );
}
