import { useEffect, useRef } from 'react';
import { useStore } from '../../../store';
import styles from './LogPanel.module.css';

export function LogPanel() {
  const pods = useStore((s) => s.pods);
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const bottomRef = useRef<HTMLDivElement>(null);

  let logs: string[] = [];
  let resourceName = '';

  if (activeView === 'pods') {
    const filtered = pods;
    const pod = filtered[selectedIndex];
    if (pod) {
      logs = pod.logs;
      resourceName = pod.name;
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Logs — {resourceName}</span>
        <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
      </div>
      <div className={styles.content}>
        {logs.length === 0 ? (
          <div className={styles.empty}>No logs available (container not running)</div>
        ) : (
          logs.map((line, i) => {
            const isError = line.includes('ERROR') || line.includes('panic') || line.includes('Killed');
            const isWarn = line.includes('WARN') || line.includes('Warning');
            return (
              <div
                key={i}
                className={`${styles.line} ${isError ? styles.error : isWarn ? styles.warn : ''}`}
              >
                {line}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
