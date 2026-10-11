import { useSyncExternalStore } from 'react';

/**
 * Minutengenaue Uhr für zeitabhängige Anzeigen (Countdown, Zusage-Button).
 *
 * Während des Server-Renderings und der Hydration liefert der Hook `null`,
 * danach die aktuelle Zeit (auf die Minute abgerundet). So gibt es keine
 * Hydration-Unterschiede und keine Zeitabfragen im Prerender.
 *
 * Entwicklung: `?jetzt=2027-06-19T15:00:00%2B02:00` in der Adresse simuliert
 * einen anderen Zeitpunkt (nur mit `next dev`).
 */

const MINUTE = 60_000;

let offsetMs: number | null = null;

function devOffset(): number {
  if (offsetMs !== null) return offsetMs;
  offsetMs = 0;
  if (process.env.NODE_ENV !== 'production') {
    const raw = new URLSearchParams(window.location.search).get('jetzt');
    const simulated = raw ? Date.parse(raw) : Number.NaN;
    if (!Number.isNaN(simulated)) offsetMs = simulated - Date.now();
  }
  return offsetMs;
}

export function nowMs(): number {
  return Date.now() + devOffset();
}

function subscribe(onChange: () => void): () => void {
  let timer = 0;
  const schedule = () => {
    const wait = MINUTE - (nowMs() % MINUTE) + 50;
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, wait);
  };
  schedule();
  // Nach dem Aufwachen eines Tabs (Timer schlafen im Hintergrund) sofort aktualisieren.
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

const getSnapshot = () => Math.floor(nowMs() / MINUTE) * MINUTE;
const getServerSnapshot = () => null;

/** Aktuelle Zeit in ms (auf die Minute abgerundet) – `null` vor dem Mount. */
export function useMinuteClock(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
