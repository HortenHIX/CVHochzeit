import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import { LiveSunPath, NowBadge, ScheduleLive, ScheduleStep } from './ScheduleLive';
import { timesOnWeddingDay, type DayPart } from './wedding-time';
import styles from './Schedule.module.css';

/** Farbe der Verbindungslinie je Tageszeit (Verlauf terra-500 → sage-700 → sage-900). */
const LINE_COLOR: Record<DayPart, string> = {
  day: 'var(--c-terra-500)',
  evening: 'var(--c-sage-700)',
  night: 'var(--c-sage-900)',
};

/**
 * Tagesablauf (#ablauf): „Sonnenlauf, vom Tag in die Nacht“ (design.md F4).
 * Kopfgrafik E14, darunter die eigentliche Information als <ol> mit
 * <time datetime>. Am Hochzeitstag markiert ein kleiner Client-Teil den
 * laufenden Punkt („Jetzt“, Ring, aria-current).
 */
export function Schedule() {
  const { items, eyebrow, title, intro } = site.schedule;
  if (items.length === 0) return null;

  const times = timesOnWeddingDay(items.map((i) => i.time));
  const places = new Map(site.locations.items.map((l) => [l.id, l.name]));

  // Der letzte Punkt läuft bis zum Ende der Feier (mindestens eine Stunde).
  const lastStart = Date.parse(times[times.length - 1].iso);
  const weddingEnd = Date.parse(site.wedding.end);
  const end = new Date(Math.max(weddingEnd, lastStart + 60 * 60 * 1000)).toISOString();

  return (
    <Section id={SECTION_IDS.schedule} title={title} eyebrow={eyebrow} intro={intro} tone="alt">
      <ScheduleLive starts={times.map((t) => t.iso)} end={end}>
        <div className={styles.sun}>
          <LiveSunPath points={items.map((i) => ({ time: i.time }))} />
        </div>

        <ol className={styles.list} role="list">
          {items.map((item, i) => {
            const t = times[i];
            const next = times[i + 1];
            const place = item.locationId ? places.get(item.locationId) : undefined;
            const lineStyle = {
              '--line-from': LINE_COLOR[t.part],
              '--line-to': LINE_COLOR[(next ?? t).part],
            } as CSSProperties;
            return (
              <ScheduleStep key={`${item.time}-${i}`} index={i} className={styles.step} style={lineStyle}>
                <span className={styles.medal} data-part={t.part}>
                  <Icon name={item.icon} size={22} />
                </span>
                <p className={styles.time}>
                  <time dateTime={t.iso} className={styles.clock}>
                    {item.time}
                  </time>{' '}
                  <span className={styles.uhr}>Uhr</span>
                </p>
                <div className={styles.body}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{item.title}</h3>
                    <NowBadge index={i} />
                  </div>
                  {place ? (
                    <p className={`label ${styles.place}`}>
                      <Icon name="pin" size={16} />
                      <span>{place}</span>
                    </p>
                  ) : null}
                  {item.description ? <p className={styles.desc}>{item.description}</p> : null}
                  {item.badge ? (
                    <Badge
                      variant="sage"
                      icon={/shuttle|bus/i.test(item.badge) ? 'bus' : 'info'}
                      className={styles.badge}
                    >
                      {item.badge}
                    </Badge>
                  ) : null}
                </div>
              </ScheduleStep>
            );
          })}
        </ol>
      </ScheduleLive>
    </Section>
  );
}
