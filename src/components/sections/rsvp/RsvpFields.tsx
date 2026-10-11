import type { ChangeEvent, ReactNode, Ref } from 'react';
import { Icon } from '@/components/icons/Icon';
import { errorId } from '@/lib/rsvp/form-state';
import styles from './fields.module.css';

/**
 * Formular-Bausteine des Zusage-Formulars (design.md G „Formularfelder“).
 * Alle Felder: Label oben, Hinweis dazwischen (aria-describedby), Fehler
 * darunter mit Warn-Icon, aria-invalid. Optionale Felder tragen „(optional)“.
 */

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function ids(...values: (string | false | null | undefined)[]): string | undefined {
  const joined = values.filter(Boolean).join(' ');
  return joined || undefined;
}

/* ---------------------------------------------------------------------------
 * Fehler & Label
 * ------------------------------------------------------------------------- */

export function FieldError({ errorKey, message }: { errorKey: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={errorId(errorKey)} className={styles.error}>
      <Icon name="alert" size={16} className={styles.errorIcon} />
      <span>{message}</span>
    </p>
  );
}

function LabelText({ label, optional }: { label: ReactNode; optional?: boolean }) {
  return (
    <>
      {label}
      {optional ? <span className={styles.optional}> (optional)</span> : null}
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Gruppen
 * ------------------------------------------------------------------------- */

/** Hauptgruppe mit Nummernkreis: <fieldset> + <legend>. */
export function Group({
  number,
  title,
  id,
  separated = true,
  disabled,
  children,
}: {
  number: number;
  title: string;
  id?: string;
  separated?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset id={id} className={cx(styles.group, separated && styles.groupSeparated)} disabled={disabled}>
      <legend className={styles.groupLegend}>
        <span className={styles.groupNumber} aria-hidden="true">
          {number}
        </span>
        <span>{title}</span>
      </legend>
      <div className={styles.groupBody}>{children}</div>
    </fieldset>
  );
}

/** Untergruppe (z. B. „Menü“) – Legende im Label-Stil. */
export function SubGroup({
  legend,
  optional,
  hint,
  hintId,
  id,
  className,
  children,
}: {
  legend: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  hintId?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset id={id} className={cx(styles.subGroup, className)}>
      <legend className={styles.subLegend}>
        <LabelText label={legend} optional={optional} />
      </legend>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children}
    </fieldset>
  );
}

/* ---------------------------------------------------------------------------
 * Text, Auswahl, Textbereich
 * ------------------------------------------------------------------------- */

interface BaseFieldProps {
  id: string;
  name: string;
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  /** Schlüssel für Fehler-ID und Live-Prüfung */
  errorKey: string;
  error?: string;
  className?: string;
}

export function TextField({
  id,
  name,
  label,
  optional,
  hint,
  errorKey,
  error,
  className,
  value,
  onChange,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  enterKeyHint,
  autoCapitalize,
  spellCheck,
  inputRef,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email';
  autoComplete: string;
  inputMode: 'text' | 'email';
  maxLength: number;
  enterKeyHint?: 'next' | 'done';
  autoCapitalize?: string;
  spellCheck?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}) {
  const hintId = hint ? `${id}-hinweis` : undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        <LabelText label={label} optional={optional} />
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        enterKeyHint={enterKeyHint}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
        data-error-key={errorKey}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids(hintId, error && errorId(errorKey))}
        className={styles.input}
      />
      <FieldError errorKey={errorKey} message={error} />
    </div>
  );
}

export function SelectField({
  id,
  name,
  label,
  optional,
  hint,
  errorKey,
  error,
  className,
  value,
  onChange,
  options,
  placeholder,
  autoComplete = 'off',
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  autoComplete?: string;
}) {
  const hintId = hint ? `${id}-hinweis` : undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        <LabelText label={label} optional={optional} />
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <div className={styles.selectWrap}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          data-error-key={errorKey}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids(hintId, error && errorId(errorKey))}
          className={cx(styles.input, styles.select)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={20} className={styles.selectIcon} />
      </div>
      <FieldError errorKey={errorKey} message={error} />
    </div>
  );
}

