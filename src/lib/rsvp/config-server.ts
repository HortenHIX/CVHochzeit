import 'server-only';
import { site } from '@/content/site';
import { formatDate, rsvpDeadlineIso } from '@/lib/format';
import { isSaveTheDate } from '@/lib/site-mode';
import { shuttleTimesText, type RsvpConfig } from './config';

/** Baut die Formular-Einstellungen aus der Inhaltsdatei (nur auf dem Server). */
export function getRsvpConfig(): RsvpConfig {
  const { rsvp, stay, wedding } = site;
  const deadlineIso = rsvpDeadlineIso();
  return {
    rsvp: {
      deadline: rsvp.deadline,
      closeAfterDeadline: rsvp.closeAfterDeadline,
      maxPersons: rsvp.maxPersons,
      allowChildren: rsvp.allowChildren,
      menuOptions: rsvp.menuOptions,
      offerChildMenu: rsvp.offerChildMenu,
      childMenu: rsvp.childMenu,
      childAgeOptions: rsvp.childAgeOptions,
      allergyOptions: rsvp.allergyOptions,
      events: rsvp.events,
      askOvernight: rsvp.askOvernight,
      overnightOptions: rsvp.overnightOptions,
      askSongWish: rsvp.askSongWish,
      successYes: rsvp.successYes,
      successNo: rsvp.successNo,
      privacyNote: rsvp.privacyNote,
      changeContactName: rsvp.changeContactName,
      changeContactPhone: rsvp.changeContactPhone,
    },
    timeZone: wedding.timeZone,
    deadlineIso,
    deadlineText: formatDate(deadlineIso),
    weddingEndIso: wedding.end,
    shuttleEnabled: rsvp.askShuttle && stay.shuttle.enabled,
    shuttleHotels: stay.hotels.filter((h) => h.shuttleStop).map((h) => h.name),
    shuttleTimes: {
      there: shuttleTimesText(stay.shuttle.rides, 'hin'),
      back: shuttleTimesText(stay.shuttle.rides, 'zurueck'),
    },
    allEventIds: rsvp.events.map((e) => e.id),
    fullSite: !isSaveTheDate(),
  };
}
