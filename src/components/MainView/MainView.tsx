import { useStore } from '../../store';
import { PodsView } from './PodsView';
import { DeploymentsView } from './DeploymentsView';
import { ServicesView } from './ServicesView';
import { NodesView } from './NodesView';
import { NamespacesView } from './NamespacesView';
import { ConfigMapsView } from './ConfigMapsView';
import {
  SecretsView, StatefulSetsView, DaemonSetsView, JobsView, CronJobsView,
  IngressView, PVView, PVCView, ReplicaSetsView, HPAView, ServiceAccountsView,
  NetworkPoliciesView, PDBView, RoleBindingsView, ClusterRolesView,
  ClusterRoleBindingsView, HelmView, ContextsView, EventsView,
} from './SimpleViews';
import { PulseView } from './PulseView';
import { XRayView } from './XRayView';
import { PopeyeView } from './PopeyeView';
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
      {activeView === 'configmaps' && <ConfigMapsView />}
      {activeView === 'secrets' && <SecretsView />}
      {activeView === 'statefulsets' && <StatefulSetsView />}
      {activeView === 'daemonsets' && <DaemonSetsView />}
      {activeView === 'jobs' && <JobsView />}
      {activeView === 'cronjobs' && <CronJobsView />}
      {activeView === 'ingress' && <IngressView />}
      {activeView === 'pv' && <PVView />}
      {activeView === 'pvc' && <PVCView />}
      {activeView === 'replicasets' && <ReplicaSetsView />}
      {activeView === 'hpa' && <HPAView />}
      {activeView === 'serviceaccounts' && <ServiceAccountsView />}
      {activeView === 'networkpolicies' && <NetworkPoliciesView />}
      {activeView === 'pdb' && <PDBView />}
      {activeView === 'rolebindings' && <RoleBindingsView />}
      {activeView === 'clusterroles' && <ClusterRolesView />}
      {activeView === 'clusterrolebindings' && <ClusterRoleBindingsView />}
      {activeView === 'events' && <EventsView />}
      {activeView === 'helm' && <HelmView />}
      {activeView === 'contexts' && <ContextsView />}
      {activeView === 'pulse' && <PulseView />}
      {activeView === 'xray' && <XRayView />}
      {activeView === 'popeye' && <PopeyeView />}
    </div>
  );
}
