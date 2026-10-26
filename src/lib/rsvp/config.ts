import type { RoomBooking, RsvpEvent, RsvpOption, ShuttleRide } from '@/content/site';

/**
 * Einstellungen des Zusage-Formulars – genau das, was Formular und Prüfung
 * brauchen. Der Server baut sie aus src/content/site.ts (siehe config-server.ts)
 * und reicht sie an das Formular weiter. So landet im öffentlichen
 * JavaScript des Browsers nicht die komplette Inhaltsdatei (Adressen,
 * Telefonnummern, Bankverbindung …), sondern nur die Zusage-Optionen.
 *
 * Wichtig: Diese Datei darf `site` nicht importieren (nur Typen).
 */
export interface RsvpConfig {
  rsvp: {
    deadline: string;
    closeAfterDeadline: boolean;
    maxPersons: number;
    allowChildren: boolean;
    menuOptions: RsvpOption[];
    offerChildMenu: boolean;
    childMenu: RsvpOption;
    childAgeOptions: string[];
    allergyOptions: string[];
    events: RsvpEvent[];
    askOvernight: boolean;
    overnightOptions: RsvpOption[];
    roomBooking: RoomBooking;
    askSongWish: boolean;
    successYes: string;
    successNo: string;
    privacyNote: string;
    changeContactName: string;
    changeContactPhone: string;
  };
  timeZone: string;
  /** Ende der Rückmeldefrist als ISO-Zeitpunkt */
  deadlineIso: string;
  /** z. B. „30. April 2027“ */
  deadlineText: string;
  /** Ende der Feier als ISO-Zeitpunkt – danach nimmt das Formular keine Antworten mehr an. */
  weddingEndIso: string;
  shuttleEnabled: boolean;
  /** Hotels, an denen der Shuttle hält (Auswahl „Ab welchem Hotel?“) */
  shuttleHotels: string[];
  shuttleTimes: { there: string | null; back: string | null };
  allEventIds: string[];
  /** Komplette Seite online? Sonst (Save the Date) fehlen Kontakt- und Übernachten-Sektion. */
  fullSite: boolean;
}

export function menuLabel(config: RsvpConfig, value: string): string {
  if (value === config.rsvp.childMenu.value) return config.rsvp.childMenu.label;
  return config.rsvp.menuOptions.find((o) => o.value === value)?.label ?? value;
}

export function eventLabel(config: RsvpConfig, id: string): string {
  const event = config.rsvp.events.find((e) => e.id === id);
  return event?.short ?? event?.label ?? id;
}

export function overnightLabel(config: RsvpConfig, value: string): string {
  return config.rsvp.overnightOptions.find((o) => o.value === value)?.label ?? value;
}

/** „2:30“ bzw. „02:30“ → „02:30 Uhr“ (zweistellig wie im Fahrplan) */
export function clockText(time: string): string {
  const [h = '0', m = '00'] = time.split(':');
  return `${h.padStart(2, '0')}:${m} Uhr`;
}

/**
 * Nimmt das Formular keine Antworten mehr an? Nach der Frist nur, wenn so
 * eingestellt – spätestens aber nach dem Ende der Feier.
 */
export function rsvpClosedAt(config: RsvpConfig, nowMs: number): boolean {
  const deadlinePassed = nowMs > new Date(config.deadlineIso).getTime();
  return (config.rsvp.closeAfterDeadline && deadlinePassed) || nowMs > Date.parse(config.weddingEndIso);
}

/** Minuten seit Tagesbeginn; Zeiten vor 6 Uhr gehören zur Nacht danach. */
function minutesOfNight(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  const minutes = Number(h) * 60 + Number(m);
  return Number(h) < 6 ? minutes + 24 * 60 : minutes;
}

/** Shuttle-Zeiten als Text, z. B. „ab 23:30 Uhr, letzte Fahrt 02:30 Uhr“. */
export function shuttleTimesText(rides: readonly Pick<ShuttleRide, 'direction' | 'time'>[], direction: 'hin' | 'zurueck') {
  const times = [...new Set(rides.filter((r) => r.direction === direction).map((r) => r.time))].sort(
    (a, b) => minutesOfNight(a) - minutesOfNight(b),
  );
  if (times.length === 0) return null;
  if (times.length === 1) return clockText(times[0]);
  if (direction === 'zurueck') return `ab ${clockText(times[0])}, letzte Fahrt ${clockText(times[times.length - 1])}`;
  return `ab ${clockText(times[0])}`;
}
