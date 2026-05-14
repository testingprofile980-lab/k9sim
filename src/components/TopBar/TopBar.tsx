import { useStore } from '../../store';
import styles from './TopBar.module.css';

const fakeMetrics = [
  { cpu: '1.38/4', mem: '5.1/24Gi', running: 8, pending: 1, error: 1 },
  { cpu: '1.42/4', mem: '5.2/24Gi', running: 8, pending: 1, error: 1 },
  { cpu: '1.35/4', mem: '5.0/24Gi', running: 8, pending: 1, error: 1 },
  { cpu: '1.47/4', mem: '5.3/24Gi', running: 8, pending: 1, error: 1 },
];

export function TopBar() {
  const metricsVersion = useStore((s) => s.metricsVersion);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const pods = useStore((s) => s.pods);

  const m = fakeMetrics[metricsVersion % fakeMetrics.length];
  const running = pods.filter((p) => p.status === 'Running').length;
  const pending = pods.filter((p) => p.status === 'Pending').length;
  const errors = pods.filter((p) => ['Error', 'CrashLoopBackOff', 'OOMKilled', 'Evicted', 'ImagePullBackOff'].includes(p.status)).length;

  return (
    <div className={styles.topbar}>
      <span className={styles.context}>
        <span className={styles.label}>Context:</span>
        <span className={styles.value}>k9ssim-cluster</span>
      </span>
      <span className={styles.sep}>|</span>
      <span className={styles.cluster}>
        <span className={styles.label}>Cluster:</span>
        <span className={styles.value}>k9ssim</span>
      </span>
      <span className={styles.sep}>|</span>
      <span className={styles.ns}>
        <span className={styles.label}>Namespace:</span>
        <span className={styles.nsValue}>{activeNamespace}</span>
      </span>
      <span className={styles.spacer} />
      <span className={styles.metric}>
        <span className={styles.label}>CPU:</span>
        <span className={styles.metricValue}>{m.cpu}</span>
      </span>
      <span className={styles.sep}>|</span>
      <span className={styles.metric}>
        <span className={styles.label}>MEM:</span>
        <span className={styles.metricValue}>{m.mem}</span>
      </span>
      <span className={styles.sep}>|</span>
      <span className={styles.podCounts}>
        <span className={styles.running}>{running} Running</span>
        <span className={styles.sep2}> </span>
        <span className={styles.pendingCount}>{pending} Pending</span>
        <span className={styles.sep2}> </span>
        <span className={styles.errorCount}>{errors} Error</span>
      </span>
    </div>
  );
}
