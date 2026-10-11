import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons/Icon';
import { OliveBranch } from '@/components/illustrations';
import { CopyButton } from '@/components/ui/CopyButton';
import { InfoRow } from '@/components/ui/InfoRow';
import { Paragraphs } from '@/components/ui/Paragraphs';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import styles from './Gifts.module.css';

/** Leichte, wechselnde Neigung der „Postkarten“ (in Grad) */
const TILTS = [-2.5, 1.75, -1.25, 2.25, -1.75];

type Bank = NonNullable<(typeof site)['gifts']['bank']>;

function BankDetails({ bank }: { bank: Bank }) {
  const iban = bank.iban.replace(/\s+/g, '').toUpperCase();
  const grouped = iban.match(/.{1,4}/g)?.join(' ') ?? iban;
  return (
    <details className={styles.bank}>
      <summary className={styles.bankSummary}>
        <span className={styles.bankSummaryText}>Bankverbindung anzeigen</span>
        <Icon name="chevron-down" size={20} className={styles.chevron} />
      </summary>
      <div className={styles.bankBody}>
        <dl className={styles.bankList}>
          <div className={styles.bankRow}>
            <dt>Kontoinhaber</dt>
            <dd>{bank.holder}</dd>
          </div>
          <div className={styles.bankRow}>
            <dt>IBAN</dt>
            <dd className={styles.ibanRow}>
              <span className={`${styles.iban} nums`}>{grouped}</span>
              <CopyButton value={iban} label="IBAN kopieren" toast="IBAN kopiert" className="no-print" />
            </dd>
          </div>
          {bank.bic ? (
            <div className={styles.bankRow}>
              <dt>BIC</dt>
              <dd className="nums">{bank.bic}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </details>
  );
}

/**
 * Geschenke (#geschenke, design.md F8): einspaltig auf Salbei, Olivenzweig
 * über dem Kopf, Zitat, Text, Reise-„Postkarten“, Info-Zeile und optional
 * die Bankverbindung zum Aufklappen.
 */
export function Gifts() {
  const { eyebrow, title, quote, text, stations, note, bank } = site.gifts;

  return (
    <Section
      id={SECTION_IDS.gifts}
      title={title}
      eyebrow={eyebrow}
      tone="tint"
      width="narrow"
      className={styles.section}
    >
      {/* steht per CSS (order) über dem Sektionskopf */}
      <OliveBranch className={styles.olive} />

      <div className={styles.body}>
        {quote ? <p className={styles.quote}>„{quote}“</p> : null}
        {text ? <Paragraphs text={text} className={styles.text} /> : null}
      </div>

      {stations.length > 0 ? (
        <ul className={styles.postcards} role="list" aria-label="Stationen unserer Traumreise">
          {stations.map((station, i) => (
            <Reveal
              as="li"
              key={station.label}
              delay={Math.min(i, 4) * 80}
              className={styles.postcardItem}
            >
              <div className={styles.postcard} style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` } as CSSProperties}>
                <span className={styles.stamp} aria-hidden="true" />
                <Icon name={station.icon} size={30} className={styles.postcardIcon} />
                <span className={styles.postcardLabel}>{station.label}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      ) : null}

      {note ? (
        <div className={styles.note}>
          <InfoRow icon="envelope">
            <p>{note}</p>
          </InfoRow>
        </div>
      ) : null}

      {bank && bank.iban ? <BankDetails bank={bank} /> : null}
    </Section>
  );
}
