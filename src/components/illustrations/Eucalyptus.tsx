import { EUCA_BUD, EUCA_FOOT, EUCA_LEAVES, EUCA_STEM, type EucaLeaf } from './geometry';
import styles from './illustrations.module.css';
import { LEAF, LINE, STEM, VEIN, vars, type IllustrationProps } from './shared';
import { Svg } from './Svg';

export type BranchVariant = 'filled' | 'line' | 'silhouette';

export interface EucalyptusArtProps {
  /** filled = Blattflächen (Standard), line = nur Kontur (Druck, QR-Karte), silhouette = einfarbig (Footer) */
  variant?: BranchVariant;
  animated?: boolean;
  /** Mittelrippen zeigen (laut Spezifikation erst ab 96 px Darstellungshöhe) */
  midribs?: boolean;
  /** Blätter (Index 0–8), die entfallen */
  skip?: readonly number[];
  /** Phasenversatz des Wiegens in Sekunden */
  swayDelay?: number;
}

/**
 * Zeichnung des Zweigs als <g> im Koordinatensystem 0 0 120 240.
 * Wird von EucalyptusBranch und CornerBouquet verwendet.
 */
export function EucalyptusArt({
  variant = 'filled',
  animated = false,
  midribs = true,
  skip = [],
  swayDelay = 0,
}: EucalyptusArtProps) {
  const leaves = EUCA_LEAVES.filter((l) => !skip.includes(l.i));
  const order = new Map(leaves.map((l, idx) => [l.i, idx]));
  const line = variant === 'line';
  const silhouette = variant === 'silhouette';
  const showRibs = midribs && variant === 'filled';

  const leaf = (l: EucaLeaf) => {
    const front = l.opacity >= 0.9;
    const opacity = line ? 1 : silhouette ? (front ? 1 : 0.7) : l.opacity;
    return (
      <g
        key={l.i}
        className={animated ? styles.grow : undefined}
        style={
          animated
            ? vars({ '--i': order.get(l.i) ?? 0, transformOrigin: `${l.origin[0]}px ${l.origin[1]}px` })
            : undefined
        }
      >
        <path d={l.petiole} stroke={STEM} strokeWidth={1} {...LINE} />
        <path
          d={l.shape}
          fill={line ? 'none' : silhouette ? STEM : LEAF}
          fillOpacity={line ? undefined : opacity}
          stroke={line ? STEM : undefined}
          strokeWidth={line ? 0.9 : undefined}
          vectorEffect={line ? 'non-scaling-stroke' : undefined}
        />
        {showRibs ? <path d={l.midrib} stroke={VEIN} strokeWidth={0.75} strokeOpacity={0.5} {...LINE} /> : null}
      </g>
    );
  };

  const back = leaves.filter((l) => l.opacity < 0.9);
  const front = leaves.filter((l) => l.opacity >= 0.9);

  const art = (
    <g opacity={line ? 0.6 : undefined}>
      {back.map(leaf)}
      <path
        d={EUCA_STEM}
        stroke={STEM}
        strokeWidth={line ? 1 : 1.25}
        pathLength={1}
        className={animated ? styles.draw : undefined}
        {...LINE}
      />
      <path
        d={EUCA_BUD}
        fill={line ? 'none' : STEM}
        fillOpacity={line ? undefined : 0.75}
        stroke={line ? STEM : undefined}
        strokeWidth={line ? 0.9 : undefined}
        vectorEffect={line ? 'non-scaling-stroke' : undefined}
        className={animated ? styles.bud : undefined}
      />
      {front.map(leaf)}
    </g>
  );

  if (!animated) return art;
  return (
    <g
      className={styles.sway}
      style={vars({ transformOrigin: `${EUCA_FOOT[0]}px ${EUCA_FOOT[1]}px`, '--sway-delay': `${swayDelay}s` })}
    >
      {art}
    </g>
  );
}

/**
 * E1 Eukalyptus-Zweig „Silberdollar“ (Hauptmotiv), viewBox 0 0 120 240.
 * `animated`: Stiel zeichnet sich, Blätter wachsen gestaffelt, sanftes Wiegen
 * (nur Hero/Login; bei reduzierter Bewegung sofort im Endzustand).
 */
export function EucalyptusBranch({
  variant = 'filled',
  animated = false,
  midribs,
  ...props
}: IllustrationProps & { variant?: BranchVariant; animated?: boolean; midribs?: boolean }) {
  const ribs = midribs ?? (typeof props.size === 'number' ? props.size * 2 >= 96 : true);
  return (
    <Svg props={props} viewBox="0 0 120 240" defaultSize={120} animated={animated}>
      <EucalyptusArt variant={variant} animated={animated} midribs={ribs} />
    </Svg>
  );
}
