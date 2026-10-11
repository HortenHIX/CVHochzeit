'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './Faq.module.css';

const noopSubscribe = () => () => {};

/**
 * Akkordeon-Hülle mit „Alle aufklappen / Alle zuklappen“. Die Einträge
 * (natives <details> ohne `name`) kommen fertig vom Server. Ohne JavaScript
 * fehlt nur der Sammel-Button. Beim Drucken werden alle Einträge geöffnet und
 * danach wieder in den vorherigen Zustand versetzt.
 */
export function FaqAccordion({ id, count, children }: { id: string; count: number; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [openCount, setOpenCount] = useState(0);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => setOpenCount(list.querySelectorAll('details[open]').length);
    // `toggle` blubbert nicht – daher in der Capture-Phase lauschen.
    list.addEventListener('toggle', update, true);

    let reopened: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      reopened = Array.from(list.querySelectorAll<HTMLDetailsElement>('details:not([open])'));
      reopened.forEach((d) => (d.open = true));
    };
    const afterPrint = () => {
      reopened.forEach((d) => (d.open = false));
      reopened = [];
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      list.removeEventListener('toggle', update, true);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const allOpen = count > 0 && openCount >= count;

  function toggleAll() {
    listRef.current?.querySelectorAll('details').forEach((d) => {
      d.open = !allOpen;
    });
  }

  return (
    <>
      <div className={`${styles.toolbar} no-print`}>
        {hydrated && count > 1 ? (
          <Button
            variant="ghost"
            icon={allOpen ? 'minus' : 'plus'}
            onClick={toggleAll}
            aria-controls={id}
            className={styles.toggleAll}
          >
            {allOpen ? 'Alle zuklappen' : 'Alle aufklappen'}
          </Button>
        ) : null}
      </div>
      <div id={id} ref={listRef} className={styles.list}>
        {children}
      </div>
    </>
  );
}
