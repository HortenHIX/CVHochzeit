import { Icon } from '@/components/icons/Icon';
import type { RsvpOption } from '@/content/site';
import { errorId, fieldId, type PersonFormValues, type RsvpFieldErrors } from '@/lib/rsvp/form-state';
import { RSVP_LIMITS } from '@/lib/rsvp/types';
import { CheckboxRow, Chip, FieldError, SelectField, SubGroup, TextField } from './RsvpFields';
import { useRsvpConfig } from './RsvpConfigContext';
import styles from './RsvpForm.module.css';

function ids(...values: (string | false | null | undefined)[]): string | undefined {
  const joined = values.filter(Boolean).join(' ');
  return joined || undefined;
}

/**
 * Personenkarte in „Wer kommt?“: Name, Kind (Alter, Hochstuhl), Menü als
 * Chip-Radios (2 × 2), Unverträglichkeiten als Chip-Checkboxen mit „Sonstiges“.
 */
export function PersonCard({
  index,
  person,
  errors,
  onChange,
  onRemove,
  onAllergyOther,
}: {
  index: number;
  person: PersonFormValues;
  errors: RsvpFieldErrors;
  onChange: (patch: Partial<PersonFormValues>) => void;
  onRemove?: () => void;
  onAllergyOther: (checked: boolean) => void;
}) {
  const { rsvp } = useRsvpConfig();
  const n = index + 1;
  const key = (field: string) => `p${index}.${field}`;
  const menuKey = key('menu');
  const menuError = errors[menuKey];
  const menuOptions: RsvpOption[] = person.child && rsvp.offerChildMenu ? [...rsvp.menuOptions, rsvp.childMenu] : rsvp.menuOptions;
  const selectedMenu = menuOptions.find((o) => o.value === person.menu);
  const descId = (value: string) => `${fieldId(menuKey)}-${value}-beschreibung`;

  const toggleAllergy = (tag: string, checked: boolean) => {
    const tags = checked ? [...person.allergyTags, tag] : person.allergyTags.filter((t) => t !== tag);
    onChange({ allergyTags: rsvp.allergyOptions.filter((t) => tags.includes(t)) });
  };

  const toggleChild = (child: boolean) => {
    onChange({
      child,
      menu: !child && person.menu === rsvp.childMenu.value ? '' : person.menu,
      childAge: child ? person.childAge : '',
      highChair: child ? person.highChair : false,
    });
  };

  return (
    <fieldset className={[styles.person, onRemove ? styles.personRemovable : ''].filter(Boolean).join(' ')}>
      <legend className={styles.personLegend}>Person {n}</legend>

      {onRemove ? (
        <button type="button" className={styles.personRemove} onClick={onRemove}>
          <Icon name="trash" size={20} />
          <span>
            Entfernen<span className="visually-hidden"> – Person {n}</span>
          </span>
        </button>
      ) : null}

      <div className={styles.personBody}>
        <TextField
          id={fieldId(key('name'))}
          name={key('name')}
          label="Name"
          value={person.name}
          onChange={(name) => onChange({ name })}
          autoComplete={index === 0 ? 'name' : 'off'}
          inputMode="text"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={RSVP_LIMITS.name}
          errorKey={key('name')}
          error={errors[key('name')]}
        />

        {rsvp.allowChildren ? (
          <div className={styles.childBlock}>
            <CheckboxRow name={key('child')} checked={person.child} onChange={toggleChild}>
              Kind (unter 12 Jahren)
            </CheckboxRow>
            {person.child ? (
              <div className={styles.childDetails}>
                <SelectField
                  id={fieldId(key('childAge'))}
                  name={key('childAge')}
                  label="Alter"
                  optional
                  value={person.childAge}
                  onChange={(childAge) => onChange({ childAge })}
                  options={rsvp.childAgeOptions.map((age) => ({ value: age, label: age }))}
                  placeholder="Bitte wählen"
                  errorKey={key('childAge')}
                  error={errors[key('childAge')]}
                />
                <CheckboxRow
                  name={key('highChair')}
                  checked={person.highChair}
                  onChange={(highChair) => onChange({ highChair })}
                  className={styles.highChair}
                >
                  Hochstuhl benötigt
                </CheckboxRow>
              </div>
            ) : null}
          </div>
        ) : null}

        <SubGroup legend="Menü" id={fieldId(menuKey)}>
          <div className={styles.menuGrid}>
            {menuOptions.map((option) => (
              <Chip
                key={option.value}
                type="radio"
                name={menuKey}
                value={option.value}
                checked={person.menu === option.value}
                onChange={() => onChange({ menu: option.value })}
                describedBy={ids(option.description && descId(option.value), menuError && errorId(menuKey))}
                invalid={Boolean(menuError)}
                errorKey={menuKey}
                className={styles.menuChip}
              >
                {option.label}
              </Chip>
            ))}
          </div>
          {menuOptions.map((option) =>
            option.description ? (
              <span key={option.value} id={descId(option.value)} hidden>
                {option.description}
              </span>
            ) : null,
          )}
          {selectedMenu?.description ? (
            <p className={styles.dish} aria-hidden="true">
              <Icon name="utensils" size={18} className={styles.dishIcon} />
              <span>{selectedMenu.description}</span>
            </p>
          ) : null}
          <FieldError errorKey={menuKey} message={menuError} />
        </SubGroup>

        <SubGroup legend="Unverträglichkeiten" optional>
          <div className={styles.chipRow}>
            {rsvp.allergyOptions.map((tag) => (
              <Chip
                key={tag}
                type="checkbox"
                name={key('allergy')}
                value={tag}
                checked={person.allergyTags.includes(tag)}
                onChange={(checked) => toggleAllergy(tag, checked)}
              >
                {tag}
              </Chip>
            ))}
            <Chip
              type="checkbox"
              name={key('allergyOther')}
              value="on"
              checked={person.allergyOther}
              onChange={onAllergyOther}
            >
              Sonstiges
            </Chip>
          </div>
          {person.allergyOther ? (
            <TextField
              id={fieldId(key('allergyNote'))}
              name={key('allergyNote')}
              label="Welche Unverträglichkeit?"
              hint="z. B. Sellerie"
              value={person.allergyNote}
              onChange={(allergyNote) => onChange({ allergyNote })}
              autoComplete="off"
              inputMode="text"
              maxLength={RSVP_LIMITS.allergyNote}
              errorKey={key('allergyNote')}
              error={errors[key('allergyNote')]}
              className={styles.allergyNote}
            />
          ) : null}
        </SubGroup>
      </div>
    </fieldset>
  );
}
