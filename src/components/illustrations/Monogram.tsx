import { site } from '@/content/site';
import { illustrationAttrs, type IllustrationProps } from './shared';

/**
 * PLATZHALTER – E10 Monogramm „C & V“.
 * `label` setzen, wenn das Monogramm als Link/Logo dient (dann role="img").
 */
export function Monogram(
  props: IllustrationProps & { variant?: 'small' | 'default' | 'large'; onDark?: boolean; label?: string },
) {
  const { label } = props;
  const attrs = illustrationAttrs(props, props.variant === 'small' ? 40 : 72);
  const [a, b] = site.couple.initials;
  return (
    <svg
      viewBox="0 0 120 120"
      {...attrs}
      {...(label ? { role: 'img', 'aria-label': label, 'aria-hidden': undefined } : {})}
    >
      <circle cx="60" cy="60" r="57" fill="none" stroke="var(--illu-stem)" />
      <text x="60" y="72" textAnchor="middle" fontSize="40" style={{ fontFamily: 'var(--ff-display)' }} fill="currentColor">
        {a}&amp;{b}
      </text>
    </svg>
  );
}
