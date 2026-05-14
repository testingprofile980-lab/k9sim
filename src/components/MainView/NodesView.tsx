import { useStore } from '../../store';
import type { Node } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

const columns: Column<Node>[] = [
  { key: 'name', header: 'NAME', width: '25%', render: (n) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{n.name}</span> },
  {
    key: 'status',
    header: 'STATUS',
    width: '12%',
    render: (n) => (
      <span style={{ color: n.status === 'Ready' ? 'var(--green)' : 'var(--red)' }}>{n.status}</span>
    ),
  },
  { key: 'roles', header: 'ROLES', width: '14%', render: (n) => n.roles },
  { key: 'version', header: 'VERSION', width: '12%', hideTablet: true, render: (n) => n.version },
  {
    key: 'cpu',
    header: 'CPU',
    width: '12%',
    render: (n) => (
      <span>
        {n.cpuUsage} <span style={{ color: 'var(--text-muted)' }}>/ {n.cpuCapacity}</span>
      </span>
    ),
  },
  {
    key: 'mem',
    header: 'MEM',
    width: '15%',
    render: (n) => (
      <span>
        {n.memUsage} <span style={{ color: 'var(--text-muted)' }}>/ {n.memCapacity}</span>
      </span>
    ),
  },
  { key: 'age', header: 'AGE', width: '8%', render: (n) => <span style={{ color: 'var(--text-muted)' }}>{n.age}</span> },
];

export function NodesView() {
  const nodes = useStore((s) => s.nodes);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const filtered = nodes.filter((n) => !filterStr || n.name.includes(filterStr) || n.status.toLowerCase().includes(filterStr.toLowerCase()));

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onActivate={() => setActivePanel('describe')}
      rowKey={(n) => n.id}
    />
  );
}
