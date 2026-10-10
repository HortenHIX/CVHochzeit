import type { ReactNode } from 'react';
import { SectionHeading } from './SectionHeading';
import styles from './Section.module.css';

/**
 * Hintergrund-Varianten für den Sektions-Rhythmus:
 * - base: Standard-Papierton
 * - alt:  wärmerer Wechselton
 * - tint: zarter Salbei-Ton
 * - dark: dunkles Salbeigrün (helle Schrift), z. B. für die Zusage
 */
export type SectionTone = 'base' | 'alt' | 'tint' | 'dark';
export type SectionWidth = 'narrow' | 'default' | 'wide';

export function Section({
  id,
  title,
  eyebrow,
  intro,
  tone = 'base',
  width = 'default',
  className,
  children,
}: {
  id: string;
  title: string;
  /** Kleines Label über der Überschrift */
  eyebrow?: string;
  intro?: string;
  tone?: SectionTone;
  width?: SectionWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titel`}
      className={[styles.section, styles[tone], tone === 'dark' ? 'on-dark' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={[styles.inner, styles[width]].join(' ')}>
        <SectionHeading id={`${id}-titel`} title={title} eyebrow={eyebrow} intro={intro} />
        {children}
      </div>
    </section>
  );
}
