import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { Monogram, Ornament } from '@/components/illustrations';
import { Footer } from '@/components/layout/Footer';
import { buttonClassName, ButtonLink } from '@/components/ui/Button';
import { site } from '@/content/site';
import { RSVP_COOKIE, SESSION_COOKIE } from '@/lib/auth/token';
import styles from './datenschutz.module.css';

export const metadata: Metadata = {
  title: `Datenschutz – ${site.couple.first} & ${site.couple.second}`,
};

/** Datenschutzhinweise – öffentlich, ohne Anmeldung erreichbar (design.md F „Datenschutz“). */
export default function PrivacyPage() {
  const { responsibleName, responsibleAddress, responsibleEmail } = site.privacy;

  return (
    <>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link href="/" className={styles.brand}>
            <Monogram variant="small" size={40} label="Christoph und Vera – zur Startseite" />
          </Link>
          <Link href="/" className={buttonClassName({ variant: 'ghost', className: styles.back })}>
            <Icon name="arrow-right" size={20} className={styles.backIcon} />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </header>

      <main id="inhalt" className={styles.main}>
        <article className={styles.article}>
          <header className={styles.intro}>
            <p className={styles.eyebrow}>Gut aufgehoben</p>
            <h1 className={styles.title}>Datenschutz</h1>
            <Ornament size={160} className={styles.ornament} />
            <p className={styles.lead}>
              Kurz gesagt: Diese Seite ist eine private Einladung. Wir erheben nur, was wir für die Planung unserer
              Hochzeit brauchen, verwenden keine Tracker und geben nichts weiter, was nicht nötig ist.
            </p>
          </header>

          <section aria-labelledby="ds-verantwortlich" className={styles.block}>
            <h2 id="ds-verantwortlich">Wer ist verantwortlich?</h2>
            <p>Verantwortlich für diese Website und die Verarbeitung eurer Daten sind:</p>
            <address className={styles.address}>
              <strong>{responsibleName}</strong>
              <br />
              {responsibleAddress}
              <br />
              <a href={`mailto:${responsibleEmail}`} className="break-anywhere">
                {responsibleEmail}
              </a>
            </address>
            <p>Bei Fragen zum Datenschutz schreibt uns einfach eine E-Mail.</p>
          </section>

          <section aria-labelledby="ds-daten" className={styles.block}>
            <h2 id="ds-daten">Welche Daten wir verarbeiten</h2>
            <p>
              <strong>Beim Besuch der Seite</strong> fallen nur technisch notwendige Daten an (siehe „Hosting“ und
              „Cookies“).
            </p>
            <p>
              <strong>Wenn ihr uns über das Formular antwortet</strong>, speichern wir eure Angaben:
            </p>
            <ul className={styles.list}>
              <li>Name und – falls angegeben – E-Mail-Adresse der antwortenden Person</li>
              <li>ob ihr kommt, die Namen der mitkommenden Personen und eure Menüwahl</li>
              <li>Angaben zu Kindern (Altersgruppe, Hochstuhl)</li>
              <li>Unverträglichkeiten und Allergien</li>
              <li>Programmpunkte, Übernachtung und Shuttle</li>
              <li>euren Musikwunsch und eure Nachricht an uns</li>
            </ul>
            <p>
              Rechtsgrundlage ist eure Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die ihr mit dem Absenden des
              Formulars gebt.
            </p>
            <p className={styles.note}>
              <Icon name="info" size={22} className={styles.noteIcon} />
              <span>
                Angaben zu Unverträglichkeiten und Allergien sind Gesundheitsdaten. Wir verarbeiten sie nur mit eurer
                ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die ihr beim Absenden gebt – und nur, damit
                in der Küche nichts schiefgeht.
              </span>
            </p>
          </section>

          <section aria-labelledby="ds-zweck" className={styles.block}>
            <h2 id="ds-zweck">Wofür wir sie nutzen</h2>
            <p>
              Ausschließlich für die Planung und Durchführung unserer Hochzeit: Gästeliste, Sitzplan, Essen, Shuttle
              und Unterkünfte. Menüwahl und Unverträglichkeiten geben wir – soweit nötig – an unseren Caterer weiter,
              damit das richtige Essen am richtigen Platz ankommt. Darüber hinaus geben wir eure Angaben an niemanden
              weiter und nutzen sie nicht für Werbung.
            </p>
          </section>

          <section aria-labelledby="ds-dauer" className={styles.block}>
            <h2 id="ds-dauer">Wie lange wir sie speichern</h2>
            <p>{site.rsvp.privacyNote}</p>
            <p>Widerruft ihr eure Einwilligung vorher, löschen wir eure Angaben umgehend.</p>
          </section>

          <section aria-labelledby="ds-hosting" className={styles.block}>
            <h2 id="ds-hosting">Hosting, Speicherung und Server-Logfiles</h2>
            <p>
              Die Website wird bei <strong>Vercel Inc.</strong> (USA) betrieben. Eure Antworten speichern wir in einer
              Datenbank von <strong>Upstash, Inc.</strong>, die in einem Rechenzentrum in der EU liegt. Beide Anbieter
              verarbeiten die Daten nur in unserem Auftrag (Art. 28 DSGVO). Für mögliche Übermittlungen in die USA
              gelten das EU-US Data Privacy Framework bzw. die EU-Standardvertragsklauseln.
            </p>
            {/* Hinweis für die Einrichtung: Beim Anlegen der Upstash-Datenbank die Region EU (z. B. Frankfurt) wählen –
                sonst diesen Absatz anpassen. */}
            <p>
              Beim Aufruf der Seite verarbeitet der Hoster automatisch technische Daten, die euer Browser übermittelt:
              IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse sowie Browser und Betriebssystem. Das ist nötig, um
              die Seite auszuliefern und vor Missbrauch zu schützen (berechtigtes Interesse, Art. 6 Abs. 1 lit. f
              DSGVO). Diese Server-Logfiles werden nach kurzer Zeit automatisch gelöscht.
            </p>
            <p>
              Damit niemand den Gästecode durch Ausprobieren errät, zählen wir Anmeldeversuche pro IP-Adresse – diese
              Zähler verfallen nach einer Minute.
            </p>
          </section>

          <section aria-labelledby="ds-cookies" className={styles.block}>
            <h2 id="ds-cookies">Cookies</h2>
            <p>
              Wir setzen nur zwei technisch notwendige Cookies. Dafür ist keine Einwilligung nötig (§ 25 Abs. 2 Nr. 2
              TDDDG).
            </p>
            <dl className={styles.cookies}>
              <div className={styles.cookie}>
                <dt>
                  <code>{SESSION_COOKIE}</code> – Anmeldung
                </dt>
                <dd>
                  Merkt sich, dass ihr den Gästecode eingegeben habt. Gilt bis zu 12 Monate – oder nur bis zum
                  Schließen des Browsers, wenn ihr „Auf diesem Gerät angemeldet bleiben“ abwählt. Beim Abmelden wird es
                  gelöscht.
                </dd>
              </div>
              <div className={styles.cookie}>
                <dt>
                  <code>{RSVP_COOKIE}</code> – eure Antwort
                </dt>
                <dd>
                  Merkt sich nach dem Absenden, welche Antwort von diesem Gerät kam, damit ihr sie später ansehen und
                  ändern könnt. Gilt 12 Monate.
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="ds-karte" className={styles.block}>
            <h2 id="ds-karte">Karte (OpenStreetMap)</h2>
            <p>
              Die Karte bei „Orte &amp; Anfahrt“ wird erst geladen, wenn ihr sie mit einem Klick aktiviert. Erst dann
              verbindet sich euer Browser mit den Servern der OpenStreetMap Foundation (Vereinigtes Königreich) und
              übermittelt dabei unter anderem eure IP-Adresse. Für das Vereinigte Königreich gilt ein
              Angemessenheitsbeschluss der EU-Kommission.
            </p>
            <p>
              Links zu Google Maps oder Apple Karten öffnen den jeweiligen Dienst erst, wenn ihr sie antippt. Dort gelten
              dessen Datenschutzhinweise.
            </p>
          </section>

          <section aria-labelledby="ds-extern" className={styles.block}>
            <h2 id="ds-extern">Externe Links</h2>
            <p>
              Links zu anderen Seiten – etwa zu unserem Fotoalbum oder zu Hotels – öffnen sich in einem neuen Tab. Dort
              gelten die Datenschutzhinweise des jeweiligen Anbieters.
            </p>
          </section>

          <section aria-labelledby="ds-tracking" className={styles.block}>
            <h2 id="ds-tracking">Keine Tracker, eigene Schriften</h2>
            <p>
              Wir verwenden keine Analyse- oder Tracking-Werkzeuge, keine Werbung und keine Social-Media-Plugins. Die
              Schriften liegen auf unserem eigenen Server – beim Aufruf der Seite wird keine Verbindung zu Google Fonts
              oder anderen Schriftdiensten aufgebaut.
            </p>
          </section>

          <section aria-labelledby="ds-rechte" className={styles.block}>
            <h2 id="ds-rechte">Eure Rechte</h2>
            <p>Ihr habt jederzeit das Recht auf</p>
            <ul className={styles.list}>
              <li>Auskunft über eure gespeicherten Daten (Art. 15 DSGVO),</li>
              <li>Berichtigung (Art. 16) und Löschung (Art. 17),</li>
              <li>Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20),</li>
              <li>
                Widerruf eurer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3) – eine kurze E-Mail genügt.
              </li>
            </ul>
            <p>
              Außerdem könnt ihr euch bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), zum Beispiel
              bei der Behörde eures Bundeslandes.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={`mailto:${responsibleEmail}`} variant="secondary" icon="mail">
                E-Mail an uns
              </ButtonLink>
            </div>
          </section>
        </article>
      </main>

      <Footer topHref="#top" logout="auto" />
    </>
  );
}
