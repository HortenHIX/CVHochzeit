import type { Metadata } from 'next';
import { HalfSun, Monogram, Ornament, PampasGrass } from '@/components/illustrations';
import { ButtonLink } from '@/components/ui/Button';
import { site } from '@/content/site';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: `Seite nicht gefunden – ${site.couple.first} & ${site.couple.second}`,
};

/** 404: „Hier wächst noch nichts“ */
export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.scene} aria-hidden="true">
          <HalfSun className={styles.sun} />
          <PampasGrass className={`${styles.grass} ${styles.grassLeft}`} />
          <PampasGrass flip className={`${styles.grass} ${styles.grassRight}`} />
          <span className={styles.ground} />
        </div>
        <p className={styles.eyebrow}>Fehler 404</p>
        <h1 className={styles.title}>Hier wächst noch nichts</h1>
        <Ornament size={140} className={styles.ornament} />
        <p className={styles.text}>
          Diese Seite gibt es leider nicht – vielleicht hat sich ein Tippfehler in die Adresse geschlichen. Auf der
          Startseite findet ihr alles rund um unsere Hochzeit.
        </p>
        <ButtonLink href="/" size="lg" iconAfter="arrow-right" className={styles.button}>
          Zur Startseite
        </ButtonLink>
        <Monogram variant="small" size={48} className={styles.monogram} />
      </div>
    </main>
  );
}
