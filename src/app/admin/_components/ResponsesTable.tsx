'use client';

import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { foldText } from '@/lib/rsvp/stats';
import { DeleteControl } from './DeleteControl';
import { RESPONSES_HEADING_ID, useAdminFilters } from './FilterContext';
import styles from './responses.module.css';
import type { AdminRow, Segment } from './types';

type SortKey = 'name' | 'status' | 'persons' | 'children' | 'date';
type SortDir = 'asc' | 'desc';
interface SortState {
  key: SortKey;
  dir: SortDir;
}

const DEFAULT_DIR: Record<SortKey, SortDir> = {
  name: 'asc',
  status: 'asc',
  persons: 'desc',
  children: 'desc',
  date: 'desc',
};

const SORT_OPTIONS: { value: string; label: string; sort: SortState }[] = [
  { value: 'date-desc', label: 'Neueste zuerst', sort: { key: 'date', dir: 'desc' } },
  { value: 'date-asc', label: 'Älteste zuerst', sort: { key: 'date', dir: 'asc' } },
  { value: 'name-asc', label: 'Name A–Z', sort: { key: 'name', dir: 'asc' } },
  { value: 'name-desc', label: 'Name Z–A', sort: { key: 'name', dir: 'desc' } },
  { value: 'persons-desc', label: 'Meiste Personen', sort: { key: 'persons', dir: 'desc' } },
  { value: 'status-asc', label: 'Zusagen zuerst', sort: { key: 'status', dir: 'asc' } },
];

const SORT_LABEL: Record<SortKey, string> = {
  name: 'Name',
  status: 'Status',
  persons: 'Personen',
  children: 'Kinder',
  date: 'Datum',
};

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'zusagen', label: 'Zusagen' },
  { value: 'absagen', label: 'Absagen' },
];

const noopSubscribe = () => () => {};

/** Anzahl Spalten (für die Detailzeile) */
const COLUMN_COUNT = 12;

function compareRows(a: AdminRow, b: AdminRow, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
    case 'status':
      return Number(b.attending) - Number(a.attending);
    case 'persons':
      return a.personsCount - b.personsCount;
    case 'children':
      return a.childrenCount - b.childrenCount;
    case 'date':
      return a.updatedAt.localeCompare(b.updatedAt);
  }
}

/**
 * Alle Antworten: Werkzeugleiste (Suche, Segmente, Chip „Mit Allergien“)
 * und sortierbare Tabelle mit aufklappbaren Details. Unter 48em wird jede
 * Zeile per CSS zur Karte (gleiches Markup, Rollen explizit gesetzt).
 */
