/**
 * Feste HEX-Werte der Farb-Tokens (docs/design.md, Abschnitt B) – nur für
 * Data-URIs, Favicon und Bild-Routen (Apple-Icon, Link-Vorschau), die keine
 * CSS-Variablen kennen. Im Seiten-Markup immer die Variablen verwenden.
 *
 * Bewusst ohne Imports (auch kein CSS-Modul), damit Bild-Routen das Modul
 * gefahrlos laden können.
 */
export const HEX = {
  linen: '#FAF7F2',
  paper: '#FFFDF8',
  sand: '#F0E8DB',
  ink: '#2B3530',
  inkSoft: '#525C55',
  line: '#DCD1C1',
  sage100: '#E2E9DF',
  sage400: '#9AAE97',
  sage700: '#48604C',
  sage900: '#2E4136',
  terra100: '#F6E4D8',
  terra500: '#C27453',
  terra700: '#96492E',
} as const;
