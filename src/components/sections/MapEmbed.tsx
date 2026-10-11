'use client';

import Link from 'next/link';
import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import styles from './Locations.module.css';

const PREF_KEY = 'cv-karten-immer-laden';
const PREF_EVENT = 'cv-karten-pref';

function readPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) === '1';
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    if (on) window.localStorage.setItem(PREF_KEY, '1');
    else window.localStorage.removeItem(PREF_KEY);
  } catch {
    // Privater Modus o. Ä.: dann eben nur für diesen Besuch
  }
  window.dispatchEvent(new Event(PREF_EVENT));
}

function subscribePref(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(PREF_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(PREF_EVENT, onChange);
  };
}

export interface MapPlace {
  name: string;
  /** Link zur größeren Karte (OpenStreetMap) */
  href: string;
}

/**
 * Karte mit Einwilligung (design.md F5): Bis zum Klick nur eine gezeichnete
 * Fläche (E15) mit Hinweis. Erst danach wird das OpenStreetMap-iframe geladen.
 * „Karten künftig immer laden“ merkt sich die Wahl im Browser (localStorage).
 */
export function MapEmbed({
  src,
  title,
  places,
  markerName,
  placeholder,
}: {
  src: string;
  title: string;
  places: MapPlace[];
  /** Name des Orts mit der Markierung (das Einbettungs-Widget kann nur eine) */
  markerName?: string;
  placeholder: ReactNode;
}) {
  const always = useSyncExternalStore(subscribePref, readPref, () => false);
  const [shown, setShown] = useState(false);
  const [remember, setRemember] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const loaded = shown || always;

  function show() {
    if (remember) writePref(true);
    setShown(true);
    // Fokus nicht verlieren, wenn der Button verschwindet
    requestAnimationFrame(() => frameRef.current?.focus());
  }

  function hide() {
    writePref(false);
    setShown(false);
    setRemember(false);
    requestAnimationFrame(() => frameRef.current?.focus());
  }

  return (
    <div className={`${styles.map} no-print`}>
      <div
        ref={frameRef}
        tabIndex={-1}
        className={styles.mapFrame}
        data-loaded={loaded ? '' : undefined}
        role="region"
        aria-label="Karte"
      >
        {loaded ? (
          <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer" className={styles.iframe} />
        ) : (
          <>
            <div className={styles.mapArt}>{placeholder}</div>
            <div className={styles.consent}>
              <Button variant="secondary" icon="pin" onClick={show}>
                Karte anzeigen
              </Button>
              <p className={styles.consentText}>
                Beim Laden werden Daten (u.&nbsp;a. eure IP-Adresse) an OpenStreetMap übertragen. Mehr in der{' '}
                <Link href="/datenschutz#ds-karte">Datenschutzerklärung</Link>.
              </p>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  className={styles.checkInput}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className={styles.checkBox} aria-hidden="true">
                  <Icon name="check" size={16} />
                </span>
                <span>Karten künftig immer laden</span>
              </label>
            </div>
          </>
        )}
      </div>

      {loaded ? (
        <div className={styles.mapFooter}>
          {markerName ? (
            <p className={styles.mapNote}>
              <Icon name="pin" size={16} /> Markiert: {markerName}
            </p>
          ) : null}
          <ul className={styles.mapLinks} role="list">
            {places.map((p) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                  Größere Karte{places.length > 1 ? `: ${p.name}` : ''}
                  <Icon name="external" size={16} />
                  <span className="visually-hidden"> (öffnet in neuem Tab)</span>
                </a>
              </li>
            ))}
            <li>
              <button type="button" className={styles.mapLink} onClick={hide}>
                Karte ausblenden
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
