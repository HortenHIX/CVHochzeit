'use client';

import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { SunPath, type SunPathPoint } from '@/components/illustrations/SunPath';
import { useMinuteClock } from '@/components/layout/clock';
import { Badge } from '@/components/ui/Badge';

/** Index des laufenden Programmpunkts (−1 = keiner, auch vor dem Mount). */
const ActiveStep = createContext(-1);

/**
 * „Live am Hochzeitstag“: ermittelt nach dem Mount den laufenden Punkt.
 * Vor dem Mount (und außerhalb des Tages) ist nichts markiert – dadurch
 * gibt es keine Hydration-Unterschiede.
 */
export function ScheduleLive({ starts, end, children }: { starts: string[]; end: string; children: ReactNode }) {
  const now = useMinuteClock();
  let active = -1;
  if (now !== null && starts.length > 0) {
    const ms = starts.map((s) => Date.parse(s));
    if (now >= ms[0] && now < Date.parse(end)) {
      ms.forEach((t, i) => {
        if (t <= now) active = i;
      });
    }
  }
  return <ActiveStep.Provider value={active}>{children}</ActiveStep.Provider>;
}

/** Listeneintrag mit `aria-current="step"` und `data-now`, solange er läuft. */
export function ScheduleStep({
  index,
  className,
  style,
  children,
}: {
  index: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const active = useContext(ActiveStep);
  const isNow = active === index;
  return (
    <li
      className={className}
      style={style}
      aria-current={isNow ? 'step' : undefined}
      data-now={isNow ? '' : undefined}
      data-past={active > index ? '' : undefined}
    >
      {children}
    </li>
  );
}

export function NowBadge({ index, className }: { index: number; className?: string }) {
  const active = useContext(ActiveStep);
  if (active !== index) return null;
  return (
    <Badge variant="now" className={className}>
      Jetzt
    </Badge>
  );
}

/** Sonnenlauf-Kopfgrafik mit hervorgehobenem laufendem Punkt. */
export function LiveSunPath({ points, className }: { points: SunPathPoint[]; className?: string }) {
  const active = useContext(ActiveStep);
  return <SunPath points={points} activeIndex={active >= 0 ? active : undefined} className={className} />;
}
