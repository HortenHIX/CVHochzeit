'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Icon } from '@/components/icons/Icon';
import { buttonClassName } from '@/components/ui/Button';
import type { IconName } from '@/content/site';
import { logout } from '@/lib/auth/actions';
import type { NavItem } from '@/lib/navigation';
import { useActiveSection } from './useActiveSection';
import styles from './Header.module.css';

const ICONS: Record<string, IconName> = {
  geschichte: 'heart',
  ablauf: 'clock',
  anfahrt: 'pin',
  uebernachten: 'bed',
  dresscode: 'shirt',
  geschenke: 'gift',
  fotos: 'camera',
  faq: 'chat',
  kontakt: 'phone',
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Mobiles Vollbild-Menü (unter 75em). Natives <dialog> mit showModal():
 * Hintergrund inert, Esc schließt, zusätzlich Fokusfalle per Tab,
 * Body-Scroll-Sperre und Fokus zurück auf „Menü“.
 */
export function MobileMenu({
  items,
  spyIds,
  rsvpId,
  rsvpLabel,
  brand,
  decoration,
}: {
  items: NavItem[];
  spyIds: readonly string[];
  rsvpId: string;
  rsvpLabel: string;
  brand: ReactNode;
  decoration?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(spyIds);
  const dialogId = useId();
  const titleId = useId();

  // Öffnen/Schließen mit dem Dialog synchronisieren, Body-Scroll sperren.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) {
        dialog.close();
        toggleRef.current?.focus({ preventScroll: true });
      }
      return;
    }
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Beim Wechsel auf die Desktop-Navigation (ab 75em) das Menü schließen.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia('(min-width: 75em)');
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open]);

  const close = () => setOpen(false);

  // Link im Menü: schließen, zum Anker springen, Fokus zurück auf „Menü“.
  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) {
      setOpen(false);
      return;
    }
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
      toggleRef.current?.focus({ preventScroll: true });
    });
  };

  // Fokusfalle: Tab bleibt innerhalb des Menüs.
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.menuToggle}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" size={24} />
        <span className={styles.menuToggleText}>Menü</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.menu}
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onCancel={(event) => {
          // Esc: selbst schließen, damit der Zustand synchron bleibt.
          event.preventDefault();
          close();
        }}
        onClose={() => {
          if (open) setOpen(false);
        }}
      >
        <div className={styles.menuInner}>
          <div className={styles.menuTop}>
            <span className={styles.menuBrand} aria-hidden="true">
              {brand}
            </span>
            <h2 id={titleId} className="visually-hidden">
              Menü
            </h2>
            <button ref={closeRef} type="button" className={styles.menuToggle} onClick={close}>
              <Icon name="close" size={24} />
              <span className={styles.menuToggleText}>Schließen</span>
            </button>
          </div>

          <nav aria-label="Hauptnavigation" className={styles.menuNav}>
            <ul role="list" className={styles.menuList}>
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={styles.menuLink}
                    aria-current={active === item.id ? 'true' : undefined}
                    onClick={(event) => navigate(event, item.id)}
                  >
                    <Icon name={ICONS[item.id] ?? 'leaf'} size={24} className={styles.menuIcon} />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.menuFooter}>
            <a
              href={`#${rsvpId}`}
              className={buttonClassName({ variant: 'primary', size: 'lg', block: true })}
              onClick={(event) => navigate(event, rsvpId)}
            >
              <span>{rsvpLabel}</span>
              <Icon name="arrow-right" size={20} />
            </a>
            <form action={logout} className={styles.menuLogout}>
              <button type="submit" className={buttonClassName({ variant: 'ghost' })}>
                <Icon name="logout" size={20} />
                <span>Abmelden</span>
              </button>
            </form>
          </div>

          {decoration ? (
            <div className={styles.menuDecoration} aria-hidden="true">
              {decoration}
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
