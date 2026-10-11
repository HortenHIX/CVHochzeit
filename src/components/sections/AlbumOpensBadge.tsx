'use client';

import { useMinuteClock } from '@/components/layout/clock';
import { Badge } from '@/components/ui/Badge';

/**
 * „Album öffnet am …“ – nur solange das Album noch gesperrt ist.
 * Vor dem Mount (Server, Hydration, ohne JavaScript) wird nichts angezeigt.
 */
export function AlbumOpensBadge({
  opensAt,
  label,
  timeZone,
  className,
}: {
  /** JJJJ-MM-TT (Kalendertag in der Zeitzone der Hochzeit) */
  opensAt: string;
  /** z. B. „19. Juni“ */
  label: string;
  timeZone: string;
  className?: string;
}) {
  const now = useMinuteClock();
  if (now === null) return null;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now));
  if (today >= opensAt) return null;

  return (
    <p className={className}>
      <Badge variant="neutral" icon="calendar">
        <span>
          Album öffnet am <time dateTime={opensAt}>{label}</time>
        </span>
      </Badge>
    </p>
  );
}
