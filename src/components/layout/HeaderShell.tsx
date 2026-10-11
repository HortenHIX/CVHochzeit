'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Header.module.css';

/**
 * Rahmen des Sticky Headers. Die untere Haarlinie erscheint erst, wenn mehr
 * als 8 px gescrollt wurde (IntersectionObserver auf einem Sentinel).
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={styles.header} data-scrolled={scrolled ? 'true' : undefined}>
        {children}
      </header>
    </>
  );
}
