import { useStore } from '../../store';
import { PodsView } from './PodsView';
import { DeploymentsView } from './DeploymentsView';
import { ServicesView } from './ServicesView';
import { NodesView } from './NodesView';
import { NamespacesView } from './NamespacesView';
import styles from './MainView.module.css';

export function MainView() {
  const activeView = useStore((s) => s.activeView);

  return (
    <div className={styles.mainview}>
      {activeView === 'pods' && <PodsView />}
      {activeView === 'deployments' && <DeploymentsView />}
      {activeView === 'services' && <ServicesView />}
      {activeView === 'nodes' && <NodesView />}
      {activeView === 'namespaces' && <NamespacesView />}
    </div>
  );
}
