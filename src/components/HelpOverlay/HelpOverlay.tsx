import { useStore } from '../../store';
import styles from './HelpOverlay.module.css';

const shortcuts = [
  { group: 'Navigation', items: [
    { key: ':pods / :po', action: 'Switch to Pods view' },
    { key: ':svc', action: 'Switch to Services view' },
    { key: ':deploy / :dp', action: 'Switch to Deployments view' },
    { key: ':ns', action: 'Switch to Namespaces view' },
    { key: ':nodes / :no', action: 'Switch to Nodes view' },
    { key: '↑ / ↓', action: 'Navigate rows' },
    { key: 'Enter', action: 'Describe selected resource' },
    { key: 'Esc', action: 'Back / close panel' },
  ]},
  { group: 'Resource Actions', items: [
    { key: 'l', action: 'View logs (pods)' },
    { key: 'd', action: 'Describe resource' },
    { key: 'y', action: 'View YAML' },
    { key: 'e', action: 'Edit YAML' },
    { key: 'x / Delete', action: 'Delete resource' },
    { key: 'r', action: 'Restart pod / rollout restart' },
    { key: 's', action: 'Scale deployment' },
    { key: 'shift+f', action: 'Port forward' },
    { key: 'n', action: 'New pod (pods view)' },
    { key: 'f', action: 'Inject failure (pods view)' },
  ]},
  { group: 'Modes', items: [
    { key: '/', action: 'Enter filter mode — type to filter' },
    { key: ':', action: 'Enter command mode — type command' },
    { key: '?', action: 'Toggle this help overlay' },
    { key: 'Ctrl+S', action: 'Save (in YAML editor)' },
  ]},
];

export function HelpOverlay() {
  const setActiveModal = useStore((s) => s.setActiveModal);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Keyboard Shortcuts</span>
          <span className={styles.subtitle}>K9sSim — Simulating k9s v0.27</span>
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
