'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons/Icon';
import styles from './Footer.module.css';

function subscribe(onChange: () => void): () => void {
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onChange();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

const getSnapshot = () => window.scrollY > window.innerHeight * 2;
const getServerSnapshot = () => false;

/** Schwebender „Nach oben“-Button – erscheint nach zwei Bildschirmhöhen. */
export function BackToTop() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // Fokus an den Seitenanfang (Skip-Link bzw. erstes Element im Header)
    const first = document.querySelector<HTMLElement>('header a[href], main a[href]');
    first?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className={styles.toTop}
      data-visible={visible ? 'true' : undefined}
      aria-label="Nach oben"
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      onClick={toTop}
    >
      <Icon name="chevron-down" size={22} className={styles.toTopIcon} />
    </button>
  );
}
