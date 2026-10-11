'use client';

import { Button } from '@/components/ui/Button';

const CLASS = 'print-infosheet';

/**
 * „Ablauf & Anfahrt als Infoblatt drucken“: setzt `body.print-infosheet`
 * (Druck-Regeln in Locations.module.css) und öffnet den Druckdialog.
 * Nach dem Drucken wird die Klasse wieder entfernt.
 */
export function PrintInfoSheet({ className }: { className?: string }) {
  function print() {
    const body = document.body;
    const cleanup = () => {
      body.classList.remove(CLASS);
      window.removeEventListener('afterprint', cleanup);
    };
    body.classList.add(CLASS);
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  return (
    <Button variant="ghost" icon="printer" onClick={print} className={className}>
      Ablauf &amp; Anfahrt als Infoblatt drucken
    </Button>
  );
}
