'use client';

import { useEffect, useRef, type SVGProps } from 'react';

/**
 * SVG-Wurzel für animierte Motive: pausiert Wiegen & Co., solange das Motiv
 * nicht im Viewport ist (animation-play-state per IntersectionObserver).
 * Der Inhalt wird weiterhin auf dem Server gerendert.
 */
export function AnimatedSvg(props: SVGProps<SVGSVGElement>) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) el.toggleAttribute('data-paused', !entry.isIntersecting);
      },
      { rootMargin: '64px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <svg ref={ref} {...props} />;
}
