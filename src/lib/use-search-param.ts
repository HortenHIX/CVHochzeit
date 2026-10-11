'use client';

import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/**
 * Liest einen Adress-Parameter im Browser (beim Server-Rendern: '').
 *
 * Für Formulare im statischen Seitengerüst: Läge das Formular hinter
 * <Suspense> (weil der Server `searchParams` liest), würde es nach dem
 * Nachladen ausgetauscht – was man bis dahin eingetippt hat, ginge verloren.
 */
export function useSearchParam(name: string): string {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? '',
    () => '',
  );
}
