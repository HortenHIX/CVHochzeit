import { qrCode } from '@/lib/qr';

/**
 * QR-Code als Inline-SVG (Server Component). Dunkle Module in ink auf Weiß,
 * Ruhezone ist Teil der Grafik. Die Größe bestimmt der Aufrufer per CSS
 * (`className`, Breite; die Höhe folgt dem Seitenverhältnis 1:1).
 */
export async function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const qr = await qrCode(value);
  return (
    <svg
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={className}
      data-qr=""
    >
      <rect width={qr.size} height={qr.size} fill={qr.light} />
      <path d={qr.path} stroke={qr.dark} strokeWidth={1} fill="none" />
    </svg>
  );
}
