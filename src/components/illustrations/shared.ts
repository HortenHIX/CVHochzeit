import type { CSSProperties } from 'react';

/** Gemeinsame Props aller Illustrationen (siehe docs/design.md, Abschnitt E). */
export interface IllustrationProps {
  /** Breite in px oder CSS-Länge; die Höhe ergibt sich aus der viewBox. */
  size?: number | string;
  /** Horizontal spiegeln */
  flip?: boolean;
  /** Drehung in Grad */
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}

/** Standard-Attribute: dekorativ, für Screenreader ausgeblendet. */
export function illustrationAttrs(
  { size, flip, rotate, className, style }: IllustrationProps,
  defaultSize: number | string,
) {
  const transforms = [flip ? 'scaleX(-1)' : '', rotate ? `rotate(${rotate}deg)` : ''].filter(Boolean).join(' ');
  return {
    'aria-hidden': true as const,
    focusable: 'false' as const,
    className: ['illustration', className].filter(Boolean).join(' '),
    style: {
      width: typeof (size ?? defaultSize) === 'number' ? `${size ?? defaultSize}px` : (size ?? defaultSize),
      height: 'auto',
      ...(transforms ? { transform: transforms } : {}),
      ...style,
    } as CSSProperties,
  };
}
