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

/** Ziffernblock lesbar gruppieren: 7 → 3+4, 8 → 4+4, 6 → 3+3 … */
function groupDigits(block: string): string[] {
  const n = block.length;
  if (n <= 4) return [block];
  if (n === 5) return [block.slice(0, 2), block.slice(2)];
  if (n === 6) return [block.slice(0, 3), block.slice(3)];
  if (n === 7) return [block.slice(0, 3), block.slice(3)];
  if (n === 8) return [block.slice(0, 4), block.slice(4)];
  return [block.slice(0, 3), ...groupDigits(block.slice(3))];
}

/**
 * Telefonnummer für die Anzeige, z. B. „+49 170 0000001“ → „+49 170 000 0001“,
 * „01701234567“ → „0170 123 4567“. Vorhandene Leerzeichen bleiben Gruppengrenzen.
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+\s]/g, ' ').trim();
  const blocks = cleaned.split(/\s+/).filter(Boolean);
  if (blocks.length === 1 && /^0\d{6,}$/.test(blocks[0])) {
    const b = blocks[0];
    return [b.slice(0, 4), ...groupDigits(b.slice(4))].join(' ');
  }
  return blocks
    .flatMap((b, i) => (i === 0 && b.startsWith('+') ? [b] : groupDigits(b)))
    .join(' ');
}
