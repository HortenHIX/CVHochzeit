import {
  ArchFrame,
  CornerBouquet,
  EucalyptusBranch,
  HalfSun,
  Monogram,
  Ornament,
  PampasBundle,
} from '@/components/illustrations';
import { ButtonLink } from '@/components/ui/Button';
import { site } from '@/content/site';
import { formatLongDate, formatTime, rsvpDeadlineIso } from '@/lib/format';
import { RSVP_NAV, SECTION_IDS } from '@/lib/navigation';
import { CalendarMenu, type GoogleCalendarEvent } from './CalendarMenu';
import { Countdown } from './Countdown';
import styles from './Hero.module.css';

/** ISO-Zeitpunkt → YYYYMMDDTHHMMSSZ (UTC) für Google Kalender */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** JJJJ-MM-TT in der Zeitzone der Hochzeit (für <time datetime>) */
function weddingDay(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: site.wedding.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

/**
 * Hero (#start): Doppelbogen mit Namen, Datum und Ort, Countdown,
 * „Jetzt zusagen“ und „Zum Kalender hinzufügen“ (design.md F2).
 */
export function Hero() {
  const { first, second } = site.couple;
  const { start, end, place, timeZone } = site.wedding;
  const venue = site.locations.items.find((l) => l.id === 'feier') ?? site.locations.items[0];
  const deadline = rsvpDeadlineIso();
  const longDate = formatLongDate(start);

  const google: GoogleCalendarEvent = {
    text: `Hochzeit ${first} & ${second}`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    location: venue ? `${venue.name}, ${venue.street}, ${venue.zipCity}` : place,
    details: site.hero.intro,
  };

  const photosAvailable = Boolean(site.photos.albumUrl);

  return (
    <section id="start" aria-labelledby="start-titel" className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.stage}>
          <HalfSun className={styles.sun} />
          <EucalyptusBranch animated className={styles.branch} />

          <ArchFrame className={styles.archWrap} innerClassName={styles.arch}>
            <p className={styles.eyebrow}>{site.hero.eyebrow}</p>
            <h1 id="start-titel" className={styles.names}>
              <span className={styles.name}>{first}</span>{' '}
              <span className={styles.amp} aria-hidden="true">
                &amp;
              </span>{' '}
              <span className="visually-hidden">und</span>{' '}
              <span className={styles.name}>{second}</span>
            </h1>
            <Ornament size={120} className={styles.ornament} />
            <p className={styles.date}>
              <time dateTime={weddingDay(start)}>{longDate}</time>
            </p>
            <p className={styles.place}>{place}</p>
          </ArchFrame>

          <CornerBouquet animated corner="bottom-left" className={styles.bouquet} />
          <PampasBundle animated className={styles.pampas} />
        </div>

        <Countdown
          start={start}
          end={end}
          timeZone={timeZone}
          deadline={deadline}
          fallbackText={`Die Hochzeit beginnt am ${longDate} um ${formatTime(start)} Uhr.`}
          actions={
            <div className={styles.actions}>
              <ButtonLink
                href={`#${RSVP_NAV.id}`}
                size="lg"
                iconAfter="arrow-right"
                className={styles.actionButton}
              >
                Jetzt zusagen
              </ButtonLink>
              <CalendarMenu icsHref="/kalender.ics" google={google} />
            </div>
          }
          deadlineNote={
            <p className={styles.deadline}>
              Bitte gebt uns bis <time dateTime={site.rsvp.deadline}>{formatLongDate(deadline)}</time> Bescheid.
            </p>
          }
          dayOf={
            <div className={styles.moment}>
              <p className={styles.momentText}>{site.hero.dayOfText}</p>
              <ButtonLink href={`#${SECTION_IDS.schedule}`} size="lg" icon="clock" className={styles.actionButton}>
                Zum Tagesablauf
              </ButtonLink>
            </div>
          }
          after={
            <div className={styles.moment}>
              <p className={styles.momentText}>{site.hero.afterText}</p>
              {photosAvailable ? (
                <ButtonLink href={`#${SECTION_IDS.photos}`} size="lg" icon="camera" className={styles.actionButton}>
                  Zum Fotoalbum
                </ButtonLink>
              ) : null}
            </div>
          }
        />
      </div>

      <div className={styles.seal}>
        <span className={styles.sealBadge}>
          <Monogram size={56} />
        </span>
      </div>
    </section>
  );
}
