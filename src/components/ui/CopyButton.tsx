'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import styles from './CopyButton.module.css';

/**
 * Kopiert einen Text in die Zwischenablage. Das Icon wechselt 2 s auf ein
 * Häkchen, zusätzlich erscheint ein Toast („Adresse kopiert“).
 *
 * - `variant="icon"`: runder 44-px-Icon-Button (aria-label = label)
 * - `variant="ghost"`: Text-Button mit Icon
 */
export function CopyButton({
  value,
  label,
  toast = 'Kopiert',
  variant = 'icon',
  className,
}: {
  value: string;
  /** Beschriftung bzw. aria-label, z. B. „Adresse kopieren“ */
  label: string;
  /** Text im Toast, z. B. „Adresse kopiert“ */
  toast?: string;
  variant?: 'icon' | 'ghost';
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback für ältere Browser
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } finally {
        area.remove();
      }
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={[variant === 'icon' ? styles.iconButton : styles.ghost, className].filter(Boolean).join(' ')}
        aria-label={variant === 'icon' ? label : undefined}
        title={variant === 'icon' ? label : undefined}
      >
        <Icon name={copied ? 'check' : 'copy'} size={20} />
        {variant === 'ghost' ? <span>{label}</span> : null}
      </button>
      <span role="status" aria-live="polite" className={copied ? styles.toast : 'visually-hidden'}>
        {copied ? toast : ''}
      </span>
    </>
  );
}
