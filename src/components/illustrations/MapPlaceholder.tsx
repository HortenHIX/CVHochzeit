import type { IllustrationProps } from './shared';
import { Svg } from './Svg';

const ROADS = ['M-10 140C80 120 140 160 330 110', 'M90 -10C110 60 80 130 120 210', 'M200 -10C190 80 240 120 230 210'];
const PIN = 'M0 0C-8 -10 -8 -20 0 -20C8 -20 8 -10 0 0Z';

/**
 * E15 Karten-Platzhalter, viewBox 0 0 320 200, füllt die Fläche (`slice`).
 * Pins: 1 = Trauung (118, 128), 2 = Feier (222, 96). `labels` ersetzt die Ziffern.
 */
export function MapPlaceholder({ labels = ['1', '2'], ...props }: IllustrationProps & { labels?: [string, string] }) {
  const pins: [number, number, string][] = [
    [118, 128, labels[0]],
    [222, 96, labels[1]],
  ];
  return (
    <Svg
      props={props}
      viewBox="0 0 320 200"
      defaultSize="100%"
      extra={{ preserveAspectRatio: 'xMidYMid slice' }}
    >
      <rect x={-20} y={-20} width={360} height={240} fill="var(--c-sand)" />
      {/* Felder */}
      <path d="M150 20C180 14 200 26 196 46C192 64 170 70 152 62C136 54 132 26 150 20Z" fill="var(--c-sage-100)" fillOpacity={0.7} />
      <path d="M248 140C270 132 300 140 302 160C304 178 280 186 262 180C244 174 236 146 248 140Z" fill="var(--c-sage-100)" fillOpacity={0.7} />
      <path d="M22 156C40 150 62 160 60 176C58 190 36 194 24 186C12 178 10 160 22 156Z" fill="var(--c-sage-100)" fillOpacity={0.55} />
      {/* Bach */}
      <path d="M-10 60C60 80 120 40 200 70S300 50 330 80" fill="none" stroke="var(--c-sage-100)" strokeWidth={5} strokeLinecap="round" />
      {/* Straßen: unten paper 6, darüber line 2 */}
      <path d={ROADS.join('')} fill="none" stroke="var(--c-paper)" strokeWidth={6} strokeLinecap="round" />
      <path d={ROADS.join('')} fill="none" stroke="var(--c-line)" strokeWidth={2} strokeLinecap="round" />
      {pins.map(([x, y, label]) => (
        <g key={label + x} transform={`translate(${x} ${y}) scale(1.35)`}>
          <ellipse cx={0} cy={0.5} rx={4} ry={1.4} fill="var(--c-ink)" fillOpacity={0.15} />
          <path d={PIN} fill="var(--c-terra-700)" />
          <circle cx={0} cy={-13} r={4.6} fill="var(--c-paper)" />
          <text
            x={0}
            y={-10.4}
            textAnchor="middle"
            fontSize={7}
            fontWeight={600}
            fill="var(--c-terra-700)"
            style={{ fontFamily: 'var(--ff-sans)' }}
          >
            {label}
          </text>
        </g>
      ))}
    </Svg>
  );
}
