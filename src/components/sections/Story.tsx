import type { CSSProperties } from 'react';
import { LeafNode, Rings, StoryVignette, VINE_TILE_URL } from '@/components/illustrations';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site, type StoryItem } from '@/content/site';
import { formatDate } from '@/lib/format';
import { SECTION_IDS } from '@/lib/navigation';
import { StoryVine } from './StoryVine';
import styles from './Story.module.css';

/** Jahreszahl aus Freitext wie „Sommer 2016“ – gültiger Wert für <time datetime>. */
function yearOf(text: string): string | undefined {
  return /\b(\d{4})\b/.exec(text)?.[1];
}

/** JJJJ-MM-TT des Hochzeitstags in der Zeitzone der Hochzeit. */
function weddingDay(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: site.wedding.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(site.wedding.start));
}

function Picture({ item }: { item: StoryItem }) {
  if (item.image) {
    return (
      <figure className={`${styles.arch} ${styles.photo}`}>
        {/* Bewusst kein next/image: Bilder liegen hinter dem Gästecode-Schutz. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.imageAlt ?? ''} loading="lazy" decoding="async" className={styles.img} />
      </figure>
    );
  }
  return (
    <div className={`${styles.arch} ${styles.vignetteArch}`}>
      <StoryVignette variant={item.vignette} size="100%" className={styles.vignette} />
    </div>
  );
}

/**
 * Unsere Geschichte (#geschichte): „Herbarium-Ranke“ – Zeitleiste mit
 * wachsender Ranke, Blattpaar-Knoten und Bogenbildern (design.md F3).
 * Mobil läuft die Ranke links, ab 64em in der Mitte; Text und Bild wechseln
 * dann pro Meilenstein die Seite.
 */
export function Story() {
  const { items, eyebrow, title, intro, finale } = site.story;
  if (items.length === 0) return null;

  const day = weddingDay();

  return (
    <Section id={SECTION_IDS.story} title={title} eyebrow={eyebrow} intro={intro} tone="base">
      <div className={styles.timeline} style={{ '--vine-tile': VINE_TILE_URL } as CSSProperties}>
        <StoryVine className={styles.vine} />

        <ol className={styles.list} role="list">
          {items.map((item, i) => {
            const year = yearOf(item.date);
            return (
              <Reveal as="li" key={`${item.date}-${i}`} className={styles.item}>
                <LeafNode className={styles.node} />
                <div className={styles.text}>
                  <p className={`label ${styles.date}`}>
                    {year ? <time dateTime={year}>{item.date}</time> : item.date}
                  </p>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.body}>{item.text}</p>
                </div>
                <div className={styles.media}>
                  <Picture item={item} />
                </div>
              </Reveal>
            );
          })}
        </ol>

        {finale ? (
          <Reveal className={styles.finale}>
            <span className={styles.finaleSeal}>
              <Rings size={34} />
            </span>
            <p className={`label ${styles.finaleDate}`}>
              <time dateTime={day}>{formatDate(site.wedding.start)}</time>
            </p>
            <p className={styles.finaleTitle}>{finale}</p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
