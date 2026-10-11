import { site } from '@/content/site';

/**
 * Zeit-Helfer für Tagesablauf und Shuttle-Fahrplan: aus Uhrzeiten "HH:MM"
 * werden vollständige ISO-Zeitpunkte am Hochzeitstag. Alles deterministisch
 * (keine aktuelle Uhrzeit), daher im Prerender erlaubt.
 */

const tz = site.wedding.timeZone;

/** Minuten seit Mitternacht für "HH:MM" (ungültig → 0). */
export function toMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

/** JJJJ-MM-TT in der Zeitzone der Hochzeit. */
export function dayInWeddingZone(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso),
  );
}

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Offset der Hochzeits-Zeitzone an einem Tag, z. B. "+02:00". */
function offsetFor(day: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(
    new Date(`${day}T12:00:00Z`),
  );
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  return /GMT([+-]\d{2}:\d{2})/.exec(name)?.[1] ?? '+00:00';
}

export type DayPart = 'day' | 'evening' | 'night';

export interface TimedEntry {
  /** z. B. "2027-06-19T14:00:00+02:00" */
  iso: string;
  /** Minuten seit Mitternacht des Hochzeitstags (Folgetag +24 h) */
  minutes: number;
  /** bis 18 Uhr Tag, 18–22 Uhr Abend, ab 22 Uhr Nacht */
  part: DayPart;
}

/**
 * Uhrzeiten einer Liste → ISO-Zeitpunkte. Zeiten vor der ersten Uhrzeit der
 * Liste gehören zum Folgetag (z. B. 00:00 nach 21:00).
 */
export function timesOnWeddingDay(times: string[], startTime?: string): TimedEntry[] {
  const day = dayInWeddingZone(site.wedding.start);
  const first = toMinutes(startTime ?? times[0] ?? '00:00');
  return times.map((time) => {
    const raw = toMinutes(time);
    const nextDay = raw < first;
    const date = nextDay ? addDays(day, 1) : day;
    const hh = String(Math.floor(raw / 60)).padStart(2, '0');
    const mm = String(raw % 60).padStart(2, '0');
    const minutes = raw + (nextDay ? 24 * 60 : 0);
    const part: DayPart = minutes < 18 * 60 ? 'day' : minutes < 22 * 60 ? 'evening' : 'night';
    return { iso: `${date}T${hh}:${mm}:00${offsetFor(date)}`, minutes, part };
  });
}
