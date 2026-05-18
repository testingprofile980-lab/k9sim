import { useStore } from '../../store';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';
import type {
  Secret, StatefulSet, DaemonSet, Job, CronJob, Ingress,
  PersistentVolume, PersistentVolumeClaim, ReplicaSet, HPA,
  ServiceAccount, NetworkPolicy, PodDisruptionBudget, RoleBinding,
  ClusterRole, ClusterRoleBinding, HelmRelease, Context, K8sEvent,
} from '../../types';

function useNsFilter<T extends { namespace?: string; name: string }>(items: T[]): T[] {
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  return items
    .filter((c) => !c.namespace || activeNamespace === 'all' || c.namespace === activeNamespace)
    .filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));
}

function useSelectionHandlers() {
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  return { selectedIndex, setSelectedIndex, onActivate: () => setActivePanel('describe') };
}

// SECRETS
export function SecretsView() {
  const items = useStore((s) => s.secrets);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<Secret>[] = [
    { key: 'name', header: 'NAME', width: '32%', render: (s) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{s.name}</span> },
    { key: 'type', header: 'TYPE', width: '24%', render: (s) => s.type },
    { key: 'data', header: 'DATA', width: '8%', render: (s) => s.dataKeys.length },
    { key: 'ns', header: 'NAMESPACE', width: '20%', hideTablet: true, render: (s) => <span style={{ color: 'var(--text-ns)' }}>{s.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (s) => <span style={{ color: 'var(--text-muted)' }}>{s.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// STATEFULSETS
export function StatefulSetsView() {
  const items = useStore((s) => s.statefulsets);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<StatefulSet>[] = [
    { key: 'name', header: 'NAME', width: '24%', render: (s) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{s.name}</span> },
    { key: 'ready', header: 'READY', width: '10%', render: (s) => <span style={{ color: s.readyReplicas < s.replicas ? 'var(--yellow)' : 'var(--green)' }}>{s.readyReplicas}/{s.replicas}</span> },
    { key: 'image', header: 'IMAGE', width: '28%', hideTablet: true, render: (s) => <span style={{ color: 'var(--text-muted)' }}>{s.image}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '15%', render: (s) => <span style={{ color: 'var(--text-ns)' }}>{s.namespace}</span> },
    { key: 'svc', header: 'SERVICE', width: '15%', hideTablet: true, render: (s) => s.serviceName },
    { key: 'age', header: 'AGE', width: '8%', render: (s) => <span style={{ color: 'var(--text-muted)' }}>{s.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// DAEMONSETS
export function DaemonSetsView() {
  const items = useStore((s) => s.daemonsets);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<DaemonSet>[] = [
    { key: 'name', header: 'NAME', width: '22%', render: (d) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{d.name}</span> },
    { key: 'desired', header: 'DESIRED', width: '8%', render: (d) => d.desired },
    { key: 'current', header: 'CURRENT', width: '8%', hideTablet: true, render: (d) => d.current },
    { key: 'ready', header: 'READY', width: '8%', render: (d) => <span style={{ color: d.ready < d.desired ? 'var(--yellow)' : 'var(--green)' }}>{d.ready}</span> },
    { key: 'utd', header: 'UP-TO-DATE', width: '10%', hideTablet: true, render: (d) => d.upToDate },
    { key: 'avail', header: 'AVAILABLE', width: '10%', hideTablet: true, render: (d) => d.available },
    { key: 'ns', header: 'NAMESPACE', width: '16%', render: (d) => <span style={{ color: 'var(--text-ns)' }}>{d.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (d) => <span style={{ color: 'var(--text-muted)' }}>{d.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// JOBS
export function JobsView() {
  const items = useStore((s) => s.jobs);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<Job>[] = [
    { key: 'name', header: 'NAME', width: '30%', render: (j) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{j.name}</span> },
    { key: 'comp', header: 'COMPLETIONS', width: '14%', render: (j) => j.completions },
    { key: 'dur', header: 'DURATION', width: '12%', hideTablet: true, render: (j) => j.duration },
    { key: 'status', header: 'STATUS', width: '12%', render: (j) => <span style={{ color: j.status === 'Complete' ? 'var(--green)' : j.status === 'Failed' ? 'var(--red)' : 'var(--yellow)' }}>{j.status}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '16%', hideTablet: true, render: (j) => <span style={{ color: 'var(--text-ns)' }}>{j.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (j) => <span style={{ color: 'var(--text-muted)' }}>{j.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// CRONJOBS
export function CronJobsView() {
  const items = useStore((s) => s.cronjobs);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<CronJob>[] = [
    { key: 'name', header: 'NAME', width: '22%', render: (c) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{c.name}</span> },
    { key: 'sched', header: 'SCHEDULE', width: '14%', render: (c) => <span style={{ color: 'var(--accent)' }}>{c.schedule}</span> },
    { key: 'sus', header: 'SUSPEND', width: '10%', render: (c) => <span style={{ color: c.suspend ? 'var(--yellow)' : 'var(--green)' }}>{c.suspend ? 'true' : 'false'}</span> },
    { key: 'active', header: 'ACTIVE', width: '8%', hideTablet: true, render: (c) => c.active },
    { key: 'last', header: 'LAST SCHEDULE', width: '14%', hideTablet: true, render: (c) => c.lastSchedule },
    { key: 'ns', header: 'NAMESPACE', width: '16%', render: (c) => <span style={{ color: 'var(--text-ns)' }}>{c.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// INGRESS
export function IngressView() {
  const items = useStore((s) => s.ingress);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<Ingress>[] = [
    { key: 'name', header: 'NAME', width: '22%', render: (i) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{i.name}</span> },
    { key: 'class', header: 'CLASS', width: '8%', render: (i) => i.className || '<none>' },
    { key: 'hosts', header: 'HOSTS', width: '24%', render: (i) => <span style={{ color: 'var(--accent)' }}>{i.hosts.join(', ')}</span> },
    { key: 'addr', header: 'ADDRESS', width: '14%', hideTablet: true, render: (i) => i.address },
    { key: 'ports', header: 'PORTS', width: '8%', render: (i) => i.ports },
    { key: 'ns', header: 'NAMESPACE', width: '16%', hideTablet: true, render: (i) => <span style={{ color: 'var(--text-ns)' }}>{i.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (i) => <span style={{ color: 'var(--text-muted)' }}>{i.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// PV
export function PVView() {
  const items = useStore((s) => s.pvs);
  const filterStr = useStore((s) => s.filterStr);
  const rows = items.filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<PersistentVolume>[] = [
    { key: 'name', header: 'NAME', width: '22%', render: (p) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{p.name}</span> },
    { key: 'cap', header: 'CAPACITY', width: '10%', render: (p) => p.capacity },
    { key: 'am', header: 'ACCESS', width: '8%', render: (p) => p.accessModes },
    { key: 'rp', header: 'RECLAIM', width: '10%', hideTablet: true, render: (p) => p.reclaimPolicy },
    { key: 'status', header: 'STATUS', width: '12%', render: (p) => <span style={{ color: p.status === 'Bound' ? 'var(--green)' : p.status === 'Released' ? 'var(--orange)' : 'var(--yellow)' }}>{p.status}</span> },
    { key: 'claim', header: 'CLAIM', width: '20%', hideTablet: true, render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.claim || '—'}</span> },
    { key: 'sc', header: 'STORAGECLASS', width: '10%', hideTablet: true, render: (p) => p.storageClass },
    { key: 'age', header: 'AGE', width: '8%', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// PVC
export function PVCView() {
  const items = useStore((s) => s.pvcs);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<PersistentVolumeClaim>[] = [
    { key: 'name', header: 'NAME', width: '24%', render: (p) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{p.name}</span> },
    { key: 'status', header: 'STATUS', width: '10%', render: (p) => <span style={{ color: p.status === 'Bound' ? 'var(--green)' : p.status === 'Pending' ? 'var(--yellow)' : 'var(--red)' }}>{p.status}</span> },
    { key: 'vol', header: 'VOLUME', width: '20%', hideTablet: true, render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.volume || '—'}</span> },
    { key: 'cap', header: 'CAPACITY', width: '10%', render: (p) => p.capacity },
    { key: 'am', header: 'ACCESS', width: '8%', hideTablet: true, render: (p) => p.accessModes },
    { key: 'sc', header: 'STORAGECLASS', width: '12%', hideTablet: true, render: (p) => p.storageClass },
    { key: 'ns', header: 'NAMESPACE', width: '14%', render: (p) => <span style={{ color: 'var(--text-ns)' }}>{p.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// REPLICASETS
export function ReplicaSetsView() {
  const items = useStore((s) => s.replicasets);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<ReplicaSet>[] = [
    { key: 'name', header: 'NAME', width: '26%', render: (r) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{r.name}</span> },
    { key: 'des', header: 'DESIRED', width: '10%', render: (r) => r.desired },
    { key: 'cur', header: 'CURRENT', width: '10%', hideTablet: true, render: (r) => r.current },
    { key: 'rdy', header: 'READY', width: '8%', render: (r) => <span style={{ color: r.ready < r.desired ? 'var(--yellow)' : 'var(--green)' }}>{r.ready}</span> },
    { key: 'img', header: 'IMAGE', width: '22%', hideTablet: true, render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.image}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '16%', render: (r) => <span style={{ color: 'var(--text-ns)' }}>{r.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// HPA
export function HPAView() {
  const items = useStore((s) => s.hpas);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<HPA>[] = [
    { key: 'name', header: 'NAME', width: '22%', render: (h) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{h.name}</span> },
    { key: 'ref', header: 'REFERENCE', width: '20%', render: (h) => <span style={{ color: 'var(--accent)' }}>{h.reference}</span> },
    { key: 'tgt', header: 'TARGETS', width: '20%', render: (h) => <span style={{ color: 'var(--text-muted)' }}>{h.targets}</span> },
    { key: 'min', header: 'MINPODS', width: '8%', hideTablet: true, render: (h) => h.minPods },
    { key: 'max', header: 'MAXPODS', width: '8%', hideTablet: true, render: (h) => h.maxPods },
    { key: 'rep', header: 'REPLICAS', width: '8%', render: (h) => h.replicas },
    { key: 'ns', header: 'NAMESPACE', width: '10%', hideTablet: true, render: (h) => <span style={{ color: 'var(--text-ns)' }}>{h.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (h) => <span style={{ color: 'var(--text-muted)' }}>{h.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// SERVICE ACCOUNTS
export function ServiceAccountsView() {
  const items = useStore((s) => s.serviceaccounts);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<ServiceAccount>[] = [
    { key: 'name', header: 'NAME', width: '36%', render: (s) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{s.name}</span> },
    { key: 'sec', header: 'SECRETS', width: '14%', render: (s) => s.secrets },
    { key: 'ns', header: 'NAMESPACE', width: '34%', render: (s) => <span style={{ color: 'var(--text-ns)' }}>{s.namespace}</span> },
    { key: 'age', header: 'AGE', width: '16%', render: (s) => <span style={{ color: 'var(--text-muted)' }}>{s.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// NETWORK POLICIES
export function NetworkPoliciesView() {
  const items = useStore((s) => s.networkpolicies);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<NetworkPolicy>[] = [
    { key: 'name', header: 'NAME', width: '26%', render: (n) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{n.name}</span> },
    { key: 'sel', header: 'POD-SELECTOR', width: '26%', render: (n) => <span style={{ color: 'var(--text-muted)' }}>{n.podSelector}</span> },
    { key: 'types', header: 'POLICY-TYPES', width: '22%', render: (n) => n.policyTypes },
    { key: 'ns', header: 'NAMESPACE', width: '18%', render: (n) => <span style={{ color: 'var(--text-ns)' }}>{n.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (n) => <span style={{ color: 'var(--text-muted)' }}>{n.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// PDB
export function PDBView() {
  const items = useStore((s) => s.pdbs);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<PodDisruptionBudget>[] = [
    { key: 'name', header: 'NAME', width: '28%', render: (p) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{p.name}</span> },
    { key: 'min', header: 'MIN AVAILABLE', width: '14%', render: (p) => p.minAvailable || '—' },
    { key: 'max', header: 'MAX UNAVAILABLE', width: '16%', render: (p) => p.maxUnavailable || '—' },
    { key: 'allow', header: 'ALLOWED DISRUPTIONS', width: '18%', hideTablet: true, render: (p) => <span style={{ color: p.allowedDisruptions === 0 ? 'var(--yellow)' : 'var(--green)' }}>{p.allowedDisruptions}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '14%', render: (p) => <span style={{ color: 'var(--text-ns)' }}>{p.namespace}</span> },
    { key: 'age', header: 'AGE', width: '10%', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// ROLE BINDINGS
export function RoleBindingsView() {
  const items = useStore((s) => s.rolebindings);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<RoleBinding>[] = [
    { key: 'name', header: 'NAME', width: '28%', render: (r) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{r.name}</span> },
    { key: 'role', header: 'ROLE', width: '26%', render: (r) => <span style={{ color: 'var(--accent)' }}>{r.role}</span> },
    { key: 'subj', header: 'SUBJECTS', width: '22%', render: (r) => r.subjects },
    { key: 'ns', header: 'NAMESPACE', width: '16%', render: (r) => <span style={{ color: 'var(--text-ns)' }}>{r.namespace}</span> },
    { key: 'age', header: 'AGE', width: '8%', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// CLUSTER ROLES
export function ClusterRolesView() {
  const items = useStore((s) => s.clusterroles);
  const filterStr = useStore((s) => s.filterStr);
  const rows = items.filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<ClusterRole>[] = [
    { key: 'name', header: 'NAME', width: '70%', render: (c) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{c.name}</span> },
    { key: 'age', header: 'AGE', width: '30%', render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// CLUSTER ROLE BINDINGS
export function ClusterRoleBindingsView() {
  const items = useStore((s) => s.clusterrolebindings);
  const filterStr = useStore((s) => s.filterStr);
  const rows = items.filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<ClusterRoleBinding>[] = [
    { key: 'name', header: 'NAME', width: '30%', render: (c) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{c.name}</span> },
    { key: 'role', header: 'ROLE', width: '32%', render: (c) => <span style={{ color: 'var(--accent)' }}>{c.role}</span> },
    { key: 'subj', header: 'SUBJECTS', width: '30%', render: (c) => c.subjects },
    { key: 'age', header: 'AGE', width: '8%', render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.age}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// HELM
export function HelmView() {
  const items = useStore((s) => s.helmReleases);
  const rows = useNsFilter(items);
  const { selectedIndex, setSelectedIndex, onActivate } = useSelectionHandlers();
  const cols: Column<HelmRelease>[] = [
    { key: 'name', header: 'NAME', width: '20%', render: (h) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{h.name}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '14%', render: (h) => <span style={{ color: 'var(--text-ns)' }}>{h.namespace}</span> },
    { key: 'rev', header: 'REVISION', width: '10%', render: (h) => h.revision },
    { key: 'status', header: 'STATUS', width: '12%', render: (h) => <span style={{ color: h.status === 'deployed' ? 'var(--green)' : h.status === 'failed' ? 'var(--red)' : 'var(--yellow)' }}>{h.status}</span> },
    { key: 'chart', header: 'CHART', width: '22%', render: (h) => <span style={{ color: 'var(--accent)' }}>{h.chart}</span> },
    { key: 'appv', header: 'APP VERSION', width: '12%', hideTablet: true, render: (h) => h.appVersion },
    { key: 'upd', header: 'UPDATED', width: '10%', hideTablet: true, render: (h) => <span style={{ color: 'var(--text-muted)' }}>{h.updated}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={onActivate} rowKey={(r) => r.id} />;
}

// CONTEXTS
export function ContextsView() {
  const items = useStore((s) => s.contexts);
  const filterStr = useStore((s) => s.filterStr);
  const setContext = useStore((s) => s.setContext);
  const rows = items.filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const cols: Column<Context>[] = [
    { key: 'cur', header: '', width: '4%', render: (c) => c.current ? <span style={{ color: 'var(--green)' }}>*</span> : ' ' },
    { key: 'name', header: 'CONTEXT', width: '28%', render: (c) => <span style={{ color: c.current ? 'var(--accent)' : 'var(--text-bright)', fontWeight: 'bold' }}>{c.name}</span> },
    { key: 'cluster', header: 'CLUSTER', width: '22%', render: (c) => c.cluster },
    { key: 'user', header: 'AUTH', width: '24%', hideTablet: true, render: (c) => c.user },
    { key: 'ns', header: 'NAMESPACE', width: '22%', render: (c) => <span style={{ color: 'var(--text-ns)' }}>{c.namespace}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onActivate={(idx) => setContext(rows[idx].id)} rowKey={(r) => r.id} />;
}

// EVENTS (cluster-wide)
export function EventsView() {
  const items = useStore((s) => s.clusterEvents);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const rows = items
    .filter((e) => activeNamespace === 'all' || e.namespace === activeNamespace)
    .filter((e) => !filterStr || e.message.toLowerCase().includes(filterStr.toLowerCase()) || e.reason.toLowerCase().includes(filterStr.toLowerCase()));
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const cols: Column<K8sEvent>[] = [
    { key: 'type', header: 'TYPE', width: '8%', render: (e) => <span style={{ color: e.type === 'Warning' ? 'var(--yellow)' : 'var(--green)' }}>{e.type}</span> },
    { key: 'reason', header: 'REASON', width: '14%', render: (e) => <span style={{ color: 'var(--accent)' }}>{e.reason}</span> },
    { key: 'kind', header: 'KIND', width: '8%', hideTablet: true, render: (e) => e.kind || 'Pod' },
    { key: 'obj', header: 'OBJECT', width: '20%', render: (e) => <span style={{ color: 'var(--text-bright)' }}>{e.involvedObject}</span> },
    { key: 'msg', header: 'MESSAGE', width: '36%', render: (e) => <span style={{ color: 'var(--text-muted)' }}>{e.message}</span> },
    { key: 'ns', header: 'NAMESPACE', width: '10%', hideTablet: true, render: (e) => <span style={{ color: 'var(--text-ns)' }}>{e.namespace}</span> },
    { key: 'last', header: 'LAST SEEN', width: '8%', render: (e) => <span style={{ color: 'var(--text-muted)' }}>{e.lastTime}</span> },
  ];
  return <ResourceTable columns={cols} rows={rows} selectedIndex={selectedIndex} onSelect={setSelectedIndex} rowKey={(r) => r.id} />;
}
