import type { VenueVignette as Variant } from '@/content/site';
import { BARN_BULBS, BARN_LIGHTS_PATH } from './geometry';
import { LEAF, LINE, STEM, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

const S = { stroke: STEM, strokeWidth: 1.25, ...LINE } as const;

/** Baum: Stamm, darüber eine Krone als Blattfläche (Deckkraft .35). */
function Tree({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <path d={`M${x} ${y + r * 0.2}V110M${x} ${y + r * 0.62}l${r * 0.3} ${-r * 0.32}`} {...S} />
      <circle cx={x} cy={y} r={r} fill={LEAF} fillOpacity={0.35} />
    </g>
  );
}

function Grass({ x, flip = false }: { x: number; flip?: boolean }) {
  const k = flip ? -1 : 1;
  return (
    <path
      d={`M${x} 110q${-1 * k} -3 ${-3 * k} -5M${x + 2 * k} 110q0 -4 ${1 * k} -7M${x + 4 * k} 110q${1 * k} -2.5 ${3.5 * k} -4`}
      stroke={STEM}
      strokeWidth={1}
      strokeOpacity={0.7}
      {...LINE}
    />
  );
}

function Chapel() {
  return (
    <g>
      <Tree x={130} y={78} r={14} />
      <path d="M10 110H150" {...S} />
      {/* Schiff, Dach, Turm, Spitze */}
      <path d="M52 110V56H108V110M46 58L70 38.24M90 38.24L114 58M70 38.24V14H90V38.24M68 16L80 2L92 16" {...S} />
      {/* Tür und Rundfenster */}
      <path d="M72 110V92A8 8 0 0 1 88 92V110" {...S} />
      <circle cx={80} cy={48} r={5} {...S} />
      {/* Fenster im Turm, Seitenfenster */}
      <path d="M78 30V24A2 2 0 0 1 82 24V30M60 80V73A3 3 0 0 1 66 73V80M94 80V73A3 3 0 0 1 100 73V80" stroke={STEM} strokeWidth={1} {...LINE} />
      <Grass x={30} />
      <Grass x={112} flip />
    </g>
  );
}

function Barn() {
  return (
    <g>
      <Tree x={16} y={84} r={10} />
      <path d="M6 110H154" {...S} />
      <path d="M30 110V60L80 28L130 60V110Z" {...S} />
      {/* Tor mit Kreuzstreben */}
      <path d="M62 110V74H98V110M62 74L98 110M98 74L62 110" {...S} />
      {/* Luke */}
      <path d="M72 46H88V60H72Z" {...S} />
      {/* Lichterkette */}
      <path d={BARN_LIGHTS_PATH} stroke={STEM} strokeWidth={1} strokeDasharray="1 3" {...LINE} />
      {BARN_BULBS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={WARM} />
      ))}
      <Grass x={136} />
      <Grass x={146} flip />
    </g>
  );
}

/** E11 Orts-Vignetten (Kapelle, Scheune), viewBox 0 0 160 120, nur Strich. */
export function VenueVignette({ variant, ...props }: IllustrationProps & { variant: Variant }) {
  return (
    <Svg props={props} viewBox="0 0 160 120" defaultSize={160} extra={{ 'data-variant': variant }}>
      {variant === 'chapel' ? <Chapel /> : <Barn />}
    </Svg>
  );
}
