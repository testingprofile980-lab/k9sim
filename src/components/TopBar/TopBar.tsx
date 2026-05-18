import { useStore } from '../../store';
import styles from './TopBar.module.css';

export function TopBar() {
  const activeNamespace = useStore((s) => s.activeNamespace);
  const pods = useStore((s) => s.pods);
  const nodes = useStore((s) => s.nodes);
  const contexts = useStore((s) => s.contexts);
  const currentCtx = contexts.find((c) => c.current);

  const running = pods.filter((p) => p.status === 'Running').length;
  const pending = pods.filter((p) => p.status === 'Pending' || p.status === 'ContainerCreating').length;
  const errorStates = ['Error', 'CrashLoopBackOff', 'OOMKilled', 'Evicted', 'ImagePullBackOff', 'ErrImagePull', 'Failed'];
  const errors = pods.filter((p) => errorStates.includes(p.status)).length;

  const cpuMc = nodes.reduce((a, n) => a + parseInt(n.cpuUsage), 0);
  const cpuTot = nodes.reduce((a, n) => a + parseFloat(n.cpuCapacity) * 1000, 0);
  const cpuPct = Math.round((cpuMc / cpuTot) * 100);
  const memUsed = nodes.reduce((a, n) => a + parseFloat(n.memUsage), 0);
  const memTotal = nodes.reduce((a, n) => a + parseFloat(n.memCapacity), 0);
  const memPct = Math.round((memUsed / memTotal) * 100);

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.context}>
          <span className={styles.label}>Context:</span>
          <span className={styles.value}>{currentCtx?.name || 'k9ssim-cluster'}</span>
        </span>
        <span className={styles.sep}>│</span>
        <span className={styles.cluster}>
          <span className={styles.label}>Cluster:</span>
          <span className={styles.value}>{currentCtx?.cluster || 'k9ssim'}</span>
        </span>
        <span className={styles.sep}>│</span>
        <span className={styles.ns}>
          <span className={styles.label}>Namespace:</span>
          <span className={styles.nsValue}>{activeNamespace}</span>
        </span>
        <span className={styles.sep}>│</span>
        <span className={styles.user}>
          <span className={styles.label}>User:</span>
          <span className={styles.value}>{currentCtx?.user.split('@')[0] || 'admin'}</span>
        </span>
      </div>
      <div className={styles.right}>
        <div className={styles.gauge}>
          <span className={styles.gaugeLabel}>CPU</span>
          <div className={styles.gaugeBar}>
            <div
              className={styles.gaugeFill}
              style={{
                width: `${cpuPct}%`,
                background: cpuPct > 80 ? 'var(--red)' : cpuPct > 60 ? 'var(--yellow)' : 'var(--green)',
              }}
            />
          </div>
          <span className={styles.gaugeValue}>{cpuPct}%</span>
        </div>
        <div className={styles.gauge}>
          <span className={styles.gaugeLabel}>MEM</span>
          <div className={styles.gaugeBar}>
            <div
              className={styles.gaugeFill}
              style={{
                width: `${memPct}%`,
                background: memPct > 80 ? 'var(--red)' : memPct > 60 ? 'var(--yellow)' : 'var(--purple)',
              }}
            />
          </div>
          <span className={styles.gaugeValue}>{memPct}%</span>
        </div>
        <span className={styles.sep}>│</span>
        <span className={styles.podCounts}>
          <span className={styles.running}>● {running}</span>
          <span className={styles.pendingCount}>● {pending}</span>
          <span className={styles.errorCount}>● {errors}</span>
        </span>
      </div>
    </div>
  );
}
