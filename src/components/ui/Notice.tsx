import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import type { IconName } from '@/content/site';
import styles from './Notice.module.css';

export type NoticeTone = 'info' | 'important' | 'neutral' | 'error';

const DEFAULT_ICON: Record<NoticeTone, IconName> = {
  info: 'info',
  important: 'alert',
  neutral: 'info',
  error: 'alert',
};

/** Hinweis-Box (Info = Salbei, Wichtig = Terrakotta, Neutral = Sand, Fehler). */
export function Notice({
  tone = 'info',
  icon,
  title,
  children,
  className,
}: {
  tone?: NoticeTone;
  icon?: IconName | null;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const iconName = icon === null ? null : (icon ?? DEFAULT_ICON[tone]);
  return (
    <div className={[styles.notice, styles[tone], className].filter(Boolean).join(' ')}>
      {iconName ? <Icon name={iconName} size={24} className={styles.icon} /> : null}
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
