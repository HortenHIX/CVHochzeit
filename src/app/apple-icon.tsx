import { ImageResponse } from 'next/og';
import { LOGO_ICON_DATA_URI } from '@/components/illustrations/logo-icon';

/**
 * Apple-Touch-Icon (Home-Bildschirm), 180 × 180: das Logo auf Leinen, als fertiges Bild
 * (siehe logo-icon.ts). iOS rundet die Ecken selbst ab – deshalb vollflächig ohne eigene Rundung.
 */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    // eslint-disable-next-line jsx-a11y/alt-text -- Satori-Bild, kein DOM
    <img src={LOGO_ICON_DATA_URI} width={size.width} height={size.height} />,
    { ...size },
  );
}
