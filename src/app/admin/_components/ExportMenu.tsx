'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { buttonClassName } from '@/components/ui/Button';
import styles from '../admin.module.css';

const EXPORTS = [
  { href: '/admin/export?art=haushalte', title: 'Haushalte', detail: 'eine Zeile pro Antwort' },
  { href: '/admin/export?art=personen', title: 'Gäste pro Person', detail: '(Catering, Sitzplan)' },
] as const;

/**
 * „CSV exportieren“ mit Popover (design.md G „Popover“): zwei Exporte,
 * Pfeiltasten wechseln, Esc schließt und gibt den Fokus zurück.
 */
export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    links[(index + step + links.length) % links.length].focus();
  };

  return (
    <div
      ref={wrapRef}
      className={styles.exportMenu}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (open && wrapRef.current && !wrapRef.current.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName({ variant: 'primary', className: styles.exportButton })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="download" size={20} />
        <span>CSV exportieren</span>
        <Icon name="chevron-down" size={20} className={styles.exportChevron} />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        className={styles.popover}
        hidden={!open}
        role="group"
        aria-label="Export auswählen"
      >
        <ul role="list" className={styles.popoverList}>
          {EXPORTS.map((item) => (
            <li key={item.href}>
              <a href={item.href} download className={styles.popoverItem} onClick={() => setOpen(false)}>
                <Icon name="download" size={20} className={styles.popoverIcon} />
                <span className={styles.popoverText}>
                  <span className={styles.popoverTitle}>{item.title}</span>{' '}
                  <span className={styles.popoverDetail}>{item.detail}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.popoverNote}>CSV für Excel (Semikolon, UTF-8)</p>
      </div>
    </div>
  );
}
