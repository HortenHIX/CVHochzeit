import type { IconName } from '@/content/site';

/** PLATZHALTER – das vollständige Icon-Set folgt im Build-Schritt. */
export function Icon({
  name,
  size = 24,
  className,
  title,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /** Wenn gesetzt, wird das Icon für Screenreader beschriftet, sonst ist es dekorativ. */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      data-icon={name}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true, focusable: false })}
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
