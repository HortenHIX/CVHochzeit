import Image from 'next/image';
import type { CSSProperties } from 'react';
import logoFull from '@/assets/logo.png';
import logoCompact from '@/assets/logo-small.png';

export type MonogramVariant = 'small' | 'default' | 'large';

const DEFAULT_HEIGHT: Record<MonogramVariant, number> = { small: 44, default: 56, large: 120 };

/**
 * Logo „C & V“ (Sechseck mit Hopfen, Ähren und Kolben).
 * - `small` / `default`: kompakte Fassung ohne Datum (für Header, Siegel, Kleinformate)
 * - `large`: komplette Fassung mit Datum
 * `size` ist die Höhe in px (Breite folgt dem Seitenverhältnis); ohne `size` gilt eine
 * Standardhöhe, die per CSS-Klasse (`className`) überschrieben werden kann.
 * `label` setzen, wenn das Logo als Link dient – sonst ist es reine Dekoration.
 */
export function Monogram({
  variant = 'default',
  size,
  label,
  className,
  style,
}: {
  variant?: MonogramVariant;
  size?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const src = variant === 'large' ? logoFull : logoCompact;
  const height = size ?? DEFAULT_HEIGHT[variant];
  return (
    <Image
      src={src}
      alt={label ?? ''}
      quality={90}
      className={className}
      style={{ height, width: 'auto', ...style }}
    />
  );
}
