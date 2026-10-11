import { ImageResponse } from 'next/og';
import { site } from '@/content/site';
import { IMAGE_FONT, loadImageFonts } from '@/components/illustrations/image-fonts';
import { svgDataUri, wreathMarkup } from '@/components/illustrations/markup';
import { HEX } from '@/components/illustrations/palette';

/**
 * Apple-Touch-Icon (Home-Bildschirm), 180 × 180: Leinen mit dem großen
 * Monogramm (E10, Variante „large“: Doppelkreis, C & V, Halbkranz).
 * iOS rundet die Ecken selbst ab – deshalb vollflächig ohne eigene Rundung.
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const fonts = await loadImageFonts([
  { family: 'display', weight: 500, style: 'normal' },
  { family: 'display', weight: 500, style: 'italic' },
]);

const S = size.width;
/** Monogramm-viewBox (120) → Icon (Rand 11 px) */
const K = (S - 22) / 120;
const at = (v: number) => 11 + v * K;

const art = svgDataUri(
  `0 0 ${S} ${S}`,
  [
    `<rect width="${S}" height="${S}" fill="${HEX.linen}"/>`,
    `<circle cx="${S / 2}" cy="${S / 2}" r="${57 * K}" fill="${HEX.paper}" stroke="${HEX.sage700}" stroke-opacity=".75" stroke-width="2"/>`,
    `<circle cx="${S / 2}" cy="${S / 2}" r="${52.5 * K}" fill="none" stroke="${HEX.sage700}" stroke-opacity=".45" stroke-width="1.4"/>`,
    // Halbkranz unter den Buchstaben (wie Monogram „large“)
    `<g transform="translate(${at(20)} ${at(54.5)}) scale(${0.5 * K})">${wreathMarkup({ k: 1.5 / (0.5 * K) })}</g>`,
  ].join(''),
  S,
  S,
);

/**
 * Text so setzen, dass seine Grundlinie bei `baseline` liegt. Cormorant:
 * Ascender .924, Descender .287 em; bei line-height 1 liegt die Grundlinie
 * .8185 em unter der Oberkante der Zeile.
 */
function Glyph({ x, baseline, fontSize, children, style }: { x: number; baseline: number; fontSize: number; children: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 60,
        width: 120,
        top: baseline - 0.8185 * fontSize,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: IMAGE_FONT.display,
        fontSize,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default async function AppleIcon() {
  const [a, b] = site.couple.initials;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: HEX.linen }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Satori-Bild, kein DOM */}
        <img src={art} width={S} height={S} style={{ position: 'absolute', left: 0, top: 0 }} />
        <Glyph x={at(36.5)} baseline={at(59)} fontSize={47 * K} style={{ fontWeight: 500, color: HEX.ink }}>
          {a}
        </Glyph>
        <Glyph x={at(83.5)} baseline={at(59)} fontSize={47 * K} style={{ fontWeight: 500, color: HEX.ink }}>
          {b}
        </Glyph>
        <Glyph x={at(60)} baseline={at(53.5)} fontSize={25 * K} style={{ fontWeight: 500, fontStyle: 'italic', color: HEX.terra700 }}>
          &amp;
        </Glyph>
      </div>
    ),
    { ...size, fonts },
  );
}
