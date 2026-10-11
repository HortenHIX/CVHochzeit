import { ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { site, type Contact } from '@/content/site';
import { formatPhone, telHref } from '@/lib/format-pure';
import { SECTION_IDS } from '@/lib/navigation';
import styles from './Contacts.module.css';

/** Initialen aus Vor- und Nachname, z. B. „Anna Beispiel“ → „AB“ */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((p) => p.charAt(0).toUpperCase()).join('');
}

/** wa.me erwartet die internationale Nummer ohne +, Leerzeichen und führende 0. */
function whatsappHref(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `49${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function ContactCard({ person, index }: { person: Contact; index: number }) {
  const titleId = `kontakt-${index + 1}`;
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          <span className={styles.initials}>{initials(person.name)}</span>
        </span>
        <div className={styles.who}>
          <h3 id={titleId} className={styles.name}>
            {person.name}
          </h3>
          <p className={styles.role}>{person.role}</p>
        </div>
      </div>

      {person.note ? <p className={styles.note}>{person.note}</p> : null}

      {person.phone ? (
        <p className={`${styles.phone} nums`}>
          <span className="visually-hidden">Telefon: </span>
          {formatPhone(person.phone)}
        </p>
      ) : null}
      {person.email ? (
        <p className={`${styles.printOnly} break-anywhere`}>E-Mail: {person.email}</p>
      ) : null}

      {person.phone || person.email ? (
        <div className={`${styles.actions} no-print`}>
          {person.phone ? (
            <ButtonLink href={telHref(person.phone)} variant="secondary" icon="phone" block>
              Anrufen<span className="visually-hidden">: {person.name}</span>
            </ButtonLink>
          ) : null}
          {person.email || (person.phone && person.whatsapp) ? (
            <div className={styles.secondary}>
              {person.email ? (
                <ButtonLink href={`mailto:${person.email}`} variant="ghost" icon="mail">
                  E-Mail schreiben<span className="visually-hidden"> an {person.name}</span>
                </ButtonLink>
              ) : null}
              {person.phone && person.whatsapp ? (
                <ButtonLink href={whatsappHref(person.phone)} variant="ghost" icon="chat" external>
                  WhatsApp<span className="visually-hidden">-Nachricht an {person.name}</span>
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/**
 * Kontakt (#kontakt, design.md F12): Karten der Ansprechpartner mit Bogen-
 * Avatar, sichtbarer Telefonnummer und Ein-Tipp-Aktionen, Hinweis-Box und
 * eine Zeile mit den Kontaktdaten des Brautpaars.
 */
export function Contacts() {
  const { eyebrow, title, intro, people, notice, couple } = site.contacts;
  if (people.length === 0) return null;

  return (
    <Section id={SECTION_IDS.contacts} title={title} eyebrow={eyebrow} intro={intro} tone="alt">
      <ul className={styles.cards} role="list" data-count={Math.min(people.length, 3)}>
        {people.map((person, i) => (
          <Reveal as="li" key={person.name} delay={Math.min(i, 4) * 80} className={styles.cardItem}>
            <ContactCard person={person} index={i} />
          </Reveal>
        ))}
      </ul>

      {notice ? (
        <Notice tone="important" className={styles.notice}>
          <p>{notice}</p>
        </Notice>
      ) : null}

      {couple.email || couple.phone ? (
        <p className={styles.couple}>
          <span className={styles.coupleLead}>Ihr möchtet uns direkt erreichen?</span>{' '}
          {couple.email ? (
            <>
              Schreibt an{' '}
              <a href={`mailto:${couple.email}`} className="break-anywhere">
                {couple.email}
              </a>
            </>
          ) : null}
          {couple.phone ? (
            <>
              {couple.email ? ' oder ruft an: ' : 'Ruft an: '}
              <a href={telHref(couple.phone)} className="nums">
                {formatPhone(couple.phone)}
              </a>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </Section>
  );
}
