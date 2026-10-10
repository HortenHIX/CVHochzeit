import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E4 Olivenzweig. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function OliveBranch(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 60" {...illustrationAttrs(props, 200)}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
