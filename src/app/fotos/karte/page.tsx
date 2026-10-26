import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import { CornerBouquet, Monogram } from '@/components/illustrations';
import { QrCode } from '@/components/sections/QrCode';
import { buttonClassName } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { site } from '@/content/site';
import { formatDate } from '@/lib/format';
import { displayUrl } from '@/lib/qr';
import { PrintButton } from './PrintButton';
import styles from './karte.module.css';

export const metadata: Metadata = {
  title: `QR-Tischkarten – ${site.couple.first} & ${site.couple.second}`,
};

const FORMATS = [
  { value: 'a6', title: 'A6-Karte', detail: '4 Karten pro A4 · an den Schnittmarken schneiden', icon: 'image' },
  {
    value: 'tent',
    title: 'Aufsteller zum Falten',
    detail: '2 pro A4 · längs halbieren, in der Mitte falzen',
    icon: 'tag',
  },
] as const;

/** Eine A6-Tischkarte (105 × 148,5 mm). Maße in mm über die Variable --u. */
function TableCard({ albumUrl, hidden }: { albumUrl: string; hidden: boolean }) {
  const { title, text } = site.photos.printCard;
  return (
    <div className={styles.card} aria-hidden={hidden || undefined}>
      <span className={styles.frame} aria-hidden="true" />
      <CornerBouquet variant="line" corner="top-left" printable className={`${styles.bouquet} ${styles.bouquetTop}`} />
      <CornerBouquet
        variant="line"
        corner="bottom-right"
        printable
        className={`${styles.bouquet} ${styles.bouquetBottom}`}
      />
      <div className={styles.content}>
        <Monogram variant="large" className={styles.monogram} />
        <p className={styles.names}>
          {site.couple.first} <span className={styles.amp}>&amp;</span> {site.couple.second}
        </p>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{text}</p>
        <QrCode value={albumUrl} label="QR-Code zum gemeinsamen Fotoalbum" className={styles.qr} />
        <p className={styles.url}>{displayUrl(albumUrl)}</p>
        <p className={styles.date}>{formatDate(site.wedding.start)}</p>
      </div>
    </div>
  );
}

/**
 * Druckbare QR-Tischkarten (design.md F „Druckbare QR-Tischkarte“).
 * Nur aus dem Admin verlinkt; geschützt wie die ganze Seite (Proxy).
 * Die Formatwahl funktioniert ohne JavaScript (Radio + :has()).
 */
export default function TableCardPage() {
  const { albumUrl } = site.photos;

  return (
    <main id="inhalt" className={styles.page}>
      <div className={`${styles.top} no-print`}>
        <Link href="/admin" className={buttonClassName({ variant: 'ghost', className: styles.back })}>
          <Icon name="arrow-right" size={20} className={styles.backIcon} />
          <span>Zur Verwaltung</span>
        </Link>
      </div>

      <header className={`${styles.intro} no-print`}>
        <p className="label">Für den Hochzeitstag</p>
        <h1 className={styles.h1}>QR-Tischkarten</h1>
        <p className={styles.lead}>
          Druckt die Karten aus und stellt sie auf die Tische – so finden alle Gäste das gemeinsame Fotoalbum.
        </p>
      </header>

      {albumUrl ? (
        <div className={styles.workspace}>
          <div className={`${styles.controls} no-print`}>
            <fieldset className={styles.formats}>
              <legend className={styles.legend}>Format</legend>
              {FORMATS.map((f, i) => (
                <label key={f.value} className={styles.option}>
                  <input
                    type="radio"
                    name="format"
                    value={f.value}
                    defaultChecked={i === 0}
                    className={`${styles.radio} visually-hidden`}
                  />
                  <Icon name={f.icon} size={32} className={styles.optionIcon} />
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{f.title}</span>
                    <span className={styles.optionDetail}>{f.detail}</span>
                  </span>
                  <span className={styles.optionCheck} aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                </label>
              ))}
            </fieldset>

            <PrintButton className={styles.print} />

            <div className={styles.hints}>
              <p className={styles.hint}>
                <Icon name="printer" size={20} className={styles.hintIcon} />
                <span>
                  <strong>Druckeinstellungen:</strong> A4, Skalierung 100 %, ohne Seitenränder.
                </span>
              </p>
              <p className={styles.hint}>
                <Icon name="info" size={20} className={styles.hintIcon} />
                <span>Am schönsten auf festem, mattem Papier (ab 250 g/m²). Vorher eine Probeseite drucken.</span>
              </p>
            </div>
          </div>

          <div className={styles.preview}>
            <p className={`${styles.previewLabel} no-print`} aria-hidden="true">
              Vorschau · A4
            </p>
            <div className={styles.sheetWrap}>
              <div className={styles.sheet}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.cell}>
                    <TableCard albumUrl={albumUrl} hidden={i > 0} />
                  </div>
                ))}
                {/* Schnittmarken (auf den Schnittlinien am Blattrand) und Falzlinie */}
                <span className={`${styles.mark} ${styles.markTop}`} aria-hidden="true" />
                <span className={`${styles.mark} ${styles.markBottom}`} aria-hidden="true" />
                <span className={`${styles.mark} ${styles.markLeft}`} aria-hidden="true" />
                <span className={`${styles.mark} ${styles.markRight}`} aria-hidden="true" />
                <span className={styles.fold} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <Notice tone="important" title="Noch kein Album hinterlegt">
            <p>
              Tragt zuerst den Link zum Fotoalbum in <code>src/content/site.ts</code> (photos.albumUrl) ein.
            </p>
          </Notice>
        </div>
      )}
    </main>
  );
}
