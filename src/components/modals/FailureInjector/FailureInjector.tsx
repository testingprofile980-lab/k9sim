import { useStore } from '../../../store';
import type { FailureType } from '../../../types';
import styles from './FailureInjector.module.css';

const failures: { type: FailureType; label: string; description: string }[] = [
  { type: 'CrashLoopBackOff', label: 'CrashLoopBackOff', description: 'Container starts, crashes, Kubernetes keeps restarting with exponential back-off' },
  { type: 'OOMKilled', label: 'OOMKilled', description: 'Container exceeds memory limit and is killed by the OS' },
  { type: 'ImagePullBackOff', label: 'ImagePullBackOff', description: 'Kubernetes cannot pull the container image — wrong tag or no auth' },
  { type: 'Pending', label: 'Pending / Insufficient CPU', description: 'Pod cannot be scheduled — not enough CPU on any node' },
  { type: 'Evicted', label: 'Evicted', description: 'Node has disk pressure — pod is evicted to free space' },
  { type: 'NodeNotReady', label: 'Node NotReady', description: 'Simulates the node becoming NotReady — pod shows Unknown' },
];

export function FailureInjector() {
  const pods = useStore((s) => s.pods);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const activeView = useStore((s) => s.activeView);
  const injectFailure = useStore((s) => s.injectFailure);
  const setActiveModal = useStore((s) => s.setActiveModal);

  const pod = activeView === 'pods' ? pods[selectedIndex] : null;

  const inject = (type: FailureType) => {
    if (pod) {
      injectFailure(pod.id, type);
      setActiveModal(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <span className={styles.title}>Inject Failure</span>
            {pod && <span className={styles.target}> → {pod.name}</span>}
          </div>
          <button className={styles.close} onClick={() => setActiveModal(null)}>✕</button>
        </div>
        <div className={styles.body}>
          {!pod && <div className={styles.note}>Select a pod first to inject a failure</div>}
          {failures.map((f) => (
            <button
              key={f.type}
              className={styles.failureBtn}
              onClick={() => inject(f.type)}
              disabled={!pod}
            >
              <span className={styles.failureLabel}>{f.label}</span>
              <span className={styles.failureDesc}>{f.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
