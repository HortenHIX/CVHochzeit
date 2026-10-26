import { formatDateTime } from '@/lib/format';
import {
  attendingPersons,
  eventLabels,
  findDuplicates,
  foldText,
  hasAllergy,
  menuLabel,
  menuSummary,
  overnightLabel,
  shuttleText,
  type RsvpLabels,
} from '@/lib/rsvp/stats';
import { allergyText, type RsvpEntry } from '@/lib/rsvp/types';
import type { AdminRow } from './types';

/** „11.10.2026, 14:32 Uhr“ */
export function dateTimeLabel(iso: string): string {
  return `${formatDateTime(iso)} Uhr`;
}

/**
 * Aufbereitete Tabellenzeilen für die Client-Komponente. Datumsangaben
 * werden hier (auf dem Server, in der Zeitzone der Hochzeit) formatiert,
 * damit es keine Hydration-Unterschiede gibt.
 */
export function buildRows(entries: readonly RsvpEntry[], labels: RsvpLabels): AdminRow[] {
  const duplicates = findDuplicates(entries);
  const allEvents = labels.events.length;

  return entries.map((entry) => {
    const persons = attendingPersons(entry);
    const events = eventLabels(entry.events, labels);
    const allergyPersons = persons.filter(hasAllergy);
    const allergySummary = [...new Set(allergyPersons.flatMap((p) => allergyText(p).split(', ')))].join(', ');

    return {
      id: entry.id,
      name: entry.name,
      email: entry.email,
      attending: entry.attendance === 'yes',
      personsCount: persons.length,
      childrenCount: persons.filter((p) => p.child).length,
      menuSummary: menuSummary(persons, labels),
      menuSummaryLong: menuSummary(persons, labels, { short: false }),
      eventsShort: events.length === 0 ? '' : events.length === allEvents && allEvents > 1 ? 'alle' : events.join(', '),
      eventLabels: events,
      overnight: overnightLabel(entry.attendance === 'yes' ? entry.overnight : null, labels),
      rooms: entry.attendance === 'yes' ? (entry.rooms ?? null) : null,
      stayNote: entry.attendance === 'yes' ? (entry.stayNote ?? '').trim() : '',
      shuttle: shuttleText(entry),
      shuttleFrom: entry.attendance === 'yes' && entry.shuttle && (entry.shuttle.there || entry.shuttle.back) ? entry.shuttle.from : '',
      allergyCount: allergyPersons.length,
      allergySummary,
      message: entry.message.trim(),
      songWish: entry.songWish.trim(),
      createdAt: entry.createdAt,
      createdLabel: dateTimeLabel(entry.createdAt),
      updatedAt: entry.updatedAt,
      updatedLabel: dateTimeLabel(entry.updatedAt),
      revision: entry.revision,
      duplicates: duplicates.get(entry.id) ?? [],
      persons: persons.map((p) => ({
        name: p.name || entry.name,
        menu: menuLabel(p.menu, labels),
        child: p.child,
        childAge: p.childAge,
        highChair: p.highChair,
        allergies: allergyText(p),
      })),
      search: foldText([entry.name, entry.email, ...persons.map((p) => p.name)].join(' ')),
    };
  });
}
