'use client';

import { createContext, use, type ReactNode } from 'react';
import type { RsvpConfig } from '@/lib/rsvp/config';

const RsvpConfigContext = createContext<RsvpConfig | null>(null);

/** Stellt die Formular-Einstellungen (vom Server) allen Zusage-Komponenten bereit. */
export function RsvpConfigProvider({ value, children }: { value: RsvpConfig; children: ReactNode }) {
  return <RsvpConfigContext value={value}>{children}</RsvpConfigContext>;
}

export function useRsvpConfig(): RsvpConfig {
  const config = use(RsvpConfigContext);
  if (!config) throw new Error('useRsvpConfig muss innerhalb von <RsvpConfigProvider> verwendet werden.');
  return config;
}
