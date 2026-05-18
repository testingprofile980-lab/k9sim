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
  const nodes = useStore((s) => s.nodes);
  const activeView = useStore((s) => s.activeView);
  const markedIds = useStore((s) => s.markedIds);
  const clock = useSessionClock();

  const total = pods.length;
  const cpuMillicores = nodes.reduce((a, n) => a + parseInt(n.cpuUsage), 0);
  const cpuTotal = nodes.reduce((a, n) => a + parseFloat(n.cpuCapacity) * 1000, 0);
  const cpuStr = `${(cpuMillicores / 1000).toFixed(2)}/${cpuTotal / 1000}`;
  const memUsedGi = nodes.reduce((a, n) => a + parseFloat(n.memUsage), 0).toFixed(1);
  const memTotalGi = nodes.reduce((a, n) => a + parseFloat(n.memCapacity), 0);
  const memStr = `${memUsedGi}/${memTotalGi}Gi`;

  return (
    <div className={styles.statusbar}>
      <span className={styles.item}>
        <span className={styles.label}>K8s</span>
        <span className={styles.value}>v1.28.3</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>View</span>
        <span className={styles.value} style={{ color: 'var(--accent)' }}>{activeView}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>Pods</span>
        <span className={styles.value}>{total}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>CPU</span>
        <span className={styles.value}>{cpuStr}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.item}>
        <span className={styles.label}>MEM</span>
        <span className={styles.value}>{memStr}</span>
      </span>
      {markedIds.size > 0 && (
        <>
          <span className={styles.sep}>│</span>
          <span className={styles.item}>
            <span className={styles.label}>Marked</span>
            <span className={styles.value} style={{ color: 'var(--purple)' }}>{markedIds.size}</span>
          </span>
        </>
      )}
      <span className={styles.spacer} />
      <span className={styles.item}>
        <span className={styles.label}>Session</span>
        <span className={styles.clock}>{clock}</span>
      </span>
      <span className={styles.sep}>│</span>
      <span className={styles.brand}>K9sSim v0.32</span>
    </div>
  );
}
