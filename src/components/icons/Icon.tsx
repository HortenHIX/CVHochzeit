import type { ReactNode } from 'react';
import type { IconName } from '@/content/site';
import styles from './Icon.module.css';

/**
 * E16 Icon-Set: viewBox 24, Kontur currentColor 1.75, runde Enden, höchstens
 * drei Pfade je Icon, 2 px Rand. Die Farbe erbt vom Text (Standard sage-700
 * über die umgebende Komponente).
 *
 * `Record<IconName, …>` erzwingt, dass jedes Icon aus ICON_NAMES gezeichnet ist.
 */
const ICONS: Record<IconName, ReactNode> = {
  /* ---------- Navigation & Aktionen ---------- */
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'arrow-right': <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7L7 17" />,
  alert: (
    <>
      <path d="M10.3 4.2L2.9 17.3a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4.5M12 17.1v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 6.5h16M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6 6.5l.9 12.6a1.5 1.5 0 0 0 1.5 1.4h7.2a1.5 1.5 0 0 0 1.5-1.4L18 6.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11.5M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4 15.5v3a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" />
      <path d="M4 15.5v3a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3L20 20" />
    </>
  ),
  filter: <path d="M4 5h16l-6.2 7.6v5.6l-3.6 1.8v-7.4z" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8.5V3.5h10v5" />
      <path d="M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5.5A1.5 1.5 0 0 1 5 8.5h14a1.5 1.5 0 0 1 1.5 1.5v5.5A1.5 1.5 0 0 1 19 17h-2" />
      <path d="M7 13.5h10v7H7zM16.5 11.5h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9.5 20.5h-4A1.5 1.5 0 0 1 4 19V5a1.5 1.5 0 0 1 1.5-1.5h4" />
      <path d="M15.5 16.5L20 12l-4.5-4.5M20 12H9.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2L20 9.4M20 4.5v4.9h-4.9" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2L4 14.6M4 19.5v-4.9h4.9" />
    </>
  ),

  /* ---------- Kontakt ---------- */
  phone: (
    <path d="M5.2 3.6h3.1c.4 0 .8.3.9.7l1.1 3.6c.1.4 0 .8-.3 1.1L8.4 10.4a11.6 11.6 0 0 0 5.2 5.2l1.4-1.6c.3-.3.7-.4 1.1-.3l3.6 1.1c.4.1.7.5.7.9v3.1c0 .9-.7 1.6-1.6 1.6C10.4 20.4 3.6 13.6 3.6 5.2c0-.9.7-1.6 1.6-1.6z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.6 7.2L12 13l8.4-5.8" />
    </>
  ),
  envelope: (
    <>
      <path d="M6 12V4.5h12V12" />
      <path d="M3 10.2V19a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 19v-8.8" />
      <path d="M3 10.2l9 6.3 9-6.3M9.5 7.8h5M9.5 10.2h5" />
    </>
  ),
  chat: (
    <>
      <path d="M20.5 11.5a8 8 0 0 1-11.8 7L4 19.8l1.3-4.4a8 8 0 1 1 15.2-3.9z" />
      <path d="M8.6 11.8h.01M12.2 11.8h.01M15.8 11.8h.01" />
    </>
  ),

  /* ---------- Termine & Orte ---------- */
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8 13.8h.01M12 13.8h.01M16 13.8h.01M8 17.2h.01M12 17.2h.01" />
    </>
  ),
  'calendar-plus': (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M12 12.8v5M9.5 15.3h5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  church: (
    <>
      <path d="M12 2.5v4M10.3 4.2h3.4" />
      <path d="M6.5 20.5v-9.2L12 6.5l5.5 4.8v9.2" />
      <path d="M3.5 20.5h17M10.2 20.5v-3.3a1.8 1.8 0 0 1 3.6 0v3.3M12 12.3v.01" />
    </>
  ),
  barn: (
    <>
      <path d="M3.5 20.5v-9.8L6.2 6 12 3.2 17.8 6l2.7 4.7v9.8z" />
      <path d="M8.5 20.5V14h7v6.5M8.5 14l7 6.5M15.5 14l-7 6.5" />
      <path d="M10.5 9.6h3" />
    </>
  ),
  mountain: (
    <>
      <path d="M2.5 19.5L9 8.5l3.6 6 2.4-3.5 6.5 8.5z" />
      <path d="M6.6 12.6l1.6.9L9.6 12l1.4 1" />
      <circle cx="17" cy="6" r="2" />
    </>
  ),
  wave: (
    <path d="M2.5 8.5c1.6 0 2.4-1.5 4.75-1.5S10.4 8.5 12 8.5s2.4-1.5 4.75-1.5 3.15 1.5 4.75 1.5M2.5 13c1.6 0 2.4-1.5 4.75-1.5S10.4 13 12 13s2.4-1.5 4.75-1.5S19.9 13 21.5 13M2.5 17.5c1.6 0 2.4-1.5 4.75-1.5S10.4 17.5 12 17.5s2.4-1.5 4.75-1.5 3.15 1.5 4.75 1.5" />
  ),
  city: (
    <>
      <path d="M3 20.5h18M10.5 20.5V4.5h8v16" />
      <path d="M4.5 20.5V10l6-2.5" />
      <path d="M13.5 8h2M13.5 11.5h2M13.5 15h2M7.2 13h.01M7.2 16.5h.01" />
    </>
  ),

  /* ---------- Anreise & Unterkunft ---------- */
  car: (
    <>
      <path d="M4 17.5v-5l2-5.3A1.6 1.6 0 0 1 7.5 6h9a1.6 1.6 0 0 1 1.5 1.2l2 5.3v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1.5h-9v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M4 12.5h16M7.5 14.5h.01M16.5 14.5h.01" />
    </>
  ),
  taxi: (
    <>
      <path d="M4 18.5v-5l2-5.3A1.6 1.6 0 0 1 7.5 7h9a1.6 1.6 0 0 1 1.5 1.2l2 5.3v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17h-9v1.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M4 13.5h16M7.5 15.5h.01M16.5 15.5h.01" />
      <path d="M9.8 7V3.8h4.4V7" />
    </>
  ),
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M9.5 17V7.5h3.3a2.8 2.8 0 0 1 0 5.6H9.5" />
    </>
  ),
  train: (
    <>
      <path d="M8 3.5h8a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6.5a3 3 0 0 1 3-3z" />
      <path d="M5 10.5h14M8.8 13.8h.01M15.2 13.8h.01" />
      <path d="M8.5 20.5l1.8-3.5M15.5 20.5l-1.8-3.5" />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="3" width="14" height="15" rx="2.5" />
      <path d="M5 12h14M5 7h14M8.4 15h.01M15.6 15h.01" />
      <path d="M3 8v3M21 8v3M7.5 18v2.5M16.5 18v2.5" />
    </>
  ),
  plane: (
    <path
      transform="rotate(45 12 12)"
      d="M12 2.5c.9 0 1.5.9 1.5 2V9.4l6.5 4.1v1.9l-6.5-2v4.4l2.2 1.7v1.5L12 20.2l-3.7.8v-1.5l2.2-1.7v-4.4l-6.5 2v-1.9l6.5-4.1V4.5c0-1.1.6-2 1.5-2z"
    />
  ),
  accessibility: (
    <>
      <circle cx="11" cy="4.6" r="1.7" />
      <path d="M11 8v5.5h5l2.5 5.5 1.5-.6M11 10.6h4.5" />
      <path d="M8.2 11a5.2 5.2 0 1 0 7.2 6.6" />
    </>
  ),
  bed: (
    <>
      <path d="M3 5.5v14M3 15.5h18M21 19.5v-7a2 2 0 0 0-2-2h-8v5" />
      <circle cx="7" cy="12" r="1.8" />
    </>
  ),
  euro: (
    <>
      <path d="M17.5 7a6.4 6.4 0 1 0 0 10" />
      <path d="M4.5 10.5h8M4.5 13.5h8" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.4V5A1.5 1.5 0 0 1 5 3.5h7.4a1.5 1.5 0 0 1 1.1.4l6.8 6.8a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0L4 13.5a1.5 1.5 0 0 1-.5-1.1z" />
      <circle cx="8.2" cy="8.2" r="1.6" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15.5" r="4.2" />
      <path d="M11 12.5l9-9M16.8 6.7l2.6 2.6M14.6 8.9l2 2" />
    </>
  ),

  /* ---------- Programm ---------- */
  rings: (
    <>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="M15 4l2 2-2 2.5-2-2.5z" />
    </>
  ),
  glasses: (
    <>
      <path transform="rotate(6 8 19.5)" d="M6.1 3.5h3.8l-.35 6.4a1.55 1.55 0 0 1-3.1 0zM8 11.5v8M5.9 19.5h4.2" />
      <path transform="rotate(-6 16 19.5)" d="M14.1 3.5h3.8l-.35 6.4a1.55 1.55 0 0 1-3.1 0zM16 11.5v8M13.9 19.5h4.2" />
      <path d="M12 1.4v1M9.9 2l.45.75M14.1 2l-.45.75" />
    </>
  ),
  utensils: (
    <>
      <path d="M6.5 3v5a2.5 2.5 0 0 0 5 0V3M9 3v18" />
      <path d="M17.5 21V3c-2.2 1.2-3.2 4-3.2 7.6 0 1 .5 1.6 1.5 1.6h1.7" />
    </>
  ),
  cake: (
    <>
      <path d="M3.5 20.5h17M5 20.5V14a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 19 14v6.5" />
      <path d="M5 16.2c1.2 0 1.8-1 3.5-1s2.3 1 3.5 1 1.8-1 3.5-1 2.3 1 3.5 1" />
      <path d="M12 12.5V9.6M12 7.1c1-.9 1-2 0-3.1-1 1.1-1 2.2 0 3.1z" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5.6l11-2.1V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  coffee: (
    <>
      <path d="M4.5 10h12v5.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5z" />
      <path d="M16.5 11.5h1.3a2.5 2.5 0 0 1 0 5h-1.6" />
      <path d="M8.5 3.5c-.8.9-.8 1.8 0 2.8M12.5 3.5c-.8.9-.8 1.8 0 2.8" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.6L9 4.5h6L16.4 7H19a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="M3.5 17l5-5 4 4 2.5-2.5 5.5 5.5" />
    </>
  ),
  qr: (
    <>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M7 7h.01M17 7h.01M7 17h.01" />
      <path d="M14 14h2.5v2.5M20 14v.01M14 20h.01M17.5 20H20v-2.5M17.2 17.2h.01" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12M12 8v13" />
      <path d="M12 8c-1.4-3.6-5.2-4-4.5-1.4C7.9 8 12 8 12 8zm0 0c1.4-3.6 5.2-4 4.5-1.4C16.1 8 12 8 12 8z" />
    </>
  ),
  shirt: (
    <>
      <path d="M8.5 3.5L4 6 2.5 10.5l3.5 1.5v8.5h12V12l3.5-1.5L20 6l-4.5-2.5" />
      <path d="M8.5 3.5L12 7l3.5-3.5" />
      <path d="M12 10.2v.01M12 13.6v.01M12 17v.01" />
    </>
  ),
  shoe: (
    <>
      <path d="M4.8 8.6L5.6 14C8 15.4 10 18.6 12.5 18.6h7.3c.6 0 .9-.6.8-1.4-.2-1.2-1.6-2-3.1-2.2-2.2-.3-4.2-.9-5.7-1.8C9.5 11.6 7.2 8.6 4.8 8.6z" />
      <path d="M5.6 14l.9 6.5M5.4 20.5h2.2" />
    </>
  ),
  leaf: <path d="M5 19C5 10 11 5 19 5c0 8-5 14-14 14zM5 19l7-7" />,
  heart: (
    <path d="M12 20.2C7 16.8 3.5 13.5 3.5 9.5A4.5 4.5 0 0 1 8 5c1.6 0 3 .8 4 2.1A4.8 4.8 0 0 1 16 5a4.5 4.5 0 0 1 4.5 4.5c0 4-3.5 7.3-8.5 10.7z" />
  ),
  sparkles: (
    <>
      <path d="M11 3c.6 4.1 2.6 6.1 6.7 6.7-4.1.6-6.1 2.6-6.7 6.7-.6-4.1-2.6-6.1-6.7-6.7C8.4 9.1 10.4 7.1 11 3z" />
      <path d="M18 14.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8z" />
    </>
  ),

  /* ---------- Personen ---------- */
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c.5-4 3.6-6.5 7.5-6.5s7 2.5 7.5 6.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M3 19.5c.4-3.3 2.8-5.5 6-5.5s5.6 2.2 6 5.5" />
      <path d="M15.5 5.4a3.2 3.2 0 0 1 0 6.2M17.2 14.3c2.1.6 3.5 2.4 3.8 5.2" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="6" r="2.8" />
      <path d="M12 10v5M7.6 9.4L12 11.8l4.4-2.4" />
      <path d="M9.4 20.4L12 15l2.6 5.4" />
    </>
  ),
};

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
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `${styles.icon} ${className}` : styles.icon}
      data-icon={name}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true, focusable: false })}
    >
      {title ? <title>{title}</title> : null}
      {ICONS[name]}
    </svg>
  );
}
