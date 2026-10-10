import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E1 Eukalyptus-Zweig. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function EucalyptusBranch(props: IllustrationProps & { variant?: 'filled' | 'line'; animated?: boolean }) {
  return (
    <svg viewBox="0 0 120 240" {...illustrationAttrs(props, 120)}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
