import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';
import { EucalyptusBranch, Monogram } from '@/components/illustrations';
import { site } from '@/content/site';
import { logout } from '@/lib/auth/actions';
import { SESSION_COOKIE } from '@/lib/auth/token';
import { formatDate } from '@/lib/format';
import { BackToTop } from './BackToTop';
import styles from './Footer.module.css';

/**
 * Fußzeile (sage-900, helle Schrift) mit Eukalyptus-Silhouetten,
 * Monogramm, Datum · Ort und den Links Datenschutz · Abmelden · Nach oben
 * (design.md F13). „Nach oben“ erscheint zusätzlich als schwebender Button
 * nach zwei Bildschirmhöhen.
 *
 * `logout`: `true` (Startseite, immer angemeldet) oder `'auto'` (öffentliche
 * Seiten – „Abmelden“ nur zeigen, wenn eine Anmeldung besteht).
 */
export function Footer({ topHref = '#start', logout: showLogout = true }: { topHref?: string; logout?: boolean | 'auto' }) {
  return (
    <>
      <footer className={`${styles.footer} on-dark`}>
        <div className={styles.silhouettes} aria-hidden="true">
          <EucalyptusBranch variant="silhouette" className={`${styles.leaf} ${styles.leafA}`} />
          <EucalyptusBranch variant="silhouette" className={`${styles.leaf} ${styles.leafB}`} />
          <EucalyptusBranch variant="silhouette" className={`${styles.leaf} ${styles.leafC}`} />
          <EucalyptusBranch variant="silhouette" className={`${styles.leaf} ${styles.leafD}`} />
        </div>

        <div className={styles.inner}>
          <span className={styles.logoPlate}>
            <Monogram variant="large" size={132} />
          </span>
          <p className={styles.date}>
            <time dateTime={site.wedding.start.slice(0, 10)}>{formatDate(site.wedding.start)}</time>
            <span className="visually-hidden">,</span>{' '}
            {/* Trenner gehört zum Ort: bricht die Zeile um, wandert „·“ mit */}
            <span className={styles.place}>
              <span aria-hidden="true">{'·\u00A0'}</span>
              {site.wedding.place}
            </span>
          </p>
          <p className={styles.text}>{site.footer.text}</p>

          <nav aria-label="Fußzeile">
            <ul role="list" className={styles.links}>
              <li>
                <Link href="/datenschutz" className={styles.link}>
                  Datenschutz
                </Link>
              </li>
              {showLogout === 'auto' ? (
                <Suspense fallback={null}>
                  <LogoutIfSignedIn />
                </Suspense>
              ) : showLogout ? (
                <LogoutItem />
              ) : null}
              <li>
                <a href={topHref} className={styles.link}>
                  Nach oben
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}

function LogoutItem() {
  return (
    <li>
      <form action={logout} className={styles.form}>
        <button type="submit" className={styles.link}>
          Abmelden
        </button>
      </form>
    </li>
  );
}

/**
 * Liest das Session-Cookie – deshalb hinter <Suspense>. Es genügt, ob das
 * Cookie existiert (die Prüfung der Signatur bräuchte die aktuelle Zeit).
 */
async function LogoutIfSignedIn() {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  return signedIn ? <LogoutItem /> : null;
}
