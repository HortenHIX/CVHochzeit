import type { VenueVignette as Variant } from '@/content/site';
import { illustrationAttrs, type IllustrationProps } from './shared';

/** PLATZHALTER – E11 Orts-Vignetten (Kapelle, Scheune). */
export function VenueVignette(props: IllustrationProps & { variant: Variant }) {
  return (
    <svg viewBox="0 0 160 120" {...illustrationAttrs(props, 160)} data-variant={props.variant}>
      <path d="M10 110H150" fill="none" stroke="var(--illu-stem)" />
    </svg>
  );
}
