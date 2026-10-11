import { MOON_PATH, r2 } from './geometry';
import { LINE, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

const RAYS = Array.from({ length: 11 }, (_, k) => {
  const phi = ((15 + k * 15) * Math.PI) / 180;
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  return `M${r2(100 + 76 * c)} ${r2(100 - 76 * s)}L${r2(100 + 88 * c)} ${r2(100 - 88 * s)}`;
}).join('');

/** Zeichnung der Halbsonne als <g> im Koordinatensystem 0 0 200 100 (Mittelpunkt 100, 100). */
export function HalfSunArt({ discOpacity = 0.2 }: { discOpacity?: number }) {
  return (
    <g>
      <path d="M64 100A36 36 0 0 1 136 100Z" fill={WARM} fillOpacity={discOpacity} />
      <path d="M48 100A52 52 0 0 1 152 100" stroke={WARM} strokeWidth={1} strokeOpacity={0.45} {...LINE} />
      <path d="M34 100A66 66 0 0 1 166 100" stroke={WARM} strokeWidth={1} strokeOpacity={0.3} {...LINE} />
      <path d={RAYS} stroke={WARM} strokeWidth={1} strokeOpacity={0.35} {...LINE} />
    </g>
  );
}

/**
 * E6 Boho-Halbsonne, viewBox 0 0 200 100. Hinter Bogenspitzen gern mit
 * `style={{ opacity: .55 }}`.
 */
export function HalfSun({ discOpacity = 0.2, ...props }: IllustrationProps & { discOpacity?: number }) {
  return (
    <Svg props={props} viewBox="0 0 200 100" defaultSize={200}>
      <HalfSunArt discOpacity={discOpacity} />
    </Svg>
  );
}

/** Mondsichel als <path> um den Ursprung (r 10). */
export function MoonArt({ fill = 'var(--c-sage-900)' }: { fill?: string }) {
  return <path d={MOON_PATH} fill={fill} />;
}

/** E6 Variante „Nacht“: Mondsichel (Kreis r 10 minus Kreis (4, −3) r 9), viewBox −12 −12 24 24. */
export function Moon({ color, ...props }: IllustrationProps & { color?: string }) {
  return (
    <Svg props={props} viewBox="-12 -12 24 24" defaultSize={24}>
      <MoonArt fill={color} />
    </Svg>
  );
}
