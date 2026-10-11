import { Icon } from '@/components/icons/Icon';
import { CopyButton } from '@/components/ui/CopyButton';
import type { AllergyItem, MenuCount } from '@/lib/rsvp/stats';
import styles from '../admin.module.css';

/** Liste für den Caterer als Text (für „Liste kopieren“). */
function asText(items: AllergyItem[]): string {
  return items
    .map((item) => {
      const who = item.person === item.household ? item.person : `${item.person} (${item.household})`;
      return `${who}${item.child ? ', Kind' : ''} – ${item.menu}: ${item.text}`;
    })
    .join('\n');
}

/** Karte „Unverträglichkeiten“ mit Personennamen – für den Caterer. */
export function AllergyCard({ items, tags }: { items: AllergyItem[]; tags: MenuCount[] }) {
  return (
    <section aria-labelledby="allergien-titel" className={styles.card}>
      <div className={styles.cardHead}>
        <h2 id="allergien-titel" className={styles.cardTitle}>
          Unverträglichkeiten
        </h2>
        <p className={styles.cardMeta}>für den Caterer</p>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Bisher hat niemand Unverträglichkeiten angegeben.</p>
      ) : (
        <>
          {tags.length > 0 ? (
            <ul role="list" className={styles.tagList} aria-label="Häufigkeit">
              {tags.map((tag) => (
                <li key={tag.key} className={styles.tag}>
                  {tag.label} <span className={`${styles.tagCount} nums`}>{tag.count}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <ul role="list" className={styles.allergyList}>
            {items.map((item, index) => (
              <li key={`${item.entryId}-${index}`} className={styles.allergyItem}>
                <Icon name="alert" size={18} className={styles.allergyIcon} />
                <div className={styles.allergyBody}>
                  <p className={styles.allergyWho}>
                    <span className={styles.allergyName}>{item.person}</span>
                    {item.child ? <span className={styles.allergyMeta}> · Kind</span> : null}
                    <span className={styles.allergyMeta}> · {item.menu}</span>
                  </p>
                  <p className={styles.allergyText}>{item.text}</p>
                  {item.person !== item.household ? (
                    <p className={styles.allergyHousehold}>Haushalt: {item.household}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.cardFoot}>
            <CopyButton value={asText(items)} label="Liste kopieren" toast="Liste kopiert" variant="ghost" />
          </div>
        </>
      )}
    </section>
  );
}
