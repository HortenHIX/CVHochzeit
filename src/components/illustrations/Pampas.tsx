import {
  bundleTransform,
  PAMPAS_BUNDLE,
  PAMPAS_FOOT,
  PAMPAS_FRONDS,
  PAMPAS_FRONDS_FINE,
  PAMPAS_STEM,
} from './geometry';
import styles from './illustrations.module.css';
import { LINE, vars, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

/**
 * Eine Rispe als <g> im Koordinatensystem 0 0 80 300 (Fuß bei 42, 298).
 * Halm WARM .55, 30 Fiedern WARM .45 (plus feinere Zwischenfiedern für Fülle).
 */
export function PampasArt({ animated = false, swayDelay = 0 }: { animated?: boolean; swayDelay?: number }) {
  const art = (
    <g>
      <path d={PAMPAS_FRONDS_FINE} stroke={WARM} strokeWidth={0.6} strokeOpacity={0.3} {...LINE} />
      <path d={PAMPAS_FRONDS} stroke={WARM} strokeWidth={0.75} strokeOpacity={0.45} {...LINE} />
      <path d={PAMPAS_STEM} stroke={WARM} strokeWidth={1} strokeOpacity={0.55} {...LINE} />
    </g>
  );
  if (!animated) return art;
  return (
    <g
      className={styles.swayPampas}
      style={vars({ transformOrigin: `${PAMPAS_FOOT[0]}px ${PAMPAS_FOOT[1]}px`, '--sway-delay': `${swayDelay}s` })}
    >
      {art}
    </g>
  );
}

/** E3 Pampasgras, viewBox 0 0 80 300. `animated`: Wiegen ±1.5° in 6 s. */
export function PampasGrass({ animated = false, ...props }: IllustrationProps & { animated?: boolean }) {
  return (
    <Svg props={props} viewBox="0 0 80 300" defaultSize={80} animated={animated}>
      <PampasArt animated={animated} />
    </Svg>
  );
}

/** E3 Bündel-Variante: drei Rispen aus einem Fußpunkt (−14° / 0° / +11°), viewBox 0 0 160 300. */
export function PampasBundle({ animated = false, ...props }: IllustrationProps & { animated?: boolean }) {
  return (
    <Svg props={props} viewBox={PAMPAS_BUNDLE.viewBox} defaultSize={160} animated={animated}>
      {PAMPAS_BUNDLE.stems.map((s) => (
        <g key={s.rotate} transform={bundleTransform(s.rotate, s.scale)}>
          <PampasArt animated={animated} swayDelay={s.swayDelay} />
        </g>
      ))}
    </Svg>
  );
}
