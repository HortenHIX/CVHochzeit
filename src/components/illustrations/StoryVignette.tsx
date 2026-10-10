import type { StoryVignette as Variant } from '@/content/site';
import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E12 Geschichts-Vignetten (Foto-Platzhalter). */
export function StoryVignette(props: IllustrationProps & { variant: Variant }) {
  return (
    <svg viewBox="0 0 120 120" {...illustrationAttrs(props, 120)} data-variant={props.variant}>
      <circle cx="60" cy="60" r="30" fill="none" stroke="var(--illu-stem)" />
    </svg>
  );
}
