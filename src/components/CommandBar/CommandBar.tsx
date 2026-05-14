import { useRef, useEffect } from 'react';
import { useStore } from '../../store';
import type { ViewType } from '../../types';
import styles from './CommandBar.module.css';

const VIEW_COMMANDS: Record<string, ViewType> = {
  ':pods': 'pods',
  ':po': 'pods',
  ':p': 'pods',
  ':deployments': 'deployments',
  ':deploy': 'deployments',
  ':dp': 'deployments',
  ':services': 'services',
  ':svc': 'services',
  ':sv': 'services',
  ':nodes': 'nodes',
  ':no': 'nodes',
  ':namespaces': 'namespaces',
  ':ns': 'namespaces',
};

export function CommandBar() {
  const commandMode = useStore((s) => s.commandMode);
  const commandInput = useStore((s) => s.commandInput);
  const setCommandMode = useStore((s) => s.setCommandMode);
  const setCommandInput = useStore((s) => s.setCommandInput);
  const setView = useStore((s) => s.setView);
  const addToast = useStore((s) => s.addToast);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandMode) inputRef.current?.focus();
  }, [commandMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setCommandMode(false);
      return;
    }
    if (e.key === 'Enter') {
      const cmd = commandInput.trim().toLowerCase();
      const view = VIEW_COMMANDS[cmd];
      if (view) {
        setView(view);
      } else if (cmd === ':q' || cmd === ':quit') {
        addToast('Nice try! This is a simulator — nothing to quit.', 'info');
      } else if (cmd !== ':') {
        addToast(`Unknown command: ${cmd}`, 'error');
      }
      setCommandMode(false);
    }
  };

  if (!commandMode) return null;

  return (
    <div className={styles.commandbar}>
      <input
        ref={inputRef}
        className={styles.input}
        value={commandInput}
        onChange={(e) => setCommandInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setCommandMode(false)}
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
