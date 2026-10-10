import { site } from '@/content/site';

/** Kalendereintrag zum Herunterladen: /kalender.ics */
export function GET() {
  const { first, second } = site.couple;
  const location = site.locations.items.find((l) => l.id === 'feier') ?? site.locations.items[0];
  const where = location ? `${location.name}, ${location.street}, ${location.zipCity}` : site.wedding.place;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CV Hochzeit//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:hochzeit-${toIcsDate(site.wedding.start)}@cv-hochzeit`,
    `DTSTAMP:${toIcsDate(site.wedding.start)}`,
    `DTSTART:${toIcsDate(site.wedding.start)}`,
    `DTEND:${toIcsDate(site.wedding.end)}`,
    fold(`SUMMARY:${escapeText(`Hochzeit ${first} & ${second}`)}`),
    fold(`LOCATION:${escapeText(where)}`),
    fold(`DESCRIPTION:${escapeText(`Wir freuen uns auf euch! ${site.hero.intro}`)}`),
    location ? `GEO:${location.lat};${location.lng}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:${escapeText(`Morgen heiraten ${first} & ${second}!`)}`),
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return new Response(`${ics}\r\n`, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hochzeit-christoph-vera.ics"',
    },
  });
}

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Zeilen nach RFC 5545 auf 75 Oktette umbrechen. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of line) {
    const len = new TextEncoder().encode(char).length;
    const limit = out.length === 0 ? 75 : 74;
    if (currentBytes + len > limit) {
      out.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += len;
  }
  out.push(current);
  return out.join('\r\n ');
}