export function TextAreaField({
  id,
  name,
  label,
  optional,
  hint,
  errorKey,
  error,
  className,
  value,
  onChange,
  maxLength,
  footer,
  describedBy,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  /** z. B. Zeichenzähler unter dem Feld */
  footer?: ReactNode;
  describedBy?: string;
}) {
  const hintId = hint ? `${id}-hinweis` : undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        <LabelText label={label} optional={optional} />
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={4}
        autoComplete="off"
        data-error-key={errorKey}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids(hintId, describedBy, error && errorId(errorKey))}
        className={cx(styles.input, styles.textarea)}
      />
      {footer}
      <FieldError errorKey={errorKey} message={error} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Checkbox-Zeile, Auswahl-Karten, Chips
 * ------------------------------------------------------------------------- */

export function CheckboxRow({
  id,
  name,
  checked,
  onChange,
  children,
  describedBy,
  invalid,
  errorKey,
  inputRef,
  className,
}: {
  id?: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  describedBy?: string;
  invalid?: boolean;
  errorKey?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}) {
  return (
    <label className={cx(styles.check, className)} data-checked={checked} data-invalid={invalid || undefined}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        data-error-key={errorKey}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={styles.hiddenInput}
      />
      <span className={styles.checkBox} aria-hidden="true">
        <Icon name="check" size={18} />
      </span>
      <span className={styles.checkLabel}>{children}</span>
    </label>
  );
}

export function ChoiceCard({
  id,
  type,
  name,
  value,
  checked,
  onChange,
  title,
  subtitle,
  icon,
  size = 'md',
  describedBy,
  invalid,
  errorKey,
  className,
}: {
  id?: string;
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  size?: 'lg' | 'md';
  describedBy?: string;
  invalid?: boolean;
  errorKey?: string;
  className?: string;
}) {
  return (
    <label
      className={cx(styles.choice, size === 'lg' ? styles.choiceLarge : styles.choiceMedium, className)}
      data-checked={checked}
      data-invalid={invalid || undefined}
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        data-error-key={errorKey}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={styles.hiddenInput}
      />
      {icon ? (
        <span className={styles.choiceIcon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.choiceText}>
        <span className={styles.choiceTitle}>{title}</span>
        {subtitle ? <span className={styles.choiceSub}>{subtitle}</span> : null}
      </span>
      <span className={cx(styles.choiceMark, type === 'checkbox' && styles.choiceMarkSquare)} aria-hidden="true">
        <Icon name="check" size={16} />
      </span>
    </label>
  );
}

export function Chip({
  id,
  type,
  name,
  value,
  checked,
  onChange,
  children,
  describedBy,
  invalid,
  errorKey,
  className,
}: {
  id?: string;
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  describedBy?: string;
  invalid?: boolean;
  errorKey?: string;
  className?: string;
}) {
  return (
    <label className={cx(styles.chip, className)} data-checked={checked} data-invalid={invalid || undefined}>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        data-error-key={errorKey}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={styles.hiddenInput}
      />
      {checked ? <Icon name="check" size={18} className={styles.chipIcon} /> : null}
      <span>{children}</span>
    </label>
  );
}

/* ---------------------------------------------------------------------------
 * Stepper [−] Wert [+]
 * ------------------------------------------------------------------------- */

export function Stepper({
  id,
  name,
  label,
  value,
  min,
  max,
  onChange,
  unit,
  errorKey,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** z. B. ['Platz', 'Plätze'] */
  unit: [string, string];
  errorKey: string;
  error?: string;
}) {
  const labelId = `${id}-label`;
  const atMin = value <= min;
  const atMax = value >= max;
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };
  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div
        id={id}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId(errorKey) : undefined}
        className={styles.stepper}
      >
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => step(-1)}
          aria-disabled={atMin || undefined}
          aria-label={`Einen ${unit[0]} weniger`}
        >
          <Icon name="minus" size={20} />
        </button>
        <output className={styles.stepValue} aria-live="polite">
          {value}
          <span className="visually-hidden"> {value === 1 ? unit[0] : unit[1]}</span>
        </output>
        <button
          type="button"
          className={styles.stepButton}
          onClick={() => step(1)}
          aria-disabled={atMax || undefined}
          aria-label={`Einen ${unit[0]} mehr`}
        >
          <Icon name="plus" size={20} />
        </button>
        <input type="hidden" name={name} value={value} />
      </div>
      <FieldError errorKey={errorKey} message={error} />
    </div>
  );
}
