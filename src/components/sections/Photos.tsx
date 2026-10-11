import { Icon } from '@/components/icons/Icon';
import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import { displayUrl } from '@/lib/qr';
import { AlbumOpensBadge } from './AlbumOpensBadge';
import { QrCode } from './QrCode';
import styles from './Photos.module.css';

const QR_LABEL = 'QR-Code zum gemeinsamen Fotoalbum';

/** „19. Juni“ – Tag und Monat in der Zeitzone der Hochzeit */
function dayMonth(day: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    timeZone: site.wedding.timeZone,
  }).format(new Date(`${day}T12:00:00Z`));
}

/**
 * Eure Fotos (#fotos, design.md F9): drei Schritte, Album-Button, Unplugged-
 * Hinweis und der QR-Code – ab 64em als Karte rechts, mobil zum Aufklappen
 * („für andere zeigen“). Der Link zur Druckkarte steht nur im Admin.
 */
export function Photos() {
  const { eyebrow, title, text, steps, albumUrl, albumLabel, albumOpensAt, unpluggedNote } = site.photos;
  if (!albumUrl) return null;
  const hashtag = site.couple.hashtag;

  return (
    <Section id={SECTION_IDS.photos} title={title} eyebrow={eyebrow} intro={text} tone="base">
      <div className={styles.layout}>
        <div className={styles.main}>
          {steps.length > 0 ? (
            <ol className={styles.steps} role="list" aria-label="So funktioniert’s">
              {steps.map((step, i) => (
                <li key={step} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={styles.stepText}>
                    <span className="visually-hidden">Schritt {i + 1}: </span>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}

          <p className={`${styles.printUrl} break-anywhere`}>Album: {displayUrl(albumUrl)}</p>

          <div className={`${styles.cta} no-print`}>
            {albumOpensAt ? (
              <AlbumOpensBadge
                opensAt={albumOpensAt}
                label={dayMonth(albumOpensAt)}
                timeZone={site.wedding.timeZone}
                className={styles.opens}
              />
            ) : null}
            <ButtonLink
              href={albumUrl}
              external
              variant="primary"
              size="lg"
              icon="camera"
              iconAfter="external"
              className={styles.albumButton}
            >
              {albumLabel}
            </ButtonLink>
          </div>

          {unpluggedNote ? (
            <Notice tone="info" icon="camera" className={styles.notice}>
              <p>{unpluggedNote}</p>
            </Notice>
          ) : null}

          {hashtag ? (
            <p className={styles.hashtag}>
              <Icon name="heart" size={18} className={styles.hashtagIcon} />
              <span>
                In sozialen Medien gern mit <strong className={styles.hashtagValue}>{hashtag}</strong>
              </span>
            </p>
          ) : null}

          {/* Mobil: QR-Code zum Weiterzeigen am Tisch */}
          <details className={`${styles.qrDetails} no-print`}>
            <summary className={styles.qrSummary}>
              <Icon name="qr" size={24} className={styles.qrSummaryIcon} />
              <span className={styles.qrSummaryText}>QR-Code für andere zeigen</span>
              <span className={styles.qrToggle} aria-hidden="true" />
            </summary>
            <div className={styles.qrPanel}>
              <QrCode value={albumUrl} label={QR_LABEL} className={styles.qrLarge} />
              <p className={styles.qrCaption}>
                <Icon name="camera" size={18} />
                Mit der Handykamera scannen
              </p>
            </div>
          </details>
        </div>

        {/* Ab 64em: QR-Karte mit Doppel-Haarlinie */}
        <figure className={styles.qrCard}>
          <QrCode value={albumUrl} label={QR_LABEL} className={styles.qrSmall} />
          <figcaption className={styles.qrCaption}>
            <Icon name="camera" size={18} />
            Mit der Handykamera scannen
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
