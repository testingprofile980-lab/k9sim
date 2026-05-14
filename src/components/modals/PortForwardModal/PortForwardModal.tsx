import { useState } from 'react';
import { useStore } from '../../../store';
import styles from './PortForwardModal.module.css';

export function PortForwardModal() {
  const pods = useStore((s) => s.pods);
  const services = useStore((s) => s.services);
  const activeView = useStore((s) => s.activeView);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const addToast = useStore((s) => s.addToast);

  let name = '';
  let defaultPort = 8080;

  if (activeView === 'pods') {
    const p = pods[selectedIndex];
    name = p?.name || '';
    defaultPort = p?.containers[0] ? 8080 : 8080;
  } else if (activeView === 'services') {
    const s = services[selectedIndex];
    name = s?.name || '';
    defaultPort = s?.ports[0]?.port || 80;
  }

  const [localPort, setLocalPort] = useState(defaultPort);
  const [remotePort, setRemotePort] = useState(defaultPort);
  const [active, setActive] = useState(false);
  const url = `http://localhost:${localPort}`;

  const startForward = () => {
    setActive(true);
    addToast(`Port-forwarding ${name}:${remotePort} → localhost:${localPort}`, 'success');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Port Forward — {name}</span>
          <button className={styles.close} onClick={() => setActivePanel(null)}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Local Port</span>
              <input className={styles.input} type="number" value={localPort} onChange={(e) => setLocalPort(Number(e.target.value))} />
            </label>
            <span className={styles.arrow}>→</span>
            <label className={styles.field}>
              <span className={styles.label}>Remote Port</span>
              <input className={styles.input} type="number" value={remotePort} onChange={(e) => setRemotePort(Number(e.target.value))} />
            </label>
          </div>
          {active ? (
            <div className={styles.activeSection}>
              <div className={styles.activeIndicator}>
                <span className={styles.dot} />
                <span className={styles.activeLabel}>Forwarding active</span>
              </div>
              <div className={styles.urlRow}>
                <input className={styles.urlInput} value={url} readOnly />
                <button className={styles.copyBtn} onClick={() => { navigator.clipboard.writeText(url); addToast('URL copied!', 'success'); }}>
                  Copy
                </button>
              </div>
              <p className={styles.note}>This is a simulated port-forward. In a real cluster, you could open {url} in your browser.</p>
            </div>
          ) : (
            <button className={styles.startBtn} onClick={startForward}>Start Port Forward</button>
          )}
        </div>
      </div>
    </div>
  );
}
