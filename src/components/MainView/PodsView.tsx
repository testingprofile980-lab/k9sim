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
    ErrImagePull: 'status-imagepull',
    Terminating: 'status-terminating',
    Unknown: 'status-unknown',
    Completed: 'status-completed',
    Succeeded: 'status-completed',
    Failed: 'status-error',
    ContainerCreating: 'status-pending',
    Init: 'status-pending',
  };
  return map[status] || '';
}

const columns: Column<Pod>[] = [
  {
    key: 'name',
    header: 'NAME',
    width: '24%',
    render: (p) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{p.name}</span>,
  },
  { key: 'ready', header: 'READY', width: '6%', render: (p) => p.ready },
  {
    key: 'status',
    header: 'STATUS',
    width: '12%',
    render: (p) => <span className={statusClass(p.status)}>{p.status}</span>,
  },
  {
    key: 'restarts',
    header: 'RESTARTS',
    width: '7%',
    hideTablet: true,
    render: (p) => <span style={{ color: p.restarts > 5 ? 'var(--red)' : p.restarts > 0 ? 'var(--orange)' : 'var(--text)' }}>{p.restarts}</span>,
  },
  { key: 'cpu', header: 'CPU', width: '6%', render: (p) => p.cpu },
  { key: 'mem', header: 'MEM', width: '6%', render: (p) => p.mem },
  { key: 'ip', header: 'IP', width: '11%', hideTablet: true, render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.ip || '—'}</span> },
  {
    key: 'ns',
    header: 'NAMESPACE',
    width: '11%',
    hideTablet: true,
    render: (p) => <span style={{ color: 'var(--text-ns)' }}>{p.namespace}</span>,
  },
  { key: 'node', header: 'NODE', width: '12%', hideTablet: true, render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.nodeName || '—'}</span> },
  { key: 'age', header: 'AGE', width: '5%', render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.age}</span> },
];

export function PodsView() {
  const pods = useStore((s) => s.pods);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const fireValidation = useStore((s) => s.fireValidation);
  const sortKey = useStore((s) => s.sortKey);
  const sortDesc = useStore((s) => s.sortDesc);

  let filtered = pods
    .filter((p) => activeNamespace === 'all' || p.namespace === activeNamespace)
    .filter((p) => !filterStr || p.name.toLowerCase().includes(filterStr.toLowerCase()) || p.status.toLowerCase().includes(filterStr.toLowerCase()) || p.namespace.toLowerCase().includes(filterStr.toLowerCase()));

  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case 'name': av = a.name; bv = b.name; break;
        case 'status': av = a.status; bv = b.status; break;
        case 'age': av = a.ageSeconds; bv = b.ageSeconds; break;
        case 'restarts': av = a.restarts; bv = b.restarts; break;
        case 'cpu': av = parseInt(a.cpu) || 0; bv = parseInt(b.cpu) || 0; break;
        case 'mem': av = parseInt(a.mem) || 0; bv = parseInt(b.mem) || 0; break;
      }
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });
  }

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