export function ResponsesTable({ rows }: { rows: AdminRow[] }) {
  const { filters, setFilters } = useAdminFilters();
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' });
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [removed, setRemoved] = useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  // true erst im Browser nach der Hydration (data-ready für Tests)
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const available = useMemo(() => rows.filter((row) => !removed.has(row.id)), [rows, removed]);

  const counts = useMemo(
    () => ({
      alle: available.length,
      zusagen: available.filter((r) => r.attending).length,
      absagen: available.filter((r) => !r.attending).length,
    }),
    [available],
  );

  const visible = useMemo(() => {
    const words = foldText(filters.query).split(' ').filter(Boolean);
    const filtered = available.filter((row) => {
      if (filters.segment === 'zusagen' && !row.attending) return false;
      if (filters.segment === 'absagen' && row.attending) return false;
      if (filters.allergyOnly && row.allergyCount === 0) return false;
      return words.every((word) => row.search.includes(word));
    });
    const factor = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort(
      (a, b) =>
        factor * compareRows(a, b, sort.key) || a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }),
    );
  }, [available, filters, sort]);

  const filtered = filters.query.trim() !== '' || filters.segment !== 'alle' || filters.allergyOnly;

  const toggle = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onDeleted = useCallback((id: string, name: string) => {
    setRemoved((current) => new Set(current).add(id));
    setAnnouncement(`Die Antwort von „${name}“ wurde gelöscht.`);
    requestAnimationFrame(() => document.getElementById(RESPONSES_HEADING_ID)?.focus());
  }, []);

  const sortBy = (key: SortKey) => {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: DEFAULT_DIR[key] },
    );
  };

  const sortValue = `${sort.key}-${sort.dir}`;
  const resetFilters = () => setFilters({ query: '', segment: 'alle', allergyOnly: false });

  return (
    <section
      aria-labelledby={RESPONSES_HEADING_ID}
      className={styles.section}
      id="antworten"
      data-ready={hydrated || undefined}
    >
      <div className={styles.head}>
        <h2 id={RESPONSES_HEADING_ID} className={styles.title} tabIndex={-1}>
          Alle Antworten
        </h2>
        <p className={styles.count} aria-live="polite" aria-atomic="true">
          {filtered ? (
            <>
              <span className="nums">{visible.length}</span> von <span className="nums">{available.length}</span>{' '}
              {available.length === 1 ? 'Antwort' : 'Antworten'}
            </>
          ) : (
            <>
              <span className="nums">{available.length}</span> {available.length === 1 ? 'Antwort' : 'Antworten'}
            </>
          )}
        </p>
      </div>

      <p className={styles.announce} role="status">
        {announcement ? (
          <>
            <Icon name="check" size={20} />
            <span>{announcement}</span>
          </>
        ) : null}
      </p>

      {available.length === 0 ? (
        <div className={styles.emptyState}>
          <Icon name="envelope" size={32} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Noch keine Antworten eingegangen.</p>
          <p className={styles.emptyText}>Sobald Gäste zu- oder absagen, erscheinen sie hier.</p>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <label htmlFor="admin-suche" className="visually-hidden">
                Name suchen
              </label>
              <Icon name="search" size={20} className={styles.searchIcon} />
              <input
                ref={searchRef}
                id="admin-suche"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Name suchen"
                className={styles.searchInput}
                value={filters.query}
                onChange={(event) => setFilters({ query: event.target.value })}
              />
              {filters.query ? (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => {
                    setFilters({ query: '' });
                    searchRef.current?.focus();
                  }}
                >
                  <Icon name="x" size={20} />
                  <span className="visually-hidden">Suche leeren</span>
                </button>
              ) : null}
            </div>

            <fieldset className={styles.segments}>
              <legend className="visually-hidden">Antworten anzeigen</legend>
              {SEGMENTS.map((segment) => (
                <label key={segment.value} className={styles.segment}>
                  <input
                    type="radio"
                    name="antwort-filter"
                    value={segment.value}
                    checked={filters.segment === segment.value}
                    onChange={() => setFilters({ segment: segment.value })}
                    className={styles.hiddenInput}
                  />
                  <span>{segment.label}</span>
                  <span className={`${styles.segmentCount} nums`}>{counts[segment.value]}</span>
                </label>
              ))}
            </fieldset>

            <label className={styles.chip}>
              <input
                type="checkbox"
                checked={filters.allergyOnly}
                onChange={(event) => setFilters({ allergyOnly: event.target.checked })}
                className={styles.hiddenInput}
              />
              <Icon name={filters.allergyOnly ? 'check' : 'alert'} size={18} className={styles.chipIcon} />
              <span>Mit Allergien</span>
            </label>

            <label className={styles.sortSelect}>
              <span className={styles.sortLabel}>Sortieren</span>
              <select
                value={SORT_OPTIONS.some((o) => o.value === sortValue) ? sortValue : ''}
                onChange={(event) => {
                  const option = SORT_OPTIONS.find((o) => o.value === event.target.value);
                  if (option) setSort(option.sort);
                }}
                className={styles.select}
              >
                {SORT_OPTIONS.some((o) => o.value === sortValue) ? null : (
                  <option value="" disabled>
                    {SORT_LABEL[sort.key]}
                  </option>
                )}
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="search" size={32} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Keine Antwort passt zu diesem Filter.</p>
              <button type="button" className={styles.resetButton} onClick={resetFilters}>
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            <table className={styles.table} role="table">
              <caption className="visually-hidden">
                Alle Antworten, sortiert nach {SORT_LABEL[sort.key]} ({sort.dir === 'asc' ? 'aufsteigend' : 'absteigend'})
              </caption>
              <thead className={styles.thead} role="rowgroup">
                <tr role="row">
                  <th scope="col" role="columnheader" className={`${styles.th} ${styles.cToggle}`}>
                    <span className="visually-hidden">Details</span>
                  </th>
                  <SortHeader label="Name" sortKey="name" sort={sort} onSort={sortBy} className={styles.cName} />
                  <SortHeader label="Status" sortKey="status" sort={sort} onSort={sortBy} className={styles.cStatus} />
                  <SortHeader
                    label="Personen"
                    sortKey="persons"
                    sort={sort}
                    onSort={sortBy}
                    className={`${styles.cPersons} ${styles.numeric}`}
                  />
                  <PlainHeader className={styles.cMenus}>Menüs</PlainHeader>
                  <SortHeader
                    label="Kinder"
                    sortKey="children"
                    sort={sort}
                    onSort={sortBy}
                    className={`${styles.cChildren} ${styles.numeric}`}
                  />
                  <PlainHeader className={styles.cEvents}>Programm</PlainHeader>
                  <PlainHeader className={styles.cOvernight}>Über{'\u00AD'}nachtung</PlainHeader>
                  <PlainHeader className={styles.cShuttle}>Shuttle</PlainHeader>
                  <PlainHeader className={styles.cAllergies}>Allergien</PlainHeader>
                  <PlainHeader className={styles.cMessage}>Nachricht</PlainHeader>
                  <SortHeader label="Datum" sortKey="date" sort={sort} onSort={sortBy} className={styles.cDate} />
                </tr>
              </thead>
              {visible.map((row) => (
                <RowGroup
                  key={row.id}
                  row={row}
                  open={expanded.has(row.id)}
                  onToggle={toggle}
                  onDeleted={onDeleted}
                />
              ))}
            </table>
          )}
        </>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Kopfzellen
 * ------------------------------------------------------------------------- */

