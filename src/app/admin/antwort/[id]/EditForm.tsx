'use client';

import { useActionState, useState } from 'react';
import { Notice } from '@/components/ui/Notice';
import type { RsvpConfig } from '@/lib/rsvp/config';
import { emptyPerson, type PersonFormValues, type RsvpFormValues } from '@/lib/rsvp/form-state';
import { RSVP_LIMITS } from '@/lib/rsvp/types';
import { updateRsvpAction, type UpdateRsvpState } from '../../actions';
import styles from './edit.module.css';

interface EditPerson extends PersonFormValues {
  /** Stabiler React-Schlüssel (die Feldnamen hängen am Index) */
  uid: number;
}

const IDLE: UpdateRsvpState = { status: 'idle', attempt: 0, messages: [] };

/**
 * Bearbeiten einer Antwort. Alle Felder sind gesteuert, damit nach einer Fehlermeldung
 * nichts zurückgesetzt wird; gesendet wird als normales Formular an die Server Action.
 */
export function EditForm({
  id,
  config,
  initial,
}: {
  id: string;
  config: RsvpConfig['rsvp'];
  initial: RsvpFormValues;
}) {
  const [state, formAction, pending] = useActionState(updateRsvpAction.bind(null, id), IDLE);
  const [nextUid, setNextUid] = useState(initial.persons.length);
  const [values, setValues] = useState(() => ({
    ...initial,
    persons: initial.persons.map((p, i): EditPerson => ({ ...p, uid: i })),
  }));

  const attending = values.attendance === 'yes';
  const booking = config.roomBooking;
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const setPerson = (index: number, patch: Partial<PersonFormValues>) =>
    setValues((current) => ({
      ...current,
      persons: current.persons.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  const addPerson = () => {
    setValues((current) => ({ ...current, persons: [...current.persons, { ...emptyPerson(), uid: nextUid }] }));
    setNextUid((n) => n + 1);
  };
  const removePerson = (index: number) =>
    setValues((current) => ({ ...current, persons: current.persons.filter((_, i) => i !== index) }));
  const toggle = (list: string[], value: string, on: boolean) =>
    on ? [...new Set([...list, value])] : list.filter((v) => v !== value);

  const menuOptions = (person: PersonFormValues) =>
    person.child && (config.offerChildMenu || person.menu === config.childMenu.value)
      ? [...config.menuOptions, config.childMenu]
      : config.menuOptions;

  return (
    <form action={formAction} className={styles.form}>
      {state.status === 'error' ? (
        <div className={styles.errors} role="alert">
          <Notice tone="error" title="Bitte prüft noch:">
            <ul role="list" className={styles.errorList}>
              {state.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Notice>
        </div>
      ) : null}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Antwort</legend>
        <div className={styles.row}>
          <label className={styles.choice}>
            <input
              type="radio"
              name="attendance"
              value="yes"
              checked={attending}
              onChange={() => set('attendance', 'yes')}
            />
            Zusage
          </label>
          <label className={styles.choice}>
            <input
              type="radio"
              name="attendance"
              value="no"
              checked={values.attendance === 'no'}
              onChange={() => set('attendance', 'no')}
            />
            Absage
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Name (Haushalt)</span>
          <input
            className={styles.input}
            name="name"
            value={values.name}
            maxLength={RSVP_LIMITS.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            E-Mail <span className={styles.optional}>(optional)</span>
          </span>
          <input
            className={styles.input}
            type="email"
            name="email"
            value={values.email}
            maxLength={RSVP_LIMITS.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </label>
      </fieldset>

      {attending ? (
        <>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Personen</legend>
            {values.persons.map((person, index) => (
              <div key={person.uid} className={styles.person}>
                <p className={styles.personTitle}>Person {index + 1}</p>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input
                    className={styles.input}
                    name={`p${index}.name`}
                    value={person.name}
                    maxLength={RSVP_LIMITS.name}
                    onChange={(e) => setPerson(index, { name: e.target.value })}
                  />
                </label>

                <div className={styles.row}>
                  {config.allowChildren ? (
                    <label className={styles.choice}>
                      <input
                        type="checkbox"
                        name={`p${index}.child`}
                        checked={person.child}
                        onChange={(e) =>
                          setPerson(index, {
                            child: e.target.checked,
                            childAge: e.target.checked ? person.childAge : '',
                            highChair: e.target.checked ? person.highChair : false,
                          })
                        }
                      />
                      Kind
                    </label>
                  ) : null}
                  {person.child ? (
                    <>
                      <label className={styles.inline}>
                        <span className={styles.label}>Alter</span>
                        <select
                          className={styles.input}
                          name={`p${index}.childAge`}
                          value={person.childAge}
                          onChange={(e) => setPerson(index, { childAge: e.target.value })}
                        >
                          <option value="">–</option>
                          {config.childAgeOptions.map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.choice}>
                        <input
                          type="checkbox"
                          name={`p${index}.highChair`}
                          checked={person.highChair}
                          onChange={(e) => setPerson(index, { highChair: e.target.checked })}
                        />
                        Hochstuhl
                      </label>
                    </>
                  ) : null}
                </div>

                <fieldset className={styles.subgroup}>
                  <legend className={styles.label}>Menü</legend>
                  <div className={styles.row}>
                    {menuOptions(person).map((option) => (
                      <label key={option.value} className={styles.choice}>
                        <input
                          type="radio"
                          name={`p${index}.menu`}
                          value={option.value}
                          checked={person.menu === option.value}
                          onChange={() => setPerson(index, { menu: option.value })}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className={styles.subgroup}>
                  <legend className={styles.label}>
                    Unverträglichkeiten <span className={styles.optional}>(optional)</span>
                  </legend>
                  <div className={styles.row}>
                    {config.allergyOptions.map((tag) => (
                      <label key={tag} className={styles.choice}>
                        <input
                          type="checkbox"
                          name={`p${index}.allergy`}
                          value={tag}
                          checked={person.allergyTags.includes(tag)}
                          onChange={(e) =>
                            setPerson(index, { allergyTags: toggle(person.allergyTags, tag, e.target.checked) })
                          }
                        />
                        {tag}
                      </label>
                    ))}
                    <label className={styles.choice}>
                      <input
                        type="checkbox"
                        name={`p${index}.allergyOther`}
                        checked={person.allergyOther}
                        onChange={(e) => setPerson(index, { allergyOther: e.target.checked })}
                      />
                      Sonstiges
                    </label>
                  </div>
                  {person.allergyOther ? (
                    <input
                      className={styles.input}
                      name={`p${index}.allergyNote`}
                      aria-label={`Sonstige Unverträglichkeiten, Person ${index + 1}`}
                      value={person.allergyNote}
                      maxLength={RSVP_LIMITS.allergyNote}
                      onChange={(e) => setPerson(index, { allergyNote: e.target.value })}
                    />
                  ) : null}
                </fieldset>

                {values.persons.length > 1 ? (
                  <button type="button" className={styles.linkButton} onClick={() => removePerson(index)}>
                    Person {index + 1} entfernen
                  </button>
                ) : null}
              </div>
            ))}
            {values.persons.length < config.maxPersons ? (
              <button type="button" className={styles.secondary} onClick={addPerson}>
                Person hinzufügen
              </button>
            ) : (
              <p className={styles.hint}>Höchstens {config.maxPersons} Personen pro Antwort.</p>
            )}
          </fieldset>

          {config.askOvernight ? (
            <fieldset className={styles.group}>
              <legend className={styles.legend}>Übernachtung</legend>
              <div className={styles.column}>
                <label className={styles.choice}>
                  <input
                    type="radio"
                    name="overnight"
                    value=""
                    checked={values.overnight === ''}
                    onChange={() => set('overnight', '')}
                  />
                  Keine Angabe
                </label>
                {config.overnightOptions.map((option) => (
                  <label key={option.value} className={styles.choice}>
                    <input
                      type="radio"
                      name="overnight"
                      value={option.value}
                      checked={values.overnight === option.value}
                      onChange={() => set('overnight', option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {values.overnight === booking.overnightValue ? (
                <label className={styles.inline}>
                  <span className={styles.label}>Zimmer</span>
                  <input
                    className={styles.input}
                    type="number"
                    name="rooms"
                    min={1}
                    max={Math.max(values.persons.length, 1)}
                    value={values.rooms}
                    onChange={(e) => set('rooms', Number.parseInt(e.target.value, 10) || 0)}
                  />
                </label>
              ) : null}
              {booking.noteFor.includes(values.overnight) ? (
                <label className={styles.field}>
                  <span className={styles.label}>
                    {booking.noteLabel} <span className={styles.optional}>(optional)</span>
                  </span>
                  <input
                    className={styles.input}
                    name="stayNote"
                    value={values.stayNote}
                    maxLength={RSVP_LIMITS.stayNote}
                    onChange={(e) => set('stayNote', e.target.value)}
                  />
                </label>
              ) : null}
            </fieldset>
          ) : null}

          {config.events.length > 0 ? (
            <fieldset className={styles.group}>
              <legend className={styles.legend}>Programm</legend>
              <div className={styles.column}>
                {config.events.map((event) => (
                  <label key={event.id} className={styles.choice}>
                    <input
                      type="checkbox"
                      name="events"
                      value={event.id}
                      checked={values.events.includes(event.id)}
                      onChange={(e) => set('events', toggle(values.events, event.id, e.target.checked))}
                    />
                    {event.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </>
      ) : null}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Weiteres</legend>
        {config.askSongWish && attending ? (
          <label className={styles.field}>
            <span className={styles.label}>
              Musikwunsch <span className={styles.optional}>(optional)</span>
            </span>
            <input
              className={styles.input}
              name="songWish"
              value={values.songWish}
              maxLength={RSVP_LIMITS.songWish}
              onChange={(e) => set('songWish', e.target.value)}
            />
          </label>
        ) : null}
        <label className={styles.field}>
          <span className={styles.label}>
            Nachricht <span className={styles.optional}>(optional)</span>
          </span>
          <textarea
            className={styles.input}
            name="message"
            rows={4}
            value={values.message}
            maxLength={RSVP_LIMITS.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </label>
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={pending}>
          {pending ? 'Wird gespeichert …' : 'Änderungen speichern'}
        </button>
        <a href="/admin" className={styles.cancel}>
          Abbrechen
        </a>
      </div>
    </form>
  );
}
