import { site } from '@/content/site';

/**
 * Anker-IDs der Sektionen und Einträge der Navigation.
 * Sektionen ohne Inhalt (leere Listen) erscheinen nicht im Menü.
 */
export const SECTION_IDS = {
  story: 'geschichte',
  schedule: 'ablauf',
  locations: 'anfahrt',
  stay: 'uebernachten',
  dresscode: 'dresscode',
  gifts: 'geschenke',
  photos: 'fotos',
  rsvp: 'zusage',
  faq: 'faq',
  contacts: 'kontakt',
} as const;

export interface NavItem {
  id: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: SECTION_IDS.story, label: 'Geschichte', show: site.story.items.length > 0 },
  { id: SECTION_IDS.schedule, label: 'Ablauf', show: site.schedule.items.length > 0 },
  { id: SECTION_IDS.locations, label: 'Anfahrt', show: site.locations.items.length > 0 },
  { id: SECTION_IDS.stay, label: 'Unterkunft', show: site.stay.hotels.length > 0 || site.stay.shuttle.enabled },
  { id: SECTION_IDS.dresscode, label: 'Dresscode', show: true },
  { id: SECTION_IDS.gifts, label: 'Geschenke', show: true },
  { id: SECTION_IDS.photos, label: 'Fotos', show: Boolean(site.photos.albumUrl) },
  { id: SECTION_IDS.faq, label: 'FAQ', show: site.faq.items.length > 0 },
  { id: SECTION_IDS.contacts, label: 'Kontakt', show: site.contacts.people.length > 0 },
]
  .filter((item) => item.show)
  .map(({ id, label }) => ({ id, label }));

/** Der Zusage-Button wird separat hervorgehoben. */
export const RSVP_NAV: NavItem = { id: SECTION_IDS.rsvp, label: 'Zusagen' };