function SortIcon({ dir }: { dir: SortDir | null }) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true" focusable="false" className={styles.sortIcon}>
      <path d="M5 1.5 8.5 5.5h-7z" fill="currentColor" opacity={dir === 'asc' ? 1 : 0.3} />
      <path d="M5 12.5 1.5 8.5h7z" fill="currentColor" opacity={dir === 'desc' ? 1 : 0.3} />
    </svg>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th
      scope="col"
      role="columnheader"
      className={`${styles.th} ${className ?? ''}`}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className={styles.sortButton} onClick={() => onSort(sortKey)} data-active={active || undefined}>
        <span>{label}</span>
        <SortIcon dir={active ? sort.dir : null} />
      </button>
    </th>
  );
}

function PlainHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <th scope="col" role="columnheader" className={`${styles.th} ${className ?? ''}`}>
      <span className={styles.thText}>{children}</span>
    </th>
  );
}

/* ---------------------------------------------------------------------------
 * Zeile + Details
 * ------------------------------------------------------------------------- */

function StatusBadge({ attending }: { attending: boolean }) {
  return attending ? (
    <Badge variant="sage" icon="check">
      Zusage
    </Badge>
  ) : (
    <Badge variant="terra" icon="x">
      Absage
    </Badge>
  );
}

function Dash() {
  return (
    <span className={styles.dash} aria-label="keine Angabe">
      –
    </span>
  );
}

/** Teile, die nicht in sich umbrechen („1× Veg.,“ / „1× Kinder“) – nur zwischen den Teilen. */
function NoWrapList({ items, separator }: { items: string[]; separator: string }) {
  return items.map((item, index) => (
    <Fragment key={index}>
      <span className={styles.nowrap}>
        {item}
        {index < items.length - 1 ? separator : ''}
      </span>
      {index < items.length - 1 ? ' ' : ''}
    </Fragment>
  ));
}

function duplicateText(row: AdminRow): string {
  return row.duplicates
    .map((d) => `${d.reason === 'email' ? 'gleiche E-Mail wie' : 'gleicher Name wie'} „${d.name}“`)
    .join(', ');
}

