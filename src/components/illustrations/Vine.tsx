import { HEX, LEAF, WARM, type IllustrationProps } from './shared';
import { Svg } from './Svg';

const TILE = [
  "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='160' viewBox='0 0 48 160'>",
  `<path d='M24 0C16 40 32 120 24 160' fill='none' stroke='${HEX.sage700}' stroke-width='1.25'/>`,
  // kurze Blattstiele, damit die Blätter sichtbar am Stiel hängen
  `<path d='M22.4 46.2Q22.1 48.7 20.4 50.1M25.6 102.4Q26 104.7 27.6 105.9' fill='none' stroke='${HEX.sage700}' stroke-width='1' stroke-linecap='round'/>`,
  `<g fill='${HEX.sage400}' fill-opacity='.6'>`,
  "<ellipse cx='15' cy='52' rx='7' ry='6' transform='rotate(-20 15 52)'/>",
  "<ellipse cx='33' cy='108' rx='7' ry='6' transform='rotate(20 33 108)'/>",
  '</g></svg>',
].join('');

/**
 * E13 Ranken-Kachel (48 × 160, nahtlos, repeat-y) als CSS-`url()` für
 * `background-image`, z. B. `background: ${VINE_TILE_URL} center top / 48px 160px repeat-y`.
 * Farben sind fest eingetragen (Data-URIs kennen keine CSS-Variablen).
 */
export const VINE_TILE_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

/** Blattpaar-Knoten der Zeitleiste, viewBox 0 0 40 24 (paper-Unterlage, zwei Blätter, Punkt). */
export function LeafNode(props: IllustrationProps) {
  return (
    <Svg props={props} viewBox="0 0 40 24" defaultSize={40}>
      <circle cx={20} cy={12} r={10} fill="var(--c-paper)" />
      <ellipse cx={11} cy={12} rx={7} ry={6.2} fill={LEAF} fillOpacity={0.9} />
      <ellipse cx={29} cy={12} rx={7} ry={6.2} fill={LEAF} fillOpacity={0.9} />
      <circle cx={20} cy={12} r={3} fill={WARM} />
    </Svg>
  );
}
