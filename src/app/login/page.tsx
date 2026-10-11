import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { Icon } from '@/components/icons/Icon';
import { ArchFrame, CornerBouquet, HalfSun, Monogram, Ornament, PampasBundle } from '@/components/illustrations';
import { site } from '@/content/site';
import { getAuthSecrets } from '@/lib/auth/config';
import { formatLongDate, telHref } from '@/lib/format';
import { LoginForm } from './LoginForm';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: `Willkommen – ${site.couple.first} & ${site.couple.second}`,
};

/** Login mit dem Gästecode (design.md F „Login“). Kein Header. */
export default function LoginPage() {
  const { first: firstName, second } = site.couple;
  const { helpName, helpPhone } = site.login;

  return (
    <main className={styles.page}>
      <div className={styles.decor} aria-hidden="true">
        <CornerBouquet animated corner="top-left" className={styles.bouquetTop} />
        <CornerBouquet animated corner="bottom-right" className={styles.bouquetBottom} />
        <PampasBundle animated className={styles.pampas} />
      </div>

      <div className={styles.cardWrap}>
        <HalfSun className={styles.sun} />
        <ArchFrame variant="card" className={styles.card} innerClassName={styles.cardInner}>
          <Monogram variant="large" size={72} className={styles.monogram} />
          <p className={styles.eyebrow}>{site.login.eyebrow}</p>
          <h1 className={styles.names}>
            <span className={styles.name}>{firstName}</span>{' '}
            <span className={styles.amp} aria-hidden="true">
              &amp;
            </span>{' '}
            <span className="visually-hidden">und</span> <span className={styles.name}>{second}</span>
          </h1>
          <p className={styles.date}>{formatLongDate(site.wedding.start)}</p>
          <Ornament size={120} className={styles.ornament} />
          <p className={styles.text}>{site.login.text}</p>

          {/* Hinweis bei fehlender Konfiguration; blendet das Formular per CSS aus */}
          <Suspense fallback={null}>
            <SetupNotice />
          </Suspense>
          <LoginForm />

          <p className={styles.help}>
            Code nicht zur Hand? Ruft {helpName} an:{' '}
            <a href={telHref(helpPhone)} className={styles.helpLink}>
              <Icon name="phone" size={16} className={styles.helpIcon} />
              <span className="nums">{helpPhone}</span>
            </a>
          </p>
          <p className={styles.privacy}>
            <Link href="/datenschutz">Datenschutz</Link>
          </p>
        </ArchFrame>
      </div>
    </main>
  );
}

/**
 * Prüft zur Laufzeit, ob ein Gästecode eingerichtet ist – deshalb hinter
 * <Suspense>. Ohne GUEST_CODE (Produktion) erscheint ein freundlicher Hinweis
 * statt des Formulars (`.cardInner:has(.config) .form` in login.module.css).
 */
async function SetupNotice() {
  await connection();
  if (getAuthSecrets().guestCode !== null) return null;
  return (
    <div className={styles.config} role="status">
      <Icon name="key" size={24} className={styles.configIcon} />
      <div>
        <p className={styles.configTitle}>Die Seite ist noch nicht ganz fertig eingerichtet.</p>
        <p>
          Der Gästecode fehlt noch in den Einstellungen (Umgebungsvariable <code>GUEST_CODE</code>). Bitte schaut
          später noch einmal vorbei.
        </p>
      </div>
    </div>
  );
}
