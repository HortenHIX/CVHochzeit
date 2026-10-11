import { Suspense } from 'react';
import { Monogram } from '@/components/illustrations';
import { Section } from '@/components/ui/Section';
import { site } from '@/content/site';
import { SECTION_IDS } from '@/lib/navigation';
import { entryToValues, toSummary, type RsvpInitial } from '@/lib/rsvp/form-state';
import { getOwnRsvp } from '@/lib/rsvp/own';
import { RsvpForm } from './RsvpForm';
import styles from './RsvpSection.module.css';

/**
 * Sektion „Zusage“ (design.md F10): sand-Sektion mit paper-Formularkarte,
 * Monogramm-Siegel an der Oberkante. Die eigene Antwort dieses Geräts
 * (Cookie) wird hinter <Suspense> geladen; bis dahin steht das leere Formular.
 */
export function RsvpSection() {
  const { eyebrow, title, intro } = site.rsvp;
  return (
    <Section id={SECTION_IDS.rsvp} title={title} eyebrow={eyebrow} intro={intro} tone="alt" width="narrow">
      <div className={styles.card}>
        <div className={styles.seal}>
          <Monogram size={56} />
        </div>
        <Suspense fallback={<RsvpForm initial={null} />}>
          <OwnRsvpForm />
        </Suspense>
      </div>
    </Section>
  );
}

/** Liest das Antwort-Cookie – deshalb innerhalb von <Suspense>. */
async function OwnRsvpForm() {
  const own = await getOwnRsvp();
  let initial: RsvpInitial | null = null;
  if (own) {
    const summary = toSummary(own);
    initial = { summary, values: entryToValues(summary) };
  }
  return <RsvpForm initial={initial} />;
}
