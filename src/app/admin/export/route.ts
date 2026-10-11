import type { NextRequest } from 'next/server';
import { site } from '@/content/site';
import { hasRole } from '@/lib/auth/session';
import { exportCsv, exportFileName, isExportKind } from '@/lib/rsvp/csv';
import { listRsvps, storageKind } from '@/lib/storage';

/**
 * CSV-Export der Rückmeldungen (nur Admin):
 * - /admin/export?art=haushalte → eine Zeile pro Antwort (cv-zusagen-JJJJ-MM-TT.csv)
 * - /admin/export?art=personen  → eine Zeile pro Gast (cv-gaeste-JJJJ-MM-TT.csv)
 *
 * Der Proxy leitet nicht angemeldete Aufrufe bereits um; hier wird die
 * Admin-Rolle trotzdem noch einmal geprüft.
 */

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function textResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!(await hasRole('admin'))) {
    return textResponse('Nicht angemeldet. Bitte meldet euch unter /admin/login an.', 401);
  }

  const kind = request.nextUrl.searchParams.get('art') ?? 'haushalte';
  if (!isExportKind(kind)) {
    return textResponse('Unbekannter Export. Erlaubt sind art=haushalte und art=personen.', 400);
  }

  if (storageKind() === 'none') {
    return textResponse('Es ist noch kein Speicher für die Zusagen eingerichtet.', 503);
  }

  let entries;
  try {
    entries = await listRsvps();
  } catch (error) {
    console.error('[admin] CSV-Export: Zusagen konnten nicht geladen werden', error);
    return textResponse('Die Zusagen konnten gerade nicht geladen werden. Bitte später erneut versuchen.', 503);
  }

  const timeZone = site.wedding.timeZone;
  const csv = exportCsv(kind, entries, site.rsvp, { timeZone });
  const fileName = exportFileName(kind, new Date(), timeZone);

  return new Response(csv, {
    headers: {
      ...NO_STORE,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
