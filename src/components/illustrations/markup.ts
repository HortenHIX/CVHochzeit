/**
 * Motive als reine SVG-Zeichenketten mit festen HEX-Farben – für die
 * Bild-Routen (Apple-Icon, Link-Vorschau), die weder React-Komponenten mit
 * CSS-Modulen noch CSS-Variablen kennen. Geometrie aus geometry.ts, damit
 * Bild und Seite dieselbe Zeichnung zeigen.
 *
 * Hinweis: Der Bild-Renderer (resvg) kennt kein `vector-effect`; die
 * Strichstärken skalieren hier also mit. Die Werte sind für die Darstellung
 * in den Bild-Routen gewählt.
 */
import {
  BOUQUET_BRANCHES,
  BOUQUET_PAMPAS,
  BOUQUET_TIE,
  bouquetTransform,
  bundleTransform,
  EUCA_BUD,
  EUCA_LEAVES,
  EUCA_STEM,
  PAMPAS_BUNDLE,
  PAMPAS_FOOT,
  PAMPAS_FRONDS,
  PAMPAS_FRONDS_FINE,
  PAMPAS_STEM,
  PAMPAS_WISPS,
  r2,
  WREATH_BRANCH,
  WREATH_LEAVES,
} from './geometry';
import { HEX } from './palette';

const ROUND = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;

/** Strichstärken-Faktor: gleicht die Skalierung einer Gruppe aus (z. B. 1 / scale). */
type Weight = { k?: number };

/** E1 Eukalyptus-Zweig im Koordinatensystem 0 0 120 240. */
export function eucalyptusMarkup({ skip = [], midribs = true, k = 1 }: { skip?: readonly number[]; midribs?: boolean } & Weight = {}): string {
  const leaves = EUCA_LEAVES.filter((l) => !skip.includes(l.i));
  const leaf = (l: (typeof EUCA_LEAVES)[number]) =>
    `<path d="${l.petiole}" stroke="${HEX.sage700}" stroke-width="${r2(1 * k)}" ${ROUND}/>` +
    `<path d="${l.shape}" fill="${HEX.sage400}" fill-opacity="${l.opacity}"/>` +
    (midribs ? `<path d="${l.midrib}" stroke="${HEX.linen}" stroke-opacity=".5" stroke-width="${r2(0.75 * k)}" ${ROUND}/>` : '');
  return (
    leaves.filter((l) => l.opacity < 0.9).map(leaf).join('') +
    `<path d="${EUCA_STEM}" stroke="${HEX.sage700}" stroke-width="${r2(1.25 * k)}" ${ROUND}/>` +
    `<path d="${EUCA_BUD}" fill="${HEX.sage700}" fill-opacity=".75"/>` +
    leaves.filter((l) => l.opacity >= 0.9).map(leaf).join('')
  );
}

/** E3 Pampas-Rispe im Koordinatensystem 0 0 80 300. */
export function pampasMarkup({ k = 1 }: Weight = {}): string {
  return (
    `<path d="${PAMPAS_WISPS}" stroke="${HEX.terra500}" stroke-opacity=".24" stroke-width="${r2(0.5 * k)}" ${ROUND}/>` +
    `<path d="${PAMPAS_FRONDS_FINE}" stroke="${HEX.terra500}" stroke-opacity=".3" stroke-width="${r2(0.6 * k)}" ${ROUND}/>` +
    `<path d="${PAMPAS_FRONDS}" stroke="${HEX.terra500}" stroke-opacity=".45" stroke-width="${r2(0.75 * k)}" ${ROUND}/>` +
    `<path d="${PAMPAS_STEM}" stroke="${HEX.terra500}" stroke-opacity=".55" stroke-width="${r2(1 * k)}" ${ROUND}/>`
  );
}

/** E3 Bündel (drei Rispen) im Koordinatensystem 0 0 160 300. */
export function pampasBundleMarkup({ k = 1 }: Weight = {}): string {
  return PAMPAS_BUNDLE.stems
    .map((s) => `<g transform="${bundleTransform(s.rotate, s.scale)}">${pampasMarkup({ k: k / s.scale })}</g>`)
    .join('');
}

const CORNER_TRANSFORM = {
  'bottom-left': '',
  'top-right': 'rotate(180 150 150)',
  'top-left': 'matrix(1 0 0 -1 0 300)',
  'bottom-right': 'matrix(-1 0 0 1 300 0)',
} as const;