function RowGroup({
  row,
  open,
  onToggle,
  onDeleted,
}: {
  row: AdminRow;
  open: boolean;
  onToggle: (id: string) => void;
  onDeleted: (id: string, name: string) => void;
}) {
  const detailsId = `details-${row.id}`;
  // Bei Absagen bleiben die Zusage-Spalten leer (statt einer Reihe von Strichen).
  const missing = row.attending ? <Dash /> : null;

  // Klick auf die Zeile klappt auf (Komfort mit der Maus) – nicht bei Links,
  // Buttons oder markiertem Text. Tastatur: der Chevron-Button.
  const onRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, select, label')) return;
    if (window.getSelection()?.toString()) return;
    onToggle(row.id);
  };

  return (
    <tbody className={styles.group} data-entry={row.id} data-open={open || undefined} role="rowgroup">
      <tr className={styles.row} onClick={onRowClick} role="row">
        <td className={`${styles.td} ${styles.cToggle}`} role="cell">
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => onToggle(row.id)}
          >
            <Icon name="chevron-down" size={20} className={styles.chevron} />
            <span className={styles.toggleText}>Details</span>
            <span className="visually-hidden"> zu {row.name}</span>
          </button>
        </td>
        <th scope="row" role="rowheader" className={`${styles.td} ${styles.cName}`}>
          <span className={styles.name}>{row.name}</span>
          {row.duplicates.length > 0 ? (
            <span className={styles.dupHint} title={duplicateText(row)}>
              <Icon name="alert" size={14} />
              mögliches Duplikat
            </span>
          ) : null}
        </th>
        <td className={`${styles.td} ${styles.cStatus}`} role="cell">
          <StatusBadge attending={row.attending} />
        </td>
        <td
          className={`${styles.td} ${styles.cPersons} ${styles.numeric}`}
          role="cell"
          data-empty={row.attending ? undefined : true}
        >
          {row.attending ? (
            <>
              <span className="nums">{row.personsCount}</span>
              <span className={styles.unit}> {row.personsCount === 1 ? 'Person' : 'Personen'}</span>
            </>
          ) : (
            missing
          )}
        </td>
        <td className={`${styles.td} ${styles.cMenus}`} role="cell">
          {row.menuSummary ? (
            <span title={row.menuSummaryLong}>
              <NoWrapList items={row.menuSummary.split(', ')} separator="," />
            </span>
          ) : (
            missing
          )}
        </td>
        <td className={`${styles.td} ${styles.cChildren} ${styles.numeric}`} role="cell">
          {row.childrenCount > 0 ? <span className="nums">{row.childrenCount}</span> : missing}
        </td>
        <td className={`${styles.td} ${styles.cEvents}`} role="cell">
          {row.eventsShort ? <span title={row.eventLabels.join(', ')}>{row.eventsShort}</span> : missing}
        </td>
        <td className={`${styles.td} ${styles.cOvernight}`} role="cell">
          {row.overnight || missing}
        </td>
        <td className={`${styles.td} ${styles.cShuttle}`} role="cell">
          {row.shuttle ? <NoWrapList items={row.shuttle.split(' · ')} separator=" ·" /> : missing}
        </td>
        <td className={`${styles.td} ${styles.cAllergies}`} role="cell" data-empty={row.allergyCount === 0 || undefined}>
          {row.allergyCount > 0 ? (
            <span className={styles.allergy} title={row.allergySummary}>
              <Icon name="alert" size={18} className={styles.allergyIcon} title="Unverträglichkeit" />
              <span className={styles.allergyText}>{row.allergySummary}</span>
            </span>
          ) : (
            missing
          )}
        </td>
        <td className={`${styles.td} ${styles.cMessage}`} role="cell">
          {row.message ? (
            <span className={styles.message} title={row.message}>
              {row.message}
            </span>
          ) : (
            <Dash />
          )}
        </td>
        <td className={`${styles.td} ${styles.cDate}`} role="cell">
          <time dateTime={row.updatedAt} className={styles.date}>
            {row.updatedLabel}
          </time>
          {row.revision > 0 ? <span className={styles.changed}>geändert</span> : null}
        </td>
      </tr>
      <tr id={detailsId} className={styles.detailsRow} hidden={!open} role="row">
        <td colSpan={COLUMN_COUNT} className={styles.detailsCell} role="cell">
          {open ? <RowDetails row={row} onDeleted={onDeleted} /> : null}
        </td>
      </tr>
    </tbody>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factTerm}>{term}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

