import { useStore } from '../../store';
import styles from './HotkeyBar.module.css';

interface HotkeyDef {
  key: string;
  label: string;
}

const podKeys: HotkeyDef[] = [
  { key: '↑↓', label: 'navigate' },
  { key: 'l', label: 'logs' },
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: 'x', label: 'delete' },
  { key: 'r', label: 'restart' },
  { key: 's', label: 'shell' },
  { key: 'shift+f', label: 'port-fwd' },
  { key: 'n', label: 'new pod' },
  { key: 'f', label: 'inject failure' },
  { key: '/', label: 'filter' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
];

const deployKeys: HotkeyDef[] = [
  { key: '↑↓', label: 'navigate' },
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: 's', label: 'scale' },
  { key: 'r', label: 'rollout' },
  { key: 'x', label: 'delete' },
  { key: '/', label: 'filter' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
];

const svcKeys: HotkeyDef[] = [
  { key: '↑↓', label: 'navigate' },
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: 'shift+f', label: 'port-fwd' },
  { key: 'x', label: 'delete' },
  { key: '/', label: 'filter' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
];

const genericKeys: HotkeyDef[] = [
  { key: '↑↓', label: 'navigate' },
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'x', label: 'delete' },
  { key: '/', label: 'filter' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
];

export function HotkeyBar() {
  const activeView = useStore((s) => s.activeView);
  const activePanel = useStore((s) => s.activePanel);

  const panelKeys: HotkeyDef[] = activePanel
    ? [
        { key: 'Esc', label: 'close' },
        { key: '↑↓', label: 'scroll' },
        ...(activePanel === 'editor' ? [{ key: 'Ctrl+S', label: 'save' }] : []),
      ]
    : [];

  const viewKeys =
    activePanel
      ? panelKeys
      : activeView === 'pods'
      ? podKeys
      : activeView === 'deployments'
      ? deployKeys
      : activeView === 'services'
      ? svcKeys
      : genericKeys;

  return (
    <div className={styles.hotkeybar}>
      {viewKeys.map((hk) => (
        <span key={hk.key + hk.label} className={styles.hotkey}>
          <kbd className={styles.kbd}>{hk.key}</kbd>
          <span className={styles.label}>{hk.label}</span>
        </span>
      ))}
    </div>
  );
}
