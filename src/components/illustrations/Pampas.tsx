import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E3 Pampasgras. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function PampasGrass(props: IllustrationProps & { animated?: boolean }) {
  return (
    <svg viewBox="0 0 80 300" {...illustrationAttrs(props, 80)}>
      <path d="M42 298 Q46 190 34 30" fill="none" stroke="var(--illu-warm)" />
    </svg>
  );
}

/** PLATZHALTER – E3 Bündel-Variante (3 Rispen). */
export function PampasBundle(props: IllustrationProps & { animated?: boolean }) {
  return (
    <svg viewBox="0 0 160 300" {...illustrationAttrs(props, 160)}>
      <path d="M80 298 Q84 190 72 30" fill="none" stroke="var(--illu-warm)" />
    </svg>
  );
}
