import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E7 Ringe. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function Rings(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 36" {...illustrationAttrs(props, 48)}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
