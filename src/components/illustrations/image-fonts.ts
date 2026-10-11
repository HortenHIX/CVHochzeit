import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Schriften für die Bild-Routen (Apple-Icon, Link-Vorschau). ImageResponse
 * kennt nur ttf/otf/woff – deshalb .woff-Dateien (latin, aus @fontsource).
 *
 * Die Dateien liegen im Repo unter assets/fonts/, weil Vercel Dateien aus
 * node_modules, die erst zur Laufzeit gelesen werden, nicht in die
 * Server-Funktion packt (sonst: ENOENT). next.config.ts nimmt den Ordner per
 * outputFileTracingIncludes mit.
 */
type Family = 'display' | 'script';
type Style = 'normal' | 'italic';
type Weight = 400 | 500 | 600;

const FILES: Record<Family, { name: string; file: (weight: Weight, style: Style) => string }> = {
  display: {
    name: 'Cormorant Garamond',
    file: (w, s) => `cormorant-garamond-latin-${w}-${s}.woff`,
  },
  script: {
    name: 'Pinyon Script',
    file: () => 'pinyon-script-latin-400-normal.woff',
  },
};

export const IMAGE_FONT = {
  display: FILES.display.name,
  script: FILES.script.name,
} as const;

export async function loadImageFonts(list: { family: Family; weight: Weight; style: Style }[]) {
  return Promise.all(
    list.map(async ({ family, weight, style }) => ({
      name: FILES[family].name,
      data: await readFile(join(process.cwd(), 'assets', 'fonts', FILES[family].file(weight, style))),
      weight,
      style,
    })),
  );
}
