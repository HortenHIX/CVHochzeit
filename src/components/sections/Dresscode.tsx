import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons/Icon';
import { InfoRow } from '@/components/ui/InfoRow';
import { Paragraphs } from '@/components/ui/Paragraphs';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import styles from './Dresscode.module.css';

function Rules({ kind, items }: { kind: 'do' | 'dont'; items: string[] }) {
  const isDo = kind === 'do';
  const titleId = `dresscode-${kind}`;
  return (
    <article className={`${styles.card} ${isDo ? styles.do : styles.dont}`} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.cardTitle}>
        <span className={styles.badge} aria-hidden="true">
          <Icon name={isDo ? 'check' : 'x'} size={18} />
        </span>
        {isDo ? 'Gerne' : 'Lieber nicht'}
      </h3>
      <ul className={styles.rules} role="list">
        {items.map((item) => (
          <li key={item} className={styles.rule}>
            <Icon name={isDo ? 'check' : 'x'} size={20} className={styles.ruleIcon} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Dresscode (#dresscode, design.md F7): Motto als Zitat, Farbfelder im Bogen
 * (Inhaltsfarben, keine UI-Tokens – die Bedeutung trägt immer das Label),
 * „Gerne“/„Lieber nicht“-Karten und eine Info-Zeile.
 */
export function Dresscode() {
  const { eyebrow, title, motto, text, palette, dos, donts, note } = site.dresscode;

  return (
    <Section id={SECTION_IDS.dresscode} title={title} eyebrow={eyebrow} tone="base">
      <div className={styles.intro}>
        {motto ? <p className={styles.motto}>{motto}</p> : null}
        {text ? <Paragraphs text={text} className={styles.text} /> : null}
      </div>

      {palette.length > 0 ? (
        <figure className={styles.palette}>
          <ul className={styles.swatches} role="list" aria-label="Farbpalette">
            {palette.map((swatch, i) => (
              <Reveal as="li" key={swatch.name} delay={Math.min(i, 4) * 80} className={styles.swatch}>
                <span
                  className={styles.chip}
                  style={{ '--swatch': swatch.hex } as CSSProperties}
                  aria-hidden="true"
                />
                <span className={styles.swatchName}>{swatch.name}</span>
              </Reveal>
            ))}
          </ul>
          <figcaption className={styles.caption}>Inspiration, kein Muss.</figcaption>
        </figure>
      ) : null}

      {dos.length > 0 || donts.length > 0 ? (
        <div className={styles.cards}>
          {dos.length > 0 ? <Rules kind="do" items={dos} /> : null}
          {donts.length > 0 ? <Rules kind="dont" items={donts} /> : null}
        </div>
      ) : null}

      {note ? (
        <div className={styles.note}>
          <InfoRow icon="shoe">
            <p>{note}</p>
          </InfoRow>
        </div>
      ) : null}
    </Section>
  );
}
