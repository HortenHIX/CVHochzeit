import { useEffect, useState } from 'react';

/**
 * Scrollspy: liefert die ID der Sektion, die gerade die Lesezeile
 * (ca. 35 % unter der Oberkante des Fensters) schneidet.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      // In Dokument-Reihenfolge sortieren
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (sections.length === 0) return;

    const intersecting = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target.id, entry.isIntersecting);
        const current = sections.filter((s) => intersecting.get(s.id)).pop();
        setActive(current ? current.id : null);
      },
      { rootMargin: '-35% 0px -64% 0px', threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