function RowDetails({ row, onDeleted }: { row: AdminRow; onDeleted: (id: string, name: string) => void }) {
  return (
    <div className={styles.details}>
      {row.duplicates.length > 0 ? (
        <p className={styles.dupNote}>
          <Icon name="alert" size={20} className={styles.dupNoteIcon} />
          <span>
            <strong>Mögliches Duplikat:</strong> {duplicateText(row)}. Bitte prüfen und die überflüssige Antwort
            löschen.
          </span>
        </p>
      ) : null}

      <div className={row.attending ? styles.detailsGrid : undefined}>
        {row.attending ? (
          <div>
            <h3 className={styles.detailsTitle}>
              {row.personsCount === 1 ? '1 Person' : `${row.personsCount} Personen`}
            </h3>
            <ul role="list" className={styles.persons}>
              {row.persons.map((person, index) => (
                <li key={index} className={styles.person}>
                  <p className={styles.personName}>
                    <Icon name={person.child ? 'child' : 'user'} size={20} className={styles.personIcon} />
                    <span>{person.name}</span>
                  </p>
                  {person.child ? (
                    <p className={styles.personTags}>
                      <span className={styles.personTag}>Kind{person.childAge ? ` · ${person.childAge}` : ''}</span>
                      {person.highChair ? <span className={styles.personTag}>Hochstuhl</span> : null}
                    </p>
                  ) : null}
                  <dl className={styles.personFacts}>
                    <Fact term="Menü">{person.menu}</Fact>
                    <Fact term="Unverträglichkeiten">
                      {person.allergies ? (
                        <span className={styles.allergyStrong}>
                          <Icon name="alert" size={16} className={styles.allergyIcon} />
                          {person.allergies}
                        </span>
                      ) : (
                        'keine'
                      )}
                    </Fact>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className={styles.detailsTitle}>{row.attending ? 'Haushalt' : 'Absage'}</h3>
          <dl className={styles.facts}>
            <Fact term="E-Mail">
              {row.email ? (
                <a href={`mailto:${row.email}`} className={`${styles.mail} break-anywhere`}>
                  {row.email}
                </a>
              ) : (
                'nicht angegeben'
              )}
            </Fact>
            {row.attending ? (
              <>
                <Fact term="Programm">{row.eventLabels.length > 0 ? row.eventLabels.join(', ') : 'keine Angabe'}</Fact>
                <Fact term="Übernachtung">{row.overnight || 'keine Angabe'}</Fact>
                {row.rooms ? <Fact term="Zimmer">{row.rooms}</Fact> : null}
                {row.stayNote ? <Fact term="Übernachtungswünsche">{row.stayNote}</Fact> : null}
                <Fact term="Shuttle">
                  {row.shuttle ? (
                    <>
                      {row.shuttle}
                      {row.shuttleFrom ? (
                        <>
                          <br />
                          ab {row.shuttleFrom}
                        </>
                      ) : null}
                    </>
                  ) : (
                    'nein'
                  )}
                </Fact>
              </>
            ) : null}
            {row.songWish ? <Fact term="Musikwunsch">{row.songWish}</Fact> : null}
            {row.message ? (
              <Fact term="Nachricht">
                <span className={styles.preLine}>{row.message}</span>
              </Fact>
            ) : null}
            <Fact term="Eingegangen">
              <time dateTime={row.createdAt}>{row.createdLabel}</time>
            </Fact>
            {row.revision > 0 ? (
              <Fact term="Zuletzt geändert">
                <time dateTime={row.updatedAt}>{row.updatedLabel}</time>{' '}
                <span className={styles.muted}>({row.revision === 1 ? 'einmal' : `${row.revision}-mal`})</span>
              </Fact>
            ) : null}
          </dl>
        </div>
      </div>

      <DeleteControl id={row.id} name={row.name} onDeleted={onDeleted} />
    </div>
  );
}

