import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E15 Karten-Platzhalter. Wird im Build-Schritt gezeichnet (docs/design.md, Abschnitt J). */
export function MapPlaceholder(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 320 200" {...illustrationAttrs(props, '100%')}>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="var(--illu-stem)" strokeDasharray="4 4" />
    </svg>
  );
}
