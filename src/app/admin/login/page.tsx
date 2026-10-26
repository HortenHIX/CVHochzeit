import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Icon } from '@/components/icons/Icon';
import { ArchFrame, CornerBouquet, HalfSun, Monogram, Ornament } from '@/components/illustrations';
import { site } from '@/content/site';
import { getAuthSecrets } from '@/lib/auth/config';
import { AdminLoginForm } from './LoginForm';
import styles from './admin-login.module.css';

export const metadata: Metadata = {
  title: `Verwaltung – ${site.couple.first} & ${site.couple.second}`,
};

/** Login der Verwaltung – gleiche Bogenkarte wie /login, Eyebrow „Verwaltung“. */
export default function AdminLoginPage() {
  const { first: firstName, second } = site.couple;

  return (
    <main className={styles.page}>
      <div className={styles.decor} aria-hidden="true">
        <CornerBouquet corner="top-left" className={styles.bouquetTop} />
        <CornerBouquet corner="bottom-right" className={styles.bouquetBottom} />
      </div>

      <div className={styles.cardWrap}>
        <HalfSun className={styles.sun} />
        <ArchFrame variant="card" className={styles.card} innerClassName={styles.cardInner}>
          <Monogram variant="large" size={120} className={styles.monogram} />
          <p className={styles.eyebrow}>Verwaltung</p>
          <h1 className={styles.names}>
            <span className={styles.name}>{firstName}</span>{' '}
            <span className={styles.amp} aria-hidden="true">
              &amp;
            </span>{' '}
            <span className="visually-hidden">und</span> <span className={styles.name}>{second}</span>
          </h1>
          <Ornament size={120} className={styles.ornament} />
          <p className={styles.text}>Hier seht ihr alle Zusagen auf einen Blick. Bitte gebt das Admin-Passwort ein.</p>

          {/* Hinweis bei fehlender Konfiguration; blendet das Formular per CSS aus */}
          <Suspense fallback={null}>
            <SetupNotice />
          </Suspense>
          <AdminLoginForm />

          <p className={styles.links}>
            <Link href="/">Zur Startseite</Link>
            <span aria-hidden="true" className={styles.dot}>
              ·
            </span>
            <Link href="/datenschutz">Datenschutz</Link>
          </p>
        </ArchFrame>
      </div>
    </main>
  );
}

/**
 * Prüft zur Laufzeit, ob ein Admin-Passwort eingerichtet ist – deshalb hinter
 * <Suspense>. Fehlt es, erscheint ein Hinweis statt des Formulars
 * (`.cardInner:has(.config) .form` in admin-login.module.css).
 */
async function SetupNotice() {
  await connection();
  if (getAuthSecrets().adminCode !== null) return null;
  return (
    <div className={styles.config} role="status">
      <Icon name="key" size={24} className={styles.configIcon} />
      <div>
        <p className={styles.configTitle}>Die Verwaltung ist noch nicht eingerichtet.</p>
        <p>
          Legt in Vercel unter „Settings → Environment Variables“ ein eigenes Passwort als <code>ADMIN_CODE</code> an
          (anders als der Gästecode) und startet danach ein neues Deployment.
        </p>
      </div>
    </div>
  );
}
