'use client';

import { Button } from '@/components/ui/Button';

/** „Drucken“ – öffnet den Druckdialog des Browsers. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <Button variant="primary" size="lg" icon="printer" className={className} onClick={() => window.print()}>
      Drucken
    </Button>
  );
}
