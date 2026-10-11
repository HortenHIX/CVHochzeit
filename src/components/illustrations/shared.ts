import type { CSSProperties } from 'react';
import styles from './illustrations.module.css';

/** Gemeinsame Props aller Illustrationen (siehe docs/design.md, Abschnitt E). */
export interface IllustrationProps {
  /**
   * Breite in px oder CSS-Länge; die Höhe ergibt sich aus der viewBox.
   * Ohne `size` gilt eine Standardbreite, die per CSS-Klasse (`className`)
   * überschrieben werden kann.
   */
  size?: number | string;
  /** Horizontal spiegeln */
  flip?: boolean;
  /** Drehung in Grad */
  rotate?: number;
  className?: string;
  style?: CSSProperties;
  /**
   * Auch im Druck zeigen (z. B. QR-Tischkarte). Standard: Illustrationen
   * werden im Druck und unter `forced-colors` ausgeblendet.
   */
  printable?: boolean;
}

/* ---------- Farben (über CSS-Variablen, damit Druck/Dunkel nur Variablen tauschen) ---------- */
export const STEM = 'var(--illu-stem)';
export const LEAF = 'var(--illu-leaf)';
export const WARM = 'var(--illu-warm)';
/** Hintergrundfarbe für „Aussparungen“ (Ringe, Koffer, Schachtel) */
export const BG = 'var(--illu-bg, var(--c-paper))';
/** Feine Blattrippen */
export const VEIN = 'var(--illu-vein, var(--c-linen))';

/** Feste HEX-Werte der Tokens – nur für Data-URIs, Favicon und Bild-Routen. */
export const HEX = {
  linen: '#FAF7F2',
  paper: '#FFFDF8',
  sand: '#F0E8DB',
  ink: '#2B3530',
  line: '#DCD1C1',
  sage100: '#E2E9DF',
  sage400: '#9AAE97',
  sage700: '#48604C',
  sage900: '#2E4136',
  terra100: '#F6E4D8',
  terra500: '#C27453',
  terra700: '#96492E',
} as const;

/** Linien-Attribute laut Abschnitt J (runde Enden, nicht skalierende Konturen). */
export const LINE = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const;

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** CSS-Custom-Property-sicheres Style-Objekt. */
export function vars(record: Record<string, string | number>): CSSProperties {
  return record as CSSProperties;
}

/**
 * Standard-Attribute: dekorativ, für Screenreader ausgeblendet.
 *
 * - Mit `size` wird die Breite inline gesetzt (gewinnt immer).
 * - Ohne `size` wird die Standardbreite als `width`-Attribut gesetzt; eine
 *   CSS-Klasse des Aufrufers (z. B. `.ornament{width:200px}`) überschreibt sie.
 * - `flip`/`rotate` nutzen die Einzel-Eigenschaften `scale`/`rotate`, damit ein
 *   `transform` aus der Klasse des Aufrufers (z. B. zum Positionieren) erhalten bleibt.
 */
export function illustrationAttrs(
  { size, flip, rotate, className, style, printable }: IllustrationProps,
  defaultSize: number | string,
) {
  const inline: CSSProperties = {};
  if (size !== undefined) {
    inline.width = typeof size === 'number' ? `${size}px` : size;
  }
  if (flip) inline.scale = '-1 1';
  if (rotate) inline.rotate = `${rotate}deg`;
  return {
    'aria-hidden': true as const,
    focusable: 'false' as const,
    width: size === undefined ? defaultSize : undefined,
    className: cx(printable ? styles.printable : 'illustration', styles.root, className),
    style: { ...inline, ...style },
  };
}
