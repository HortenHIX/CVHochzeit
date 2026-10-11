import { OLIVE_FRUITS, OLIVE_LEAF, OLIVE_LEAVES, OLIVE_STEM } from './geometry';
import { LEAF, LINE, STEM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

/** E4 Olivenzweig, viewBox 0 0 200 60 (Geschenke, über der H2). */
export function OliveBranch(props: IllustrationProps) {
  return (
    <Svg props={props} viewBox="0 0 200 60" defaultSize={200}>
      <g transform="translate(100 30) scale(0.93) translate(-100 -30)">
        {OLIVE_FRUITS.map((o) => (
          <path key={o.stalk} d={o.stalk} stroke={STEM} strokeWidth={0.9} strokeOpacity={0.7} {...LINE} />
        ))}
        <path d={OLIVE_STEM} stroke={STEM} strokeWidth={1.25} strokeOpacity={0.8} {...LINE} />
        {OLIVE_LEAVES.map((l) => (
          <path
            key={l.transform}
            d={OLIVE_LEAF}
            transform={l.transform}
            fill={l.fill === 'stem' ? STEM : LEAF}
            fillOpacity={l.opacity}
          />
        ))}
        {OLIVE_FRUITS.map((o) => (
          <ellipse
            key={o.cx}
            cx={o.cx}
            cy={o.cy}
            rx={3.6}
            ry={2.8}
            transform={`rotate(${o.angle} ${o.cx} ${o.cy})`}
            fill={STEM}
            fillOpacity={0.6}
          />
        ))}
      </g>
    </Svg>
  );
}
