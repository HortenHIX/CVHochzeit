'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Ranke der Zeitleiste. Wo `animation-timeline: view()` unterstützt wird,
 * „wächst“ sie per CSS beim Scrollen. Sonst blendet sie einmalig ein, sobald
 * sie in den Viewport kommt (IntersectionObserver, 1.2 s). Ohne JavaScript
 * oder mit reduzierter Bewegung steht sie sofort da.
 */
export function StoryVine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (CSS.supports?.('animation-timeline: view()')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setState('hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={className} data-fallback={state} aria-hidden="true" />;
}
