import { illustrationAttrs, type IllustrationProps } from './shared';

export interface SunPathPoint {
  /** Uhrzeit "HH:MM" (Zeiten nach Mitternacht zählen zum Folgetag) */
  time: string;
}

/**
 * PLATZHALTER – E14 „Sonnenlauf“: Bogen vom Tag in die Nacht mit einem Punkt
 * pro Programmpunkt. `activeIndex` markiert den laufenden Punkt am Hochzeitstag.
 * `showLabels` blendet die Uhrzeiten ein (ab 45em).
 */
export function SunPath(
  props: IllustrationProps & { points: SunPathPoint[]; activeIndex?: number; showLabels?: boolean },
) {
  return (
    <svg viewBox="0 0 720 200" {...illustrationAttrs(props, '100%')}>
      <path d="M40 190 A320 170 0 0 1 680 190" fill="none" stroke="var(--illu-stem)" strokeDasharray="2 6" />
    </svg>
  );
}
