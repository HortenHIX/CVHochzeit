import { Ornament } from '@/components/illustrations/Ornament';
import styles from './SectionHeading.module.css';

export function SectionHeading({
  id,
  title,
  eyebrow,
  intro,
  align = 'center',
}: {
  id: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  align?: 'center' | 'start';
}) {
  return (
    <header className={[styles.heading, styles[align]].join(' ')}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      <Ornament className={styles.ornament} />
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}
