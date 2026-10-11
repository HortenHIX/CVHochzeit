import { Fragment, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { site, type IconName } from '@/content/site';
import type { RsvpStats } from '@/lib/rsvp/stats';
import styles from '../admin.module.css';
import { AllergyTileButton } from './AllergyTileButton';
import { dateTimeLabel } from './rows';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Unterzeile aus Teilen („Personen · 2 Haushalte“): umbrochen wird nur zwischen den Teilen. */
function Parts({ parts, separator = ' ·' }: { parts: string[]; separator?: string }) {
  return parts.map((part, index) => (
    <Fragment key={index}>
      <span className={styles.nowrap}>
        {part}
        {index < parts.length - 1 ? separator : ''}
      </span>
      {index < parts.length - 1 ? ' ' : ''}
    </Fragment>
  ));
}

function Tile({
  id,
  label,
  icon,
  value,
  sub,
  action,
}: {
  id: string;
  label: ReactNode;
  icon: IconName;
  value: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={action ? `${styles.tile} ${styles.tileInteractive}` : styles.tile} data-tile={id}>
      <dt className={styles.tileLabel}>
        <Icon name={icon} size={20} className={styles.tileIcon} />
        <span>{label}</span>
      </dt>
      <dd className={styles.tileValue}>{value}</dd>
      {sub ? <dd className={styles.tileSub}>{sub}</dd> : null}
      {action ? <dd className={styles.tileAction}>{action}</dd> : null}
    </div>
  );
}

const OVERNIGHT_ICON: Record<string, IconName> = { home: 'car' };

/** Kennzahlen-Kacheln (design.md F „Admin“): 2 Spalten, ab 64em 4. */
export function StatTiles({ stats }: { stats: RsvpStats }) {
  const eventIcons = new Map<string, IconName>(site.rsvp.events.map((e) => [e.id, e.icon]));

  return (
    <section aria-labelledby="kennzahlen-titel" className={styles.block}>
      <h2 id="kennzahlen-titel" className="visually-hidden">
        Kennzahlen
      </h2>
      <dl className={styles.tiles}>
        <Tile
          id="personen"
          label="Personen zugesagt"
          icon="users"
          value={stats.persons}
          sub={`aus ${plural(stats.yes, 'Haushalt', 'Haushalten')}`}
        />
        <Tile id="absagen" label="Absagen" icon="x" value={stats.no} sub={stats.no === 1 ? 'Haushalt' : 'Haushalte'} />
        <Tile
          id="antworten"
          label="Antworten gesamt"
          icon="envelope"
          value={stats.total}
          sub={
            stats.lastUpdatedAt ? (
              // Datum und Uhrzeit dürfen getrennt umbrechen (schmale Kacheln bei 320 px).
              <>
                zuletzt <Parts parts={dateTimeLabel(stats.lastUpdatedAt).split(', ')} separator="," />
              </>
            ) : (
              'noch keine'
            )
          }
        />
        <Tile
          id="kinder"
          label="Kinder"
          icon="child"
          value={stats.children}
          sub={stats.highChairs > 0 ? `davon ${stats.highChairs} mit Hochstuhl` : 'ohne Hochstuhl'}
        />
        <Tile
          id="shuttle"
          label="Shuttle hin / zurück"
          icon="bus"
          value={
            <>
              <span aria-hidden="true">
                {stats.shuttleThere}
                <span className={styles.tileSlash}> / </span>
                {stats.shuttleBack}
              </span>
              <span className="visually-hidden">
                {stats.shuttleThere} hin, {stats.shuttleBack} zurück
              </span>
            </>
          }
          sub={<Parts parts={['Plätze', plural(stats.shuttleHouseholds, 'Haushalt', 'Haushalte')]} />}
        />
        {stats.overnight.map((row) => (
          <Tile
            key={row.key}
            id={`uebernachtung-${row.key}`}
            label={row.label}
            icon={OVERNIGHT_ICON[row.key] ?? 'bed'}
            value={row.persons}
            sub={<Parts parts={['Personen', plural(row.households, 'Haushalt', 'Haushalte')]} />}
          />
        ))}
        {stats.events.map((row) => (
          <Tile
            key={row.key}
            id={`programm-${row.key}`}
            label={row.label}
            icon={eventIcons.get(row.key) ?? 'calendar'}
            value={row.persons}
            sub={<Parts parts={row.detail ? ['Personen', ...row.detail.split(' · ')] : ['Personen']} />}
          />
        ))}
        <Tile
          id="allergien"
          label={<>Unverträg&shy;lichkeiten</>}
          icon="alert"
          value={stats.allergyPersons}
          sub={stats.allergyPersons === 1 ? 'Person' : 'Personen'}
          action={stats.allergyPersons > 0 ? <AllergyTileButton /> : undefined}
        />
      </dl>
    </section>
  );
}
