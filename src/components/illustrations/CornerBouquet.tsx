import { EucalyptusArt, type BranchVariant } from './Eucalyptus';
import { BOUQUET_BRANCHES, BOUQUET_PAMPAS, BOUQUET_TIE, bouquetTransform, PAMPAS_FOOT } from './geometry';
import { PampasArt } from './Pampas';
import { LINE, STEM, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

export type BouquetCorner = 'bottom-left' | 'top-right' | 'top-left' | 'bottom-right';

const CORNER_TRANSFORM: Record<BouquetCorner, string | undefined> = {
  'bottom-left': undefined,
  'top-right': 'rotate(180 150 150)',
  // rotate(180) + scale(-1 1) = vertikal gespiegelt
  'top-left': 'matrix(1 0 0 -1 0 300)',
  'bottom-right': 'matrix(-1 0 0 1 300 0)',
};

/**
 * E2 Eck-Bouquet, viewBox 0 0 300 300: drei Eukalyptus-Zweige aus einem
 * Ursprung (20, 290) mit Pampas dahinter. `corner` legt fest, in welcher
 * Ecke der Ursprung liegt (Standard links unten).
 */
export function CornerBouquet({
  variant = 'filled',
  corner = 'bottom-left',
  animated = false,
  ...props
}: IllustrationProps & { variant?: Exclude<BranchVariant, 'silhouette'>; corner?: BouquetCorner; animated?: boolean }) {
  const ribs = typeof props.size === 'number' ? props.size >= 150 : true;
  return (
    <Svg props={props} viewBox="0 0 300 300" defaultSize={300} animated={animated} extra={{ 'data-corner': corner }}>
      <g transform={CORNER_TRANSFORM[corner]}>
        <g transform={bouquetTransform(BOUQUET_PAMPAS.scale, BOUQUET_PAMPAS.rotate, PAMPAS_FOOT)} opacity={BOUQUET_PAMPAS.opacity}>
          <PampasArt animated={animated} swayDelay={-2} />
        </g>
        {BOUQUET_BRANCHES.map((b) => (
          <g key={b.key} transform={bouquetTransform(b.scale, b.rotate)}>
            <EucalyptusArt variant={variant} animated={animated} midribs={ribs} skip={b.skip} swayDelay={b.swayDelay} />
          </g>
        ))}
        {/* Stielenden und Kordel an der Bindung */}
        <path d={BOUQUET_TIE.tails} stroke={STEM} strokeWidth={variant === 'line' ? 1 : 1.25} strokeOpacity={variant === 'line' ? 0.6 : 1} {...LINE} />
        <path d={BOUQUET_TIE.bow} stroke={WARM} strokeWidth={1} strokeOpacity={0.75} {...LINE} />
        <path d={BOUQUET_TIE.wraps} stroke={WARM} strokeWidth={1.5} {...LINE} />
      </g>
    </Svg>
  );
}
