import { useState } from 'react';
import { useStore } from '../../store';
import type { ViewType } from '../../types';
import styles from './NavTabs.module.css';

const primaryTabs: { view: ViewType; label: string; shortcut: string }[] = [
  { view: 'pods', label: 'Pods', shortcut: ':po' },
  { view: 'deployments', label: 'Deploys', shortcut: ':dp' },
  { view: 'services', label: 'Svcs', shortcut: ':svc' },
  { view: 'statefulsets', label: 'StatefulSets', shortcut: ':sts' },
  { view: 'daemonsets', label: 'DaemonSets', shortcut: ':ds' },
  { view: 'nodes', label: 'Nodes', shortcut: ':no' },
  { view: 'namespaces', label: 'Namespaces', shortcut: ':ns' },
  { view: 'ingress', label: 'Ingress', shortcut: ':ing' },
];

const moreGroups: { title: string; items: { view: ViewType; label: string; shortcut: string }[] }[] = [
  {
    title: 'Workloads',
    items: [
      { view: 'replicasets', label: 'ReplicaSets', shortcut: ':rs' },
      { view: 'jobs', label: 'Jobs', shortcut: ':jobs' },
      { view: 'cronjobs', label: 'CronJobs', shortcut: ':cj' },
      { view: 'hpa', label: 'HPAs', shortcut: ':hpa' },
      { view: 'pdb', label: 'PDBs', shortcut: ':pdb' },
    ],
  },
  {
    title: 'Config',
    items: [
      { view: 'configmaps', label: 'ConfigMaps', shortcut: ':cm' },
      { view: 'secrets', label: 'Secrets', shortcut: ':sec' },
    ],
  },
  {
    title: 'Storage',
    items: [
      { view: 'pv', label: 'PersistentVolumes', shortcut: ':pv' },
      { view: 'pvc', label: 'PVCs', shortcut: ':pvc' },
    ],
  },
  {
    title: 'Network',
    items: [
      { view: 'networkpolicies', label: 'NetworkPolicies', shortcut: ':netpol' },
    ],
  },
  {
    title: 'RBAC',
    items: [
      { view: 'serviceaccounts', label: 'ServiceAccounts', shortcut: ':sa' },
      { view: 'rolebindings', label: 'RoleBindings', shortcut: ':rb' },
      { view: 'clusterroles', label: 'ClusterRoles', shortcut: ':cr' },
      { view: 'clusterrolebindings', label: 'ClusterRoleBindings', shortcut: ':crb' },
    ],
  },
  {
    title: 'Cluster',
    items: [
      { view: 'events', label: 'Events', shortcut: ':ev' },
      { view: 'helm', label: 'Helm', shortcut: ':helm' },
      { view: 'contexts', label: 'Contexts', shortcut: ':ctx' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { view: 'pulse', label: 'Pulse', shortcut: ':pulse' },
      { view: 'xray', label: 'XRay', shortcut: ':xray' },
      { view: 'popeye', label: 'Popeye', shortcut: ':popeye' },
    ],
  },
];

export function NavTabs() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const [menuOpen, setMenuOpen] = useState(false);

  const allTabs = [...primaryTabs, ...moreGroups.flatMap((g) => g.items)];
  const inMore = !primaryTabs.find((t) => t.view === activeView);
  const activeLabel = allTabs.find((t) => t.view === activeView)?.label;

  return (
    <div className={styles.navtabs}>
      {primaryTabs.map((t) => (
        <button
          key={t.view}
          className={`${styles.tab} ${activeView === t.view ? styles.active : ''}`}
          onClick={() => setView(t.view)}
          title={t.shortcut}
        >
          {t.label}
        </button>
      ))}
      <div className={styles.moreWrap}>
        <button
          className={`${styles.tab} ${styles.more} ${inMore ? styles.active : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {inMore ? activeLabel : 'More'} ▾
        </button>
        {menuOpen && (
          <>
            <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
            <div className={styles.menu}>
              {moreGroups.map((g) => (
                <div key={g.title} className={styles.menuGroup}>
                  <div className={styles.menuGroupTitle}>{g.title}</div>
                  {g.items.map((t) => (
                    <button
                      key={t.view}
                      className={`${styles.menuItem} ${activeView === t.view ? styles.activeItem : ''}`}
                      onClick={() => { setView(t.view); setMenuOpen(false); }}
                    >
                      <span>{t.label}</span>
                      <span className={styles.shortcut}>{t.shortcut}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
