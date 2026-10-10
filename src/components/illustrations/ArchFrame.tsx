import type { ReactNode } from 'react';

/**
 * PLATZHALTER – E5 Doppelbogen-Rahmen (CSS). Rahmt Inhalte im Bogen,
 * z. B. Login-Karte und Hero.
 */
export function ArchFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{ borderRadius: '999px 999px 16px 16px', border: '1px solid var(--c-line)' }}>
      {children}
    </div>
  );
}
