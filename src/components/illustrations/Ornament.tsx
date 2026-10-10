import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E8 Trennornament. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function Ornament(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 240 24" {...illustrationAttrs(props, 160)}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
