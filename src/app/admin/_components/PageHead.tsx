import { Icon } from '@/components/icons/Icon';
import { Ornament } from '@/components/illustrations';
import { ButtonLink, buttonClassName } from '@/components/ui/Button';
import styles from '../admin.module.css';
import { ExportMenu } from './ExportMenu';

/**
 * Kopfzeile der Übersicht: H1 „Übersicht“ + „Stand“, darunter E8;
 * rechts CSV-Export (Popover), „Aktualisieren“ und „QR-Tischkarte drucken“.
 */
export function PageHead({ standIso, standLabel, canExport }: { standIso?: string; standLabel?: string; canExport: boolean }) {
  return (
    <div className={styles.pageHead}>
      <div className={styles.titleBlock}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Übersicht</h1>
          {standIso && standLabel ? (
            <p className={styles.stand}>
              Stand: <time dateTime={standIso}>{standLabel}</time>
            </p>
          ) : null}
        </div>
        <Ornament size={160} className={styles.titleOrnament} />
      </div>
      <div className={styles.actions}>
        {canExport ? <ExportMenu /> : null}
        {/* Bewusst ein normaler Link: lädt die Seite komplett neu */}
        <a href="/admin" className={buttonClassName({ variant: 'secondary', className: styles.actionButton })}>
          <Icon name="refresh" size={20} />
          <span>Aktualisieren</span>
        </a>
        <ButtonLink href="/fotos/karte" variant="ghost" icon="printer" className={styles.ghostAction}>
          QR-Tischkarte drucken
        </ButtonLink>
      </div>
    </div>
  );
}
