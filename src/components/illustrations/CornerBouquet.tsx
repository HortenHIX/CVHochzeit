import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E2 Eck-Bouquet. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function CornerBouquet(props: IllustrationProps & { variant?: 'filled' | 'line'; corner?: 'bottom-left' | 'top-right' | 'top-left' | 'bottom-right'; animated?: boolean }) {
  return (
    <svg viewBox="0 0 300 300" {...illustrationAttrs(props, 300)}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
