'use client';

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AdminFilters } from './types';

interface FilterContextValue {
  filters: AdminFilters;
  setFilters: (update: Partial<AdminFilters>) => void;
  /** Filter „Mit Allergien“ setzen und zur Tabelle springen (Kachel „Unverträglichkeiten“). */
  showAllergies: () => void;
}

const DEFAULT_FILTERS: AdminFilters = { query: '', segment: 'alle', allergyOnly: false };

const FilterContext = createContext<FilterContextValue | null>(null);

export const RESPONSES_HEADING_ID = 'antworten-titel';

/** Gemeinsamer Filterzustand für Kacheln und Tabelle. */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setState] = useState<AdminFilters>(DEFAULT_FILTERS);

  const setFilters = useCallback((update: Partial<AdminFilters>) => {
    setState((current) => ({ ...current, ...update }));
  }, []);

  const showAllergies = useCallback(() => {
    setState({ query: '', segment: 'alle', allergyOnly: true });
    // Nach dem Rendern zur Tabelle springen; die Überschrift bekommt den Fokus.
    requestAnimationFrame(() => {
      const heading = document.getElementById(RESPONSES_HEADING_ID);
      if (!heading) return;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    });
  }, []);

  const value = useMemo(() => ({ filters, setFilters, showAllergies }), [filters, setFilters, showAllergies]);
  return <FilterContext value={value}>{children}</FilterContext>;
}

export function useAdminFilters(): FilterContextValue {
  const value = use(FilterContext);
  if (!value) throw new Error('useAdminFilters muss innerhalb von <FilterProvider> verwendet werden.');
  return value;
}
