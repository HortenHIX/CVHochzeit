import { sunPathLabels, sunPathPositions, type Pt, type SunPathPosition } from './geometry';
import { HalfSunArt, MoonArt } from './HalfSun';
import styles from './illustrations.module.css';
import { cx, LINE, STEM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

export interface SunPathPoint {
  /** Uhrzeit "HH:MM" (Zeiten nach Mitternacht zählen zum Folgetag) */
  time: string;
}

const MOON: Pt = [704, 150];
const LABEL_SIZE = 15.5;

const TONE: Record<SunPathPosition['tone'], string> = {
  day: 'var(--c-terra-700)',
  evening: 'var(--c-sage-700)',
  night: 'var(--c-sage-900)',
};

/**
 * E14 „Sonnenlauf“, viewBox 0 0 720 200: Bogen vom Tag in die Nacht mit einem
 * Punkt pro Programmpunkt (Start = erste, Ende = letzte Uhrzeit).
 * - `activeIndex` markiert den laufenden Punkt am Hochzeitstag.
 * - `showLabels`: true = immer, false = nie, 'auto' (Standard) = erst ab 45em.
 * Der Schein hinter den Uhrzeiten nutzt `--sunpath-bg` (Standard sand = Hintergrund der Sektion).
 */
export function SunPath({
  points,
  activeIndex,
  showLabels = 'auto',
  ...props
}: IllustrationProps & { points: SunPathPoint[]; activeIndex?: number; showLabels?: boolean | 'auto' }) {
  const times = points.map((p) => p.time);
  const positions = sunPathPositions(times);
  const labels = showLabels ? sunPathLabels(positions, times, activeIndex, LABEL_SIZE, MOON) : [];
  return (
    <Svg props={props} viewBox="0 0 720 200" defaultSize="100%">
      <path d="M20 190H700" stroke="var(--c-line)" strokeWidth={1} {...LINE} />
      <path d="M40 190A320 170 0 0 1 680 190" stroke={STEM} strokeWidth={1} strokeOpacity={0.4} strokeDasharray="2 6" {...LINE} />
      <g transform="translate(8 158) scale(0.32)">
        <HalfSunArt discOpacity={0.3} />
      </g>
      <g transform={`translate(${MOON[0]} ${MOON[1]})`}>
        <MoonArt />
      </g>
      {positions.map((p, i) =>
        i === activeIndex ? (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={11} className={styles.sunHalo} stroke="var(--c-terra-700)" strokeWidth={1} strokeOpacity={0.4} {...LINE} />
            <circle cx={p.x} cy={p.y} r={6} className={styles.sunDotActive} fill="var(--c-terra-700)" />
          </g>
        ) : (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            className={styles.sunDot}
            fill="var(--c-paper)"
            stroke={TONE[p.tone]}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ),
      )}
      {showLabels ? (
        <g className={cx(styles.sunLabel, showLabels === 'auto' && styles.sunLabelsAuto)} fontSize={LABEL_SIZE}>
          {labels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} textAnchor={l.anchor}>
              {times[i]}
            </text>
          ))}
        </g>
      ) : null}
    </Svg>
  );
}
