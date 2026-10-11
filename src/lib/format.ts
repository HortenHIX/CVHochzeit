import { site } from '@/content/site';

/**
 * Datums-Helfer. Alle Ausgaben in der Zeitzone der Hochzeit, damit die Seite
 * auf jedem Gerät dieselben Zeiten anzeigt.
 */

const tz = site.wedding.timeZone;

/** z. B. "Samstag, 19. Juni 2027" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date(iso));
}

/** z. B. "19. Juni 2027" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date(iso));
}

/** z. B. "19.06.2027" */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date(iso));
}

/** z. B. "14:00" */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(iso));
}

/** z. B. "19.06.2027, 14:32" (für Zeitstempel im Admin-Bereich) */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
  }).format(new Date(iso));
}

/** Rückmeldefrist (JJJJ-MM-TT) als ISO-Zeitpunkt am Ende des Tages. */
export function rsvpDeadlineIso(): string {
  return `${site.rsvp.deadline}T23:59:59${offsetFor(site.rsvp.deadline)}`;
}

/** Offset der Hochzeits-Zeitzone an einem Datum, z. B. "+02:00". */
function offsetFor(day: string): string {
  const probe = new Date(`${day}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(probe);
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = name.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : '+00:00';
}

/** Absätze aus einem Text mit Leerzeilen. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export { telHref } from './format-pure';

/** Navigations-Links für eine Location. */
export function mapLinks(lat: number, lng: number, label: string) {
  const q = encodeURIComponent(label);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    apple: `https://maps.apple.com/?ll=${lat},${lng}&q=${q}`,
    osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
    /** Für die eingebettete Karte (erst nach Klick laden) */
    osmEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.006},${lng + 0.01},${lat + 0.006}&layer=mapnik&marker=${lat},${lng}`,
  };
}
