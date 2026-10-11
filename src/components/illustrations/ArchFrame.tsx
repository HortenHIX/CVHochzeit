import type { CSSProperties, ReactNode } from 'react';
import styles from './ArchFrame.module.css';
import { cx } from './shared';

/**
 * E5 Doppelbogen-Rahmen (CSS). Rahmt Inhalte im Bogen (Hero, Login-Karte …).
 *
 * - `className` gilt für den Wrapper (`container-type: inline-size`): hier die
 *   Breite setzen, z. B. `width: min(100%, 22rem)`. Innen sind `cqi`-Einheiten
 *   nutzbar (z. B. `padding-top: 28cqi`).
 * - `innerClassName` gilt für die Bogenfläche (Innenabstand, Hintergrund …).
 * - `variant="frame"` (Standard): zwei Bogenlinien (außen .55, 8 px innen .35).
 * - `variant="card"`: paper-Karte mit 1 px line-Rahmen und `--shadow-md`,
 *   der Doppelbogen liegt eingerückt innen (Login).
 * - `surface="paper"`: Bogenfläche in paper (nur für `frame`).
 */
export function ArchFrame({
  children,
  className,
  innerClassName,
  variant = 'frame',
  surface = 'none',
  as: Tag = 'div',
  style,
  innerStyle,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  variant?: 'frame' | 'card';
  surface?: 'none' | 'paper';
  as?: 'div' | 'section' | 'article' | 'header' | 'figure';
  style?: CSSProperties;
  innerStyle?: CSSProperties;
}) {
  return (
    <div className={cx(styles.wrap, className)} style={style}>
      <Tag
        className={cx(
          styles.arch,
          variant === 'card' ? styles.card : styles.frame,
          surface === 'paper' && styles.paper,
          innerClassName,
        )}
        style={innerStyle}
      >
        {children}
      </Tag>
    </div>
  );
}
