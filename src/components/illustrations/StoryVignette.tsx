import type { ReactNode } from 'react';
import type { StoryVignette as Variant } from '@/content/site';
import { HalfSunArt } from './HalfSun';
import { RingsArt } from './Rings';
import { BG, LINE, STEM, vars, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

const S = { stroke: STEM, strokeWidth: 1.25, ...LINE } as const;
const FILL = { ...S, fill: BG } as const;

/** Klassisches Herz um (x, y) mit halber Breite w. */
function heartPath(x: number, y: number, w: number): string {
  const k = w / 15;
  const p = (dx: number, dy: number) => `${Math.round((x + dx * k) * 100) / 100} ${Math.round((y + dy * k) * 100) / 100}`;
  return `M${p(0, 11)}C${p(-10, 4)} ${p(-15, -1)} ${p(-15, -5.5)}C${p(-15, -9)} ${p(-12.5, -11.5)} ${p(-9, -11.5)}C${p(-6, -11.5)} ${p(-3.5, -9.5)} ${p(0, -6)}C${p(3.5, -9.5)} ${p(6, -11.5)} ${p(9, -11.5)}C${p(12.5, -11.5)} ${p(15, -9)} ${p(15, -5.5)}C${p(15, -1)} ${p(10, 4)} ${p(0, 11)}Z`;
}

/** Je Motiv: Zeichnung und untere Motivkante (dort sitzt die Halbsonne). */
const MOTIFS: Record<Variant, { base: number; art: ReactNode }> = {
  /* Kennenlernen: zwei Tassen, deren Dampf oben in einem Herz zusammenläuft
     (je 2.5 Einheiten weiter außen als in der Bauanleitung, damit sich die Henkel nicht berühren) */
  meet: {
    base: 95,
    art: (
      <g>
        <path d="M38.5 65C35.5 60.5 41.5 57.5 39.5 52.5C38.2 49.2 41.2 45.6 47.5 44.5" stroke={STEM} strokeWidth={1.1} strokeOpacity={0.7} {...LINE} />
        <path d="M81.5 65C84.5 60.5 78.5 57.5 80.5 52.5C81.8 49.2 78.8 45.6 72.5 44.5" stroke={STEM} strokeWidth={1.1} strokeOpacity={0.7} {...LINE} />
        <path d={heartPath(60, 40, 11)} fill={WARM} fillOpacity={0.6} />
        <path d="M25.5 70h26v14a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10Z" {...FILL} />
        <path d="M51.5 74a5 5 0 0 1 0 10" {...S} />
        <path d="M94.5 70h-26v14a10 10 0 0 0 10 10h6a10 10 0 0 0 10-10Z" {...FILL} />
        <path d="M68.5 74a5 5 0 0 0 0 10" {...S} />
        <path d="M22 97.5h76" stroke={STEM} strokeWidth={1.25} strokeOpacity={0.6} {...LINE} />
      </g>
    ),
  },
  /* Erste Reise: Bergkette mit Koffer davor */
  travel: {
    base: 92,
    art: (
      <g>
        <path d="M14 92L44 54L58 70L76 46L106 92Z" {...S} />
        <path d="M38.4 61.1L41.5 63L44 60.2L47.2 62.2M70.6 55.2L73.6 57.4L76.2 54.6L79.6 56.8" stroke={STEM} strokeWidth={1} strokeOpacity={0.7} {...LINE} />
        <rect x={44} y={66} width={32} height={26} rx={4} {...FILL} />
        <path d="M54 66v-5h12v5" {...S} />
        <path d="M52 66v26M68 66v26" {...S} />
      </g>
    ),
  },
  /* Erste Wohnung: Schlüssel, dessen Griff ein Haus ist */
  home: {
    base: 84,
    art: (
      <g>
        <path d="M48 75H93.5a1.5 1.5 0 0 1 0 3H90V83H86.5V80.5H83V84H79.5V78H48" {...S} />
        <path d="M24 82V68L36 57L48 68V82Z" {...FILL} />
        <path d={heartPath(36, 72.5, 3.6)} fill={WARM} />
      </g>
    ),
  },
  /* Antrag: offene Schachtel mit Ring */
  proposal: {
    base: 94,
    art: (
      <g>
        <path d="M34 70L42 46H78L86 70" {...LINE} fill={WARM} fillOpacity={0.14} stroke={STEM} strokeWidth={1.25} />
        <circle cx={60} cy={66} r={9} {...S} />
        <path d="M60 49l5 5-5 6-5-6Z" fill={WARM} stroke={WARM} strokeWidth={0.6} strokeLinejoin="round" />
        <rect x={34} y={70} width={52} height={24} rx={3} {...FILL} />
        <path d="M40 76h40" stroke={STEM} strokeWidth={1} strokeOpacity={0.45} {...LINE} />
      </g>
    ),
  },
  /* Hochzeit: Ringe (E7), auf 60 Einheiten skaliert */
  wedding: {
    base: 78,
    art: (
      <g transform="translate(30 36.5) scale(1.25)" color={STEM}>
        <RingsArt color={STEM} />
      </g>
    ),
  },
};

/**
 * E12 Geschichts-Vignetten (Foto-Platzhalter), viewBox 0 0 120 120.
 * Das Motiv belegt rund 50 % der Breite, dahinter die Halbsonne (70 %, Deckkraft .6)
 * an der unteren Motivkante. Für den sage-100-Bogen das SVG in voller Bogenbreite
 * einsetzen (`size="100%"`). `background` = Farbe des Bogens (für Aussparungen).
 */
export function StoryVignette({
  variant,
  background = 'var(--c-sage-100)',
  ...props
}: IllustrationProps & { variant: Variant; background?: string }) {
  const motif = MOTIFS[variant];
  return (
    <Svg
      props={{ ...props, style: { ...vars({ '--illu-bg': background }), ...props.style } }}
      viewBox="0 0 120 120"
      defaultSize={120}
      extra={{ 'data-variant': variant }}
    >
      <g opacity={0.6} transform={`translate(18 ${motif.base - 42}) scale(0.42)`}>
        <HalfSunArt />
      </g>
      {motif.art}
    </Svg>
  );
}
