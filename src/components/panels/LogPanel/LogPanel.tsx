import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../../store';
import styles from './LogPanel.module.css';

const LOG_TEMPLATES = [
  '  INFO  GET /api/v1/health 200',
  '  INFO  GET /api/v1/users 200',
  '  INFO  POST /api/v1/login 200',
  '  INFO  Heartbeat OK',
  '  INFO  Cache hit ratio: 94%',
  '  INFO  Connection pool size: 12',
  '  DEBUG dispatching request id=req-xxx',
  '  INFO  Background job processed',
];

export function LogPanel() {
  const pods = useStore((s) => s.pods);
  const activeView = useStore((s) => s.activeView);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastResourceRef = useRef<string>('');
  const [tailLogs, setTailLogs] = useState<string[]>([]);
  const [wrap, setWrap] = useState(false);
  const [follow, setFollow] = useState(true);

  let logs: string[] = [];
  let resourceName = '';
  let isRunning = false;

  if (activeView === 'pods') {
    const filtered = pods
      .filter((p) => activeNamespace === 'all' || p.namespace === activeNamespace)
      .filter((p) => !filterStr || p.name.toLowerCase().includes(filterStr.toLowerCase()));
    const pod = filtered[selectedIndex];
    if (pod) {
      logs = pod.logs;
      resourceName = pod.name;
      isRunning = pod.status === 'Running';
    }
  }

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (lastResourceRef.current !== resourceName) {
        lastResourceRef.current = resourceName;
        setTailLogs([]);
        return;
      }
      const tmpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const ts = new Date().toISOString();
      setTailLogs((l) => [...l, `${ts}${tmpl}`].slice(-200));
    }, 1200);
    return () => clearInterval(interval);
  }, [isRunning, resourceName]);

  useEffect(() => {
    if (follow) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [logs, tailLogs, follow]);

  // Keyboard handlers within panel scope
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'w') { setWrap((w) => !w); }
      if (e.key === 'c') { setTailLogs([]); }
      if (e.key === 'f') { setFollow((f) => !f); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const allLogs = [...logs, ...tailLogs];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Logs — {resourceName}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ color: isRunning ? 'var(--green)' : 'var(--text-muted)', fontSize: 11 }}>
            {isRunning ? '● streaming' : '○ stopped'}
          </span>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', color: wrap ? 'var(--accent)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: 2, cursor: 'pointer', fontSize: 11 }} onClick={() => setWrap((w) => !w)}>[w] wrap</button>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', color: follow ? 'var(--accent)' : 'var(--text-muted)', padding: '2px 8px', borderRadius: 2, cursor: 'pointer', fontSize: 11 }} onClick={() => setFollow((f) => !f)}>[f] follow</button>
          <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 2, cursor: 'pointer', fontSize: 11 }} onClick={() => setTailLogs([])}>[c] clear</button>
          <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
        </div>
      </div>
      <div className={styles.content}>
        {allLogs.length === 0 ? (
          <div className={styles.empty}>No logs available (container not running)</div>
        ) : (
          allLogs.map((line, i) => {
            const isError = line.includes('ERROR') || line.includes('panic') || line.includes('Killed');
            const isWarn = line.includes('WARN') || line.includes('Warning');
            return (
              <div
                key={i}
                className={`${styles.line} ${isError ? styles.error : isWarn ? styles.warn : ''}`}
                style={wrap ? { whiteSpace: 'pre-wrap', wordBreak: 'break-all' } : undefined}
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
