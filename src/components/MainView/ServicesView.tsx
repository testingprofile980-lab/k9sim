import { useStore } from '../../store';
import type { Service } from '../../types';
import { ResourceTable, type Column } from '../ResourceTable/ResourceTable';

function typeColor(t: string) {
  if (t === 'LoadBalancer') return 'var(--accent)';
  if (t === 'NodePort') return 'var(--yellow)';
  return 'var(--text)';
}

const columns: Column<Service>[] = [
  { key: 'name', header: 'NAME', width: '22%', render: (s) => <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>{s.name}</span> },
  { key: 'type', header: 'TYPE', width: '13%', render: (s) => <span style={{ color: typeColor(s.type) }}>{s.type}</span> },
  { key: 'clusterIP', header: 'CLUSTER-IP', width: '14%', hideTablet: true, render: (s) => s.clusterIP },
  {
    key: 'ports',
    header: 'PORT(S)',
    width: '15%',
    render: (s) => s.ports.map((p) => `${p.port}${p.nodePort ? ':' + p.nodePort : ''}/${p.protocol}`).join(', '),
  },
  { key: 'ns', header: 'NAMESPACE', width: '16%', hideTablet: true, render: (s) => <span style={{ color: 'var(--text-ns)' }}>{s.namespace}</span> },
  {
    key: 'selector',
    header: 'SELECTOR',
    width: '15%',
    hideTablet: true,
    render: (s) => {
      const entries = Object.entries(s.selector);
      if (!entries.length) return <span style={{ color: 'var(--text-muted)' }}>none</span>;
      return <span style={{ color: 'var(--text-muted)' }}>{entries.map(([k, v]) => `${k}=${v}`).join(',')}</span>;
    },
  },
  { key: 'age', header: 'AGE', width: '8%', render: (s) => <span style={{ color: 'var(--text-muted)' }}>{s.age}</span> },
];

export function ServicesView() {
  const services = useStore((s) => s.services);
  const activeNamespace = useStore((s) => s.activeNamespace);
  const filterStr = useStore((s) => s.filterStr);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setSelectedIndex = useStore((s) => s.setSelectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const filtered = services
    .filter((s) => activeNamespace === 'all' || s.namespace === activeNamespace)
    .filter((s) => !filterStr || s.name.includes(filterStr) || s.namespace.includes(filterStr));

  return (
    <ResourceTable
      columns={columns}
      rows={filtered}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onActivate={() => setActivePanel('describe')}
      rowKey={(s) => s.id}
    />
  );
}
