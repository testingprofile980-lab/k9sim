import { useStore } from '../../store';
import styles from './HotkeyBar.module.css';

interface HotkeyDef {
  key: string;
  label: string;
}

const NAV: HotkeyDef[] = [
  { key: '↑↓ j/k', label: 'nav' },
  { key: 'g/G', label: 'top/bot' },
  { key: '/', label: 'filter' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
  { key: '0-5', label: 'ns' },
  { key: 'space', label: 'mark' },
];

const podKeys: HotkeyDef[] = [
  ...NAV,
  { key: 'l', label: 'logs' },
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: 'x', label: 'delete' },
  { key: 'r', label: 'restart' },
  { key: 's', label: 'shell' },
  { key: '⇧f', label: 'port-fwd' },
  { key: 'n', label: 'new' },
  { key: 'f', label: 'inject' },
];

const deployKeys: HotkeyDef[] = [
  ...NAV,
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: 's', label: 'scale' },
  { key: 'r', label: 'rollout' },
  { key: 'x', label: 'delete' },
];

const svcKeys: HotkeyDef[] = [
  ...NAV,
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
  { key: '⇧f', label: 'port-fwd' },
];

const nodeKeys: HotkeyDef[] = [
  ...NAV,
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'c', label: 'cordon' },
];

const genericKeys: HotkeyDef[] = [
  ...NAV,
  { key: 'd', label: 'describe' },
  { key: 'y', label: 'yaml' },
  { key: 'e', label: 'edit' },
];

const pulseKeys: HotkeyDef[] = [
  { key: '⌃r', label: 'refresh' },
  { key: ':', label: 'cmd' },
  { key: '?', label: 'help' },
];

const xrayKeys: HotkeyDef[] = [
  { key: 'click', label: 'expand' },
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
        ...(activePanel === 'editor' ? [{ key: '⌃s', label: 'save' }] : []),
        ...(activePanel === 'logs' ? [{ key: 'w', label: 'wrap' }, { key: 'c', label: 'clear' }] : []),
      ]
    : [];

  let viewKeys: HotkeyDef[];
  if (activePanel) viewKeys = panelKeys;
  else if (activeView === 'pods') viewKeys = podKeys;
  else if (activeView === 'deployments') viewKeys = deployKeys;
  else if (activeView === 'services') viewKeys = svcKeys;
  else if (activeView === 'nodes') viewKeys = nodeKeys;
  else if (activeView === 'pulse') viewKeys = pulseKeys;
  else if (activeView === 'xray') viewKeys = xrayKeys;
  else viewKeys = genericKeys;

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
