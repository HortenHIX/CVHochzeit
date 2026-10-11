import { Notice } from '@/components/ui/Notice';
import styles from '../admin.module.css';

/** Hinweis, wenn kein Speicher (Upstash Redis) verbunden ist. */
export function SetupNotice() {
  return (
    <Notice tone="important" title="Der Speicher für die Zusagen ist noch nicht eingerichtet." className={styles.setup}>
      <p>
        Solange kein Speicher verbunden ist, können Gäste ihre Zusage nicht absenden und hier erscheint nichts. So
        richtet ihr ihn einmalig ein (etwa 5 Minuten, kostenlos):
      </p>
      <ol className={styles.setupSteps}>
        <li>
          Im <strong>Vercel-Dashboard</strong> euer Projekt öffnen und zum Reiter <strong>„Storage“</strong> wechseln.
        </li>
        <li>
          Über <strong>„Create Database“</strong> bzw. den <strong>Marketplace</strong> die Integration{' '}
          <strong>„Upstash for Redis“</strong> auswählen, eine Datenbank anlegen (Region Frankfurt, Gratis-Tarif) und sie
          mit diesem Projekt verbinden.
        </li>
        <li>
          Vercel trägt die Zugangsdaten automatisch als Umgebungsvariablen ein (<code>KV_REST_API_URL</code> und{' '}
          <code>KV_REST_API_TOKEN</code>).
        </li>
        <li>
          Unter <strong>„Deployments“</strong> beim neuesten Deployment <strong>„Redeploy“</strong> wählen – erst danach
          kennt die Seite den Speicher.
        </li>
        <li>Diese Seite neu laden. Hier steht dann die Übersicht.</li>
      </ol>
      <p className={styles.setupNote}>
        Lokal (<code>npm run dev</code>) landen Zusagen automatisch in <code>.data/rsvps.json</code>.
      </p>
    </Notice>
  );
}
