import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import styles from './PulseView.module.css';

interface Series {
  cpu: number[];
  mem: number[];
  podCounts: { running: number; pending: number; error: number }[];
}

const MAX_POINTS = 60;

function Sparkline({ data, color, max = 100, label, value }: { data: number[]; color: string; max?: number; label: string; value: string }) {
  const w = 300;
  const h = 60;
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, MAX_POINTS - 1)) * w;
    const y = h - (d / max) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className={styles.spark}>
      <div className={styles.sparkHeader}>
        <span className={styles.sparkLabel}>{label}</span>
        <span className={styles.sparkValue} style={{ color }}>{value}</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.sparkSvg}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        {data.length > 1 && (
          <polygon
            fill={`url(#grad-${label})`}
            points={`0,${h} ${points} ${w},${h}`}
          />
        )}
      </svg>
    </div>
  );
}

function Donut({ running, pending, error, succeeded }: { running: number; pending: number; error: number; succeeded: number }) {
  const total = running + pending + error + succeeded;
  if (total === 0) return null;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const segments = [
    { color: 'var(--green)', value: running, label: 'Running' },
    { color: 'var(--yellow)', value: pending, label: 'Pending' },
    { color: 'var(--red)', value: error, label: 'Error' },
    { color: 'var(--text-muted)', value: succeeded, label: 'Succeeded' },
  ];

  return (
    <div className={styles.donut}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="14" />
        {segments.map((s, i) => {
          if (s.value === 0) return null;
          const len = (s.value / total) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text x="80" y="80" textAnchor="middle" className={styles.donutText} dy="0.35em">{total}</text>
        <text x="80" y="100" textAnchor="middle" className={styles.donutSub} dy="0.35em">pods</text>
      </svg>
      <div className={styles.legend}>
        {segments.map((s, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className={styles.legendCount}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PulseView() {
  const pods = useStore((s) => s.pods);
  const nodes = useStore((s) => s.nodes);
  const deployments = useStore((s) => s.deployments);
  const namespaces = useStore((s) => s.namespaces);
  const tickVersion = useStore((s) => s.metricsVersion);

  const [series, setSeries] = useState<Series>({ cpu: [], mem: [], podCounts: [] });

  // aggregate cluster metrics
  const totalCpuPct = Math.round(nodes.reduce((a, n) => a + n.cpuPct, 0) / Math.max(1, nodes.length));
  const totalMemPct = Math.round(nodes.reduce((a, n) => a + n.memPct, 0) / Math.max(1, nodes.length));
  const running = pods.filter((p) => p.status === 'Running').length;
  const pending = pods.filter((p) => p.status === 'Pending' || p.status === 'ContainerCreating').length;
  const errorStates = ['Error', 'CrashLoopBackOff', 'OOMKilled', 'Evicted', 'ImagePullBackOff', 'ErrImagePull', 'Failed'];
  const error = pods.filter((p) => errorStates.includes(p.status)).length;
  const succeeded = pods.filter((p) => p.status === 'Succeeded' || p.status === 'Completed').length;

  useEffect(() => {
    setSeries((s) => ({
      cpu: [...s.cpu, totalCpuPct].slice(-MAX_POINTS),
      mem: [...s.mem, totalMemPct].slice(-MAX_POINTS),
      podCounts: [...s.podCounts, { running, pending, error }].slice(-MAX_POINTS),
    }));
  }, [tickVersion, totalCpuPct, totalMemPct, running, pending, error]);

  return (
    <div className={styles.pulse}>
      <div className={styles.header}>
        <span className={styles.title}>K8s Cluster Pulse</span>
        <span className={styles.sub}>Live cluster health metrics — updating every 2s</span>
      </div>

      <div className={styles.gridTop}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>CLUSTER UTILIZATION</div>
          <Sparkline data={series.cpu} color="#58A6FF" label="CPU" value={`${totalCpuPct}%`} />
          <Sparkline data={series.mem} color="#BC8CFF" label="MEM" value={`${totalMemPct}%`} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>POD HEALTH</div>
          <Donut running={running} pending={pending} error={error} succeeded={succeeded} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>NODE STATUS</div>
          <div className={styles.nodeList}>
            {nodes.map((n) => (
              <div key={n.id} className={styles.nodeRow}>
                <span className={styles.nodeName}>{n.name}</span>
                <span className={`${styles.nodeStatus} ${n.status === 'Ready' ? styles.ready : styles.notReady}`}>{n.status}</span>
                <div className={styles.bars}>
                  <div className={styles.bar}>
                    <span className={styles.barLabel}>CPU</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${n.cpuPct}%`, background: n.cpuPct > 80 ? 'var(--red)' : n.cpuPct > 60 ? 'var(--yellow)' : 'var(--green)' }} />
                    </div>
                    <span className={styles.barPct}>{n.cpuPct}%</span>
                  </div>
                  <div className={styles.bar}>
                    <span className={styles.barLabel}>MEM</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${n.memPct}%`, background: n.memPct > 80 ? 'var(--red)' : n.memPct > 60 ? 'var(--yellow)' : 'var(--purple)' }} />
                    </div>
                    <span className={styles.barPct}>{n.memPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.gridBottom}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{pods.length}</div>
          <div className={styles.statLabel}>PODS</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{nodes.filter((n) => n.status === 'Ready').length}/{nodes.length}</div>
          <div className={styles.statLabel}>NODES READY</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{deployments.length}</div>
          <div className={styles.statLabel}>DEPLOYMENTS</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{namespaces.length}</div>
          <div className={styles.statLabel}>NAMESPACES</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${error > 0 ? styles.errorStat : ''}`}>{error}</div>
          <div className={styles.statLabel}>ERROR PODS</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${pending > 0 ? styles.pendingStat : ''}`}>{pending}</div>
          <div className={styles.statLabel}>PENDING</div>
        </div>
      </div>
    </div>
  );
}
