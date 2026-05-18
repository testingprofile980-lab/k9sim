import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import type { ViewType } from '../types';

const NAMESPACE_NUMERIC: Record<string, string> = {
  '0': 'all',
  '1': 'default',
  '2': 'kube-system',
  '3': 'production',
  '4': 'monitoring',
  '5': 'staging',
};

export function useKeyboard() {
  const handleKey = useCallback((e: KeyboardEvent) => {
    const s = useStore.getState();

    // If any modal is open, only handle Escape
    if (s.activeModal) {
      if (e.key === 'Escape') {
        s.setActiveModal(null);
        e.preventDefault();
      }
      return;
    }

    // Command mode handled in CommandBar
    if (s.commandMode) return;

    // Filter mode handled in FilterBar
    if (s.filterMode) return;

    // Panel open
    if (s.activePanel) {
      if (e.key === 'Escape') {
        s.setActivePanel(null);
        e.preventDefault();
      }
      return;
    }

    // Don't capture if typing in an input
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const rows = getRows(s);

    // Ctrl/Cmd combinations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a': {
          // mark all
          e.preventDefault();
          rows.forEach((r) => s.toggleMark((r as { id: string }).id));
          break;
        }
        case 'd': {
          // delete (alias for x)
          e.preventDefault();
          if (s.activeView === 'pods') {
            const pod = getSelectedPod(s);
            if (pod && confirm(`Delete pod "${pod.name}"?`)) s.deletePod(pod.id);
          }
          break;
        }
        case 'r': {
          // refresh — bump metricsVersion to force re-render
          e.preventDefault();
          s.tickMetrics();
          s.addToast('Refreshed', 'info');
          break;
        }
        case 'l': {
          // clear marks
          e.preventDefault();
          s.clearMarks();
          break;
        }
      }
      return;
    }

    // Direct mappings
    switch (e.key) {
      case '?': {
        e.preventDefault();
        s.setActiveModal(s.activeModal === 'help' ? null : 'help');
        break;
      }
      case ':': {
        e.preventDefault();
        s.setCommandMode(true);
        break;
      }
      case '/': {
        e.preventDefault();
        s.setFilterMode(true);
        break;
      }
      case 'g': {
        e.preventDefault();
        // gg → top
        s.setSelectedIndex(0);
        break;
      }
      case 'G': {
        e.preventDefault();
        s.setSelectedIndex(Math.max(0, rows.length - 1));
        break;
      }
      case 'PageUp': {
        e.preventDefault();
        s.setSelectedIndex(Math.max(0, s.selectedIndex - 10));
        break;
      }
      case 'PageDown': {
        e.preventDefault();
        s.setSelectedIndex(Math.min(rows.length - 1, s.selectedIndex + 10));
        break;
      }
      case 'Home': {
        e.preventDefault();
        s.setSelectedIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        s.setSelectedIndex(Math.max(0, rows.length - 1));
        break;
      }
      case 'ArrowUp':
      case 'k': {
        e.preventDefault();
        s.setSelectedIndex(Math.max(0, s.selectedIndex - 1));
        break;
      }
      case 'ArrowDown':
      case 'j': {
        e.preventDefault();
        s.setSelectedIndex(Math.min(rows.length - 1, s.selectedIndex + 1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        // for namespaces view, set ns; for contexts, switch
        if (s.activeView === 'namespaces') {
          const ns = (rows[s.selectedIndex] as { name: string } | undefined);
          if (ns) {
            s.setActiveNamespace(ns.name);
            s.addToast(`Namespace: ${ns.name}`, 'success');
            s.setView('pods');
          }
        } else if (s.activeView === 'contexts') {
          const ctx = rows[s.selectedIndex] as { id: string } | undefined;
          if (ctx) s.setContext(ctx.id);
        } else {
          s.setActivePanel('describe');
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        s.setFilterStr('');
        s.setFilterMode(false);
        break;
      }
      case ' ': {
        // mark/unmark row
        e.preventDefault();
        const row = rows[s.selectedIndex] as { id: string } | undefined;
        if (row) s.toggleMark(row.id);
        break;
      }
      case 'l': {
        if (s.activeView === 'pods') {
          e.preventDefault();
          s.setActivePanel('logs');
        }
        break;
      }
      case 'd': {
        e.preventDefault();
        s.setActivePanel('describe');
        break;
      }
      case 'y': {
        e.preventDefault();
        s.setActivePanel('yaml');
        break;
      }
      case 'e': {
        e.preventDefault();
        s.setActivePanel('editor');
        break;
      }
      case 'x':
      case 'Delete': {
        e.preventDefault();
        if (s.activeView === 'pods') {
          const pod = getSelectedPod(s);
          if (pod && confirm(`Delete pod "${pod.name}"?`)) {
            s.deletePod(pod.id);
          }
        }
        break;
      }
      case 'r': {
        e.preventDefault();
        if (s.activeView === 'pods') {
          const pod = getSelectedPod(s);
          if (pod) s.restartPod(pod.id);
        } else if (s.activeView === 'deployments') {
          const d = rows[s.selectedIndex] as { id: string; name: string } | undefined;
          if (d) s.rolloutRestart(d.id);
        }
        break;
      }
      case 's': {
        e.preventDefault();
        if (s.activeView === 'deployments') {
          s.setActiveModal('scale');
        } else if (s.activeView === 'pods') {
          s.setActivePanel('exec');
        }
        break;
      }
      case 'n': {
        if (s.activeView === 'pods') {
          e.preventDefault();
          s.setActiveModal('podCreator');
        }
        break;
      }
      case 'f': {
        if (s.activeView === 'pods' && !e.shiftKey) {
          e.preventDefault();
          s.setActiveModal('failureInjector');
        } else if (e.shiftKey) {
          e.preventDefault();
          s.setActivePanel('portforward');
        }
        break;
      }
      case 'F': {
        e.preventDefault();
        s.setActivePanel('portforward');
        break;
      }
      case 'c': {
        if (s.activeView === 'nodes') {
          e.preventDefault();
          const node = rows[s.selectedIndex] as { id: string; status: string } | undefined;
          if (node) {
            if (node.status === 'SchedulingDisabled') s.uncordonNode(node.id);
            else s.cordonNode(node.id);
          }
        }
        break;
      }
      case '0': case '1': case '2': case '3': case '4': case '5': {
        e.preventDefault();
        const ns = NAMESPACE_NUMERIC[e.key];
        if (ns) {
          s.setActiveNamespace(ns);
          s.addToast(`Namespace: ${ns}`, 'info');
        }
        break;
      }
    }

    // Shift+letter for sort
    if (e.shiftKey && /^[A-Z]$/.test(e.key)) {
      const sortMap: Record<string, string> = {
        N: 'name', S: 'status', A: 'age', R: 'restarts', C: 'cpu', M: 'mem',
      };
      const key = sortMap[e.key];
      if (key) {
        e.preventDefault();
        s.setSort(key);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);
}

function getRows(s: ReturnType<typeof useStore.getState>) {
  const ns = s.activeNamespace;
  const matchesNs = <T extends { namespace?: string }>(items: T[]) =>
    items.filter((i) => !i.namespace || ns === 'all' || i.namespace === ns);
  switch (s.activeView) {
    case 'pods': return matchesNs(s.pods);
    case 'deployments': return matchesNs(s.deployments);
    case 'services': return matchesNs(s.services);
    case 'nodes': return s.nodes;
    case 'namespaces': return s.namespaces;
    case 'configmaps': return matchesNs(s.configmaps);
    case 'secrets': return matchesNs(s.secrets);
    case 'statefulsets': return matchesNs(s.statefulsets);
    case 'daemonsets': return matchesNs(s.daemonsets);
    case 'jobs': return matchesNs(s.jobs);
    case 'cronjobs': return matchesNs(s.cronjobs);
    case 'ingress': return matchesNs(s.ingress);
    case 'pv': return s.pvs;
    case 'pvc': return matchesNs(s.pvcs);
    case 'replicasets': return matchesNs(s.replicasets);
    case 'hpa': return matchesNs(s.hpas);
    case 'serviceaccounts': return matchesNs(s.serviceaccounts);
    case 'networkpolicies': return matchesNs(s.networkpolicies);
    case 'pdb': return matchesNs(s.pdbs);
    case 'rolebindings': return matchesNs(s.rolebindings);
    case 'clusterroles': return s.clusterroles;
    case 'clusterrolebindings': return s.clusterrolebindings;
    case 'events': return matchesNs(s.clusterEvents);
    case 'helm': return matchesNs(s.helmReleases);
    case 'contexts': return s.contexts;
    default: return [];
  }
}

function getSelectedPod(s: ReturnType<typeof useStore.getState>) {
  const rows = s.pods.filter((p) => s.activeNamespace === 'all' || p.namespace === s.activeNamespace);
  return rows[s.selectedIndex] || null;
}

// Avoid unused-import warning for ViewType
export type { ViewType };
