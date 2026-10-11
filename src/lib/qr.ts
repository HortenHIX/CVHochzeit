import 'server-only';
import QRCode from 'qrcode';

/**
 * QR-Codes serverseitig als SVG (Paket `qrcode`).
 *
 * Vorgaben (docs/design.md F9 / QR-Tischkarte): Fehlerkorrektur Q, 4 Module
 * Ruhezone, ink (#2B3530) auf reinem Weiß.
 *
 * Sicher einbetten: Statt den SVG-String per `dangerouslySetInnerHTML` in die
 * Seite zu schreiben, wird er hier zerlegt und streng geprüft (nur Zahlen und
 * Pfadbefehle). Gerendert wird anschließend als normales React-SVG
 * (`src/components/sections/QrCode.tsx`).
 */

export const QR_DARK = '#2B3530';
export const QR_LIGHT = '#FFFFFF';

export interface QrData {
  /** Kantenlänge in Modulen inklusive Ruhezone (= viewBox-Größe) */
  size: number;
  /** Pfad der dunklen Module (waagerechte Linien, Strichstärke 1) */
  path: string;
  dark: string;
  light: string;
}

const VIEWBOX = /viewBox="0 0 (\d+) (\d+)"/;
const DARK_PATH = /<path stroke="[^"]*" d="([^"]*)"\s*\/>/;
const SAFE_PATH = /^[MmHhVvZz0-9.\s-]+$/;

/** Erzeugt die QR-Daten für einen Text/Link. Ergebnis wird gecacht (statisch). */
export async function qrCode(value: string): Promise<QrData> {
  'use cache';
  const svg = await QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 4,
    color: { dark: QR_DARK, light: QR_LIGHT },
  });

  const box = VIEWBOX.exec(svg);
  const dark = DARK_PATH.exec(svg);
  const size = box ? Number(box[1]) : Number.NaN;
  if (!box || box[1] !== box[2] || !Number.isInteger(size) || size < 21 || !dark || !SAFE_PATH.test(dark[1])) {
    throw new Error('QR-Code konnte nicht erzeugt werden.');
  }
  return { size, path: dark[1], dark: QR_DARK, light: QR_LIGHT };
}

/** Link ohne Protokoll und abschließenden Schrägstrich, z. B. „photos.app.goo.gl/abc“. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}
