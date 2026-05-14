import { useStore } from '../../store';
import type { ViewType } from '../../types';
import styles from './NavTabs.module.css';

const tabs: { view: ViewType; label: string; shortcut: string }[] = [
  { view: 'pods', label: 'Pods', shortcut: ':po' },
  { view: 'deployments', label: 'Deployments', shortcut: ':dp' },
  { view: 'services', label: 'Services', shortcut: ':svc' },
  { view: 'nodes', label: 'Nodes', shortcut: ':no' },
  { view: 'namespaces', label: 'Namespaces', shortcut: ':ns' },
];

export function NavTabs() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);

  return (
    <div className={styles.navtabs}>
      {tabs.map((t) => (
        <button
          key={t.view}
          className={`${styles.tab} ${activeView === t.view ? styles.active : ''}`}
          onClick={() => setView(t.view)}
          title={t.shortcut}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
