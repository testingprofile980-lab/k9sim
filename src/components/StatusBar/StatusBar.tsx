import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import styles from './StatusBar.module.css';

function useSessionClock() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function StatusBar() {
  const pods = useStore((s) => s.pods);
  const clock = useSessionClock();

  const total = pods.length;

  return (
    <div className={styles.statusbar}>
      <span className={styles.item}>
        <span className={styles.label}>K8s</span>
        <span className={styles.value}>v1.28.3</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>Pods</span>
        <span className={styles.value}>{total}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>CPU</span>
        <span className={styles.value}>1.38/12</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>MEM</span>
        <span className={styles.value}>5.1/24Gi</span>
      </span>
      <span className={styles.spacer} />
      <span className={styles.item}>
        <span className={styles.label}>Session</span>
        <span className={styles.clock}>{clock}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.brand}>K9sSim v0.27</span>
    </div>
  );
}
