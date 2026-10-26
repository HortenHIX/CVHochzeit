import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Notice } from '@/components/ui/Notice';
import { site } from '@/content/site';
import { requireAdmin } from '@/lib/auth/session';
import { getRsvpConfig } from '@/lib/rsvp/config-server';
import { entryToValues, toSummary } from '@/lib/rsvp/form-state';
import { getRsvp, storageKind } from '@/lib/storage';
import { AdminHeader } from '../../_components/AdminHeader';
import adminStyles from '../../admin.module.css';
import { EditForm } from './EditForm';
import styles from './edit.module.css';

export const metadata: Metadata = {
  title: `Antwort bearbeiten – Verwaltung – ${site.couple.first} & ${site.couple.second}`,
};

const ID_PATTERN = /^[\w-]{1,100}$/;

/** Antwort bearbeiten (nur Verwaltung). Die ID bleibt als Promise und wird erst hinter <Suspense> gelesen. */
export default function EditResponsePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <AdminHeader />
      <main id="inhalt" className={adminStyles.main}>
        <Suspense fallback={<p className={styles.loading}>Antwort wird geladen …</p>}>
          <EditContent params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const back = (
    <Link href="/admin" className={styles.back}>
      ← Zurück zur Übersicht
    </Link>
  );

  if (storageKind() === 'none') {
    return (
      <>
        {back}
        <Notice tone="important">Es ist noch kein Speicher eingerichtet.</Notice>
      </>
    );
  }

  const entry = ID_PATTERN.test(id) ? await getRsvp(id) : null;
  if (!entry) {
    return (
      <>
        {back}
        <Notice tone="important">Diese Antwort gibt es nicht (mehr).</Notice>
      </>
    );
  }

  const config = getRsvpConfig();
  return (
    <>
      {back}
      <h1 className={styles.title}>Antwort bearbeiten</h1>
      <p className={styles.lead}>
        Änderungen gelten sofort. Die Angaben werden wie im Gästeformular geprüft, nur die Frist spielt keine Rolle.
      </p>
      <EditForm id={entry.id} config={config.rsvp} initial={entryToValues(toSummary(entry))} />
    </>
  );
}
