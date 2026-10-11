import { LEAF, LINE, STEM, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

/** Zeichnung des Trenners als <g> im Koordinatensystem 0 0 240 24. */
export function OrnamentArt() {
  return (
    <g>
      <path d="M0 12H92M148 12H240" stroke={STEM} strokeWidth={1} strokeOpacity={0.45} {...LINE} />
      <ellipse cx={98} cy={9} rx={4.5} ry={3.5} transform="rotate(-20 98 9)" fill={LEAF} fillOpacity={0.6} />
      <ellipse cx={142} cy={9} rx={4.5} ry={3.5} transform="rotate(20 142 9)" fill={LEAF} fillOpacity={0.6} />
      <ellipse cx={108} cy={12} rx={7} ry={5} transform="rotate(-18 108 12)" fill={LEAF} />
      <ellipse cx={132} cy={12} rx={7} ry={5} transform="rotate(18 132 12)" fill={LEAF} />
      <circle cx={120} cy={12} r={2.5} fill={WARM} />
    </g>
  );
}

/** E8 Trennornament, viewBox 0 0 240 24 (Standard 160 px, ab 64em 200 px per Klasse). */
export function Ornament(props: IllustrationProps) {
  return (
    <Svg props={props} viewBox="0 0 240 24" defaultSize={160}>
      <OrnamentArt />
    </Svg>
  );
}
