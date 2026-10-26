import { Fragment } from 'react';
import { Icon } from '@/components/icons/Icon';
import { MapPlaceholder, VenueVignette } from '@/components/illustrations';
import { ButtonLink } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { InfoRow } from '@/components/ui/InfoRow';
import { Paragraphs } from '@/components/ui/Paragraphs';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site, type Location } from '@/content/site';
import { mapLinks } from '@/lib/format';
import { SECTION_IDS } from '@/lib/navigation';
import { MapEmbed } from './MapEmbed';
import { PrintInfoSheet } from './PrintInfoSheet';
import styles from './Locations.module.css';

const r5 = (n: number) => Math.round(n * 1e5) / 1e5;

/** OpenStreetMap-Einbettung: bei mehreren Orten ein Ausschnitt um alle. */
function embedFor(items: Location[], marker: Location): string {
  if (items.length === 1) return mapLinks(marker.lat, marker.lng, marker.name).osmEmbed;
  const lats = items.map((l) => l.lat);
  const lngs = items.map((l) => l.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const padLat = Math.max((maxLat - minLat) * 0.35, 0.004);
  const padLng = Math.max((maxLng - minLng) * 0.35, 0.006);
  const bbox = [minLng - padLng, minLat - padLat, maxLng + padLng, maxLat + padLat].map(r5).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker.lat},${marker.lng}`;
}

function VenueCard({ place }: { place: Location }) {
  const coords = `${place.lat},${place.lng}`;
  const google = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  const apple = `https://maps.apple.com/?daddr=${coords}`;
  const titleId = `ort-${place.id}`;
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <VenueVignette variant={place.vignette} className={styles.vignette} />
      </div>
      <div className={styles.cardBody}>
        <p className={`label ${styles.cardLabel}`}>
          {place.label}
          {place.time ? (
            <>
              {' '}
              {/* Trenner und Uhrzeit umbrechen nur gemeinsam */}
              <span className={styles.timePart}>
                <span aria-hidden="true">·&nbsp;</span>
                <span className="visually-hidden">, </span>
                <span className="nums">{place.time}</span>
              </span>
            </>
          ) : null}
        </p>
        <h3 id={titleId} className={styles.cardTitle}>
          {place.name}
        </h3>
        <address className={styles.address}>
          {place.street}
          {place.zipCity ? (
            <>
              <br />
              {place.zipCity}
            </>
          ) : null}
        </address>
        {place.description ? <p className={styles.cardText}>{place.description}</p> : null}

        <div className={`${styles.cardActions} no-print`}>
          <div className={styles.mapButtons}>
            <ButtonLink href={google} variant="secondary" iconAfter="external" className={styles.mapButton}>
              Google Maps<span className="visually-hidden">: Route zu {place.name}</span>
            </ButtonLink>
            <ButtonLink href={apple} variant="secondary" iconAfter="external" className={styles.mapButton}>
              Apple Karten<span className="visually-hidden">: Route zu {place.name}</span>
            </ButtonLink>
          </div>
          <CopyButton
            variant="ghost"
            value={[place.name, place.street, place.zipCity].filter(Boolean).join(', ')}
            label="Adresse kopieren"
            toast="Adresse kopiert"
            className={styles.copy}
          />
        </div>
      </div>
    </article>
  );
}

/**
 * Orte & Anfahrt (#anfahrt, design.md F5): Orts-Karten mit Bogenkopf,
 * Fahrzeit-Chip, Karte mit Einwilligung, Info-Zeilen und das druckbare
 * Infoblatt.
 */
export function Locations() {
  const { items, eyebrow, title, intro, travelTimeBetween, travel } = site.locations;
  if (items.length === 0) return null;

  const marker = items.find((l) => l.id === 'feier') ?? items[items.length - 1];
  const showConnector = items.length === 2 && Boolean(travelTimeBetween);
  const names = items.map((l) => l.name);
  const mapTitle = `Karte mit ${names.length > 1 ? `${names.slice(0, -1).join(', ')} und ${names.at(-1)}` : names[0]} (OpenStreetMap)`;

  const rows = [
    { icon: 'parking', title: 'Parken', text: travel.parking },
    { icon: 'train', title: 'Mit Bahn & Bus', text: travel.train, shuttle: site.stay.shuttle.enabled },
    { icon: 'accessibility', title: 'Barrierefreiheit', text: travel.accessibility },
  ] as const;

  return (
    <Section id={SECTION_IDS.locations} title={title} eyebrow={eyebrow} intro={intro} tone="base">
      <div className={styles.venues} data-count={items.length}>
        {items.map((place, i) => (
          <Fragment key={place.id}>
            {i === 1 && showConnector ? (
              <p className={styles.connector}>
                <span className={styles.chip}>
                  <Icon name="car" size={18} />
                  <span>{travelTimeBetween}</span>
                </span>
              </p>
            ) : null}
            <Reveal delay={i * 80} className={styles.venue}>
              <VenueCard place={place} />
            </Reveal>
          </Fragment>
        ))}
      </div>

      <div className={styles.travel}>
        <MapEmbed
          src={embedFor(items, marker)}
          title={mapTitle}
          markerName={items.length > 1 ? marker.name : undefined}
          places={items.map((l) => ({ name: l.name, href: mapLinks(l.lat, l.lng, l.name).osm }))}
          placeholder={<MapPlaceholder labels={['1', '2']} />}
        />

        {rows.some((r) => r.text) ? (
          <div className={styles.infoRows}>
            {rows.map((row) =>
              row.text ? (
                <InfoRow key={row.title} icon={row.icon} title={row.title}>
                  <Paragraphs text={row.text} />
                  {'shuttle' in row && row.shuttle ? (
                    <p>
                      <a href="#shuttle" className={styles.inlineLink}>
                        Zum Shuttle-Fahrplan
                      </a>
                    </p>
                  ) : null}
                </InfoRow>
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      <div className={`${styles.printRow} no-print`}>
        <PrintInfoSheet />
      </div>
    </Section>
  );
}