/** E2 Eck-Bouquet im Koordinatensystem 0 0 300 300. */
export function bouquetMarkup(corner: keyof typeof CORNER_TRANSFORM = 'bottom-left', { k = 1 }: Weight = {}): string {
  const pampas = `<g transform="${bouquetTransform(BOUQUET_PAMPAS.scale, BOUQUET_PAMPAS.rotate, PAMPAS_FOOT)}" opacity="${BOUQUET_PAMPAS.opacity}">${pampasMarkup({ k: k / BOUQUET_PAMPAS.scale })}</g>`;
  const branches = BOUQUET_BRANCHES.map(
    (b) => `<g transform="${bouquetTransform(b.scale, b.rotate)}">${eucalyptusMarkup({ skip: b.skip, k: k / b.scale })}</g>`,
  ).join('');
  const tie =
    `<path d="${BOUQUET_TIE.tails}" stroke="${HEX.sage700}" stroke-width="${r2(1.25 * k)}" ${ROUND}/>` +
    `<path d="${BOUQUET_TIE.bow}" stroke="${HEX.terra500}" stroke-opacity=".75" stroke-width="${r2(1 * k)}" ${ROUND}/>` +
    `<path d="${BOUQUET_TIE.wraps}" stroke="${HEX.terra500}" stroke-width="${r2(1.5 * k)}" ${ROUND}/>`;
  const t = CORNER_TRANSFORM[corner];
  return `<g${t ? ` transform="${t}"` : ''}>${pampas}${branches}${tie}</g>`;
}

/** E6 Halbsonne im Koordinatensystem 0 0 200 100 (Mittelpunkt 100, 100). */
export function halfSunMarkup({ k = 1, disc = true, arcs = true }: Weight & { disc?: boolean; arcs?: boolean } = {}): string {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const phi = ((15 + i * 15) * Math.PI) / 180;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    return `M${r2(100 + 76 * c)} ${r2(100 - 76 * s)}L${r2(100 + 88 * c)} ${r2(100 - 88 * s)}`;
  }).join('');
  return (
    (disc ? `<path d="M64 100A36 36 0 0 1 136 100Z" fill="${HEX.terra500}" fill-opacity=".2"/>` : '') +
    (arcs
      ? `<path d="M48 100A52 52 0 0 1 152 100" stroke="${HEX.terra500}" stroke-opacity=".45" stroke-width="${r2(k)}" ${ROUND}/>` +
        `<path d="M34 100A66 66 0 0 1 166 100" stroke="${HEX.terra500}" stroke-opacity=".3" stroke-width="${r2(k)}" ${ROUND}/>`
      : '') +
    `<path d="${rays}" stroke="${HEX.terra500}" stroke-opacity=".35" stroke-width="${r2(k)}" ${ROUND}/>`
  );
}

/** E8 Trennornament im Koordinatensystem 0 0 240 24. */
export function ornamentMarkup({ k = 1 }: Weight = {}): string {
  return (
    `<path d="M0 12H92M148 12H240" stroke="${HEX.sage700}" stroke-opacity=".45" stroke-width="${r2(k)}" ${ROUND}/>` +
    `<g fill="${HEX.sage400}">` +
    `<ellipse cx="98" cy="9" rx="4.5" ry="3.5" transform="rotate(-20 98 9)" fill-opacity=".6"/>` +
    `<ellipse cx="142" cy="9" rx="4.5" ry="3.5" transform="rotate(20 142 9)" fill-opacity=".6"/>` +
    `<ellipse cx="108" cy="12" rx="7" ry="5" transform="rotate(-18 108 12)"/>` +
    `<ellipse cx="132" cy="12" rx="7" ry="5" transform="rotate(18 132 12)"/>` +
    `</g><circle cx="120" cy="12" r="2.5" fill="${HEX.terra500}"/>`
  );
}

/** E9 Halbkranz im Koordinatensystem 0 0 160 100 (ohne Häkchen). */
export function wreathMarkup({ k = 1, stem = HEX.sage700 }: Weight & { stem?: string } = {}): string {
  const leaf = (l: (typeof WREATH_LEAVES)[number]) =>
    `<path d="${l.petiole}" stroke="${stem}" stroke-width="${r2(k)}" ${ROUND}/>` +
    `<path d="${l.shape}" fill="${HEX.sage400}" fill-opacity="${l.opacity}"/>`;
  const branch =
    WREATH_LEAVES.filter((l) => !l.outside).map(leaf).join('') +
    `<path d="${WREATH_BRANCH}" stroke="${stem}" stroke-width="${r2(1.25 * k)}" ${ROUND}/>` +
    WREATH_LEAVES.filter((l) => l.outside).map(leaf).join('');
  return `<g>${branch}</g><g transform="matrix(-1 0 0 1 160 0)">${branch}</g><circle cx="80" cy="93" r="2.5" fill="${HEX.terra500}"/>`;
}

/** Verpackt Markup als SVG-Data-URI (für <img src> in ImageResponse). */
export function svgDataUri(viewBox: string, inner: string, width?: number, height?: number): string {
  const size = width && height ? ` width="${width}" height="${height}"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size}>${inner}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
