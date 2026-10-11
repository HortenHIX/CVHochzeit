import { Badge } from '@/components/ui/Badge';
import { site } from '@/content/site';

const DAY = 24 * 60 * 60 * 1000;

/** Kalendertag in der Zeitzone der Hochzeit als UTC-Mitternacht (für Tagesdifferenzen). */
function dayStart(ms: number): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: site.wedding.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
  return Date.parse(`${parts}T00:00:00Z`);
}

/** Ganze Kalendertage bis zur Frist (0 = heute ist der letzte Tag, negativ = vorbei). */
export function daysUntilDeadline(now: number): number {
  return Math.round((Date.parse(`${site.rsvp.deadline}T00:00:00Z`) - dayStart(now)) / DAY);
}

/**
 * Zusatz-Badge neben „Bitte bis …“: erst ab 14 Tagen vor der Frist
 * („noch 5 Tage“), danach „Frist abgelaufen“. Vor dem Mount (now = null)
 * wird nichts gezeigt – keine Hydration-Unterschiede.
 */
export function DeadlineBadge({ now }: { now: number | null }) {
  if (now === null) return null;
  const days = daysUntilDeadline(now);
  if (days > 14) return null;
  if (days < 0) return <Badge variant="neutral">Frist abgelaufen</Badge>;
  if (days === 0) return <Badge variant="now">Heute ist der letzte Tag</Badge>;
  if (days <= 3) return <Badge variant="now">{days === 1 ? 'nur noch bis morgen' : `noch ${days} Tage`}</Badge>;
  return <Badge variant="sage">noch {days} Tage</Badge>;
}
