import { useStore } from '../../store';
import type { Pod } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

function statusClass(status: string) {
  const map: Record<string, string> = {
    Running: 'status-running',
    Pending: 'status-pending',
    Error: 'status-error',
    CrashLoopBackOff: 'status-crash',
    OOMKilled: 'status-oomkilled',
    Evicted: 'status-evicted',
    ImagePullBackOff: 'status-imagepull',
    Terminating: 'status-terminating',
    Unknown: 'status-unknown',
    Completed: 'status-completed',
  };
  return map[status] || '';
}

const columns: Column<Pod>[] = [
  {
    key: 'name',
    header: 'NAME',
    width: '32%',
    render: (p) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{p.name}</span>,
  },
  { key: 'ready', header: 'READY', width: '6%', render: (p) => p.ready },
  {
    key: 'status',
    header: 'STATUS',
    width: '14%',
    render: (p) => <span className={statusClass(p.status)}>{p.status}</span>,
  },
  {
    key: 'restarts',
    header: 'RESTARTS',
    width: '8%',
    hideTablet: true,
    render: (p) => <span style={{ color: p.restarts > 0 ? 'var(--orange)' : 'var(--text)' }}>{p.restarts}</span>,
  },
  { key: 'cpu', header: 'CPU', width: '7%', render: (p) => p.cpu },
  { key: 'mem', header: 'MEM', width: '7%', render: (p) => p.mem },
  {
    key: 'ns',
    header: 'NAMESPACE',
    width: '14%',
    hideTablet: true,
    render: (p) => <span style={{ color: 'var(--text-ns)' }}>{p.namespace}</span>,
  },
  { key: 'node', header: 'NODE', width: '18%', hideTablet: true, render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.nodeName || '—'}</span> },
  { key: 'age', header: 'AGE', width: '7%', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.age}</span> },
];

export function PodsView() {
  const pods = useStore((s) => s.pods);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const fireValidation = useStore((s) => s.fireValidation);

  const filtered = pods
    .filter((p) => activeNamespace === 'all' || p.namespace === activeNamespace)
    .filter((p) => !filterStr || p.name.toLowerCase().includes(filterStr.toLowerCase()) || p.status.toLowerCase().includes(filterStr.toLowerCase()) || p.namespace.toLowerCase().includes(filterStr.toLowerCase()));

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    const pod = filtered[idx];
    if (pod) fireValidation('pod-selected', pod.status);
  };

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
      onActivate={() => setActivePanel('describe')}
      rowKey={(p) => p.id}
    />
  );
}
