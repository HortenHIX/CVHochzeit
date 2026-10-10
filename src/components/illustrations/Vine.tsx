import { illustrationAttrs, type IllustrationProps } from './shared';

/**
 * PLATZHALTER – E13 Ranken-Kachel (48 × 160, nahtlos, repeat-y) als Data-URI
 * für `background-image`. Farben sind fest eingetragen (Data-URIs kennen keine CSS-Variablen).
 */
export const VINE_TILE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='160'%3E%3Cpath d='M24 0 C16 40 32 120 24 160' fill='none' stroke='%2348604C' stroke-width='1.25'/%3E%3C/svg%3E\")";

/** PLATZHALTER – Blattpaar-Knoten der Zeitleiste, viewBox 0 0 40 24. */
export function LeafNode(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 40 24" {...illustrationAttrs(props, 40)}>
      <circle cx="20" cy="12" r="10" fill="var(--c-paper)" />
      <circle cx="20" cy="12" r="3" fill="var(--illu-warm)" />
    </svg>
  );
}
