import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E6 Boho-Halbsonne. */
export function HalfSun(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 100" {...illustrationAttrs(props, 200)}>
      <path d="M64 100 A36 36 0 0 1 136 100Z" fill="var(--illu-warm)" opacity=".2" />
    </svg>
  );
}

/** PLATZHALTER – E6 Variante „Nacht“ (Mondsichel). */
export function Moon(props: IllustrationProps) {
  return (
    <svg viewBox="-12 -12 24 24" {...illustrationAttrs(props, 24)}>
      <circle r="10" fill="var(--c-sage-900)" />
    </svg>
  );
}
