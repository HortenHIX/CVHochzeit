import { site } from '@/content/site';
import { HalfWreathArt } from './HalfWreath';
import { LINE, vars, type IllustrationProps } from './shared';
import { Svg } from './Svg';

export type MonogramVariant = 'small' | 'default' | 'large';

const DEFAULT_SIZE: Record<MonogramVariant, number> = { small: 40, default: 56, large: 72 };

/**
 * E10 Monogramm „C & V“, viewBox 0 0 120 120.
 * - `small` (≤ 48 px, Header): ein Kreis, „C&V“ als ein Text
 * - `default`: Doppelkreis, C und V mit kursivem „&“
 * - `large` (≥ 72 px): zusätzlich der Halbkranz unter den Buchstaben
 * `label` setzen, wenn das Monogramm als Link/Logo dient (dann role="img").
 */
export function Monogram({
  variant = 'default',
  onDark = false,
  label,
  ...props
}: IllustrationProps & { variant?: MonogramVariant; onDark?: boolean; label?: string }) {
  const [a, b] = site.couple.initials;
  const ring = onDark ? 'var(--c-sand)' : 'var(--illu-stem)';
  const ink = onDark ? 'var(--c-sand)' : 'var(--c-ink)';
  const amp = onDark ? 'var(--c-sand)' : 'var(--c-terra-700)';
  const a11y = label
    ? ({ role: 'img', 'aria-label': label, 'aria-hidden': undefined } as const)
    : ({} as Record<string, never>);
  const font = { fontFamily: 'var(--ff-display)' };

  return (
    <Svg props={props} viewBox="0 0 120 120" defaultSize={DEFAULT_SIZE[variant]} extra={a11y}>
      {variant === 'small' ? (
        <>
          <circle cx={60} cy={60} r={57} stroke={ring} strokeWidth={1.5} {...LINE} />
          <text
            x={60}
            y={74}
            textAnchor="middle"
            fontSize={40}
            fontWeight={600}
            fill={ink}
            style={{ ...font, letterSpacing: '-0.02em' }}
          >
            {a}
            <tspan fill={amp} fontStyle="italic" fontWeight={500} fontSize={34} dx={1} dy={-1}>
              &amp;
            </tspan>
            <tspan dx={1} dy={1}>
              {b}
            </tspan>
          </text>
        </>
      ) : (
        <>
          <circle cx={60} cy={60} r={57} stroke={ring} strokeWidth={1} strokeOpacity={0.7} {...LINE} />
          <circle cx={60} cy={60} r={53} stroke={ring} strokeWidth={1} strokeOpacity={0.4} {...LINE} />
          <g style={font} fill={ink} fontSize={44} fontWeight={500} textAnchor="middle">
            <text x={40} y={variant === 'large' ? 62 : 70}>
              {a}
            </text>
            <text x={80} y={variant === 'large' ? 62 : 70}>
              {b}
            </text>
          </g>
          <text
            x={60}
            y={variant === 'large' ? 56 : 64}
            textAnchor="middle"
            fontSize={22}
            fontStyle="italic"
            fontWeight={400}
            fill={amp}
            style={font}
          >
            &amp;
          </text>
          {variant === 'large' ? (
            <g
              transform="translate(22 62) scale(0.475)"
              style={onDark ? vars({ '--illu-stem': 'var(--c-sand)', '--illu-leaf': 'var(--c-sage-400)' }) : undefined}
            >
              <HalfWreathArt />
            </g>
          ) : null}
        </>
      )}
    </Svg>
  );
}
