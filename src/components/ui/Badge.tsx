import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { IconName } from '@/content/site';
import styles from './Badge.module.css';

export type BadgeVariant = 'neutral' | 'sage' | 'terra' | 'now';

/** Kleines Etikett (28 px), z. B. „Shuttle hält hier“, „Jetzt“, „Zusage“. */
export function Badge({
  variant = 'neutral',
  icon,
  children,
  className,
}: {
  variant?: BadgeVariant;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
