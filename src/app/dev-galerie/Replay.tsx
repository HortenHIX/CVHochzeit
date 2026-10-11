'use client';

import { useState, type ReactNode } from 'react';
import styles from './page.module.css';

/** Spielt CSS-Animationen erneut ab, indem der Inhalt neu eingehängt wird. */
export function Replay({ children, label = 'Nochmal abspielen' }: { children: ReactNode; label?: string }) {
  const [run, setRun] = useState(0);
  return (
    <div className={styles.replay}>
      <div key={run} className={styles.replayStage}>
        {children}
      </div>
      <button type="button" className={styles.replayButton} onClick={() => setRun((n) => n + 1)}>
        {label}
      </button>
    </div>
  );
}
