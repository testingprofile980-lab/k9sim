import { useStore } from '../../store';
import type { Deployment } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

const columns: Column<Deployment>[] = [
  { key: 'name', header: 'NAME', width: '25%', render: (d) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{d.name}</span> },
  {
    key: 'ready',
    header: 'READY',
    width: '10%',
    render: (d) => (
      <span style={{ color: d.readyReplicas < d.replicas ? 'var(--yellow)' : 'var(--green)' }}>
        {d.readyReplicas}/{d.replicas}
      </span>
    ),
  },
  { key: 'up-to-date', header: 'UP-TO-DATE', width: '10%', hideTablet: true, render: (d) => d.updatedReplicas },
  { key: 'available', header: 'AVAILABLE', width: '10%', hideTablet: true, render: (d) => d.readyReplicas },
  { key: 'image', header: 'IMAGE', width: '22%', render: (d) => <span style={{ color: 'var(--text-muted)' }}>{d.image}</span> },
  { key: 'ns', header: 'NAMESPACE', width: '15%', hideTablet: true, render: (d) => <span style={{ color: 'var(--text-ns)' }}>{d.namespace}</span> },
  { key: 'age', header: 'AGE', width: '8%', render: (d) => <span style={{ color: 'var(--text-muted)' }}>{d.age}</span> },
];

export function DeploymentsView() {
  const deployments = useStore((s) => s.deployments);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const filtered = deployments
    .filter((d) => activeNamespace === 'all' || d.namespace === activeNamespace)
    .filter((d) => !filterStr || d.name.includes(filterStr) || d.namespace.includes(filterStr));

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onActivate={() => setActivePanel('describe')}
      rowKey={(d) => d.id}
    />
  );
}
