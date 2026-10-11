import { ImageResponse } from 'next/og';
import { site } from '@/content/site';
import { IMAGE_FONT, loadImageFonts } from '@/components/illustrations/image-fonts';
import {
  bouquetMarkup,
  halfSunMarkup,
  ornamentMarkup,
  pampasBundleMarkup,
  svgDataUri,
} from '@/components/illustrations/markup';
import { LINING_DIGITS } from '@/components/illustrations/lining-digits';
import { HEX } from '@/components/illustrations/palette';
import { formatLongDate } from '@/lib/format';

/**
 * Link-Vorschau (WhatsApp, Signal, iMessage …), 1200 × 630: Leinen, Eukalyptus-
 * Ecken, die Einladungskarte im Bogen mit Namen, Datum und Ort – wie die
 * Login-Seite, auf der der Link landet. Die Namen stehen untereinander, damit
 * auch der quadratische Ausschnitt kleiner Vorschauen (Bildmitte) sie zeigt.
 */

const { first, second } = site.couple;
const date = formatLongDate(site.wedding.start);

export const alt = `${first} & ${second} – ${date}, ${site.wedding.place}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fonts = await loadImageFonts([
  { family: 'display', weight: 600, style: 'normal' },
  { family: 'display', weight: 500, style: 'italic' },
  { family: 'display', weight: 400, style: 'italic' },
  { family: 'script', weight: 400, style: 'normal' },
]);

/* ---------- Bogenkarte (Leitform E5) ---------- */
const W = size.width;
const H = size.height;
const CARD = { left: 330, right: 870, top: 70 } as const;
const R = (CARD.right - CARD.left) / 2;
const CY = CARD.top + R;
const CX = W / 2;

function archPath(inset: number): string {
  const r = R - inset;
  return `M${CARD.left + inset} ${H + 40}V${CY}A${r} ${r} 0 0 1 ${CARD.right - inset} ${CY}V${H + 40}`;
}

/* Halbsonne konzentrisch zur Bogenspitze: nur die Strahlen schauen hinter der Karte hervor. */
const SUN_SCALE = (R + 14) / 76;

const background = svgDataUri(
  `0 0 ${W} ${H}`,
  [
    `<rect width="${W}" height="${H}" fill="${HEX.linen}"/>`,
    `<g transform="translate(${CX - 100 * SUN_SCALE} ${CY - 100 * SUN_SCALE}) scale(${SUN_SCALE})" opacity=".8">${halfSunMarkup({ k: 1.6 / SUN_SCALE, disc: false, arcs: false })}</g>`,
    // weicher Schatten (--shadow-md) und Karte in paper mit line-Rahmen
    `<defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter></defs>`,
    `<path d="${archPath(0)}Z" transform="translate(0 10)" fill="${HEX.ink}" fill-opacity=".13" filter="url(#s)"/>`,
    `<path d="${archPath(0)}Z" fill="${HEX.paper}" stroke="${HEX.line}" stroke-width="1.5"/>`,
    // Doppelbogen innen
    `<path d="${archPath(12)}" fill="none" stroke="${HEX.sage700}" stroke-opacity=".55" stroke-width="1.25"/>`,
    `<path d="${archPath(21)}" fill="none" stroke="${HEX.sage700}" stroke-opacity=".35" stroke-width="1.25"/>`,
    // Eukalyptus-Ecken und Pampas (wie Login)
    `<g transform="translate(-14 -16) scale(1.2)">${bouquetMarkup('top-left', { k: 1.1 / 1.2 })}</g>`,
    `<g transform="translate(${W - 360 + 14} ${H - 360 + 16}) scale(1.2)">${bouquetMarkup('bottom-right', { k: 1.1 / 1.2 })}</g>`,
    `<g transform="translate(88 ${H - 300}) scale(1.03)" opacity=".9">${pampasBundleMarkup({ k: 1.25 })}</g>`,
  ].join(''),
  W,
  H,
);

/**
 * Text mit Versalziffern (wie `lining-nums` auf der Seite): Ziffernfolgen als
 * Pfade, der Rest als Text. Bei line-height 1 liegt die Grundlinie von
 * Cormorant (Ascender .924, Descender .287) .8185 em unter der Zeilenoberkante.
 */
function LiningText({ text, fontSize, color }: { text: string; fontSize: number; color: string }) {
  const digits = LINING_DIGITS[600];
  const space = 0.234 * fontSize;
  const parts = text.split(/(\d+)/).filter(Boolean);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1, fontSize, color }}>
      {parts.map((part, i) => {
        if (!/^\d+$/.test(part)) {
          return (
            <span
              key={i}
              style={{ marginLeft: part.startsWith(' ') ? space : 0, marginRight: part.endsWith(' ') ? space : 0 }}
            >
              {part.trim()}
            </span>
          );
        }
        let x = 0;
        const paths = [...part].map((d) => {
          const g = digits[d];
          const path = <path key={x} d={g.d} transform={`translate(${x} 0)`} fill={color} />;
          x += g.adv;
          return path;
        });
        return (
          <svg key={i} width={(x / 1000) * fontSize} height={fontSize} viewBox={`0 -818.5 ${x} 1000`}>
            {paths}
          </svg>
        );
      })}
    </div>
  );
}

const ornament = svgDataUri('0 0 240 24', ornamentMarkup({ k: 1.6 }), 240, 24);

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: HEX.linen }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Satori-Bild, kein DOM */}
        <img src={background} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }} />
        <div
          style={{
            position: 'absolute',
            left: CARD.left,
            top: 0,
            width: CARD.right - CARD.left,
            height: H,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 146,
            color: HEX.ink,
          }}
        >
          <div
            style={{
              fontFamily: IMAGE_FONT.display,
              fontWeight: 600,
              fontSize: 25,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: HEX.sage700,
              marginLeft: '0.24em',
            }}
          >
            {site.hero.eyebrow}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: IMAGE_FONT.script,
              fontSize: 108,
              lineHeight: 1.05,
              marginTop: 14,
            }}
          >
            <span>{first}</span>
            <span
              style={{
                fontFamily: IMAGE_FONT.display,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 64,
                lineHeight: 0.8,
                color: HEX.terra700,
              }}
            >
              &amp;
            </span>
            <span>{second}</span>
          </div>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Satori-Bild, kein DOM */}
          <img src={ornament} width={200} height={20} style={{ marginTop: 18 }} />
          <div style={{ display: 'flex', fontFamily: IMAGE_FONT.display, fontWeight: 600, marginTop: 14 }}>
            <LiningText text={date} fontSize={42} color={HEX.ink} />
          </div>
          <div
            style={{
              fontFamily: IMAGE_FONT.display,
              fontWeight: 500,
              fontStyle: 'italic',
              fontSize: 31,
              marginTop: 6,
              color: HEX.inkSoft,
            }}
          >
            {site.wedding.place}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
