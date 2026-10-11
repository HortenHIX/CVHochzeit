/**
 * Formatierungs-Helfer ohne Abhängigkeit von der Inhaltsdatei – auch für
 * Client-Komponenten geeignet (src/lib/format.ts importiert `site`).
 */

/** z. B. "19. Juni 2027" in der angegebenen Zeitzone */
export function formatDateIn(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(
    new Date(iso),
  );
}

/** Telefonnummer für tel:-Links (nur Ziffern und führendes +). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
