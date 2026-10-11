import { WREATH_BRANCH, WREATH_CHECK, WREATH_LEAVES, type WreathLeaf } from './geometry';
import styles from './illustrations.module.css';
import { LEAF, LINE, STEM, vars, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

function Branch({ animated, mirrored }: { animated: boolean; mirrored: boolean }) {
  const leaf = (l: WreathLeaf) => (
    <g
      key={l.i}
      className={animated ? styles.wreathLeaf : undefined}
      style={animated ? vars({ '--i': l.i, transformOrigin: `${l.origin[0]}px ${l.origin[1]}px` }) : undefined}
    >
      <path d={l.petiole} stroke={STEM} strokeWidth={1} {...LINE} />
      <path d={l.shape} fill={LEAF} fillOpacity={l.opacity} />
    </g>
  );
  return (
    <g transform={mirrored ? 'matrix(-1 0 0 1 160 0)' : undefined}>
      {WREATH_LEAVES.filter((l) => !l.outside).map(leaf)}
      <path
        d={WREATH_BRANCH}
        stroke={STEM}
        strokeWidth={1.25}
        pathLength={1}
        className={animated ? styles.wreathDraw : undefined}
        {...LINE}
      />
      {WREATH_LEAVES.filter((l) => l.outside).map(leaf)}
    </g>
  );
}

/** Zeichnung des Halbkranzes als <g> im Koordinatensystem 0 0 160 100. */
export function HalfWreathArt({ withCheck = false, animated = false }: { withCheck?: boolean; animated?: boolean }) {
  return (
    <g>
      <Branch animated={animated} mirrored={false} />
      <Branch animated={animated} mirrored />
      <circle cx={80} cy={93} r={2.5} fill={WARM} className={animated ? styles.wreathDot : undefined} />
      {withCheck ? (
        <path
          d={WREATH_CHECK}
          stroke={STEM}
          strokeWidth={2.5}
          pathLength={1}
          className={animated ? styles.checkDraw : undefined}
          {...LINE}
        />
      ) : null}
    </g>
  );
}

/**
 * E9 Halbkranz, viewBox 0 0 160 100. `withCheck` zeigt das Häkchen in der Mitte
 * (Erfolgszustand der Zusage). `animated`: Kranz zeichnet sich in 900 ms,
 * danach das Häkchen in 400 ms.
 */
export function HalfWreath({
  withCheck = false,
  animated = false,
  ...props
}: IllustrationProps & { withCheck?: boolean; animated?: boolean }) {
  return (
    <Svg props={props} viewBox="0 0 160 100" defaultSize={160}>
      <HalfWreathArt withCheck={withCheck} animated={animated} />
    </Svg>
  );
}
