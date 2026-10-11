import styles from './illustrations.module.css';
import { BG, cx, LINE, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

const GAP = {
  stroke: BG,
  strokeWidth: 3.5,
  fill: 'none',
  strokeLinecap: 'butt',
  vectorEffect: 'non-scaling-stroke',
} as const;

const SPARKLE = (x: number, y: number, s: number) =>
  `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;

/**
 * Zeichnung der Ringe als <g> im Koordinatensystem 0 0 48 36.
 * Linienfarbe über `color` (Standard currentColor). Die Aussparung an der
 * Verschränkung nutzt `--illu-bg` (Standard paper) – auf anderem Grund die
 * Variable am Elternelement setzen.
 */
export function RingsArt({ color = 'currentColor', sparkles = true }: { color?: string; sparkles?: boolean }) {
  return (
    <g>
      {sparkles ? <path d={`${SPARKLE(42, 6, 3)}${SPARKLE(6, 9, 2)}`} fill={WARM} fillOpacity={0.6} /> : null}
      <circle cx={18} cy={22} r={11} stroke={color} strokeWidth={1.5} {...LINE} />
      <circle cx={30} cy={22} r={11} stroke={color} strokeWidth={1.5} {...LINE} />
      {/* Verschränkung: oben liegt A über B, unten B über A */}
      <path d="M21.76 11.66A11 11 0 0 1 25.91 14.36M25.7 32.13A11 11 0 0 1 22.5 30.04" {...GAP} />
      <path d="M20.47 11.28A11 11 0 0 1 26.78 15.38M26.78 32.52A11 11 0 0 1 21.7 29.22" stroke={color} strokeWidth={1.5} {...LINE} />
      {/* Stein im Brillantschliff (Krone heller, Pavillon voll) auf Ring B */}
      <path d="M26.9 7.4L28.5 5H31.5L33.1 7.4Z" fill={WARM} fillOpacity={0.6} />
      <path d="M26.9 7.4H33.1L30 11.2Z" fill={WARM} />
    </g>
  );
}

/** E7 Ringe, viewBox 0 0 48 36. Farbe erbt (`color`), Standard sage-700. */
export function Rings({ sparkles = true, ...props }: IllustrationProps & { sparkles?: boolean }) {
  return (
    <Svg props={{ ...props, className: cx(styles.rings, props.className) }} viewBox="0 0 48 36" defaultSize={48}>
      <RingsArt sparkles={sparkles} />
    </Svg>
  );
}
