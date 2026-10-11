import type { Ref } from 'react';
import { Icon } from '@/components/icons/Icon';
import { HalfWreath, OliveBranch, Rings } from '@/components/illustrations';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { formatDateIn, formatPhone, telHref } from '@/lib/format-pure';
import { eventLabel, menuLabel, overnightLabel, type RsvpConfig } from '@/lib/rsvp/config';
import { greetingName, personCountText, type RsvpSummary } from '@/lib/rsvp/form-state';
import { allergyText, type RsvpPerson, type RsvpShuttle } from '@/lib/rsvp/types';
import { useRsvpConfig } from './RsvpConfigContext';
import styles from './RsvpResult.module.css';

export type ResultVariant = 'success' | 'existing' | 'closed';

function personDetails(config: RsvpConfig, person: RsvpPerson): string {
  const allergies = allergyText(person);
  return [
    person.menu ? menuLabel(config, person.menu) : null,
    person.child ? `Kind${person.childAge ? ` (${person.childAge})` : ''}` : null,
    person.highChair ? 'Hochstuhl' : null,
    allergies ? `Unverträglichkeiten: ${allergies}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function shuttleText(shuttle: RsvpShuttle | null): string {
  if (!shuttle || (!shuttle.there && !shuttle.back)) return 'Kein Shuttle';
  const ride = shuttle.there && shuttle.back ? 'Hin- und Rückfahrt' : shuttle.there ? 'Hinfahrt' : 'Rückfahrt';
  const seats = shuttle.seats > 0 ? `${shuttle.seats} ${shuttle.seats === 1 ? 'Platz' : 'Plätze'}` : null;
  return [ride, shuttle.from || null, seats].filter(Boolean).join(' · ');
}

/** Zusammenfassung einer Antwort als <dl> (ab 30em zweispaltig). */
export function RsvpSummaryList({ summary }: { summary: RsvpSummary }) {
  const config = useRsvpConfig();
  const { rsvp } = config;
  const yes = summary.attendance === 'yes';
  return (
    <dl className={styles.summary}>
      <div className={styles.row}>
        <dt>Antwort</dt>
        <dd className={styles.answer}>
          <Icon name={yes ? 'check' : 'x'} size={20} className={styles.answerIcon} />
          {yes ? 'Wir kommen gern' : 'Leider nicht'}
        </dd>
      </div>
      <div className={styles.row}>
        <dt>Name</dt>
        <dd>{summary.name}</dd>
      </div>
      {summary.email ? (
        <div className={styles.row}>
          <dt>E-Mail</dt>
          <dd className="break-anywhere">{summary.email}</dd>
        </div>
      ) : null}
      {yes && summary.persons.length > 0 ? (
        <div className={styles.row}>
          <dt>{summary.persons.length === 1 ? 'Person' : 'Personen'}</dt>
          <dd>
            <ul role="list" className={styles.persons}>
              {summary.persons.map((person, i) => (
                <li key={`${i}-${person.name}`}>
                  <span className={styles.personName}>{person.name}</span>
                  {personDetails(config, person) ? <span className={styles.personMeta}>{personDetails(config, person)}</span> : null}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ) : null}
      {yes && rsvp.events.length > 0 ? (
        <div className={styles.row}>
          <dt>Programm</dt>
          <dd>{summary.events.length ? summary.events.map((id) => eventLabel(config, id)).join(', ') : '–'}</dd>
        </div>
      ) : null}
      {yes && rsvp.askOvernight ? (
        <div className={styles.row}>
          <dt>Übernachtung</dt>
          <dd>{summary.overnight ? overnightLabel(config, summary.overnight) : 'Keine Angabe'}</dd>
        </div>
      ) : null}
      {yes && config.shuttleEnabled ? (
        <div className={styles.row}>
          <dt>Shuttle</dt>
          <dd>{shuttleText(summary.shuttle)}</dd>
        </div>
      ) : null}
      {summary.songWish ? (
        <div className={styles.row}>
          <dt>Musikwunsch</dt>
          <dd>{summary.songWish}</dd>
        </div>
      ) : null}
      {summary.message ? (
        <div className={styles.row}>
          <dt>Nachricht</dt>
          <dd className={styles.message}>{summary.message}</dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * Ergebnis-Ansichten der Formularkarte:
 * - success: Bestätigung nach dem Absenden (Halbkranz mit Häkchen bzw. Olivenzweig)
 * - existing: Dieses Gerät hat schon geantwortet – Zusammenfassung zuerst
 * - closed: Nach der Frist (closeAfterDeadline) – schreibgeschützt
 */
export function RsvpResult({
  variant,
  summary,
  headingRef,
  deadlineHint,
  onEdit,
  onNew,
}: {
  variant: ResultVariant;
  summary: RsvpSummary | null;
  headingRef?: Ref<HTMLHeadingElement>;
  /** „Ihr könnt eure Antwort bis … jederzeit ändern.“ */
  deadlineHint: string;
  onEdit?: () => void;
  onNew?: () => void;
}) {
  const { rsvp, timeZone } = useRsvpConfig();
  const yes = summary?.attendance === 'yes';
  const count = summary?.persons.length ?? 0;
  const greeting = summary ? greetingName(summary.name) : '';

  let title: string;
  let text: string;
  if (variant === 'success') {
    title = greeting ? `Danke, ${greeting}!` : 'Danke!';
    text = yes ? `Wir haben eure Zusage für ${personCountText(count)} erhalten. ${rsvp.successYes}` : rsvp.successNo;
  } else if (variant === 'existing') {
    title = yes ? 'Ihr habt schon zugesagt' : 'Ihr habt schon geantwortet';
    text = yes
      ? `Eure Zusage für ${personCountText(count)} ist bei uns angekommen. ${rsvp.successYes}`
      : 'Eure Absage ist bei uns angekommen. Danke, dass ihr uns Bescheid gegeben habt!';
  } else {
    title = summary ? 'Eure Antwort' : 'Die Rückmeldefrist ist vorbei';
    text = summary
      ? 'Die Rückmeldefrist ist vorbei – hier seht ihr noch einmal, was ihr uns geschickt habt.'
      : 'Über die Website können wir leider keine Antworten mehr annehmen.';
  }

  return (
    <div className={styles.result} data-variant={variant}>
      <div className={styles.art}>
        {variant === 'success' && yes ? (
          <HalfWreath withCheck animated size={150} className={styles.wreath} />
        ) : summary && !yes ? (
          <OliveBranch size={variant === 'success' ? 150 : 120} className={styles.olive} />
        ) : (
          <Rings size={56} className={styles.rings} />
        )}
      </div>

      <h3 ref={headingRef} tabIndex={-1} className={styles.title}>
        {title}
      </h3>
      <p className={styles.text}>{text}</p>
      {variant === 'existing' && summary ? (
        <p className={styles.meta}>
          Zuletzt gespeichert am <time dateTime={summary.updatedAt}>{formatDateIn(summary.updatedAt, timeZone)}</time>
        </p>
      ) : null}

      {summary ? <RsvpSummaryList summary={summary} /> : null}

      {variant === 'closed' ? (
        <Notice tone="important" icon="phone" className={styles.closedNotice}>
          <p>
            Für Änderungen meldet euch bitte direkt bei {rsvp.changeContactName}:{' '}
            <a href={telHref(rsvp.changeContactPhone)} className={styles.tel}>
              {formatPhone(rsvp.changeContactPhone)}
            </a>
          </p>
        </Notice>
      ) : (
        <>
          <div className={styles.actions}>
            <Button variant="secondary" icon="refresh" onClick={onEdit}>
              Antwort ändern
            </Button>
            {yes ? (
              <ButtonLink href="/kalender.ics" download icon="calendar-plus">
                Zum Kalender hinzufügen
              </ButtonLink>
            ) : null}
          </div>
          <p className={styles.hint}>{deadlineHint}</p>
          <div className={styles.other}>
            <button type="button" className={styles.otherButton} onClick={onNew}>
              Für eine andere Person/Familie antworten
            </button>
          </div>
        </>
      )}
    </div>
  );
}
