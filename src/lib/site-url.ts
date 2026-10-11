/**
 * Öffentliche Adresse der Seite – für absolute Links (Link-Vorschau og:image,
 * Kalendereintrag). Wird beim Build ausgewertet.
 *
 * Reihenfolge:
 * 1. `NEXT_PUBLIC_SITE_URL` (z. B. `https://christoph-und-vera.de`, optional setzen)
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` (setzt Vercel automatisch: die eigene
 *    Domain, sonst `<projekt>.vercel.app`)
 */
export function publicSiteUrl(): URL | null {
  return (
    toUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    toUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    null
  );
}

/** Basis für `metadataBase`: öffentliche Adresse, lokal `http://localhost:<PORT>`. */
export function metadataBaseUrl(): URL {
  return publicSiteUrl() ?? new URL(`http://localhost:${process.env.PORT || 3000}`);
}

function toUrl(value: string | undefined): URL | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}
