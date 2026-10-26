import { Suspense } from 'react';
import { CornerBouquet, Monogram } from '@/components/illustrations';
import { site } from '@/content/site';
import { rsvpDeadlineIso } from '@/lib/format';
import { NAV_ITEMS, RSVP_NAV, SECTION_IDS } from '@/lib/navigation';
import { getOwnRsvp } from '@/lib/rsvp/own';
import { DesktopNav } from './DesktopNav';
import { HeaderRsvpCta, type RsvpState } from './HeaderRsvpCta';
import { HeaderShell } from './HeaderShell';
import { MobileMenu } from './MobileMenu';
import styles from './Header.module.css';

/** Alle Sektionen, die der Scrollspy kennt (inkl. Hero und Zusage). */
const SPY_IDS = ['start', ...Object.values(SECTION_IDS)];

/** Die Desktop-Leiste zeigt die acht Inhalts-Sektionen (Kontakt nur im Menü, siehe design.md F1). */
const DESKTOP_ITEMS = NAV_ITEMS.filter((item) => item.id !== SECTION_IDS.contacts);

/**
 * Ab wann der „Zusagen“-Button ohne Antwort ausgeblendet wird: nach der Feier
 * und – falls die Zusage danach geschlossen ist – nach der Frist.
 */
const CTA_HIDE_AFTER = (() => {
  const end = new Date(site.wedding.end).getTime();
  const deadline = new Date(rsvpDeadlineIso()).getTime();
  return new Date(site.rsvp.closeAfterDeadline ? Math.min(end, deadline) : end).toISOString();
})();

/**
 * Sticky Header mit Skip-Link, Monogramm, Desktop-Navigation (ab 75em),
 * Zusage-Button und mobilem Vollbild-Menü (design.md F1).
 */
export function Header({ minimal = false }: { minimal?: boolean }) {
  return (
    <>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <HeaderShell>
        <div className={styles.bar}>
          <a href="#start" className={styles.brand}>
            <Monogram variant="small" size={44} label="Christoph und Vera – zum Seitenanfang" />
          </a>
          {minimal ? null : <DesktopNav items={DESKTOP_ITEMS} spyIds={SPY_IDS} />}
          <div className={styles.actions}>
            <Suspense fallback={<HeaderActions state="none" minimal={minimal} />}>
              <HeaderActionsWithRsvp minimal={minimal} />
            </Suspense>
          </div>
        </div>
      </HeaderShell>
    </>
  );
}

/** Liest die eigene Antwort dieses Geräts (Cookie) – deshalb hinter <Suspense>. */
async function HeaderActionsWithRsvp({ minimal }: { minimal: boolean }) {
  const own = await getOwnRsvp();
  const state: RsvpState = own ? (own.attendance === 'yes' ? 'yes' : 'no') : 'none';
  return <HeaderActions state={state} minimal={minimal} />;
}

function HeaderActions({ state, minimal }: { state: RsvpState; minimal: boolean }) {
  return (
    <>
      <HeaderRsvpCta state={state} hideAfter={CTA_HIDE_AFTER} href={`#${RSVP_NAV.id}`} />
      {minimal ? null : (
      <MobileMenu
        items={NAV_ITEMS}
        spyIds={SPY_IDS}
        rsvpId={RSVP_NAV.id}
        rsvpLabel={state === 'yes' ? 'Eure Zusage ansehen' : state === 'no' ? 'Eure Antwort ansehen' : 'Jetzt zusagen'}
        rsvpHideAfter={state === 'none' ? CTA_HIDE_AFTER : undefined}
        brand={<Monogram variant="small" size={44} />}
        decoration={<CornerBouquet corner="bottom-right" size={160} className={styles.menuBouquet} />}
      />
      )}
    </>
  );
}
