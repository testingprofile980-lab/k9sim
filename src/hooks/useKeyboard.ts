import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export function useKeyboard() {
  // Hook only sets up the event listener; all state is read from store.getState() in handler

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

    // Command mode
    if (s.commandMode) return;

    // Filter mode — arrow keys to navigate, escape handled in filter bar
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
      case 'ArrowUp': {
        e.preventDefault();
        s.setSelectedIndex(Math.max(0, s.selectedIndex - 1));
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        s.setSelectedIndex(Math.min(rows.length - 1, s.selectedIndex + 1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        s.setActivePanel('describe');
        break;
      }
      case 'Escape': {
        e.preventDefault();
        s.setFilterStr('');
        s.setFilterMode(false);
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
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);
}

function getRows(s: ReturnType<typeof useStore.getState>) {
  const ns = s.activeNamespace;
  switch (s.activeView) {
    case 'pods': return s.pods.filter((p) => ns === 'all' || p.namespace === ns);
    case 'deployments': return s.deployments.filter((d) => ns === 'all' || d.namespace === ns);
    case 'services': return s.services.filter((svc) => ns === 'all' || svc.namespace === ns);
    case 'nodes': return s.nodes;
    case 'namespaces': return s.namespaces;
    default: return [];
  }
}

function getSelectedPod(s: ReturnType<typeof useStore.getState>) {
  const rows = s.pods.filter((p) => s.activeNamespace === 'all' || p.namespace === s.activeNamespace);
  return rows[s.selectedIndex] || null;
}
