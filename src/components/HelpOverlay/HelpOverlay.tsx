import { useStore } from '../../store';
import styles from './HelpOverlay.module.css';

const shortcuts = [
  {
    group: 'Navigation',
    items: [
      { key: '↑ / ↓ / j / k', action: 'Navigate rows' },
      { key: 'g / G', action: 'Jump to top / bottom' },
      { key: 'PgUp / PgDn', action: 'Page up / down' },
      { key: 'Enter', action: 'Drill into resource (describe / switch ns)' },
      { key: 'Esc', action: 'Back / close panel' },
      { key: '?', action: 'Toggle this help' },
    ],
  },
  {
    group: 'Workload Commands',
    items: [
      { key: ':pods / :po / :p', action: 'Pods view' },
      { key: ':deploy / :dp', action: 'Deployments view' },
      { key: ':svc', action: 'Services view' },
      { key: ':sts', action: 'StatefulSets view' },
      { key: ':ds', action: 'DaemonSets view' },
      { key: ':rs', action: 'ReplicaSets view' },
      { key: ':jobs / :cj', action: 'Jobs / CronJobs' },
      { key: ':hpa / :pdb', action: 'HPAs / PodDisruptionBudgets' },
    ],
  },
  {
    group: 'Cluster Commands',
    items: [
      { key: ':nodes / :no', action: 'Nodes view' },
      { key: ':ns', action: 'Namespaces view' },
      { key: ':ev / :events', action: 'Cluster events' },
      { key: ':ctx / :contexts', action: 'Switch context' },
      { key: ':ing / ingress', action: 'Ingresses' },
      { key: ':cm / :sec', action: 'ConfigMaps / Secrets' },
      { key: ':pv / :pvc', action: 'Storage' },
      { key: ':sa / :rb / :cr / :crb', action: 'RBAC' },
      { key: ':netpol', action: 'NetworkPolicies' },
    ],
  },
  {
    group: 'Special Views',
    items: [
      { key: ':pulse', action: 'Live cluster pulse (charts)' },
      { key: ':xray', action: 'Resource dependency tree' },
      { key: ':popeye', action: 'Cluster linter / sanity check' },
      { key: ':helm', action: 'Helm releases' },
    ],
  },
  {
    group: 'Resource Actions',
    items: [
      { key: 'l', action: 'View logs (pods)' },
      { key: 'd', action: 'Describe resource' },
      { key: 'y', action: 'View YAML' },
      { key: 'e', action: 'Edit YAML' },
      { key: 'x / Del / Ctrl+D', action: 'Delete resource' },
      { key: 'r', action: 'Restart pod / rollout restart deploy' },
      { key: 's', action: 'Scale (deploy) / Shell (pod)' },
      { key: '⇧f', action: 'Port-forward' },
      { key: 'n', action: 'New pod (pods view)' },
      { key: 'f', action: 'Inject failure (pods view)' },
      { key: 'c', action: 'Cordon / uncordon node' },
    ],
  },
  {
    group: 'Modes & Selection',
    items: [
      { key: '/', action: 'Filter mode' },
      { key: ':', action: 'Command mode' },
      { key: 'Space', action: 'Mark / unmark row' },
      { key: 'Ctrl+A', action: 'Mark all' },
      { key: 'Ctrl+L', action: 'Clear marks' },
      { key: 'Ctrl+R', action: 'Refresh' },
      { key: 'Ctrl+S', action: 'Save (YAML editor)' },
      { key: '0-5', action: 'Quick namespace: 0=all 1=default 2=kube-sys 3=prod 4=mon 5=staging' },
    ],
  },
  {
    group: 'Sorting',
    items: [
      { key: 'Shift+N', action: 'Sort by NAME' },
      { key: 'Shift+S', action: 'Sort by STATUS' },
      { key: 'Shift+A', action: 'Sort by AGE' },
      { key: 'Shift+R', action: 'Sort by RESTARTS' },
      { key: 'Shift+C', action: 'Sort by CPU' },
      { key: 'Shift+M', action: 'Sort by MEM' },
    ],
  },
];

export function HelpOverlay() {
  const setActiveModal = useStore((s) => s.setActiveModal);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>K9sSim — Keyboard Reference</span>
          <span className={styles.subtitle}>Simulating k9s v0.32 — type <kbd>:alias</kbd> for full list</span>
          <button className={styles.close} onClick={() => setActiveModal(null)}>✕ Esc</button>
        </div>
        <div className={styles.body}>
          {shortcuts.map((group) => (
            <div key={group.group} className={styles.group}>
              <div className={styles.groupTitle}>{group.group}</div>
              <div className={styles.grid}>
                {group.items.map((item) => (
                  <div key={item.key} className={styles.row}>
                    <kbd className={styles.kbd}>{item.key}</kbd>
                    <span className={styles.action}>{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
