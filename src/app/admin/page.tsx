import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Notice } from '@/components/ui/Notice';
import { site } from '@/content/site';
import { requireAdmin } from '@/lib/auth/session';
import { formatDateTime } from '@/lib/format';
import { allergyList, computeStats, messageList, songWishList } from '@/lib/rsvp/stats';
import type { RsvpEntry } from '@/lib/rsvp/types';
import { listRsvps, storageKind } from '@/lib/storage';
import { AdminHeader } from './_components/AdminHeader';
import { AllergyCard } from './_components/AllergyCard';
import { FilterProvider } from './_components/FilterContext';
import { MenuBars } from './_components/MenuBars';
import { NotesCards } from './_components/NotesCards';
import { PageHead } from './_components/PageHead';
import { ResponsesTable } from './_components/ResponsesTable';
import { buildRows } from './_components/rows';
import { SetupNotice } from './_components/SetupNotice';
import { StatTiles } from './_components/StatTiles';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: `Übersicht – Verwaltung – ${site.couple.first} & ${site.couple.second}`,
};

/**
 * Verwaltung (design.md F „Admin“): Kennzahlen, Menüwahl, Unverträglichkeiten,
 * alle Antworten mit Filter, CSV-Export und Löschen.
 *
 * Alles, was Session oder Daten liest, liegt hinter <Suspense> (Cache Components).
 */
export default function AdminPage() {
  return (
    <>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <AdminHeader />
      <main id="inhalt" className={styles.main}>
        <Suspense fallback={<AdminSkeleton />}>
          <AdminContent />
        </Suspense>
      </main>
    </>
  );
}

async function AdminContent() {
  await requireAdmin();
  const standIso = new Date().toISOString();
  const standLabel = `${formatDateTime(standIso)} Uhr`;

  if (storageKind() === 'none') {
    return (
      <>
        <PageHead standIso={standIso} standLabel={standLabel} canExport={false} />
        <SetupNotice />
      </>
    );
  }

  let entries: RsvpEntry[];
  try {
    entries = await listRsvps();
  } catch (error) {
    console.error('[admin] Zusagen konnten nicht geladen werden', error);
    return (
      <>
        <PageHead standIso={standIso} standLabel={standLabel} canExport={false} />
        <Notice tone="error" title="Die Zusagen konnten gerade nicht geladen werden.">
          <p>Bitte versucht es in ein paar Minuten noch einmal mit „Aktualisieren“.</p>
        </Notice>
      </>
    );
  }

  const labels = site.rsvp;
  const stats = computeStats(entries, labels);

  return (
    <FilterProvider>
      <PageHead standIso={standIso} standLabel={standLabel} canExport />
      <StatTiles stats={stats} />
      <div className={styles.pair}>
        <MenuBars menus={stats.menus} persons={stats.persons} />
        <AllergyCard items={allergyList(entries, labels)} tags={stats.allergyTags} />
      </div>
      <ResponsesTable rows={buildRows(entries, labels)} />
      <NotesCards messages={messageList(entries)} songs={songWishList(entries)} />
    </FilterProvider>
  );
}

/** Platzhalter, solange Session und Daten geladen werden. */
function AdminSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <p className="visually-hidden" role="status">
        Übersicht wird geladen …
      </p>
      <div className={styles.skeletonTitle} />
      <div className={styles.tiles} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`${styles.tile} ${styles.skeletonTile}`} />
        ))}
      </div>
    </div>
  );
}
