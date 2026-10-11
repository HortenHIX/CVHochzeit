import { ButtonLink } from '@/components/ui/Button';
import { Paragraphs } from '@/components/ui/Paragraphs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import { FaqAccordion } from './FaqAccordion';
import styles from './Faq.module.css';

/**
 * Häufige Fragen (#faq, design.md F11): natives <details> ohne `name`, damit
 * mehrere Antworten offen bleiben und die Browser-Suche Treffer aufklappt.
 * Mobil: Kopf, darunter das Akkordeon; ab 64em Raster 1fr 2fr mit
 * mitlaufender linker Spalte. Eigene <section> (Hintergrund wie Section „base“),
 * weil der Kopf ab 64em in die linke Spalte wandert.
 */
export function Faq() {
  const { eyebrow, title, intro, items } = site.faq;
  if (items.length === 0) return null;
  const id = SECTION_IDS.faq;
  const showContactLink = site.contacts.people.length > 0;

  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.aside}>
          <div className={styles.head}>
            <SectionHeading id={`${id}-titel`} title={title} eyebrow={eyebrow} intro={intro} align="start" />
          </div>
          {showContactLink ? (
            <p className={`${styles.more} no-print`}>
              <ButtonLink href={`#${SECTION_IDS.contacts}`} variant="ghost" iconAfter="arrow-right">
                {intro ? 'Zu den Kontakten' : 'Eure Frage fehlt? Schreibt uns'}
              </ButtonLink>
            </p>
          ) : null}
        </div>

        <div className={styles.accordion}>
          <FaqAccordion id={`${id}-liste`} count={items.length}>
            {items.map((item) => (
              <details key={item.question} className={styles.item}>
                <summary className={styles.summary}>
                  <span className={styles.question}>{item.question}</span>
                  <span className={styles.symbol} aria-hidden="true" />
                </summary>
                <div className={styles.answer}>
                  <Paragraphs text={item.answer} />
                  {item.link ? (
                    <p className={`${styles.answerLink} no-print`}>
                      <ButtonLink href={item.link.href} variant="ghost" iconAfter="arrow-right">
                        {item.link.label}
                      </ButtonLink>
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </FaqAccordion>
        </div>
      </div>
    </section>
  );
}
