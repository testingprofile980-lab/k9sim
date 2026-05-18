import { useRef, useEffect, useState, useMemo } from 'react';
import { useStore } from '../../store';
import type { ViewType } from '../../types';
import styles from './CommandBar.module.css';

const VIEW_COMMANDS: Record<string, ViewType> = {
  // pods
  ':pods': 'pods', ':pod': 'pods', ':po': 'pods', ':p': 'pods',
  // deployments
  ':deployments': 'deployments', ':deployment': 'deployments', ':deploy': 'deployments', ':dp': 'deployments', ':deployments.apps': 'deployments',
  // services
  ':services': 'services', ':service': 'services', ':svc': 'services', ':sv': 'services',
  // nodes
  ':nodes': 'nodes', ':node': 'nodes', ':no': 'nodes',
  // namespaces
  ':namespaces': 'namespaces', ':namespace': 'namespaces', ':ns': 'namespaces',
  // configmaps
  ':configmaps': 'configmaps', ':configmap': 'configmaps', ':cm': 'configmaps',
  // secrets
  ':secrets': 'secrets', ':secret': 'secrets', ':sec': 'secrets',
  // statefulsets
  ':statefulsets': 'statefulsets', ':statefulset': 'statefulsets', ':sts': 'statefulsets',
  // daemonsets
  ':daemonsets': 'daemonsets', ':daemonset': 'daemonsets', ':ds': 'daemonsets',
  // jobs
  ':jobs': 'jobs', ':job': 'jobs',
  // cronjobs
  ':cronjobs': 'cronjobs', ':cronjob': 'cronjobs', ':cj': 'cronjobs', ':cron': 'cronjobs',
  // ingress
  ':ingress': 'ingress', ':ing': 'ingress',
  // pv
  ':persistentvolumes': 'pv', ':pv': 'pv',
  // pvc
  ':persistentvolumeclaims': 'pvc', ':pvc': 'pvc',
  // replicasets
  ':replicasets': 'replicasets', ':replicaset': 'replicasets', ':rs': 'replicasets',
  // hpa
  ':horizontalpodautoscalers': 'hpa', ':hpa': 'hpa',
  // service accounts
  ':serviceaccounts': 'serviceaccounts', ':serviceaccount': 'serviceaccounts', ':sa': 'serviceaccounts',
  // network policies
  ':networkpolicies': 'networkpolicies', ':networkpolicy': 'networkpolicies', ':netpol': 'networkpolicies',
  // pdb
  ':poddisruptionbudgets': 'pdb', ':pdb': 'pdb',
  // rbac
  ':rolebindings': 'rolebindings', ':rolebinding': 'rolebindings', ':rb': 'rolebindings',
  ':clusterroles': 'clusterroles', ':clusterrole': 'clusterroles', ':cr': 'clusterroles',
  ':clusterrolebindings': 'clusterrolebindings', ':clusterrolebinding': 'clusterrolebindings', ':crb': 'clusterrolebindings',
  // events
  ':events': 'events', ':event': 'events', ':ev': 'events',
  // helm
  ':helm': 'helm', ':hr': 'helm',
  // contexts
  ':contexts': 'contexts', ':context': 'contexts', ':ctx': 'contexts',
  // special views
  ':pulse': 'pulse', ':pu': 'pulse',
  ':xray': 'xray', ':xr': 'xray',
  ':popeye': 'popeye', ':pop': 'popeye',
};

const ALL_SUGGESTIONS = Object.keys(VIEW_COMMANDS).sort();

export function CommandBar() {
  const commandMode = useStore((s) => s.commandMode);
  const commandInput = useStore((s) => s.commandInput);
  const setCommandMode = useStore((s) => s.setCommandMode);
  const setCommandInput = useStore((s) => s.setCommandInput);
  const setView = useStore((s) => s.setView);
  const setActiveNamespace = useStore((s) => s.setActiveNamespace);
  const setActiveModal = useStore((s) => s.setActiveModal);
  const addToast = useStore((s) => s.addToast);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selSuggestion, setSelSuggestion] = useState(0);

  useEffect(() => {
    if (commandMode) {
      inputRef.current?.focus();
      setSelSuggestion(0);
    }
  }, [commandMode]);

  const suggestions = useMemo(() => {
    const q = commandInput.toLowerCase();
    if (q === ':' || q === '') return ALL_SUGGESTIONS.slice(0, 10);
    return ALL_SUGGESTIONS.filter((c) => c.startsWith(q)).slice(0, 10);
  }, [commandInput]);

  const runCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    const view = VIEW_COMMANDS[cmd];
    if (view) {
      setView(view);
      return;
    }
    // namespace filter command
    if (cmd.startsWith(':ns ')) {
      const ns = cmd.slice(4).trim();
      setActiveNamespace(ns || 'all');
      addToast(`Namespace set to ${ns || 'all'}`, 'success');
      return;
    }
    // ctx switching
    if (cmd === ':q' || cmd === ':quit') {
      addToast('Nice try! This is a simulator — nothing to quit.', 'info');
      return;
    }
    if (cmd === ':help' || cmd === ':h' || cmd === ':?') {
      setActiveModal('help');
      return;
    }
    // alias :alias - show all aliases via toast
    if (cmd === ':alias' || cmd === ':aliases') {
      addToast('Aliases: :po :svc :dp :sts :ds :cm :sec :ing :pvc :hpa :netpol :ev :ctx :pulse :xray :popeye', 'info');
      return;
    }
    if (cmd !== ':') {
      addToast(`Unknown command: ${cmd} (type :alias for list)`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setCommandMode(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelSuggestion((s) => Math.min(suggestions.length - 1, s + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelSuggestion((s) => Math.max(0, s - 1));
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions[selSuggestion]) {
        setCommandInput(suggestions[selSuggestion]);
      }
      return;
    }
    if (e.key === 'Enter') {
      // if there's a suggestion and user typed partial, use it
      if (suggestions[selSuggestion] && !VIEW_COMMANDS[commandInput.trim().toLowerCase()]) {
        runCommand(suggestions[selSuggestion]);
      } else {
        runCommand(commandInput);
      }
      setCommandMode(false);
    }
  };

  if (!commandMode) return null;

  return (
    <div className={styles.commandbar}>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>›</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          placeholder=":pods, :svc, :pulse, :ns production..."
        />
      </div>
      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`${styles.suggestion} ${i === selSuggestion ? styles.selected : ''}`}
              onMouseDown={(e) => { e.preventDefault(); runCommand(s); setCommandMode(false); }}
            >
              <span className={styles.sugCmd}>{s}</span>
              <span className={styles.sugView}>→ {VIEW_COMMANDS[s]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
