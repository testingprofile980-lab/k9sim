import { useStore } from '../../store';
import type { ConfigMap } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

const columns: Column<ConfigMap>[] = [
  { key: 'name', header: 'NAME', width: '32%', render: (c) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{c.name}</span> },
  { key: 'data', header: 'DATA', width: '10%', render: (c) => c.dataKeys.length },
  { key: 'keys', header: 'KEYS', width: '38%', hideTablet: true, render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.dataKeys.join(', ')}</span> },
  { key: 'ns', header: 'NAMESPACE', width: '12%', render: (c) => <span style={{ color: 'var(--text-ns)' }}>{c.namespace}</span> },
  { key: 'age', header: 'AGE', width: '8%', render: (c) => <span style={{ color: 'var(--text-muted)' }}>{c.age}</span> },
];

export function ConfigMapsView() {
  const items = useStore((s) => s.configmaps);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const filtered = items
    .filter((c) => activeNamespace === 'all' || c.namespace === activeNamespace)
    .filter((c) => !filterStr || c.name.toLowerCase().includes(filterStr.toLowerCase()));

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onActivate={() => setActivePanel('describe')}
      rowKey={(c) => c.id}
    />
  );
}
